import { apiClient } from '@/lib/api-client';
import type {
  SubmoduleListItem,
  CreateSubmoduleInput,
  UpdateSubmoduleInput,
} from '../types/submodule.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}
export async function getSubmodule(id: string): Promise<SubmoduleListItem> {
  const { data } = await apiClient.get<ApiSuccess<SubmoduleListItem>>(
    `/submodules/${id}`
  );
  return data.data;
}


export async function listByCourse(courseId: string): Promise<SubmoduleListItem[]> {
  const { data } = await apiClient.get<ApiSuccess<SubmoduleListItem[]>>(
    `/training-courses/${courseId}/submodules`
  );
  return data.data;
}

export async function createSubmodule(
  input: CreateSubmoduleInput
): Promise<SubmoduleListItem> {
  const { trainingCourseId, ...body } = input;
  const { data } = await apiClient.post<ApiSuccess<SubmoduleListItem>>(
    `/training-courses/${trainingCourseId}/submodules`,
    body
  );
  return data.data;
}

export async function updateSubmodule(
  id: string,
  input: UpdateSubmoduleInput
): Promise<SubmoduleListItem> {
  const { data } = await apiClient.patch<ApiSuccess<SubmoduleListItem>>(
    `/submodules/${id}`,
    input
  );
  return data.data;
}

export async function changeSubmoduleOrder(
  id: string,
  order: number
): Promise<SubmoduleListItem> {
  const { data } = await apiClient.patch<ApiSuccess<SubmoduleListItem>>(
    `/submodules/${id}/order`,
    { order }
  );
  return data.data;
}

export async function deleteSubmodule(id: string): Promise<void> {
  await apiClient.delete(`/submodules/${id}`);
}