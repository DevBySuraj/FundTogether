import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '3px solid var(--border-color)',
      padding: '2.5rem 1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          <ShieldCheck size={20} color="var(--accent-lime)" />
          <span>TRUSTCHAIN / FUNDTOGETHER</span>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Transparent Blockchain Donations & Google Gemini AI Document Verification
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Made with <Heart size={14} color="var(--accent-magenta)" fill="var(--accent-magenta)" /> for AlgOlympia
        </div>
      </div>
    </footer>
  );
};
