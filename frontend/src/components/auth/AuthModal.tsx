import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { account, user, connectWalletWithRole, setRole, disconnectWallet, isConnecting } = useWeb3();
  const [activeTab, setActiveTab] = useState<'user' | 'donor'>(user?.role === 'user' ? 'user' : 'donor');

  if (!isOpen) return null;

  const handleSignIn = async (role: 'user' | 'donor') => {
    setActiveTab(role);
    await connectWalletWithRole(role);
    onClose();
  };

  const handleSwitchRole = (role: 'user' | 'donor') => {
    setActiveTab(role);
    setRole(role);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal" style={{ maxWidth: '560px' }}>
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h4 className="modal-title fw-black text-uppercase mb-0">
              <i className="bi bi-box-arrow-in-right text-primary me-2"></i> TrustChain Portal Sign In
            </h4>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Role Tabs */}
            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleSwitchRole('user')}
                className={`btn brutal-btn flex-fill py-3 fw-bold ${activeTab === 'user' ? 'brutal-btn-lime' : ''}`}
              >
                <i className="bi bi-person-workspace me-2 fs-5"></i>
                Recipient (My Campaigns)
              </button>

              <button
                type="button"
                onClick={() => handleSwitchRole('donor')}
                className={`btn brutal-btn flex-fill py-3 fw-bold ${activeTab === 'donor' ? 'brutal-btn-cyan' : ''}`}
              >
                <i className="bi bi-heart-fill me-2 fs-5 text-danger"></i>
                Donor (All Campaigns)
              </button>
            </div>

            {/* Recipient Details */}
            {activeTab === 'user' ? (
              <div className="brutal-card p-3 bg-light mb-4">
                <h5 className="fw-bold mb-2 text-dark">
                  <i className="bi bi-shield-check text-success me-2"></i> Recipient Portal Mode
                </h5>
                <ul className="small text-secondary fw-bold mb-0 ps-3">
                  <li className="mb-1">Shows ONLY campaigns created by your account.</li>
                  <li className="mb-1">Upload hospital/NGO verification documents for Gemini AI OCR audit.</li>
                  <li className="mb-1">Receive direct ₹ INR donations to your verified account.</li>
                </ul>
              </div>
            ) : (
              <div className="brutal-card p-3 bg-light mb-4">
                <h5 className="fw-bold mb-2 text-dark">
                  <i className="bi bi-heart-pulse-fill text-danger me-2"></i> Donor Portal Mode
                </h5>
                <ul className="small text-secondary fw-bold mb-0 ps-3">
                  <li className="mb-1">Shows ALL published & verified campaigns open for donations.</li>
                  <li className="mb-1">Inspect Gemini AI trust scores, SHA-256 fingerprints & IPFS proofs.</li>
                  <li className="mb-1">Make 1-click transparent ₹ INR donations.</li>
                </ul>
              </div>
            )}

            {account ? (
              <div className="text-center py-3 border border-3 border-dark bg-white">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                <h5 className="fw-bold mb-1">Signed In Successfully</h5>
                <p className="font-monospace fw-bold text-primary mb-3">{account}</p>
                <span className="brutal-badge badge-lime mb-3">
                  Active Mode: {activeTab === 'user' ? 'Campaign Recipient (My Campaigns)' : 'Donor (All Campaigns)'}
                </span>
                <div className="d-flex gap-2 mt-3 px-3">
                  <button onClick={onClose} className="btn brutal-btn brutal-btn-lime flex-fill">
                    View {activeTab === 'user' ? 'My Campaigns' : 'All Published Campaigns'}
                  </button>
                  <button onClick={disconnectWallet} className="btn brutal-btn brutal-btn-magenta">
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => handleSignIn(activeTab)}
                  disabled={isConnecting}
                  className={`btn brutal-btn w-100 py-3 fs-5 fw-bold text-uppercase mb-3 ${
                    activeTab === 'user' ? 'brutal-btn-lime' : 'brutal-btn-cyan'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-fill me-2"></i> Enter as {activeTab === 'user' ? 'Campaign Recipient' : 'Donor'}
                    </>
                  )}
                </button>

                <p className="text-center small text-secondary fw-bold mb-0">
                  Powered by Google Gemini AI OCR trust scoring & Pinata IPFS.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
