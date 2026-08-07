import { Schema, model } from 'mongoose';
import { IVerification } from '../interfaces/verification.interface';

const VerificationSchema = new Schema<IVerification>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
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
      index: true,
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
      index: true,
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

// Compound index for querying verifications by campaign and status
VerificationSchema.index({ campaignId: 1, status: 1 });

export const Verification = model<IVerification>('Verification', VerificationSchema);
