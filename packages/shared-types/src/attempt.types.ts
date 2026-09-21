import type { QuestionType } from './question.types.js';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'EXPIRED';

export interface AttemptAnswer {
  id: string;
  questionId: string;
  questionType: QuestionType;
  answer: unknown;
  isCorrect: boolean | null;
  pointsEarned: number;
  pointsPossible: number;
  feedback?: string;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  userId: string;
  status: AttemptStatus;
  score: number;
  passingScore: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  gradedAt?: string;
  timeSpentSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptDetail extends Attempt {
  answers: AttemptAnswer[];
}

export interface StartAttemptInput {
  assessmentId: string;
}

export interface SubmitAttemptInput {
  attemptId: string;
  answers: Array<{
    questionId: string;
    answer: unknown;
  }>;
}

export interface GradeOpenAnswerInput {
  attemptId: string;
  questionId: string;
  pointsEarned: number;
  feedback?: string;
}