import { Schema, model } from 'mongoose';
import { IVerification } from '../interfaces/verification.interface';

const VerificationSchema = new Schema<IVerification>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    risk: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
      default: 'Low',
    },
    summary: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
    },
    rawAiResult: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUESTED'],
      default: 'PENDING',
    },
    reviewedBy: {
      type: String,
      lowercase: true,
    },
    reviewNotes: {
      type: String,
    },
    onChainTxHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Verification = model<IVerification>('Verification', VerificationSchema);
