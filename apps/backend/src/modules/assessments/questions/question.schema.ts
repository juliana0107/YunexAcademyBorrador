import { z } from 'zod';

const questionTypeSchema = z.enum([
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'OPEN_ANSWER',
  'FILL_IN_THE_BLANKS',
  'DROPDOWN',
  'REORDER',
  'MATCH_PAIRS',
  'CATEGORIZE',
  'DRAG_AND_DROP',
  'TABLE_FILL',
  'MATCHING_GRID',
]);

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required').trim(),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

//  FILL_IN_THE_BLANKS 
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

//  DROPDOWN 
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

//  REORDER 
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

//  MATCH_PAIRS 
const matchPairsPayloadSchema = z.object({
  pairs: z
    .array(
      z.object({
        id: z.string().min(1),
        left: z.string().min(1, 'Left side is required'),
        right: z.string().min(1, 'Right side is required'),
      })
    )
    .min(2, 'MATCH_PAIRS requires at least 2 pairs'),
});

//  CATEGORIZE 
const categorizePayloadSchema = z
  .object({
    categories: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1, 'Category name is required'),
        })
      )
      .min(2, 'CATEGORIZE requires at least 2 categories'),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1, 'Item label is required'),
          correctCategoryId: z.string().min(1),
        })
      )
      .min(2, 'CATEGORIZE requires at least 2 items'),
  })
  .superRefine((data, ctx) => {
    const categoryIds = new Set(data.categories.map((c) => c.id));
    data.items.forEach((item, index) => {
      if (!categoryIds.has(item.correctCategoryId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item "${item.label}" refers to a non-existent category`,
          path: ['items', index, 'correctCategoryId'],
        });
      }
    });
  });

//  DRAG_AND_DROP 
const dragAndDropPayloadSchema = z
  .object({
    targets: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1, 'Target label is required'),
          correctItemId: z.string().min(1),
        })
      )
      .min(2, 'DRAG_AND_DROP requires at least 2 targets'),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1, 'Item label is required'),
        })
      )
      .min(2, 'DRAG_AND_DROP requires at least 2 items'),
  })
  .superRefine((data, ctx) => {
    const itemIds = new Set(data.items.map((i) => i.id));

    data.targets.forEach((target, index) => {
      if (!itemIds.has(target.correctItemId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Target "${target.label}" refers to a non-existent item`,
          path: ['targets', index, 'correctItemId'],
        });
      }
    });

    const usedItems = new Set<string>();
    data.targets.forEach((target, index) => {
      if (usedItems.has(target.correctItemId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item "${target.correctItemId}" is assigned to more than one target`,
          path: ['targets', index, 'correctItemId'],
        });
      }
      usedItems.add(target.correctItemId);
    });
  });

//  TABLE_FILL 
const tableFillPayloadSchema = z.object({
  headers: z
    .array(z.string().min(1, 'Header text is required'))
    .min(2, 'TABLE_FILL requires at least 2 columns'),
  rows: z
    .array(
      z.object({
        id: z.string().min(1),
        cells: z
          .array(
            z.object({
              id: z.string().min(1),
              correctAnswer: z.string().min(1, 'Correct answer is required'),
            })
          )
          .min(2, 'Each row needs at least 2 cells'),
      })
    )
    .min(1, 'TABLE_FILL requires at least 1 row'),
});

//  MATCHING_GRID 
const matchingGridPayloadSchema = z
  .object({
    rows: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1, 'Row label is required'),
        })
      )
      .min(2, 'MATCHING_GRID requires at least 2 rows'),
    columns: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1, 'Column label is required'),
        })
      )
      .min(2, 'MATCHING_GRID requires at least 2 columns'),
    correctMatches: z
      .array(
        z.object({
          rowId: z.string().min(1),
          columnId: z.string().min(1),
        })
      )
      .min(1, 'MATCHING_GRID requires at least 1 correct match'),
  })
  .superRefine((data, ctx) => {
    const rowIds = new Set(data.rows.map((r) => r.id));
    const colIds = new Set(data.columns.map((c) => c.id));

    data.correctMatches.forEach((match, index) => {
      if (!rowIds.has(match.rowId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Match refers to a non-existent row`,
          path: ['correctMatches', index, 'rowId'],
        });
      }
      if (!colIds.has(match.columnId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Match refers to a non-existent column`,
          path: ['correctMatches', index, 'columnId'],
        });
      }
    });
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
    // SINGLE_CHOICE
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

    // MULTIPLE_CHOICE
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

    // TRUE_FALSE
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

    // OPEN_ANSWER
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

    // FILL_IN_THE_BLANKS
    if (data.type === 'FILL_IN_THE_BLANKS') {
      const result = fillBlanksPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // DROPDOWN
    if (data.type === 'DROPDOWN') {
      const result = dropdownPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // REORDER
    if (data.type === 'REORDER') {
      const result = reorderPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // MATCH_PAIRS
    if (data.type === 'MATCH_PAIRS') {
      const result = matchPairsPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // CATEGORIZE
    if (data.type === 'CATEGORIZE') {
      const result = categorizePayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // DRAG_AND_DROP
    if (data.type === 'DRAG_AND_DROP') {
      const result = dragAndDropPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // TABLE_FILL
    if (data.type === 'TABLE_FILL') {
      const result = tableFillPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    // MATCHING_GRID
    if (data.type === 'MATCHING_GRID') {
      const result = matchingGridPayloadSchema.safeParse(data.payload ?? {});
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
        });
      }
    }

    //  Reglas comunes 
    const noOptionsTypes = [
      'TRUE_FALSE',
      'OPEN_ANSWER',
      'FILL_IN_THE_BLANKS',
      'DROPDOWN',
      'REORDER',
      'MATCH_PAIRS',
      'CATEGORIZE',
      'DRAG_AND_DROP',
      'TABLE_FILL',
      'MATCHING_GRID',
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