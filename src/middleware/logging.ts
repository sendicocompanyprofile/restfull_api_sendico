import type { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger.js';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique request ID
  req.id = uuid();
  
  const startTime = Date.now();
  const { method, path, ip, headers } = req;
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.id,
    method,
    path,
    ip,
    userAgent: headers['user-agent'],
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Log request completion
    logger.info('Request completed', {
      requestId: req.id,
      method,
      path,
      status: statusCode,
      duration: `${duration}ms`,
      ip,
    });

    return originalSend.call(this, data);
  };

  next();
};
