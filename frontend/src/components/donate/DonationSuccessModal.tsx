import React from 'react';

interface DonationSuccessModalProps {
  txHash: string;
  amount: string;
  campaignTitle: string;
  blockNumber: number | null;
  onClose: () => void;
}

const EXPLORER_BASE = 'https://amoy.polygonscan.com/tx/';

export const DonationSuccessModal: React.FC<DonationSuccessModalProps> = ({
  txHash,
  amount,
  campaignTitle,
  blockNumber,
  onClose,
}) => {
  return (
    <div className="w3-success-overlay">
      <div className="w3-success-card">
        {/* Animated checkmark */}
        <div className="w3-success-icon-wrap">
          <div className="w3-success-ring" />
          <span className="w3-success-check">✓</span>
        </div>

        <h2 className="w3-success-title">Donation Successful!</h2>
        <p className="w3-success-subtitle">
          Your contribution to <strong>{campaignTitle}</strong> has been confirmed on the blockchain.
        </p>

        {/* Transaction Details */}
        <div className="w3-success-details">
          <div className="w3-success-detail-row">
            <span className="w3-success-detail-label">Amount Donated</span>
            <span className="w3-success-detail-value w3-success-amount">{amount} POL</span>
          </div>
          <div className="w3-success-detail-row">
            <span className="w3-success-detail-label">Transaction Hash</span>
            <code className="w3-success-hash">{txHash.slice(0, 12)}…{txHash.slice(-10)}</code>
          </div>
          {blockNumber && (
            <div className="w3-success-detail-row">
              <span className="w3-success-detail-label">Block Number</span>
              <span className="w3-success-detail-value">#{blockNumber}</span>
            </div>
          )}
          <div className="w3-success-detail-row">
            <span className="w3-success-detail-label">Network</span>
            <span className="w3-success-detail-value">Polygon Amoy Testnet</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w3-success-actions">
          <a
            href={`${EXPLORER_BASE}${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="w3-success-btn-explorer"
          >
            🔍 View on PolygonScan
          </a>
          <button onClick={onClose} className="w3-success-btn-close">
            Close
          </button>
        </div>

        {/* Confetti-style decoration */}
        <div className="w3-confetti" aria-hidden="true">
          {['💜', '⬡', '✦', '◆', '✦', '⬡', '💜'].map((c, i) => (
            <span key={i} className={`w3-confetti-piece w3-confetti-${i}`}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
