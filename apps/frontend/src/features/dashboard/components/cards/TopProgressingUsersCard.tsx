import { TrendingUp } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import { NoDataState } from '../NoDataState';
import type { TopProgressingUserItem } from '../../types/dashboard.types';

interface Props {
  value: TopProgressingUserItem[] | null;
  isLoading?: boolean;
  error?: string;
}

function getBarColor(percent: number): string {
  if (percent >= 75) return 'bg-green-500';
  if (percent >= 50) return 'bg-blue-500';
  return 'bg-gray-400';
}

export function TopProgressingUsersCard({ value, isLoading, error }: Props) {
  return (
    <IndicatorCard
      title="Usuarios con más progreso"
      icon={TrendingUp}
      iconColor="text-green-600"
      iconBg="bg-green-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.length === 0 ? (
        <NoDataState message="Sin actividad de usuarios aún" />
      ) : (
        <ol className="space-y-3">
          {value.map((user, i) => (
            <li key={user.userId} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(user.progressPercent)}`}
                      style={{ width: `${user.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {user.completedVideos}/{user.totalVideos}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                {user.progressPercent}%
              </span>
            </li>
          ))}
        </ol>
      )}
    </IndicatorCard>
  );
}