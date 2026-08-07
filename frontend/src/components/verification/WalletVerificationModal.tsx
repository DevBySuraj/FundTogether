import React, { useState } from 'react';
import { ethers } from 'ethers';
import { walletAPI } from '../../services/api';
import { useWeb3 } from '../../context/Web3Context';

interface WalletVerificationModalProps {
  isOpen: boolean;
  campaignId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletVerificationModal: React.FC<WalletVerificationModalProps> = ({
  isOpen,
  campaignId,
  onClose,
  onSuccess,
}) => {
  const { setUserSession } = useWeb3();
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'idle' | 'nonce' | 'metamask' | 'verifying' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [hasMetaMask] = useState<boolean>(!!(window as any).ethereum);

  if (!isOpen) return null;

  const handleVerifyWallet = async (useSimulation = false) => {
    setIsVerifying(true);
    setErrorMessage(null);
    setStep('nonce');

    try {
      // 1. Fetch secure 10-minute random nonce from backend GET /wallet/nonce
      const nonceRes = await walletAPI.getNonce();
      const nonce = nonceRes.data.nonce;

      setStep('metamask');

      let walletAddress = '';
      let signature = '';
      // Exact message structure matching backend
      const signatureMessage = `FundTogether Wallet Verification\n\nNonce: ${nonce}`;

      if (!useSimulation && (window as any).ethereum) {
        // Real MetaMask Extension Browser Signing
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts || accounts.length === 0) {
          throw new Error('No Ethereum account selected in MetaMask.');
        }

        walletAddress = accounts[0].toLowerCase().trim();
        const signer = await provider.getSigner();
        signature = await signer.signMessage(signatureMessage);
      } else {
        // Simulated Web3 Signature (Dev/Demo Mode when MetaMask extension is absent)
        const demoWallet = ethers.Wallet.createRandom();
        walletAddress = demoWallet.address.toLowerCase().trim();
        signature = await demoWallet.signMessage(signatureMessage);
      }

      setConnectedWallet(walletAddress);
      setStep('verifying');

      // 2. Send signature to backend POST /wallet/verify for cryptographic recovery
      await walletAPI.verifySignature(walletAddress, signature, campaignId);

      setStep('success');

      // Update local storage user profile
      const savedUser = localStorage.getItem('trustchain_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.walletAddress = walletAddress;
          parsed.walletVerified = true;
          parsed.isVerified = true;
          setUserSession(parsed, localStorage.getItem('trustchain_token') || '');
        } catch (e) {
          // ignore
        }
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Wallet Verification Error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'MetaMask signature verification failed.');
      setStep('idle');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal" style={{ maxWidth: '540px' }}>
          
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <h4 className="modal-title fw-black text-uppercase mb-0">
                <i className="bi bi-wallet2 text-primary me-2"></i> Verify MetaMask Wallet
              </h4>
              <small className="text-secondary fw-bold">Gasless EIP-712 Message Ownership Proof</small>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 text-center">
            {errorMessage && (
              <div className="alert alert-danger fw-bold small mb-4 text-start">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMessage}
              </div>
            )}

            {step === 'success' ? (
              <div className="py-4">
                <i className="bi bi-check-circle-fill text-success display-1 mb-3 d-block"></i>
                <h4 className="fw-black text-uppercase mb-2">Wallet Verified &amp; Campaign Activated!</h4>
                <p className="font-monospace fw-bold text-success mb-3">{connectedWallet}</p>
                <div className="alert alert-success fw-bold small">
                  Your fundraiser is now <strong>ACTIVE</strong> and visible to Donors on FundTogether!
                </div>
              </div>
            ) : (
              <div>
                {/* MetaMask Icon & Explanation */}
                <div className="p-4 bg-light border border-3 border-dark mb-4">
                  <div className="fs-1 mb-2">🦊</div>
                  <h5 className="fw-bold mb-2">Gasless Wallet Ownership Signature</h5>
                  <p className="small text-secondary mb-0">
                    Signing a verification message confirms you control the destination wallet.
                    <strong className="d-block text-success mt-1">
                      <i className="bi bi-shield-check me-1"></i> 100% Free (No ETH Gas Fees Required)
                    </strong>
                  </p>
                </div>

                {/* Verification Process Stepper */}
                <div className="d-flex flex-column gap-2 mb-4 text-start">
                  <div className={`p-2 border border-2 border-dark d-flex align-items-center gap-2 ${step === 'nonce' ? 'bg-warning' : 'bg-white'}`}>
                    <span className="badge bg-dark">1</span>
                    <span className="small fw-bold">Fetch 10-Minute Secure Nonce from Backend</span>
                    {step === 'nonce' && <span className="spinner-border spinner-border-sm ms-auto"></span>}
                  </div>

                  <div className={`p-2 border border-2 border-dark d-flex align-items-center gap-2 ${step === 'metamask' ? 'bg-info' : 'bg-white'}`}>
                    <span className="badge bg-dark">2</span>
                    <span className="small fw-bold">Sign Nonce Message via Web3 Cryptography</span>
                    {step === 'metamask' && <span className="spinner-border spinner-border-sm ms-auto"></span>}
                  </div>

                  <div className={`p-2 border border-2 border-dark d-flex align-items-center gap-2 ${step === 'verifying' ? 'bg-success text-white' : 'bg-white'}`}>
                    <span className="badge bg-dark">3</span>
                    <span className="small fw-bold">Recover Address &amp; Activate Campaign</span>
                    {step === 'verifying' && <span className="spinner-border spinner-border-sm ms-auto"></span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column gap-2">
                  {hasMetaMask ? (
                    <button
                      className="btn brutal-btn brutal-btn-lime fw-bold py-3 text-uppercase w-100"
                      onClick={() => handleVerifyWallet(false)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Check MetaMask Extension...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-lock-fill me-2"></i> Connect &amp; Sign MetaMask Extension
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="alert alert-warning text-start p-3 mb-2">
                      <div className="fw-bold text-dark mb-1">
                        <i className="bi bi-info-circle-fill me-1"></i> MetaMask Extension Not Detected
                      </div>
                      <small className="text-secondary d-block mb-3">
                        You can install MetaMask from <a href="https://metamask.io" target="_blank" rel="noreferrer" className="fw-bold text-primary">metamask.io</a> or use simulated Web3 cryptographic verification mode below.
                      </small>
                      <button
                        className="btn brutal-btn brutal-btn-cyan fw-bold w-100 py-2"
                        onClick={() => handleVerifyWallet(true)}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Simulating Signature...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cpu-fill me-2"></i> Simulate Web3 Wallet Verification
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <button className="btn brutal-btn" onClick={onClose} disabled={isVerifying}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
