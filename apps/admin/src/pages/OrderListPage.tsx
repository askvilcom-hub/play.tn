import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye, FiFilter } from 'react-icons/fi';

/**
 * Page de liste des commandes admin.
 * Affiche un tableau avec filtres par statut et recherche.
 */

interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  date: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-1042',
    customer: 'Ahmed Ben Ali',
    email: 'ahmed.benali@email.com',
    items: 2,
    total: 386.8,
    status: 'confirmed',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'paid',
    date: '2026-02-16T14:30:00Z',
  },
  {
    id: 'ORD-1041',
    customer: 'Fatma Trabelsi',
    email: 'fatma.trabelsi@email.com',
    items: 2,
    total: 608.0,
    status: 'shipped',
    paymentMethod: 'Paiement a la livraison',
    paymentStatus: 'pending',
    date: '2026-02-15T09:20:00Z',
  },
  {
    id: 'ORD-1040',
    customer: 'Youssef Khelifi',
    email: 'youssef.khelifi@email.com',
    items: 1,
    total: 196.9,
    status: 'delivered',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'paid',
    date: '2026-02-10T11:00:00Z',
  },
  {
    id: 'ORD-1039',
    customer: 'Mariem Jlassi',
    email: 'mariem.jlassi@email.com',
    items: 3,
    total: 529.0,
    status: 'delivered',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'paid',
    date: '2026-02-09T17:45:00Z',
  },
  {
    id: 'ORD-1038',
    customer: 'Karim Bouazizi',
    email: 'karim.bouazizi@email.com',
    items: 1,
    total: 189.9,
    status: 'cancelled',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'refunded',
    date: '2026-02-08T10:15:00Z',
  },
  {
    id: 'ORD-1037',
    customer: 'Sarra Meddeb',
    email: 'sarra.meddeb@email.com',
    items: 4,
    total: 1245.0,
    status: 'processing',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'paid',
    date: '2026-02-07T13:00:00Z',
  },
  {
    id: 'ORD-1036',
    customer: 'Mohamed Chaabane',
    email: 'mohamed.chaabane@email.com',
    items: 1,
    total: 899.0,
    status: 'pending',
    paymentMethod: 'Paiement a la livraison',
    paymentStatus: 'pending',
    date: '2026-02-06T20:30:00Z',
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-warning text-dark' },
  confirmed: { label: 'Confirmee', className: 'bg-info text-white' },
  processing: { label: 'En preparation', className: 'bg-primary' },
  shipped: { label: 'Expediee', className: 'bg-indigo' },
  delivered: { label: 'Livree', className: 'bg-success' },
  cancelled: { label: 'Annulee', className: 'bg-danger' },
  refunded: { label: 'Remboursee', className: 'bg-secondary' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paye', className: 'text-success' },
  pending: { label: 'En attente', className: 'text-warning' },
  refunded: { label: 'Rembourse', className: 'text-danger' },
};

function formatCurrency(amount: number): string {
  return amount.toFixed(2) + ' TND';
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

export default function OrderListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // TODO: Fetcher les commandes depuis l'API admin
  let filtered = [...mockOrders];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }

  return (
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Commandes</h4>
          <p className="text-muted small mb-0">
            {filtered.length} commande{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres rapides par statut */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setStatusFilter('')}
        >
          Toutes
        </button>
        {Object.entries(statusConfig).map(([key, val]) => (
          <button
            key={key}
            className={`btn btn-sm ${statusFilter === key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter(key)}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <FiSearch size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Rechercher par numero, client ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small fw-medium">Commande</th>
                  <th className="small fw-medium">Client</th>
                  <th className="small fw-medium">Articles</th>
                  <th className="small fw-medium">Total</th>
                  <th className="small fw-medium">Paiement</th>
                  <th className="small fw-medium">Statut</th>
                  <th className="small fw-medium">Date</th>
                  <th className="small fw-medium text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      Aucune commande trouvee.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const status = statusConfig[order.status] || {
                      label: order.status,
                      className: 'bg-secondary',
                    };
                    const payment = paymentStatusConfig[order.paymentStatus] || {
                      label: order.paymentStatus,
                      className: '',
                    };
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link
                            to={`/orders/${order.id}`}
                            className="fw-medium text-decoration-none"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td>
                          <div className="small fw-medium">{order.customer}</div>
                          <div className="text-muted smaller">{order.email}</div>
                        </td>
                        <td className="small">{order.items}</td>
                        <td className="small fw-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td>
                          <div className="small">{order.paymentMethod}</div>
                          <span className={`smaller fw-medium ${payment.className}`}>
                            {payment.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {formatDate(order.date)}
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/orders/${order.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Voir le detail"
                          >
                            <FiEye size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination placeholder */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            Affichage de 1-{filtered.length} sur {filtered.length}
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">Precedent</span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item disabled">
                <span className="page-link">Suivant</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
