import { useQuery } from '@tanstack/react-query';
import {
  listTrainingCourses,
  getTrainingCourse,
} from '../api/training-courses.api';
import type { TrainingCourseListFilters } from '../types/training-course.types';

export const trainingCoursesKeys = {
  all: ['training-courses'] as const,
  lists: () => [...trainingCoursesKeys.all, 'list'] as const,
  list: (filters: TrainingCourseListFilters) =>
    [...trainingCoursesKeys.lists(), filters] as const,
  details: () => [...trainingCoursesKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingCoursesKeys.details(), id] as const,
};

export function useTrainingCourses(filters: TrainingCourseListFilters) {
  return useQuery({
    queryKey: trainingCoursesKeys.list(filters),
    queryFn: () => listTrainingCourses(filters),
    placeholderData: (prev) => prev,
  });
}

export function useTrainingCourse(id: string | undefined) {
  return useQuery({
    queryKey: trainingCoursesKeys.detail(id ?? ''),
    queryFn: () => getTrainingCourse(id!),
    enabled: !!id,
  });
}