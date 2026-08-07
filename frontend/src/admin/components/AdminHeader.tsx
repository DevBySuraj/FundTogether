import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Menu, Bell, Search, ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { adminUser } = useAdminAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Analytics Dashboard';
    if (path.includes('/admin/pending')) return 'Pending Verifications';
    if (path.includes('/admin/history')) return 'Verification History Log';
    if (path.includes('/admin/reports')) return 'Audit & Compliance Reports';
    if (path.includes('/admin/notifications')) return 'System Notifications';
    if (path.includes('/admin/profile')) return 'Admin Profile Settings';
    if (path.includes('/admin/campaign/')) return 'Campaign Audit Details';
    return 'Admin Console';
  };

  const initial = adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="admin-header">
      <div className="d-flex align-items-center gap-3">
        <button className="btn p-1 text-white d-lg-none" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>

        <div>
          <h5 className="fw-bold mb-0 text-white" style={{ letterSpacing: '-0.5px' }}>
            {getPageTitle()}
          </h5>
          <small className="admin-subtext">
            Real-time Verification &amp; Security Auditing
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Quick Search */}
        <div className="d-none d-md-block position-relative" style={{ width: '240px' }}>
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="form-control admin-input ps-5"
            placeholder="Search campaigns, ID..."
          />
        </div>

        {/* Notifications */}
        <Link to="/admin/notifications" className="position-relative text-white-50 p-2 rounded">
          <Bell size={20} color="var(--admin-text-muted)" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            2
          </span>
        </Link>

        {/* System Health */}
        <div className="d-none d-sm-flex align-items-center gap-2 px-3 py-1 rounded-pill admin-health-badge">
          <div className="admin-health-dot"></div>
          <span className="admin-health-text">SYSTEM ACTIVE</span>
        </div>

        {/* Admin Avatar */}
        <Link to="/admin/profile" className="d-flex align-items-center gap-2 text-decoration-none">
          <div className="admin-avatar-md">
            {adminUser?.name ? initial : <ShieldCheck size={18} />}
          </div>
        </Link>
      </div>
    </header>
  );
};
