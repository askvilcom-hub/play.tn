import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';

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

    // TODO: Replace with real Firestore logic
    // 1. Verify the product exists
    // const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();
    // if (!productDoc.exists) throw new AppError('Produit introuvable.', 404);
    //
    // 2. Check the user has purchased this product (optional but recommended)
    // const purchaseSnapshot = await db
    //   .collection(COLLECTIONS.ORDERS)
    //   .where('userId', '==', userId)
    //   .where('items', 'array-contains', { productId })
    //   .where('status', '==', 'delivered')
    //   .limit(1)
    //   .get();
    //
    // 3. Check the user hasn't already reviewed this product
    // const existingReview = await db
    //   .collection(COLLECTIONS.REVIEWS)
    //   .where('productId', '==', productId)
    //   .where('userId', '==', userId)
    //   .limit(1)
    //   .get();
    // if (!existingReview.empty) throw new AppError('Vous avez déjà donné un avis pour ce produit.', 409);
    //
    // 4. Create the review
    // const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc();
    // await reviewRef.set({
    //   productId, userId, rating, title, comment,
    //   status: 'pending', // moderation
    //   createdAt: FieldValue.serverTimestamp(),
    // });
    //
    // 5. Update product average rating (via Cloud Function or here)

    const mockReview = {
      id: 'rev_new_001',
      productId,
      userId,
      userName: `${req.user!.firstName || 'Utilisateur'} ${(req.user!.lastName || '').charAt(0)}.`,
      rating,
      title,
      comment,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Avis soumis avec succès. Il sera visible après modération.',
      data: mockReview,
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

    // TODO: Replace with real Firestore logic
    // const reviewDoc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    // if (!reviewDoc.exists) throw new AppError('Avis introuvable.', 404);
    // if (reviewDoc.data().userId !== userId) throw new AppError('Accès refusé.', 403);
    //
    // await reviewDoc.ref.delete();
    // Recalculate product average rating

    res.json({
      success: true,
      message: 'Avis supprimé avec succès.',
      data: { id, deleted: true },
    });
  })
);

export default router;
