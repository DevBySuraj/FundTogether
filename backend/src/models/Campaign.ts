import { Schema, model } from 'mongoose';
import { ICampaign } from '../interfaces/campaign.interface';

const CampaignSchema = new Schema<ICampaign>(
  {
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
    },
    recipientWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_VERIFICATION', 'ACTIVE', 'REJECTED', 'COMPLETED'],
      default: 'DRAFT',
    },
    verificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Verification',
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

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);
