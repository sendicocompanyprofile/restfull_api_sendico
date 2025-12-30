import { Router } from 'express';
import type { NextFunction } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = Router();

// Public routes (no authentication required)
userRouter.post('/users/login', (req, res, next: NextFunction) => userController.login(req as any, res, next));

// Public registration - Anyone can create account
userRouter.post('/users', (req, res, next: NextFunction) => userController.register(req as any, res, next));

// Protected routes (authentication required)
userRouter.get('/users/current', authMiddleware, (req, res, next: NextFunction) => userController.getCurrentUser(req as any, res, next));
userRouter.delete('/users/current', authMiddleware, (req, res, next: NextFunction) => userController.logout(req as any, res, next));
userRouter.patch('/users/:username', authMiddleware, (req, res, next: NextFunction) => userController.updateUser(req as any, res, next));

// Protected routes - User management (any authenticated user can access)
userRouter.get('/users', authMiddleware, (req, res, next: NextFunction) => userController.getAllUsers(req as any, res, next));
userRouter.delete('/users/:username', authMiddleware, (req, res, next: NextFunction) => userController.deleteUser(req as any, res, next));

export default userRouter;
