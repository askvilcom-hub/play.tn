import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, COLLECTIONS } from '../config/firebase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateQuery, validateParams } from '../middleware/validate';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'popular', 'rating'])
    .optional()
    .default('newest'),
  inStock: z.coerce.boolean().optional(),
  tags: z.string().optional(),
  onSale: z.coerce.boolean().optional(),
});

const productSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

const productIdParamsSchema = z.object({
  id: z.string().min(1),
});

const productReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

// ---------------------------------------------------------------------------
// Helper: determine sort field and direction
// ---------------------------------------------------------------------------
function getSortConfig(sort: string): { field: string; direction: 'asc' | 'desc' } {
  switch (sort) {
    case 'price_asc':
      return { field: 'price', direction: 'asc' };
    case 'price_desc':
      return { field: 'price', direction: 'desc' };
    case 'popular':
      return { field: 'reviewCount', direction: 'desc' };
    case 'rating':
      return { field: 'averageRating', direction: 'desc' };
    case 'newest':
    default:
      return { field: 'createdAt', direction: 'desc' };
  }
}

// ---------------------------------------------------------------------------
// GET /api/products — List products with filters and pagination
// ---------------------------------------------------------------------------
router.get(
  '/',
  validateQuery(listProductsQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, category, brand, minPrice, maxPrice, sort, inStock, tags, onSale } =
      req.query as unknown as z.infer<typeof listProductsQuerySchema>;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 20;
    const { field: sortField, direction: sortDirection } = getSortConfig(sort ?? 'newest');

    // Build the base query
    let query: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.PRODUCTS)
      .where('status', '==', 'active');

    if (category) {
      query = query.where('categorySlug', '==', category);
    }

    if (brand) {
      query = query.where('brand', '==', brand);
    }

    if (inStock === true) {
      query = query.where('stock', '>', 0);
    }

    if (onSale === true) {
      query = query.where('onSale', '==', true);
    }

    if (tags) {
      // Support single tag via array-contains
      query = query.where('tags', 'array-contains', tags.toLowerCase());
    }

    // Get total count for pagination (run a parallel count query)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Apply sorting
    query = query.orderBy(sortField, sortDirection);

    // Cursor-based pagination: skip (page-1)*limit documents
    if (pageNum > 1) {
      const skipCount = (pageNum - 1) * limitNum;
      const cursorSnapshot = await query.limit(skipCount).get();
      if (!cursorSnapshot.empty) {
        const lastDoc = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limitNum);

    const snapshot = await query.get();

    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        currency: data.currency || 'TND',
        category: data.categorySlug,
        brand: data.brand,
        images: data.images || [],
        rating: data.averageRating || 0,
        reviewCount: data.reviewCount || 0,
        inStock: (data.stock ?? 0) > 0,
        onSale: data.onSale || false,
      };
    });

    // Apply in-memory price filtering (Firestore doesn't support range on different field than orderBy)
    let filteredProducts = products;
    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
    }

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
        filters: { category, brand, minPrice, maxPrice, sort, inStock, tags, onSale },
      },
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/products/:slug — Get a single product by slug
// ---------------------------------------------------------------------------
router.get(
  '/:slug',
  validateParams(productSlugParamsSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;

    const snapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where('slug', '==', slug)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new AppError('Produit introuvable.', 404);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Look up category name if categoryId is present
    let category: { id: string; name: string; slug: string } | null = null;
    if (data.categoryId) {
      const categoryDoc = await db
        .collection(COLLECTIONS.CATEGORIES)
        .doc(data.categoryId)
        .get();
      if (categoryDoc.exists) {
        const catData = categoryDoc.data()!;
        category = {
          id: categoryDoc.id,
          name: catData.name,
          slug: catData.slug,
        };
      }
    } else if (data.categorySlug) {
      // Fallback: look up by slug
      const catSnapshot = await db
        .collection(COLLECTIONS.CATEGORIES)
        .where('slug', '==', data.categorySlug)
        .limit(1)
        .get();
      if (!catSnapshot.empty) {
        const catDoc = catSnapshot.docs[0];
        const catData = catDoc.data();
        category = {
          id: catDoc.id,
          name: catData.name,
          slug: catData.slug,
        };
      }
    }

    const product = {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      currency: data.currency || 'TND',
      category,
      brand: data.brand,
      images: data.images || [],
      specifications: data.specifications || {},
      rating: data.averageRating || 0,
      reviewCount: data.reviewCount || 0,
      stock: data.stock ?? 0,
      inStock: (data.stock ?? 0) > 0,
      onSale: data.onSale || false,
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
    };

    res.json({
      success: true,
      data: product,
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/products/:id/reviews — Get reviews for a specific product
// ---------------------------------------------------------------------------
router.get(
  '/:id/reviews',
  validateParams(productIdParamsSchema),
  validateQuery(productReviewsQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { page, limit } =
      req.query as unknown as z.infer<typeof productReviewsQuerySchema>;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 20;

    // Verify the product exists
    const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(id).get();
    if (!productDoc.exists) {
      throw new AppError('Produit introuvable.', 404);
    }

    const productData = productDoc.data()!;

    // Count total approved reviews
    const countSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where('productId', '==', id)
      .where('status', '==', 'approved')
      .count()
      .get();
    const totalReviews = countSnapshot.data().count;

    // Build query for reviews
    let reviewsQuery: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.REVIEWS)
      .where('productId', '==', id)
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc');

    // Cursor-based pagination
    if (pageNum > 1) {
      const skipCount = (pageNum - 1) * limitNum;
      const cursorSnapshot = await reviewsQuery.limit(skipCount).get();
      if (!cursorSnapshot.empty) {
        const lastDoc = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
        reviewsQuery = reviewsQuery.startAfter(lastDoc);
      }
    }

    reviewsQuery = reviewsQuery.limit(limitNum);

    const reviewsSnapshot = await reviewsQuery.get();

    const reviews = reviewsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName || 'Anonyme',
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      };
    });

    // Calculate rating distribution
    const allReviewsSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where('productId', '==', id)
      .where('status', '==', 'approved')
      .select('rating')
      .get();

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviewsSnapshot.docs.forEach((doc) => {
      const r = doc.data().rating;
      if (r >= 1 && r <= 5) {
        distribution[r]++;
      }
    });

    const totalPages = Math.ceil(totalReviews / limitNum);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalReviews,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
        summary: {
          productId: id,
          averageRating: productData.averageRating || 0,
          totalReviews,
          distribution,
        },
      },
    });
  })
);

export default router;
