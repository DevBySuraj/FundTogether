import React from 'react';
import type { Campaign } from '../../types';
import { useWeb3 } from '../../context/Web3Context';

interface CampaignCardProps {
  campaign: Campaign;
  onViewTrustReport: (campaignId: string) => void;
  onDonateClick: (campaign: Campaign) => void;
  onVerifyWalletClick?: (campaignId: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onViewTrustReport,
  onDonateClick,
  onVerifyWalletClick,
}) => {
  const { user } = useWeb3();
  const percent = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));

  const isRecipientMode = user?.role === 'recipient' || user?.role === 'user';
  const isWalletUnverified = !user?.walletVerified || campaign.recipientWallet === 'pending_wallet_verification';

  const formatInr = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'ACTIVE':
        return <span className="brutal-badge badge-lime"><i className="bi bi-patch-check-fill"></i> ACTIVE &amp; VERIFIED</span>;
      case 'APPROVED':
        return <span className="brutal-badge badge-cyan"><i className="bi bi-check-circle-fill"></i> APPROVED BY ADMIN</span>;
      case 'PENDING_VERIFICATION':
        return <span className="brutal-badge badge-yellow"><i className="bi bi-hourglass-split"></i> AI REVIEW PENDING</span>;
      case 'COMPLETED':
        return <span className="brutal-badge badge-lime"><i className="bi bi-check-all"></i> COMPLETED</span>;
      default:
        return <span className="brutal-badge badge-yellow"><i className="bi bi-clock"></i> DRAFT</span>;
    }
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="brutal-card">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="brutal-badge badge-cyan">{campaign.category || 'General'}</span>
            {getStatusBadge()}
          </div>

          <h4 className="fw-bold mb-2">{campaign.title}</h4>
          <p className="text-secondary small mb-3" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {campaign.description}
          </p>
        </div>

        <div>
          <div className="d-flex justify-content-between fw-bold small mb-1">
            <span>{formatInr(campaign.currentAmount)} Raised</span>
            <span>{percent}%</span>
          </div>

          <div className="progress-brutal mb-2">
            <div className="progress-bar-brutal" style={{ width: `${percent}%` }}></div>
          </div>

          <div className="text-secondary small mb-3">
            Target: <strong>{formatInr(campaign.targetAmount)}</strong>
          </div>

          {/* Recipient Action: Connect MetaMask Wallet to Activate */}
          {isRecipientMode && isWalletUnverified && (
            <div className="p-2 border border-2 border-dark bg-light mb-3 text-center">
              <small className="fw-bold text-dark d-block mb-1">
                <i className="bi bi-shield-lock-fill text-warning me-1"></i> Wallet Verification Required
              </small>
              <button
                onClick={() => onVerifyWalletClick && onVerifyWalletClick(campaign._id)}
                className="btn brutal-btn brutal-btn-lime btn-sm w-100 fw-bold"
              >
                🦊 Verify MetaMask Wallet
              </button>
            </div>
          )}

          {/* Action Buttons based on User Role */}
          <div className="d-grid gap-2">
            <button
              onClick={() => onViewTrustReport(campaign._id)}
              className="btn brutal-btn"
            >
              <i className="bi bi-shield-check text-primary"></i> Trust Report
            </button>

            {/* Hide Donate button for Recipient View; Only show for Donor View */}
            {!isRecipientMode && (
              <button
                onClick={() => onDonateClick(campaign)}
                className="btn brutal-btn brutal-btn-lime"
              >
                <i className="bi bi-heart-fill text-danger me-1"></i> Donate ₹ INR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
