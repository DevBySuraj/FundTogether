import React from 'react';

interface HeroProps {
  onOpenCreateModal: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateModal, onExploreClick }) => {
  return (
    <section className="hero container">
      <div className="row justify-content-center">
        <div className="col-xl-10 text-center">
          <div className="mb-3">
            <span className="brutal-badge badge-yellow fs-6 py-2 px-3">
              <i className="bi bi-magic"></i> POWERED BY GOOGLE GEMINI AI & PINATA IPFS
            </span>
          </div>

          <h1 className="hero-title">
            Donate with Proof
            <br />
            Not Promises
          </h1>

          <p className="fs-5 text-secondary mt-3 mx-auto" style={{ maxWidth: '720px' }}>
            Transparent fundraising verified by Google Gemini AI OCR, stored permanently on Pinata IPFS, with 100% transparent Indian Rupee (₹ INR) direct donations.
          </p>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              className="btn hero-btn"
              onClick={onOpenCreateModal}
            >
              <i className="bi bi-shield-check fs-4 me-2"></i> Start Verified Campaign
            </button>
            <button
              onClick={onExploreClick}
              className="btn brutal-btn brutal-btn-cyan py-3 px-4 fw-bold"
            >
              Browse Campaigns <i className="bi bi-arrow-down-short"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
