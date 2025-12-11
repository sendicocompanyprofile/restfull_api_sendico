import type { Request, Response, NextFunction } from 'express';
import { CreateBlogSchema, UpdateBlogSchema, SearchBlogSchema, type CreateBlogType, type UpdateBlogType, type SearchBlogType } from '../validators/blog.validator.js';
import { blogService } from '../services/blog.service.js';
import { cloudStorageService } from '../services/storage.service.js';
import { sendSuccess } from '../utils/response.js';
import { ResponseError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

class BlogController {
  // Create Blog - Protected with file upload
  async createBlog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if file is uploaded
      const file = req.file as Express.Multer.File | undefined;
      let pictureUrl = '';

      // Optional: Upload file if provided
      if (file) {
        const uploadResult = await cloudStorageService.uploadFile({
          fileName: file.originalname,
          fileBuffer: file.buffer,
          mimeType: file.mimetype,
        });
        pictureUrl = uploadResult.url;
      }

      // Validate request body with Zod
      const validatedData = CreateBlogSchema.parse({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        picture: pictureUrl || undefined,
      });

      const blog = await blogService.createBlog(validatedData);
      sendSuccess(res, blog, 201);
    } catch (error) {
      next(error);
    }
  }

  // Get Blog by ID - Public
  async getBlogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ResponseError(400, 'Blog ID is required');
      }

      const blog = await blogService.getBlogById(id);
      sendSuccess(res, blog);
    } catch (error) {
      next(error);
    }
  }

  // Search Blogs - Public
  async searchBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = SearchBlogSchema.parse(req.query);
      const result = await blogService.searchBlogs(params);
      sendSuccess(res, result.data, 200, result.paging);
    } catch (error) {
      next(error);
    }
  }

  // Update Blog - Protected with optional file upload
  async updateBlog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ResponseError(400, 'Blog ID is required');
      }

      // Build update data
      const updateData: any = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
      };

      // Handle optional file upload
      if (req.file) {
        const uploadResult = await cloudStorageService.uploadFile({
          fileName: req.file.originalname,
          fileBuffer: req.file.buffer,
          mimeType: req.file.mimetype,
        });
        updateData.picture = uploadResult.url;
      }

      // Validate request body
      const data = UpdateBlogSchema.parse(updateData);
      const updatedBlog = await blogService.updateBlog(id, data);
      sendSuccess(res, updatedBlog, 200, undefined, 'Blog updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Delete Blog - Protected
  async deleteBlog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ResponseError(400, 'Blog ID is required');
      }

      await blogService.deleteBlog(id);
      sendSuccess(res, { message: 'OK' }, 200);
    } catch (error) {
      next(error);
    }
  }

  // Get All Blogs - Public
  async getAllBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blogs = await blogService.getAllBlogs();
      sendSuccess(res, blogs);
    } catch (error) {
      next(error);
    }
  }
}

export const blogController = new BlogController();
