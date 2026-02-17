import { Router, Request, Response } from 'express';

/**
 * Routes pour la gestion des commandes cote admin.
 * Endpoints: GET /, GET /:id, PATCH /:id/status
 */

const router = Router();

// --- Donnees mock pour le scaffold ---
const mockOrders = [
  {
    id: 'ORD-1042',
    customer: {
      id: 'cust_001',
      name: 'Ahmed Ben Ali',
      email: 'ahmed.benali@email.com',
      phone: '+216 50 123 456',
    },
    items: [
      {
        productId: 'prod_001',
        name: 'Manette PS5 DualSense',
        quantity: 2,
        price: 189.9,
        total: 379.8,
      },
    ],
    subtotal: 379.8,
    shippingCost: 7.0,
    total: 386.8,
    status: 'confirmed',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '15 Rue de la Liberte',
      city: 'Tunis',
      governorate: 'Tunis',
      postalCode: '1000',
    },
    createdAt: '2026-02-16T14:30:00Z',
    updatedAt: '2026-02-16T15:00:00Z',
  },
  {
    id: 'ORD-1041',
    customer: {
      id: 'cust_002',
      name: 'Fatma Trabelsi',
      email: 'fatma.trabelsi@email.com',
      phone: '+216 55 987 654',
    },
    items: [
      {
        productId: 'prod_002',
        name: 'Casque Gaming HyperX Cloud III',
        quantity: 1,
        price: 259.0,
        total: 259.0,
      },
      {
        productId: 'prod_003',
        name: 'Clavier Mecanique Razer BlackWidow V4',
        quantity: 1,
        price: 349.0,
        total: 349.0,
      },
    ],
    subtotal: 608.0,
    shippingCost: 0,
    total: 608.0,
    status: 'shipped',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingAddress: {
      street: '42 Avenue Habib Bourguiba',
      city: 'Sfax',
      governorate: 'Sfax',
      postalCode: '3000',
    },
    createdAt: '2026-02-15T09:20:00Z',
    updatedAt: '2026-02-16T08:45:00Z',
  },
  {
    id: 'ORD-1040',
    customer: {
      id: 'cust_003',
      name: 'Youssef Khelifi',
      email: 'youssef.khelifi@email.com',
      phone: '+216 98 456 789',
    },
    items: [
      {
        productId: 'prod_001',
        name: 'Manette PS5 DualSense',
        quantity: 1,
        price: 189.9,
        total: 189.9,
      },
    ],
    subtotal: 189.9,
    shippingCost: 7.0,
    total: 196.9,
    status: 'delivered',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '8 Rue Ibn Khaldoun',
      city: 'Sousse',
      governorate: 'Sousse',
      postalCode: '4000',
    },
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-14T16:30:00Z',
  },
];

/**
 * Statuts valides pour une commande
 */
const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

/**
 * GET /api/admin/orders
 * Liste toutes les commandes avec pagination et filtres.
 */
router.get('/', (req: Request, res: Response) => {
  const { page = '1', limit = '20', status, search } = req.query;

  // TODO: Requeter Firestore avec pagination, tri par date decroissante
  let filtered = [...mockOrders];

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)
    );
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
 * GET /api/admin/orders/:id
 * Recupere le detail d'une commande.
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Requeter Firestore par ID
  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Commande non trouvee',
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * PATCH /api/admin/orders/:id/status
 * Met a jour le statut d'une commande.
 */
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Statut invalide. Statuts valides: ${VALID_STATUSES.join(', ')}`,
    });
  }

  // TODO: Mettre a jour dans Firestore, ajouter au historique de statuts,
  // envoyer notification email au client
  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Commande non trouvee',
    });
  }

  const previousStatus = order.status;

  console.log(
    `[Orders] Commande ${id}: ${previousStatus} -> ${status}${note ? ` (note: ${note})` : ''}`
  );

  res.json({
    success: true,
    message: `Statut de la commande mis a jour: ${previousStatus} -> ${status}`,
    data: {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          from: previousStatus,
          to: status,
          note: note || null,
          changedAt: new Date().toISOString(),
        },
      ],
    },
  });
});

export default router;
