import { Request, Response } from 'express';
import { Campaign } from '../models/Campaign';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CampaignController {
  public createCampaign = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { title, description, targetAmount, category, recipientWallet } = req.body;

      if (!title || !description || !targetAmount || !recipientWallet) {
        return sendError(res, 'Missing required fields: title, description, targetAmount, recipientWallet', 400);
      }

      const campaign = await Campaign.create({
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        category: category || 'General',
        recipientWallet: recipientWallet.toLowerCase(),
        status: 'DRAFT',
      });

      return sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create campaign', 500);
    }
  };

  public getAllCampaigns = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { category, status } = req.query;
      const queryFilter: any = {};

      if (category) queryFilter.category = category;
      if (status) queryFilter.status = status;

      const campaigns = await Campaign.find(queryFilter)
        .populate('verificationId')
        .sort({ createdAt: -1 });

      return sendSuccess(res, campaigns, 'Campaigns retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch campaigns', 500);
    }
  };

  public getCampaignById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const campaign = await Campaign.findById(id).populate('verificationId');

      if (!campaign) {
        return sendError(res, 'Campaign not found', 404);
      }

      return sendSuccess(res, campaign, 'Campaign retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch campaign', 500);
    }
  };
}

export const campaignController = new CampaignController();
