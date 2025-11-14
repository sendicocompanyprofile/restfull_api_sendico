import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { postingController } from '../controllers/posting.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.js';

const postingRouter = Router();

// Public routes (no authentication required)
postingRouter.get('/posting', (req: Request, res: Response, next: NextFunction) => postingController.searchPostings(req as any, res, next));
postingRouter.get('/posting/:id', (req: Request, res: Response, next: NextFunction) => postingController.getPostingById(req as any, res, next));

// Protected routes (authentication required)
postingRouter.post(
  '/posting',
  authMiddleware,
  uploadMiddleware.array('pictures', 3), // Max 3 files
  handleUploadError, // Error handler for upload
  (req: Request, res: Response, next: NextFunction) => postingController.createPosting(req as any, res, next)
);
postingRouter.patch(
  '/posting/:id',
  authMiddleware,
  uploadMiddleware.array('pictures', 3), // Max 3 files
  handleUploadError, // Error handler for upload
  (req: Request, res: Response, next: NextFunction) => postingController.updatePosting(req as any, res, next)
);
postingRouter.delete('/posting/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => postingController.deletePosting(req as any, res, next));

export default postingRouter;
