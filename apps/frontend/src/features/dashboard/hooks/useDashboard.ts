import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard.api';
import type { DashboardFilters } from '../types/dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (filters: DashboardFilters) => [...dashboardKeys.all, filters] as const,
};

export function useDashboard(filters: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.data(filters),
    queryFn: () => fetchDashboard(filters),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}