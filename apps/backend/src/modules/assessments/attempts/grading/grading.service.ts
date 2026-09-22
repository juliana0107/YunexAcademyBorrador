import type { QuestionRecord } from '../attempt.repository.js';

// ============ Tipos ============

export interface GradeResult {
  isCorrect: boolean | null;
  pointsEarned: number;
}

interface SingleChoicePayload {
  optionId?: string;
}

interface MultipleChoicePayload {
  optionIds?: string[];
}

interface TrueFalsePayload {
  answer?: boolean;
}

interface FillInTheBlanksPayload {
  blanks?: Record<string, string>;
}

interface DropdownPayload {
  dropdowns?: Record<string, string>;
}

interface ReorderPayload {
  order?: string[];
}

interface MatchPairsPayload {
  pairs?: Array<{ leftId: string; rightId: string }>;
}

interface CategorizePayload {
  assignments?: Record<string, string>;
}

interface DragAndDropPayload {
  placements?: Record<string, string>;
}

interface TableFillPayload {
  cells?: Record<string, string>;
}

interface MatchingGridPayload {
  matches?: Array<{ rowId: string; columnId: string }>;
}

// ============ Utilidades ============

function normalize(value: string, caseSensitive: boolean): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

// ============ Calificadores por tipo ============

function gradeSingleChoice(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const options = question.options ?? [];
  const correctOption = options.find((o) => o.isCorrect);
  if (!correctOption) {
    return { isCorrect: false, pointsEarned: 0 };
  }

  const payload = answer as SingleChoicePayload;
  const isCorrect = payload.optionId === correctOption.id;

  return {
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
  };
}

function gradeMultipleChoice(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const options = question.options ?? [];
  const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.id));

  const payload = answer as MultipleChoicePayload;
  const selectedIds = new Set(payload.optionIds ?? []);

  const isCorrect = setsEqual(correctIds, selectedIds);

  return {
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
  };
}

function gradeTrueFalse(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as { correctAnswer?: unknown };
  const correctAnswer = payload.correctAnswer === true;

  const studentAnswer = answer as TrueFalsePayload;
  const isCorrect = studentAnswer.answer === correctAnswer;

  return {
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
  };
}

function gradeFillInTheBlanks(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    blanks?: Array<{ id: string; correctAnswer: string; caseSensitive: boolean }>;
  };
  const blanks = payload.blanks ?? [];

  const studentBlanks = (answer as FillInTheBlanksPayload).blanks ?? {};

  let allCorrect = true;
  for (const blank of blanks) {
    const studentValue = studentBlanks[blank.id] ?? '';
    const correctValue = blank.correctAnswer;
    const cs = blank.caseSensitive ?? false;

    if (normalize(studentValue, cs) !== normalize(correctValue, cs)) {
      allCorrect = false;
      break;
    }
  }

  return {
    isCorrect: allCorrect,
    pointsEarned: allCorrect ? question.points : 0,
  };
}

function gradeDropdown(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    dropdowns?: Array<{ id: string; correctAnswer: string }>;
  };
  const dropdowns = payload.dropdowns ?? [];

  const studentDropdowns = (answer as DropdownPayload).dropdowns ?? {};

  let allCorrect = true;
  for (const dd of dropdowns) {
    const studentValue = (studentDropdowns[dd.id] ?? '').trim();
    if (studentValue !== dd.correctAnswer) {
      allCorrect = false;
      break;
    }
  }

  return {
    isCorrect: allCorrect,
    pointsEarned: allCorrect ? question.points : 0,
  };
}

function gradeReorder(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    items?: Array<{ id: string; correctOrder: number }>;
  };
  const items = payload.items ?? [];

  const correctOrder = [...items]
    .sort((a, b) => a.correctOrder - b.correctOrder)
    .map((it) => it.id);

  const studentOrder = (answer as ReorderPayload).order ?? [];

  const isCorrect =
    studentOrder.length === correctOrder.length &&
    studentOrder.every((id, idx) => id === correctOrder[idx]);

  return {
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
  };
}

