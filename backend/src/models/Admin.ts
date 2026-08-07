import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IAdmin extends MongooseDocument {
  walletAddress: string;
  permissions: string[];
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    permissions: {
      type: [String],
      default: ['MANAGE_VERIFICATIONS', 'APPROVE_CAMPAIGNS'],
    },
  },
  {
    timestamps: true,
  }
);

export const Admin = model<IAdmin>('Admin', AdminSchema);
