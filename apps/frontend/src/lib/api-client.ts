import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiResponse } from '@yunexacademy/shared-types';

// Cliente HTTP único para toda la app.
// Usa el proxy de Vite: /api/* → http://localhost:4000/api/*
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

const TOKEN_KEY = 'yunex.auth.token';
const USER_KEY = 'yunex.auth.user';


// ============ Bearer token ============
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Maneja 401 global ============
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
    
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

// Extrae el mensaje de error legible desde una respuesta estándar.

export function extractApiErrorMessage(error: unknown): string {
  if (error instanceof Error && 'isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const data = axiosError.response?.data;

    if (data && data.success === false) {
      return data.error.message;
    }

    if (axiosError.response?.status === 0 || !axiosError.response) {
      return 'No se pudo conectar con el servidor';
    }
  }

  return 'Ocurrió un error inesperado';
}