function gradeMatchPairs(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    pairs?: Array<{ id: string; left: string; right: string }>;
  };
  const pairs = payload.pairs ?? [];

  const studentPairs = (answer as MatchPairsPayload).pairs ?? [];

  if (studentPairs.length !== pairs.length) {
    return { isCorrect: false, pointsEarned: 0 };
  }

  let allCorrect = true;
  for (const pair of pairs) {
    const studentPair = studentPairs.find((sp) => sp.leftId === pair.id);
    if (!studentPair || studentPair.rightId !== pair.id) {
      allCorrect = false;
      break;
    }
  }

  return {
    isCorrect: allCorrect,
    pointsEarned: allCorrect ? question.points : 0,
  };
}

function gradeCategorize(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    items?: Array<{ id: string; correctCategoryId: string }>;
  };
  const items = payload.items ?? [];

  const assignments = (answer as CategorizePayload).assignments ?? {};

  let allCorrect = true;
  for (const item of items) {
    const assigned = assignments[item.id];
    if (assigned !== item.correctCategoryId) {
      allCorrect = false;
      break;
    }
  }

  return {
    isCorrect: allCorrect,
    pointsEarned: allCorrect ? question.points : 0,
  };
}

function gradeDragAndDrop(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    targets?: Array<{ id: string; correctItemId: string }>;
  };
  const targets = payload.targets ?? [];

  const placements = (answer as DragAndDropPayload).placements ?? {};

  let allCorrect = true;
  for (const target of targets) {
    const placed = placements[target.id];
    if (placed !== target.correctItemId) {
      allCorrect = false;
      break;
    }
  }

  return {
    isCorrect: allCorrect,
    pointsEarned: allCorrect ? question.points : 0,
  };
}

function gradeTableFill(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    rows?: Array<{ id: string; cells: Array<{ id: string; correctAnswer: string }> }>;
  };
  const rows = payload.rows ?? [];

  const cells = (answer as TableFillPayload).cells ?? {};

  let allCorrect = true;
  for (const row of rows) {
    for (const cell of row.cells) {
      const studentValue = cells[cell.id] ?? '';
      if (normalize(studentValue, false) !== normalize(cell.correctAnswer, false)) {
        allCorrect = false;
        break;
      }
    }
    if (!allCorrect) break;
  }

  return {
    isCorrect: allCorrect,
    pointsEarned: allCorrect ? question.points : 0,
  };
}

function gradeMatchingGrid(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  const payload = question.payload as {
    correctMatches?: Array<{ rowId: string; columnId: string }>;
  };
  const correct = payload.correctMatches ?? [];

  const studentMatches = (answer as MatchingGridPayload).matches ?? [];

  const correctSet = new Set(correct.map((m) => `${m.rowId}:${m.columnId}`));
  const studentSet = new Set(studentMatches.map((m) => `${m.rowId}:${m.columnId}`));

  const isCorrect = setsEqual(correctSet, studentSet);

  return {
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
  };
}

function gradeOpenAnswer(): GradeResult {
  return { isCorrect: null, pointsEarned: 0 };
}

// ============ Dispatcher ============

export function gradeAnswer(
  question: QuestionRecord,
  answer: Record<string, unknown>
): GradeResult {
  switch (question.type) {
    case 'SINGLE_CHOICE':
      return gradeSingleChoice(question, answer);
    case 'MULTIPLE_CHOICE':
      return gradeMultipleChoice(question, answer);
    case 'TRUE_FALSE':
      return gradeTrueFalse(question, answer);
    case 'FILL_IN_THE_BLANKS':
      return gradeFillInTheBlanks(question, answer);
    case 'DROPDOWN':
      return gradeDropdown(question, answer);
    case 'REORDER':
      return gradeReorder(question, answer);
    case 'MATCH_PAIRS':
      return gradeMatchPairs(question, answer);
    case 'CATEGORIZE':
      return gradeCategorize(question, answer);
    case 'DRAG_AND_DROP':
      return gradeDragAndDrop(question, answer);
    case 'TABLE_FILL':
      return gradeTableFill(question, answer);
    case 'MATCHING_GRID':
      return gradeMatchingGrid(question, answer);
    case 'OPEN_ANSWER':
      return gradeOpenAnswer();
    default: {
      const exhaustive: never = question.type;
      throw new Error(`Unsupported question type: ${exhaustive}`);
    }
  }
}