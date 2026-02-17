import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  isActive: boolean;
}

const mockCategories: Category[] = [
  { id: '1', name: 'Accessoires Gaming', slug: 'accessoires-gaming', parentId: null, productCount: 45, isActive: true },
  { id: '2', name: 'Jeux Vidéo', slug: 'jeux-video', parentId: null, productCount: 38, isActive: true },
  { id: '3', name: 'Jouets', slug: 'jouets', parentId: null, productCount: 62, isActive: true },
  { id: '4', name: 'Jeux de Société', slug: 'jeux-de-societe', parentId: null, productCount: 29, isActive: true },
  { id: '5', name: 'Jeux Éducatifs', slug: 'jeux-educatifs', parentId: null, productCount: 21, isActive: true },
  { id: '6', name: 'Sport & Plein Air', slug: 'sport-plein-air', parentId: null, productCount: 34, isActive: true },
  { id: '7', name: 'Figurines & Collectibles', slug: 'figurines-collectibles', parentId: null, productCount: 27, isActive: true },
  { id: '8', name: 'Puzzles', slug: 'puzzles', parentId: null, productCount: 18, isActive: true },
  { id: '9', name: 'Manettes', slug: 'manettes', parentId: '1', productCount: 12, isActive: true },
  { id: '10', name: 'Casques', slug: 'casques', parentId: '1', productCount: 15, isActive: true },
];

export default function CategoryPage() {
  const [categories] = useState<Category[]>(mockCategories);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '' });

  const handleEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormData({ name: cat.name, slug: cat.slug, parentId: cat.parentId || '' });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditCategory(null);
    setFormData({ name: '', slug: '', parentId: '' });
    setShowModal(true);
  };

  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Catégories</h1>
          <p className="text-muted mb-0">Gérer les catégories de produits</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter une catégorie
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nom</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Produits</th>
                <th>Statut</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="fw-medium">
                    {cat.parentId && <span className="text-muted me-2">└</span>}
                    {cat.name}
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td>
                    {cat.parentId
                      ? categories.find((c) => c.id === cat.parentId)?.name || '—'
                      : '—'}
                  </td>
                  <td>{cat.productCount}</td>
                  <td>
                    <span className={`badge bg-${cat.isActive ? 'success' : 'secondary'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleEdit(cat)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Catégorie parente</label>
                  <select
                    className="form-select"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  >
                    <option value="">Aucune (catégorie racine)</option>
                    {parentCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                  {editCategory ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
