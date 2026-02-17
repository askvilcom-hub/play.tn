import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { validateParams, validateQuery } from '../middleware/validate';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const categorySlugParamsSchema = z.object({
  slug: z.string().min(1),
});

const categoryProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'popular', 'rating'])
    .optional()
    .default('newest'),
});

// ---------------------------------------------------------------------------
// GET /api/categories — List all categories
// ---------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    // TODO: Replace with real Firestore query
    // const snapshot = await db
    //   .collection(COLLECTIONS.CATEGORIES)
    //   .where('isActive', '==', true)
    //   .orderBy('order', 'asc')
    //   .get();
    //
    // const categories = snapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data(),
    // }));

    const mockCategories = [
      {
        id: 'cat_001',
        name: 'Jeux PS5',
        slug: 'jeux-ps5',
        description: 'Les derniers jeux pour PlayStation 5.',
        image: 'https://placeholder.co/600x400',
        productCount: 45,
        order: 1,
      },
      {
        id: 'cat_002',
        name: 'Jeux PS4',
        slug: 'jeux-ps4',
        description: 'Catalogue de jeux PlayStation 4.',
        image: 'https://placeholder.co/600x400',
        productCount: 120,
        order: 2,
      },
      {
        id: 'cat_003',
        name: 'Jeux Xbox',
        slug: 'jeux-xbox',
        description: 'Jeux pour Xbox Series X|S et Xbox One.',
        image: 'https://placeholder.co/600x400',
        productCount: 38,
        order: 3,
      },
      {
        id: 'cat_004',
        name: 'Jeux Nintendo Switch',
        slug: 'jeux-nintendo-switch',
        description: 'Jeux pour Nintendo Switch.',
        image: 'https://placeholder.co/600x400',
        productCount: 55,
        order: 4,
      },
      {
        id: 'cat_005',
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Manettes, casques, câbles et autres accessoires gaming.',
        image: 'https://placeholder.co/600x400',
        productCount: 30,
        order: 5,
      },
      {
        id: 'cat_006',
        name: 'Consoles',
        slug: 'consoles',
        description: 'Consoles de jeux neuves et reconditionnées.',
        image: 'https://placeholder.co/600x400',
        productCount: 12,
        order: 6,
      },
    ];

    res.json({
      success: true,
      data: mockCategories,
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/categories/:slug — Get a single category with its products
// ---------------------------------------------------------------------------
router.get(
  '/:slug',
  validateParams(categorySlugParamsSchema),
  validateQuery(categoryProductsQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const { page, limit, sort } =
      req.query as unknown as z.infer<typeof categoryProductsQuerySchema>;

    // TODO: Replace with real Firestore query
    // 1. Get the category document
    // const categorySnapshot = await db
    //   .collection(COLLECTIONS.CATEGORIES)
    //   .where('slug', '==', slug)
    //   .where('isActive', '==', true)
    //   .limit(1)
    //   .get();
    //
    // if (categorySnapshot.empty) throw new AppError('Catégorie introuvable.', 404);
    // const category = { id: categorySnapshot.docs[0].id, ...categorySnapshot.docs[0].data() };
    //
    // 2. Get products in this category
    // const productsSnapshot = await db
    //   .collection(COLLECTIONS.PRODUCTS)
    //   .where('categorySlug', '==', slug)
    //   .where('status', '==', 'active')
    //   .orderBy(sortField, sortDirection)
    //   .limit(limit)
    //   .get();

    const mockCategory = {
      id: 'cat_001',
      name: 'Jeux PS5',
      slug,
      description: 'Les derniers jeux pour PlayStation 5.',
      image: 'https://placeholder.co/600x400',
      productCount: 45,
    };

    const mockProducts = [
      {
        id: 'prod_002',
        name: 'FIFA 25 - PS5',
        slug: 'fifa-25-ps5',
        price: 149.0,
        currency: 'TND',
        brand: 'EA Sports',
        image: 'https://placeholder.co/400x400',
        rating: 4.2,
        reviewCount: 18,
        inStock: true,
      },
      {
        id: 'prod_004',
        name: 'God of War Ragnarök - PS5',
        slug: 'god-of-war-ragnarok-ps5',
        price: 129.0,
        currency: 'TND',
        brand: 'Sony',
        image: 'https://placeholder.co/400x400',
        rating: 4.9,
        reviewCount: 64,
        inStock: true,
      },
    ];

    res.json({
      success: true,
      data: {
        category: mockCategory,
        products: mockProducts,
        pagination: {
          page: page ?? 1,
          limit: limit ?? 20,
          total: 45,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
        sort,
      },
    });
  })
);

export default router;
