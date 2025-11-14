import type { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import { RegisterUserSchema, LoginUserSchema, UpdateUserSchema } from '../validators/user.validator.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { ResponseError } from '../utils/errors.js';

export class UserController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Zod parse akan throw ZodError jika invalid, middleware akan catch
      const validatedData = RegisterUserSchema.parse(req.body);
      const result = await userService.register(validatedData);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = LoginUserSchema.parse(req.body);
      const result = await userService.login(validatedData);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.username) {
        throw new ResponseError(401, 'Unauthorized');
      }

      const result = await userService.getCurrentUser(req.user.username);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.username) {
        throw new ResponseError(401, 'Unauthorized');
      }

      const validatedData = UpdateUserSchema.parse(req.body);
      const result = await userService.updateUser(req.user.username, validatedData);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.username) {
        throw new ResponseError(401, 'Unauthorized');
      }

      await userService.logout(req.user.username);
      sendSuccess(res, { data: 'OK' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
