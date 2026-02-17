import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Routes pour la gestion des commandes cote admin.
 * Endpoints: GET /, GET /:id, PATCH /:id/status
 */

const router = Router();

const ordersCol = db.collection('orders');
const usersCol = db.collection('users');
const auditCol = db.collection('audit_logs');

/**
 * Statuts valides pour une commande et transitions autorisees.
 */
const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

/**
 * GET /api/admin/orders
 * Liste toutes les commandes avec pagination et filtres.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const { status, search, startDate, endDate } = req.query;

    let query: FirebaseFirestore.Query = ordersCol;

    if (status) {
      query = query.where('status', '==', status);
    }

    if (startDate) {
      query = query.where('createdAt', '>=', startDate as string);
    }

    if (endDate) {
      query = query.where('createdAt', '<=', endDate as string);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    let allDocs = snapshot.docs;

    // Client-side search filter
    if (search) {
      const q = (search as string).toLowerCase();
      allDocs = allDocs.filter((doc) => {
        const data = doc.data();
        return (
          (data.orderNumber && data.orderNumber.toLowerCase().includes(q)) ||
          doc.id.toLowerCase().includes(q) ||
          (data.customer?.name && data.customer.name.toLowerCase().includes(q)) ||
          (data.customer?.email && data.customer.email.toLowerCase().includes(q))
        );
      });
    }

    const total = allDocs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const paginatedDocs = allDocs.slice(offset, offset + limit);

    const orders = paginatedDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[Orders] Erreur lors de la recuperation des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des commandes',
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * Recupere le detail d'une commande avec les informations du client.
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await ordersCol.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvee',
      });
    }

    const orderData = doc.data()!;

    // Lookup customer info if customerId is present
    let customerDetail = orderData.customer || null;
    if (orderData.customerId) {
      const customerDoc = await usersCol.doc(orderData.customerId).get();
      if (customerDoc.exists) {
        customerDetail = {
          id: customerDoc.id,
          ...customerDoc.data(),
          // Ne pas exposer de donnees sensibles
          password: undefined,
        };
      }
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...orderData,
        customer: customerDetail,
      },
    });
  } catch (error) {
    console.error('[Orders] Erreur lors de la recuperation de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation de la commande',
    });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Met a jour le statut d'une commande avec validation des transitions autorisees.
 */
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Statuts valides: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const docRef = ordersCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvee',
      });
    }

    const orderData = doc.data()!;
    const previousStatus = orderData.status;

    // Valider la transition de statut
    const allowedNext = ALLOWED_TRANSITIONS[previousStatus] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Transition de statut non autorisee: ${previousStatus} -> ${status}. Transitions possibles: ${allowedNext.join(', ') || 'aucune'}`,
      });
    }

    const now = new Date().toISOString();

    // Construire l'entree d'historique
    const statusHistoryEntry = {
      from: previousStatus,
      to: status,
      note: note || null,
      changedBy: req.user?.email || 'unknown',
      changedAt: now,
    };

    const existingHistory = orderData.statusHistory || [];

    await docRef.update({
      status,
      updatedAt: now,
      statusHistory: [...existingHistory, statusHistoryEntry],
    });

    // Log audit
    await auditCol.add({
      action: 'update_status',
      resource: 'orders',
      resourceId: id,
      details: `Commande ${id}: ${previousStatus} -> ${status}${note ? ` (note: ${note})` : ''}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    const updatedDoc = await docRef.get();

    console.log(
      `[Orders] Commande ${id}: ${previousStatus} -> ${status}${note ? ` (note: ${note})` : ''}`
    );

    res.json({
      success: true,
      message: `Statut de la commande mis a jour: ${previousStatus} -> ${status}`,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error('[Orders] Erreur lors de la mise a jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du statut de la commande',
    });
  }
});

export default router;
