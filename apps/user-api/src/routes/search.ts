import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { validateQuery } from '../middleware/validate';

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

    // TODO: Replace with real search implementation
    // Option A: Simple Firestore text search (limited)
    // const productsRef = db.collection(COLLECTIONS.PRODUCTS);
    // const snapshot = await productsRef
    //   .where('status', '==', 'active')
    //   .where('searchKeywords', 'array-contains-any', q.toLowerCase().split(' '))
    //   .limit(limit)
    //   .get();
    //
    // Option B: Algolia / Typesense / Meilisearch integration for full-text search
    // const results = await searchClient.index('products').search(q, {
    //   filters: category ? `category = "${category}"` : '',
    //   page: page - 1,
    //   hitsPerPage: limit,
    // });
    //
    // Option C: Firestore full-text search with a dedicated search index collection

    const mockResults = [
      {
        id: 'prod_001',
        name: 'Manette PlayStation 5 DualSense',
        slug: 'manette-ps5-dualsense',
        price: 189.0,
        currency: 'TND',
        category: 'accessoires',
        brand: 'Sony',
        image: 'https://placeholder.co/400x400',
        rating: 4.5,
        reviewCount: 32,
        inStock: true,
        highlight: `<em>Manette</em> PlayStation 5 DualSense`,
      },
      {
        id: 'prod_003',
        name: 'Manette Xbox Series X',
        slug: 'manette-xbox-series-x',
        price: 169.0,
        currency: 'TND',
        category: 'accessoires',
        brand: 'Microsoft',
        image: 'https://placeholder.co/400x400',
        rating: 4.3,
        reviewCount: 12,
        inStock: true,
        highlight: `<em>Manette</em> Xbox Series X`,
      },
    ];

    res.json({
      success: true,
      data: {
        query: q,
        results: mockResults,
        pagination: {
          page: page ?? 1,
          limit: limit ?? 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: { category, minPrice, maxPrice, sort },
      },
    });
  })
);

export default router;
