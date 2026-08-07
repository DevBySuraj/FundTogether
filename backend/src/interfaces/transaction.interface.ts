import { Document as MongooseDocument, Types } from 'mongoose';

export interface ITransaction extends MongooseDocument {
  campaignId: Types.ObjectId;
  donorWallet: string;
  recipientWallet: string;
  amountEth: string;
  txHash: string;
  blockNumber?: number;
  timestamp: Date;
  createdAt: Date;
}
