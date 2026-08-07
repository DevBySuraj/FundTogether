import { Router } from 'express';
import { donationController } from '../controllers/donation.controller';

const router = Router();

/**
 * @route GET /donation/history/:campaignId
 * @desc Get on-chain verified donation history for a campaign
 */
router.get('/history/:campaignId', donationController.getDonationHistory);

export default router;
