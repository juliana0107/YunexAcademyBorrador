import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssessmentStatus } from '@yunexacademy/shared-types';
import {
  createAssessment,
  updateAssessment,
  changeAssessmentStatus,
  deleteAssessment,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../api/assessments.api';
import { assessmentsKeys } from './useAssessments';
import { trainingCoursesKeys } from '@/features/training-courses/hooks/useTrainingCourses';
import type {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../types/assessment.types';

export function useCreateAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssessmentInput) => createAssessment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.detail(courseId) });
    },
  });
}

export function useUpdateAssessment(assessmentId: string, courseId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAssessmentInput) => updateAssessment(assessmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.detail(assessmentId) });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: assessmentsKeys.byCourse(courseId) });
      }
    },
  });
}

export function useChangeAssessmentStatus(assessmentId: string, courseId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: AssessmentStatus) =>
      changeAssessmentStatus(assessmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.detail(assessmentId) });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: assessmentsKeys.byCourse(courseId) });
      }
    },
  });
}

export function useDeleteAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.detail(courseId) });
    },
  });
}

// ============ QUESTIONS ============

export function useCreateQuestion(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => createQuestion(assessmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.questions(assessmentId) });
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.detail(assessmentId) });
    },
  });
}

export function useUpdateQuestion(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuestionInput }) =>
      updateQuestion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.questions(assessmentId) });
    },
  });
}

export function useDeleteQuestion(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.questions(assessmentId) });
      queryClient.invalidateQueries({ queryKey: assessmentsKeys.detail(assessmentId) });
    },
  });
}