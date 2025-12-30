import { z } from 'zod';

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(3, 'Display name must be at least 3 characters')
    .max(100, 'Display name must not exceed 100 characters'),
  bio: z
    .string()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string())
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  github_url: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  portfolio_url: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

