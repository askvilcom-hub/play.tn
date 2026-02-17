import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Routes CRUD pour la gestion du blog (articles et categories).
 * Endpoints:
 *   Articles: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
 *   Categories: GET /categories, POST /categories, PUT /categories/:id, DELETE /categories/:id
 */

const router = Router();

const postsCol = db.collection('blogPosts');
const blogCategoriesCol = db.collection('blogCategories');
const auditCol = db.collection('audit_logs');

/**
 * Genere un slug a partir d'un titre.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// =====================
// BLOG POSTS
// =====================

/**
 * GET /api/admin/blog
 * Liste tous les articles du blog avec pagination.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));

    let query = postsCol.orderBy('createdAt', 'desc') as FirebaseFirestore.Query;

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const allPosts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const total = allPosts.length;
    const start = (pageNum - 1) * limitNum;
    const posts = allPosts.slice(start, start + limitNum);

    res.json({
      success: true,
      data: {
        posts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la recuperation des articles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des articles',
    });
  }
});

/**
 * GET /api/admin/blog/:id
 * Recupere un article par son ID.
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Distinguish from category routes
    if (id === 'categories') {
      return (router as any).handle(req, res);
    }

    const doc = await postsCol.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouve',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la recuperation de l\'article:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation de l\'article',
    });
  }
});

/**
 * POST /api/admin/blog
 * Cree un nouvel article de blog.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      coverImage,
      status = 'draft',
      seoTitle,
      seoDescription,
    } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le titre de l\'article est requis',
      });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le contenu de l\'article est requis',
      });
    }

    const slug = generateSlug(title);

    // Verifier l'unicite du slug
    const existingSlug = await postsCol.where('slug', '==', slug).get();
    if (!existingSlug.empty) {
      return res.status(409).json({
        success: false,
        message: `Un article avec le slug "${slug}" existe deja.`,
      });
    }

    const now = new Date().toISOString();

    const postData = {
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, ''),
      category: category || null,
      tags: tags || [],
      coverImage: coverImage || null,
      status,
      authorId: req.user?.uid || 'unknown',
      authorName: req.user?.displayName || req.user?.email || 'Admin',
      publishedAt: status === 'published' ? now : null,
      seoTitle: seoTitle || title.trim(),
      seoDescription: seoDescription || excerpt || '',
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await postsCol.add(postData);

    await auditCol.add({
      action: 'create',
      resource: 'blogPosts',
      resourceId: docRef.id,
      details: `Article cree: ${title}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log('[Blog] Nouvel article cree:', docRef.id);

    res.status(201).json({
      success: true,
      message: 'Article cree avec succes',
      data: { id: docRef.id, ...postData },
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la creation de l\'article:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation de l\'article',
    });
  }
});

/**
 * PUT /api/admin/blog/:id
 * Met a jour un article existant.
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = postsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouve',
      });
    }

    const existingData = doc.data()!;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.viewCount;

    // Regenerer le slug si le titre change
    if (updateData.title && updateData.title !== existingData.title) {
      updateData.slug = generateSlug(updateData.title);

      const existingSlug = await postsCol.where('slug', '==', updateData.slug).get();
      const otherWithSlug = existingSlug.docs.filter((d) => d.id !== id);
      if (otherWithSlug.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Un article avec le slug "${updateData.slug}" existe deja.`,
        });
      }
    }

    // Mettre a jour publishedAt si on passe en publié
    if (updateData.status === 'published' && existingData.status !== 'published') {
      updateData.publishedAt = new Date().toISOString();
    }

    updateData.updatedAt = new Date().toISOString();

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();

    await auditCol.add({
      action: 'update',
      resource: 'blogPosts',
      resourceId: id,
      details: `Article mis a jour: ${updatedDoc.data()?.title || id}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: updateData.updatedAt,
    });

    console.log('[Blog] Article mis a jour:', id);

    res.json({
      success: true,
      message: 'Article mis a jour avec succes',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la mise a jour de l\'article:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour de l\'article',
    });
  }
});

/**
 * DELETE /api/admin/blog/:id
 * Supprime un article.
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = postsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouve',
      });
    }

    const title = doc.data()?.title || id;
    const now = new Date().toISOString();

    await docRef.delete();

    await auditCol.add({
      action: 'delete',
      resource: 'blogPosts',
      resourceId: id,
      details: `Article supprime: ${title}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log('[Blog] Article supprime:', id);

    res.json({
      success: true,
      message: 'Article supprime avec succes',
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la suppression de l\'article:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'article',
    });
  }
});

// =====================
// BLOG CATEGORIES
// =====================

/**
 * GET /api/admin/blog/categories
 * Liste toutes les categories du blog.
 */
