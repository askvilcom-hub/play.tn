import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { bucket, getPublicUrl, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../config/storage';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Routes CRUD pour la gestion des produits.
 * Endpoints: GET /, POST /, GET /:id, PUT /:id, DELETE /:id, POST /:id/images
 */

const router = Router();

const productsCol = db.collection('products');
const auditCol = db.collection('audit_logs');

// Configuration multer pour l'upload d'images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorise. Formats acceptes: JPEG, PNG, WebP, GIF, SVG'));
    }
  },
});

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
 * GET /api/admin/products
 * Liste tous les produits avec pagination et filtres.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const { search, category, status } = req.query;

    let query: FirebaseFirestore.Query = productsCol;

    if (category) {
      query = query.where('category', '==', category);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc');

    // Get total count for pagination
    const countSnapshot = await query.get();
    let allDocs = countSnapshot.docs;

    // Client-side search filter (Firestore doesn't support native contains)
    if (search) {
      const q = (search as string).toLowerCase();
      allDocs = allDocs.filter((doc) => {
        const data = doc.data();
        return (
          (data.name && data.name.toLowerCase().includes(q)) ||
          (data.brand && data.brand.toLowerCase().includes(q)) ||
          (data.sku && data.sku.toLowerCase().includes(q))
        );
      });
    }

    const total = allDocs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const paginatedDocs = allDocs.slice(offset, offset + limit);

    const products = paginatedDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[Products] Erreur lors de la recuperation des produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des produits',
    });
  }
});

/**
 * POST /api/admin/products
 * Cree un nouveau produit.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, price, category, brand, description, stock, status, images, compareAtPrice, sku, tags } = req.body;

    // Validation des champs requis
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom du produit est requis',
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le prix du produit est requis et doit etre un nombre positif',
      });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La categorie du produit est requise',
      });
    }

    const slug = generateSlug(name);
    const now = new Date().toISOString();

    const productData = {
      name: name.trim(),
      slug,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      category,
      brand: brand || null,
      description: description || '',
      stock: stock !== undefined ? Number(stock) : 0,
      status: status || 'draft',
      images: images || [],
      sku: sku || null,
      tags: tags || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await productsCol.add(productData);

    // Log audit
    await auditCol.add({
      action: 'create',
      resource: 'products',
      resourceId: docRef.id,
      details: `Produit cree: ${name}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log('[Products] Nouveau produit cree:', docRef.id);

    res.status(201).json({
      success: true,
      message: 'Produit cree avec succes',
      data: { id: docRef.id, ...productData },
    });
  } catch (error) {
    console.error('[Products] Erreur lors de la creation du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation du produit',
    });
  }
});

/**
 * GET /api/admin/products/:id
 * Recupere un produit par son ID.
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await productsCol.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouve',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('[Products] Erreur lors de la recuperation du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du produit',
    });
  }
});

/**
 * PUT /api/admin/products/:id
 * Met a jour un produit existant.
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = productsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouve',
      });
    }

    const updateData = { ...req.body };
    // Empeche la modification de l'ID et des timestamps de creation
    delete updateData.id;
    delete updateData.createdAt;

    updateData.updatedAt = new Date().toISOString();

    // Regenerer le slug si le nom change
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();

    // Log audit
    await auditCol.add({
      action: 'update',
      resource: 'products',
      resourceId: id,
      details: `Produit mis a jour: ${updatedDoc.data()?.name || id}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: updateData.updatedAt,
    });

    console.log('[Products] Produit mis a jour:', id);

    res.json({
      success: true,
      message: 'Produit mis a jour avec succes',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error('[Products] Erreur lors de la mise a jour du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du produit',
    });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Supprime un produit (soft delete par defaut, hard delete avec ?hard=true).
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === 'true';
    const docRef = productsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouve',
      });
    }

    const productName = doc.data()?.name || id;
    const now = new Date().toISOString();

    if (hard) {
      await docRef.delete();
    } else {
      await docRef.update({
        isActive: false,
        status: 'archived',
        updatedAt: now,
      });
    }

    // Log audit
    await auditCol.add({
      action: hard ? 'hard_delete' : 'soft_delete',
      resource: 'products',
      resourceId: id,
      details: `Produit ${hard ? 'supprime definitivement' : 'desactive'}: ${productName}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log(`[Products] Produit ${hard ? 'supprime' : 'desactive'}:`, id);

    res.json({
      success: true,
      message: hard ? 'Produit supprime definitivement' : 'Produit desactive avec succes',
    });
  } catch (error) {
    console.error('[Products] Erreur lors de la suppression du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
    });
  }
});

/**
 * POST /api/admin/products/:id/images
 * Upload d'images pour un produit vers GCS.
 */
router.post('/:id/images', upload.array('images', 10), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier envoye',
      });
    }

    const docRef = productsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouve',
      });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const ext = file.originalname.split('.').pop() || 'jpg';
      const fileName = `products/${id}/${uuidv4()}.${ext}`;
      const blob = bucket.file(fileName);

      await blob.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        resumable: false,
      });

      // Rendre le fichier public
      await blob.makePublic();

      uploadedUrls.push(getPublicUrl(fileName));
    }

    // Mettre a jour le tableau images du produit
    const existingImages: string[] = doc.data()?.images || [];
    const allImages = [...existingImages, ...uploadedUrls];
    const now = new Date().toISOString();

    await docRef.update({
      images: allImages,
      updatedAt: now,
    });

    // Log audit
    await auditCol.add({
      action: 'upload_images',
      resource: 'products',
      resourceId: id,
      details: `${files.length} image(s) uploadee(s) pour le produit ${doc.data()?.name || id}`,
      adminId: req.user?.uid || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      timestamp: now,
    });

    console.log(`[Products] ${files.length} image(s) uploadee(s) pour le produit ${id}`);

    res.json({
      success: true,
      message: `${files.length} image(s) uploadee(s) avec succes`,
      data: {
        productId: id,
        urls: uploadedUrls,
        allImages,
      },
    });
  } catch (error) {
    console.error('[Products] Erreur lors de l\'upload des images:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des images',
    });
  }
});

export default router;
