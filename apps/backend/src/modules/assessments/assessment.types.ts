export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

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

export interface AssessmentDetail extends AssessmentListItem {}

export interface AssessmentListFilters {
  trainingCourseId?: string;
  submoduleId?: string;
  status?: AssessmentStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedAssessments {
  items: AssessmentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}