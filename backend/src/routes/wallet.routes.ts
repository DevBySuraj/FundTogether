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
 */
router.get('/nonce', authMiddleware, roleMiddleware(['recipient', 'user']), walletController.getNonce);

/**
 * @swagger
 * /wallet/verify:
 *   post:
 *     summary: Verify MetaMask wallet ownership signature, update Recipient, and activate Campaign
 */
router.post('/verify', authMiddleware, roleMiddleware(['recipient', 'user']), walletController.verifyWallet);

/**
 * @swagger
 * /wallet/status:
 *   get:
 *     summary: Get wallet connection and verification status for authenticated user
 */
router.get('/status', authMiddleware, walletController.getStatus);

/**
 * @swagger
 * /wallet/activity:
 *   get:
 *     summary: Get role-filtered wallet activity and transaction history
 */
router.get('/activity', authMiddleware, walletController.getActivity);

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get role-filtered transaction list
 */
router.get('/transactions', authMiddleware, walletController.getTransactions);

/**
 * @swagger
 * /wallet/statistics:
 *   get:
 *     summary: Get role-specific summary statistics cards
 */
router.get('/statistics', authMiddleware, walletController.getStatistics);

/**
 * @swagger
 * /wallet/summary:
 *   get:
 *     summary: Get dashboard widget summary for role
 */
router.get('/summary', authMiddleware, walletController.getSummary);

/**
 * @swagger
 * /wallet/details/:transactionHash:
 *   get:
 *     summary: Get single transaction details modal data
 */
router.get('/details/:transactionHash', authMiddleware, walletController.getTransactionDetails);
router.get('/:transactionHash', authMiddleware, walletController.getTransactionDetails);

export default router;
