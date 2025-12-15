import type { Response, NextFunction } from 'express';
import { postingService } from '../services/posting.service.js';
import { cloudStorageService } from '../services/storage.service.js';
import { sendSuccess } from '../utils/response.js';
import { CreatePostingSchema, UpdatePostingSchema, SearchPostingSchema } from '../validators/posting.validator.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { ResponseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class PostingController {
  async createPosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verify user is authenticated
      if (!req.user?.username) {
        throw new ResponseError(401, 'Unauthorized - Username required');
      }

      // Check if files are uploaded
      const files = req.files as Express.Multer.File[] | undefined;
      let pictureUrls: string[] = [];

      // Optional: Upload files to cloud storage if provided
      if (files && files.length > 0) {
        if (files.length > 3) {
          throw new ResponseError(400, 'Maximum 3 pictures allowed per posting');
        }

        try {
          for (const file of files) {
            const uploadResult = await cloudStorageService.uploadFile({
              fileName: file.originalname,
              fileBuffer: file.buffer,
              mimeType: file.mimetype,
            });
            pictureUrls.push(uploadResult.url);
          }
        } catch (uploadError) {
          // If upload fails, throw a more descriptive error
          throw new ResponseError(500, `Failed to upload new pictures: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}`);
        }
      }

      // Validate request body with Zod
      const validatedData = CreatePostingSchema.parse({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        pictures: pictureUrls,
      });

      // Create posting in database with username
      const result = await postingService.createPosting(validatedData, req.user.username);
      sendSuccess(res, result, 201);
    } catch (error) {
      // Enhanced error handling with more specific messages
      if (error instanceof ResponseError) {
        next(error);
      } else {
        logger.error('Create posting failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        next(new ResponseError(500, 'Failed to create posting'));
      }
    }
  }

  async getPostingById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ResponseError(400, 'Posting ID is required');
      }

      const result = await postingService.getPostingById(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async searchPostings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = SearchPostingSchema.parse(req.query);
      const result = await postingService.getPostingsList(validatedQuery);
      sendSuccess(res, result.data, 200, result.paging);
    } catch (error) {
      next(error);
    }
  }

  async updatePosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ResponseError(400, 'Posting ID is required');
      }

      // Verify user is authenticated
      if (!req.user?.username) {
        throw new ResponseError(401, 'Unauthorized - Username required');
      }

      // Validate storage configuration first
      cloudStorageService.validateStorageConfig();

      // Handle file uploads if provided
      let pictureUrls: string[] | undefined;
      const files = req.files as Express.Multer.File[] | undefined;

      if (files && files.length > 0) {
        if (files.length > 3) {
          throw new ResponseError(400, 'Maximum 3 pictures allowed per posting');
        }

        try {
          pictureUrls = [];
          for (const file of files) {
            const uploadResult = await cloudStorageService.uploadFile({
              fileName: file.originalname,
              fileBuffer: file.buffer,
              mimeType: file.mimetype,
            });
            pictureUrls.push(uploadResult.url);
          }
        } catch (uploadError) {
          // If upload fails, throw a more descriptive error
          throw new ResponseError(500, `Failed to upload pictures: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}`);
        }
      }

      // Prepare update data
      const updateData: any = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
      };

      if (pictureUrls) {
        updateData.pictures = pictureUrls;
      }

      const validatedData = UpdatePostingSchema.parse(updateData);
      const result = await postingService.updatePosting(id, validatedData, req.user.username, req.user.is_admin);
      const message = pictureUrls ? 'Posting updated successfully. Pictures have been updated.' : 'Posting updated successfully.';
      sendSuccess(res, result, 200, undefined, message);
    } catch (error) {
      next(error);
    }
  }

  async deletePosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ResponseError(400, 'Posting ID is required');
      }

      // Verify user is authenticated
      if (!req.user?.username) {
        throw new ResponseError(401, 'Unauthorized - Username required');
      }

      await postingService.deletePosting(id, req.user.username, req.user.is_admin);
      sendSuccess(res, { data: 'OK' });
    } catch (error) {
      next(error);
    }
  }
}

export const postingController = new PostingController();
