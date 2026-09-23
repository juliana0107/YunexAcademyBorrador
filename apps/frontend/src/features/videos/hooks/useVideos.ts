import { useQuery } from '@tanstack/react-query';
import { listBySubmodule, getVideo } from '../api/videos.api';

export const videosKeys = {
  all: ['videos'] as const,
  bySubmodule: (submoduleId: string) =>
    [...videosKeys.all, 'submodule', submoduleId] as const,
  detail: (id: string) => [...videosKeys.all, 'detail', id] as const,
};

export function useVideos(submoduleId: string | undefined) {
  return useQuery({
    queryKey: videosKeys.bySubmodule(submoduleId ?? ''),
    queryFn: () => listBySubmodule(submoduleId!),
    enabled: !!submoduleId,
  });
}

export function useVideo(id: string | undefined) {
  return useQuery({
    queryKey: videosKeys.detail(id ?? ''),
    queryFn: () => getVideo(id!),
    enabled: !!id,
  });
}