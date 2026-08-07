import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200,
  meta?: any
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errorDetails?: any
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    error: errorDetails ? (typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)) : undefined,
  };
  return res.status(statusCode).json(responsePayload);
};
