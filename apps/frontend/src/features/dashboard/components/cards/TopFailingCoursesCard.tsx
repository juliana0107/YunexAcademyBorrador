import { TrendingDown } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import { NoDataState } from '../NoDataState';
import type { TopFailingCourseItem } from '../../types/dashboard.types';

interface Props {
  value: TopFailingCourseItem[] | null;
  isLoading?: boolean;
  error?: string;
}

function getBarColor(percent: number): string {
  if (percent >= 75) return 'bg-red-500';
  if (percent >= 50) return 'bg-amber-500';
  return 'bg-gray-400';
}

export function TopFailingCoursesCard({ value, isLoading, error }: Props) {
  return (
    <IndicatorCard
      title="Cursos con más fallos"
      icon={TrendingDown}
      iconColor="text-red-600"
      iconBg="bg-red-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.length === 0 ? (
        <NoDataState message="Sin datos de intentos aún" />
      ) : (
        <ol className="space-y-3">
          {value.map((course, i) => (
            <li key={course.trainingCourseId} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {course.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(course.failureRatePercent)}`}
                      style={{ width: `${course.failureRatePercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {course.failedAttempts}/{course.totalAttempts}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                {course.failureRatePercent}%
              </span>
            </li>
          ))}
        </ol>
      )}
    </IndicatorCard>
  );
}