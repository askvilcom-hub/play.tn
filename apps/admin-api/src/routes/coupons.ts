import { Router, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const couponsCol = db.collection('coupons');
const auditCol = db.collection('audit_logs');

/**
 * GET /api/admin/coupons
 * Liste tous les coupons avec pagination.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    let query = couponsCol.orderBy(
      'createdAt',
      'desc'
    ) as FirebaseFirestore.Query;

    if (status === 'active') {
      query = query.where('isActive', '==', true);
    } else if (status === 'inactive') {
      query = query.where('isActive', '==', false);
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const offset = (pageNum - 1) * limitNum;
    const snapshot = await query.offset(offset).limit(limitNum).get();

    const coupons = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        code: data.code,
        description: data.description || '',
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrder: data.minimumOrder || null,
        maximumDiscount: data.maximumDiscount || null,
        usageLimit: data.usageLimit || 0,
        usedCount: data.usedCount || 0,
        perUserLimit: data.perUserLimit || 1,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt?.toDate?.().toISOString() || data.startsAt,
        expiresAt: data.expiresAt?.toDate?.().toISOString() || data.expiresAt,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        coupons,
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
    console.error('[Coupons] Erreur lors de la liste:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des coupons.',
    });
  }
});

/**
 * POST /api/admin/coupons
 * Creer un nouveau coupon.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrder,
      maximumDiscount,
      usageLimit,
      perUserLimit,
      applicableCategories,
      applicableProducts,
      startsAt,
      expiresAt,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({
        success: false,
        message: 'Code, type de remise et valeur sont requis.',
      });
      return;
    }

    // Check code uniqueness
    const existing = await couponsCol
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (!existing.empty) {
      res.status(409).json({
        success: false,
        message: 'Un coupon avec ce code existe deja.',
      });
      return;
    }

    const couponData = {
      code: code.toUpperCase(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: minimumOrder ? Number(minimumOrder) : null,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      usageLimit: Number(usageLimit) || 0,
      usedCount: 0,
      perUserLimit: Number(perUserLimit) || 1,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      isActive: true,
      startsAt: startsAt ? new Date(startsAt) : FieldValue.serverTimestamp(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await couponsCol.add(couponData);

    // Audit log
    await auditCol.add({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      action: 'coupon_created',
      resource: 'coupons',
      resourceId: docRef.id,
      details: { code: couponData.code },
      ipAddress: req.ip || '',
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: 'Coupon cree avec succes.',
      data: { id: docRef.id, ...couponData },
    });
  } catch (error) {
    console.error('[Coupons] Erreur lors de la creation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation du coupon.',
    });
  }
});

/**
 * PUT /api/admin/coupons/:id
 * Mettre a jour un coupon.
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const couponDoc = await couponsCol.doc(id).get();
    if (!couponDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Coupon introuvable.',
      });
      return;
    }

    const {
      description,
      discountType,
      discountValue,
      minimumOrder,
      maximumDiscount,
      usageLimit,
      perUserLimit,
      applicableCategories,
      applicableProducts,
      isActive,
      startsAt,
      expiresAt,
    } = req.body;

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (description !== undefined) updates.description = description;
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = Number(discountValue);
    if (minimumOrder !== undefined)
      updates.minimumOrder = minimumOrder ? Number(minimumOrder) : null;
    if (maximumDiscount !== undefined)
      updates.maximumDiscount = maximumDiscount ? Number(maximumDiscount) : null;
    if (usageLimit !== undefined) updates.usageLimit = Number(usageLimit);
    if (perUserLimit !== undefined) updates.perUserLimit = Number(perUserLimit);
    if (applicableCategories !== undefined)
      updates.applicableCategories = applicableCategories;
    if (applicableProducts !== undefined)
      updates.applicableProducts = applicableProducts;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (startsAt !== undefined) updates.startsAt = new Date(startsAt);
    if (expiresAt !== undefined)
      updates.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await couponsCol.doc(id).update(updates);

    // Audit log
    await auditCol.add({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      action: 'coupon_updated',
      resource: 'coupons',
      resourceId: id,
      details: updates,
      ipAddress: req.ip || '',
      createdAt: FieldValue.serverTimestamp(),
    });

    const updated = await couponsCol.doc(id).get();

    res.json({
      success: true,
      message: 'Coupon mis a jour.',
      data: { id, ...updated.data() },
    });
  } catch (error) {
    console.error('[Coupons] Erreur lors de la mise a jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du coupon.',
    });
  }
});

/**
 * DELETE /api/admin/coupons/:id
 * Supprimer un coupon.
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const couponDoc = await couponsCol.doc(id).get();
    if (!couponDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Coupon introuvable.',
      });
      return;
    }

    const couponData = couponDoc.data()!;
    await couponsCol.doc(id).delete();

    // Audit log
    await auditCol.add({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      action: 'coupon_deleted',
      resource: 'coupons',
      resourceId: id,
      details: { code: couponData.code },
      ipAddress: req.ip || '',
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Coupon supprime.',
    });
  } catch (error) {
    console.error('[Coupons] Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du coupon.',
    });
  }
});

export default router;
