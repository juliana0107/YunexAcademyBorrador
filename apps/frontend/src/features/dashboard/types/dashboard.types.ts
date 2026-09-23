export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  trainingCourseId?: string;
  topLimit: number;
}

export interface IndicatorResult<T = unknown> {
  key: string;
  label: string;
  value: T | null;
  error?: string;
  updatedAt: string;
}

export interface DashboardData {
  filters: DashboardFilters;
  generatedAt: string;
  indicators: Record<string, IndicatorResult>;
}

export interface CoursesByStatusValue {
  draft: number;
  published: number;
  archived: number;
}

export interface UsersByRoleValue {
  admin: number;
  instructor: number;
  student: number;
}

export interface VideoProgressValue {
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
  notStartedVideos: number;
  averageProgressPercent: number;
}

export interface AverageScoreValue {
  averageScore: number;
  totalAttempts: number;
}

export interface ApprovalRateValue {
  approvedAttempts: number;
  totalGradedAttempts: number;
  approvalRatePercent: number;
}

export type DateRangePreset =
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'all-time';