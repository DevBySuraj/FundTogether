import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { verificationService } from '../services/ai/verification.service';
import { sendSuccess, sendError } from '../utils/response';

export class VerificationController {
  public uploadDocument = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        return sendError(res, 'No verification document file attached. Please upload an image or PDF file.', 400);
      }

      const { campaignId } = req.body;
      const uploadedBy = req.user?.walletAddress || req.user?.email;
      const userId = req.user?.id || req.user?.userId;

      const result = await verificationService.processUploadAndVerify(
        req.file,
        campaignId,
        uploadedBy,
        userId
      );

      return sendSuccess(
        res,
        {
          verificationId: result.verification._id,
          documentId: result.document._id,
          originalName: result.document.originalName,
          sha256Hash: result.document.sha256Hash,
          aiResult: {
            documentType: result.verification.documentType,
            confidence: result.verification.confidence,
            risk: result.verification.risk,
            summary: result.verification.summary,
            recommendation: result.verification.recommendation,
            extractedText: result.verification.extractedText,
          },
          status: result.verification.status,
        },
        'Document uploaded and analyzed by Gemini AI engine successfully',
        201
      );
    } catch (error: any) {
      console.error('Verification Upload Error:', error);
      return sendError(res, error.message || 'Verification upload failed', 500);
    }
  };

  public getStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const verification = await verificationService.getVerificationStatus(id);

      if (!verification) {
        return sendError(res, 'Verification record not found', 404);
      }

      return sendSuccess(res, verification, 'Verification status retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch status', 500);
    }
  };
}

export const verificationController = new VerificationController();
