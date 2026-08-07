import { Schema, model } from 'mongoose';
import { IDocument } from '../interfaces/document.interface';

const DocumentSchema = new Schema<IDocument>(
  {
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    sha256Hash: {
      type: String,
    },
    ipfsCid: {
      type: String,
    },
    uploadedBy: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = model<IDocument>('Document', DocumentSchema);
