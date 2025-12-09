import { getPrismaClient } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { ResponseError } from '../utils/errors.js';
import { cloudStorageService } from './storage.service.js';
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
          pictures: {
            create: (request.pictures || []).map(url => ({ url })),
          },
        },
        include: {
          pictures: true,
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
      include: {
        pictures: {
          orderBy: { createdAt: 'asc' },
        },
      },
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
        include: {
          pictures: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.posting.count({ where }),
    ]);

    const totalPage = Math.ceil(total / query.size);

    return {
      data: postings.map(posting => this.formatPosting(posting)),
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
      include: {
        pictures: true,
      },
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
      // Delete old pictures from storage if new ones are provided
      for (const oldPicture of posting.pictures) {
        try {
          await cloudStorageService.deleteFile(oldPicture.url);
        } catch (error) {
          logger.warn('Failed to delete old picture during posting update', {
            postingId: id,
            pictureUrl: oldPicture.url,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Delete old picture records and create new ones
      updateData.pictures = {
        deleteMany: {},
        create: request.pictures.map(url => ({ url })),
      };
    }

    const updatedPosting = await this.prisma.posting.update({
      where: { id },
      data: updateData,
      include: {
        pictures: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    logger.info('Posting updated successfully', { postingId: id });
    return this.formatPosting(updatedPosting);
  }

  async deletePosting(id: string): Promise<void> {
    const posting = await this.prisma.posting.findUnique({
      where: { id },
      include: {
        pictures: true,
      },
    });

    if (!posting) {
      logger.warn('Posting not found for delete', { postingId: id });
      throw new ResponseError(404, 'Posting not found');
    }

    // Delete associated pictures from storage
    for (const picture of posting.pictures) {
      try {
        await cloudStorageService.deleteFile(picture.url);
      } catch (error) {
        logger.warn('Failed to delete picture during posting deletion', {
          postingId: id,
          pictureUrl: picture.url,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    await this.prisma.posting.delete({
      where: { id },
    });

    logger.info('Posting deleted successfully', { postingId: id });
  }

  private formatPosting(posting: any): PostingResponse {
    const pictures: string[] = posting.pictures ? posting.pictures.map((pic: any) => pic.url) : [];

    return {
      id: posting.id,
      title: posting.title,
      description: posting.description,
      date: posting.date.toISOString().split('T')[0],
      pictures,
      createdAt: posting.createdAt.toISOString(),
      updatedAt: posting.updatedAt.toISOString(),
    };
  }
}

export const postingService = new PostingService();
