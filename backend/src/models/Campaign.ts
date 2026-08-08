import { Schema, model } from 'mongoose';
import { ICampaign } from '../interfaces/campaign.interface';

const CampaignSchema = new Schema<ICampaign>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      default: 'General',
      index: true,
    },
    recipientWallet: {
      type: String,
      default: 'pending_wallet_verification',
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_VERIFICATION', 'APPROVED', 'ACTIVE', 'REJECTED', 'COMPLETED'],
      default: 'DRAFT',
      index: true,
    },
    verificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Verification',
      index: true,
    },
    documentHash: {
      type: String,
    },
    ipfsCid: {
      type: String,
    },
    txHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user campaigns by category and status
CampaignSchema.index({ userId: 1, status: 1 });
CampaignSchema.index({ recipientWallet: 1, status: 1 });

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);
