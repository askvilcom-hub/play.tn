import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
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
});

const productSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

const productIdParamsSchema = z.object({
  id: z.string().min(1),
});

// ---------------------------------------------------------------------------
// GET /api/products — List products with filters and pagination
// ---------------------------------------------------------------------------
router.get(
  '/',
  validateQuery(listProductsQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, category, brand, minPrice, maxPrice, sort, inStock } =
      req.query as unknown as z.infer<typeof listProductsQuerySchema>;

    // TODO: Replace with real Firestore query
    // const productsRef = db.collection(COLLECTIONS.PRODUCTS);
    // let query = productsRef.where('status', '==', 'active');
    // if (category) query = query.where('categorySlug', '==', category);
    // if (brand) query = query.where('brand', '==', brand);
    // if (inStock) query = query.where('stock', '>', 0);
    // Apply sort ordering, pagination with startAfter/limit
    // if (minPrice || maxPrice) filter by price range

    const mockProducts = [
      {
        id: 'prod_001',
        name: 'Manette PlayStation 5 DualSense',
        slug: 'manette-ps5-dualsense',
        price: 189.0,
        compareAtPrice: 219.0,
        currency: 'TND',
        category: 'accessoires',
        brand: 'Sony',
        images: ['https://placeholder.co/400x400'],
        rating: 4.5,
        reviewCount: 32,
        inStock: true,
      },
      {
        id: 'prod_002',
        name: 'FIFA 25 - PS5',
        slug: 'fifa-25-ps5',
        price: 149.0,
        currency: 'TND',
        category: 'jeux-ps5',
        brand: 'EA Sports',
        images: ['https://placeholder.co/400x400'],
        rating: 4.2,
        reviewCount: 18,
        inStock: true,
      },
    ];

    res.json({
      success: true,
      data: {
        products: mockProducts,
        pagination: {
          page: page ?? 1,
          limit: limit ?? 20,
          total: 42,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
        filters: { category, brand, minPrice, maxPrice, sort, inStock },
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

    // TODO: Replace with real Firestore query
    // const snapshot = await db
    //   .collection(COLLECTIONS.PRODUCTS)
    //   .where('slug', '==', slug)
    //   .where('status', '==', 'active')
    //   .limit(1)
    //   .get();
    //
    // if (snapshot.empty) throw new AppError('Produit introuvable.', 404);
    // const product = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    const mockProduct = {
      id: 'prod_001',
      name: 'Manette PlayStation 5 DualSense',
      slug,
      description:
        'La manette DualSense redéfinit le jeu sur PS5 grâce au retour haptique et aux gâchettes adaptatives.',
      price: 189.0,
      compareAtPrice: 219.0,
      currency: 'TND',
      category: {
        id: 'cat_001',
        name: 'Accessoires',
        slug: 'accessoires',
      },
      brand: 'Sony',
      images: [
        'https://placeholder.co/800x800',
        'https://placeholder.co/800x800',
      ],
      specifications: {
        couleur: 'Blanc',
        connectivité: 'Bluetooth, USB-C',
        compatibilité: 'PS5, PC',
      },
      rating: 4.5,
      reviewCount: 32,
      stock: 15,
      inStock: true,
      tags: ['ps5', 'manette', 'dualsense', 'sony'],
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-02-10T08:00:00Z',
    };

    res.json({
      success: true,
      data: mockProduct,
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/products/:id/reviews — Get reviews for a specific product
// ---------------------------------------------------------------------------
router.get(
  '/:id/reviews',
  validateParams(productIdParamsSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // TODO: Replace with real Firestore query
    // const reviewsSnapshot = await db
    //   .collection(COLLECTIONS.REVIEWS)
    //   .where('productId', '==', id)
    //   .where('status', '==', 'approved')
    //   .orderBy('createdAt', 'desc')
    //   .limit(20)
    //   .get();
    //
    // const reviews = reviewsSnapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data(),
    // }));

    const mockReviews = [
      {
        id: 'rev_001',
        productId: id,
        userId: 'user_001',
        userName: 'Ahmed B.',
        rating: 5,
        title: 'Excellente manette',
        comment:
          'Le retour haptique est incroyable, on sent vraiment la différence.',
        createdAt: '2025-02-01T14:00:00Z',
      },
      {
        id: 'rev_002',
        productId: id,
        userId: 'user_002',
        userName: 'Sarra M.',
        rating: 4,
        title: 'Très bon produit',
        comment: 'Bonne qualité, livraison rapide. Je recommande.',
        createdAt: '2025-01-28T09:30:00Z',
      },
    ];

    res.json({
      success: true,
      data: {
        reviews: mockReviews,
        summary: {
          productId: id,
          averageRating: 4.5,
          totalReviews: 32,
          distribution: { 5: 18, 4: 8, 3: 4, 2: 1, 1: 1 },
        },
      },
    });
  })
);

export default router;
