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
  const isRecipientMode = user?.role === 'user';

  return (
    <nav className="navbar navbar-expand-lg py-3 px-lg-5 px-3">
      <div className="container-fluid">
        {/* LEFT */}
        <div className="d-flex align-items-center gap-3 order-lg-1 order-2">
          {/* Category Dropdown */}
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

        {/* CENTER */}
        <a
          className="navbar-brand mx-auto fw-bold fs-2 text-uppercase logo order-lg-2 order-1"
          href="#"
        >
          fundTogether
        </a>

        {/* RIGHT */}
        <div className="d-flex align-items-center gap-3 order-lg-3 order-3">
          {/* Active Mode Indicator Badge */}
          <button
            onClick={onOpenAuthModal}
            className={`btn brutal-btn btn-sm ${isRecipientMode ? 'brutal-btn-lime' : 'brutal-btn-cyan'}`}
            title="Click to Switch Portal Role"
          >
            {isRecipientMode ? (
              <>
                <i className="bi bi-person-workspace me-1"></i> Recipient Portal
              </>
            ) : (
              <>
                <i className="bi bi-heart-fill text-danger me-1"></i> Donor Portal
              </>
            )}
          </button>

          {/* Create Campaign CTA */}
          <button
            className="btn brutal-btn brutal-btn-lime"
            onClick={onOpenCreateModal}
          >
            <i className="bi bi-plus-circle-fill"></i> Start Campaign
          </button>

          {/* Admin Audit Button */}
          <button
            className="btn brutal-btn"
            onClick={onOpenAdminModal}
            title="Admin Verification Audit"
          >
            <i className="bi bi-shield-check text-primary"></i> Admin Audit
          </button>

          {/* Theme Toggle */}
          <button
            className="btn brutal-btn theme-toggle"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <i className="bi bi-sun-fill text-warning"></i>
            ) : (
              <i className="bi bi-moon-stars-fill"></i>
            )}
          </button>

          {/* Connected User Account */}
          {account ? (
            <button
              className="btn brutal-btn brutal-btn-cyan"
              onClick={disconnectWallet}
              title="Click to Disconnect Session"
            >
              <i className="bi bi-check-circle-fill text-success"></i>{' '}
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </button>
          ) : (
            <button
              className="btn brutal-btn brutal-btn-cyan"
              onClick={onOpenAuthModal}
              disabled={isConnecting}
            >
              <i className="bi bi-person-fill"></i> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
