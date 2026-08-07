import React from 'react';
import type { Campaign } from '../../types';
import { useWeb3 } from '../../context/Web3Context';

interface CampaignCardProps {
  campaign: Campaign;
  onViewTrustReport: (campaignId: string) => void;
  onDonateClick: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onViewTrustReport,
  onDonateClick,
}) => {
  const { user } = useWeb3();
  const percent = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));

  const isRecipientMode = user?.role === 'user';

  const formatInr = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'ACTIVE':
        return <span className="brutal-badge badge-lime"><i className="bi bi-patch-check-fill"></i> ACTIVE & VERIFIED</span>;
      case 'PENDING_VERIFICATION':
        return <span className="brutal-badge badge-cyan">AI REVIEW PENDING</span>;
      case 'COMPLETED':
        return <span className="brutal-badge badge-lime">COMPLETED</span>;
      default:
        return <span className="brutal-badge badge-yellow">DRAFT</span>;
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
