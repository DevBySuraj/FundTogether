import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

/**
 * @swagger
 * /wallet/nonce:
 *   get:
 *     summary: Generate a 10-minute single-use nonce for Recipient wallet verification
 *     tags: [Wallet Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Restricted to Recipient accounts only
 */
router.get('/nonce', authMiddleware, roleMiddleware(['recipient', 'user']), walletController.getNonce);

/**
 * @swagger
 * /wallet/verify:
 *   post:
 *     summary: Verify MetaMask wallet ownership signature, update Recipient, and activate Campaign to ACTIVE
 *     tags: [Wallet Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0x71c7656ec7ab88b098defb751B7401b5f6d8976f"
 *               signature:
 *                 type: string
 *                 example: "0x..."
 *               campaignId:
 *                 type: string
 *                 example: "65b2a3f1c9e8d7f6a5b4c3d2"
 *     responses:
 *       200:
 *         description: Wallet ownership verified and campaign activated
 *       401:
 *         description: Verification failed or signature mismatch
 *       403:
 *         description: Restricted to Recipient accounts only
 */
router.post('/verify', authMiddleware, roleMiddleware(['recipient', 'user']), walletController.verifyWallet);

/**
 * @swagger
 * /wallet/status:
 *   get:
 *     summary: Get wallet connection and verification status for authenticated user
 *     tags: [Wallet Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet status retrieved successfully
 */
router.get('/status', authMiddleware, walletController.getStatus);

export default router;
