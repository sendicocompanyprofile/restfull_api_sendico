import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { ResponseError } from '../utils/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers['x-api-token'] as string;

  if (!token) {
    throw new ResponseError(401, 'Unauthorized - Token required');
  }

  try {
    // Find user by token
    const username = await userService.getUserByToken(token);
    
    if (!username) {
      throw new ResponseError(401, 'Unauthorized - Invalid token');
    }

    req.user = { username };
    next();
  } catch (error) {
    if (error instanceof ResponseError) {
      throw error;
    }
    throw new ResponseError(401, 'Unauthorized');
  }
}
