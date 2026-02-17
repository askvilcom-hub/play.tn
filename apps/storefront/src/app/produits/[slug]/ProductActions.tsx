'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-store';

interface Variant {
  name: string;
  value: string;
  inStock: boolean;
}

interface ProductActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  variants: Variant[];
  inStock: boolean;
}

export default function ProductActions({
  productId,
  productName,
  productSlug,
  productImage,
  price,
  variants,
  inStock,
}: ProductActionsProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>(
    variants.find((v) => v.inStock)?.value ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const currentVariant = variants.find((v) => v.value === selectedVariant);
  const canAddToCart = inStock && currentVariant?.inStock;

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(10, prev + 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addItem({
      productId,
      name: productName,
      slug: productSlug,
      price,
      image: productImage,
      variant: selectedVariant || undefined,
      variantName: currentVariant?.name,
    }, quantity);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      {variants.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Variante :{' '}
            <span className="font-normal text-gray-600">
              {currentVariant?.name}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.value}
                onClick={() => {
                  if (variant.inStock) {
                    setSelectedVariant(variant.value);
                  }
                }}
                disabled={!variant.inStock}
                className={`relative rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedVariant === variant.value
                    ? 'border-primary bg-primary-50 text-primary'
                    : variant.inStock
                      ? 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      : 'cursor-not-allowed border-gray-100 text-gray-300 line-through'
                }`}
                aria-label={`${variant.name}${!variant.inStock ? ' - Rupture de stock' : ''}`}
              >
                {variant.name}
                {!variant.inStock && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[8px] text-white">
                    x
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Quantite</h3>
        <div className="inline-flex items-center rounded-lg border border-gray-200">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="flex h-11 w-11 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Diminuer la quantite"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={10}
            className="h-11 w-14 border-x border-gray-200 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Quantite"
          />
          <button
            onClick={incrementQuantity}
            disabled={quantity >= 10}
            className="flex h-11 w-11 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Augmenter la quantite"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className={`btn-primary flex-1 gap-2 ${
            addedToCart
              ? 'bg-accent hover:bg-accent-600 focus:ring-accent-500'
              : ''
          }`}
        >
          {addedToCart ? (
            <>
              <Check className="h-5 w-5" />
              Ajoute au panier
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier
            </>
          )}
        </button>

        <button
          onClick={handleToggleFavorite}
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
            isFavorite
              ? 'border-red-200 bg-red-50 text-red-500'
              : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-red-400'
          }`}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`}
          />
        </button>
      </div>

      {/* Total Price */}
      {quantity > 1 && (
        <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
          <span className="text-gray-500">Total : </span>
          <span className="font-bold text-gray-900">
            {(price * quantity).toFixed(2)} TND
          </span>
        </div>
      )}
    </div>
  );
}
