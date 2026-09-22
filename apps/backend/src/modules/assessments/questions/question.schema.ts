import { z } from 'zod';

const questionTypeSchema = z.enum([
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'OPEN_ANSWER',
]);

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required').trim(),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

export const createQuestionSchema = z
  .object({
    type: questionTypeSchema,
    statement: z.string().min(3, 'Statement must be at least 3 characters').trim(),
    points: z.coerce.number().int().min(1).default(1),
    order: z.coerce.number().int().min(0).optional(),
    options: z.array(optionSchema).optional(),
    payload: z.record(z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    // Validación por tipo
    if (data.type === 'SINGLE_CHOICE') {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SINGLE_CHOICE requires at least 2 options',
          path: ['options'],
        });
        return;
      }
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SINGLE_CHOICE requires exactly 1 correct option',
          path: ['options'],
        });
      }
    }

    if (data.type === 'MULTIPLE_CHOICE') {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'MULTIPLE_CHOICE requires at least 2 options',
          path: ['options'],
        });
        return;
      }
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      if (correctCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'MULTIPLE_CHOICE requires at least 1 correct option',
          path: ['options'],
        });
      }
    }

    if (data.type === 'TRUE_FALSE') {
      const payload = data.payload ?? {};
      if (typeof payload.correctAnswer !== 'boolean') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'TRUE_FALSE requires payload.correctAnswer as boolean',
          path: ['payload', 'correctAnswer'],
        });
      }
    }

    if (data.type === 'OPEN_ANSWER') {
      const payload = data.payload ?? {};
      if (payload.minWords !== undefined && typeof payload.minWords !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OPEN_ANSWER payload.minWords must be a number',
          path: ['payload', 'minWords'],
        });
      }
      if (payload.maxWords !== undefined && typeof payload.maxWords !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OPEN_ANSWER payload.maxWords must be a number',
          path: ['payload', 'maxWords'],
        });
      }
    }

    // SINGLE y MULTIPLE no deben llevar payload
    if (
      (data.type === 'SINGLE_CHOICE' || data.type === 'MULTIPLE_CHOICE') &&
      data.payload &&
      Object.keys(data.payload).length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.type} should not include payload`,
        path: ['payload'],
      });
    }
  });

export const updateQuestionSchema = z.object({
  statement: z.string().min(3).trim().optional(),
  points: z.coerce.number().int().min(1).optional(),
  order: z.coerce.number().int().min(0).optional(),
  options: z.array(optionSchema).optional(),
  payload: z.record(z.unknown()).optional(),
});

export const reorderQuestionSchema = z.object({
  order: z.coerce.number().int().min(0),
});

export const listQuestionsQuerySchema = z.object({
  assessmentId: z.string().uuid().optional(),
  type: questionTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(100),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionInput = z.infer<typeof reorderQuestionSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;