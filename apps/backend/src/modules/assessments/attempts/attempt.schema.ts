import { z } from 'zod';

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  answer: z.record(z.unknown()),
});

export const submitAttemptSchema = z.object({
  // vacío por ahora
}).optional();

export const gradeOpenAnswerSchema = z.object({
  pointsEarned: z.coerce.number().min(0),
  feedback: z.string().max(5000).trim().optional(),
});

export const listMyAttemptsQuerySchema = z.object({
  assessmentId: z.string().uuid().optional(),
  trainingCourseId: z.string().uuid().optional(),
  status: z
    .enum(['IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED'])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const listAssessmentAttemptsQuerySchema = z.object({
  status: z
    .enum(['IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED'])
    .optional(),
  userId: z.string().uuid().optional(),
  passed: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type GradeOpenAnswerInput = z.infer<typeof gradeOpenAnswerSchema>;
export type ListMyAttemptsQuery = z.infer<typeof listMyAttemptsQuerySchema>;
export type ListAssessmentAttemptsQuery = z.infer<
  typeof listAssessmentAttemptsQuerySchema
>;