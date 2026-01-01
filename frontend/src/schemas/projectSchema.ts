import { z } from 'zod';

/**
 * Validation schemas for project forms.
 * 
 * Uses Zod for runtime validation with TypeScript type inference.
 */

// Project title validation
export const projectTitleSchema = z
  .string()
  .min(10, 'Title must be at least 10 characters')
  .max(200, 'Title is too long (max 200 characters)');

// Project description validation
export const projectDescriptionSchema = z
  .string()
  .min(50, 'Description must be at least 50 characters')
  .max(5000, 'Description is too long (max 5000 characters)');

// GitHub URL validation
export const githubUrlSchema = z
  .string()
  .url('Invalid URL')
  .regex(
    /^https?:\/\/(www\.)?github\.com\/.+/,
    'Must be a valid GitHub URL'
  )
  .optional()
  .or(z.literal(''));

// Difficulty level validation
export const difficultySchema = z.enum(['easy', 'intermediate', 'advanced'] as [string, ...string[]]).or(z.literal(''));

// Project create/edit schema
export const projectSchema = z.object({
  title: projectTitleSchema,
  description: projectDescriptionSchema,
  what_it_does: z.string().max(1000, 'What it does is too long').optional(),
  inputs_dependencies: z.string().max(2000, 'Inputs/dependencies is too long').optional(),
  desired_outputs: z.string().min(20, 'Please describe desired outputs (min 20 characters)').max(2000, 'Desired outputs is too long'),
  difficulty: difficultySchema.optional(),
  estimated_time: z.string().max(50, 'Estimated time is too long').optional(),
  github_url: githubUrlSchema,
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
  status: z.enum(['draft', 'open', 'closed']),
});

// Project filter schema
export const projectFilterSchema = z.object({
  search: z.string().optional(),
  difficulty: difficultySchema.optional(),
  status: z.enum(['draft', 'open', 'closed']).optional(),
  tags: z.array(z.string()).optional(),
  ordering: z.enum(['created_at', '-created_at', 'title', '-title']).optional(),
});

// Type inference for TypeScript
export type ProjectFormData = z.infer<typeof projectSchema>;
export type ProjectFilterData = z.infer<typeof projectFilterSchema>;

