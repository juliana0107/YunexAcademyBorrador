import type { QuestionType } from '../questions/question.types.js';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'EXPIRED';

export interface AttemptListItem {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  userId: string;
  userName: string;
  status: AttemptStatus;
  score: number;
  passingScore: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  timeSpentSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptAnswerItem {
  id: string;
  attemptId: string;
  questionId: string;
  questionType: QuestionType;
  questionStatement: string;
  pointsPossible: number;
  pointsEarned: number;
  isCorrect: boolean | null;
  answer: Record<string, unknown>;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptDetail extends AttemptListItem {
  answers: AttemptAnswerItem[];
  showResults: boolean;
}

export interface StartAttemptResult {
  attemptId: string;
  assessmentId: string;
  attemptNumber: number;
  startedAt: string;
  expiresAt: string | null;
  questions: AttemptQuestion[];
}

export interface AttemptQuestion {
  id: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  options: Array<{
    id: string;
    text: string;
    order: number;
  }> | null;
  payload: Record<string, unknown>;
}

export interface SubmitResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
  status: AttemptStatus;
  correctCount: number;
  incorrectCount: number;
  pendingCount: number;
  totalQuestions: number;
  submittedAt: string;
  gradedAt: string | null;
}