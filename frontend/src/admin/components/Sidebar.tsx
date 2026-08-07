import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  History,
  BarChart3,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { logout, adminUser } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Pending Verifications', path: '/admin/pending', icon: ClipboardList },
    { label: 'Verification History', path: '/admin/history', icon: History },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Profile', path: '/admin/profile', icon: User },
  ];

  const initial = adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A';

  return (
    <aside className={isOpen ? 'admin-sidebar open' : 'admin-sidebar'}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="d-flex align-items-center gap-2">
          <div className="admin-brand-icon">
            <ShieldCheck size={22} color="#fff" />
          </div>
          <div>
            <span className="admin-brand-title admin-gradient-text">
              FundTogether
            </span>
            <span className="admin-brand-sub">
              ADMIN CONSOLE
            </span>
          </div>
        </div>

        <button className="btn p-1 text-white-50 d-lg-none" onClick={onToggle}>
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-pill">
          <div className="admin-avatar-sm">
            {initial}
          </div>
          <div className="flex-fill overflow-hidden">
            <div className="text-truncate fw-bold small text-white">{adminUser?.name || 'Administrator'}</div>
            <div className="text-truncate small text-muted-dim">
              {adminUser?.email || 'admin@fundtogether.org'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="admin-btn admin-btn-danger w-100 justify-content-center"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
