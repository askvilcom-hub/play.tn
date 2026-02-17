'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  X,
  Star,
  Home,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import Button from '@/components/ui/Button';

interface FilterState {
  category: string | null;
  priceRange: [number, number];
  brands: string[];
  minRating: number;
}

const categories = [
  { name: 'Accessoires Gaming', slug: 'accessoires-gaming', count: 45 },
  { name: 'Jeux Vidéo', slug: 'jeux-video', count: 38 },
  { name: 'Jouets', slug: 'jouets', count: 62 },
  { name: 'Jeux de Société', slug: 'jeux-de-societe', count: 29 },
  { name: 'Jeux Éducatifs', slug: 'jeux-educatifs', count: 21 },
  { name: 'Sport & Plein Air', slug: 'sport-plein-air', count: 34 },
  { name: 'Figurines & Collectibles', slug: 'figurines-collectibles', count: 27 },
  { name: 'Puzzles', slug: 'puzzles', count: 18 },
];

const brands = [
  'Sony', 'Nintendo', 'LEGO', 'Ravensburger', 'Hasbro',
  'Bandai', 'HyperX', 'Logitech', 'Mattel', 'Playmobil',
];

const sortOptions = [
  { label: 'Pertinence', value: 'relevance' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Meilleures ventes', value: 'best-selling' },
  { label: 'Nouveautés', value: 'newest' },
  { label: 'Meilleures notes', value: 'rating' },
];

const allProducts = [
  {
    id: '1',
    name: 'Manette PS5 DualSense',
    slug: 'manette-ps5-dualsense',
    price: 189.9,
    originalPrice: 229.9,
    image: '/products/dualsense.jpg',
    rating: 4.8,
    reviewCount: 124,
    badge: 'Promo' as const,
    category: 'Accessoires Gaming',
  },
  {
    id: '2',
    name: 'Monopoly Tunisie Edition',
    slug: 'monopoly-tunisie-edition',
    price: 79.9,
    image: '/products/monopoly.jpg',
    rating: 4.6,
    reviewCount: 89,
    badge: 'Nouveau' as const,
    category: 'Jeux de Société',
  },
  {
    id: '3',
    name: 'LEGO Technic Voiture de Course',
    slug: 'lego-technic-voiture-course',
    price: 149.9,
    image: '/products/lego-technic.jpg',
    rating: 4.9,
    reviewCount: 56,
    category: 'Jouets',
  },
  {
    id: '4',
    name: 'Casque Gaming HyperX Cloud III',
    slug: 'casque-hyperx-cloud-iii',
    price: 259.9,
    originalPrice: 299.9,
    image: '/products/hyperx.jpg',
    rating: 4.7,
    reviewCount: 203,
    badge: 'Promo' as const,
    category: 'Accessoires Gaming',
  },
  {
    id: '5',
    name: 'Puzzle Ravensburger 1000 pcs',
    slug: 'puzzle-ravensburger-1000',
    price: 49.9,
    image: '/products/puzzle.jpg',
    rating: 4.5,
    reviewCount: 42,
    category: 'Puzzles',
  },
  {
    id: '6',
    name: 'Figurine Dragon Ball Z Goku',
    slug: 'figurine-dbz-goku',
    price: 119.9,
    image: '/products/goku.jpg',
    rating: 4.9,
    reviewCount: 167,
    badge: 'Populaire' as const,
    category: 'Figurines & Collectibles',
  },
  {
    id: '7',
    name: 'Kit Scientifique Chimie',
    slug: 'kit-scientifique-chimie',
    price: 64.9,
    image: '/products/science-kit.jpg',
    rating: 4.4,
    reviewCount: 31,
    badge: 'Nouveau' as const,
    category: 'Jeux Éducatifs',
  },
  {
    id: '8',
    name: 'Trottinette Freestyle Pro',
    slug: 'trottinette-freestyle-pro',
    price: 199.9,
    originalPrice: 249.9,
    image: '/products/scooter.jpg',
    rating: 4.6,
    reviewCount: 78,
    badge: 'Promo' as const,
    category: 'Sport & Plein Air',
  },
  {
    id: '9',
    name: 'Nintendo Switch OLED',
    slug: 'nintendo-switch-oled',
    price: 899.9,
    image: '/products/switch-oled.jpg',
    rating: 4.9,
    reviewCount: 312,
    badge: 'Populaire' as const,
    category: 'Jeux Vidéo',
  },
  {
    id: '10',
    name: 'Clavier Mécanique RGB',
    slug: 'clavier-mecanique-rgb',
    price: 179.9,
    originalPrice: 219.9,
    image: '/products/keyboard.jpg',
    rating: 4.5,
    reviewCount: 95,
    badge: 'Promo' as const,
    category: 'Accessoires Gaming',
  },
  {
    id: '11',
    name: 'Playmobil Caserne de Pompiers',
    slug: 'playmobil-caserne-pompiers',
    price: 129.9,
    image: '/products/playmobil.jpg',
    rating: 4.7,
    reviewCount: 64,
    category: 'Jouets',
  },
  {
    id: '12',
    name: 'Uno Deluxe',
    slug: 'uno-deluxe',
    price: 34.9,
    image: '/products/uno.jpg',
    rating: 4.3,
    reviewCount: 148,
    category: 'Jeux de Société',
  },
];

export default function ProduitsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    priceRange: [0, 1000],
    brands: [],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const productsPerPage = 12;

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (filters.category) {
      result = result.filter(
        (p) =>
          p.category.toLowerCase().replace(/[^a-z0-9]/g, '-') ===
          filters.category
      );
    }

    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.minRating > 0) {
      result = result.filter((p) => p.rating >= filters.minRating);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      default:
        break;
    }

    return result;
  }, [filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const toggleBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: null,
      priceRange: [0, 1000],
      brands: [],
      minRating: 0,
    });
    setCurrentPage(1);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
          Categories
        </h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    category: prev.category === cat.slug ? null : cat.slug,
                  }));
                  setCurrentPage(1);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  filters.category === cat.slug
                    ? 'bg-primary-50 font-medium text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400">({cat.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
          Prix (TND)
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: [Number(e.target.value), prev.priceRange[1]],
                }))
              }
              className="input-field w-full text-center"
              placeholder="Min"
              min={0}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], Number(e.target.value)],
                }))
              }
              className="input-field w-full text-center"
              placeholder="Max"
              min={0}
            />
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceRange: [prev.priceRange[0], Number(e.target.value)],
              }))
            }
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
          Marques
        </h3>
        <ul className="space-y-2">
          {brands.map((brand) => (
            <li key={brand}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
          Note minimum
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  minRating: prev.minRating === rating ? 0 : rating,
                }));
                setCurrentPage(1);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                filters.minRating === rating
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>& plus</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
      >
        Reinitialiser les filtres
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav className="border-b border-gray-100 bg-gray-50">
        <div className="container-page py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="flex items-center hover:text-primary">
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="font-medium text-gray-900">Produits</li>
          </ol>
        </div>
      </nav>

      <div className="container-page py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              Tous les Produits
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? 's' : ''} trouve
              {filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <FilterSidebar />
          </aside>

          {/* Mobile Filters Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 top-0 flex">
                <div className="relative ml-auto w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Filtres
                    </h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <FilterSidebar />
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg text-gray-500">
                  Aucun produit ne correspond a vos criteres.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 font-medium text-primary hover:text-primary-700"
                >
                  Reinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Precedent
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
