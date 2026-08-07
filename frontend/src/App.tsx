import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/hero/Hero';
import { CampaignGrid } from './components/campaign/CampaignGrid';
import { CreateCampaignModal } from './components/campaign/CreateCampaignModal';
import { TrustReportModal } from './components/verification/TrustReportModal';
import { AdminPanelModal } from './components/admin/AdminPanelModal';
import { DonateModal } from './components/donate/DonateModal';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/layout/Footer';
import type { Campaign } from './types';

export const AppContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeTrustReportId, setActiveTrustReportId] = useState<string | null>(null);
  const [donatingCampaign, setDonatingCampaign] = useState<Campaign | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        <Hero
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onExploreClick={() => {
            const el = document.getElementById('campaignsSection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <CampaignGrid
          selectedCategory={selectedCategory}
          onViewTrustReport={(id) => setActiveTrustReportId(id)}
          onDonateClick={(campaign) => setDonatingCampaign(campaign)}
          refreshTrigger={refreshTrigger}
        />
      </main>

      <Footer />

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <TrustReportModal
        campaignId={activeTrustReportId}
        onClose={() => setActiveTrustReportId(null)}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onRefreshCampaigns={handleRefresh}
      />

      <DonateModal
        campaign={donatingCampaign}
        onClose={() => setDonatingCampaign(null)}
        onSuccess={handleRefresh}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  const googleClientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
    '109823741982734192837-demo.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <Web3Provider>
          <AppContent />
        </Web3Provider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
