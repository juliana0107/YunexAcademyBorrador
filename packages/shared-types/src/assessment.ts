
// Tipos compartidos de evaluaciones y preguntas.
// ============ ASSESSMENT ============

export const ASSESSMENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type AssessmentStatus =
  (typeof ASSESSMENT_STATUS)[keyof typeof ASSESSMENT_STATUS];

export const ASSESSMENT_STATUSES: readonly AssessmentStatus[] =
  Object.values(ASSESSMENT_STATUS);

// ============ QUESTION TYPES ============

export const QUESTION_TYPE = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  OPEN_ANSWER: 'OPEN_ANSWER',
  FILL_IN_THE_BLANKS: 'FILL_IN_THE_BLANKS',
  DROPDOWN: 'DROPDOWN',
  REORDER: 'REORDER',
  TABLE_FILL: 'TABLE_FILL',
  DRAG_AND_DROP: 'DRAG_AND_DROP',
  CATEGORIZE: 'CATEGORIZE',
  MATCH_PAIRS: 'MATCH_PAIRS',
  MATCHING_GRID: 'MATCHING_GRID',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

export const QUESTION_TYPES: readonly QuestionType[] =
  Object.values(QUESTION_TYPE);

// ============ PAYLOADS POR TIPO ============

export interface TrueFalsePayload {
  correctAnswer: boolean;
}

export interface OpenAnswerPayload {
  minWords?: number;
  maxWords?: number;
}

export interface FillBlank {
  id: string;
  correctAnswer: string;
  caseSensitive: boolean;
}

export interface FillInTheBlanksPayload {
  blanks: FillBlank[];
}

export interface Dropdown {
  id: string;
  options: string[];
  correctAnswer: string;
}

export interface DropdownPayload {
  template: string;
  dropdowns: Dropdown[];
}

export interface ReorderItem {
  id: string;
  label: string;
  correctOrder: number;
}

export interface ReorderPayload {
  items: ReorderItem[];
}

export interface TableFillCell {
  value: string;
  isHeader: boolean;
}

export interface TableFillPayload {
  rows: number;
  columns: number;
  cells: TableFillCell[];
  blanks: Array<{ row: number; column: number; correctAnswer: string }>;
}

export interface DragAndDropZone {
  id: string;
  label: string;
}

export interface DragAndDropItem {
  id: string;
  label: string;
  correctZoneId: string;
}

export interface DragAndDropPayload {
  zones: DragAndDropZone[];
  items: DragAndDropItem[];
}

export interface CategorizeCategory {
  id: string;
  name: string;
}

export interface CategorizeItem {
  id: string;
  label: string;
  correctCategoryId: string;
}

