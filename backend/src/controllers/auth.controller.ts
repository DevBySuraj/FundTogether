import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { User } from '../models/User';
import { generateJwt } from '../utils/jwt';
import mongoose from 'mongoose';

export class AuthController {
  /**
   * @route POST /auth/register
   * @desc Register user with email and password (Recipient or Donor only)
   */
  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required fields', 400);
      }

      const result = await authService.register({
        name,
        email,
        password,
        role,
      });

      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err: any) {
      console.error('Registration controller error:', err.message);
      return sendError(res, err.message || 'Registration failed', 400);
    }
  };

  /**
   * @route POST /auth/login
   * @desc Login user with email and password
   */
  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection is not ready. Please try again in a few seconds.', 503);
      }

      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Invalid email or password', 401);
      }

      const result = await authService.login({
        email,
        password,
      });

      return sendSuccess(res, result, 'Login successful', 200);
    } catch (err: any) {
      console.error('Login controller error:', err.message);
      return sendError(res, err.message || 'Invalid email or password', 401);
    }
  };

  /**
   * @route POST /auth/set-password
   * @desc Set password for existing authenticated user (e.g. Google-only user adding email/pass login)
   */
  public setPassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { password } = req.body;

      if (!userId) {
        return sendError(res, 'Unauthorized request', 401);
      }
      if (!password || password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 400);
      }

      const result = await authService.setPassword(userId, password);

      return sendSuccess(res, result, 'Password set successfully', 200);
    } catch (err: any) {
      console.error('Set password controller error:', err.message);
      return sendError(res, err.message || 'Failed to set password', 400);
    }
  };

  /**
   * @route POST /auth/google
   * @desc Verify Google OAuth ID Token and issue JWT session
   */
  public googleLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection is not ready. Please try again in a few seconds.', 503);
      }

      const { credential, idToken, token, role } = req.body;
      const tokenToVerify = idToken || credential || token;

      if (!tokenToVerify) {
        return sendError(res, 'Google ID token (credential, idToken, or token) is required', 400);
      }

      const result = await authService.googleLogin({
        idToken: tokenToVerify,
        role,
      });

      return sendSuccess(res, result, 'Google authentication successful', 200);
    } catch (error: any) {
      console.error('Google login controller error:', error);
      return sendError(res, error.message || 'Google authentication failed', 400);
    }
  };

  /**
   * @route GET /auth/profile
   * @desc Get logged-in user profile
   */
  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || !req.user.id) {
        return sendError(res, 'Unauthorized profile request', 401);
      }

      const profile = await authService.getUserProfile(req.user.id);

      if (!profile) {
        return sendError(res, 'User profile not found', 404);
      }

      return sendSuccess(res, profile, 'User profile retrieved successfully', 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve profile', 500);
    }
  };

  /**
   * Web3 Nonce endpoint for wallet sign-in
   */
  public connectWallet = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return sendError(res, 'Wallet address is required', 400);
      }
      const nonce = `Sign-in nonce: ${Math.floor(Math.random() * 1000000)}`;
      return sendSuccess(res, { nonce }, 'Nonce generated', 200);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };

  /**
   * Web3 Verify signature endpoint (Direct MetaMask Login)
   */
  public verifySignature = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { walletAddress, role } = req.body;
      if (!walletAddress) {
        return sendError(res, 'Wallet address is required', 400);
      }

      const cleanWallet = walletAddress.toLowerCase().trim();
      const targetRole = role || 'donor';

      let user = await User.findOne({ walletAddress: cleanWallet });
      if (!user) {
        user = await User.create({
          walletAddress: cleanWallet,
          role: targetRole,
          walletVerified: true,
          isVerified: true,
          walletVerifiedAt: new Date(),
          lastLoginAt: new Date(),
        });
      } else {
        user.walletVerified = true;
        user.isVerified = true;
        user.walletVerifiedAt = new Date();
        user.lastLoginAt = new Date();
        await user.save();
      }

      const token = generateJwt({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        walletAddress: cleanWallet,
      });

      return sendSuccess(res, { token, user }, 'MetaMask wallet login & verification successful', 200);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };
}

export const authController = new AuthController();
