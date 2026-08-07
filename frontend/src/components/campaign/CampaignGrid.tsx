import React, { useEffect, useState } from 'react';
import type { Campaign } from '../../types';
import { campaignAPI } from '../../services/api';
import { CampaignCard } from './CampaignCard';
import { useWeb3 } from '../../context/Web3Context';

interface CampaignGridProps {
  selectedCategory: string;
  onViewTrustReport: (campaignId: string) => void;
  onDonateClick: (campaign: Campaign) => void;
  refreshTrigger: number;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  selectedCategory,
  onViewTrustReport,
  onDonateClick,
  refreshTrigger,
}) => {
  const { account, user, setRole } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isRecipientMode = user?.role === 'user';

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, refreshTrigger]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await campaignAPI.getAll(selectedCategory);
      setCampaigns(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
      setError('Unable to load campaigns from TrustChain server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role-based Campaign Filter:
  // Recipient Mode: Show ONLY campaigns created by recipient's wallet
  // Donor Mode: Show ALL published campaigns
  const displayedCampaigns = campaigns.filter((c) => {
    if (isRecipientMode && account) {
      return c.recipientWallet.toLowerCase() === account.toLowerCase();
    }
    return true;
  });

  return (
    <section className="container py-5" id="campaignsSection">
      {/* Header & Role Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-black text-uppercase mb-1">
            {isRecipientMode ? 'My Created Campaigns' : 'All Published Campaigns'}{' '}
            <span className="badge brutal-badge badge-cyan fs-6 ms-2">
              {displayedCampaigns.length}
            </span>
          </h2>
          <small className="text-secondary fw-bold">
            {isRecipientMode
              ? `Recipient Mode: Showing campaigns created by ${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`
              : 'Donor Mode: Showing all active verified campaigns available for donations.'}
          </small>
        </div>

        {/* Interface Mode Switcher Buttons */}
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`btn brutal-btn btn-sm ${isRecipientMode ? 'brutal-btn-lime' : ''}`}
          >
            <i className="bi bi-person-workspace me-1"></i> Recipient View (My Campaigns)
          </button>

          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`btn brutal-btn btn-sm ${!isRecipientMode ? 'brutal-btn-cyan' : ''}`}
          >
            <i className="bi bi-heart-fill text-danger me-1"></i> Donor View (All Campaigns & Donate)
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status"></div>
          <p className="fw-bold mt-2">Loading verified campaigns from TrustChain backend...</p>
        </div>
      ) : error ? (
        <div className="brutal-card max-w-500 mx-auto p-4 text-center">
          <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-2"></i>
          <h4 className="fw-bold">Backend Connection Issue</h4>
          <p className="text-secondary small">{error}</p>
          <button onClick={fetchCampaigns} className="btn brutal-btn mt-2">Retry Connection</button>
        </div>
      ) : displayedCampaigns.length === 0 ? (
        <div className="brutal-card max-w-500 mx-auto p-4 text-center">
          <i className="bi bi-inbox-fill text-secondary fs-1 mb-2"></i>
          <h4 className="fw-bold mb-2">
            {isRecipientMode ? 'No Created Campaigns Found' : 'No Campaigns Found'}
          </h4>
          <p className="text-secondary mb-3">
            {isRecipientMode
              ? 'You have not created any campaigns with your account yet.'
              : `No campaigns found under category "${selectedCategory}".`}
          </p>
          {isRecipientMode && (
            <button
              onClick={() => setRole('donor')}
              className="btn brutal-btn brutal-btn-cyan"
            >
              Switch to Donor View to See All Campaigns
            </button>
          )}
        </div>
      ) : (
        <div className="row">
          {displayedCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onViewTrustReport={onViewTrustReport}
              onDonateClick={onDonateClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};
