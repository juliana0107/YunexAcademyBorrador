import { z } from 'zod';

const levelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
const statusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const createTrainingCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255).trim(),
  description: z.string().max(5000).trim().default(''),
  level: levelSchema.default('BEGINNER'),
  thumbnailUrl: z.string().url().nullable().optional(),
});

export const updateTrainingCourseSchema = z.object({
  title: z.string().min(3).max(255).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  level: levelSchema.optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
});

export const changeStatusSchema = z.object({
  status: statusSchema,
});

export const listTrainingCoursesQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: statusSchema.optional(),
  level: levelSchema.optional(),
  createdBy: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTrainingCourseInput = z.infer<typeof createTrainingCourseSchema>;
export type UpdateTrainingCourseInput = z.infer<typeof updateTrainingCourseSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ListTrainingCoursesQuery = z.infer<typeof listTrainingCoursesQuerySchema>;