import { apiClient } from '@/lib/api-client';
import type {
  PaginatedUsers,
  UserDetail,
  UserListFilters,
  CreateUserInput,
  UpdateUserInput,
} from '../types/user.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export async function listUsers(filters: UserListFilters = {}): Promise<PaginatedUsers> {
  const { data } = await apiClient.get<ApiSuccess<PaginatedUsers>>('/users', {
    params: filters,
  });
  return data.data;
}

export async function getUser(id: string): Promise<UserDetail> {
  const { data } = await apiClient.get<ApiSuccess<UserDetail>>(`/users/${id}`);
  return data.data;
}

export async function createUser(input: CreateUserInput): Promise<UserDetail> {
  const { data } = await apiClient.post<ApiSuccess<UserDetail>>('/users', input);
  return data.data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDetail> {
  const { data } = await apiClient.patch<ApiSuccess<UserDetail>>(`/users/${id}`, input);
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function adminChangePassword(id: string, newPassword: string): Promise<void> {
  await apiClient.patch(`/users/${id}/password`, { newPassword });
}