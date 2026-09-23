import { apiClient } from '@/lib/api-client';
import type { AssessmentStatus } from '@yunexacademy/shared-types';
import type {
  AssessmentListItem,
  QuestionListItem,
  CreateAssessmentInput,
  UpdateAssessmentInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../types/assessment.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

// ============ ASSESSMENTS ============

export async function listByCourse(courseId: string): Promise<AssessmentListItem[]> {
  const { data } = await apiClient.get<ApiSuccess<AssessmentListItem[]>>(
    `/training-courses/${courseId}/assessments`
  );
  return data.data;
}

export async function getAssessment(id: string): Promise<AssessmentListItem> {
  const { data } = await apiClient.get<ApiSuccess<AssessmentListItem>>(
    `/assessments/${id}`
  );
  return data.data;
}

export async function createAssessment(
  input: CreateAssessmentInput
): Promise<AssessmentListItem> {
  const { trainingCourseId, ...body } = input;
  const { data } = await apiClient.post<ApiSuccess<AssessmentListItem>>(
    `/training-courses/${trainingCourseId}/assessments`,
    body
  );
  return data.data;
}

export async function updateAssessment(
  id: string,
  input: UpdateAssessmentInput
): Promise<AssessmentListItem> {
  const { data } = await apiClient.patch<ApiSuccess<AssessmentListItem>>(
    `/assessments/${id}`,
    input
  );
  return data.data;
}

export async function changeAssessmentStatus(
  id: string,
  status: AssessmentStatus
): Promise<AssessmentListItem> {
  const { data } = await apiClient.patch<ApiSuccess<AssessmentListItem>>(
    `/assessments/${id}/status`,
    { status }
  );
  return data.data;
}

export async function deleteAssessment(id: string): Promise<void> {
  await apiClient.delete(`/assessments/${id}`);
}

// ============ QUESTIONS ============

export async function listQuestions(assessmentId: string): Promise<QuestionListItem[]> {
  const { data } = await apiClient.get<ApiSuccess<QuestionListItem[]>>(
    `/assessments/${assessmentId}/questions`
  );
  return data.data;
}

export async function createQuestion(
  assessmentId: string,
  input: CreateQuestionInput
): Promise<QuestionListItem> {
  const { data } = await apiClient.post<ApiSuccess<QuestionListItem>>(
    `/assessments/${assessmentId}/questions`,
    input
  );
  return data.data;
}

export async function updateQuestion(
  id: string,
  input: UpdateQuestionInput
): Promise<QuestionListItem> {
  const { data } = await apiClient.patch<ApiSuccess<QuestionListItem>>(
    `/questions/${id}`,
    input
  );
  return data.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiClient.delete(`/questions/${id}`);
}