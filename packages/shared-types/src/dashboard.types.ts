export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  trainingCourseId?: string;
  submoduleId?: string;
}

export interface DashboardIndicator<T = unknown> {
  key: string;
  label: string;
  value: T;
  previousValue?: T;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  updatedAt: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface CoursesByStatus {
  draft: number;
  published: number;
  archived: number;
}

export interface UsersByRole {
  admin: number;
  instructor: number;
  student: number;
}

export interface UsersByStatus {
  active: number;
  inactive: number;
  suspended: number;
}

export interface VideoProgressSummary {
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
  notStartedVideos: number;
  averageProgressPercent: number;
}

export interface AssessmentsSummary {
  totalAssessments: number;
  draftAssessments: number;
  publishedAssessments: number;
  archivedAssessments: number;
}

export interface AverageScoreData {
  averageScore: number;
  totalAttempts: number;
  scoredAttempts: number;
}

export interface ApprovalRateData {
  approvedAttempts: number;
  totalGradedAttempts: number;
  approvalRatePercent: number;
}

export interface AverageAttemptsData {
  averageAttempts: number;
  totalStudents: number;
}

export interface TopFailingCourse {
  trainingCourseId: string;
  title: string;
  failedAttempts: number;
  totalAttempts: number;
  failureRatePercent: number;
}

export interface TopProgressingUser {
  userId: string;
  fullName: string;
  completedVideos: number;
  totalVideos: number;
  progressPercent: number;
}

export interface ScreenshotAttemptsData {
  totalAttempts: number;
  uniqueUsers: number;
  affectedVideos: number;
}

export interface AverageWatchTimeData {
  averageWatchTimeSeconds: number;
  totalWatchTimeSeconds: number;
  totalSessions: number;
}

export interface MostFailedQuestion {
  questionId: string;
  statement: string;
  questionType: string;
  failedAttempts: number;
  totalAttempts: number;
  failureRatePercent: number;
}

export interface DashboardData {
  filters: DashboardFilters;
  generatedAt: string;
  coursesByStatus: DashboardIndicator<CoursesByStatus>;
  coursesByVideoCount: DashboardIndicator<ChartDataPoint[]>;
  usersByRole: DashboardIndicator<UsersByRole>;
  usersByStatus: DashboardIndicator<UsersByStatus>;
  videoProgress: DashboardIndicator<VideoProgressSummary>;
  assessmentsByStatus: DashboardIndicator<AssessmentsSummary>;
  averageScore: DashboardIndicator<AverageScoreData>;
  approvalRate: DashboardIndicator<ApprovalRateData>;
  averageAttempts: DashboardIndicator<AverageAttemptsData>;
  topFailingCourses: DashboardIndicator<TopFailingCourse[]>;
  topProgressingUsers: DashboardIndicator<TopProgressingUser[]>;
  screenshotAttempts: DashboardIndicator<ScreenshotAttemptsData>;
  averageWatchTime: DashboardIndicator<AverageWatchTimeData>;
  mostFailedQuestions: DashboardIndicator<MostFailedQuestion[]>;
}

export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: {
    code: string;
    message: string;
  };
}