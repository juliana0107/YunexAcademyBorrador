import type { DashboardFilters } from '../dashboard.types.js';

export function buildCacheKey(filters: DashboardFilters): string {
  const parts = [
    'dashboard',
    filters.dateFrom ?? 'all',
    filters.dateTo ?? 'all',
    filters.trainingCourseId ?? 'all',
    `top${filters.topLimit}`,
  ];
  return parts.join(':');
}