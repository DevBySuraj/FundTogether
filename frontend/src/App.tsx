import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { Web3Provider, useWeb3 } from './context/Web3Context';

// Main Public App Components
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/hero/Hero';
import { CampaignGrid } from './components/campaign/CampaignGrid';
import { GuestLandingView } from './components/landing/GuestLandingView';
import { CreateCampaignModal } from './components/campaign/CreateCampaignModal';
import { TrustReportModal } from './components/verification/TrustReportModal';
import { DonateModal } from './components/donate/DonateModal';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/layout/Footer';
import { WalletActivityPage } from './components/wallet/WalletActivityPage';
import type { Campaign } from './types';

// Admin Dedicated Frontend App Components
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminPendingPage } from './admin/pages/AdminPendingPage';
import { AdminCampaignDetailPage } from './admin/pages/AdminCampaignDetailPage';
import { AdminHistoryPage } from './admin/pages/AdminHistoryPage';
import { AdminReportsPage } from './admin/pages/AdminReportsPage';
import { AdminNotificationsPage } from './admin/pages/AdminNotificationsPage';
import { AdminProfilePage } from './admin/pages/AdminProfilePage';

export const PublicPlatform: React.FC = () => {
  const { user } = useWeb3();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeTrustReportId, setActiveTrustReportId] = useState<string | null>(null);
  const [donatingCampaign, setDonatingCampaign] = useState<Campaign | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateModalOpen = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCreateModal={handleCreateModalOpen}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        <Hero
          onOpenCreateModal={handleCreateModalOpen}
          onExploreClick={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              const el = document.getElementById('campaignsSection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {user ? (
          <CampaignGrid
            selectedCategory={selectedCategory}
            onViewTrustReport={(id) => setActiveTrustReportId(id)}
            onDonateClick={(campaign) => setDonatingCampaign(campaign)}
            onOpenCreateModal={handleCreateModalOpen}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <GuestLandingView onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        )}
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

      <DonateModal
        campaign={donatingCampaign}
        onClose={() => setDonatingCampaign(null)}
        onSuccess={handleRefresh}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const WalletActivityView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCreateModal={() => {}}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main style={{ flex: 1 }}>
        <WalletActivityPage />
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
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
          <AdminAuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Platform Routes (Recipient & Donor) */}
                <Route path="/" element={<PublicPlatform />} />
                <Route path="/wallet-activity" element={<WalletActivityView />} />

                {/* Admin Dedicated Entry Point */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin Guarded Protected Dashboard Routes */}
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="pending" element={<AdminPendingPage />} />
                    <Route path="campaign/:id" element={<AdminCampaignDetailPage />} />
                    <Route path="history" element={<AdminHistoryPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
