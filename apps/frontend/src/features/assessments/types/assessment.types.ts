import type {
  AssessmentStatus,
  QuestionType,
} from '@yunexacademy/shared-types';

// Re-export para que el feature siga importando desde aquí
export type { AssessmentStatus, QuestionType };

// ============ ASSESSMENT DTOs ============

export interface AssessmentListItem {
  id: string;
  trainingCourseId: string;
  submoduleId: string | null;
  title: string;
  description: string;
  status: AssessmentStatus;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentInput {
  trainingCourseId: string;
  submoduleId?: string | null;
  title: string;
  description: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  shuffleQuestions?: boolean;
}

export interface UpdateAssessmentInput {
  title?: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  shuffleQuestions?: boolean;
}

// ============ QUESTION DTOs ============

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

export interface CreateQuestionInput {
  type: QuestionType;
  statement: string;
  points: number;
  order?: number;
  options?: QuestionOptionData[];
  payload?: Record<string, unknown>;
}

export interface UpdateQuestionInput {
  statement?: string;
  points?: number;
  order?: number;
  options?: QuestionOptionData[];
  payload?: Record<string, unknown>;
}