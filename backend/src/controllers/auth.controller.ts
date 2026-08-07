import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
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
      const { walletAddress, signature } = req.body;
      if (!walletAddress || !signature) {
        return sendError(res, 'walletAddress and signature are required', 400);
      }

      const isValid = await walletService.verifySignature(walletAddress, signature);
      if (!isValid) {
        return sendError(res, 'Signature verification failed. Invalid signature or expired nonce.', 401);
      }

      const normalized = normalizeWalletAddress(walletAddress);
      const user = await User.findOne({ walletAddress: normalized });
      if (!user) {
        return sendError(res, 'User record not found', 404);
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
}

export const authController = new AuthController();
