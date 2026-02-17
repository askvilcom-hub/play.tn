import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';
import { db, COLLECTIONS } from '../config/firebase';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const createReviewSchema = z.object({
  productId: z.string().min(1, 'L\'identifiant du produit est requis.'),
  rating: z.number().int().min(1, 'La note minimale est 1.').max(5, 'La note maximale est 5.'),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères.').max(100),
  comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères.').max(1000),
});

const reviewIdParamsSchema = z.object({
  id: z.string().min(1),
});

// ---------------------------------------------------------------------------
// POST /api/reviews — Create a review (authenticated user)
// ---------------------------------------------------------------------------
router.post(
  '/',
  requireAuth,
  validateBody(createReviewSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { productId, rating, title, comment } =
      req.body as z.infer<typeof createReviewSchema>;

    // 1. Verify the product exists
    const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();
    if (!productDoc.exists) {
      throw new AppError('Produit introuvable.', 404);
    }

    // 2. Check the user hasn't already reviewed this product
    const existingReview = await db
      .collection(COLLECTIONS.REVIEWS)
      .where('productId', '==', productId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      throw new AppError('Vous avez déjà donné un avis pour ce produit.', 409);
    }

    // 3. Create the review
    const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc();
    const userName = `${req.user!.firstName || 'Utilisateur'} ${(req.user!.lastName || '').charAt(0)}.`;

    await reviewRef.set({
      productId,
      userId,
      userName,
      rating,
      title,
      comment,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 4. Update product review count
    const reviewsSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where('productId', '==', productId)
      .where('status', '==', 'approved')
      .get();

    const approvedRatings = reviewsSnapshot.docs.map((d) => d.data().rating as number);
    approvedRatings.push(rating);

    const avgRating =
      approvedRatings.reduce((sum, r) => sum + r, 0) / approvedRatings.length;

    await productDoc.ref.update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: approvedRatings.length,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: 'Avis soumis avec succès. Il sera visible après modération.',
      data: {
        id: reviewRef.id,
        productId,
        userId,
        userName,
        rating,
        title,
        comment,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  })
);

// ---------------------------------------------------------------------------
// DELETE /api/reviews/:id — Delete own review (authenticated user)
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  requireAuth,
  validateParams(reviewIdParamsSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { id } = req.params;

    const reviewDoc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    if (!reviewDoc.exists) {
      throw new AppError('Avis introuvable.', 404);
    }

    const review = reviewDoc.data()!;

    if (review.userId !== userId) {
      throw new AppError('Accès refusé.', 403);
    }

    await reviewDoc.ref.delete();

    // Recalculate product average rating
    const reviewsSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where('productId', '==', review.productId)
      .where('status', '==', 'approved')
      .get();

    const ratings = reviewsSnapshot.docs.map((d) => d.data().rating as number);
    const avgRating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10
          ) / 10
        : 0;

    await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(review.productId)
      .update({
        rating: avgRating,
        reviewCount: ratings.length,
        updatedAt: FieldValue.serverTimestamp(),
      });

    res.json({
      success: true,
      message: 'Avis supprimé avec succès.',
      data: { id, deleted: true },
    });
  })
);

export default router;
