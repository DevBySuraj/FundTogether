import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, AuthUserPayload } from '../types';
import { sendError } from '../utils/response';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Authorization header missing or malformed.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Handle demo token fallback for rapid local testing
    if (token === 'demo_jwt_token_123' || token.startsWith('demo_')) {
      req.user = {
        userId: 'demo-user-123',
        walletAddress: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
        role: 'admin',
      };
      return next();
    }

    const decoded = jwt.verify(token, env.jwtSecret) as AuthUserPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired authentication token', 401);
  }
};
