'use client';

import Link from 'next/link';
import { Package, Eye, ChevronRight } from 'lucide-react';

const statusStyles: Record<string, string> = {
  'Livree': 'bg-accent-100 text-accent-700',
  'En cours': 'bg-blue-100 text-blue-700',
  'Expediee': 'bg-purple-100 text-purple-700',
  'En preparation': 'bg-orange-100 text-orange-700',
  'Annulee': 'bg-red-100 text-red-700',
};

const mockOrders = [
  {
    id: 'CMD-2024-001587',
    date: '15 fevrier 2024',
    status: 'Livree',
    total: 259.8,
    items: 3,
    products: ['Manette PS5 DualSense', 'Cable HDMI 2.1'],
  },
  {
    id: 'CMD-2024-001432',
    date: '28 janvier 2024',
    status: 'En cours',
    total: 149.9,
    items: 1,
    products: ['LEGO Technic Voiture de Course'],
  },
  {
    id: 'CMD-2024-001298',
    date: '10 janvier 2024',
    status: 'Expediee',
    total: 329.7,
    items: 4,
    products: ['Casque Gaming HyperX Cloud III', 'Tapis de souris XXL'],
  },
  {
    id: 'CMD-2023-001156',
    date: '20 decembre 2023',
    status: 'Livree',
    total: 79.9,
    items: 1,
    products: ['Monopoly Tunisie Edition'],
  },
  {
    id: 'CMD-2023-001089',
    date: '5 decembre 2023',
    status: 'Annulee',
    total: 199.9,
    items: 2,
    products: ['Trottinette Freestyle Pro'],
  },
];

export default function CommandesPage() {
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
            <li>
              <Link href="/compte" className="hover:text-primary">
                Mon compte
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-gray-900">Mes commandes</li>
          </ol>
        </div>
      </nav>

      <section className="py-10 lg:py-16">
        <div className="container-page">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">Mes commandes</h1>
              <p className="text-sm text-gray-500">
                Retrouvez l&apos;historique de toutes vos commandes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="card p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {order.id}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-gray-500">
                      Commande du {order.date} &middot; {order.items} article
                      {order.items > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.products.join(', ')}
                      {order.items > order.products.length && '...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-900">
                      {order.total.toFixed(2)} TND
                    </span>
                    <Link
                      href={`/compte/commandes/${order.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                      Voir details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
