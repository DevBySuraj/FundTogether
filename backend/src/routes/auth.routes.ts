import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route POST /auth/register
 * @desc Register user with email and password (Recipient or Donor only)
 */
router.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc Login user with email and password
 */
router.post('/login', authController.login);

/**
 * @route POST /auth/set-password
 * @desc Set password for existing authenticated user (Google OAuth account linking)
 */
router.post('/set-password', authMiddleware, authController.setPassword);

/**
 * @route POST /auth/google
 * @desc Verify Google OAuth ID token, issue JWT session
 */
router.post('/google', authController.googleLogin);

/**
 * @route GET /auth/profile
 * @desc Get authenticated user profile information
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route POST /auth/connect-wallet
 * @desc Get authentication nonce for Web3 wallet address
 */
router.post('/connect-wallet', authController.connectWallet);

/**
 * @route POST /auth/verify-signature
 * @desc Verify EIP-191 message signature and obtain JWT session token
 */
router.post('/verify-signature', authController.verifySignature);

export default router;
