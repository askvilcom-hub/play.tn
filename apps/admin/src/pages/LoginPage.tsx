import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Page de connexion pour le panneau d'administration play.tn.
 */
export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Aucun compte ne correspond a cet email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez reessayer plus tard.',
        'auth/invalid-credential': 'Identifiants invalides.',
      };
      setError(errorMap[code] || 'Erreur de connexion. Veuillez reessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ backgroundColor: '#f0f2f5' }}
    >
      <div className="card shadow-sm border-0" style={{ maxWidth: 420, width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          {/* Logo / Branding */}
          <div className="text-center mb-4">
            <h1 className="fw-bold mb-1">
              play<span className="text-warning">.tn</span>
            </h1>
            <p className="text-muted small">Panneau d'administration</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-medium">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="admin@play.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={submitting}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label small fw-medium">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-medium"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              &copy; 2026 play.tn - Tous droits reserves
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
