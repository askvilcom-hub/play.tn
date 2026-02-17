import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

interface TopNavProps {
  onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'Nouvelle commande #1042', time: 'Il y a 5 min', unread: true },
    { id: 2, text: 'Stock faible: Manette PS5', time: 'Il y a 30 min', unread: true },
    { id: 3, text: 'Paiement confirmé #1041', time: 'Il y a 1h', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <nav className="admin-topnav navbar navbar-expand navbar-light bg-white border-bottom px-3 px-lg-4">
      <div className="d-flex align-items-center w-100">
        {/* Mobile menu toggle */}
        <button
          className="btn btn-link text-dark p-0 me-3 d-lg-none"
          onClick={onMenuToggle}
        >
          <FiMenu size={22} />
        </button>

        {/* Search bar */}
        <div className="input-group topnav-search d-none d-md-flex me-auto" style={{ maxWidth: 400 }}>
          <span className="input-group-text bg-light border-end-0">
            <FiSearch size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center ms-auto">
          {/* Notifications */}
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle
              as="button"
              className="btn btn-link text-dark position-relative p-0 topnav-icon-btn"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                  {unreadCount}
                </span>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm" style={{ minWidth: 320 }}>
              <div className="px-3 py-2 border-bottom">
                <strong className="small">Notifications</strong>
              </div>
              {notifications.map((n) => (
                <Dropdown.Item key={n.id} className="py-2">
                  <div className="d-flex align-items-start">
                    {n.unread && (
                      <span className="bg-primary rounded-circle me-2 mt-1" style={{ width: 8, height: 8, minWidth: 8, display: 'inline-block' }} />
                    )}
                    <div>
                      <div className="small">{n.text}</div>
                      <div className="text-muted smaller">{n.time}</div>
                    </div>
                  </div>
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item className="text-center small text-primary">
                Voir toutes les notifications
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* User dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="btn btn-link text-dark d-flex align-items-center p-0 topnav-icon-btn"
            >
              <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center me-2">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="d-none d-md-inline small fw-medium">
                {user?.displayName || 'Administrateur'}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm">
              <div className="px-3 py-2 border-bottom">
                <div className="fw-medium small">{user?.displayName || 'Administrateur'}</div>
                <div className="text-muted smaller">{user?.email}</div>
              </div>
              <Dropdown.Item onClick={() => navigate('/settings')}>
                <FiSettings size={14} className="me-2" />
                Paramètres
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FiLogOut size={14} className="me-2" />
                Déconnexion
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
