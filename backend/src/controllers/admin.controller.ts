import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { Verification } from '../models/Verification';
import { Campaign } from '../models/Campaign';
import { User } from '../models/User';
import { DocumentModel } from '../models/Document';
import { pinataService } from '../services/storage/pinata.service';
import { blockchainService } from '../services/blockchain/blockchain.service';

export class AdminController {
  /**
   * @route POST /admin/login
   * @desc Admin authentication using Email + Password
   */
  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const result = await adminService.adminLogin({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Admin authentication successful',
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      console.error('Admin login error:', error.message);
      return sendError(res, error.message || 'Invalid credentials', 401);
    }
  };

  /**
   * @route GET /admin/profile
   * @desc Get logged-in admin profile information
   */
  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || !req.user.id) {
        return sendError(res, 'Unauthorized admin request', 401);
      }

      const profile = await adminService.getAdminProfile(req.user.id);

      if (!profile) {
        return sendError(res, 'Admin profile not found', 404);
      }

      return sendSuccess(res, profile, 'Admin profile retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch admin profile', 500);
    }
  };

  /**
   * @route GET /admin/pending
   * @desc Get all pending verifications and campaigns for admin review
   */
  public getPendingVerifications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { status } = req.query;
      const data = await adminService.getPendingCampaigns(status as string);
      return sendSuccess(res, data.unifiedList, 'Pending verifications retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch verifications', 500);
    }
  };

  /**
   * @route POST /admin/approve/:campaignId or POST /admin/approve
   * @desc Approve campaign verification & update User isVerified & walletVerified flags
   */
  public approveVerification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const campaignId = req.params.campaignId || req.body.campaignId;
      const verificationId = req.body.verificationId;
      const notes = req.body.notes;
      const adminWallet = req.user?.email || req.user?.id;

      if (verificationId) {
        const verification = await Verification.findById(verificationId);
        if (verification) {
          const document = await DocumentModel.findById(verification.documentId);
          const targetCampaignId = campaignId || verification.campaignId;
          const campaign = targetCampaignId ? await Campaign.findById(targetCampaignId) : null;

          let ipfsCid = 'QmdemoIpfsCid123';
          let txHash = '0xdemoBlockchainTxHash123';

          if (document && document.path) {
            try {
              ipfsCid = await pinataService.uploadFileToIPFS(document.path, document.filename);
              document.ipfsCid = ipfsCid;
              await document.save();
            } catch (e) {
              console.warn('IPFS upload fallback:', (e as any).message);
            }

            try {
              const recipientWallet = campaign ? campaign.recipientWallet : '0x0000000000000000000000000000000000000000';
              txHash = await blockchainService.storeDocumentOnChain(document.sha256Hash || '', ipfsCid, recipientWallet);
            } catch (e) {
              console.warn('Blockchain store fallback:', (e as any).message);
            }
          }

          verification.status = 'APPROVED';
          verification.reviewedBy = adminWallet;
          verification.reviewNotes = notes || 'Approved by TrustChain Admin';
          verification.onChainTxHash = txHash;
          await verification.save();

          if (campaign) {
            campaign.status = 'ACTIVE';
            campaign.ipfsCid = ipfsCid;
            campaign.txHash = txHash;
            await campaign.save();

            // UPDATE RECIPIENT USER MODEL in MongoDB
            if (campaign.userId) {
              await User.findByIdAndUpdate(campaign.userId, {
                isVerified: true,
                walletVerified: true,
                walletVerifiedAt: new Date(),
              });
            }
          }

          return sendSuccess(res, { verificationId: verification._id, campaignId: campaign?._id, status: 'APPROVED' }, 'Verification approved and recipient user verified');
        }
      }

      if (campaignId) {
        const approvedCampaign = await adminService.approveCampaign(campaignId, notes, adminWallet);
        return sendSuccess(res, approvedCampaign, 'Campaign approved successfully');
      }

      return sendError(res, 'campaignId or verificationId is required', 400);
    } catch (error: any) {
      return sendError(res, error.message || 'Approval workflow failed', 500);
    }
  };

  /**
   * @route POST /admin/reject/:campaignId or POST /admin/reject
   * @desc Reject campaign
   */
  public rejectVerification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const campaignId = req.params.campaignId || req.body.campaignId;
      const verificationId = req.body.verificationId;
      const reason = req.body.reason;
      const adminWallet = req.user?.email || req.user?.id;

      if (verificationId) {
        const verification = await Verification.findById(verificationId);
        if (verification) {
          verification.status = 'REJECTED';
          verification.reviewedBy = adminWallet;
          verification.reviewNotes = reason || 'Rejected by Admin';
          await verification.save();
          if (verification.campaignId) {
            await Campaign.findByIdAndUpdate(verification.campaignId, { status: 'REJECTED' });
          }
          return sendSuccess(res, { verificationId: verification._id, status: 'REJECTED' }, 'Verification rejected');
        }
      }

      if (campaignId) {
        const rejectedCampaign = await adminService.rejectCampaign(campaignId, reason, adminWallet);
        return sendSuccess(res, rejectedCampaign, 'Campaign rejected successfully');
      }

      return sendError(res, 'campaignId or verificationId is required', 400);
    } catch (error: any) {
      return sendError(res, error.message || 'Rejection failed', 500);
    }
  };

  /**
   * @route POST /admin/request-resubmission/:campaignId
   * @desc Request document resubmission for campaign
   */
  public requestResubmission = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const campaignId = req.params.campaignId || req.body.campaignId;
      const reason = req.body.reason;
      const adminWallet = req.user?.email || req.user?.id;

      if (!campaignId) {
        return sendError(res, 'campaignId is required', 400);
      }

      const updatedCampaign = await adminService.requestResubmission(campaignId, reason, adminWallet);
      return sendSuccess(res, updatedCampaign, 'Document resubmission requested successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Request resubmission failed', 500);
    }
  };
}

export const adminController = new AdminController();
