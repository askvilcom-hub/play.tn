import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { validateQuery } from '../middleware/validate';
import { db, COLLECTIONS } from '../config/firebase';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Le terme de recherche est requis.').max(200),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z
    .enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popular'])
    .optional()
    .default('relevance'),
});

// ---------------------------------------------------------------------------
// GET /api/search?q=query — Search products
// ---------------------------------------------------------------------------
router.get(
  '/',
  validateQuery(searchQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { q, page, limit, category, minPrice, maxPrice, sort } =
      req.query as unknown as z.infer<typeof searchQuerySchema>;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 20;

    // Build search keywords from query
    const searchTerms = q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    // Firestore doesn't support full-text search natively.
    // We use array-contains-any on a searchKeywords field.
    let query = db
      .collection(COLLECTIONS.PRODUCTS)
      .where('status', '==', 'active') as FirebaseFirestore.Query;

    if (searchTerms.length > 0) {
      query = query.where(
        'searchKeywords',
        'array-contains-any',
        searchTerms.slice(0, 10)
      );
    }

    if (category) {
      query = query.where('categorySlug', '==', category);
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.orderBy('price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('price', 'desc');
        break;
      case 'newest':
        query = query.orderBy('createdAt', 'desc');
        break;
      case 'popular':
        query = query.orderBy('salesCount', 'desc');
        break;
      default:
        break;
    }

    const snapshot = await query.limit(200).get();

    // Post-filter by price range
    let results = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        price: data.price,
        originalPrice: data.originalPrice || null,
        currency: 'TND',
        category: data.categorySlug || data.category || '',
        brand: data.brand || '',
        image: data.images?.[0] || '',
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        inStock: (data.stock ?? 0) > 0,
      };
    });

    if (minPrice !== undefined) {
      results = results.filter((r) => r.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      results = results.filter((r) => r.price <= maxPrice);
    }

    const total = results.length;
    const offset = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(offset, offset + limitNum);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        query: q,
        results: paginatedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
        filters: { category, minPrice, maxPrice, sort },
      },
    });
  })
);

export default router;
