import { useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import type { Campaign, DonationStep, DonationState } from '../types';
import { donationAPI } from '../services/api';
import { POLYGON_AMOY_CHAIN_ID, CONTRACT_ADDRESS } from './useMetaMask';

// ─── Minimal ABI for the donation smart contract ──────────────────────────────
const DONATION_CONTRACT_ABI = [
  'function donate(uint256 campaignId) external payable',
  'event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount)',
];

// ─── How many ms to wait before calling backend after tx broadcast ────────────
// Gives the node time to index the tx without hammering the public RPC with polling
const POST_TX_WAIT_MS = 4000;

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
  const submittedHashes = useRef<Set<string>>(new Set());

  const setStep = (step: DonationStep, extra?: Partial<DonationState>) => {
    setState((s) => ({ ...s, step, ...extra }));
  };

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const donateToCampaign = useCallback(
    async (campaign: Campaign, amountEth: string, donorWallet: string) => {
      const numAmount = parseFloat(amountEth);
      if (isNaN(numAmount) || numAmount <= 0) {
        setStep('error', { error: 'Please enter a valid donation amount greater than 0.' });
        return;
      }

      setState({ ...INITIAL_STATE, step: 'connecting', amount: amountEth });

      try {
        // ── Step 1: MetaMask check ─────────────────────────────────────────
        if (!(window as any).ethereum) {
          setStep('error', { error: 'MetaMask is not installed. Please install it from metamask.io.' });
          return;
        }

        const provider = new ethers.BrowserProvider((window as any).ethereum);

        // ── Step 2: Request accounts ───────────────────────────────────────
        const accounts = await provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          setStep('error', { error: 'No MetaMask account authorized. Please unlock your wallet.' });
          return;
        }

        // ── Step 3: Network check ──────────────────────────────────────────
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          setStep('wrong_network', {
            error: `Wrong network (chainId: ${chainId}). Please switch to Polygon Amoy Testnet.`,
          });
          return;
        }

        setStep('confirming', { error: null });

        const signer = await provider.getSigner();
        const onChainCampaignId = campaign.campaignOnChainId ?? 0;

        let txHash: string;

        // ── Step 4: Send transaction — DO NOT call tx.wait() ──────────────
        // tx.wait() polls the public Amoy RPC which rate-limits at -32002.
        // Instead we grab the hash immediately and let the backend verify.
        if (
          CONTRACT_ADDRESS &&
          CONTRACT_ADDRESS !== '' &&
          CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'
        ) {
          // ── Smart contract path ────────────────────────────────────────
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            DONATION_CONTRACT_ABI,
            signer
          );
          const valueWei = ethers.parseEther(amountEth);
          const tx = await contract.donate(onChainCampaignId, { value: valueWei });
          txHash = tx.hash;
        } else {
          // ── Fallback: direct transfer to recipient wallet ───────────────
          const recipientWallet = campaign.recipientWallet;
          if (!recipientWallet || recipientWallet === 'pending_wallet_verification') {
            setStep('error', { error: 'Recipient wallet not verified. Donation cannot proceed.' });
            return;
          }
          const valueWei = ethers.parseEther(amountEth);
          const tx = await signer.sendTransaction({ to: recipientWallet, value: valueWei });
          txHash = tx.hash;
        }

        // ── Duplicate guard ────────────────────────────────────────────────
        if (submittedHashes.current.has(txHash)) {
          setStep('error', { error: 'This transaction has already been submitted.' });
          return;
        }
        submittedHashes.current.add(txHash);

        // ── Step 5: Show "mining" with hash — wait a few seconds ──────────
        // We skip tx.wait() to avoid the rate-limited public Amoy RPC.
        // A short delay lets the node propagate before the backend queries it.
        setStep('mining', { txHash, error: null });
        await new Promise((resolve) => setTimeout(resolve, POST_TX_WAIT_MS));

        // ── Step 6: Notify backend (non-blocking on failure) ───────────────
        setStep('notifying', { txHash, error: null });

        try {
          const result = await donationAPI.confirmDonation({
            campaignId: campaign._id,
            transactionHash: txHash,
            donorWallet: donorWallet.toLowerCase(),
            amount: amountEth,
          });
          // Extract blockNumber from backend response if available
          const blockNum = (result as any)?.data?.blockNumber ?? null;
          setStep('success', {
            txHash,
            blockNumber: blockNum,
            amount: amountEth,
            error: null,
            onChainVerified: true,
          });
        } catch (backendErr: any) {
          // Backend failed (e.g. not yet mined) — still show success on frontend
          // because the tx IS on-chain. Backend can re-verify via explorer.
          console.warn('[useDonation] Backend confirmation warning:', backendErr?.message);
          setStep('success', {
            txHash,
            blockNumber: null,
            amount: amountEth,
            error: null,
            onChainVerified: false,
          });
        }
      } catch (err: any) {
        console.error('[useDonation] error:', err);

        let userMessage = 'An unexpected error occurred during the donation.';

        if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
          userMessage = 'Transaction rejected. You cancelled the MetaMask prompt.';
        } else if (
          err.code === 'INSUFFICIENT_FUNDS' ||
          err.message?.includes('insufficient funds')
        ) {
          userMessage = 'Insufficient balance in your wallet for this donation.';
        } else if (err.code === -32002 || err.message?.includes('too many errors')) {
          userMessage =
            'RPC rate limit hit. The transaction may still be processing — check PolygonScan with your wallet address.';
        } else if (err.code === 'NETWORK_ERROR') {
          userMessage = 'Network error. Please check your connection and try again.';
        } else if (err.code === 'CALL_EXCEPTION') {
          userMessage = 'Smart contract reverted. Transaction was not executed.';
        } else if (err.message?.includes('timeout')) {
          userMessage = 'Confirmation timed out. Check PolygonScan before retrying.';
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
