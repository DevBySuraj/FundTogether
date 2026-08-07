import React from 'react';
import { useWeb3 } from '../../context/Web3Context';

interface HeroProps {
  onOpenCreateModal: () => void;
  onExploreClick: () => void;
  onOpenAuthModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateModal, onExploreClick, onOpenAuthModal }) => {
  const { user } = useWeb3();
  const isRecipient = user?.role === 'recipient' || user?.role === 'user';
  const isDonor = user?.role === 'donor';

  return (
    <section className="hero container-fluid px-3 px-md-5">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-xl-10 text-center">
          {/* Active Role Indicator Badge */}
          {user && (
            <div className="mb-3 d-inline-block">
              {isRecipient ? (
                <span className="brutal-badge badge-lime px-3 py-2 fs-6 fw-bold">
                  <i className="bi bi-person-workspace me-2"></i> Recipient Portal &bull; Medical Fundraising
                </span>
              ) : isDonor ? (
                <span className="brutal-badge badge-cyan px-3 py-2 fs-6 fw-bold">
                  <i className="bi bi-heart-fill text-danger me-2"></i> Donor Portal &bull; Direct Verified Giving
                </span>
              ) : null}
            </div>
          )}

          <h1 className="hero-title">
            Donate with Proof
            <br />
            Not Promises
          </h1>

          <p className="hero-subtitle text-secondary mt-3 px-2">
            Transparent fundraising backed by AI-powered document verification, permanent decentralized storage, and 100% traceable Indian Rupee (₹ INR) direct donations.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
            {isRecipient ? (
              /* Recipient Specific Primary Action */
              <button className="btn hero-btn" onClick={onOpenCreateModal}>
                <i className="bi bi-plus-circle-fill fs-5 me-1"></i>
                <span>Create New Medical Fundraiser</span>
              </button>
            ) : isDonor ? (
              /* Donor Specific Primary Action */
              <button onClick={onExploreClick} className="btn hero-btn" style={{ background: '#00F0FF', color: '#000' }}>
                <i className="bi bi-heart-fill text-danger fs-5 me-1"></i>
                <span>Explore Verified Campaigns to Support</span>
              </button>
            ) : (
              /* Unauthenticated Visitors */
              <>
                <button className="btn hero-btn" onClick={onOpenCreateModal}>
                  <i className="bi bi-plus-circle-fill fs-5 me-1"></i>
                  <span>Start Verified Campaign</span>
                </button>
                <button onClick={onExploreClick} className="btn brutal-btn brutal-btn-cyan fw-bold" style={{ padding: '0.9rem 1.75rem' }}>
                  Browse Campaigns <i className="bi bi-arrow-down-short"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
