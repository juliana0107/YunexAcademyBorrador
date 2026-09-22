import { apiClient } from '@/lib/api-client';
import type {
  AuthUser,
  ApiSuccess,
  LoginInput,
  LoginResult,
} from '@yunexacademy/shared-types';

export async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<ApiSuccess<LoginResult>>(
    '/auth/login',
    input
  );
  return data.data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiSuccess<AuthUser>>('/auth/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}