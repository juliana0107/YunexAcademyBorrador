import { apiClient } from '@/lib/api-client';
import type {
  VideoProgress,
  SubmoduleProgress,
  UserProgressOverview,
} from '../types/video-progress.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export async function getVideoProgress(
  videoId: string
): Promise<VideoProgress | null> {
  const { data } = await apiClient.get<ApiSuccess<VideoProgress | null>>(
    `/videos/${videoId}/progress`
  );
  return data.data;
}

export async function upsertVideoProgress(
  videoId: string,
  watchedSeconds: number,
  totalSeconds: number
): Promise<VideoProgress> {
  const { data } = await apiClient.put<ApiSuccess<VideoProgress>>(
    `/videos/${videoId}/progress`,
    { watchedSeconds, totalSeconds }
  );
  return data.data;
}

export async function getSubmoduleProgress(
  submoduleId: string
): Promise<SubmoduleProgress> {
  const { data } = await apiClient.get<ApiSuccess<SubmoduleProgress>>(
    `/submodules/${submoduleId}/progress`
  );
  return data.data;
}

export async function getMyProgressOverview(): Promise<UserProgressOverview> {
  const { data } = await apiClient.get<ApiSuccess<UserProgressOverview>>(
    `/me/progress`
  );
  return data.data;
}