import { useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  user: string;
  details: string;
  timestamp: string;
  ip: string;
}

const mockLogs: AuditLog[] = [
  { id: '1', action: 'CREATE', resource: 'product', resourceId: 'prod_001', user: 'admin@play.tn', details: 'Produit créé: Manette PS5 DualSense', timestamp: '2025-02-17T10:30:00Z', ip: '196.203.xxx.xxx' },
  { id: '2', action: 'UPDATE', resource: 'order', resourceId: 'ord_045', user: 'admin@play.tn', details: 'Statut commande changé: En préparation → Expédiée', timestamp: '2025-02-17T09:15:00Z', ip: '196.203.xxx.xxx' },
  { id: '3', action: 'DELETE', resource: 'coupon', resourceId: 'cpn_012', user: 'admin@play.tn', details: 'Coupon supprimé: ETE2024', timestamp: '2025-02-16T16:45:00Z', ip: '196.203.xxx.xxx' },
  { id: '4', action: 'UPDATE', resource: 'product', resourceId: 'prod_015', user: 'editor@play.tn', details: 'Prix modifié: 149.90 → 129.90 TND', timestamp: '2025-02-16T14:20:00Z', ip: '197.15.xxx.xxx' },
  { id: '5', action: 'CREATE', resource: 'category', resourceId: 'cat_009', user: 'admin@play.tn', details: 'Catégorie créée: Drones', timestamp: '2025-02-16T11:00:00Z', ip: '196.203.xxx.xxx' },
  { id: '6', action: 'LOGIN', resource: 'auth', resourceId: '', user: 'admin@play.tn', details: 'Connexion réussie', timestamp: '2025-02-16T08:30:00Z', ip: '196.203.xxx.xxx' },
  { id: '7', action: 'UPDATE', resource: 'settings', resourceId: 'general', user: 'admin@play.tn', details: 'Paramètres de livraison modifiés', timestamp: '2025-02-15T17:00:00Z', ip: '196.203.xxx.xxx' },
  { id: '8', action: 'CREATE', resource: 'blog', resourceId: 'blog_004', user: 'editor@play.tn', details: 'Article publié: Guide manettes PS5', timestamp: '2025-02-15T15:30:00Z', ip: '197.15.xxx.xxx' },
];

const actionColors: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'danger',
  LOGIN: 'info',
};

export default function AuditLogPage() {
  const [logs] = useState<AuditLog[]>(mockLogs);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const filtered = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (resourceFilter && log.resource !== resourceFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 mb-1">Journal d'audit</h1>
        <p className="text-muted mb-0">Historique des actions administratives</p>
      </div>

      <div className="card">
        <div className="card-body border-bottom">
          <div className="row g-3">
            <div className="col-md-3">
              <select
                className="form-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">Toutes les actions</option>
                <option value="CREATE">Création</option>
                <option value="UPDATE">Modification</option>
                <option value="DELETE">Suppression</option>
                <option value="LOGIN">Connexion</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
              >
                <option value="">Toutes les ressources</option>
                <option value="product">Produits</option>
                <option value="order">Commandes</option>
                <option value="category">Catégories</option>
                <option value="coupon">Coupons</option>
                <option value="blog">Blog</option>
                <option value="settings">Paramètres</option>
                <option value="auth">Authentification</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                placeholder="Filtrer par date"
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => { setActionFilter(''); setResourceFilter(''); }}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Ressource</th>
                <th>Détails</th>
                <th>Utilisateur</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <small>
                      {new Date(log.timestamp).toLocaleDateString('fr-TN')}{' '}
                      {new Date(log.timestamp).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </td>
                  <td>
                    <span className={`badge bg-${actionColors[log.action] || 'secondary'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="text-capitalize">{log.resource}</span>
                    {log.resourceId && (
                      <small className="text-muted ms-1">({log.resourceId})</small>
                    )}
                  </td>
                  <td>{log.details}</td>
                  <td><small>{log.user}</small></td>
                  <td><code className="small">{log.ip}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer text-muted text-center">
          Affichage de {filtered.length} entrées
        </div>
      </div>
    </div>
  );
}
