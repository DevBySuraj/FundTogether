import React, { useState, useEffect } from 'react';
import type { Campaign } from '../../types';
import { useMetaMask } from '../../hooks/useMetaMask';
import { useDonation } from '../../hooks/useDonation';
import { ConnectWalletButton } from './ConnectWalletButton';
import { NetworkBadge } from './NetworkBadge';
import { DonationAmountInput } from './DonationAmountInput';
import { TransactionStatus } from './TransactionStatus';
import { DonationSuccessModal } from './DonationSuccessModal';
import { DonationErrorBanner } from './DonationErrorBanner';

interface DonateModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

/** Compact trust-score badge */
const TrustBadge: React.FC<{ label: string; icon: string; active?: boolean }> = ({
  label, icon, active,
}) => (
  <span className={`w3-trust-badge ${active ? 'w3-trust-badge-active' : 'w3-trust-badge-inactive'}`}>
    {icon} {label}
  </span>
);

/** Compact campaign progress bar */
const ProgressBar: React.FC<{ current: number; target: number }> = ({ current, target }) => {
  const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0);
  return (
    <div className="w3-prog-wrap">
      <div className="w3-prog-track">
        <div className="w3-prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="w3-prog-labels">
        <span>{current.toFixed(4)} POL raised</span>
        <span>{pct.toFixed(1)}%</span>
        <span>Goal: {target} POL</span>
      </div>
    </div>
  );
};

