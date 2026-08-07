import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Verification } from '../models/Verification';
import { Campaign } from '../models/Campaign';
import { DocumentModel } from '../models/Document';
import { pinataService } from '../services/storage/pinata.service';
import { blockchainService } from '../services/blockchain/blockchain.service';
import { sendSuccess, sendError } from '../utils/response';

export class AdminController {
  public getPendingVerifications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const pendingList = await Verification.find({ status: 'PENDING' })
        .populate('documentId')
        .populate('campaignId')
        .sort({ createdAt: -1 });

      return sendSuccess(res, pendingList, 'Pending verifications retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch pending verifications', 500);
    }
  };

  public approveVerification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { verificationId, campaignId, notes } = req.body;
      const adminWallet = req.user?.walletAddress;

      if (!verificationId) {
        return sendError(res, 'verificationId is required', 400);
      }

      const verification = await Verification.findById(verificationId);
      if (!verification) {
        return sendError(res, 'Verification record not found', 404);
      }

      const document = await DocumentModel.findById(verification.documentId);
      if (!document) {
        return sendError(res, 'Associated document file not found', 404);
      }

      const targetCampaignId = campaignId || verification.campaignId;
      const campaign = targetCampaignId ? await Campaign.findById(targetCampaignId) : null;

      // 1. Upload original document to Pinata IPFS
      const ipfsCid = await pinataService.uploadFileToIPFS(document.path, document.filename);
      document.ipfsCid = ipfsCid;
      await document.save();

      // 2. Record Document Hash & IPFS CID on Blockchain via Smart Contract
      const recipientWallet = campaign ? campaign.recipientWallet : (document.uploadedBy || '0x0000000000000000000000000000000000000000');
      const txHash = await blockchainService.storeDocumentOnChain(
        document.sha256Hash || '',
        ipfsCid,
        recipientWallet
      );

      // 3. Update Verification & Campaign Status
      verification.status = 'APPROVED';
      verification.reviewedBy = adminWallet;
      verification.reviewNotes = notes || 'Approved by TrustChain Admin';
      verification.onChainTxHash = txHash;
      await verification.save();

      if (campaign) {
        campaign.status = 'ACTIVE';
        campaign.ipfsCid = ipfsCid;
        campaign.documentHash = document.sha256Hash;
        campaign.txHash = txHash;
        await campaign.save();
      }

      return sendSuccess(
        res,
        {
          verificationId: verification._id,
          campaignId: campaign?._id,
          status: 'APPROVED',
          ipfsCid,
          documentHash: document.sha256Hash,
          blockchainTxHash: txHash,
        },
        'Verification approved, IPFS CID pinned, and recorded on-chain successfully'
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Approval workflow failed', 500);
    }
  };

  public rejectVerification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { verificationId, reason, requestReupload } = req.body;
      const adminWallet = req.user?.walletAddress;

      if (!verificationId) {
        return sendError(res, 'verificationId is required', 400);
      }

      const verification = await Verification.findById(verificationId);
      if (!verification) {
        return sendError(res, 'Verification record not found', 404);
      }

      const status = requestReupload ? 'REUPLOAD_REQUESTED' : 'REJECTED';
      verification.status = status;
      verification.reviewedBy = adminWallet;
      verification.reviewNotes = reason || 'Verification rejected during admin audit';
      await verification.save();

      if (verification.campaignId) {
        await Campaign.findByIdAndUpdate(verification.campaignId, {
          status: 'REJECTED',
        });
      }

      return sendSuccess(
        res,
        { verificationId: verification._id, status, reason },
        `Verification marked as ${status}`
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Rejection failed', 500);
    }
  };
}

export const adminController = new AdminController();
