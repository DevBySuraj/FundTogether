import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

/**
 * @route GET /campaign/all or GET /campaign
 * @desc Public - Browse all published campaigns
 */
router.get('/all', campaignController.getAllCampaigns);
router.get('/', campaignController.getAllCampaigns);

/**
 * @route GET /campaign/my
 * @desc Recipient only - Get logged in recipient's created campaigns
 */
router.get('/my', authMiddleware, roleMiddleware(['recipient', 'user']), campaignController.getMyCampaigns);

/**
 * @route GET /campaign/verified
 * @desc Donor only - Browse all verified campaigns
 */
router.get('/verified', authMiddleware, roleMiddleware(['donor']), campaignController.getVerifiedCampaigns);

/**
 * @route POST /campaign/create or POST /campaign
 * @desc Recipient/User - Create new campaign
 */
router.post('/create', authMiddleware, campaignController.createCampaign);
router.post('/', authMiddleware, campaignController.createCampaign);

/**
 * @route GET /campaign/:id/trust-report
 * @desc Public / Donor - Get calculated Trust Score & AI OCR Verification Details
 */
router.get('/:id/trust-report', campaignController.getTrustReport);

/**
 * @route GET /campaign/:id
 * @desc Public - Get campaign details by ID
 */
router.get('/:id', campaignController.getCampaignById);

export default router;
