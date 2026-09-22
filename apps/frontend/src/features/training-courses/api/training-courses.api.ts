import { apiClient } from '@/lib/api-client';
import type { TrainingCourseStatus } from '@yunexacademy/shared-types';
import type {
  PaginatedTrainingCourses,
  TrainingCourseListItem,
  TrainingCourseListFilters,
  CreateTrainingCourseInput,
  UpdateTrainingCourseInput,
} from '../types/training-course.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export async function listTrainingCourses(
  filters: TrainingCourseListFilters = {}
): Promise<PaginatedTrainingCourses> {
  const { data } = await apiClient.get<ApiSuccess<PaginatedTrainingCourses>>(
    '/training-courses',
    { params: filters }
  );
  return data.data;
}

export async function getTrainingCourse(id: string): Promise<TrainingCourseListItem> {
  const { data } = await apiClient.get<ApiSuccess<TrainingCourseListItem>>(
    `/training-courses/${id}`
  );
  return data.data;
}

export async function createTrainingCourse(
  input: CreateTrainingCourseInput
): Promise<TrainingCourseListItem> {
  const { data } = await apiClient.post<ApiSuccess<TrainingCourseListItem>>(
    '/training-courses',
    input
  );
  return data.data;
}

export async function updateTrainingCourse(
  id: string,
  input: UpdateTrainingCourseInput
): Promise<TrainingCourseListItem> {
  const { data } = await apiClient.patch<ApiSuccess<TrainingCourseListItem>>(
    `/training-courses/${id}`,
    input
  );
  return data.data;
}

export async function changeTrainingCourseStatus(
  id: string,
  status: TrainingCourseStatus
): Promise<TrainingCourseListItem> {
  const { data } = await apiClient.patch<ApiSuccess<TrainingCourseListItem>>(
    `/training-courses/${id}/status`,
    { status }
  );
  return data.data;
}

export async function deleteTrainingCourse(id: string): Promise<void> {
  await apiClient.delete(`/training-courses/${id}`);
}