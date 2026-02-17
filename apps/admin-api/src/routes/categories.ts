import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Routes CRUD pour la gestion des categories.
 * Endpoints: GET /, POST /, PUT /:id, DELETE /:id
 */

const router = Router();

const categoriesCol = db.collection('categories');
const productsCol = db.collection('products');
const auditCol = db.collection('audit_logs');

/**
 * Genere un slug a partir d'un nom.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * GET /api/admin/categories
 * Liste toutes les categories avec le nombre de produits associes.
 */
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await categoriesCol.orderBy('name', 'asc').get();

    // Compter les produits par categorie
    const productsSnapshot = await productsCol.get();
    const productCounts: Record<string, number> = {};

    for (const prodDoc of productsSnapshot.docs) {
      const category = prodDoc.data().category;
      if (category) {
        // Compter par nom de categorie ou par ID
        productCounts[category] = (productCounts[category] || 0) + 1;
      }
      const categoryId = prodDoc.data().categoryId;
      if (categoryId) {
        productCounts[categoryId] = (productCounts[categoryId] || 0) + 1;
      }
    }

    const categories = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        productCount: (productCounts[doc.id] || 0) + (productCounts[data.name] || 0) + (productCounts[data.slug] || 0),
      };
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('[Categories] Erreur lors de la recuperation des categories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des categories',
    });
  }
});

/**
 * POST /api/admin/categories
 * Cree une nouvelle categorie avec validation du slug unique.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, image, parentId, isActive } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la categorie est requis',
      });
    }

    const slug = generateSlug(name);

    // Verifier l'unicite du slug
    const existingSlug = await categoriesCol.where('slug', '==', slug).get();
    if (!existingSlug.empty) {
      return res.status(409).json({
        success: false,
        message: `Une categorie avec le slug "${slug}" existe deja. Veuillez choisir un autre nom.`,
      });
    }

    const now = new Date().toISOString();

    const categoryData = {
      name: name.trim(),
      slug,
      description: description || '',
      image: image || null,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await categoriesCol.add(categoryData);

    // Log audit
    await auditCol.add({
      action: 'create',
      resource: 'categories',
      resourceId: docRef.id,
      details: `Categorie creee: ${name}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log('[Categories] Nouvelle categorie creee:', docRef.id);

    res.status(201).json({
      success: true,
      message: 'Categorie creee avec succes',
      data: { id: docRef.id, ...categoryData },
    });
  } catch (error) {
    console.error('[Categories] Erreur lors de la creation de la categorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation de la categorie',
    });
  }
});

/**
 * PUT /api/admin/categories/:id
 * Met a jour une categorie existante.
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = categoriesCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Categorie non trouvee',
      });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.createdAt;

    // Regenerer le slug si le nom change
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);

      // Verifier l'unicite du nouveau slug (exclure le document actuel)
      const existingSlug = await categoriesCol.where('slug', '==', updateData.slug).get();
      const otherWithSlug = existingSlug.docs.filter((d) => d.id !== id);
      if (otherWithSlug.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Une categorie avec le slug "${updateData.slug}" existe deja.`,
        });
      }
    }

    updateData.updatedAt = new Date().toISOString();

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();

    // Log audit
    await auditCol.add({
      action: 'update',
      resource: 'categories',
      resourceId: id,
      details: `Categorie mise a jour: ${updatedDoc.data()?.name || id}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: updateData.updatedAt,
    });

    console.log('[Categories] Categorie mise a jour:', id);

    res.json({
      success: true,
      message: 'Categorie mise a jour avec succes',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error('[Categories] Erreur lors de la mise a jour de la categorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour de la categorie',
    });
  }
});

/**
 * DELETE /api/admin/categories/:id
 * Supprime une categorie (verifie qu'aucun produit n'y est associe).
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = categoriesCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Categorie non trouvee',
      });
    }

    const categoryData = doc.data()!;
    const categoryName = categoryData.name || id;

    // Verifier qu'aucun produit n'est associe a cette categorie
    const productsByIdSnapshot = await productsCol.where('categoryId', '==', id).limit(1).get();
    const productsByNameSnapshot = await productsCol.where('category', '==', categoryName).limit(1).get();

    if (!productsByIdSnapshot.empty || !productsByNameSnapshot.empty) {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer cette categorie : des produits y sont encore associes. Reassignez-les avant de supprimer.',
      });
    }

    const now = new Date().toISOString();
    await docRef.delete();

    // Log audit
    await auditCol.add({
      action: 'delete',
      resource: 'categories',
      resourceId: id,
      details: `Categorie supprimee: ${categoryName}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log('[Categories] Categorie supprimee:', id);

    res.json({
      success: true,
      message: 'Categorie supprimee avec succes',
    });
  } catch (error) {
    console.error('[Categories] Erreur lors de la suppression de la categorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la categorie',
    });
  }
});

export default router;
