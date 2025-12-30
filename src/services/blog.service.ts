import { getPrismaClient } from '../utils/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { ResponseError } from '../utils/errors.js';
import { cloudStorageService } from './storage.service.js';
import type { CreateBlogType, UpdateBlogType, SearchBlogType } from '../validators/blog.validator.js';

interface BlogResponse {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format date
  picture: string;
  create_at: string; // createdAt in response
  update_at: string; // updatedAt in response
}

interface SearchBlogsResponse {
  data: BlogResponse[];
  paging: {
    current_page: number;
    total_page: number;
    size: number;
  };
}

class BlogService {
  private get prisma() {
    return getPrismaClient();
  }

  // Helper function to format blog record for API response
  private formatBlog(blog: any): BlogResponse {
    return {
      id: blog.id,
      title: blog.title,
      description: blog.description,
      date: blog.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      picture: blog.picture,
      create_at: blog.createdAt.toISOString(),
      update_at: blog.updatedAt.toISOString(),
    };
  }

  // Create new blog
  async createBlog(data: CreateBlogType, username: string): Promise<BlogResponse> {
    const dateObj = new Date(data.date);
    
    const blog = await this.prisma.blog.create({
      data: {
        id: uuidv4(),
        title: data.title,
        description: data.description,
        date: dateObj,
        picture: data.picture || '', // Default to empty string if not provided
        username,
      },
    });

    return this.formatBlog(blog);
  }

  // Get blog by ID
  async getBlogById(id: string): Promise<BlogResponse> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      logger.warn('Blog not found', { blogId: id });
      throw new ResponseError(404, 'Blog not found');
    }
    
    return this.formatBlog(blog);
  }

  // Get all blogs with pagination and search
  async searchBlogs(params: SearchBlogType): Promise<SearchBlogsResponse> {
    const { title, page = 1, size = 10 } = params;

    // Build where clause
    const where: any = {};
    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    // Get total count
    const total = await this.prisma.blog.count({ where });
    const total_page = Math.ceil(total / size);

    // Get paginated results
    const blogs = await this.prisma.blog.findMany({
      where,
      skip: (page - 1) * size,
      take: size,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: blogs.map((blog: any) => this.formatBlog(blog)),
      paging: {
        current_page: page,
        total_page,
        size,
      },
    };
  }

  // Update blog
  async updateBlog(
    id: string,
    data: UpdateBlogType,
    username: string
  ): Promise<BlogResponse> {
    // Check if blog exists
    const existingBlog = await this.prisma.blog.findUnique({ where: { id } });

    if (!existingBlog) {
      logger.warn('Blog not found for update', { blogId: id });
      throw new ResponseError(404, 'Blog not found');
    }

    // Check ownership: only owner can update
    if (existingBlog.username !== username) {
      logger.warn('Unauthorized blog update attempt', {
        blogId: id,
        attemptedBy: username,
        owner: existingBlog.username,
      });
      throw new ResponseError(403, 'Forbidden - You can only update your own blogs');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.picture !== undefined) {
      // Delete old picture if a new one is provided and old one exists
      if (existingBlog.picture && existingBlog.picture.trim() !== '') {
        try {
          await cloudStorageService.deleteFile(existingBlog.picture);
        } catch (error) {
          logger.warn('Failed to delete old picture during blog update', {
            blogId: id,
            pictureUrl: existingBlog.picture,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      updateData.picture = data.picture;
    }
    if (data.date !== undefined) {
      updateData.date = new Date(data.date);
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: updateData,
    });

    logger.info('Blog updated successfully', { blogId: id, updatedBy: username });
    return this.formatBlog(updatedBlog);
  }

  // Delete blog
  async deleteBlog(
    id: string,
    username: string
  ): Promise<void> {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      logger.warn('Blog not found for delete', { blogId: id });
      throw new ResponseError(404, 'Blog not found');
    }

    // Check ownership: only owner can delete
    if (blog.username !== username) {
      logger.warn('Unauthorized blog delete attempt', {
        blogId: id,
        attemptedBy: username,
        owner: blog.username,
      });
      throw new ResponseError(403, 'Forbidden - You can only delete your own blogs');
    }

    // Delete associated picture from storage
    if (blog.picture && blog.picture.trim() !== '') {
      try {
        await cloudStorageService.deleteFile(blog.picture);
      } catch (error) {
        logger.warn('Failed to delete picture during blog deletion', {
          blogId: id,
          pictureUrl: blog.picture,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    await this.prisma.blog.delete({ where: { id } });
    logger.info('Blog deleted successfully', { blogId: id, deletedBy: username });
  }

  // Get all blogs (for public listing)
  async getAllBlogs(): Promise<BlogResponse[]> {
    const blogs = await this.prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return blogs.map((blog: any) => this.formatBlog(blog));
  }
}

export const blogService = new BlogService();
