import { Router, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const usersCol = db.collection('users');
const ordersCol = db.collection('orders');
const auditCol = db.collection('audit_logs');

/**
 * GET /api/admin/customers
 * Liste tous les clients avec pagination et filtres.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      sort = 'createdAt',
      order = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    let query = usersCol.where(
      'role',
      '==',
      'customer'
    ) as FirebaseFirestore.Query;

    if (status === 'active') {
      query = query.where('isActive', '==', true);
    } else if (status === 'inactive') {
      query = query.where('isActive', '==', false);
    }

    // Sort
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'email'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    const sortDir = order === 'asc' ? 'asc' : 'desc';
    query = query.orderBy(sortField, sortDir);

    // Count
    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // Paginate
    const offset = (pageNum - 1) * limitNum;
    const snapshot = await query.offset(offset).limit(limitNum).get();

    let customers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: data.role,
        isActive: data.isActive ?? true,
        orderCount: data.orderCount || 0,
        totalSpent: data.totalSpent || 0,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        lastLoginAt: data.lastLoginAt?.toDate?.().toISOString() || data.lastLoginAt || null,
      };
    });

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.email?.toLowerCase().includes(term) ||
          c.firstName?.toLowerCase().includes(term) ||
          c.lastName?.toLowerCase().includes(term) ||
          c.phone?.includes(term)
      );
    }

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error('[Customers] Erreur lors de la liste:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des clients.',
    });
  }
});

/**
 * GET /api/admin/customers/:id
 * Details d'un client.
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const userDoc = await usersCol.doc(id).get();
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Client introuvable.',
      });
      return;
    }

    const userData = userDoc.data()!;

    // Get order stats
    const ordersSnap = await ordersCol
      .where('userId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentOrders = ordersSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        orderNumber: d.orderNumber,
        status: d.status,
        total: d.total,
        createdAt: d.createdAt?.toDate?.().toISOString() || d.createdAt,
      };
    });

    const orderCountSnap = await ordersCol
      .where('userId', '==', id)
      .count()
      .get();
    const orderCount = orderCountSnap.data().count;

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || null,
        role: userData.role,
        isActive: userData.isActive ?? true,
        addresses: userData.addresses || [],
        wishlist: userData.wishlist || [],
        orderCount,
        totalSpent: userData.totalSpent || 0,
        recentOrders,
        createdAt: userData.createdAt?.toDate?.().toISOString() || userData.createdAt,
        lastLoginAt: userData.lastLoginAt?.toDate?.().toISOString() || null,
      },
    });
  } catch (error) {
    console.error('[Customers] Erreur lors des details:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du client.',
    });
  }
});

/**
 * PATCH /api/admin/customers/:id
 * Met a jour le statut d'un client (activer/desactiver).
 */
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const userDoc = await usersCol.doc(id).get();
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Client introuvable.',
      });
      return;
    }

    await usersCol.doc(id).update({
      isActive: Boolean(isActive),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Audit log
    await auditCol.add({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      action: isActive ? 'customer_activated' : 'customer_deactivated',
      resource: 'customers',
      resourceId: id,
      details: { isActive: Boolean(isActive) },
      ipAddress: req.ip || '',
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: isActive ? 'Client active.' : 'Client desactive.',
    });
  } catch (error) {
    console.error('[Customers] Erreur lors de la mise a jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du client.',
    });
  }
});

export default router;
