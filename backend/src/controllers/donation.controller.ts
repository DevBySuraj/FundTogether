import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { sendSuccess, sendError } from '../utils/response';

export class DonationController {
  public getDonationHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const campaignId = req.params.campaignId as string;

      const history = await Transaction.find({ campaignId })
        .sort({ timestamp: -1 })
        .limit(100);

      const totalEth = history.reduce((sum, tx) => sum + parseFloat(tx.amountEth || '0'), 0);

      return sendSuccess(
        res,
        {
          campaignId,
          totalCount: history.length,
          totalEthRaised: totalEth,
          donations: history,
        },
        'Donation history retrieved successfully'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch donation history', 500);
    }
  };
}

export const donationController = new DonationController();
