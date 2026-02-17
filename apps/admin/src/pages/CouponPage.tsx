import { useState } from 'react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const mockCoupons: Coupon[] = [
  { id: '1', code: 'BIENVENUE10', type: 'percentage', value: 10, minOrderAmount: 50, usageLimit: 1000, usageCount: 234, startDate: '2025-01-01', endDate: '2025-12-31', isActive: true },
  { id: '2', code: 'GAMING20', type: 'percentage', value: 20, minOrderAmount: 100, usageLimit: 500, usageCount: 89, startDate: '2025-03-01', endDate: '2025-06-30', isActive: true },
  { id: '3', code: 'LIVRAISON', type: 'fixed', value: 7, minOrderAmount: 30, usageLimit: 2000, usageCount: 567, startDate: '2025-01-01', endDate: '2025-12-31', isActive: true },
  { id: '4', code: 'ETE2025', type: 'percentage', value: 15, minOrderAmount: 80, usageLimit: 300, usageCount: 300, startDate: '2025-06-01', endDate: '2025-08-31', isActive: false },
];

export default function CouponPage() {
  const [coupons] = useState<Coupon[]>(mockCoupons);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Coupons</h1>
          <p className="text-muted mb-0">Gérer les codes promotionnels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          Créer un coupon
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Réduction</th>
                <th>Min. commande</th>
                <th>Utilisation</th>
                <th>Période</th>
                <th>Statut</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <code className="fs-6">{coupon.code}</code>
                  </td>
                  <td>
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%`
                      : `${coupon.value.toFixed(2)} TND`}
                  </td>
                  <td>{coupon.minOrderAmount.toFixed(2)} TND</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 6, width: 80 }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {coupon.usageCount}/{coupon.usageLimit}
                      </small>
                    </div>
                  </td>
                  <td>
                    <small>
                      {new Date(coupon.startDate).toLocaleDateString('fr-TN')} –{' '}
                      {new Date(coupon.endDate).toLocaleDateString('fr-TN')}
                    </small>
                  </td>
                  <td>
                    <span className={`badge bg-${coupon.isActive ? 'success' : 'secondary'}`}>
                      {coupon.isActive ? 'Actif' : 'Expiré'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1">
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

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau coupon</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Code</label>
                  <input type="text" className="form-control" placeholder="ex: PROMO2025" />
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label">Type</label>
                    <select className="form-select">
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (TND)</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Valeur</label>
                    <input type="number" className="form-control" placeholder="10" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label">Commande minimum (TND)</label>
                    <input type="number" className="form-control" placeholder="50" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Limite d'utilisation</label>
                    <input type="number" className="form-control" placeholder="500" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label">Date début</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Date fin</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
