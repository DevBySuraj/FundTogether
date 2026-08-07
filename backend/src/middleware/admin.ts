import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    return sendError(res, 'Access denied. Administrator privileges required.', 403);
  }

  return next();
};
