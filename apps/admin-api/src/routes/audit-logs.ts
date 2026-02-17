import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const auditCol = db.collection('audit_logs');

/**
 * GET /api/admin/audit-logs
 * Liste les logs d'audit avec pagination et filtres.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '30',
      action,
      resource,
      userId,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

    let query = auditCol.orderBy(
      'createdAt',
      'desc'
    ) as FirebaseFirestore.Query;

    if (action) {
      query = query.where('action', '==', action);
    }

    if (resource) {
      query = query.where('resource', '==', resource);
    }

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    // Count
    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // Paginate
    const offset = (pageNum - 1) * limitNum;
    const snapshot = await query.offset(offset).limit(limitNum).get();

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress || '',
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        logs,
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
    console.error('[AuditLogs] Erreur lors de la liste:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des logs.',
    });
  }
});

/**
 * GET /api/admin/audit-logs/actions
 * Liste les types d'actions disponibles.
 */
router.get('/actions', async (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: [
      'product_created',
      'product_updated',
      'product_deleted',
      'order_status_updated',
      'category_created',
      'category_updated',
      'category_deleted',
      'coupon_created',
      'coupon_updated',
      'coupon_deleted',
      'customer_activated',
      'customer_deactivated',
      'settings_updated',
    ],
  });
});

export default router;
