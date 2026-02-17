import { useState } from 'react';
import { FiSearch, FiMail, FiPhone, FiEye } from 'react-icons/fi';

/**
 * Page de liste des clients admin.
 * Affiche un tableau des clients avec recherche et informations de base.
 */

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'cust_001',
    name: 'Ahmed Ben Ali',
    email: 'ahmed.benali@email.com',
    phone: '+216 50 123 456',
    city: 'Tunis',
    ordersCount: 12,
    totalSpent: 3450.5,
    status: 'active',
    createdAt: '2025-06-15',
  },
  {
    id: 'cust_002',
    name: 'Fatma Trabelsi',
    email: 'fatma.trabelsi@email.com',
    phone: '+216 55 987 654',
    city: 'Sfax',
    ordersCount: 8,
    totalSpent: 2180.0,
    status: 'active',
    createdAt: '2025-08-20',
  },
  {
    id: 'cust_003',
    name: 'Youssef Khelifi',
    email: 'youssef.khelifi@email.com',
    phone: '+216 98 456 789',
    city: 'Sousse',
    ordersCount: 5,
    totalSpent: 1250.9,
    status: 'active',
    createdAt: '2025-09-10',
  },
  {
    id: 'cust_004',
    name: 'Mariem Jlassi',
    email: 'mariem.jlassi@email.com',
    phone: '+216 22 333 444',
    city: 'Monastir',
    ordersCount: 3,
    totalSpent: 789.0,
    status: 'active',
    createdAt: '2025-11-05',
  },
  {
    id: 'cust_005',
    name: 'Karim Bouazizi',
    email: 'karim.bouazizi@email.com',
    phone: '+216 97 111 222',
    city: 'Bizerte',
    ordersCount: 1,
    totalSpent: 189.9,
    status: 'inactive',
    createdAt: '2026-01-15',
  },
  {
    id: 'cust_006',
    name: 'Sarra Meddeb',
    email: 'sarra.meddeb@email.com',
    phone: '+216 53 666 777',
    city: 'Gabes',
    ordersCount: 15,
    totalSpent: 5670.0,
    status: 'active',
    createdAt: '2025-05-01',
  },
];

function formatCurrency(amount: number): string {
  return amount.toFixed(2) + ' TND';
}

export default function CustomerListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // TODO: Fetcher les clients depuis l'API admin
  let filtered = [...mockCustomers];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  return (
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Clients</h4>
          <p className="text-muted small mb-0">
            {filtered.length} client{filtered.length > 1 ? 's' : ''} inscrit
            {filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher par nom, email, telephone ou ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small fw-medium">Client</th>
                  <th className="small fw-medium">Ville</th>
                  <th className="small fw-medium">Commandes</th>
                  <th className="small fw-medium">Total depense</th>
                  <th className="small fw-medium">Statut</th>
                  <th className="small fw-medium">Inscription</th>
                  <th className="small fw-medium text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Aucun client trouve.
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3 fw-medium"
                            style={{ width: 40, height: 40, fontSize: 14 }}
                          >
                            {customer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="fw-medium small">
                              {customer.name}
                            </div>
                            <div className="text-muted smaller">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="small">{customer.city}</td>
                      <td className="small">{customer.ordersCount}</td>
                      <td className="small fw-medium">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            customer.status === 'active'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                        >
                          {customer.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(customer.createdAt).toLocaleDateString('fr-TN')}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            title="Voir le profil"
                          >
                            <FiEye size={14} />
                          </button>
                          <a
                            href={`mailto:${customer.email}`}
                            className="btn btn-outline-secondary"
                            title="Envoyer un email"
                          >
                            <FiMail size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
