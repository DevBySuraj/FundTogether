import { useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import type { Campaign, DonationStep, DonationState } from '../types';
import { donationAPI } from '../services/api';
import { POLYGON_AMOY_CHAIN_ID, CONTRACT_ADDRESS } from './useMetaMask';

// ─── Minimal ABI for the donation smart contract ──────────────────────────────
// Exposes: donate(uint256 campaignId) payable
const DONATION_CONTRACT_ABI = [
  'function donate(uint256 campaignId) external payable',
  'event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount)',
];

interface UseDonationReturn {
  state: DonationState;
  donateToCampaign: (
    campaign: Campaign,
    amountEth: string,
    donorWallet: string
  ) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE: DonationState = {
  step: 'idle',
  txHash: null,
  blockNumber: null,
  amount: '',
  error: null,
  onChainVerified: false,
};

export const useDonation = (): UseDonationReturn => {
  const [state, setState] = useState<DonationState>(INITIAL_STATE);
  // Prevent duplicate submissions within a session
  const submittedHashes = useRef<Set<string>>(new Set());

  const setStep = (step: DonationStep, extra?: Partial<DonationState>) => {
    setState((s) => ({ ...s, step, ...extra }));
  };

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const donateToCampaign = useCallback(
    async (campaign: Campaign, amountEth: string, donorWallet: string) => {
      // ── Validate amount ────────────────────────────────────────────────────
      const numAmount = parseFloat(amountEth);
      if (isNaN(numAmount) || numAmount <= 0) {
        setStep('error', { error: 'Please enter a valid donation amount greater than 0.' });
        return;
      }

      setState({ ...INITIAL_STATE, step: 'connecting', amount: amountEth });

      try {
        // ── Step 1: Ensure MetaMask is available ───────────────────────────
        if (!(window as any).ethereum) {
          setStep('error', { error: 'MetaMask is not installed. Please install it from metamask.io.' });
          return;
        }

        const provider = new ethers.BrowserProvider((window as any).ethereum);

        // ── Step 2: Request account access ────────────────────────────────
        const accounts = await provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          setStep('error', { error: 'No MetaMask account authorized. Please unlock your wallet.' });
          return;
        }

        // ── Step 3: Verify correct network ────────────────────────────────
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          setStep('wrong_network', {
            error: `Wrong network detected (chainId: ${chainId}). Please switch to Polygon Amoy Testnet.`,
          });
          return;
        }

        // ── Step 4: Prepare contract call ─────────────────────────────────
        setStep('confirming', { error: null });

        const signer = await provider.getSigner();

        // Determine campaignOnChainId: use if available, else fallback to 0
        // (frontend cannot determine campaign index without a registry call,
        //  so we use campaignOnChainId field set by backend on campaign approval)
        const onChainCampaignId = campaign.campaignOnChainId ?? 0;

        let txHash: string;
        let blockNumber: number | undefined;

        if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '' && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
          // ── Real smart contract path ───────────────────────────────────
          const contract = new ethers.Contract(CONTRACT_ADDRESS, DONATION_CONTRACT_ABI, signer);
          const valueWei = ethers.parseEther(amountEth);

          const tx = await contract.donate(onChainCampaignId, { value: valueWei });

          // ── Step 5: Mining ─────────────────────────────────────────────
          txHash = tx.hash;
          setStep('mining', { txHash: tx.hash, error: null });

          const receipt = await tx.wait();
          blockNumber = receipt?.blockNumber;
        } else {
          // ── Fallback: direct ETH transfer to recipient wallet ──────────
          // Used when no smart contract is deployed yet
          const recipientWallet = campaign.recipientWallet;
          if (!recipientWallet || recipientWallet === 'pending_wallet_verification') {
            setStep('error', { error: 'Recipient wallet not verified. Donation cannot proceed.' });
            return;
          }

          const valueWei = ethers.parseEther(amountEth);
          const tx = await signer.sendTransaction({
            to: recipientWallet,
            value: valueWei,
          });

          txHash = tx.hash;
          setStep('mining', { txHash: tx.hash, error: null });

          const receipt = await tx.wait();
          blockNumber = receipt?.blockNumber;
        }

        // ── Duplicate guard ────────────────────────────────────────────────
        if (submittedHashes.current.has(txHash)) {
          setStep('error', { error: 'This transaction has already been submitted.' });
          return;
        }
        submittedHashes.current.add(txHash);

        // ── Step 6: Notify backend ─────────────────────────────────────────
        setStep('notifying', { txHash, blockNumber: blockNumber ?? null, error: null });

        try {
          await donationAPI.confirmDonation({
            campaignId: campaign._id,
            transactionHash: txHash,
            donorWallet: donorWallet.toLowerCase(),
            amount: amountEth,
          });
        } catch (backendErr: any) {
          // Non-fatal: transaction is on-chain regardless
          console.warn('[useDonation] Backend confirmation failed (non-fatal):', backendErr?.message);
        }

        // ── Step 7: Success ────────────────────────────────────────────────
        setStep('success', {
          txHash,
          blockNumber: blockNumber ?? null,
          amount: amountEth,
          error: null,
          onChainVerified: true,
        });
      } catch (err: any) {
        console.error('[useDonation] donation error:', err);

        let userMessage = 'An unexpected error occurred during the donation.';

        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          userMessage = 'Transaction rejected. You cancelled the MetaMask prompt.';
        } else if (err.code === 'INSUFFICIENT_FUNDS' || err.message?.includes('insufficient funds')) {
          userMessage = 'Insufficient balance in your wallet for this donation.';
        } else if (err.code === 'NETWORK_ERROR') {
          userMessage = 'Network error. Please check your internet connection and try again.';
        } else if (err.code === 'CALL_EXCEPTION') {
          userMessage = 'Smart contract execution failed. The transaction was reverted.';
        } else if (err.message?.includes('timeout')) {
          userMessage = 'Transaction timed out waiting for confirmation. Check the blockchain explorer.';
        } else if (err.message) {
          userMessage = err.message;
        }

        setStep('error', { error: userMessage });
      }
    },
    []
  );

  return { state, donateToCampaign, reset };
};