router.get('/categories', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await blogCategoriesCol.orderBy('name', 'asc').get();

    // Count posts per category
    const postsSnapshot = await postsCol.get();
    const postCounts: Record<string, number> = {};

    for (const postDoc of postsSnapshot.docs) {
      const cat = postDoc.data().category;
      if (cat) {
        postCounts[cat] = (postCounts[cat] || 0) + 1;
      }
    }

    const categories = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        postCount: postCounts[doc.id] || postCounts[data.slug] || 0,
      };
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la recuperation des categories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des categories du blog',
    });
  }
});

/**
 * POST /api/admin/blog/categories
 * Cree une nouvelle categorie de blog.
 */
router.post('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la categorie est requis',
      });
    }

    const slug = generateSlug(name);

    const existingSlug = await blogCategoriesCol.where('slug', '==', slug).get();
    if (!existingSlug.empty) {
      return res.status(409).json({
        success: false,
        message: `Une categorie de blog avec le slug "${slug}" existe deja.`,
      });
    }

    const now = new Date().toISOString();

    const categoryData = {
      name: name.trim(),
      slug,
      description: description || '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await blogCategoriesCol.add(categoryData);

    await auditCol.add({
      action: 'create',
      resource: 'blogCategories',
      resourceId: docRef.id,
      details: `Categorie de blog creee: ${name}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    res.status(201).json({
      success: true,
      message: 'Categorie de blog creee avec succes',
      data: { id: docRef.id, ...categoryData },
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la creation de la categorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation de la categorie de blog',
    });
  }
});

/**
 * PUT /api/admin/blog/categories/:catId
 * Met a jour une categorie de blog.
 */
router.put('/categories/:catId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catId } = req.params;
    const docRef = blogCategoriesCol.doc(catId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Categorie de blog non trouvee',
      });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.createdAt;

    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);

      const existingSlug = await blogCategoriesCol.where('slug', '==', updateData.slug).get();
      const otherWithSlug = existingSlug.docs.filter((d) => d.id !== catId);
      if (otherWithSlug.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Une categorie de blog avec le slug "${updateData.slug}" existe deja.`,
        });
      }
    }

    updateData.updatedAt = new Date().toISOString();

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();

    res.json({
      success: true,
      message: 'Categorie de blog mise a jour avec succes',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la mise a jour de la categorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour de la categorie de blog',
    });
  }
});

/**
 * DELETE /api/admin/blog/categories/:catId
 * Supprime une categorie de blog.
 */
router.delete('/categories/:catId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { catId } = req.params;
    const docRef = blogCategoriesCol.doc(catId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Categorie de blog non trouvee',
      });
    }

    // Check if posts use this category
    const postsWithCat = await postsCol.where('category', '==', catId).limit(1).get();
    if (!postsWithCat.empty) {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer cette categorie : des articles y sont encore associes.',
      });
    }

    const now = new Date().toISOString();
    const catName = doc.data()?.name || catId;

    await docRef.delete();

    await auditCol.add({
      action: 'delete',
      resource: 'blogCategories',
      resourceId: catId,
      details: `Categorie de blog supprimee: ${catName}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    res.json({
      success: true,
      message: 'Categorie de blog supprimee avec succes',
    });
  } catch (error) {
    console.error('[Blog] Erreur lors de la suppression de la categorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la categorie de blog',
    });
  }
});

export default router;
