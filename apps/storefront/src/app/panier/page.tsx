'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  variant?: string;
  quantity: number;
}

const SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 7;

function getCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('play_tn_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem('play_tn_cart', JSON.stringify(items));
}

export default function PanierPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCartItems(getCartFromStorage());
    setMounted(true);
  }, []);

  const updateCart = useCallback((items: CartItem[]) => {
    setCartItems(items);
    saveCartToStorage(items);
  }, []);

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      const updated = cartItems
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        );
      updateCart(updated);
    },
    [cartItems, updateCart]
  );

  const removeItem = useCallback(
    (id: string) => {
      updateCart(cartItems.filter((item) => item.id !== id));
    },
    [cartItems, updateCart]
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (!mounted) {
    return (
      <div className="container-page py-16">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="border-b border-gray-100 bg-gray-50">
        <div className="container-page py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-primary">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-gray-900">Panier</li>
          </ol>
        </div>
      </nav>

      <section className="py-10 lg:py-16">
        <div className="container-page">
          <h1 className="mb-8 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Mon Panier
          </h1>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-20 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-50">
                <ShoppingBag className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-gray-900">
                Votre panier est vide
              </h2>
              <p className="mb-8 max-w-md text-gray-500">
                Vous n&apos;avez aucun article dans votre panier. Parcourez notre catalogue pour
                trouver des produits qui vous plaisent.
              </p>
              <Link href="/produits">
                <Button variant="primary" size="lg">
                  Decouvrir nos produits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                    >
                      {/* Image Placeholder */}
                      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-center text-[10px] text-gray-400">
                          {item.name}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col gap-2 sm:gap-1">
                        <Link
                          href={`/produits/${item.slug}`}
                          className="font-semibold text-gray-900 hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <span className="text-sm text-gray-500">
                            Variante : {item.variant}
                          </span>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {item.price.toFixed(2)} TND
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {item.originalPrice.toFixed(2)} TND
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                            aria-label="Diminuer la quantite"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="flex h-10 w-12 items-center justify-center border-x border-gray-200 text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                            aria-label="Augmenter la quantite"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="w-24 text-right font-bold text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} TND
                        </span>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label="Supprimer l'article"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href="/produits"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Continuer les achats
                  </Link>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="card sticky top-24 p-6">
                  <h2 className="mb-6 font-display text-xl font-bold text-gray-900">
                    Recapitulatif
                  </h2>

                  <div className="space-y-3 border-b border-gray-100 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Sous-total ({cartItems.reduce((s, i) => s + i.quantity, 0)} articles)
                      </span>
                      <span className="font-medium text-gray-900">
                        {subtotal.toFixed(2)} TND
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Livraison</span>
                      <span className="font-medium text-gray-900">
                        {shipping === 0 ? (
                          <span className="text-accent-600">Gratuite</span>
                        ) : (
                          `${shipping.toFixed(2)} TND`
                        )}
                      </span>
                    </div>
                  </div>

                  {subtotal < SHIPPING_THRESHOLD && (
                    <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                      Plus que{' '}
                      <span className="font-bold">
                        {(SHIPPING_THRESHOLD - subtotal).toFixed(2)} TND
                      </span>{' '}
                      pour beneficier de la livraison gratuite !
                    </div>
                  )}

                  <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {total.toFixed(2)} TND
                    </span>
                  </div>

                  <Link href="/commande" className="mt-6 block">
                    <Button variant="primary" size="lg" className="w-full">
                      Passer la commande
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="mt-4 text-center text-xs text-gray-400">
                    Paiement securise par carte bancaire, virement ou a la livraison.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
