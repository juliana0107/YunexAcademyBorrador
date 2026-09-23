export interface VideoProgress {
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

export interface SubmoduleVideoProgress {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  progressPercent: number;
  lastWatchedAt: string | null;
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
  videos: SubmoduleVideoProgress[];
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