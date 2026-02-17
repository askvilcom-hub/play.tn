import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, COLLECTIONS } from '../config/firebase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
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
// Helper: build a tree structure from flat categories
// ---------------------------------------------------------------------------
interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  order: number;
  parentId: string | null;
  children: CategoryNode[];
}

function buildCategoryTree(categories: CategoryNode[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Index all categories by id
  for (const cat of categories) {
    cat.children = [];
    map.set(cat.id, cat);
  }

  // Build the tree
  for (const cat of categories) {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// GET /api/categories — List all categories (tree structure)
// ---------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const snapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const categories: CategoryNode[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        image: data.image || undefined,
        productCount: data.productCount || 0,
        order: data.order || 0,
        parentId: data.parentId || null,
        children: [],
      };
    });

    // Build tree structure (if categories have parentId relationships)
    const tree = buildCategoryTree(categories);

    res.json({
      success: true,
      data: tree,
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

    const pageNum = page ?? 1;
    const limitNum = limit ?? 20;
    const { field: sortField, direction: sortDirection } = getSortConfig(sort ?? 'newest');

    // 1. Get the category document
    const categorySnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where('slug', '==', slug)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (categorySnapshot.empty) {
      throw new AppError('Categorie introuvable.', 404);
    }

    const categoryDoc = categorySnapshot.docs[0];
    const categoryData = categoryDoc.data();

    const category = {
      id: categoryDoc.id,
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || '',
      image: categoryData.image || null,
      productCount: categoryData.productCount || 0,
    };

    // 2. Get products in this category
    let productsQuery: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.PRODUCTS)
      .where('categorySlug', '==', slug)
      .where('status', '==', 'active');

    // Count total products in category
    const countSnapshot = await productsQuery.count().get();
    const total = countSnapshot.data().count;

    // Apply sorting
    productsQuery = productsQuery.orderBy(sortField, sortDirection);

    // Cursor-based pagination
    if (pageNum > 1) {
      const skipCount = (pageNum - 1) * limitNum;
      const cursorSnapshot = await productsQuery.limit(skipCount).get();
      if (!cursorSnapshot.empty) {
        const lastDoc = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
        productsQuery = productsQuery.startAfter(lastDoc);
      }
    }

    productsQuery = productsQuery.limit(limitNum);

    const productsSnapshot = await productsQuery.get();

    const products = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        currency: data.currency || 'TND',
        brand: data.brand,
        image: data.images?.[0] || null,
        images: data.images || [],
        rating: data.averageRating || 0,
        reviewCount: data.reviewCount || 0,
        inStock: (data.stock ?? 0) > 0,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
        sort,
      },
    });
  })
);

export default router;
