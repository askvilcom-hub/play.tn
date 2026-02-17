import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'shipping', label: 'Livraison' },
    { id: 'payment', label: 'Paiement' },
    { id: 'seo', label: 'SEO' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 mb-1">Paramètres</h1>
        <p className="text-muted mb-0">Configuration de la boutique</p>
      </div>

      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="list-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`list-group-item list-group-item-action ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-lg-9">
          {activeTab === 'general' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Informations générales</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Nom de la boutique</label>
                  <input type="text" className="form-control" defaultValue="Play.tn" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email de contact</label>
                  <input type="email" className="form-control" defaultValue="contact@play.tn" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" className="form-control" defaultValue="+216 XX XXX XXX" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Adresse</label>
                  <textarea className="form-control" rows={2} defaultValue="Tunis, Tunisie" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Devise</label>
                  <select className="form-select" defaultValue="TND">
                    <option value="TND">Dinar Tunisien (TND)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <button className="btn btn-primary">Enregistrer</button>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Zones de livraison</h5>
                <button className="btn btn-sm btn-primary">Ajouter une zone</button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Frais</th>
                        <th>Délai</th>
                        <th>Gratuit à partir de</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Grand Tunis</td>
                        <td>7.00 TND</td>
                        <td>24h</td>
                        <td>100 TND</td>
                        <td><button className="btn btn-sm btn-outline-primary">Modifier</button></td>
                      </tr>
                      <tr>
                        <td>Nord (Bizerte, Béja, Jendouba...)</td>
                        <td>9.00 TND</td>
                        <td>24-48h</td>
                        <td>150 TND</td>
                        <td><button className="btn btn-sm btn-outline-primary">Modifier</button></td>
                      </tr>
                      <tr>
                        <td>Centre (Sousse, Monastir, Sfax...)</td>
                        <td>9.00 TND</td>
                        <td>24-48h</td>
                        <td>150 TND</td>
                        <td><button className="btn btn-sm btn-outline-primary">Modifier</button></td>
                      </tr>
                      <tr>
                        <td>Sud (Gabès, Médenine, Tozeur...)</td>
                        <td>12.00 TND</td>
                        <td>48-72h</td>
                        <td>200 TND</td>
                        <td><button className="btn btn-sm btn-outline-primary">Modifier</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Méthodes de paiement</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 rounded p-2">
                      <i className="bi bi-credit-card fs-4 text-primary"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Stripe</h6>
                      <small className="text-muted">Carte bancaire internationale</small>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 rounded p-2">
                      <i className="bi bi-cash fs-4 text-success"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Paiement à la livraison</h6>
                      <small className="text-muted">Paiement en espèces à la réception</small>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info bg-opacity-10 rounded p-2">
                      <i className="bi bi-bank fs-4 text-info"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Virement bancaire</h6>
                      <small className="text-muted">Transfert direct vers le compte bancaire</small>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Paramètres SEO</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Titre du site</label>
                  <input type="text" className="form-control" defaultValue="Play.tn | Jeux, Jouets & Gaming en Tunisie" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Meta description</label>
                  <textarea className="form-control" rows={3} defaultValue="Votre boutique en ligne de jeux, jouets et accessoires gaming en Tunisie. Livraison rapide partout en Tunisie." />
                </div>
                <div className="mb-3">
                  <label className="form-label">Google Site Verification</label>
                  <input type="text" className="form-control" placeholder="Code de vérification Google" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Google Analytics ID</label>
                  <input type="text" className="form-control" placeholder="G-XXXXXXXXXX" />
                </div>
                <button className="btn btn-primary">Enregistrer</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Notifications email</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6>Notifications administrateur</h6>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked id="notif-new-order" />
                    <label className="form-check-label" htmlFor="notif-new-order">Nouvelle commande</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked id="notif-low-stock" />
                    <label className="form-check-label" htmlFor="notif-low-stock">Stock faible</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked id="notif-new-review" />
                    <label className="form-check-label" htmlFor="notif-new-review">Nouvel avis client</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" id="notif-new-user" />
                    <label className="form-check-label" htmlFor="notif-new-user">Nouvelle inscription</label>
                  </div>
                </div>
                <div className="mb-3">
                  <h6>Notifications client</h6>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked id="notif-order-confirm" />
                    <label className="form-check-label" htmlFor="notif-order-confirm">Confirmation de commande</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked id="notif-shipping" />
                    <label className="form-check-label" htmlFor="notif-shipping">Notification d'expédition</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" defaultChecked id="notif-delivery" />
                    <label className="form-check-label" htmlFor="notif-delivery">Confirmation de livraison</label>
                  </div>
                </div>
                <button className="btn btn-primary">Enregistrer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
