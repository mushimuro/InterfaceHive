import { z } from 'zod';

/**
 * Validation schemas for authentication forms.
 * 
 * Uses Zod for runtime validation with TypeScript type inference.
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email is too long');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Display name validation
export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(100, 'Display name is too long')
  .regex(
    /^[a-zA-Z0-9\s_-]+$/,
    'Display name can only contain letters, numbers, spaces, hyphens, and underscores'
  );

// Registration form schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirm_password: z.string().min(1, 'Please confirm your password'),
  display_name: displayNameSchema,
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset confirm schema
export const passwordResetConfirmSchema = z.object({
  password: passwordSchema,
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// Profile update schema
export const profileUpdateSchema = z.object({
  display_name: displayNameSchema,
  bio: z.string().max(1000, 'Bio is too long').optional(),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills allowed').optional(),
});

// Type inference for TypeScript
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmData = z.infer<typeof passwordResetConfirmSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

