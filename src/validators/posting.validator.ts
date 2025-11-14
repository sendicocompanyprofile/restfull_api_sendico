import { z } from 'zod';

// Pictures Validation
const PicturesSchema = z
  .array(
    z
      .string()
      .url('Each picture must be a valid URL')
  )
  .min(0, 'Pictures array') // Min 0, optional
  .max(3, 'Maximum 3 pictures allowed');

// Create Posting Validation
export const CreatePostingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required'),
  date: z
    .string()
    .date('Date must be in valid YYYY-MM-DD format'),
  pictures: PicturesSchema.optional(),
});

export type CreatePostingRequest = z.infer<typeof CreatePostingSchema>;

// Update Posting Validation
export const UpdatePostingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .optional(),
  date: z
    .string()
    .date('Date must be in valid YYYY-MM-DD format')
    .optional(),
  pictures: PicturesSchema.optional(),
});

export type UpdatePostingRequest = z.infer<typeof UpdatePostingSchema>;

// Search Posting Query Validation
export const SearchPostingSchema = z.object({
  title: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(10),
});

export type SearchPostingQuery = z.infer<typeof SearchPostingSchema>;
