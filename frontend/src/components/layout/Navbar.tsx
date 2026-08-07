import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onOpenAuthModal,
  selectedCategory,
  onSelectCategory,
}) => {
  const { account, user, disconnectWallet } = useWeb3();
  const { theme, toggleTheme } = useTheme();

  const categories = ['All', 'Medical', 'Education', 'Emergency', 'General'];
  const isRecipient = user?.role === 'recipient' || user?.role === 'user';
  const isDonor = user?.role === 'donor';

  const getRoleBadge = () => {
    if (isRecipient) {
      return <span className="brutal-badge badge-lime"><i className="bi bi-person-workspace me-1"></i>Recipient</span>;
    }
    return <span className="brutal-badge badge-cyan"><i className="bi bi-heart-fill text-danger me-1"></i>Donor</span>;
  };

  const getUserDisplayName = () => {
    if (user?.email) return user.email.split('@')[0];
    if (account) return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    return 'User';
  };

  const scrollToCampaigns = () => {
    const el = document.getElementById('campaignsSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* LOGO */}
        <a className="navbar-brand logo" href="#">
          fundTogether
        </a>

        {/* MOBILE: Right-side theme + sign-in before toggler */}
        <div className="d-flex align-items-center gap-2 d-lg-none ms-auto me-2">
          <button className="btn brutal-btn theme-toggle p-1" onClick={toggleTheme} title="Toggle Theme" style={{ padding: '0.4rem 0.6rem' }}>
            {theme === 'dark' ? <i className="bi bi-sun-fill text-warning"></i> : <i className="bi bi-moon-stars-fill"></i>}
          </button>

          {user ? (
            <button className="btn brutal-btn brutal-btn-magenta btn-sm" onClick={disconnectWallet} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <i className="bi bi-box-arrow-right"></i> Out
            </button>
          ) : (
            <button className="btn brutal-btn brutal-btn-cyan btn-sm" onClick={onOpenAuthModal} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </button>
          )}
        </div>

        {/* HAMBURGER TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* COLLAPSIBLE MENU */}
        <div className="collapse navbar-collapse" id="navbarMenu">
          {/* LEFT: Category Dropdown */}
          <div className="d-flex align-items-center mt-3 mt-lg-0">
            <div className="dropdown hover-dropdown">
              <button
                className="btn brutal-btn dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-funnel me-1"></i> {selectedCategory}
              </button>
              <ul className="dropdown-menu p-2 brutal-dropdown">
                <li className="dropdown-header fw-bold text-dark small">Filter Campaigns</li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <a
                      className={`dropdown-item ${selectedCategory === cat ? 'fw-bold' : ''}`}
                      href="#"
                      onClick={(e) => { e.preventDefault(); onSelectCategory(cat); }}
                    >
                      {cat === 'All' ? 'All Categories' : cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="d-flex align-items-center gap-2 ms-auto mt-3 mt-lg-0 flex-wrap">
            {/* Recipient Action: Start Campaign */}
            {isRecipient && (
              <button className="btn brutal-btn brutal-btn-lime" onClick={onOpenCreateModal}>
                <i className="bi bi-plus-circle-fill"></i>
                <span className="d-none d-sm-inline">Start Campaign</span>
                <span className="d-sm-none">New</span>
              </button>
            )}

            {/* Donor Action: Browse Verified Campaigns */}
            {isDonor && (
              <button className="btn brutal-btn brutal-btn-cyan" onClick={scrollToCampaigns}>
                <i className="bi bi-heart-fill text-danger me-1"></i>
                <span>Explore Campaigns</span>
              </button>
            )}

            {/* Unauthenticated Visitor Actions */}
            {!user && (
              <button className="btn brutal-btn brutal-btn-lime" onClick={onOpenCreateModal}>
                <i className="bi bi-plus-circle-fill"></i>
                <span>Start Campaign</span>
              </button>
            )}

            {/* Theme Toggle — Desktop only */}
            <button
              className="btn brutal-btn theme-toggle d-none d-lg-inline-flex"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <i className="bi bi-sun-fill text-warning"></i> : <i className="bi bi-moon-stars-fill"></i>}
            </button>

            {/* User Session — Desktop only */}
            {user ? (
              <div className="d-none d-lg-flex align-items-center gap-2 border border-2 border-dark p-1 bg-white">
                <button
                  onClick={onOpenAuthModal}
                  className="btn border-0 bg-transparent p-0 d-flex align-items-center gap-2"
                  title="View Account Status"
                >
                  {getRoleBadge()}
                  <span className="fw-bold small text-dark">{getUserDisplayName()}</span>
                </button>
                <button className="btn brutal-btn brutal-btn-magenta btn-sm" onClick={disconnectWallet}>
                  <i className="bi bi-box-arrow-right me-1"></i> Sign Out
                </button>
              </div>
            ) : (
              <button
                className="btn brutal-btn brutal-btn-cyan fw-bold d-none d-lg-inline-flex"
                onClick={onOpenAuthModal}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
              </button>
            )}

            {/* Mobile: Show role info when logged in inside collapse */}
            {user && (
              <div className="d-flex d-lg-none align-items-center gap-2 w-100 mt-2 border border-2 border-dark p-2 bg-white">
                {getRoleBadge()}
                <span className="fw-bold small text-dark flex-fill">{getUserDisplayName()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
