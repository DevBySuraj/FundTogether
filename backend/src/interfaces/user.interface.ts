import { Document as MongooseDocument } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends MongooseDocument {
  walletAddress: string;
  nonce: string;
  role: UserRole;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
