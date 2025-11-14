import { z } from 'zod';

// Register Validation
export const RegisterUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must not exceed 20 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(20, 'Name must not exceed 20 characters'),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserSchema>;

// Login Validation
export const LoginUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginUserRequest = z.infer<typeof LoginUserSchema>;

// Update User Validation
export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters')
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must not exceed 20 characters')
    .optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(20, 'Name must not exceed 20 characters')
    .optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
