import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: isEdit ? 'Guide d\'achat : Les meilleures manettes PS5 en 2025' : '',
    slug: isEdit ? 'guide-manettes-ps5-2025' : '',
    category: isEdit ? 'Guides' : '',
    status: isEdit ? 'published' : 'draft',
    excerpt: isEdit ? 'Découvrez notre sélection des meilleures manettes PS5 disponibles en Tunisie.' : '',
    content: isEdit ? 'Contenu de l\'article...' : '',
    seoTitle: '',
    seoDescription: '',
    featuredImage: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'title' && !isEdit) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save via API
    navigate('/blog');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            {isEdit ? 'Modifier l\'article' : 'Nouvel article'}
          </h1>
          <p className="text-muted mb-0">
            {isEdit ? 'Modifier le contenu de l\'article' : 'Créer un nouvel article de blog'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/blog')}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? 'Enregistrer' : 'Publier'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Titre</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Titre de l'article"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Slug</label>
                  <div className="input-group">
                    <span className="input-group-text">/blog/</span>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Extrait</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => handleChange('excerpt', e.target.value)}
                    placeholder="Court résumé de l'article..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contenu</label>
                  <textarea
                    className="form-control"
                    rows={15}
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Rédigez votre article ici..."
                  />
                  <small className="text-muted">Markdown supporté</small>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">SEO</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Titre SEO</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.seoTitle}
                    onChange={(e) => handleChange('seoTitle', e.target.value)}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description SEO</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => handleChange('seoDescription', e.target.value)}
                    placeholder="Description pour les moteurs de recherche"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Publication</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Catégorie</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Guides">Guides</option>
                    <option value="Tops">Tops</option>
                    <option value="Actualités">Actualités</option>
                    <option value="Tutoriels">Tutoriels</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Image mise en avant</h6>
              </div>
              <div className="card-body">
                <div className="border rounded p-4 text-center bg-light">
                  <i className="bi bi-image fs-1 text-muted"></i>
                  <p className="text-muted mt-2 mb-2">Glissez une image ou</p>
                  <button type="button" className="btn btn-sm btn-outline-primary">
                    Choisir un fichier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
