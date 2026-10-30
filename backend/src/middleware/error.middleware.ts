import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, code: err.code }, err.message);
    } else {
      logger.warn({ code: err.code, details: err.details }, err.message);
    }
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Unhandled / Unexpected error
  logger.error({ err }, 'Unhandled exception');
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message,
    500
  );
}

