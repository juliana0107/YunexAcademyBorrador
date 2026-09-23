import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { dashboardKeys } from '../hooks/useDashboard';
import { DashboardFilters } from '../components/DashboardFilters';
import { PartialErrorBanner } from '../components/PartialErrorBanner';
import { CoursesByStatusCard } from '../components/cards/CoursesByStatusCard';
import { UsersByRoleCard } from '../components/cards/UsersByRoleCard';
import { VideoProgressCard } from '../components/cards/VideoProgressCard';
import { AverageScoreCard } from '../components/cards/AverageScoreCard';
import { ApprovalRateCard } from '../components/cards/ApprovalRateCard';
import type {
  CoursesByStatusValue,
  UsersByRoleValue,
  VideoProgressValue,
  AverageScoreValue,
  ApprovalRateValue,
} from '../types/dashboard.types';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const {
    filters,
    preset,
    setPreset,
  } = useDashboardFilters();

  const { data, isLoading, isFetching, refetch } = useDashboard(filters);

  const indicators = data?.indicators ?? {};

  // Recolectar errores por indicador
  const errors = useMemo(() => {
    const list: string[] = [];
    for (const key of Object.keys(indicators)) {
      const ind = indicators[key];
      if (ind?.error) list.push(`${ind.label}: ${ind.error}`);
    }
    return list;
  }, [indicators]);

  const handleRefresh = useCallback(() => {
    // Invalida cache del frontend y dispara refetch
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    void refetch();
  }, [queryClient, refetch]);

  const getValue = <T,>(key: string): T | null => {
    const ind = indicators[key];
    if (!ind || ind.error) return null;
    return ind.value as T;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen general de la plataforma
          </p>
        </div>

        <DashboardFilters
          preset={preset}
          onPresetChange={setPreset}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />
      </div>

      {errors.length > 0 && <PartialErrorBanner errors={errors} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <CoursesByStatusCard
          value={getValue<CoursesByStatusValue>('coursesByStatus')}
          isLoading={isLoading}
          error={indicators.coursesByStatus?.error}
        />
        <UsersByRoleCard
          value={getValue<UsersByRoleValue>('usersByRole')}
          isLoading={isLoading}
          error={indicators.usersByRole?.error}
        />
        <VideoProgressCard
          value={getValue<VideoProgressValue>('videoProgress')}
          isLoading={isLoading}
          error={indicators.videoProgress?.error}
        />
        <AverageScoreCard
          value={getValue<AverageScoreValue>('averageScore')}
          isLoading={isLoading}
          error={indicators.averageScore?.error}
        />
        <ApprovalRateCard
          value={getValue<ApprovalRateValue>('approvalRate')}
          isLoading={isLoading}
          error={indicators.approvalRate?.error}
        />
      </div>

      {data && (
        <p className="text-xs text-gray-400 text-center mt-8">
          Actualizado {new Date(data.generatedAt).toLocaleString('es-CO')}
        </p>
      )}
    </div>
  );
}