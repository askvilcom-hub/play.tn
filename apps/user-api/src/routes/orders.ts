import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateQuery, validateParams } from '../middleware/validate';

const router = Router();

// All order routes require authentication
router.use(requireAuth);

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const createOrderSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, 'Le prénom est requis.'),
    lastName: z.string().min(1, 'Le nom est requis.'),
    address: z.string().min(1, 'L\'adresse est requise.'),
    city: z.string().min(1, 'La ville est requise.'),
    governorate: z.string().min(1, 'Le gouvernorat est requis.'),
    postalCode: z.string().optional(),
    phone: z.string().min(8, 'Le numéro de téléphone est requis.'),
  }),
  paymentMethod: z.enum(['cash_on_delivery', 'card', 'flouci'], {
    errorMap: () => ({
      message: 'Mode de paiement invalide. Choisissez : cash_on_delivery, card, ou flouci.',
    }),
  }),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
});

const orderIdParamsSchema = z.object({
  id: z.string().min(1),
});

// ---------------------------------------------------------------------------
// POST /api/orders — Create an order from the current cart
// ---------------------------------------------------------------------------
router.post(
  '/',
  validateBody(createOrderSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { shippingAddress, paymentMethod, couponCode, notes } =
      req.body as z.infer<typeof createOrderSchema>;

    // TODO: Replace with real Firestore logic
    // 1. Get user's cart
    // const cartDoc = await db.collection(COLLECTIONS.CARTS).doc(userId).get();
    // if (!cartDoc.exists || cartDoc.data().items.length === 0) {
    //   throw new AppError('Votre panier est vide.', 400);
    // }
    //
    // 2. Validate stock for each item
    // for (const item of cart.items) {
    //   const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(item.productId).get();
    //   if (productDoc.data().stock < item.quantity) throw new AppError('Stock insuffisant...', 400);
    // }
    //
    // 3. Apply coupon if provided
    // if (couponCode) { validate and apply discount }
    //
    // 4. Create order document
    // const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
    // await orderRef.set({ ...orderData, createdAt: FieldValue.serverTimestamp() });
    //
    // 5. If payment is card, create Stripe PaymentIntent
    // if (paymentMethod === 'card') {
    //   const paymentIntent = await stripe.paymentIntents.create({ ... });
    // }
    //
    // 6. Clear the cart
    // await db.collection(COLLECTIONS.CARTS).doc(userId).delete();
    //
    // 7. Decrement product stock

    const mockOrder = {
      id: 'ord_20250215_001',
      orderNumber: 'PLY-2025-00042',
      userId,
      status: 'pending',
      items: [
        {
          productId: 'prod_001',
          name: 'Manette PlayStation 5 DualSense',
          price: 189.0,
          quantity: 1,
          subtotal: 189.0,
        },
        {
          productId: 'prod_002',
          name: 'FIFA 25 - PS5',
          price: 149.0,
          quantity: 2,
          subtotal: 298.0,
        },
      ],
      shippingAddress,
      paymentMethod,
      couponCode: couponCode || null,
      notes: notes || null,
      subtotal: 487.0,
      shipping: 7.0,
      discount: 0,
      total: 494.0,
      currency: 'TND',
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'awaiting_payment',
      clientSecret:
        paymentMethod === 'card' ? 'pi_mock_secret_placeholder' : undefined,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      data: mockOrder,
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/orders — List current user's orders
// ---------------------------------------------------------------------------
router.get(
  '/',
  validateQuery(listOrdersQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { page, limit, status } =
      req.query as unknown as z.infer<typeof listOrdersQuerySchema>;

    // TODO: Replace with real Firestore query
    // let query = db
    //   .collection(COLLECTIONS.ORDERS)
    //   .where('userId', '==', userId)
    //   .orderBy('createdAt', 'desc');
    //
    // if (status) query = query.where('status', '==', status);
    // Apply pagination with startAfter/limit

    const mockOrders = [
      {
        id: 'ord_20250215_001',
        orderNumber: 'PLY-2025-00042',
        status: 'delivered',
        itemCount: 3,
        total: 494.0,
        currency: 'TND',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'paid',
        createdAt: '2025-02-10T10:00:00Z',
        deliveredAt: '2025-02-14T16:30:00Z',
      },
      {
        id: 'ord_20250208_002',
        orderNumber: 'PLY-2025-00038',
        status: 'shipped',
        itemCount: 1,
        total: 89.0,
        currency: 'TND',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        createdAt: '2025-02-08T14:00:00Z',
      },
    ];

    res.json({
      success: true,
      data: {
        orders: mockOrders,
        pagination: {
          page: page ?? 1,
          limit: limit ?? 10,
          total: 5,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/orders/:id — Get a specific order's details
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  validateParams(orderIdParamsSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { id } = req.params;

    // TODO: Replace with real Firestore query
    // const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
    // if (!orderDoc.exists) throw new AppError('Commande introuvable.', 404);
    // const order = orderDoc.data();
    // if (order.userId !== userId) throw new AppError('Accès refusé.', 403);

    const mockOrder = {
      id,
      orderNumber: 'PLY-2025-00042',
      userId,
      status: 'shipped',
      items: [
        {
          productId: 'prod_001',
          name: 'Manette PlayStation 5 DualSense',
          slug: 'manette-ps5-dualsense',
          price: 189.0,
          quantity: 1,
          image: 'https://placeholder.co/200x200',
          subtotal: 189.0,
        },
        {
          productId: 'prod_002',
          name: 'FIFA 25 - PS5',
          slug: 'fifa-25-ps5',
          price: 149.0,
          quantity: 2,
          image: 'https://placeholder.co/200x200',
          subtotal: 298.0,
        },
      ],
      shippingAddress: {
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        address: '15 Rue de la Liberté',
        city: 'Tunis',
        governorate: 'Tunis',
        postalCode: '1000',
        phone: '+216 50 123 456',
      },
      paymentMethod: 'cash_on_delivery',
      subtotal: 487.0,
      shipping: 7.0,
      discount: 0,
      total: 494.0,
      currency: 'TND',
      paymentStatus: 'pending',
      timeline: [
        { status: 'pending', date: '2025-02-10T10:00:00Z' },
        { status: 'confirmed', date: '2025-02-10T10:15:00Z' },
        { status: 'processing', date: '2025-02-11T09:00:00Z' },
        { status: 'shipped', date: '2025-02-12T14:00:00Z' },
      ],
      trackingNumber: 'TN-TRACK-00042',
      createdAt: '2025-02-10T10:00:00Z',
      updatedAt: '2025-02-12T14:00:00Z',
    };

    res.json({
      success: true,
      data: mockOrder,
    });
  })
);

export default router;
