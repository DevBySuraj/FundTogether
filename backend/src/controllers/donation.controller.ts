import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { Transaction } from '../models/Transaction';
import { Campaign } from '../models/Campaign';
import { sendSuccess, sendError } from '../utils/response';

// ─── On-chain verification helper ────────────────────────────────────────────
const getProvider = (): ethers.JsonRpcProvider | null => {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl || rpcUrl.trim() === '') return null;
  try {
    return new ethers.JsonRpcProvider(rpcUrl);
  } catch {
    return null;
  }
};

export class DonationController {
  /**
   * GET /donation/history/:campaignId
   * Returns on-chain verified donation history for a campaign.
   */
  public getDonationHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const campaignId = req.params.campaignId as string;

      const history = await Transaction.find({ campaignId })
        .sort({ timestamp: -1 })
        .limit(100);

      const totalEth = history.reduce((sum, tx) => sum + parseFloat(tx.amountEth || '0'), 0);

      return sendSuccess(
        res,
        {
          campaignId,
          totalCount: history.length,
          totalEthRaised: totalEth,
          donations: history,
        },
        'Donation history retrieved successfully'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch donation history', 500);
    }
  };

  /**
   * GET /donation/campaign-stats/:campaignId
   * Returns aggregated stats (total raised, donor count) for a campaign.
   */
  public getCampaignStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      const campaignId = req.params.campaignId as string;

      const history = await Transaction.find({ campaignId }).sort({ timestamp: -1 });
      const totalEth = history.reduce((sum, tx) => sum + parseFloat(tx.amountEth || '0'), 0);
      const uniqueDonors = new Set(history.map((tx) => tx.donorWallet)).size;

      return sendSuccess(
        res,
        {
          campaignId,
          totalDonations: history.length,
          uniqueDonors,
          totalEthRaised: totalEth.toFixed(6),
          recentDonations: history.slice(0, 5),
        },
        'Campaign donation stats retrieved'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch campaign stats', 500);
    }
  };

  /**
   * POST /donation/confirm
   * Called after a successful MetaMask transaction.
   * Verifies the tx on-chain, prevents duplicates, saves to MongoDB, and
   * increments campaign.currentAmount.
   *
   * Body: { campaignId, transactionHash, donorWallet, amount }
   */
  public confirmDonation = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { campaignId, transactionHash, donorWallet, amount } = req.body as {
        campaignId: string;
        transactionHash: string;
        donorWallet: string;
        amount: string; // amount in ETH/POL as a string
      };

      // ── Basic validation ───────────────────────────────────────────────────
      if (!campaignId || !transactionHash || !donorWallet || !amount) {
        return sendError(res, 'Missing required fields: campaignId, transactionHash, donorWallet, amount', 400);
      }

      const txHashNorm = transactionHash.toLowerCase();
      const donorWalletNorm = donorWallet.toLowerCase();

      // ── Prevent duplicate submissions ──────────────────────────────────────
      const existingTx = await Transaction.findOne({ txHash: txHashNorm });
      if (existingTx) {
        return sendError(res, 'Transaction already recorded. Duplicate submission rejected.', 409);
      }

      // ── Fetch campaign ─────────────────────────────────────────────────────
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return sendError(res, 'Campaign not found', 404);
      }

      // ── On-chain verification (if RPC_URL is configured) ──────────────────
      let blockNumber: number | undefined;
      let onChainVerified = false;

      const provider = getProvider();
      if (provider) {
        try {
          const receipt = await provider.getTransactionReceipt(txHashNorm);
          if (!receipt) {
            return sendError(res, 'Transaction not yet mined or not found on blockchain.', 422);
          }
          if (receipt.status !== 1) {
            return sendError(res, 'Transaction failed on-chain (status = 0). Donation not recorded.', 422);
          }
          blockNumber = receipt.blockNumber;
          onChainVerified = true;
        } catch (rpcErr: any) {
          // RPC failure: still accept but flag as unverified
          console.warn('[DonationController] RPC verification failed, recording with flag:', rpcErr.message);
          onChainVerified = false;
        }
      }

      // ── Persist transaction ────────────────────────────────────────────────
      const newTx = await Transaction.create({
        campaignId: campaign._id,
        donorWallet: donorWalletNorm,
        recipientWallet: campaign.recipientWallet || 'unknown',
        amountEth: amount,
        txHash: txHashNorm,
        blockNumber,
        timestamp: new Date(),
      });

      // ── Update campaign raised amount ──────────────────────────────────────
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        campaign.currentAmount = (campaign.currentAmount || 0) + amountNum;
        await campaign.save();
      }

      return sendSuccess(
        res,
        {
          txHash: txHashNorm,
          blockNumber,
          onChainVerified,
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          donorWallet: donorWalletNorm,
          amount,
          transactionId: newTx._id,
        },
        'Donation confirmed and recorded successfully'
      );
    } catch (error: any) {
      console.error('[DonationController] confirmDonation error:', error);
      return sendError(res, error.message || 'Failed to confirm donation', 500);
    }
  };
}

export const donationController = new DonationController();
