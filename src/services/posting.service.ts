import { getPrismaClient } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { ResponseError } from '../utils/errors.js';
import type { CreatePostingRequest, UpdatePostingRequest, SearchPostingQuery } from '../validators/posting.validator.js';
import type { PostingResponse } from '../types/index.js';

export class PostingService {
  private get prisma() {
    return getPrismaClient();
  }
  async createPosting(request: CreatePostingRequest): Promise<PostingResponse> {
    try {
      const posting = await this.prisma.posting.create({
        data: {
          title: request.title,
          description: request.description,
          date: new Date(request.date),
          pictures: JSON.stringify(request.pictures || []),
        },
      });

      return this.formatPosting(posting);
    } catch (error) {
      logger.error('Create posting failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to create posting');
    }
  }

  async getPostingById(id: string): Promise<PostingResponse> {
    const posting = await this.prisma.posting.findUnique({
      where: { id },
    });

    if (!posting) {
      logger.warn('Posting not found', { postingId: id });
      throw new ResponseError(404, 'Posting not found');
    }

    return this.formatPosting(posting);
  }

  async getPostingsList(query: SearchPostingQuery): Promise<{
    data: PostingResponse[];
    paging: {
      current_page: number;
      total_page: number;
      size: number;
    };
  }> {
    const skip = (query.page - 1) * query.size;

    const where: any = {};
    if (query.title) {
      where.title = {
        contains: query.title,
      };
    }

    const [postings, total] = await Promise.all([
      this.prisma.posting.findMany({
        where,
        skip,
        take: query.size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.posting.count({ where }),
    ]);

    const totalPage = Math.ceil(total / query.size);

    return {
      data: postings.map((posting: any) => this.formatPosting(posting)),
      paging: {
        current_page: query.page,
        total_page: totalPage,
        size: query.size,
      },
    };
  }

  async updatePosting(id: string, request: UpdatePostingRequest): Promise<PostingResponse> {
    const posting = await this.prisma.posting.findUnique({
      where: { id },
    });

    if (!posting) {
      logger.warn('Posting not found for update', { postingId: id });
      throw new ResponseError(404, 'Posting not found');
    }

    const updateData: any = {};

    if (request.title) {
      updateData.title = request.title;
    }

    if (request.description) {
      updateData.description = request.description;
    }

    if (request.date) {
      updateData.date = new Date(request.date);
    }

    if (request.pictures) {
      updateData.pictures = JSON.stringify(request.pictures);
    }

    const updatedPosting = await this.prisma.posting.update({
      where: { id },
      data: updateData,
    });

    logger.info('Posting updated successfully', { postingId: id });
    return this.formatPosting(updatedPosting);
  }

  async deletePosting(id: string): Promise<void> {
    const posting = await this.prisma.posting.findUnique({
      where: { id },
    });

    if (!posting) {
      logger.warn('Posting not found for delete', { postingId: id });
      throw new ResponseError(404, 'Posting not found');
    }

    await this.prisma.posting.delete({
      where: { id },
    });

    logger.info('Posting deleted successfully', { postingId: id });
  }

  private formatPosting(posting: any): PostingResponse {
    return {
      id: posting.id,
      title: posting.title,
      description: posting.description,
      date: posting.date.toISOString().split('T')[0],
      pictures: JSON.parse(posting.pictures),
      createdAt: posting.createdAt.toISOString(),
      updatedAt: posting.updatedAt.toISOString(),
    };
  }
}

export const postingService = new PostingService();
