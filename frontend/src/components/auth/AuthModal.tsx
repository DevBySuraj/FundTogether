import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useWeb3 } from '../../context/Web3Context';
import { authAPI } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { account, user, setUserSession, disconnectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState<'recipient' | 'donor'>(
    user?.role === 'recipient' || user?.role === 'user' ? 'recipient' : 'donor'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = (role: 'recipient' | 'donor') => {
    setActiveTab(role);
    setErrorMessage(null);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No Google OAuth credential received from Google button.');
      }

      // Send Google credential token + selected role choice to backend
      const res = await authAPI.googleLogin(credentialResponse.credential, activeTab);

      // Handle both API response formats seamlessly
      const token = res.data?.token || res.token;
      const loggedUser = res.data?.user || res.user;

      if (!token || !loggedUser) {
        throw new Error('Invalid authentication response from backend server.');
      }

      // Save real backend session & MongoDB user object (role is strictly enforced by DB)
      setUserSession(loggedUser, token);
      setLoginMessage(`Authenticated as ${loggedUser.name || loggedUser.email} (${loggedUser.role.toUpperCase()})`);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Google Auth backend error:', err);
      const msg = err.response?.data?.message || err.message || 'Google authentication failed on backend.';
      setErrorMessage(`Backend Authentication Error: ${msg}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal" style={{ maxWidth: '520px' }}>

          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <h4 className="modal-title fw-black text-uppercase mb-0">
                <i className="bi bi-shield-lock-fill text-primary me-2"></i> Sign In to FundTogether
              </h4>
              <small className="text-secondary fw-bold">Google OAuth 2.0 Direct Sign In</small>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* If user is ALREADY signed in, display immutable account status */}
            {user ? (
              <div className="text-center py-4 border border-3 border-dark bg-white">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                <h5 className="fw-bold mb-1">Signed In</h5>
                <p className="font-monospace fw-bold text-primary mb-2">
                  {user?.email || (account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Google Authenticated')}
                </p>
                <span className="brutal-badge badge-lime mb-3 text-uppercase">
                  Immutable Role: {user?.role}
                </span>

                <p className="small text-secondary px-3 mb-3">
                  Your role is permanently assigned in MongoDB. To change your role, please sign out and sign in with a different account.
                </p>

                <div className="d-flex gap-2 mt-3 px-4">
                  <button onClick={onClose} className="btn brutal-btn brutal-btn-lime flex-fill py-2 fw-bold">
                    Continue to Dashboard
                  </button>
                  <button onClick={disconnectWallet} className="btn brutal-btn brutal-btn-magenta py-2 fw-bold">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Google Sign-In for Unauthenticated Visitors */
              <>
                {/* 2-Role Tabs for Recipient & Donor initial choice */}
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('recipient')}
                      className={`btn brutal-btn w-100 py-3 fw-bold ${activeTab === 'recipient' ? 'brutal-btn-lime' : ''}`}
                    >
                      <i className="bi bi-person-workspace d-block fs-4 mb-1"></i>
                      Recipient Account
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('donor')}
                      className={`btn brutal-btn w-100 py-3 fw-bold ${activeTab === 'donor' ? 'brutal-btn-cyan' : ''}`}
                    >
                      <i className="bi bi-heart-fill d-block fs-4 mb-1 text-danger"></i>
                      Donor Account
                    </button>
                  </div>
                </div>

                {/* Role Info Box */}
                {activeTab === 'recipient' ? (
                  <div className="brutal-card p-3 bg-light mb-4 text-center">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-person-workspace text-success me-2"></i> Recipient Account Mode
                    </h6>
                    <p className="small text-secondary mb-0">
                      Sign in with Google to create medical fundraisers &amp; upload document proofs for AI verification.
                    </p>
                  </div>
                ) : (
                  <div className="brutal-card p-3 bg-light mb-4 text-center">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-heart-fill text-danger me-2"></i> Donor Account Mode
                    </h6>
                    <p className="small text-secondary mb-0">
                      Sign in with Google to browse verified campaigns, view trust reports &amp; make direct donations.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger fw-bold small mb-3 text-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMessage}
                  </div>
                )}

                {loginMessage && (
                  <div className="alert alert-success fw-bold small mb-3 text-center">
                    <i className="bi bi-check-circle-fill me-2"></i> {loginMessage}
                  </div>
                )}

                <div className="text-center py-2 mb-3">
                  <label className="form-label fw-bold small text-uppercase text-secondary mb-3">
                    Sign in with Google as {activeTab.toUpperCase()}
                  </label>

                  {isLoading ? (
                    <div className="py-3">
                      <div className="spinner-border text-primary me-2"></div>
                      <span className="fw-bold text-secondary">Saving to MongoDB...</span>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center border border-3 border-dark p-3 bg-white">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setErrorMessage('Google authentication failed. Please try again.')}
                        useOneTap
                        theme="filled_blue"
                        shape="rectangular"
                        text="continue_with"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
