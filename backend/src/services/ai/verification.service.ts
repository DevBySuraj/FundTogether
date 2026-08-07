import { DocumentModel } from '../../models/Document';
import { Verification } from '../../models/Verification';
import { Campaign } from '../../models/Campaign';
import { Notification } from '../../models/Notification';
import { geminiService } from './gemini.service';
import { calculateFileSha256 } from '../../utils/crypto';
import { IVerification } from '../../interfaces/verification.interface';
import { logger } from '../../utils/logger';
import { Types } from 'mongoose';

export class VerificationService {
  /**
   * Processes uploaded file: computes hash, runs Gemini AI OCR/verification, and creates records in MongoDB.
   */
  public async processUploadAndVerify(
    file: Express.Multer.File,
    campaignId?: string,
    uploadedBy?: string,
    userId?: string
  ): Promise<{ document: any; verification: IVerification }> {
    logger.info(`[Verification Service] Processing file upload: ${file.originalname}`);

    // Step 1: Compute SHA-256 Hash
    const sha256Hash = await calculateFileSha256(file.path);

    // Step 2: Save Document metadata to MongoDB
    const docData: any = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      sha256Hash,
      uploadedBy,
    };

    if (userId && Types.ObjectId.isValid(userId)) {
      docData.userId = new Types.ObjectId(userId);
    }
    if (campaignId && Types.ObjectId.isValid(campaignId)) {
      docData.campaignId = new Types.ObjectId(campaignId);
    }

    const documentDoc = await DocumentModel.create(docData);

    // Step 3: Run Gemini AI OCR & Document Verification
    const aiResult = await geminiService.analyzeDocument(file.path, file.mimetype);

    // Step 4: Save Verification record in MongoDB
    const verificationDoc = await Verification.create({
      campaignId: campaignId && Types.ObjectId.isValid(campaignId) ? new Types.ObjectId(campaignId) : undefined,
      documentId: documentDoc._id,
      documentType: aiResult.documentType,
      confidence: aiResult.confidence,
      risk: aiResult.risk,
      summary: aiResult.summary,
      recommendation: aiResult.recommendation,
      extractedText: aiResult.extractedText,
      rawAiResult: aiResult,
      status: 'PENDING',
    });

    // Step 5: If campaign ID provided, link verification to campaign and update status
    if (campaignId && Types.ObjectId.isValid(campaignId)) {
      await Campaign.findByIdAndUpdate(campaignId, {
        verificationId: verificationDoc._id,
        documentHash: sha256Hash,
        status: 'PENDING_VERIFICATION',
      });
    }

    // Step 6: Create user notification if userId available
    if (userId && Types.ObjectId.isValid(userId)) {
      await Notification.create({
        userId: new Types.ObjectId(userId),
        title: 'Hospital Verification Uploaded',
        message: `Medical document "${file.originalname}" successfully submitted for AI review (Confidence: ${aiResult.confidence}%).`,
        type: 'info',
      });
    }

    return {
      document: documentDoc,
      verification: verificationDoc,
    };
  }

  /**
   * Retrieves verification status by ID.
   */
  public async getVerificationStatus(id: string) {
    return Verification.findById(id).populate('documentId').populate('campaignId');
  }
}

export const verificationService = new VerificationService();
