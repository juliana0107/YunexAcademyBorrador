import { z } from 'zod';

export const createVideoSchema = z.object({
  submoduleId: z.string().uuid('Invalid submodule ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255).trim(),
  description: z.string().max(5000).trim().default(''),
  durationSeconds: z.coerce.number().int().min(0).default(0),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(3).max(255).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  durationSeconds: z.coerce.number().int().min(0).optional(),
});

export const changeVideoOrderSchema = z.object({
  order: z.number().int().min(0),
});

export const listVideosQuerySchema = z.object({
  submoduleId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type ChangeVideoOrderInput = z.infer<typeof changeVideoOrderSchema>;
export type ListVideosQuery = z.infer<typeof listVideosQuerySchema>;