import { Router } from 'express';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import verificationRoutes from './verification.routes';
import adminRoutes from './admin.routes';
import donationRoutes from './donation.routes';
import walletRoutes from './wallet.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/campaign', campaignRoutes);
router.use('/verification', verificationRoutes);
router.use('/admin', adminRoutes);
router.use('/donation', donationRoutes);
router.use('/wallet', walletRoutes);

export default router;
