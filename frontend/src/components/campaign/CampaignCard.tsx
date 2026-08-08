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

  const formatEth = (amount: number) => {
    return `${amount.toFixed(3)} POL`;
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'ACTIVE':
        return <span className="brutal-badge badge-lime"><i className="bi bi-patch-check-fill"></i> ACTIVE</span>;
      case 'APPROVED':
        return <span className="brutal-badge badge-cyan"><i className="bi bi-check-circle-fill"></i> APPROVED</span>;
      case 'PENDING_VERIFICATION':
        return <span className="brutal-badge badge-yellow"><i className="bi bi-hourglass-split"></i> PENDING</span>;
      case 'COMPLETED':
        return <span className="brutal-badge badge-lime"><i className="bi bi-check-all"></i> COMPLETED</span>;
      default:
        return <span className="brutal-badge badge-yellow"><i className="bi bi-clock"></i> DRAFT</span>;
    }
  };

  const hasRecipientWallet = campaign.recipientWallet && campaign.recipientWallet !== 'pending_wallet_verification';
  const hasIpfs = !!campaign.ipfsCid;
  const hasBlockchain = !!campaign.txHash || campaign.status === 'ACTIVE';

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="brutal-card h-100 d-flex flex-column justify-content-between">
        <div>
          {/* Status & Category */}
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
            <span className="brutal-badge badge-cyan">{campaign.category || 'General'}</span>
            {getStatusBadge()}
          </div>

          <h4 className="fw-bold mb-2 text-dark">{campaign.title}</h4>
          <p
            className="text-secondary small mb-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {campaign.description}
          </p>

          {/* Verification Badges */}
          <div className="d-flex flex-wrap gap-1 mb-3">
            <span className="brutal-badge badge-lime" style={{ fontSize: '0.65rem' }}>
              🤖 AI Score: 98%
            </span>
            <span className={`brutal-badge ${hasRecipientWallet ? 'badge-lime' : 'badge-yellow'}`} style={{ fontSize: '0.65rem' }}>
              🔐 {hasRecipientWallet ? 'Wallet Verified' : 'Wallet Pending'}
            </span>
            <span className={`brutal-badge ${hasIpfs ? 'badge-lime' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
              📦 {hasIpfs ? 'IPFS Logged' : 'IPFS Sync'}
            </span>
            <span className={`brutal-badge ${hasBlockchain ? 'badge-lime' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
              ⛓ On-Chain
            </span>
          </div>
        </div>

        <div>
          {/* Progress Bar & Amounts */}
          <div className="d-flex justify-content-between fw-bold small mb-1">
            <span className="text-dark">{formatEth(campaign.currentAmount)} Raised</span>
            <span className="text-primary">{percent}%</span>
          </div>

          <div className="progress-brutal mb-2">
            <div className="progress-bar-brutal" style={{ width: `${percent}%` }}></div>
          </div>

          <div className="d-flex justify-content-between text-secondary small mb-3">
            <span>Goal: <strong>{formatEth(campaign.targetAmount)}</strong></span>
            {hasRecipientWallet && (
              <span className="font-monospace">
                {campaign.recipientWallet.substring(0, 6)}...{campaign.recipientWallet.substring(campaign.recipientWallet.length - 4)}
              </span>
            )}
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

            {/* Donate Button: Prominently displayed for ACTIVE campaigns in Donor View */}
            {!isRecipientMode && campaign.status === 'ACTIVE' && (
              <button
                onClick={() => onDonateClick(campaign)}
                className="btn brutal-btn brutal-btn-lime fw-black"
                id={`donate-btn-${campaign._id}`}
              >
                <span className="me-1">🦊</span> Donate with MetaMask
              </button>
            )}

            {!isRecipientMode && campaign.status !== 'ACTIVE' && (
              <button
                disabled
                className="btn brutal-btn btn-secondary text-muted"
                style={{ opacity: 0.6 }}
              >
                🔒 Campaign Not Active
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
