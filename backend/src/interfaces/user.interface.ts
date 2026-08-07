import { Document as MongooseDocument } from 'mongoose';

export type UserRole = 'recipient' | 'user' | 'donor' | 'admin';

export interface IUser extends MongooseDocument {
  googleId?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
  role: UserRole;
  walletAddress?: string;
  walletVerified?: boolean;
  walletNonce?: string;
  walletNonceExpires?: Date;
  walletVerifiedAt?: Date;
  nonce?: string;
  password?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
