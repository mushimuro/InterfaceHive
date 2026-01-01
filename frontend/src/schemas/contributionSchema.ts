import { z } from 'zod';

/**
 * Validation schemas for contribution forms.
 * 
 * Uses Zod for runtime validation with TypeScript type inference.
 */

// Contribution title validation
export const contributionTitleSchema = z
  .string()
  .max(200, 'Title is too long (max 200 characters)')
  .optional();

// Contribution body validation
export const contributionBodySchema = z
  .string()
  .min(50, 'Contribution description must be at least 50 characters')
  .max(5000, 'Contribution description is too long (max 5000 characters)');

// URL validation for links
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .max(500, 'URL is too long');

// Contribution submission schema
export const contributionSchema = z.object({
  title: contributionTitleSchema,
  body: contributionBodySchema,
  links: z.array(urlSchema).max(10, 'Maximum 10 links allowed').optional(),
  attachments: z.array(urlSchema).max(5, 'Maximum 5 attachments allowed').optional(),
});

// Contribution decision schema (for host)
export const contributionDecisionSchema = z.object({
  decision: z.enum(['accepted', 'declined'] as const, {
    message: 'Please select accept or decline'
  }),
  feedback: z.string().max(1000, 'Feedback is too long').optional(),
});

// Type inference for TypeScript
export type ContributionFormData = z.infer<typeof contributionSchema>;
export type ContributionDecisionData = z.infer<typeof contributionDecisionSchema>;

