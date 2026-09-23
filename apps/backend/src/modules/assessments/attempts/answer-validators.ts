import { z } from 'zod';
import type { QuestionType } from '../questions/question.types.js';

//  Schemas por tipo 

const singleChoiceSchema = z.object({
  optionId: z.string().uuid('Invalid option ID'),
});

const multipleChoiceSchema = z.object({
  optionIds: z.array(z.string().uuid()).min(0),
});

const trueFalseSchema = z.object({
  answer: z.boolean(),
});

const fillInTheBlanksSchema = z.object({
  blanks: z.record(z.string()),
});

const dropdownSchema = z.object({
  dropdowns: z.record(z.string()),
});

const reorderSchema = z.object({
  order: z.array(z.string().min(1)),
});

const matchPairsSchema = z.object({
  pairs: z.array(
    z.object({
      leftId: z.string().min(1),
      rightId: z.string().min(1),
    })
  ),
});

const categorizeSchema = z.object({
  assignments: z.record(z.string()),
});

const dragAndDropSchema = z.object({
  placements: z.record(z.string()),
});

const tableFillSchema = z.object({
  cells: z.record(z.string()),
});

const matchingGridSchema = z.object({
  matches: z.array(
    z.object({
      rowId: z.string().min(1),
      columnId: z.string().min(1),
    })
  ),
});

const openAnswerSchema = z.object({
  text: z.string().max(20000),
});

//  Mapa tipo → schema 

const SCHEMAS: Record<QuestionType, z.ZodTypeAny> = {
  SINGLE_CHOICE: singleChoiceSchema,
  MULTIPLE_CHOICE: multipleChoiceSchema,
  TRUE_FALSE: trueFalseSchema,
  FILL_IN_THE_BLANKS: fillInTheBlanksSchema,
  DROPDOWN: dropdownSchema,
  REORDER: reorderSchema,
  MATCH_PAIRS: matchPairsSchema,
  CATEGORIZE: categorizeSchema,
  DRAG_AND_DROP: dragAndDropSchema,
  TABLE_FILL: tableFillSchema,
  MATCHING_GRID: matchingGridSchema,
  OPEN_ANSWER: openAnswerSchema,
};

//  API pública 

export function validateAnswer(
  type: QuestionType,
  answer: unknown
): { valid: true; data: Record<string, unknown> } | { valid: false; error: string } {
  const schema = SCHEMAS[type];
  if (!schema) {
    return { valid: false, error: `Unsupported question type: ${type}` };
  }

  const result = schema.safeParse(answer);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues.map((i) => i.message).join('; '),
    };
  }

  return { valid: true, data: result.data as Record<string, unknown> };
}