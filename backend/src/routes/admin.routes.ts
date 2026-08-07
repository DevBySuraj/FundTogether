import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// Protect all admin routes with auth and admin role check
router.use(authMiddleware, adminMiddleware);

/**
 * @route GET /admin/pending
 * @desc Get all pending verifications for admin review
 */
router.get('/pending', adminController.getPendingVerifications);

/**
 * @route POST /admin/approve
 * @desc Approve verification -> generate hash -> upload to IPFS -> post to blockchain
 */
router.post('/approve', adminController.approveVerification);

/**
 * @route POST /admin/reject
 * @desc Reject verification or request re-upload
 */
router.post('/reject', adminController.rejectVerification);

export default router;
