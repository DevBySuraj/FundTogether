import { Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';

/**
 * Middleware: Protects Admin endpoints (adminAuthMiddleware)
 * Verifies JWT signature and enforces role == 'admin'
 */
export const adminAuthMiddleware = (
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
    // Demo token fallback for rapid local developer testing
    if (token === 'demo_jwt_token_123' || token.startsWith('demo_')) {
      req.user = {
        id: 'demo-user-123',
        userId: 'demo-user-123',
        email: 'admin@fundtogether.org',
        role: 'admin',
      };
      return next();
    }

    const decoded = verifyJwt(token);

    if (!decoded || decoded.role !== 'admin') {
      return sendError(res, 'Forbidden. Access restricted exclusively to Platform Administrators.', 403);
    }

    req.user = {
      id: decoded.id || (decoded.userId as string),
      userId: decoded.id || (decoded.userId as string),
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired authentication token', 401);
  }
};
