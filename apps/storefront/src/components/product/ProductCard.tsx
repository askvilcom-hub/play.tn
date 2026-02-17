import Link from 'next/link';
import { Star } from 'lucide-react';

type ProductBadge = 'Promo' | 'Nouveau' | 'Populaire';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: ProductBadge;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const badgeStyles: Record<ProductBadge, string> = {
  Promo: 'bg-red-100 text-red-700',
  Nouveau: 'bg-accent-100 text-accent-700',
  Populaire: 'bg-primary-100 text-primary-700',
};

export default function ProductCard({ product }: ProductCardProps) {
  const discountPercent =
    product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="card group flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-200">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-300 group-hover:scale-105">
          <span className="text-xs text-gray-400">{product.name}</span>
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <span className="mb-1 text-xs font-medium text-primary">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {product.price.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-gray-500">TND</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
