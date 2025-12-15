import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.js';
import { ResponseError } from '../utils/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    is_admin: boolean;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Accept both 'x-api-token' header and standard 'Authorization: Bearer' header
  let token = req.headers['x-api-token'] as string;
  
  if (!token) {
    // Try Authorization header (Bearer scheme)
    const authHeader = req.headers.authorization as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    throw new ResponseError(401, 'Unauthorized - Token required');
  }

  try {
    // Verify JWT token
    const payload = verifyToken(token);
    
    if (!payload) {
      throw new ResponseError(401, 'Unauthorized - Invalid or expired token');
    }

    req.user = { 
      username: payload.username,
      is_admin: payload.is_admin || false 
    };
    next();
  } catch (error) {
    if (error instanceof ResponseError) {
      throw error;
    }
    throw new ResponseError(401, 'Unauthorized - Invalid token');
  }
}
