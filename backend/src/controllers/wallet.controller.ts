import { Response } from 'express';
import { walletService } from '../services/wallet.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class WalletController {
  /**
   * @route GET /wallet/nonce
   * @desc Generate a 10-minute single-use nonce for recipient wallet verification
   * @access Authenticated Recipient only
   */
  public getNonce = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await walletService.generateNonce(userId);
      return sendSuccess(res, result, 'Verification nonce generated successfully', 200);
    } catch (error: any) {
      console.error('Wallet getNonce Error:', error.message);
      return sendError(res, error.message || 'Failed to generate verification nonce', 400);
    }
  };

  /**
   * @route POST /wallet/verify
   * @desc Verify MetaMask wallet ownership signature, update Recipient, and activate Campaign to ACTIVE
   * @access Authenticated Recipient only
   */
  public verifyWallet = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { walletAddress, signature, campaignId } = req.body;

      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      if (!walletAddress || !signature) {
        return sendError(res, 'walletAddress and signature are required in request body', 400);
      }

      const result = await walletService.verifyWalletSignature({
        userId,
        walletAddress,
        signature,
        campaignId,
      });

      return sendSuccess(res, result, 'Wallet ownership verified and campaign activated successfully!', 200);
    } catch (error: any) {
      console.error('Wallet verify signature error:', error.message);
      return sendError(res, error.message || 'Wallet verification failed', 401);
    }
  };

  /**
   * @route GET /wallet/status
   * @desc Get wallet connection & verification status for authenticated user
   * @access Authenticated Users
   */
  public getStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await walletService.getWalletStatus(userId);
      return sendSuccess(res, result, 'Wallet status retrieved successfully', 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve wallet status', 500);
    }
  };
}

export const walletController = new WalletController();
