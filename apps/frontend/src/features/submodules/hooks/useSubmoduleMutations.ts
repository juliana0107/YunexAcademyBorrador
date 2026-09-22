import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSubmodule,
  updateSubmodule,
  changeSubmoduleOrder,
  deleteSubmodule,
} from '../api/submodules.api';
import { submodulesKeys } from './useSubmodules';
import { trainingCoursesKeys } from '@/features/training-courses/hooks/useTrainingCourses';
import type {
  CreateSubmoduleInput,
  UpdateSubmoduleInput,
} from '../types/submodule.types';

export function useCreateSubmodule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubmoduleInput) => createSubmodule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submodulesKeys.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
    },
  });
}

export function useUpdateSubmodule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubmoduleInput }) =>
      updateSubmodule(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submodulesKeys.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.detail(courseId) });
    },
  });
}

export function useChangeSubmoduleOrder(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      changeSubmoduleOrder(id, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submodulesKeys.byCourse(courseId) });
    },
  });
}

export function useDeleteSubmodule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubmodule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submodulesKeys.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
    },
  });
}