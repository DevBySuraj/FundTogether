import { Request } from 'express';
import { UserRole } from '../interfaces/user.interface';

export interface AuthUserPayload {
  userId: string;
  walletAddress: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: any;
}
