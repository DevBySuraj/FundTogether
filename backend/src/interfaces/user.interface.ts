import { Document as MongooseDocument } from 'mongoose';

export type UserRole = 'user' | 'donor' | 'admin';

export interface IUser extends MongooseDocument {
  walletAddress: string;
  nonce: string;
  role: UserRole;
  name?: string;
  email?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
