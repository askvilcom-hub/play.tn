'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Gamepad2,
} from 'lucide-react';
import { useCart } from '@/lib/cart-store';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Produits', href: '/produits' },
  { name: 'Promotions', href: '/produits?promo=true' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount: cartItemCount } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      {/* Top Bar */}
      <div className="bg-primary-900 py-1.5 text-center text-xs font-medium text-primary-100">
        Livraison gratuite a partir de 150 TND d&apos;achat
      </div>

      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display">
              <span className="text-primary">Play</span>
              <span className="text-secondary">.tn</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden max-w-sm flex-1 lg:block"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="input-field w-full py-2 pl-10 pr-4"
                aria-label="Rechercher un produit"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary lg:hidden"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User Icon */}
            <Link
              href="/compte"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
              aria-label="Mon compte"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart Icon */}
            <Link
              href="/panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
              aria-label="Panier"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary lg:hidden"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 pb-3 pt-2 lg:hidden">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="input-field w-full py-2.5 pl-10 pr-4"
                  aria-label="Rechercher un produit"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <nav className="container-page py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/compte"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
              >
                <User className="h-5 w-5" />
                Mon compte
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
