import { useQuery } from '@tanstack/react-query';
import {
  getVideoProgress,
  getSubmoduleProgress,
  getMyProgressOverview,
} from '../api/video-progress.api';

export const videoProgressKeys = {
  all: ['video-progress'] as const,
  video: (videoId: string) => [...videoProgressKeys.all, 'video', videoId] as const,
  submodule: (submoduleId: string) =>
    [...videoProgressKeys.all, 'submodule', submoduleId] as const,
  overview: () => [...videoProgressKeys.all, 'overview'] as const,
};

export function useVideoProgress(videoId: string | undefined) {
  return useQuery({
    queryKey: videoProgressKeys.video(videoId ?? ''),
    queryFn: () => getVideoProgress(videoId!),
    enabled: !!videoId,
  });
}

export function useSubmoduleProgress(submoduleId: string | undefined) {
  return useQuery({
    queryKey: videoProgressKeys.submodule(submoduleId ?? ''),
    queryFn: () => getSubmoduleProgress(submoduleId!),
    enabled: !!submoduleId,
  });
}

export function useMyProgressOverview() {
  return useQuery({
    queryKey: videoProgressKeys.overview(),
    queryFn: () => getMyProgressOverview(),
  });
}