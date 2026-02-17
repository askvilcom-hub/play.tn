import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingCart,
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';

/**
 * Page du tableau de bord admin.
 * Affiche les statistiques globales et les donnees recentes.
 */

interface DashboardStats {
  orders: { total: number; pending: number; trend: number };
  revenue: { total: number; thisMonth: number; trend: number };
  customers: { total: number; newThisMonth: number; trend: number };
  products: { total: number; active: number; outOfStock: number };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
}

// Donnees placeholder
const mockStats: DashboardStats = {
  orders: { total: 1042, pending: 12, trend: 8.3 },
  revenue: { total: 285430.5, thisMonth: 42350.0, trend: 10.9 },
  customers: { total: 3256, newThisMonth: 187, trend: 5.7 },
  products: { total: 156, active: 134, outOfStock: 12 },
  recentOrders: [
    { id: 'ORD-1042', customer: 'Ahmed Ben Ali', total: 386.8, status: 'confirmed', date: '2026-02-16T14:30:00Z' },
    { id: 'ORD-1041', customer: 'Fatma Trabelsi', total: 608.0, status: 'shipped', date: '2026-02-15T09:20:00Z' },
    { id: 'ORD-1040', customer: 'Youssef Khelifi', total: 196.9, status: 'delivered', date: '2026-02-10T11:00:00Z' },
    { id: 'ORD-1039', customer: 'Mariem Jlassi', total: 529.0, status: 'delivered', date: '2026-02-09T17:45:00Z' },
    { id: 'ORD-1038', customer: 'Karim Bouazizi', total: 189.9, status: 'cancelled', date: '2026-02-08T10:15:00Z' },
  ],
  topProducts: [
    { id: 'prod_001', name: 'Manette PS5 DualSense', sold: 234, revenue: 44467.6 },
    { id: 'prod_002', name: 'Casque HyperX Cloud III', sold: 156, revenue: 40404.0 },
    { id: 'prod_003', name: 'Clavier Razer BlackWidow V4', sold: 98, revenue: 34202.0 },
    { id: 'prod_004', name: 'Souris Logitech G Pro X', sold: 87, revenue: 21750.0 },
    { id: 'prod_005', name: 'Ecran Samsung Odyssey G5', sold: 62, revenue: 55800.0 },
  ],
};

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-warning text-dark',
  confirmed: 'bg-info text-white',
  processing: 'bg-primary text-white',
  shipped: 'bg-indigo text-white',
  delivered: 'bg-success text-white',
  cancelled: 'bg-danger text-white',
};

const statusLabel: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  processing: 'En preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetcher les stats depuis l'API admin
    // fetch('/api/admin/dashboard/stats').then(...)
    const timer = setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !stats) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Commandes',
      value: stats.orders.total.toLocaleString('fr-FR'),
      subtitle: `${stats.orders.pending} en attente`,
      trend: stats.orders.trend,
      icon: FiShoppingCart,
      color: 'primary',
    },
    {
      title: 'Chiffre d\'affaires',
      value: formatCurrency(stats.revenue.total),
      subtitle: `${formatCurrency(stats.revenue.thisMonth)} ce mois`,
      trend: stats.revenue.trend,
      icon: FiDollarSign,
      color: 'success',
    },
    {
      title: 'Clients',
      value: stats.customers.total.toLocaleString('fr-FR'),
      subtitle: `+${stats.customers.newThisMonth} ce mois`,
      trend: stats.customers.trend,
      icon: FiUsers,
      color: 'info',
    },
    {
      title: 'Produits',
      value: stats.products.total.toString(),
      subtitle: `${stats.products.outOfStock} en rupture`,
      trend: 0,
      icon: FiPackage,
      color: 'warning',
    },
  ];

  return (
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Tableau de bord</h4>
          <p className="text-muted small mb-0">
            Apercu de l'activite de votre boutique
          </p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">{card.title}</p>
                    <h4 className="fw-bold mb-1">{card.value}</h4>
                    <p className="text-muted small mb-0">{card.subtitle}</p>
                  </div>
                  <div
                    className={`rounded-3 p-2 bg-${card.color} bg-opacity-10`}
                  >
                    <card.icon size={24} className={`text-${card.color}`} />
                  </div>
                </div>
                {card.trend !== 0 && (
                  <div className="mt-2">
                    <span
                      className={`small fw-medium ${
                        card.trend > 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {card.trend > 0 ? (
                        <FiTrendingUp size={14} className="me-1" />
                      ) : (
                        <FiTrendingDown size={14} className="me-1" />
                      )}
                      {card.trend > 0 ? '+' : ''}
                      {card.trend}%
                    </span>
                    <span className="text-muted small ms-1">vs mois dernier</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Commandes recentes */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0">Commandes recentes</h6>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">
                Voir tout
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small fw-medium">Commande</th>
                      <th className="small fw-medium">Client</th>
                      <th className="small fw-medium">Total</th>
                      <th className="small fw-medium">Statut</th>
                      <th className="small fw-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            to={`/orders/${order.id}`}
                            className="fw-medium text-decoration-none"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td className="small">{order.customer}</td>
                        <td className="small fw-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              statusBadgeClass[order.status] || 'bg-secondary'
                            }`}
                          >
                            {statusLabel[order.status] || order.status}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {formatDate(order.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Produits les plus vendus */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0">Top produits</h6>
              <Link to="/products" className="btn btn-sm btn-outline-primary">
                Voir tout
              </Link>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {stats.topProducts.map((product, index) => (
                  <li
                    key={product.id}
                    className="list-group-item d-flex justify-content-between align-items-center py-3"
                  >
                    <div className="d-flex align-items-center">
                      <span className="badge bg-light text-dark me-3 fw-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="small fw-medium">{product.name}</div>
                        <div className="text-muted smaller">
                          {product.sold} vendus
                        </div>
                      </div>
                    </div>
                    <span className="small fw-medium text-success">
                      {formatCurrency(product.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Zone placeholder pour les graphiques */}
      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">Ventes mensuelles</h6>
            </div>
            <div
              className="card-body d-flex align-items-center justify-content-center"
              style={{ minHeight: 250 }}
            >
              {/* TODO: Integrer Chart.js via react-chartjs-2 */}
              <div className="text-center text-muted">
                <FiTrendingUp size={48} className="mb-2 opacity-25" />
                <p className="small">Graphique des ventes mensuelles</p>
                <p className="smaller text-muted">
                  TODO: Integrer react-chartjs-2
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">Commandes par statut</h6>
            </div>
            <div
              className="card-body d-flex align-items-center justify-content-center"
              style={{ minHeight: 250 }}
            >
              {/* TODO: Integrer Chart.js doughnut chart */}
              <div className="text-center text-muted">
                <FiShoppingCart size={48} className="mb-2 opacity-25" />
                <p className="small">Repartition des commandes</p>
                <p className="smaller text-muted">
                  TODO: Integrer react-chartjs-2
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
