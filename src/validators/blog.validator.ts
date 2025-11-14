import { z } from 'zod';

// Create Blog Schema - picture will be uploaded as file, not URL in request
export const CreateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().date('Invalid date format. Use YYYY-MM-DD format'),
  picture: z.string().url('Picture must be a valid URL').optional(), // URL from cloud upload - optional for now
});

export type CreateBlogType = z.infer<typeof CreateBlogSchema>;

// Update Blog Schema - picture optional and will be uploaded as file
export const UpdateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  date: z.string().date('Invalid date format. Use YYYY-MM-DD format').optional(),
  picture: z.string().url('Picture must be a valid URL').optional(), // URL from cloud upload
});

export type UpdateBlogType = z.infer<typeof UpdateBlogSchema>;

// Search Blog Schema
export const SearchBlogSchema = z.object({
  title: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().default(10),
});

export type SearchBlogType = z.infer<typeof SearchBlogSchema>;
