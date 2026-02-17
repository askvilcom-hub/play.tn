import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiPackage, FiUser, FiMapPin } from 'react-icons/fi';

/**
 * Page de detail d'une commande.
 * Affiche les informations completes et permet de mettre a jour le statut.
 */

interface OrderDetail {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image: string;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    governorate: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

const mockOrder: OrderDetail = {
  id: 'ORD-1042',
  customer: {
    id: 'cust_001',
    name: 'Ahmed Ben Ali',
    email: 'ahmed.benali@email.com',
    phone: '+216 50 123 456',
  },
  items: [
    {
      productId: 'prod_001',
      name: 'Manette PS5 DualSense',
      quantity: 2,
      price: 189.9,
      total: 379.8,
      image: 'https://via.placeholder.com/60x60?text=PS5',
    },
  ],
  subtotal: 379.8,
  shippingCost: 7.0,
  total: 386.8,
  status: 'confirmed',
  paymentMethod: 'Carte bancaire',
  paymentStatus: 'paid',
  shippingAddress: {
    street: '15 Rue de la Liberte',
    city: 'Tunis',
    governorate: 'Tunis',
    postalCode: '1000',
  },
  createdAt: '2026-02-16T14:30:00Z',
  updatedAt: '2026-02-16T15:00:00Z',
  notes: '',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-warning text-dark' },
  confirmed: { label: 'Confirmee', className: 'bg-info text-white' },
  processing: { label: 'En preparation', className: 'bg-primary' },
  shipped: { label: 'Expediee', className: 'bg-indigo' },
  delivered: { label: 'Livree', className: 'bg-success' },
  cancelled: { label: 'Annulee', className: 'bg-danger' },
};

const VALID_STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmee' },
  { value: 'processing', label: 'En preparation' },
  { value: 'shipped', label: 'Expediee' },
  { value: 'delivered', label: 'Livree' },
  { value: 'cancelled', label: 'Annulee' },
];

function formatCurrency(amount: number): string {
  return amount.toFixed(2) + ' TND';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // TODO: Fetcher la commande depuis l'API admin
    const timer = setTimeout(() => {
      setOrder({ ...mockOrder, id: id || mockOrder.id });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdatingStatus(true);

    // TODO: Appeler PATCH /api/admin/orders/:id/status
    console.log('Mise a jour du statut:', { id, status: newStatus, note: statusNote });

    setTimeout(() => {
      if (order) {
        setOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
      }
      setNewStatus('');
      setStatusNote('');
      setUpdatingStatus(false);
    }, 500);
  };

  if (loading || !order) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || {
    label: order.status,
    className: 'bg-secondary',
  };

  return (
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link to="/orders" className="btn btn-link text-dark p-0 me-3">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h4 className="fw-bold mb-0">Commande {order.id}</h4>
            <small className="text-muted">
              Creee le {formatDate(order.createdAt)}
            </small>
          </div>
        </div>
        <span className={`badge ${currentStatus.className} fs-6`}>
          {currentStatus.label}
        </span>
      </div>

      <div className="row g-4">
        {/* Colonne principale */}
        <div className="col-lg-8">
          {/* Articles */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">
                <FiPackage size={16} className="me-2" />
                Articles commandes
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small fw-medium">Produit</th>
                      <th className="small fw-medium text-center">Quantite</th>
                      <th className="small fw-medium text-end">Prix unitaire</th>
                      <th className="small fw-medium text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="rounded me-3"
                              width={50}
                              height={50}
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-medium small">{item.name}</div>
                              <div className="text-muted smaller">
                                ID: {item.productId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end small">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="text-end small fw-medium">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={3} className="text-end small">
                        Sous-total
                      </td>
                      <td className="text-end small">
                        {formatCurrency(order.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-end small">
                        Livraison
                      </td>
                      <td className="text-end small">
                        {order.shippingCost === 0
                          ? 'Gratuite'
                          : formatCurrency(order.shippingCost)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-end fw-bold">
                        Total
                      </td>
                      <td className="text-end fw-bold">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Mise a jour du statut */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">
                <FiTruck size={16} className="me-2" />
                Mettre a jour le statut
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-5">
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Selectionner un statut...</option>
                    {VALID_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Note (optionnel)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-primary w-100"
                    disabled={!newStatus || updatingStatus}
                    onClick={handleStatusUpdate}
                  >
                    {updatingStatus ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      'Valider'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne laterale */}
        <div className="col-lg-4">
          {/* Client */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">
                <FiUser size={16} className="me-2" />
                Client
              </h6>
            </div>
            <div className="card-body">
              <p className="fw-medium mb-1">{order.customer.name}</p>
              <p className="small text-muted mb-1">{order.customer.email}</p>
              <p className="small text-muted mb-0">{order.customer.phone}</p>
              <hr />
              <Link
                to={`/customers`}
                className="btn btn-sm btn-outline-primary"
              >
                Voir le profil client
              </Link>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">
                <FiMapPin size={16} className="me-2" />
                Adresse de livraison
              </h6>
            </div>
            <div className="card-body">
              <p className="small mb-1">{order.shippingAddress.street}</p>
              <p className="small mb-1">
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p className="small mb-0">{order.shippingAddress.governorate}</p>
            </div>
          </div>

          {/* Paiement */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">Paiement</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Methode</span>
                <span className="small fw-medium">{order.paymentMethod}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Statut</span>
                <span
                  className={`small fw-medium ${
                    order.paymentStatus === 'paid'
                      ? 'text-success'
                      : 'text-warning'
                  }`}
                >
                  {order.paymentStatus === 'paid' ? 'Paye' : 'En attente'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="small text-muted">Total</span>
                <span className="fw-bold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
