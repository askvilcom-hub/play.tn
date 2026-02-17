'use client';

import { useCallback, useSyncExternalStore } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  variant?: string;
  variantName?: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  updatedAt: number;
}

const CART_KEY = 'play-tn-cart';
const SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 7;

let cartState: CartState = { items: [], updatedAt: Date.now() };
const listeners = new Set<() => void>();

function emitChange() {
  cartState = { ...cartState, updatedAt: Date.now() };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(cartState.items));
  }
  listeners.forEach((listener) => listener());
}

function loadCart(): CartState {
  if (typeof window === 'undefined') return { items: [], updatedAt: Date.now() };
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const items = JSON.parse(stored) as CartItem[];
      return { items, updatedAt: Date.now() };
    }
  } catch {
    // ignore parse errors
  }
  return { items: [], updatedAt: Date.now() };
}

// Initialize on first import (client-side)
if (typeof window !== 'undefined') {
  cartState = loadCart();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartState {
  return cartState;
}

function getServerSnapshot(): CartState {
  return { items: [], updatedAt: 0 };
}

export function useCart() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const key = `${item.productId}-${item.variant || 'default'}`;
    const existing = cartState.items.find(
      (i) => `${i.productId}-${i.variant || 'default'}` === key
    );

    if (existing) {
      cartState.items = cartState.items.map((i) =>
        `${i.productId}-${i.variant || 'default'}` === key
          ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
          : i
      );
    } else {
      cartState.items = [...cartState.items, { ...item, quantity }];
    }
    emitChange();
  }, []);

  const updateQuantity = useCallback((productId: string, variant: string | undefined, quantity: number) => {
    const key = `${productId}-${variant || 'default'}`;
    if (quantity <= 0) {
      cartState.items = cartState.items.filter(
        (i) => `${i.productId}-${i.variant || 'default'}` !== key
      );
    } else {
      cartState.items = cartState.items.map((i) =>
        `${i.productId}-${i.variant || 'default'}` === key
          ? { ...i, quantity: Math.min(10, quantity) }
          : i
      );
    }
    emitChange();
  }, []);

  const removeItem = useCallback((productId: string, variant?: string) => {
    const key = `${productId}-${variant || 'default'}`;
    cartState.items = cartState.items.filter(
      (i) => `${i.productId}-${i.variant || 'default'}` !== key
    );
    emitChange();
  }, []);

  const clearCart = useCallback(() => {
    cartState.items = [];
    emitChange();
  }, []);

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return {
    items: state.items,
    itemCount,
    subtotal,
    shipping,
    shippingThreshold: SHIPPING_THRESHOLD,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
