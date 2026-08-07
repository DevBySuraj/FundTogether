import React, { useEffect, useState } from 'react';
import type { Campaign } from '../../types';
import { campaignAPI } from '../../services/api';
import { CampaignCard } from './CampaignCard';
import { WalletVerificationModal } from '../verification/WalletVerificationModal';
import { useWeb3 } from '../../context/Web3Context';

interface CampaignGridProps {
  selectedCategory: string;
  onViewTrustReport: (campaignId: string) => void;
  onDonateClick: (campaign: Campaign) => void;
  onOpenCreateModal: () => void;
  refreshTrigger: number;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  selectedCategory,
  onViewTrustReport,
  onDonateClick,
  onOpenCreateModal,
  refreshTrigger,
}) => {
  const { account, user } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingCampaignId, setVerifyingCampaignId] = useState<string | null>(null);

  const isRecipientMode = user?.role === 'recipient' || user?.role === 'user';
  const isDonorMode = user?.role === 'donor';

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, refreshTrigger, isRecipientMode, user]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isRecipientMode) {
        // Recipient View: Call /campaign/my to retrieve recipient's campaigns (including DRAFT / PENDING_VERIFICATION / APPROVED)
        const response = await campaignAPI.getMy();
        let list = response.data || [];
        if (selectedCategory && selectedCategory !== 'All') {
          list = list.filter((c) => c.category === selectedCategory);
        }
        setCampaigns(list);
      } else {
        // Donor View: Call /campaign/verified to retrieve ONLY campaigns manually verified & approved by Admin
        const response = await campaignAPI.getVerified();
        let list = response.data || [];
        if (selectedCategory && selectedCategory !== 'All') {
          list = list.filter((c) => c.category === selectedCategory);
        }
        setCampaigns(list);
      }
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
      // Fallback call
      try {
        const fallbackRes = await campaignAPI.getAll(selectedCategory);
        setCampaigns(fallbackRes.data || []);
      } catch {
        setError('Unable to load campaigns from TrustChain server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter campaigns strictly by role:
  // Recipient: Display ALL campaigns returned by /campaign/my (they belong to current recipient)
  // Donor: Only campaigns manually approved by Admin (ACTIVE or COMPLETED)
  const displayedCampaigns = campaigns.filter((c) => {
    if (isRecipientMode) {
      return true; // All campaigns from /campaign/my belong to recipient
    }
    // Donors see ONLY active or completed campaigns approved by Admin
    return c.status === 'ACTIVE' || c.status === 'COMPLETED';
  });

  return (
    <section className="container py-5" id="campaignsSection">
      {/* Header & Role Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom border-2 border-dark pb-3">
        <div>
          <h2 className="fw-black text-uppercase mb-1">
            {isRecipientMode ? (
              <>
                <i className="bi bi-person-workspace text-success me-2"></i>
                Recipient Portal: My Created Fundraisers
              </>
            ) : isDonorMode ? (
              <>
                <i className="bi bi-heart-fill text-danger me-2"></i>
                Donor Portal: Verified Campaigns
              </>
            ) : (
              'Verified Medical Campaigns'
            )}{' '}
            <span className="badge brutal-badge badge-cyan fs-6 ms-2">
              {displayedCampaigns.length}
            </span>
          </h2>
          <small className="text-secondary fw-bold">
            {isRecipientMode
              ? user?.email
                ? `Logged in as Recipient (${user.email})`
                : account
                  ? `Recipient Wallet: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
                  : 'Recipient Portal: Manage your created fundraisers'
              : 'Donor Portal: Only campaigns manually verified & approved by Admin are listed.'}
          </small>
        </div>

        {/* Role-based Header Actions */}
        <div>
          {isRecipientMode && (
            <button onClick={onOpenCreateModal} className="btn brutal-btn brutal-btn-lime fw-bold">
              <i className="bi bi-plus-circle-fill me-1"></i> Create New Fundraiser
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status"></div>
          <p className="fw-bold mt-2">Loading campaigns from TrustChain backend...</p>
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
          <i className="bi bi-shield-check text-secondary fs-1 mb-2"></i>
          <h4 className="fw-bold mb-2">
            {isRecipientMode ? 'No Created Campaigns Found' : 'No Verified Campaigns Currently Active'}
          </h4>
          <p className="text-secondary mb-3">
            {isRecipientMode
              ? 'You have not created any medical fundraisers with your account yet.'
              : 'Campaigns will appear here once they are manually reviewed, AI-verified, and approved by the Platform Administrator.'}
          </p>
          {isRecipientMode && (
            <button onClick={onOpenCreateModal} className="btn brutal-btn brutal-btn-lime fw-bold">
              <i className="bi bi-plus-circle-fill me-1"></i> Start Your First Campaign
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
              onVerifyWalletClick={(id) => setVerifyingCampaignId(id)}
            />
          ))}
        </div>
      )}

      {/* Wallet Verification Modal */}
      <WalletVerificationModal
        isOpen={!!verifyingCampaignId}
        campaignId={verifyingCampaignId || undefined}
        onClose={() => setVerifyingCampaignId(null)}
        onSuccess={fetchCampaigns}
      />
    </section>
  );
};
