import type { Response, NextFunction } from 'express';
import { postingService } from '../services/posting.service.js';
import { cloudStorageService } from '../services/storage.service.js';
import { sendSuccess } from '../utils/response.js';
import { CreatePostingSchema, UpdatePostingSchema, SearchPostingSchema } from '../validators/posting.validator.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { ResponseError } from '../utils/errors.js';

export class PostingController {
  async createPosting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if files are uploaded
      const files = req.files as Express.Multer.File[] | undefined;
      let picturUrls: string[] = [];

      // Optional: Upload files to cloud storage if provided
      if (files && files.length > 0) {
        if (files.length > 3) {
          throw new ResponseError(400, 'Maximum 3 pictures allowed');
        }

        for (const file of files) {
          const uploadResult = await cloudStorageService.uploadFile({
            fileName: file.originalname,
            fileBuffer: file.buffer,
            mimeType: file.mimetype,
          });
          picturUrls.push(uploadResult.url);
        }
      }

      // Validate request body with Zod
      const validatedData = CreatePostingSchema.parse({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        pictures: picturUrls,
      });

      // Create posting in database
      const result = await postingService.createPosting(validatedData);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
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

      // Handle file uploads if provided
      let picturUrls: string[] | undefined;
      const files = req.files as Express.Multer.File[] | undefined;

      if (files && files.length > 0) {
        if (files.length > 3) {
          throw new ResponseError(400, 'Maximum 3 pictures allowed');
        }

        picturUrls = [];
        for (const file of files) {
          const uploadResult = await cloudStorageService.uploadFile({
            fileName: file.originalname,
            fileBuffer: file.buffer,
            mimeType: file.mimetype,
          });
          picturUrls.push(uploadResult.url);
        }
      }

      // Prepare update data
      const updateData: any = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
      };

      if (picturUrls) {
        updateData.pictures = picturUrls;
      }

      const validatedData = UpdatePostingSchema.parse(updateData);
      const result = await postingService.updatePosting(id, validatedData);
      sendSuccess(res, result);
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

      await postingService.deletePosting(id);
      sendSuccess(res, { data: 'OK' });
    } catch (error) {
      next(error);
    }
  }
}

export const postingController = new PostingController();
