import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error('Unhandled API Error:', err.message || err);

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid or expired token', 401);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation Failed', 400, err.errors || err.message);
  }

  if (err.code === 11000) {
    return sendError(res, 'Duplicate resource key error', 409, err.keyValue);
  }

  return sendError(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || err.status || 500
  );
};
