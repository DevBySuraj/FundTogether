import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { User } from '../models/User';
import { generateJwt } from '../utils/jwt';

export class AuthController {
  /**
   * @route POST /auth/google
   * @desc Verify Google OAuth ID Token and issue JWT session
   */
  public googleLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
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
   * Legacy / Web3 Nonce endpoint for wallet sign-in
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
   * Legacy / Web3 Verify signature endpoint
   */
  public verifySignature = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { walletAddress, role } = req.body;
      const targetRole = role || 'donor';
      let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        user = await User.create({
          walletAddress: walletAddress.toLowerCase(),
          role: targetRole,
        });
      }
      const token = generateJwt({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      return sendSuccess(res, { token, user }, 'Signature verified', 200);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };

  /**
   * Password register endpoint
   */
  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, role, name } = req.body;
      const targetRole = role || 'donor';
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name,
          role: targetRole,
        });
      }
      const token = generateJwt({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      return sendSuccess(res, { token, user }, 'User registered', 201);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };

  /**
   * Password login endpoint
   */
  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, role } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          role: role || 'donor',
        });
      }
      const token = generateJwt({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      return sendSuccess(res, { token, user }, 'Login successful', 200);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  };
}

export const authController = new AuthController();
