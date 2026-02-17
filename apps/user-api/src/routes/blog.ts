import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, COLLECTIONS } from '../config/firebase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateQuery, validateParams } from '../middleware/validate';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
  category: z.string().optional(),
});

const postSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

// ---------------------------------------------------------------------------
// GET /api/blog
// Liste les articles publies avec pagination.
// ---------------------------------------------------------------------------
router.get(
  '/',
  validateQuery(listPostsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, category } = req.query as unknown as {
      page: number;
      limit: number;
      category?: string;
    };

    let query = db
      .collection(COLLECTIONS.BLOG_POSTS)
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc') as FirebaseFirestore.Query;

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const allPosts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags || [],
        authorName: data.authorName,
        publishedAt: data.publishedAt,
        viewCount: data.viewCount || 0,
      };
    });

    const total = allPosts.length;
    const start = (page - 1) * limit;
    const posts = allPosts.slice(start, start + limit);

    res.json({
      success: true,
      data: {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/blog/categories
// Liste les categories de blog.
// ---------------------------------------------------------------------------
router.get(
  '/categories',
  asyncHandler(async (_req: Request, res: Response) => {
    const snapshot = await db
      .collection(COLLECTIONS.BLOG_CATEGORIES)
      .orderBy('name', 'asc')
      .get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: categories,
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/blog/:slug
// Recupere un article par son slug (publie uniquement).
// ---------------------------------------------------------------------------
router.get(
  '/:slug',
  validateParams(postSlugParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const snapshot = await db
      .collection(COLLECTIONS.BLOG_POSTS)
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new AppError('Article non trouve', 404);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Increment view count (fire-and-forget)
    doc.ref.update({
      viewCount: (data.viewCount || 0) + 1,
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags || [],
        authorName: data.authorName,
        publishedAt: data.publishedAt,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        viewCount: (data.viewCount || 0) + 1,
      },
    });
  })
);

export default router;
