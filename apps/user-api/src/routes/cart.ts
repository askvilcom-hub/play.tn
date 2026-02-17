import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validate';
import { db, COLLECTIONS } from '../config/firebase';

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
// Helper: compute cart totals
// ---------------------------------------------------------------------------
function computeCartTotals(items: Array<{ price: number; quantity: number }>) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Free shipping above 150 TND, otherwise 7 TND
  const shipping = subtotal >= 150 ? 0 : 7;
  return { itemCount, subtotal, shipping, total: subtotal + shipping };
}

// ---------------------------------------------------------------------------
// GET /api/cart — Get the current user's cart
// ---------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;

    const cartDoc = await db.collection(COLLECTIONS.CARTS).doc(userId).get();

    if (!cartDoc.exists) {
      res.json({
        success: true,
        data: {
          userId,
          items: [],
          itemCount: 0,
          subtotal: 0,
          shipping: 0,
          total: 0,
          currency: 'TND',
          updatedAt: new Date().toISOString(),
        },
      });
      return;
    }

    const cart = cartDoc.data()!;
    const items: Array<Record<string, unknown>> = cart.items || [];

    // Enrich items with current product data (price, stock, images)
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const productDoc = await db
          .collection(COLLECTIONS.PRODUCTS)
          .doc(item.productId as string)
          .get();

        if (!productDoc.exists) {
          return { ...item, available: false };
        }

        const product = productDoc.data()!;
        return {
          itemId: item.itemId,
          productId: item.productId,
          name: product.name || item.name,
          slug: product.slug || item.slug,
          price: product.price ?? item.price,
          quantity: item.quantity,
          image: product.images?.[0] || item.image || '',
          variant: item.variant || null,
          stock: product.stock ?? 0,
          available: (product.stock ?? 0) >= (item.quantity as number),
          subtotal: (product.price ?? item.price as number) * (item.quantity as number),
        };
      })
    );

    const { itemCount, subtotal, shipping, total } = computeCartTotals(
      enrichedItems.map((i) => ({
        price: (i.price as number) || 0,
        quantity: (i.quantity as number) || 0,
      }))
    );

    res.json({
      success: true,
      data: {
        userId,
        items: enrichedItems,
        itemCount,
        subtotal,
        shipping,
        total,
        currency: 'TND',
        updatedAt: cart.updatedAt
          ? cart.updatedAt.toDate?.().toISOString() || cart.updatedAt
          : new Date().toISOString(),
      },
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

    // 1. Verify product exists and is in stock
    const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();
    if (!productDoc.exists) {
      throw new AppError('Produit introuvable.', 404);
    }

    const product = productDoc.data()!;

    if (product.status === 'inactive' || product.status === 'archived') {
      throw new AppError('Ce produit n\'est plus disponible.', 400);
    }

    if ((product.stock ?? 0) < quantity) {
      throw new AppError(
        `Stock insuffisant. Seulement ${product.stock ?? 0} unité(s) disponible(s).`,
        400
      );
    }

    // 2. Get or create cart
    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    const cartDoc = await cartRef.get();

    let items: Array<Record<string, unknown>> = [];
    if (cartDoc.exists) {
      items = cartDoc.data()!.items || [];
    }

    // 3. Check if item already exists (same product + variant)
    const variantKey = variant ? JSON.stringify(variant) : '';
    const existingIndex = items.findIndex(
      (i) =>
        i.productId === productId &&
        (JSON.stringify(i.variant || '') === variantKey || (!i.variant && !variant))
    );

    const itemId =
      existingIndex >= 0
        ? (items[existingIndex].itemId as string)
        : `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (existingIndex >= 0) {
      const newQty = (items[existingIndex].quantity as number) + quantity;
      if (newQty > 10) {
        throw new AppError('Quantité maximale de 10 par article.', 400);
      }
      if ((product.stock ?? 0) < newQty) {
        throw new AppError(
          `Stock insuffisant. Seulement ${product.stock ?? 0} unité(s) disponible(s).`,
          400
        );
      }
      items[existingIndex].quantity = newQty;
    } else {
      items.push({
        itemId,
        productId,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity,
        image: product.images?.[0] || '',
        variant: variant || null,
      });
    }

    await cartRef.set(
      { items, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    const addedItem = items.find((i) => i.itemId === itemId)!;

    res.status(201).json({
      success: true,
      message: 'Article ajouté au panier.',
      data: {
        itemId,
        productId,
        name: product.name,
        price: product.price,
        quantity: addedItem.quantity,
        variant: addedItem.variant || null,
        subtotal: (product.price as number) * (addedItem.quantity as number),
      },
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

    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      throw new AppError('Panier introuvable.', 404);
    }

    const items: Array<Record<string, unknown>> = cartDoc.data()!.items || [];
    const itemIndex = items.findIndex((i) => i.itemId === itemId);

    if (itemIndex < 0) {
      throw new AppError('Article introuvable dans le panier.', 404);
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      items.splice(itemIndex, 1);
      await cartRef.update({
        items,
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        message: 'Article retiré du panier.',
        data: { itemId, removed: true },
      });
      return;
    }

    // Verify stock
    const productDoc = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(items[itemIndex].productId as string)
      .get();

    if (productDoc.exists) {
      const product = productDoc.data()!;
      if ((product.stock ?? 0) < quantity) {
        throw new AppError(
          `Stock insuffisant. Seulement ${product.stock ?? 0} unité(s) disponible(s).`,
          400
        );
      }
    }

    items[itemIndex].quantity = quantity;

    await cartRef.update({
      items,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const price = items[itemIndex].price as number;
    res.json({
      success: true,
      message: 'Quantité mise à jour.',
      data: {
        itemId,
        quantity,
        subtotal: price * quantity,
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

    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      throw new AppError('Panier introuvable.', 404);
    }

    const items: Array<Record<string, unknown>> = cartDoc.data()!.items || [];
    const updatedItems = items.filter((i) => i.itemId !== itemId);

    if (updatedItems.length === items.length) {
      throw new AppError('Article introuvable dans le panier.', 404);
    }

    await cartRef.update({
      items: updatedItems,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Article retiré du panier.',
      data: { itemId, removed: true },
    });
  })
);

export default router;
