export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'OPEN_ANSWER';

export interface QuestionOptionData {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
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