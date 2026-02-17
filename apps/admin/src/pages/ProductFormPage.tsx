import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';

/**
 * Formulaire de creation / edition d'un produit.
 * Utilise pour les routes /products/new et /products/:id.
 */

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  brand: string;
  stock: string;
  sku: string;
  status: string;
  featured: boolean;
  images: string[];
}

const emptyForm: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: '',
  brand: '',
  stock: '',
  sku: '',
  status: 'draft',
  featured: false,
  images: [],
};

const categories = [
  'Accessoires',
  'Audio',
  'Peripheriques',
  'Ecrans',
  'PC Gaming',
  'Consoles',
  'Composants',
  'Reseaux',
];

const brands = [
  'Sony',
  'HyperX',
  'Razer',
  'Logitech',
  'Samsung',
  'SteelSeries',
  'Corsair',
  'ASUS',
  'MSI',
];

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // TODO: Fetcher le produit depuis l'API admin
      setLoading(true);
      const timer = setTimeout(() => {
        setForm({
          name: 'Manette PS5 DualSense',
          slug: 'manette-ps5-dualsense',
          description:
            'Manette sans fil officielle Sony pour PlayStation 5. Retour haptique avance et gatettes adaptatives pour une immersion totale.',
          price: '189.90',
          compareAtPrice: '219.00',
          category: 'Accessoires',
          brand: 'Sony',
          stock: '45',
          sku: 'SONY-PS5-CTRL-001',
          status: 'active',
          featured: true,
          images: ['https://via.placeholder.com/200x200?text=PS5+Controller'],
        });
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateSlug = () => {
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm((prev) => ({ ...prev, slug }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // TODO: Envoyer les donnees a l'API admin
    console.log(isEditing ? 'Mise a jour produit:' : 'Creation produit:', form);

    setTimeout(() => {
      setSaving(false);
      navigate('/products');
    }, 800);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tete */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link
            to="/products"
            className="btn btn-link text-dark p-0 me-3"
            title="Retour"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h4 className="fw-bold mb-0">
              {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
            </h4>
            {isEditing && (
              <small className="text-muted">ID: {id}</small>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Colonne principale */}
          <div className="col-lg-8">
            {/* Informations generales */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0">Informations generales</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label small fw-medium">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={() => !form.slug && generateSlug()}
                    placeholder="Ex: Manette PS5 DualSense"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="slug" className="form-label small fw-medium">
                    Slug (URL)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text small">play.tn/produit/</span>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      className="form-control"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="manette-ps5-dualsense"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={generateSlug}
                    >
                      Generer
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="description"
                    className="form-label small fw-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Decrivez le produit en detail..."
                  />
                </div>
              </div>
            </div>

            {/* Prix et inventaire */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0">Prix et inventaire</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label
                      htmlFor="price"
                      className="form-label small fw-medium"
                    >
                      Prix (TND) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      className="form-control"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      htmlFor="compareAtPrice"
                      className="form-label small fw-medium"
                    >
                      Ancien prix (TND)
                    </label>
                    <input
                      type="number"
                      id="compareAtPrice"
                      name="compareAtPrice"
                      className="form-control"
                      value={form.compareAtPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      htmlFor="stock"
                      className="form-label small fw-medium"
                    >
                      Stock
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      className="form-control"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label
                      htmlFor="sku"
                      className="form-label small fw-medium"
                    >
                      SKU / Reference
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      className="form-control"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="Ex: SONY-PS5-CTRL-001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0">Images</h6>
              </div>
              <div className="card-body">
                {/* Images existantes */}
                {form.images.length > 0 && (
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {form.images.map((url, index) => (
                      <div
                        key={index}
                        className="position-relative border rounded"
                        style={{ width: 100, height: 100 }}
                      >
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-100 h-100 rounded"
                          style={{ objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0"
                          style={{ width: 22, height: 22, lineHeight: 1 }}
                          onClick={() => removeImage(index)}
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zone d'upload */}
                <div className="border border-2 border-dashed rounded p-4 text-center">
                  <FiUpload size={32} className="text-muted mb-2" />
                  <p className="small text-muted mb-1">
                    Glissez vos images ici ou cliquez pour parcourir
                  </p>
                  <p className="smaller text-muted mb-2">
                    JPEG, PNG, WebP - Max 5 Mo par fichier
                  </p>
                  <input
                    type="file"
                    className="d-none"
                    id="imageUpload"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Parcourir
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne laterale */}
          <div className="col-lg-4">
            {/* Statut */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0">Publication</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label
                    htmlFor="status"
                    className="form-label small fw-medium"
                  >
                    Statut
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="active">Actif</option>
                    <option value="out_of_stock">Rupture de stock</option>
                  </select>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor="featured"
                  >
                    Produit mis en avant
                  </label>
                </div>
              </div>
            </div>

            {/* Organisation */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0">Organisation</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label
                    htmlFor="category"
                    className="form-label small fw-medium"
                  >
                    Categorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Selectionner une categorie</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="brand"
                    className="form-label small fw-medium"
                  >
                    Marque
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    className="form-select"
                    value={form.brand}
                    onChange={handleChange}
                  >
                    <option value="">Selectionner une marque</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FiSave size={16} className="me-2" />
                    {isEditing ? 'Mettre a jour' : 'Creer le produit'}
                  </>
                )}
              </button>
              <Link to="/products" className="btn btn-outline-secondary">
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
