import type {
  QuestionType,
  FillInTheBlanksPayload,
  DropdownPayload,
  ReorderPayload,
} from '@yunexacademy/shared-types';

export type {
  QuestionType,
  FillInTheBlanksPayload,
  DropdownPayload,
  ReorderPayload,
};

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