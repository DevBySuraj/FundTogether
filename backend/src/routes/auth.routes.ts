import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

/**
 * @route POST /auth/connect-wallet
 * @desc Get authentication nonce for wallet address
 */
router.post('/connect-wallet', authController.connectWallet);

/**
 * @route POST /auth/verify-signature
 * @desc Verify EIP-191 message signature and obtain JWT token
 */
router.post('/verify-signature', authController.verifySignature);

export default router;
