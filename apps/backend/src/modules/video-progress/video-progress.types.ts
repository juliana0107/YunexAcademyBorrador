export interface VideoProgressItem {
  id: string;
  userId: string;
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  progressPercent: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoProgressSummary {
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
  notStartedVideos: number;
  averageProgressPercent: number;
}

export interface SubmoduleProgress {
  submoduleId: string;
  videos: Array<{
    videoId: string;
    watchedSeconds: number;
    totalSeconds: number;
    completed: boolean;
    progressPercent: number;
    lastWatchedAt: string | null;
  }>;
  summary: VideoProgressSummary;
}

export interface UserProgressOverview {
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
  notStartedVideos: number;
  totalWatchTimeSeconds: number;
  averageProgressPercent: number;
}