import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  trainingCourseId: z.string().uuid().optional(),
  topLimit: z.coerce.number().int().positive().max(50).default(10),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;