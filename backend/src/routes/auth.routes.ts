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

/**
 * @route POST /auth/google
 * @desc Verify Google OAuth ID Token and issue JWT session
 */
router.post('/google', authController.googleLogin);

/**
 * @route POST /auth/register
 * @desc Register user with email and password
 */
router.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc Sign in user with email and password
 */
router.post('/login', authController.login);

export default router;
