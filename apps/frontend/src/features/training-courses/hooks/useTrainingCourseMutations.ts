import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrainingCourseStatus } from '@yunexacademy/shared-types';
import {
  createTrainingCourse,
  updateTrainingCourse,
  changeTrainingCourseStatus,
  deleteTrainingCourse,
} from '../api/training-courses.api';
import { trainingCoursesKeys } from './useTrainingCourses';
import type {
  CreateTrainingCourseInput,
  UpdateTrainingCourseInput,
} from '../types/training-course.types';

export function useCreateTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTrainingCourseInput) => createTrainingCourse(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
    },
  });
}

export function useUpdateTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTrainingCourseInput }) =>
      updateTrainingCourse(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: trainingCoursesKeys.detail(variables.id),
      });
    },
  });
}

export function useChangeTrainingCourseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrainingCourseStatus }) =>
      changeTrainingCourseStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: trainingCoursesKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrainingCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
    },
  });
}