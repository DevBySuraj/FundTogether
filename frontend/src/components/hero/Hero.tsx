import React from 'react';

interface HeroProps {
  onOpenCreateModal: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateModal, onExploreClick }) => {
  return (
    <section className="hero container-fluid px-3 px-md-5">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-xl-10 text-center">
          <h1 className="hero-title">
            Donate with Proof
            <br />
            Not Promises
          </h1>

          <p className="hero-subtitle text-secondary mt-3 px-2">
            Transparent fundraising backed by AI-powered document verification, permanent decentralized storage, and 100% traceable Indian Rupee (₹ INR) direct donations.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
            <button className="btn hero-btn" onClick={onOpenCreateModal}>
              <i className="bi bi-shield-check fs-5"></i>
              <span>Start Verified Campaign</span>
            </button>
            <button onClick={onExploreClick} className="btn brutal-btn brutal-btn-cyan fw-bold" style={{ padding: '0.9rem 1.75rem' }}>
              Browse Campaigns <i className="bi bi-arrow-down-short"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
