import { z } from 'zod';

const statusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const createAssessmentSchema = z.object({
  trainingCourseId: z.string().uuid('Invalid training course ID'),
  submoduleId: z.string().uuid('Invalid submodule ID').nullable().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255).trim(),
  description: z.string().max(5000).trim().default(''),
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
  maxAttempts: z.coerce.number().int().min(1).max(100).default(3),
  timeLimitMinutes: z.coerce.number().int().min(1).nullable().optional(),
  shuffleQuestions: z.boolean().default(false),
});

export const updateAssessmentSchema = z.object({
  title: z.string().min(3).max(255).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  passingScore: z.coerce.number().int().min(0).max(100).optional(),
  maxAttempts: z.coerce.number().int().min(1).max(100).optional(),
  timeLimitMinutes: z.coerce.number().int().min(1).nullable().optional(),
  shuffleQuestions: z.boolean().optional(),
});

export const changeStatusSchema = z.object({
  status: statusSchema,
});

export const listAssessmentsQuerySchema = z.object({
  trainingCourseId: z.string().uuid().optional(),
  submoduleId: z.string().uuid().optional(),
  status: statusSchema.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type ChangeAssessmentStatusInput = z.infer<typeof changeStatusSchema>;
export type ListAssessmentsQuery = z.infer<typeof listAssessmentsQuerySchema>;