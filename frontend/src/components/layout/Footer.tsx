import React from 'react';
import { ShieldCheck, Heart, Github, Linkedin, Instagram, Mail, Cpu, Link2, Lock, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '4px solid #111', background: '#0d0d0d', color: '#e5e5e5' }}>

      {/* ─── Main Footer Grid ─── */}
      <div className="container-fluid px-4 px-md-5 pt-5 pb-4">
        <div className="row gy-5">

          {/* Brand Column */}
          <div className="col-12 col-md-6 col-xl-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <ShieldCheck size={26} color="#00d084" />
              <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                FundTogether
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#00d084', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>
              Empowering Transparent Giving Through Technology.
            </p>

            <p style={{ fontSize: '0.88rem', color: '#aaa', lineHeight: 1.7, maxWidth: '360px' }}>
              FundTogether is a secure donation platform that leverages AI-powered document verification, blockchain transparency, and decentralized storage to connect donors with verified recipients — ensuring every contribution reaches those who truly need it.
            </p>

            {/* Tech Badges */}
            <div className="d-flex flex-wrap gap-2 mt-4">
              {[
                { icon: <Cpu size={12} />, label: 'AI Verification' },
                { icon: <Link2 size={12} />, label: 'Blockchain' },
                { icon: <Database size={12} />, label: 'IPFS Storage' },
                { icon: <Lock size={12} />, label: 'Secure Auth' },
              ].map((t) => (
                <span key={t.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  border: '2px solid #333', padding: '4px 10px',
                  fontSize: '0.72rem', fontWeight: 700, color: '#ccc',
                  background: '#1a1a1a',
                }}>
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-sm-4 col-md-3 col-xl-2">
            <h6 style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontSize: '0.8rem', borderBottom: '2px solid #00d084', paddingBottom: '6px', display: 'inline-block' }}>
              Quick Links
            </h6>
            <ul className="list-unstyled mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {['Home', 'Explore Campaigns', 'Start a Campaign', 'How It Works', 'About Us', 'FAQ', 'Contact'].map((l) => (
                <li key={l}>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00d084')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Donors & Recipients */}
          <div className="col-6 col-sm-4 col-md-3 col-xl-2">
            <h6 style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontSize: '0.8rem', borderBottom: '2px solid #00d8ff', paddingBottom: '6px', display: 'inline-block' }}>
              For Donors
            </h6>
            <ul className="list-unstyled mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {['Browse Verified Campaigns', 'View Trust Reports', 'Donation History'].map((l) => (
                <li key={l}>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00d8ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>

            <h6 style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontSize: '0.8rem', borderBottom: '2px solid #ffdf5d', paddingBottom: '6px', display: 'inline-block' }}>
              For Recipients
            </h6>
            <ul className="list-unstyled mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {['Create Campaign', 'Upload Documents', 'Track Verification Status'].map((l) => (
                <li key={l}>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ffdf5d')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Contact */}
          <div className="col-12 col-sm-4 col-md-6 col-xl-4">
            <div className="row gy-4">
              {/* Resources */}
              <div className="col-12 col-sm-12 col-md-6">
                <h6 style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontSize: '0.8rem', borderBottom: '2px solid #ff4747', paddingBottom: '6px', display: 'inline-block' }}>
                  Resources
                </h6>
                <ul className="list-unstyled mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {['Verification Process', 'Trust & Transparency', 'Privacy Policy', 'Terms & Conditions'].map((l) => (
                    <li key={l}>
                      <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ff4747')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="col-12 col-sm-12 col-md-6">
                <h6 style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontSize: '0.8rem', borderBottom: '2px solid #7000ff', paddingBottom: '6px', display: 'inline-block' }}>
                  Contact
                </h6>

                <a href="mailto:support@fundtogether.org" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1rem' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#00d084')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                  <Mail size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  support@fundtogether.org
                </a>

                <p style={{ fontSize: '0.8rem', color: '#777', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  🏆 Developed for the <span style={{ color: '#ffdf5d', fontWeight: 700 }}>TrustChain Hackathon</span> — Blockchain, Web3 &amp; Digital Trust.
                </p>

                {/* Social Links */}
                <h6 style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                  Follow Us
                </h6>
                <div className="d-flex gap-2">
                  {[
                    { icon: <Github size={16} />, label: 'GitHub', href: 'https://github.com/DevBySuraj/FundTogether', color: '#ccc' },
                    { icon: <Linkedin size={16} />, label: 'LinkedIn', href: '#', color: '#0a66c2' },
                    { icon: <Instagram size={16} />, label: 'Instagram', href: '#', color: '#e1306c' },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                      title={s.label}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '34px', height: '34px',
                        border: '2px solid #333', background: '#1a1a1a', color: '#aaa',
                        transition: 'all 0.15s', textDecoration: 'none',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = s.color;
                        (e.currentTarget as HTMLElement).style.color = s.color;
                        (e.currentTarget as HTMLElement).style.background = '#222';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#333';
                        (e.currentTarget as HTMLElement).style.color = '#aaa';
                        (e.currentTarget as HTMLElement).style.background = '#1a1a1a';
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div style={{ borderTop: '2px solid #222' }}>
        <div className="container-fluid px-4 px-md-5 py-3">
          <div className="row align-items-center gy-2">
            <div className="col-12 col-md-6 text-center text-md-start">
              <span style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>
                © 2026 FundTogether. All Rights Reserved.
              </span>
            </div>
            <div className="col-12 col-md-6 text-center text-md-end">
              <span style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                Verify. Trust. Donate. Built with <Heart size={12} color="#ff4747" fill="#ff4747" /> for transparent giving.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
