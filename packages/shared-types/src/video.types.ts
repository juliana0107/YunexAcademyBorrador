export type VideoStatus = 'PROCESSING' | 'READY' | 'FAILED';

export interface Video {
  id: string;
  submoduleId: string;
  title: string;
  description?: string;
  status: VideoStatus;
  order: number;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoInput {
  submoduleId: string;
  title: string;
  description?: string;
  order: number;
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  order?: number;
}

export interface VideoProgress {
  id: string;
  userId: string;
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface UpdateVideoProgressInput {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
}

export interface ScreenshotAttempt {
  id: string;
  userId: string;
  videoId: string;
  occurredAt: string;
  userAgent?: string;
}