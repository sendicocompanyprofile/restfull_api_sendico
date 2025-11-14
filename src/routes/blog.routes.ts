import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { blogController } from '../controllers/blog.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.js';

const blogRouter = Router();

// Public routes (no authentication required)
blogRouter.get('/blogs', (req: Request, res: Response, next: NextFunction) => blogController.searchBlogs(req as any, res, next));
blogRouter.get('/blogs/:id', (req: Request, res: Response, next: NextFunction) => blogController.getBlogById(req as any, res, next));

// Protected routes (authentication required)
blogRouter.post(
  '/blogs',
  authMiddleware,
  uploadMiddleware.single('picture'), // Max 1 file
  handleUploadError, // Error handler for upload
  (req: Request, res: Response, next: NextFunction) => blogController.createBlog(req as any, res, next)
);

blogRouter.patch(
  '/blogs/:id',
  authMiddleware,
  uploadMiddleware.single('picture'), // Max 1 file (optional)
  handleUploadError, // Error handler for upload
  (req: Request, res: Response, next: NextFunction) => blogController.updateBlog(req as any, res, next)
);

blogRouter.delete('/blogs/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => blogController.deleteBlog(req as any, res, next));

export default blogRouter;
