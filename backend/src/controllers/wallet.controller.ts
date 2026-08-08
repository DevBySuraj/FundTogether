import { Response } from 'express';
import { walletService } from '../services/wallet.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { UserRole } from '../interfaces/user.interface';

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

  /**
   * @route GET /wallet/activity
   * @desc Get role-filtered wallet activity and transaction history
   * @access Authenticated Users
   */
  public getActivity = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const userRole = (req.user?.role || 'donor') as UserRole;

      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const { search, status, category, startDate, endDate, minAmount, maxAmount, page, limit } = req.query;

      const result = await walletService.getWalletActivity({
        userId,
        userRole,
        search: search as string,
        status: status as string,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return sendSuccess(res, result, 'Role-based wallet activity retrieved successfully', 200);
    } catch (error: any) {
      console.error('Wallet getActivity error:', error.message);
      return sendError(res, error.message || 'Failed to fetch wallet activity', 500);
    }
  };

  /**
   * @route GET /wallet/transactions
   * @desc Get role-filtered transactions list
   * @access Authenticated Users
   */
  public getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    return this.getActivity(req, res);
  };

  /**
   * @route GET /wallet/statistics
   * @desc Get role-specific summary statistics cards
   * @access Authenticated Users
   */
  public getStatistics = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const userRole = (req.user?.role || 'donor') as UserRole;

      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await walletService.getWalletStatistics(userId, userRole);
      return sendSuccess(res, result, 'Role-based wallet statistics retrieved successfully', 200);
    } catch (error: any) {
      console.error('Wallet getStatistics error:', error.message);
      return sendError(res, error.message || 'Failed to fetch wallet statistics', 500);
    }
  };

  /**
   * @route GET /wallet/summary
   * @desc Get dashboard widget summary for role
   * @access Authenticated Users
   */
  public getSummary = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const userRole = (req.user?.role || 'donor') as UserRole;

      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await walletService.getWalletSummary(userId, userRole);
      return sendSuccess(res, result, 'Role-based wallet summary retrieved successfully', 200);
    } catch (error: any) {
      console.error('Wallet getSummary error:', error.message);
      return sendError(res, error.message || 'Failed to fetch wallet summary', 500);
    }
  };

  /**
   * @route GET /wallet/details/:transactionHash or /wallet/:transactionHash
   * @desc Get transaction details modal data by transaction hash
   * @access Authenticated Users
   */
  public getTransactionDetails = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const userRole = (req.user?.role || 'donor') as UserRole;
      const { transactionHash } = req.params;

      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      if (!transactionHash) {
        return sendError(res, 'transactionHash URL parameter is required', 400);
      }

      const hashStr = Array.isArray(transactionHash) ? transactionHash[0] : String(transactionHash);
      const result = await walletService.getTransactionDetails(hashStr, userId, userRole);
      return sendSuccess(res, result, 'Transaction details retrieved successfully', 200);
    } catch (error: any) {
      console.error('Wallet getTransactionDetails error:', error.message);
      return sendError(res, error.message || 'Failed to fetch transaction details', 404);
    }
  };
}

export const walletController = new WalletController();
