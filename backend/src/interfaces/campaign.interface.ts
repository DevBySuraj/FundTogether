import { Document as MongooseDocument, Types } from 'mongoose';

export type CampaignStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED' | 'COMPLETED';

export interface ICampaign extends MongooseDocument {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  recipientWallet: string;
  status: CampaignStatus;
  verificationId?: Types.ObjectId;
  documentHash?: string;
  ipfsCid?: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}
