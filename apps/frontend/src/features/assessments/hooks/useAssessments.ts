import { useQuery } from '@tanstack/react-query';
import {
  listByCourse,
  getAssessment,
  listQuestions,
} from '../api/assessments.api';

export const assessmentsKeys = {
  all: ['assessments'] as const,
  byCourse: (courseId: string) => [...assessmentsKeys.all, 'course', courseId] as const,
  detail: (id: string) => [...assessmentsKeys.all, 'detail', id] as const,
  questions: (assessmentId: string) =>
    [...assessmentsKeys.all, 'questions', assessmentId] as const,
};

export function useAssessments(courseId: string | undefined) {
  return useQuery({
    queryKey: assessmentsKeys.byCourse(courseId ?? ''),
    queryFn: () => listByCourse(courseId!),
    enabled: !!courseId,
  });
}

export function useAssessment(id: string | undefined) {
  return useQuery({
    queryKey: assessmentsKeys.detail(id ?? ''),
    queryFn: () => getAssessment(id!),
    enabled: !!id,
  });
}

export function useQuestions(assessmentId: string | undefined) {
  return useQuery({
    queryKey: assessmentsKeys.questions(assessmentId ?? ''),
    queryFn: () => listQuestions(assessmentId!),
    enabled: !!assessmentId,
  });
}