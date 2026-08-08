import { Document as MongooseDocument, Types } from 'mongoose';

export type CampaignStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'COMPLETED';

export interface ICampaign extends MongooseDocument {
  userId?: Types.ObjectId;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  recipientWallet: string;
  status: CampaignStatus;
  campaignOnChainId?: number;
  verificationId?: Types.ObjectId;
  documentHash?: string;
  ipfsCid?: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}
