import { Router, Request, Response } from 'express';
import multer from 'multer';

/**
 * Routes CRUD pour la gestion des produits.
 * Endpoints: GET /, POST /, GET /:id, PUT /:id, DELETE /:id, POST /:id/images
 */

const router = Router();

// Configuration multer pour l'upload d'images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo max
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorise. Formats acceptes: JPEG, PNG, WebP, GIF'));
    }
  },
});

// --- Donnees mock pour le scaffold ---
const mockProducts = [
  {
    id: 'prod_001',
    name: 'Manette PS5 DualSense',
    slug: 'manette-ps5-dualsense',
    price: 189.9,
    compareAtPrice: 219.0,
    category: 'Accessoires',
    brand: 'Sony',
    stock: 45,
    status: 'active',
    images: ['https://via.placeholder.com/300x300?text=PS5+Controller'],
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 'prod_002',
    name: 'Casque Gaming HyperX Cloud III',
    slug: 'casque-gaming-hyperx-cloud-iii',
    price: 259.0,
    compareAtPrice: null,
    category: 'Audio',
    brand: 'HyperX',
    stock: 23,
    status: 'active',
    images: ['https://via.placeholder.com/300x300?text=HyperX+Headset'],
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-02-05T11:45:00Z',
  },
  {
    id: 'prod_003',
    name: 'Clavier Mecanique Razer BlackWidow V4',
    slug: 'clavier-mecanique-razer-blackwidow-v4',
    price: 349.0,
    compareAtPrice: 399.0,
    category: 'Peripheriques',
    brand: 'Razer',
    stock: 0,
    status: 'out_of_stock',
    images: ['https://via.placeholder.com/300x300?text=Razer+Keyboard'],
    createdAt: '2026-02-01T16:00:00Z',
    updatedAt: '2026-02-12T09:30:00Z',
  },
];

/**
 * GET /api/admin/products
 * Liste tous les produits avec pagination et filtres.
 */
router.get('/', (req: Request, res: Response) => {
  const { page = '1', limit = '20', search, category, status } = req.query;

  // TODO: Requeter Firestore avec pagination et filtres
  let filtered = [...mockProducts];

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  res.json({
    success: true,
    data: filtered,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / parseInt(limit as string)),
    },
  });
});

/**
 * POST /api/admin/products
 * Cree un nouveau produit.
 */
router.post('/', (req: Request, res: Response) => {
  // TODO: Valider les donnees avec Zod et sauvegarder dans Firestore
  const productData = req.body;

  const newProduct = {
    id: `prod_${Date.now()}`,
    ...productData,
    status: productData.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('[Products] Nouveau produit cree (mock):', newProduct.id);

  res.status(201).json({
    success: true,
    message: 'Produit cree avec succes',
    data: newProduct,
  });
});

/**
 * GET /api/admin/products/:id
 * Recupere un produit par son ID.
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Requeter Firestore par ID
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouve',
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

/**
 * PUT /api/admin/products/:id
 * Met a jour un produit existant.
 */
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // TODO: Valider avec Zod et mettre a jour dans Firestore
  const existingProduct = mockProducts.find((p) => p.id === id);

  if (!existingProduct) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouve',
    });
  }

  const updatedProduct = {
    ...existingProduct,
    ...updateData,
    id, // Empeche la modification de l'ID
    updatedAt: new Date().toISOString(),
  };

  console.log('[Products] Produit mis a jour (mock):', id);

  res.json({
    success: true,
    message: 'Produit mis a jour avec succes',
    data: updatedProduct,
  });
});

/**
 * DELETE /api/admin/products/:id
 * Supprime un produit.
 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Supprimer de Firestore et nettoyer les images GCS
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produit non trouve',
    });
  }

  console.log('[Products] Produit supprime (mock):', id);

  res.json({
    success: true,
    message: 'Produit supprime avec succes',
  });
});

/**
 * POST /api/admin/products/:id/images
 * Upload d'images pour un produit.
 */
router.post('/:id/images', upload.array('images', 10), (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier envoye',
    });
  }

  // TODO: Uploader vers GCS via le module storage et mettre a jour Firestore
  const uploadedUrls = files.map(
    (file, index) =>
      `https://storage.googleapis.com/play-tn-media/products/${id}/${Date.now()}_${index}_${file.originalname}`
  );

  console.log(`[Products] ${files.length} image(s) uploadee(s) pour le produit ${id} (mock)`);

  res.json({
    success: true,
    message: `${files.length} image(s) uploadee(s) avec succes`,
    data: {
      productId: id,
      urls: uploadedUrls,
    },
  });
});

export default router;
