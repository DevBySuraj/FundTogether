import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

const UserSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      enum: ['recipient', 'user', 'donor', 'admin', 'authority', 'hospital', 'investigator', 'reviewer'],
      default: 'donor',
      required: true,
    },
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    walletVerified: {
      type: Boolean,
      default: false,
    },
    walletNonce: {
      type: String,
    },
    walletNonceExpires: {
      type: Date,
    },
    walletVerifiedAt: {
      type: Date,
    },
    nonce: {
      type: String,
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
