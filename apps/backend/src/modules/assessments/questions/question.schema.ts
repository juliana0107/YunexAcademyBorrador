import { z } from 'zod';

const questionTypeSchema = z.enum([
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'OPEN_ANSWER',
  'FILL_IN_THE_BLANKS',
  'DROPDOWN',
  'REORDER',
]);

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required').trim(),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

//  FILL_IN_THE_BLANKS payload 
const fillBlanksPayloadSchema = z.object({
  blanks: z
    .array(
      z.object({
        id: z.string().min(1),
        correctAnswer: z.string().min(1, 'Correct answer is required'),
        caseSensitive: z.boolean().default(false),
      })
    )
    .min(1, 'At least one blank is required'),
});

//  DROPDOWN payload 
const dropdownPayloadSchema = z.object({
  template: z.string().min(1, 'Template is required'),
  dropdowns: z
    .array(
      z.object({
        id: z.string().min(1),
        options: z.array(z.string().min(1)).min(2, 'At least 2 options per dropdown'),
        correctAnswer: z.string().min(1, 'Correct answer is required'),
      })
    )
    .min(1, 'At least one dropdown is required'),
});

//  REORDER payload 
const reorderPayloadSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1, 'Label is required'),
        correctOrder: z.number().int().min(0),
      })
    )
    .min(2, 'REORDER requires at least 2 items'),
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
    //  SINGLE_CHOICE 
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

    //  MULTIPLE_CHOICE 
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

    //  TRUE_FALSE 
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

    //  OPEN_ANSWER 
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

    //  FILL_IN_THE_BLANKS 
    if (data.type === 'FILL_IN_THE_BLANKS') {
      const payload = data.payload ?? {};
      const result = fillBlanksPayloadSchema.safeParse(payload);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['payload', ...issue.path],
          });
        });
      }
    }

    //  DROPDOWN 
    if (data.type === 'DROPDOWN') {
      const payload = data.payload ?? {};
      const result = dropdownPayloadSchema.safeParse(payload);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['payload', ...issue.path],
          });
        });
      }
    }

    //  REORDER 
    if (data.type === 'REORDER') {
      const payload = data.payload ?? {};
      const result = reorderPayloadSchema.safeParse(payload);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['payload', ...issue.path],
          });
        });
      }
    }

    //  Reglas comunes
    // Los tipos que NO usan options no deberían recibir options
    const noOptionsTypes = [
      'TRUE_FALSE',
      'OPEN_ANSWER',
      'FILL_IN_THE_BLANKS',
      'DROPDOWN',
      'REORDER',
    ];
    if (
      noOptionsTypes.includes(data.type) &&
      data.options &&
      data.options.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.type} should not include options`,
        path: ['options'],
      });
    }

    // Los tipos de opciones no deben llevar payload
    const noPayloadTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'];
    if (
      noPayloadTypes.includes(data.type) &&
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