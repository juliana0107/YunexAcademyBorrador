import { useQuery } from '@tanstack/react-query';
import { listByCourse } from '../api/submodules.api';

export const submodulesKeys = {
  all: ['submodules'] as const,
  byCourse: (courseId: string) => [...submodulesKeys.all, 'course', courseId] as const,
};

export function useSubmodules(courseId: string | undefined) {
  return useQuery({
    queryKey: submodulesKeys.byCourse(courseId ?? ''),
    queryFn: () => listByCourse(courseId!),
    enabled: !!courseId,
  });
}
