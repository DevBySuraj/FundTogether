import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { walletService } from '../services/blockchain/wallet.service';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';
import { User } from '../models/User';
import { normalizeWalletAddress } from '../utils/validator';

export class AuthController {
  public connectWallet = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return sendError(res, 'walletAddress is required', 400);
      }

      const nonce = await walletService.getOrCreateNonce(walletAddress);
      return sendSuccess(res, { walletAddress: normalizeWalletAddress(walletAddress), nonce }, 'Nonce generated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to connect wallet', 400);
    }
  };

  public verifySignature = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { walletAddress, signature, role } = req.body;
      if (!walletAddress || !signature) {
        return sendError(res, 'walletAddress and signature are required', 400);
      }

      const isValid = await walletService.verifySignature(walletAddress, signature);
      if (!isValid) {
        return sendError(res, 'Signature verification failed. Invalid signature or expired nonce.', 401);
      }

      const normalized = normalizeWalletAddress(walletAddress);
      let user = await User.findOne({ walletAddress: normalized });

      if (!user) {
        user = await User.create({
          walletAddress: normalized,
          nonce: Math.floor(Math.random() * 1000000).toString(),
          role: role || 'donor',
        });
      } else if (role && user.role !== role) {
        user.role = role;
        await user.save();
      }

      const token = jwt.sign(
        { userId: user._id.toString(), walletAddress: user.walletAddress, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any }
      );

      return sendSuccess(
        res,
        {
          token,
          user: {
            id: user._id,
            walletAddress: user.walletAddress,
            role: user.role,
          },
        },
        'Authentication successful'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Verification failed', 500);
    }
  };

  public googleLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { credential, role } = req.body;
      if (!credential) {
        return sendError(res, 'Google ID token credential is required', 400);
      }

      let email = '';
      let name = '';
      let googleId = '';

      if (env.googleClientId) {
        const client = new OAuth2Client(env.googleClientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: env.googleClientId,
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email || '';
          name = payload.name || '';
          googleId = payload.sub || '';
        }
      } else {
        // Fallback decoded token payload if Client ID is being configured
        const decoded: any = jwt.decode(credential);
        if (decoded) {
          email = decoded.email || 'google.user@gmail.com';
          name = decoded.name || 'Google User';
          googleId = decoded.sub || 'google-123456';
        } else {
          email = 'google.user@gmail.com';
          name = 'Google User';
          googleId = 'google-123456';
        }
      }

      const assignedRole = role || 'donor';
      const assignedWallet = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;

      let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { googleId }] });

      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          name,
          googleId,
          walletAddress: assignedWallet,
          nonce: Math.floor(Math.random() * 1000000).toString(),
          role: assignedRole,
        });
      } else {
        if (role && user.role !== role) {
          user.role = role;
          await user.save();
        }
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, walletAddress: user.walletAddress, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any }
      );

      return sendSuccess(
        res,
        {
          token,
          user: {
            id: user._id,
            name: user.name || name,
            email: user.email || email,
            walletAddress: user.walletAddress,
            role: user.role,
          },
        },
        'Google authentication successful'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Google authentication failed', 500);
    }
  };

  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password, role, walletAddress } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const assignedWallet = walletAddress ? normalizeWalletAddress(walletAddress) : `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
      
      let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { walletAddress: assignedWallet }] });
      if (user) {
        return sendError(res, 'User already exists with this email or wallet address', 400);
      }

      user = await User.create({
        email: email.toLowerCase(),
        password,
        walletAddress: assignedWallet,
        nonce: Math.floor(Math.random() * 1000000).toString(),
        role: role || 'donor',
      });

      const token = jwt.sign(
        { userId: user._id.toString(), walletAddress: user.walletAddress, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any }
      );

      return sendSuccess(
        res,
        {
          token,
          user: {
            id: user._id,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
          },
        },
        'User registered successfully',
        201
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 500);
    }
  };

  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      let user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        const demoWallet = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
        user = await User.create({
          email: email.toLowerCase(),
          password,
          walletAddress: demoWallet,
          nonce: Math.floor(Math.random() * 1000000).toString(),
          role: role || 'donor',
        });
      } else if (role && user.role !== role) {
        user.role = role;
        await user.save();
      }

      const token = jwt.sign(
        { userId: user._id.toString(), walletAddress: user.walletAddress, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any }
      );

      return sendSuccess(
        res,
        {
          token,
          user: {
            id: user._id,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
          },
        },
        'Login successful'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 500);
    }
  };
}

export const authController = new AuthController();
