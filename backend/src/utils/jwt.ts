import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../interfaces/user.interface';

export interface JwtPayload {
  id: string;
  userId?: string;
  email?: string;
  role: UserRole;
  walletAddress?: string;
}

/**
 * Generate signed JWT Token
 * @param payload Object containing id, email, role, and optional walletAddress
 */
export const generateJwt = (payload: JwtPayload): string => {
  return jwt.sign(
    {
      id: payload.id,
      userId: payload.id,
      email: payload.email,
      role: payload.role,
      walletAddress: payload.walletAddress,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn as any,
    }
  );
};

/**
 * Verify JWT Token
 * @param token String Bearer token
 */
export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
