import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const addItemSchema = z.object({
  productId: z.string().min(1, 'L\'identifiant du produit est requis.'),
  quantity: z.number().int().min(1, 'La quantité doit être au moins 1.').max(10, 'Quantité maximale de 10 par article.'),
  variant: z
    .object({
      color: z.string().optional(),
      size: z.string().optional(),
      edition: z.string().optional(),
    })
    .optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'La quantité ne peut pas être négative.').max(10, 'Quantité maximale de 10 par article.'),
});

const itemIdParamsSchema = z.object({
  itemId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// GET /api/cart — Get the current user's cart
// ---------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;

    // TODO: Replace with real Firestore query
    // const cartDoc = await db
    //   .collection(COLLECTIONS.CARTS)
    //   .doc(userId)
    //   .get();
    //
    // if (!cartDoc.exists) {
    //   return res.json({ success: true, data: { items: [], total: 0 } });
    // }
    // const cart = cartDoc.data();
    // Enrich items with current product data (price, stock, images)

    const mockCart = {
      userId,
      items: [
        {
          itemId: 'item_001',
          productId: 'prod_001',
          name: 'Manette PlayStation 5 DualSense',
          slug: 'manette-ps5-dualsense',
          price: 189.0,
          quantity: 1,
          image: 'https://placeholder.co/200x200',
          variant: null,
          subtotal: 189.0,
        },
        {
          itemId: 'item_002',
          productId: 'prod_002',
          name: 'FIFA 25 - PS5',
          slug: 'fifa-25-ps5',
          price: 149.0,
          quantity: 2,
          image: 'https://placeholder.co/200x200',
          variant: null,
          subtotal: 298.0,
        },
      ],
      itemCount: 3,
      subtotal: 487.0,
      shipping: 7.0,
      total: 494.0,
      currency: 'TND',
      updatedAt: '2025-02-15T16:00:00Z',
    };

    res.json({
      success: true,
      data: mockCart,
    });
  })
);

// ---------------------------------------------------------------------------
// POST /api/cart/items — Add an item to the cart
// ---------------------------------------------------------------------------
router.post(
  '/items',
  validateBody(addItemSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { productId, quantity, variant } = req.body as z.infer<typeof addItemSchema>;

    // TODO: Replace with real Firestore logic
    // 1. Verify product exists and is in stock
    // const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();
    // if (!productDoc.exists) throw new AppError('Produit introuvable.', 404);
    // const product = productDoc.data();
    // if (product.stock < quantity) throw new AppError('Stock insuffisant.', 400);
    //
    // 2. Get or create cart
    // const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    // const cartDoc = await cartRef.get();
    //
    // 3. Add item or increment quantity if already exists
    // await cartRef.set({ items: [...], updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    const mockAddedItem = {
      itemId: 'item_003',
      productId,
      name: 'Produit ajouté',
      price: 189.0,
      quantity,
      variant: variant || null,
      subtotal: 189.0 * quantity,
    };

    res.status(201).json({
      success: true,
      message: 'Article ajouté au panier.',
      data: mockAddedItem,
    });
  })
);

// ---------------------------------------------------------------------------
// PATCH /api/cart/items/:itemId — Update quantity of a cart item
// ---------------------------------------------------------------------------
router.patch(
  '/items/:itemId',
  validateParams(itemIdParamsSchema),
  validateBody(updateItemSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { itemId } = req.params;
    const { quantity } = req.body as z.infer<typeof updateItemSchema>;

    // TODO: Replace with real Firestore logic
    // const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    // const cartDoc = await cartRef.get();
    // if (!cartDoc.exists) throw new AppError('Panier introuvable.', 404);
    //
    // Find item in cart, verify stock for new quantity
    // If quantity is 0, remove the item
    // Update the cart document

    if (quantity === 0) {
      res.json({
        success: true,
        message: 'Article retiré du panier.',
        data: { itemId, removed: true },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Quantité mise à jour.',
      data: {
        itemId,
        quantity,
        subtotal: 189.0 * quantity,
      },
    });
  })
);

// ---------------------------------------------------------------------------
// DELETE /api/cart/items/:itemId — Remove an item from the cart
// ---------------------------------------------------------------------------
router.delete(
  '/items/:itemId',
  validateParams(itemIdParamsSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const { itemId } = req.params;

    // TODO: Replace with real Firestore logic
    // const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    // const cartDoc = await cartRef.get();
    // if (!cartDoc.exists) throw new AppError('Panier introuvable.', 404);
    //
    // Filter out the item from items array
    // Recalculate totals
    // await cartRef.update({ items: updatedItems, updatedAt: FieldValue.serverTimestamp() });

    res.json({
      success: true,
      message: 'Article retiré du panier.',
      data: { itemId, removed: true },
    });
  })
);

export default router;
