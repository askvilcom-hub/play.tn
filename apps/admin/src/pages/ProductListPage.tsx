import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

/**
 * Page de liste des produits admin.
 * Affiche un tableau avec recherche, filtres et actions CRUD.
 */

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock';
  image: string;
  createdAt: string;
}

const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Manette PS5 DualSense',
    category: 'Accessoires',
    brand: 'Sony',
    price: 189.9,
    stock: 45,
    status: 'active',
    image: 'https://via.placeholder.com/40x40?text=PS5',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod_002',
    name: 'Casque Gaming HyperX Cloud III',
    category: 'Audio',
    brand: 'HyperX',
    price: 259.0,
    stock: 23,
    status: 'active',
    image: 'https://via.placeholder.com/40x40?text=HX',
    createdAt: '2026-01-20',
  },
  {
    id: 'prod_003',
    name: 'Clavier Mecanique Razer BlackWidow V4',
    category: 'Peripheriques',
    brand: 'Razer',
    price: 349.0,
    stock: 0,
    status: 'out_of_stock',
    image: 'https://via.placeholder.com/40x40?text=RZ',
    createdAt: '2026-02-01',
  },
  {
    id: 'prod_004',
    name: 'Souris Logitech G Pro X Superlight',
    category: 'Peripheriques',
    brand: 'Logitech',
    price: 250.0,
    stock: 67,
    status: 'active',
    image: 'https://via.placeholder.com/40x40?text=LG',
    createdAt: '2026-01-25',
  },
  {
    id: 'prod_005',
    name: 'Ecran Samsung Odyssey G5 27"',
    category: 'Ecrans',
    brand: 'Samsung',
    price: 899.0,
    stock: 8,
    status: 'active',
    image: 'https://via.placeholder.com/40x40?text=SS',
    createdAt: '2026-02-05',
  },
  {
    id: 'prod_006',
    name: 'Tapis de Souris XXL RGB',
    category: 'Accessoires',
    brand: 'SteelSeries',
    price: 79.9,
    stock: 0,
    status: 'draft',
    image: 'https://via.placeholder.com/40x40?text=ST',
    createdAt: '2026-02-10',
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-success' },
  draft: { label: 'Brouillon', className: 'bg-secondary' },
  out_of_stock: { label: 'Rupture', className: 'bg-danger' },
};

function formatCurrency(amount: number): string {
  return amount.toFixed(2) + ' TND';
}

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // TODO: Fetcher les produits depuis l'API admin
  let filtered = [...mockProducts];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }

  if (categoryFilter) {
    filtered = filtered.filter((p) => p.category === categoryFilter);
  }

  const categories = [...new Set(mockProducts.map((p) => p.category))];

  const handleDelete = (id: string, name: string) => {
    // TODO: Appeler l'API de suppression
    if (window.confirm(`Supprimer le produit "${name}" ?`)) {
      console.log('Suppression du produit:', id);
    }
  };

  return (
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Produits</h4>
          <p className="text-muted small mb-0">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <FiPlus size={16} className="me-2" />
          Ajouter un produit
        </Link>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="out_of_stock">Rupture de stock</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Toutes les categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small fw-medium">Produit</th>
                  <th className="small fw-medium">Categorie</th>
                  <th className="small fw-medium">Prix</th>
                  <th className="small fw-medium">Stock</th>
                  <th className="small fw-medium">Statut</th>
                  <th className="small fw-medium text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      Aucun produit trouve.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const statusInfo = statusConfig[product.status] || {
                      label: product.status,
                      className: 'bg-secondary',
                    };
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="rounded me-3"
                              width={40}
                              height={40}
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-medium small">
                                {product.name}
                              </div>
                              <div className="text-muted smaller">
                                {product.brand} &middot; {product.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="small">{product.category}</td>
                        <td className="small fw-medium">
                          {formatCurrency(product.price)}
                        </td>
                        <td>
                          <span
                            className={`small ${
                              product.stock === 0
                                ? 'text-danger fw-medium'
                                : product.stock < 10
                                ? 'text-warning fw-medium'
                                : ''
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/products/${product.id}`}
                              className="btn btn-outline-secondary"
                              title="Voir / Modifier"
                            >
                              <FiEdit2 size={14} />
                            </Link>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
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
