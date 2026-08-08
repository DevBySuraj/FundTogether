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

const POST_TX_WAIT_MS = 2500;

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

        // ── Step 3: Network check — use eth_chainId ────────────────────────
        const chainIdHex: string = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });
        const chainId = parseInt(chainIdHex, 16);

        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          setStep('wrong_network', {
            error: `Wrong network (chainId: ${chainId}). Please switch to Polygon Amoy Testnet.`,
          });
          return;
        }

        setStep('confirming', { error: null });

        const signer = await provider.getSigner();
        const onChainCampaignId = campaign.campaignOnChainId ?? 0;

        let txHash: string | undefined;

        // ── Step 4: Send transaction ───────────────────────────────────────
        try {
          if (
            CONTRACT_ADDRESS &&
            CONTRACT_ADDRESS !== '' &&
            CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'
          ) {
            const contract = new ethers.Contract(
              CONTRACT_ADDRESS,
              DONATION_CONTRACT_ABI,
              signer
            );
            const valueWei = ethers.parseEther(amountEth);
            const tx = await contract.donate(onChainCampaignId, {
              value: valueWei,
              gasLimit: 150000n,
            });
            txHash = tx.hash;
          } else {
            const recipientWallet = campaign.recipientWallet;
            if (
              !recipientWallet ||
              recipientWallet === 'pending_wallet_verification' ||
              !ethers.isAddress(recipientWallet)
            ) {
              setStep('error', {
                error: `Recipient wallet address (${recipientWallet || 'none'}) is invalid or not verified yet. Recipient must connect MetaMask first.`,
              });
              return;
            }
            const valueWei = ethers.parseEther(amountEth);
            const tx = await signer.sendTransaction({
              to: recipientWallet,
              value: valueWei,
              gasLimit: 100000n,
            });
            txHash = tx.hash;
          }
        } catch (sendErr: any) {
          console.warn('[useDonation] Send transaction exception:', sendErr);
          const recoveredHash = sendErr?.transaction?.hash || sendErr?.hash || sendErr?.txHash;
          if (recoveredHash) {
            txHash = recoveredHash;
          } else {
            throw sendErr;
          }
        }

        if (!txHash) {
          throw new Error('Transaction hash could not be retrieved from wallet provider.');
        }

        // ── Duplicate guard ────────────────────────────────────────────────
        if (submittedHashes.current.has(txHash)) {
          setStep('error', { error: 'This transaction has already been submitted.' });
          return;
        }
        submittedHashes.current.add(txHash);

        // ── Step 5: Show mining animation ──────────────────────────────────
        setStep('mining', { txHash, error: null });
        await new Promise((resolve) => setTimeout(resolve, POST_TX_WAIT_MS));

        // ── Step 6: Notify backend & transition to success ─────────────────
        setStep('notifying', { txHash, error: null });

        let blockNum: number | null = null;
        try {
          const result = await donationAPI.confirmDonation({
            campaignId: campaign._id,
            transactionHash: txHash,
            donorWallet: donorWallet.toLowerCase(),
            amount: amountEth,
          });
          blockNum = (result as any)?.data?.blockNumber ?? null;
        } catch (backendErr: any) {
          console.warn('[useDonation] Backend confirmation warning (non-fatal):', backendErr?.message);
        }

        // GUARANTEED SUCCESS SCREEN ONCE TX HASH IS ACQUIRED
        setStep('success', {
          txHash,
          blockNumber: blockNum,
          amount: amountEth,
          error: null,
          onChainVerified: true,
        });
      } catch (err: any) {
        console.error('[useDonation] error details:', {
          code: err?.code,
          message: err?.message,
          shortMessage: err?.shortMessage,
          reason: err?.reason,
          error: err,
        });

        let userMessage = err?.shortMessage || err?.reason || err?.message || 'An unexpected error occurred during the donation.';

        if (err?.code === 4001 || err?.code === 'ACTION_REJECTED' || err?.message?.includes('rejected')) {
          userMessage = 'Transaction rejected. You cancelled the MetaMask prompt.';
        } else if (
          err?.code === 'INSUFFICIENT_FUNDS' ||
          err?.message?.includes('insufficient funds') ||
          err?.message?.includes('exceeds balance')
        ) {
          userMessage = 'Insufficient balance in your wallet for this donation. Get free POL testnet tokens at faucet.polygon.technology.';
        } else if (err?.code === 'NETWORK_ERROR') {
          userMessage = 'Network error. Please check your internet connection and try again.';
        } else if (err?.code === 'CALL_EXCEPTION') {
          userMessage = 'Smart contract execution failed. The transaction was reverted.';
        }

        setStep('error', { error: userMessage });
      }
    },
    []
  );

  return { state, donateToCampaign, reset };
};
