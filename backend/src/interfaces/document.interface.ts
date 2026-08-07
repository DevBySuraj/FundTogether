import { Document as MongooseDocument, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId?: Types.ObjectId;
  campaignId?: Types.ObjectId;
  originalName: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  sha256Hash?: string;
  ipfsCid?: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
