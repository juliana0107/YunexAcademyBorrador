export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'OPEN_ANSWER'
  | 'FILL_IN_THE_BLANKS'
  | 'DROPDOWN'
  | 'REORDER';

export interface QuestionOptionData {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface FillInTheBlanksPayload {
  blanks: Array<{
    id: string;
    correctAnswer: string;
    caseSensitive: boolean;
  }>;
}

export interface DropdownPayload {
  template: string;
  dropdowns: Array<{
    id: string;
    options: string[];
    correctAnswer: string;
  }>;
}

export interface ReorderPayload {
  items: Array<{
    id: string;
    label: string;
    correctOrder: number;
  }>;
}

export interface QuestionListItem {
  id: string;
  assessmentId: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  options: QuestionOptionData[] | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDetail extends QuestionListItem {}