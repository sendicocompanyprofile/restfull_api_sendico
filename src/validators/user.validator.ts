import { z } from 'zod';

// Username must be alphanumeric with underscores only, 3-30 characters
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  );

// Password requirements:
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - At least 1 special character (!@#$%^&*)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /[A-Z]/,
    'Password must contain at least one uppercase letter'
  )
  .regex(
    /[a-z]/,
    'Password must contain at least one lowercase letter'
  )
  .regex(
    /[0-9]/,
    'Password must contain at least one number'
  )
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character (!@#$%^&*)'
  );

// Register Validation
export const RegisterUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserSchema>;

// Login Validation
export const LoginUserSchema = z.object({
  username: usernameSchema,
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginUserRequest = z.infer<typeof LoginUserSchema>;

// Update User Validation
export const UpdateUserSchema = z.object({
  username: usernameSchema.optional(),
  password: passwordSchema.optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must not exceed 50 characters')
    .trim()
    .optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
