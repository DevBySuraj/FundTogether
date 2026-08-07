import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route POST /auth/google
 * @desc Verify Google token, create user if missing, return JWT
 */
router.post('/google', authController.googleLogin);

/**
 * @route GET /auth/profile
 * @desc Get authenticated user profile information
 */
router.get('/profile', authMiddleware, authController.getProfile);

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
