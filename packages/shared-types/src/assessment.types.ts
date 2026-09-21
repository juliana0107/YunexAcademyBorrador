import type { Question } from './question.types.js';

export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Assessment {
  id: string;
  trainingCourseId: string;
  submoduleId?: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes?: number;
  shuffleQuestions: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentDetail extends Assessment {
  questions: Question[];
}

export interface CreateAssessmentInput {
  trainingCourseId: string;
  submoduleId?: string;
  title: string;
  description: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes?: number;
  shuffleQuestions: boolean;
}

export interface UpdateAssessmentInput {
  title?: string;
  description?: string;
  status?: AssessmentStatus;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  shuffleQuestions?: boolean;
}