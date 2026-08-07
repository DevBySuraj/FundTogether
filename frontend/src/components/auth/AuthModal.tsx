import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenAdminModal }) => {
  const { account, user, connectWalletWithRole, setRole, disconnectWallet, isConnecting } = useWeb3();
  const [activeTab, setActiveTab] = useState<'user' | 'donor' | 'admin'>(
    user?.role === 'admin' ? 'admin' : user?.role === 'user' ? 'user' : 'donor'
  );

  // Email / Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = (role: 'user' | 'donor' | 'admin') => {
    setActiveTab(role);
    setRole(role);

    // Pre-fill email for demo convenience
    if (role === 'user') setEmail('recipient@fundtogether.org');
    else if (role === 'donor') setEmail('donor@fundtogether.org');
    else if (role === 'admin') setEmail('admin@fundtogether.org');
    setPassword('demo12345');
  };

  const handleWalletSignIn = async (role: 'user' | 'donor' | 'admin') => {
    setActiveTab(role);
    await connectWalletWithRole(role);
    if (role === 'admin' && onOpenAdminModal) {
      onClose();
      onOpenAdminModal();
    } else {
      onClose();
    }
  };

  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(`Signed in successfully as ${activeTab.toUpperCase()} (${email})!`);

    connectWalletWithRole(activeTab);

    setTimeout(() => {
      onClose();
      if (activeTab === 'admin' && onOpenAdminModal) {
        onOpenAdminModal();
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal">
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <h4 className="modal-title fw-black text-uppercase mb-0">
                <i className="bi bi-shield-lock-fill text-primary me-2"></i> FundTogether Multi-Portal Sign In
              </h4>
              <small className="text-secondary fw-bold">Select your role: Recipient, Donor, or Platform Administrator</small>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* 3-Role Tabs */}
            <div className="row g-2 mb-4">
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('user')}
                  className={`btn brutal-btn w-100 py-3 fw-bold ${activeTab === 'user' ? 'brutal-btn-lime' : ''}`}
                >
                  <i className="bi bi-person-workspace d-block fs-4 mb-1"></i>
                  Recipient
                </button>
              </div>

              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('donor')}
                  className={`btn brutal-btn w-100 py-3 fw-bold ${activeTab === 'donor' ? 'brutal-btn-cyan' : ''}`}
                >
                  <i className="bi bi-heart-fill d-block fs-4 mb-1 text-danger"></i>
                  Donor
                </button>
              </div>

              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`btn brutal-btn w-100 py-3 fw-bold ${activeTab === 'admin' ? 'brutal-btn-yellow' : ''}`}
                >
                  <i className="bi bi-shield-check d-block fs-4 mb-1 text-primary"></i>
                  Admin
                </button>
              </div>
            </div>

            {/* Role Feature Descriptions */}
            {activeTab === 'user' && (
              <div className="brutal-card p-3 bg-light mb-4">
                <h6 className="fw-bold text-dark mb-1">
                  <i className="bi bi-person-workspace text-success me-2"></i> Campaign Recipient Portal
                </h6>
                <p className="small text-secondary mb-0">
                  Create medical/emergency fundraisers, upload hospital bill proofs for Google Gemini AI OCR analysis, and manage your recipient account.
                </p>
              </div>
            )}

            {activeTab === 'donor' && (
              <div className="brutal-card p-3 bg-light mb-4">
                <h6 className="fw-bold text-dark mb-1">
                  <i className="bi bi-heart-fill text-danger me-2"></i> Donor Portal
                </h6>
                <p className="small text-secondary mb-0">
                  Browse all verified campaigns, inspect Gemini AI authenticity scores & IPFS hashes, and make direct ₹ INR donations via UPI, Cards, or Web3 Wallet.
                </p>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="brutal-card p-3 bg-light mb-4">
                <h6 className="fw-bold text-dark mb-1">
                  <i className="bi bi-shield-lock-fill text-primary me-2"></i> Platform Administrator Audit Portal
                </h6>
                <p className="small text-secondary mb-0">
                  Review pending AI document audits, inspect OCR text extractions, override high-risk flags, and issue final approvals/rejections for published campaigns.
                </p>
              </div>
            )}

            {loginMessage && (
              <div className="alert alert-success fw-bold small mb-3 text-center">
                <i className="bi bi-check-circle-fill me-2"></i> {loginMessage}
              </div>
            )}

            {/* Already Signed In Status */}
            {account ? (
              <div className="text-center py-4 border border-3 border-dark bg-white">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                <h5 className="fw-bold mb-1">Currently Signed In</h5>
                <p className="font-monospace fw-bold text-primary mb-2">{account}</p>
                <span className="brutal-badge badge-lime mb-3 text-uppercase">
                  Role: {user?.role || activeTab}
                </span>

                <div className="d-flex gap-2 mt-3 px-4">
                  <button onClick={onClose} className="btn brutal-btn brutal-btn-lime flex-fill py-2 fw-bold">
                    Continue to Application
                  </button>
                  <button onClick={disconnectWallet} className="btn brutal-btn brutal-btn-magenta py-2 fw-bold">
                    Disconnect Session
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* 1. Quick Web3 / Wallet Sign In */}
                <button
                  type="button"
                  onClick={() => handleWalletSignIn(activeTab)}
                  disabled={isConnecting}
                  className={`btn brutal-btn w-100 py-3 fs-5 fw-bold text-uppercase mb-4 ${
                    activeTab === 'user'
                      ? 'brutal-btn-lime'
                      : activeTab === 'donor'
                      ? 'brutal-btn-cyan'
                      : 'brutal-btn-yellow'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Connecting Session...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-wallet2 me-2"></i> Fast Sign In as {activeTab.toUpperCase()}
                    </>
                  )}
                </button>

                <div className="text-center mb-4">
                  <span className="bg-light px-3 py-1 fw-bold border border-2 border-dark text-secondary small">
                    OR SIGN IN WITH EMAIL & PASSWORD
                  </span>
                </div>

                {/* 2. Email & Password Form */}
                <form onSubmit={handleEmailFormSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Email Address</label>
                    <input
                      type="email"
                      className="form-control fw-bold"
                      required
                      placeholder={
                        activeTab === 'user'
                          ? 'recipient@fundtogether.org'
                          : activeTab === 'donor'
                          ? 'donor@fundtogether.org'
                          : 'admin@fundtogether.org'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold small">Password</label>
                    <input
                      type="password"
                      className="form-control fw-bold"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn brutal-btn w-100 py-3 fw-bold fs-6 text-uppercase"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i> Submit {activeTab.toUpperCase()} Credentials
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
