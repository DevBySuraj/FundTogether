import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { trustController } from '../controllers/trust.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route POST /campaign/create
 * @desc Create a new campaign draft
 */
router.post('/create', authMiddleware, campaignController.createCampaign);

/**
 * @route GET /campaign/all
 * @desc Get all campaigns
 */
router.get('/all', campaignController.getAllCampaigns);

/**
 * @route GET /campaign/:id
 * @desc Get details of a single campaign
 */
router.get('/:id', campaignController.getCampaignById);

/**
 * @route GET /campaign/:id/trust-report
 * @desc Get transparent Trust Report for a campaign
 */
router.get('/:id/trust-report', trustController.getTrustReport);

export default router;
