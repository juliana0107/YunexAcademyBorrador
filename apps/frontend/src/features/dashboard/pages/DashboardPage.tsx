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
import { UsersByStatusCard } from '../components/cards/UsersByStatusCard';
import { AssessmentsByStatusCard } from '../components/cards/AssessmentsByStatusCard';
import { AverageAttemptsCard } from '../components/cards/AverageAttemptsCard';
import { ScreenshotAttemptsCard } from '../components/cards/ScreenshotAttemptsCard';
import { AverageWatchTimeCard } from '../components/cards/AverageWatchTimeCard';
import { TopFailingCoursesCard } from '../components/cards/TopFailingCoursesCard';
import { TopProgressingUsersCard } from '../components/cards/TopProgressingUsersCard';
import { MostFailedQuestionsCard } from '../components/cards/MostFailedQuestionsCard';
import type {
  CoursesByStatusValue,
  UsersByRoleValue,
  VideoProgressValue,
  AverageScoreValue,
  ApprovalRateValue,
  UsersByStatusValue,
  AssessmentsByStatusValue,
  AverageAttemptsValue,
  ScreenshotAttemptsValue,
  AverageWatchTimeValue,
  TopFailingCourseItem,
  TopProgressingUserItem,
  MostFailedQuestionItem,
} from '../types/dashboard.types';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { filters, preset, setPreset } = useDashboardFilters();

  const { data, isLoading, isFetching, refetch } = useDashboard(filters);

  const indicators = data?.indicators ?? {};

  const errors = useMemo(() => {
    const list: string[] = [];
    for (const key of Object.keys(indicators)) {
      const ind = indicators[key];
      if (ind?.error) list.push(`${ind.label}: ${ind.error}`);
    }
    return list;
  }, [indicators]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    void refetch();
  }, [queryClient, refetch]);

  const getValue = <T,>(key: string): T | null => {
    const ind = indicators[key];
    if (!ind || ind.error) return null;
    return ind.value as T;
  };

  const getError = (key: string): string | undefined => indicators[key]?.error;

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

      {/* ============ SECCIÓN: RESUMEN ============ */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Resumen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <CoursesByStatusCard
            value={getValue<CoursesByStatusValue>('coursesByStatus')}
            isLoading={isLoading}
            error={getError('coursesByStatus')}
          />
          <UsersByRoleCard
            value={getValue<UsersByRoleValue>('usersByRole')}
            isLoading={isLoading}
            error={getError('usersByRole')}
          />
          <UsersByStatusCard
            value={getValue<UsersByStatusValue>('usersByStatus')}
            isLoading={isLoading}
            error={getError('usersByStatus')}
          />
          <AssessmentsByStatusCard
            value={getValue<AssessmentsByStatusValue>('assessmentsByStatus')}
            isLoading={isLoading}
            error={getError('assessmentsByStatus')}
          />
          <VideoProgressCard
            value={getValue<VideoProgressValue>('videoProgress')}
            isLoading={isLoading}
            error={getError('videoProgress')}
          />

          <AverageScoreCard
            value={getValue<AverageScoreValue>('averageScore')}
            isLoading={isLoading}
            error={getError('averageScore')}
          />
          <ApprovalRateCard
            value={getValue<ApprovalRateValue>('approvalRate')}
            isLoading={isLoading}
            error={getError('approvalRate')}
          />
          <AverageAttemptsCard
            value={getValue<AverageAttemptsValue>('averageAttempts')}
            isLoading={isLoading}
            error={getError('averageAttempts')}
          />
          <AverageWatchTimeCard
            value={getValue<AverageWatchTimeValue>('averageWatchTime')}
            isLoading={isLoading}
            error={getError('averageWatchTime')}
          />
          <ScreenshotAttemptsCard
            value={getValue<ScreenshotAttemptsValue>('screenshotAttempts')}
            isLoading={isLoading}
            error={getError('screenshotAttempts')}
          />
        </div>
      </section>

      {/* ============ SECCIÓN: ANALÍTICA ============ */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Analítica
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TopFailingCoursesCard
            value={getValue<TopFailingCourseItem[]>('topFailingCourses')}
            isLoading={isLoading}
            error={getError('topFailingCourses')}
          />
          <TopProgressingUsersCard
            value={getValue<TopProgressingUserItem[]>('topProgressingUsers')}
            isLoading={isLoading}
            error={getError('topProgressingUsers')}
          />
          <MostFailedQuestionsCard
            value={getValue<MostFailedQuestionItem[]>('mostFailedQuestions')}
            isLoading={isLoading}
            error={getError('mostFailedQuestions')}
          />
        </div>
      </section>

      {data && (
        <p className="text-xs text-gray-400 text-center mt-8">
          Actualizado {new Date(data.generatedAt).toLocaleString('es-CO')}
        </p>
      )}
    </div>
  );
}