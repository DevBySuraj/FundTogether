import { Schema, model } from 'mongoose';
import { ITransaction } from '../interfaces/transaction.interface';

const TransactionSchema = new Schema<ITransaction>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    donorWallet: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipientWallet: {
      type: String,
      required: true,
      lowercase: true,
    },
    amountEth: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    blockNumber: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
