import React from 'react';

interface GuestLandingViewProps {
  onOpenAuthModal: () => void;
}

export const GuestLandingView: React.FC<GuestLandingViewProps> = ({ onOpenAuthModal }) => {
  return (
    <div className="container py-5">
      {/* 1. Problem Statement Card */}
      <div className="brutal-card p-4 p-md-5 mb-5 bg-white">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-7">
            <span className="brutal-badge badge-magenta mb-3 fs-6">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> The Crisis in Medical Crowdfunding
            </span>
            <h2 className="fw-black text-uppercase mb-3" style={{ fontSize: '2.2rem', lineHeight: '1.2' }}>
              Traditional Fundraisers Suffer From Fake Bills &amp; Zero Transparency
            </h2>
            <p className="lead text-secondary mb-4">
              Over 40% of traditional crowdfunding campaigns lack verified hospital records. Donors are left wondering if their money actually reaches patients in critical medical need.
            </p>

            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="p-3 border border-2 border-dark rounded bg-light">
                  <h6 className="fw-bold text-danger mb-1">
                    <i className="bi bi-x-circle-fill me-1"></i> Fake Hospital Bills
                  </h6>
                  <p className="small text-secondary mb-0">Unverified PDF estimates and forged seals deceive well-meaning donors.</p>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="p-3 border border-2 border-dark rounded bg-light">
                  <h6 className="fw-bold text-danger mb-1">
                    <i className="bi bi-clock-history me-1"></i> Delayed Payouts
                  </h6>
                  <p className="small text-secondary mb-0">Middleman platforms charge heavy 10-15% platform fees &amp; delay emergency funds.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5 text-center">
            <div className="p-4 border border-3 border-dark bg-warning rounded shadow-brutal">
              <i className="bi bi-shield-x display-1 text-dark mb-2"></i>
              <h4 className="fw-black text-uppercase text-dark mb-2">Sign In Required to View Campaigns</h4>
              <p className="small text-dark fw-bold mb-4">
                To prevent unauthorized scraping and guarantee donor privacy, campaign details &amp; trust reports are visible to authenticated Donors &amp; Recipients only.
              </p>
              <button
                onClick={onOpenAuthModal}
                className="btn brutal-btn brutal-btn-cyan w-100 py-3 fw-black text-uppercase fs-6"
              >
                <i className="bi bi-box-arrow-in-right me-2"></i> Sign In with Google to Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. How FundTogether Solves It (3-Step Technology Architecture) */}
      <div className="text-center mb-4">
        <span className="brutal-badge badge-cyan fs-6 mb-2">
          <i className="bi bi-cpu-fill me-1"></i> Our Solution
        </span>
        <h2 className="fw-black text-uppercase">How FundTogether Guarantees 100% Trust</h2>
        <p className="text-secondary fw-bold">Combining Artificial Intelligence, Decentralized Storage, and Direct Rupee Giving</p>
      </div>

      <div className="row g-4 mb-5">
        {/* Step 1: AI Verification */}
        <div className="col-12 col-md-4">
          <div className="brutal-card h-100 p-4 text-center">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center border border-3 border-dark rounded-circle bg-info text-dark fw-black fs-2"
              style={{ width: '64px', height: '64px' }}
            >
              1
            </div>
            <h4 className="fw-bold mb-2">AI Vision OCR Inspection</h4>
            <p className="small text-secondary mb-0">
              When a recipient submits a medical estimate or hospital bill, our AI Vision OCR engine extracts patient details, hospital seals, and bill itemizations with 95%+ confidence scoring.
            </p>
          </div>
        </div>

        {/* Step 2: IPFS Decentralized Storage */}
        <div className="col-12 col-md-4">
          <div className="brutal-card h-100 p-4 text-center">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center border border-3 border-dark rounded-circle bg-warning text-dark fw-black fs-2"
              style={{ width: '64px', height: '64px' }}
            >
              2
            </div>
            <h4 className="fw-bold mb-2">Immutable Storage</h4>
            <p className="small text-secondary mb-0">
              Verified hospital records are pinned to Pinata IPFS decentralized storage. Document hashes are permanently stored on-chain, preventing tampering or deletion.
            </p>
          </div>
        </div>

        {/* Step 3: Direct INR Giving */}
        <div className="col-12 col-md-4">
          <div className="brutal-card h-100 p-4 text-center">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center border border-3 border-dark rounded-circle bg-success text-white fw-black fs-2"
              style={{ width: '64px', height: '64px' }}
            >
              3
            </div>
            <h4 className="fw-bold mb-2">100% Direct INR Giving</h4>
            <p className="small text-secondary mb-0">
              Donors give directly in Indian Rupees (₹ INR). Funds bypass platform middlemen, ensuring 100% of your contribution goes directly to the verified recipient's medical treatment.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Call To Action (Dual Portal Sign In Options) */}
      <div className="brutal-card p-4 p-md-5 bg-dark text-white text-center">
        <h2 className="fw-black text-uppercase text-white mb-2">Get Started on FundTogether Today</h2>
        <p className="text-white-50 mb-4 max-w-600 mx-auto">
          Join thousands of verified donors and recipients building the future of transparent medical fundraising.
        </p>

        <div className="d-flex justify-content-center flex-wrap gap-3">
          <button
            onClick={onOpenAuthModal}
            className="btn brutal-btn brutal-btn-lime py-3 px-4 fw-bold fs-6"
          >
            <i className="bi bi-person-workspace me-2"></i> Sign In as Recipient (Raise Funds)
          </button>
          <button
            onClick={onOpenAuthModal}
            className="btn brutal-btn brutal-btn-cyan py-3 px-4 fw-bold fs-6"
          >
            <i className="bi bi-heart-fill text-danger me-2"></i> Sign In as Donor (Make Impact)
          </button>
        </div>
      </div>
    </div>
  );
};
