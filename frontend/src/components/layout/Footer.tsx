import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 px-3 px-md-5" style={{ borderTop: '3px solid #111', background: '#fff' }}>
      <div className="container-fluid">
        <div className="row align-items-center gy-2 text-center text-md-start">
          {/* Brand */}
          <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-start align-items-center gap-2 fw-black">
            <ShieldCheck size={18} color="#00d084" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>TRUSTCHAIN / FUNDTOGETHER</span>
          </div>

          {/* Tagline */}
          <div className="col-12 col-md-4 d-flex justify-content-center">
            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>
              Transparent Donations &amp; AI-Powered Document Verification
            </span>
          </div>

          {/* Credits */}
          <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-end align-items-center gap-1" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
            Made with <Heart size={13} color="#ff4747" fill="#ff4747" /> for AlgOlympia
          </div>
        </div>
      </div>
    </footer>
  );
};
