import { useQuery } from '@tanstack/react-query';
import { listByCourse, getSubmodule } from '../api/submodules.api';

export const submodulesKeys = {
  all: ['submodules'] as const,
  byCourse: (courseId: string) => [...submodulesKeys.all, 'course', courseId] as const,
  detail: (id: string) => [...submodulesKeys.all, 'detail', id] as const,
};

export function useSubmodules(courseId: string | undefined) {
  return useQuery({
    queryKey: submodulesKeys.byCourse(courseId ?? ''),
    queryFn: () => listByCourse(courseId!),
    enabled: !!courseId,
  });
}

export function useSubmodule(id: string | undefined) {
  return useQuery({
    queryKey: submodulesKeys.detail(id ?? ''),
    queryFn: () => getSubmodule(id!),
    enabled: !!id,
  });
}