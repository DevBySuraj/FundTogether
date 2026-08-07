import { Document as MongooseDocument, Types } from 'mongoose';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REUPLOAD_REQUESTED';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IAIVerificationResult {
  documentType: string;
  confidence: number;
  risk: RiskLevel;
  summary: string;
  recommendation: string;
  extractedText?: string;
}

export interface IVerification extends MongooseDocument {
  campaignId?: Types.ObjectId;
  documentId: Types.ObjectId;
  documentType: string;
  confidence: number;
  risk: RiskLevel;
  summary: string;
  recommendation: string;
  extractedText?: string;
  rawAiResult?: Record<string, any>;
  status: VerificationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  onChainTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}
