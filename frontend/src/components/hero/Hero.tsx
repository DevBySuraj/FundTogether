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
          <div className="mb-3">
            <span className="brutal-badge badge-yellow py-2 px-3" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.85rem)' }}>
              <i className="bi bi-magic"></i>
              <span className="d-none d-sm-inline">POWERED BY GOOGLE GEMINI AI & PINATA IPFS</span>
              <span className="d-sm-none">GEMINI AI & IPFS</span>
            </span>
          </div>

          <h1 className="hero-title">
            Donate with Proof
            <br />
            Not Promises
          </h1>

          <p className="hero-subtitle text-secondary mt-3 px-2">
            Transparent fundraising verified by Google Gemini AI OCR, stored permanently on Pinata IPFS, with 100% transparent Indian Rupee (₹ INR) direct donations.
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
