import type { Response, NextFunction } from 'express';
import { ResponseError } from '../utils/errors.js';
import type { AuthenticatedRequest } from './auth.js';

/**
 * Middleware to verify user is admin
 * Must be used after authMiddleware
 */
export function adminCheckMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.is_admin) {
    throw new ResponseError(403, 'Forbidden - Admin access required');
  }
  next();
}
