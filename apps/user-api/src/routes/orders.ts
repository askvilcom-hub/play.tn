import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, validateQuery, validateParams } from '../middleware/validate';
import { db, COLLECTIONS } from '../config/firebase';

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
// Helper: generate order number
// ---------------------------------------------------------------------------
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PLY-${year}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helper: compute shipping fee by governorate
// ---------------------------------------------------------------------------
function computeShippingFee(governorate: string, subtotal: number): number {
  // Free shipping above 150 TND
  if (subtotal >= 150) return 0;

  const tunis = ['tunis', 'ariana', 'ben arous', 'manouba'];
  const gov = governorate.toLowerCase();

  if (tunis.some((t) => gov.includes(t))) return 7;

  const north = ['bizerte', 'béja', 'beja', 'jendouba', 'le kef', 'siliana', 'nabeul', 'zaghouan'];
  if (north.some((n) => gov.includes(n))) return 9;

  const center = ['sousse', 'monastir', 'mahdia', 'sfax', 'kairouan', 'kasserine', 'sidi bouzid'];
  if (center.some((c) => gov.includes(c))) return 10;

  // South and others
  return 12;
}

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

    // 1. Get user's cart
    const cartDoc = await db.collection(COLLECTIONS.CARTS).doc(userId).get();
    if (!cartDoc.exists || !cartDoc.data()?.items?.length) {
      throw new AppError('Votre panier est vide.', 400);
    }

    const cartItems = cartDoc.data()!.items as Array<Record<string, unknown>>;

    // 2. Validate stock and get current prices for each item
    const orderItems: Array<Record<string, unknown>> = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const productDoc = await db
        .collection(COLLECTIONS.PRODUCTS)
        .doc(item.productId as string)
        .get();

      if (!productDoc.exists) {
        throw new AppError(
          `Le produit "${item.name}" n'est plus disponible.`,
          400
        );
      }

      const product = productDoc.data()!;
      const qty = item.quantity as number;

      if ((product.stock ?? 0) < qty) {
        throw new AppError(
          `Stock insuffisant pour "${product.name}". Seulement ${product.stock ?? 0} unité(s) disponible(s).`,
          400
        );
      }

      const price = product.price as number;
      const itemTotal = price * qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        name: product.name,
        slug: product.slug,
        price,
        quantity: qty,
        image: product.images?.[0] || item.image || '',
        variant: item.variant || null,
        subtotal: itemTotal,
      });
    }

    // 3. Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const couponSnapshot = await db
        .collection(COLLECTIONS.COUPONS)
        .where('code', '==', couponCode.toUpperCase())
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data();
        const now = Date.now();

        // Verify coupon validity
        const startsAt = coupon.startsAt?._seconds
          ? coupon.startsAt._seconds * 1000
          : 0;
        const expiresAt = coupon.expiresAt?._seconds
          ? coupon.expiresAt._seconds * 1000
          : Infinity;

        if (now >= startsAt && now <= expiresAt) {
          if (
            coupon.usageLimit === 0 ||
            (coupon.usedCount ?? 0) < coupon.usageLimit
          ) {
            if (coupon.discountType === 'percentage') {
              discount = subtotal * (coupon.discountValue / 100);
              if (coupon.maximumDiscount) {
                discount = Math.min(discount, coupon.maximumDiscount);
              }
            } else {
              discount = coupon.discountValue;
            }

            // Increment usage count
            await couponSnapshot.docs[0].ref.update({
              usedCount: FieldValue.increment(1),
            });
          }
        }
      }
    }

    // 4. Compute totals
    const shipping = computeShippingFee(shippingAddress.governorate, subtotal);
    const total = subtotal - discount + shipping;

    // 5. Create order document
    const orderNumber = generateOrderNumber();
    const orderRef = db.collection(COLLECTIONS.ORDERS).doc();

    const orderData = {
      orderNumber,
      userId,
      userEmail: req.user!.email || '',
      status: 'pending',
      items: orderItems,
      shippingAddress,
      paymentMethod,
      couponCode: couponCode?.toUpperCase() || null,
      notes: notes || null,
      subtotal,
      shipping,
      discount,
      total,
      currency: 'TND',
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'awaiting_payment',
      timeline: [
        { status: 'pending', date: new Date().toISOString() },
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await orderRef.set(orderData);

    // 6. Decrement product stock
    const batch = db.batch();
    for (const item of orderItems) {
      const productRef = db
        .collection(COLLECTIONS.PRODUCTS)
        .doc(item.productId as string);
      batch.update(productRef, {
        stock: FieldValue.increment(-(item.quantity as number)),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // 7. Clear the cart
    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    batch.update(cartRef, {
      items: [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      data: {
        id: orderRef.id,
        orderNumber,
        userId,
        status: 'pending',
        items: orderItems,
        shippingAddress,
        paymentMethod,
        couponCode: couponCode?.toUpperCase() || null,
        notes: notes || null,
        subtotal,
        shipping,
        discount,
        total,
        currency: 'TND',
        paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'awaiting_payment',
        createdAt: new Date().toISOString(),
      },
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

    const pageNum = page ?? 1;
    const limitNum = limit ?? 10;

    let query = db
      .collection(COLLECTIONS.ORDERS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc') as FirebaseFirestore.Query;

    if (status) {
      query = query.where('status', '==', status);
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Paginate
    const offset = (pageNum - 1) * limitNum;
    const snapshot = await query.offset(offset).limit(limitNum).get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderNumber: data.orderNumber,
        status: data.status,
        itemCount: data.items?.length || 0,
        total: data.total,
        currency: data.currency || 'TND',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        deliveredAt: data.deliveredAt?.toDate?.().toISOString() || data.deliveredAt || null,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
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

    const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(id).get();

    if (!orderDoc.exists) {
      throw new AppError('Commande introuvable.', 404);
    }

    const order = orderDoc.data()!;

    if (order.userId !== userId) {
      throw new AppError('Accès refusé.', 403);
    }

    res.json({
      success: true,
      data: {
        id: orderDoc.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        currency: order.currency || 'TND',
        paymentStatus: order.paymentStatus,
        timeline: order.timeline || [],
        trackingNumber: order.trackingNumber || null,
        notes: order.notes || null,
        createdAt: order.createdAt?.toDate?.().toISOString() || order.createdAt,
        updatedAt: order.updatedAt?.toDate?.().toISOString() || order.updatedAt,
      },
    });
  })
);

export default router;
