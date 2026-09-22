// Tipos compartidos entre frontend y backend
export type UserRole = 'admin' | 'teacher' | 'student';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
