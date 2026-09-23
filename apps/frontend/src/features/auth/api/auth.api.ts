import { apiClient } from '@/lib/api-client';
import type { AuthUser, LoginInput, LoginResult } from '../types/auth.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await apiClient.post<ApiSuccess<LoginResult>>('/auth/login', input);
  return data.data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiSuccess<AuthUser>>('/auth/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export function extractErrorMessage(error: unknown): string {
  // Axios error
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: { data?: ApiErrorResponse };
    };
    const data = axiosError.response?.data;
    if (data && data.success === false && data.error?.message) {
      return data.error.message;
    }
  }

  // Error normal
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}