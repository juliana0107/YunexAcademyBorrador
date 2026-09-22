import { z } from 'zod';

export const upsertProgressSchema = z.object({
  watchedSeconds: z.coerce.number().int().min(0),
  totalSeconds: z.coerce.number().int().min(1),
});

export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;
