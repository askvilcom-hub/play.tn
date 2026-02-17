import { useState } from 'react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  author: string;
  category: string;
  publishedAt: string | null;
  views: number;
}

const mockPosts: BlogPost[] = [
  { id: '1', title: 'Guide d\'achat : Les meilleures manettes PS5 en 2025', slug: 'guide-manettes-ps5-2025', status: 'published', author: 'Admin', category: 'Guides', publishedAt: '2025-01-15', views: 1234 },
  { id: '2', title: 'Top 10 jeux de société pour les soirées en famille', slug: 'top-10-jeux-societe-famille', status: 'published', author: 'Admin', category: 'Tops', publishedAt: '2025-01-10', views: 892 },
  { id: '3', title: 'Les nouveautés LEGO pour le printemps 2025', slug: 'nouveautes-lego-printemps-2025', status: 'draft', author: 'Admin', category: 'Actualités', publishedAt: null, views: 0 },
  { id: '4', title: 'Comment choisir le bon casque gaming ?', slug: 'choisir-casque-gaming', status: 'published', author: 'Admin', category: 'Guides', publishedAt: '2025-02-01', views: 567 },
];

export default function BlogListPage() {
  const [posts] = useState<BlogPost[]>(mockPosts);
  const [search, setSearch] = useState('');

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Blog</h1>
          <p className="text-muted mb-0">Gérer les articles du blog</p>
        </div>
        <Link to="/blog/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          Nouvel article
        </Link>
      </div>

      <div className="card">
        <div className="card-body border-bottom">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un article..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select">
                <option value="">Toutes les catégories</option>
                <option value="guides">Guides</option>
                <option value="tops">Tops</option>
                <option value="actualites">Actualités</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select">
                <option value="">Tous les statuts</option>
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Vues</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link to={`/blog/${post.id}`} className="text-decoration-none fw-medium">
                      {post.title}
                    </Link>
                    <br />
                    <small className="text-muted">/{post.slug}</small>
                  </td>
                  <td>
                    <span className="badge bg-info bg-opacity-10 text-info">
                      {post.category}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${post.status === 'published' ? 'success' : 'warning'}`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('fr-TN')
                      : '—'}
                  </td>
                  <td>{post.views.toLocaleString()}</td>
                  <td>
                    <Link to={`/blog/${post.id}`} className="btn btn-sm btn-outline-primary me-1">
                      <i className="bi bi-pencil"></i>
                    </Link>
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
    </div>
  );
}
