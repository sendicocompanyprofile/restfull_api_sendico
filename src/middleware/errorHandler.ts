import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ResponseError } from '../utils/errors.js';
import { sendError, formatZodErrors } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Global error handling middleware
 * Catches all errors thrown from routes and translates them to JSON responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.id || 'unknown';

  // Handle ResponseError (custom business logic errors)
  if (err instanceof ResponseError) {
    logger.warn('ResponseError caught', {
      requestId,
      status: err.status,
      message: err.message,
      path: req.path,
      method: req.method,
    });

    sendError(res, err.message, err.status);
    return;
  }

  // Handle ZodError (validation errors)
  if (err instanceof ZodError) {
    logger.warn('Validation error caught', {
      requestId,
      path: req.path,
      method: req.method,
      errors: formatZodErrors(err),
    });

    sendError(res, formatZodErrors(err), 400);
    return;
  }

  // Handle generic errors
  logger.error('Unexpected error caught', {
    requestId,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  sendError(res, 'Internal server error', 500);
};
