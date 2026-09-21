export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_IN_THE_BLANKS'
  | 'OPEN_ANSWER'
  | 'TABLE_FILL'
  | 'DRAG_AND_DROP'
  | 'DROPDOWN'
  | 'CATEGORIZE'
  | 'REORDER'
  | 'MATCH_PAIRS'
  | 'MATCHING_GRID';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionBase {
  id: string;
  assessmentId: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'SINGLE_CHOICE';
  options: QuestionOption[];
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'MULTIPLE_CHOICE';
  options: QuestionOption[];
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'TRUE_FALSE';
  correctAnswer: boolean;
}

export interface FillInTheBlanksQuestion extends QuestionBase {
  type: 'FILL_IN_THE_BLANKS';
  blanks: Array<{
    id: string;
    correctAnswer: string;
    caseSensitive: boolean;
  }>;
}

export interface OpenAnswerQuestion extends QuestionBase {
  type: 'OPEN_ANSWER';
  minWords?: number;
  maxWords?: number;
}

export interface TableFillQuestion extends QuestionBase {
  type: 'TABLE_FILL';
  headers: string[];
  rows: Array<{
    id: string;
    cells: Array<{ id: string; correctAnswer: string }>;
  }>;
}

export interface DragAndDropQuestion extends QuestionBase {
  type: 'DRAG_AND_DROP';
  targets: Array<{
    id: string;
    label: string;
    correctItemId: string;
  }>;
  items: Array<{
    id: string;
    label: string;
  }>;
}

export interface DropdownQuestion extends QuestionBase {
  type: 'DROPDOWN';
  template: string;
  dropdowns: Array<{
    id: string;
    options: string[];
    correctAnswer: string;
  }>;
}

export interface CategorizeQuestion extends QuestionBase {
  type: 'CATEGORIZE';
  categories: Array<{
    id: string;
    name: string;
  }>;
  items: Array<{
    id: string;
    label: string;
    correctCategoryId: string;
  }>;
}

export interface ReorderQuestion extends QuestionBase {
  type: 'REORDER';
  items: Array<{
    id: string;
    label: string;
    correctOrder: number;
  }>;
}

export interface MatchPairsQuestion extends QuestionBase {
  type: 'MATCH_PAIRS';
  pairs: Array<{
    id: string;
    left: string;
    right: string;
  }>;
}

export interface MatchingGridQuestion extends QuestionBase {
  type: 'MATCHING_GRID';
  rows: Array<{
    id: string;
    label: string;
  }>;
  columns: Array<{
    id: string;
    label: string;
  }>;
  correctMatches: Array<{
    rowId: string;
    columnId: string;
  }>;
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInTheBlanksQuestion
  | OpenAnswerQuestion
  | TableFillQuestion
  | DragAndDropQuestion
  | DropdownQuestion
  | CategorizeQuestion
  | ReorderQuestion
  | MatchPairsQuestion
  | MatchingGridQuestion;