export interface CategorizePayload {
  categories: CategorizeCategory[];
  items: CategorizeItem[];
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchPairsPayload {
  pairs: MatchPair[];
}

export interface MatchingGridPayload {
  rowLabels: string[];
  columnLabels: string[];
  correctCells: boolean[][];
}

export type QuestionPayload =
  | TrueFalsePayload
  | OpenAnswerPayload
  | FillInTheBlanksPayload
  | DropdownPayload
  | ReorderPayload
  | TableFillPayload
  | DragAndDropPayload
  | CategorizePayload
  | MatchPairsPayload
  | MatchingGridPayload
  | Record<string, never>;

// ============ VALIDACIÓN ============

export function validateQuestionPayload(
  type: QuestionType,
  payload: unknown
): string[] {
  const errors: string[] = [];
  const p = (payload ?? {}) as Record<string, unknown>;

  switch (type) {
    case 'TRUE_FALSE': {
      if (typeof p.correctAnswer !== 'boolean') {
        errors.push('TRUE_FALSE requiere correctAnswer booleano');
      }
      break;
    }
    case 'OPEN_ANSWER': {
      if (p.minWords !== undefined && typeof p.minWords !== 'number') {
        errors.push('minWords debe ser número');
      }
      if (p.maxWords !== undefined && typeof p.maxWords !== 'number') {
        errors.push('maxWords debe ser número');
      }
      break;
    }
    case 'FILL_IN_THE_BLANKS': {
      const blanks = p.blanks as FillBlank[] | undefined;
      if (!Array.isArray(blanks) || blanks.length === 0) {
        errors.push('FILL_IN_THE_BLANKS requiere al menos 1 espacio');
        break;
      }
      blanks.forEach((b, i) => {
        if (!b.correctAnswer?.trim()) {
          errors.push(`Espacio ${i + 1}: falta respuesta correcta`);
        }
      });
      break;
    }
    case 'DROPDOWN': {
      const template = p.template as string | undefined;
      const dropdowns = p.dropdowns as Dropdown[] | undefined;
      if (!template?.trim()) errors.push('Falta la plantilla');
      if (!Array.isArray(dropdowns) || dropdowns.length === 0) {
        errors.push('DROPDOWN requiere al menos 1 desplegable');
        break;
      }
      dropdowns.forEach((d, i) => {
        if (d.options.length < 2) {
          errors.push(`Desplegable ${i + 1}: mínimo 2 opciones`);
        }
        if (!d.correctAnswer) {
          errors.push(`Desplegable ${i + 1}: falta respuesta correcta`);
        }
        if (!template?.includes(`{{${d.id}}}`)) {
          errors.push(
            `Desplegable ${i + 1} (${d.id}) no aparece en la plantilla`
          );
        }
      });
      break;
    }
    case 'REORDER': {
      const items = p.items as ReorderItem[] | undefined;
      if (!Array.isArray(items) || items.length < 2) {
        errors.push('REORDER requiere al menos 2 elementos');
        break;
      }
      items.forEach((it, i) => {
        if (!it.label?.trim()) errors.push(`Elemento ${i + 1}: falta texto`);
      });
      break;
    }
    case 'TABLE_FILL': {
      const cells = p.cells as TableFillCell[] | undefined;
      const blanks = p.blanks as TableFillPayload['blanks'] | undefined;
      if (!Array.isArray(cells) || cells.length === 0) {
        errors.push('TABLE_FILL requiere celdas');
      }
      if (!Array.isArray(blanks) || blanks.length === 0) {
        errors.push('TABLE_FILL requiere al menos 1 celda vacía');
      }
      break;
    }
    case 'DRAG_AND_DROP': {
      const zones = p.zones as DragAndDropZone[] | undefined;
      const items = p.items as DragAndDropItem[] | undefined;
      if (!Array.isArray(zones) || zones.length < 2) {
        errors.push('DRAG_AND_DROP requiere al menos 2 zonas');
      }
      if (!Array.isArray(items) || items.length < 2) {
        errors.push('DRAG_AND_DROP requiere al menos 2 elementos');
      }
      break;
    }
    case 'CATEGORIZE': {
      const categories = p.categories as CategorizeCategory[] | undefined;
      const items = p.items as CategorizeItem[] | undefined;
      if (!Array.isArray(categories) || categories.length < 2) {
        errors.push('CATEGORIZE requiere al menos 2 categorías');
      }
      if (!Array.isArray(items) || items.length < 2) {
        errors.push('CATEGORIZE requiere al menos 2 elementos');
      }
      break;
    }
    case 'MATCH_PAIRS': {
      const pairs = p.pairs as MatchPair[] | undefined;
      if (!Array.isArray(pairs) || pairs.length < 2) {
        errors.push('MATCH_PAIRS requiere al menos 2 pares');
        break;
      }
      pairs.forEach((pair, i) => {
        if (!pair.left?.trim() || !pair.right?.trim()) {
          errors.push(`Par ${i + 1}: ambos lados son obligatorios`);
        }
      });
      break;
    }
    case 'MATCHING_GRID': {
      const rows = p.rowLabels as string[] | undefined;
      const cols = p.columnLabels as string[] | undefined;
      const cells = p.correctCells as boolean[][] | undefined;
      if (!Array.isArray(rows) || rows.length === 0) {
        errors.push('MATCHING_GRID requiere filas');
      }
      if (!Array.isArray(cols) || cols.length === 0) {
        errors.push('MATCHING_GRID requiere columnas');
      }
      if (!Array.isArray(cells) || cells.length === 0) {
        errors.push('MATCHING_GRID requiere celdas');
      }
      break;
    }
    case 'SINGLE_CHOICE':
    case 'MULTIPLE_CHOICE':
      break;
  }

  return errors;
}

// ============ CONSTANTES DE UI ============

export const IMPLEMENTED_QUESTION_TYPES: readonly QuestionType[] = [
  QUESTION_TYPE.SINGLE_CHOICE,
  QUESTION_TYPE.MULTIPLE_CHOICE,
  QUESTION_TYPE.TRUE_FALSE,
  QUESTION_TYPE.OPEN_ANSWER,
  QUESTION_TYPE.FILL_IN_THE_BLANKS,
  QUESTION_TYPE.DROPDOWN,
  QUESTION_TYPE.REORDER,
  QUESTION_TYPE.TABLE_FILL,
  QUESTION_TYPE.DRAG_AND_DROP,
  QUESTION_TYPE.CATEGORIZE,
  QUESTION_TYPE.MATCH_PAIRS,
  QUESTION_TYPE.MATCHING_GRID,
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Selección única',
  MULTIPLE_CHOICE: 'Selección múltiple',
  TRUE_FALSE: 'Verdadero / Falso',
  OPEN_ANSWER: 'Respuesta abierta',
  FILL_IN_THE_BLANKS: 'Rellenar espacios',
  DROPDOWN: 'Desplegable en texto',
  REORDER: 'Ordenar elementos',
  TABLE_FILL: 'Rellenar tabla',
  DRAG_AND_DROP: 'Arrastrar y soltar',
  CATEGORIZE: 'Categorizar',
  MATCH_PAIRS: 'Emparejar',
  MATCHING_GRID: 'Cuadrícula de coincidencias',
};