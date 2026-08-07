import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

/**
 * @openapi
 * /admin/login:
 *   post:
 *     summary: Admin Login using Email + Password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@fundtogether.org
 *               password:
 *                 type: string
 *                 example: AdminSecurePass2026!
 *     responses:
 *       200:
 *         description: Admin authentication successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', adminController.login);

/**
 * All endpoints below require adminAuthMiddleware (JWT verification & role == 'admin')
 */
router.use(adminAuthMiddleware);

/**
 * @openapi
 * /admin/profile:
 *   get:
 *     summary: Get Authenticated Admin Profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Non-admin role)
 */
router.get('/profile', adminController.getProfile);

/**
 * @openapi
 * /admin/pending:
 *   get:
 *     summary: Get Pending Verifications and Campaigns for Admin Review
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending verifications retrieved successfully
 */
router.get('/pending', adminController.getPendingVerifications);

/**
 * @openapi
 * /admin/approve/{campaignId}:
 *   post:
 *     summary: Approve Campaign Verification
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign approved successfully
 */
router.post('/approve/:campaignId', adminController.approveVerification);
router.post('/approve', adminController.approveVerification);

/**
 * @openapi
 * /admin/reject/{campaignId}:
 *   post:
 *     summary: Reject Campaign Verification
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign rejected
 */
router.post('/reject/:campaignId', adminController.rejectVerification);
router.post('/reject', adminController.rejectVerification);

/**
 * @openapi
 * /admin/request-resubmission/{campaignId}:
 *   post:
 *     summary: Request Document Resubmission for Campaign
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document resubmission requested successfully
 */
router.post('/request-resubmission/:campaignId', adminController.requestResubmission);

export default router;
