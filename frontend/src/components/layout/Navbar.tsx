import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAuthModal: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onOpenAdminModal,
  onOpenAuthModal,
  selectedCategory,
  onSelectCategory,
}) => {
  const { account, user, disconnectWallet, isConnecting } = useWeb3();
  const { theme, toggleTheme } = useTheme();

  const categories = ['All', 'Medical', 'Education', 'Emergency', 'General'];
  const userRole = user?.role || 'donor';

  const getRoleBadge = () => {
    switch (userRole) {
      case 'user':
        return <span className="brutal-badge badge-lime"><i className="bi bi-person-workspace me-1"></i> Recipient</span>;
      case 'admin':
        return <span className="brutal-badge badge-yellow"><i className="bi bi-shield-check text-primary me-1"></i> Admin</span>;
      default:
        return <span className="brutal-badge badge-cyan"><i className="bi bi-heart-fill text-danger me-1"></i> Donor</span>;
    }
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    if (account) {
      return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    }
    return 'Guest User';
  };

  return (
    <nav className="navbar navbar-expand-lg py-3 px-lg-5 px-3">
      <div className="container-fluid">
        {/* LEFT: Category Selector */}
        <div className="d-flex align-items-center gap-3 order-lg-1 order-2">
          <div className="dropdown hover-dropdown">
            <button
              className="btn brutal-btn dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Category: {selectedCategory}
            </button>

            <ul className="dropdown-menu p-3 brutal-dropdown">
              <li className="dropdown-header fs-6 fw-bold text-dark">Filter Campaigns</li>
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    className={`dropdown-item ${selectedCategory === cat ? 'fw-bold' : ''}`}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCategory(cat);
                    }}
                  >
                    {cat === 'All' ? 'All Categories' : cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CENTER: Logo */}
        <a
          className="navbar-brand mx-auto fw-bold fs-2 text-uppercase logo order-lg-2 order-1"
          href="#"
        >
          fundTogether
        </a>

        {/* RIGHT: Actions & User Session */}
        <div className="d-flex align-items-center gap-2 order-lg-3 order-3">
          {/* Start Campaign Button */}
          <button
            className="btn brutal-btn brutal-btn-lime"
            onClick={onOpenCreateModal}
          >
            <i className="bi bi-plus-circle-fill me-1"></i> Start Campaign
          </button>

          {/* Admin Audit Button (Highlighted for Admin role) */}
          <button
            className={`btn brutal-btn ${userRole === 'admin' ? 'brutal-btn-yellow' : ''}`}
            onClick={onOpenAdminModal}
            title="Admin Verification Audit"
          >
            <i className="bi bi-shield-check text-primary me-1"></i> Admin Audit
          </button>

          {/* Theme Toggle */}
          <button
            className="btn brutal-btn theme-toggle"
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <i className="bi bi-sun-fill text-warning"></i>
            ) : (
              <i className="bi bi-moon-stars-fill"></i>
            )}
          </button>

          {/* User Sign In / Signed In Profile & Logout Bar */}
          {user && account ? (
            <div className="d-flex align-items-center gap-2 border border-2 border-dark p-1 bg-white">
              <button
                onClick={onOpenAuthModal}
                className="btn border-0 bg-transparent p-0 d-flex align-items-center gap-2"
                title="Click to Switch Portal Role"
              >
                {getRoleBadge()}
                <span className="fw-bold small text-dark me-1">{getUserDisplayName()}</span>
              </button>

              <button
                className="btn brutal-btn brutal-btn-magenta btn-sm"
                onClick={disconnectWallet}
                title="Sign Out of Session"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Sign Out
              </button>
            </div>
          ) : (
            <button
              className="btn brutal-btn brutal-btn-cyan fw-bold"
              onClick={onOpenAuthModal}
              disabled={isConnecting}
            >
              <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
