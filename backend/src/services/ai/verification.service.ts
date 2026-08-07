import { DocumentModel } from '../../models/Document';
import { Verification } from '../../models/Verification';
import { Campaign } from '../../models/Campaign';
import { geminiService } from './gemini.service';
import { calculateFileSha256 } from '../../utils/crypto';
import { IVerification } from '../../interfaces/verification.interface';
import { logger } from '../../utils/logger';

export class VerificationService {
  /**
   * Processes uploaded file: computes hash, runs Gemini AI OCR/verification, and creates records in MongoDB.
   */
  public async processUploadAndVerify(
    file: Express.Multer.File,
    campaignId?: string,
    uploadedBy?: string
  ): Promise<{ document: any; verification: IVerification }> {
    logger.info(`[Verification Service] Processing file upload: ${file.originalname}`);

    // Step 1: Compute SHA-256 Hash
    const sha256Hash = await calculateFileSha256(file.path);

    // Step 2: Save Document metadata to MongoDB
    const documentDoc = await DocumentModel.create({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      sha256Hash,
      uploadedBy,
    });

    // Step 3: Run Gemini AI OCR & Document Verification
    const aiResult = await geminiService.analyzeDocument(file.path, file.mimetype);

    // Step 4: Save Verification record in MongoDB
    const verificationDoc = await Verification.create({
      campaignId: campaignId ? campaignId : undefined,
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
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        verificationId: verificationDoc._id,
        documentHash: sha256Hash,
        status: 'PENDING_VERIFICATION',
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