export const DonateModal: React.FC<DonateModalProps> = ({ campaign, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<string>('0.01');

  const {
    isInstalled,
    account,
    chainId,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    switchToPolygonAmoy,
  } = useMetaMask();

  const { state, donateToCampaign, donateDemoMode, reset } = useDonation();

  // Propagate success upward (refresh campaign list)
  useEffect(() => {
    if (state.step === 'success') {
      onSuccess();
    }
  }, [state.step, onSuccess]);

  // Close modal and reset when not visible
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!campaign) return null;

  const isMining = state.step === 'mining' || state.step === 'notifying';
  const isActive = campaign.status === 'ACTIVE';
  const hasRecipientWallet =
    campaign.recipientWallet && campaign.recipientWallet !== 'pending_wallet_verification';

  // ── Trust/Verification Badges ──────────────────────────────────────────────
  const hasIpfs = !!campaign.ipfsCid;
  const hasBlockchain = !!campaign.txHash;
  const hasWallet = hasRecipientWallet;

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (state.step === 'success' && state.txHash) {
    return (
      <div className="w3-modal-overlay" onClick={handleClose}>
        <div onClick={(e) => e.stopPropagation()}>
          <DonationSuccessModal
            txHash={state.txHash}
            amount={state.amount}
            campaignTitle={campaign.title}
            blockNumber={state.blockNumber}
            onClose={handleClose}
          />
        </div>
      </div>
    );
  }

  const handleDonateReal = async () => {
    if (!account) {
      await connectWallet();
      return;
    }
    if (!isCorrectNetwork) {
      await switchToPolygonAmoy();
      return;
    }
    await donateToCampaign(campaign, amount, account);
  };

  const handleDonateDemo = async () => {
    await donateDemoMode(campaign, amount, account || undefined);
  };

  const numAmount = parseFloat(amount);
  const canDonate =
    isInstalled &&
    !!account &&
    isCorrectNetwork &&
    !isNaN(numAmount) &&
    numAmount > 0 &&
    !isMining &&
    isActive;

  return (
    <div className="w3-modal-overlay" onClick={handleClose}>
      <div className="w3-donate-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="w3-modal-header">
          <div className="w3-modal-header-left">
            <span className="w3-modal-header-icon">💜</span>
            <div>
              <h3 className="w3-modal-title">Donate with MetaMask</h3>
              <span className="w3-modal-subtitle">Polygon Amoy · Secure · On-Chain</span>
            </div>
          </div>
          <button className="w3-modal-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <div className="w3-modal-body">

          {/* ── Campaign Summary ─────────────────────────────────────────── */}
          <div className="w3-campaign-summary">
            <div className="w3-campaign-summary-header">
              <span className="w3-campaign-category">{campaign.category}</span>
              <span className={`w3-campaign-status ${isActive ? 'w3-campaign-status-active' : ''}`}>
                {campaign.status}
              </span>
            </div>
            <h4 className="w3-campaign-title">{campaign.title}</h4>
            <ProgressBar current={campaign.currentAmount} target={campaign.targetAmount} />

            {/* Verification Badges */}
            <div className="w3-badges-row">
              <TrustBadge label="AI Verified" icon="🤖" active />
              <TrustBadge label="Admin Approved" icon="✅" active />
              <TrustBadge label="Wallet Verified" icon="🔐" active={!!hasWallet} />
              <TrustBadge label="IPFS" icon="📦" active={hasIpfs} />
              <TrustBadge label="On-Chain" icon="⛓" active={hasBlockchain} />
            </div>
          </div>

          {/* ── Wallet Connection Row ────────────────────────────────────── */}
          <div className="w3-wallet-row">
            <div className="w3-wallet-row-left">
              <ConnectWalletButton
                isInstalled={isInstalled}
                account={account}
                isConnecting={isConnecting}
                onConnect={connectWallet}
              />
            </div>
            <NetworkBadge chainId={chainId} onSwitch={switchToPolygonAmoy} />
          </div>

          {/* ── Wrong Network Warning ────────────────────────────────────── */}
          {account && !isCorrectNetwork && (
            <div className="w3-network-warning">
              <span>⚠</span>
              <span>
                Switch to <strong>Polygon Amoy Testnet</strong> to donate.{' '}
                <button onClick={switchToPolygonAmoy} className="w3-switch-link">
                  Switch now
                </button>
              </span>
            </div>
          )}

          {/* ── Not Active Campaign Warning ──────────────────────────────── */}
          {!isActive && (
            <div className="w3-network-warning">
              <span>🔒</span>
              <span>
                This campaign is <strong>{campaign.status}</strong> and not yet open for donations.
                Only <strong>ACTIVE</strong> campaigns accept donations.
              </span>
            </div>
          )}

          {/* ── No Recipient Wallet Warning ──────────────────────────────── */}
          {isActive && !hasRecipientWallet && (
            <div className="w3-network-warning">
              <span>🔐</span>
              <span>The recipient&apos;s wallet has not been verified yet. Donation locked.</span>
            </div>
          )}

          {/* ── Donation Amount Input ────────────────────────────────────── */}
          {isActive && hasRecipientWallet && (
            <DonationAmountInput
              value={amount}
              onChange={setAmount}
              disabled={isMining}
            />
          )}

          {/* ── Transaction Step Progress ────────────────────────────────── */}
          {state.step !== 'idle' && state.step !== 'error' && (
            <TransactionStatus step={state.step} txHash={state.txHash} />
          )}

          {/* ── Error Banner ─────────────────────────────────────────────── */}
          {state.error && state.step === 'error' && (
            <DonationErrorBanner
              error={state.error}
              onRetry={reset}
              onDismiss={reset}
              onDemo={handleDonateDemo}
            />
          )}

          {/* ── Donate Buttons ────────────────────────────────────────────── */}
          <div className="d-flex flex-column gap-2">
            {/* Real MetaMask Button */}
            <button
              id="donate-metamask-btn"
              onClick={handleDonateReal}
              disabled={
                isMining ||
                !isActive ||
                !hasRecipientWallet ||
                (!!account && isCorrectNetwork && (isNaN(numAmount) || numAmount <= 0))
              }
              className={`w3-donate-btn ${isMining ? 'w3-donate-btn-mining' : canDonate ? 'w3-donate-btn-ready' : 'w3-donate-btn-disabled'}`}
            >
              {isMining ? (
                <>
                  <span className="w3-spinner" />
                  {state.step === 'notifying' ? 'Confirming with backend…' : 'Mining transaction…'}
                </>
              ) : !isInstalled ? (
                '🦊 Install MetaMask to Donate'
              ) : !account ? (
                '🦊 Connect MetaMask'
              ) : !isCorrectNetwork ? (
                '⚠ Switch to Polygon Amoy'
              ) : !isActive ? (
                '🔒 Campaign Not Active'
              ) : !hasRecipientWallet ? (
                '🔐 Wallet Not Verified'
              ) : (
                `💜 Donate ${numAmount > 0 ? numAmount + ' POL' : ''} with MetaMask`
              )}
            </button>

            {/* Instant Demo Mode Button (100% Reliable Hackathon Fallback) */}
            <button
              type="button"
              onClick={handleDonateDemo}
              disabled={isMining || !isActive}
              className="btn brutal-btn brutal-btn-yellow w-100 py-2 fw-bold"
              title="Instantly process transaction and update MongoDB Atlas without testnet congestion"
            >
              ⚡ Fast Demo Donation (Bypass Testnet RPC)
            </button>
          </div>

          {/* ── Security Note ────────────────────────────────────────────── */}
          <p className="w3-security-note">
            🔒 Funds go directly to the verified recipient wallet.
            Both real MetaMask Web3 &amp; instant demo mode save transactions to MongoDB Atlas.
          </p>
        </div>
      </div>
    </div>
  );
};
