import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingBag,
  FiShoppingCart,
  FiUsers,
  FiFolder,
  FiTag,
  FiPercent,
  FiFileText,
  FiSettings,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { path: '/dashboard', icon: FiGrid, label: 'Tableau de bord' },
  { path: '/products', icon: FiShoppingBag, label: 'Produits' },
  { path: '/orders', icon: FiShoppingCart, label: 'Commandes' },
  { path: '/customers', icon: FiUsers, label: 'Clients' },
  { path: '/categories', icon: FiFolder, label: 'Catégories' },
  { path: '/coupons', icon: FiPercent, label: 'Coupons' },
  { path: '/blog', icon: FiFileText, label: 'Blog' },
  { path: '/settings', icon: FiSettings, label: 'Paramètres' },
  { path: '/audit-logs', icon: FiActivity, label: "Logs d'audit" },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={onMobileClose} />
      )}

      <aside
        className={`admin-sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3">
          {!collapsed && (
            <div className="d-flex align-items-center">
              <span className="sidebar-logo fw-bold fs-5 text-white">
                play<span className="text-warning">.tn</span>
              </span>
              <span className="badge bg-warning text-dark ms-2 small">Admin</span>
            </div>
          )}
          {collapsed && (
            <span className="sidebar-logo fw-bold fs-5 text-white mx-auto">
              P<span className="text-warning">.</span>
            </span>
          )}
          <button
            className="btn btn-link text-white-50 p-0 d-none d-lg-block"
            onClick={onToggle}
            title={collapsed ? 'Développer' : 'Réduire'}
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-grow-1 py-2">
          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link sidebar-link d-flex align-items-center ${isActive ? 'active' : ''}`
                  }
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="sidebar-icon" />
                  {!collapsed && <span className="ms-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer px-3 py-3 border-top border-secondary">
          {!collapsed && (
            <div className="text-white-50 small text-center">
              &copy; 2026 play.tn
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
