import { Router } from 'express';
import { donationController } from '../controllers/donation.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route GET /donation/history/:campaignId
 * @desc Get on-chain verified donation history for a campaign (public)
 */
router.get('/history/:campaignId', donationController.getDonationHistory);

/**
 * @route GET /donation/campaign-stats/:campaignId
 * @desc Get aggregated stats (total raised, donor count) for a campaign (public)
 */
router.get('/campaign-stats/:campaignId', donationController.getCampaignStats);

/**
 * @route POST /donation/confirm
 * @desc Confirm a MetaMask donation after on-chain execution (requires JWT auth)
 * Body: { campaignId, transactionHash, donorWallet, amount }
 */
router.post('/confirm', authMiddleware, donationController.confirmDonation);

export default router;
