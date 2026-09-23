import { apiClient } from '@/lib/api-client';
import type { DashboardData, DashboardFilters } from '../types/dashboard.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export async function fetchDashboard(
  filters: Partial<DashboardFilters> = {}
): Promise<DashboardData> {
  const params: Record<string, string | number> = {};

  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.trainingCourseId) params.trainingCourseId = filters.trainingCourseId;
  if (filters.topLimit) params.topLimit = filters.topLimit;

  const { data } = await apiClient.get<ApiSuccess<DashboardData>>('/dashboard', {
    params,
  });
  return data.data;
}

export async function invalidateDashboardCache(): Promise<void> {
  await apiClient.post('/dashboard/invalidate-cache');
}