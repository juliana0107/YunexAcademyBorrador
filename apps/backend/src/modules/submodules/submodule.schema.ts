import { z } from 'zod';

export const createSubmoduleSchema = z.object({
  trainingCourseId: z.string().uuid('Invalid training course ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255).trim(),
  description: z.string().max(5000).trim().default(''),
  order: z.number().int().min(0).optional(),
  estimatedDurationMinutes: z.number().int().min(0).default(0),
});

export const updateSubmoduleSchema = z.object({
  title: z.string().min(3).max(255).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  estimatedDurationMinutes: z.number().int().min(0).optional(),
});

export const changeOrderSchema = z.object({
  order: z.number().int().min(0),
});

export const listSubmodulesQuerySchema = z.object({
  trainingCourseId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateSubmoduleInput = z.infer<typeof createSubmoduleSchema>;
export type UpdateSubmoduleInput = z.infer<typeof updateSubmoduleSchema>;
export type ChangeOrderInput = z.infer<typeof changeOrderSchema>;
export type ListSubmodulesQuery = z.infer<typeof listSubmodulesQuerySchema>;