import { Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
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
