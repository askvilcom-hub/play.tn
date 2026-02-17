'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import Button from '@/components/ui/Button';

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
    category: 'Jeux de Societe',
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
    category: 'Jeux Educatifs',
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
    name: 'Clavier Mecanique RGB Gaming',
    slug: 'clavier-mecanique-rgb',
    price: 179.9,
    image: '/products/keyboard.jpg',
    rating: 4.7,
    reviewCount: 95,
    category: 'Accessoires Gaming',
  },
  {
    id: '10',
    name: 'Uno Deluxe Edition',
    slug: 'uno-deluxe-edition',
    price: 29.9,
    image: '/products/uno.jpg',
    rating: 4.3,
    reviewCount: 156,
    category: 'Jeux de Societe',
  },
  {
    id: '11',
    name: 'Peluche Pikachu Geante',
    slug: 'peluche-pikachu-geante',
    price: 89.9,
    image: '/products/pikachu.jpg',
    rating: 4.8,
    reviewCount: 67,
    badge: 'Populaire' as const,
    category: 'Jouets',
  },
  {
    id: '12',
    name: 'Souris Gaming Logitech G502',
    slug: 'souris-gaming-logitech-g502',
    price: 149.9,
    originalPrice: 179.9,
    image: '/products/mouse.jpg',
    rating: 4.9,
    reviewCount: 312,
    badge: 'Promo' as const,
    category: 'Accessoires Gaming',
  },
];

const categories = [
  'Toutes',
  'Accessoires Gaming',
  'Jeux de Societe',
  'Jouets',
  'Puzzles',
  'Figurines & Collectibles',
  'Jeux Educatifs',
  'Sport & Plein Air',
];

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let results = allProducts;

    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'Toutes') {
      results = results.filter((p) => p.category === selectedCategory);
    }

    return results;
  }, [query, selectedCategory]);

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
            <li className="font-medium text-gray-900">Recherche</li>
          </ol>
        </div>
      </nav>

      <section className="py-10 lg:py-16">
        <div className="container-page">
          {/* Search Bar */}
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                className="input-field pl-12 pr-12 py-4 text-base"
                placeholder="Rechercher des produits..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              {query ? (
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  Resultats pour &laquo;{query}&raquo;
                  <span className="ml-2 text-lg font-normal text-gray-500">
                    ({filteredProducts.length} produit
                    {filteredProducts.length !== 1 ? 's' : ''})
                  </span>
                </h1>
              ) : (
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  Tous les produits
                </h1>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </button>
          </div>

          <div className="flex gap-8">
            {/* Category Filter - Sidebar */}
            <aside
              className={`${
                showFilters ? 'block' : 'hidden'
              } w-full flex-shrink-0 lg:block lg:w-56`}
            >
              <div className="card p-4">
                <h3 className="mb-3 font-display text-sm font-bold text-gray-900">
                  Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary-50 font-medium text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-20 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-10 w-10 text-gray-300" />
                  </div>
                  <h2 className="mb-2 font-display text-xl font-bold text-gray-900">
                    Aucun resultat pour &laquo;{query}&raquo;
                  </h2>
                  <p className="mb-6 max-w-md text-gray-500">
                    Essayez de modifier votre recherche ou parcourez nos categories pour trouver
                    ce que vous cherchez.
                  </p>
                  <Link href="/produits">
                    <Button variant="primary">Voir tous les produits</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
