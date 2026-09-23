import { Clock } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { AverageWatchTimeValue } from '../../types/dashboard.types';

interface Props {
  value: AverageWatchTimeValue | null;
  isLoading?: boolean;
  error?: string;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';
  if (seconds < 60) return `${seconds}s`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
}

export function AverageWatchTimeCard({ value, isLoading, error }: Props) {
  return (
    <IndicatorCard
      title="Tiempo de visualización"
      icon={Clock}
      iconColor="text-cyan-600"
      iconBg="bg-cyan-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.totalWatchTimeSeconds === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">—</p>
          <p className="text-xs text-gray-500 mt-1">Sin actividad</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Promedio
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(value.averageWatchTimeSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Total
            </p>
            <p className="text-sm font-medium text-gray-700">
              {formatDuration(value.totalWatchTimeSeconds)}
            </p>
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}