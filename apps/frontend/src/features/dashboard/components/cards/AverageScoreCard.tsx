import { TrendingUp } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { AverageScoreValue } from '../../types/dashboard.types';

interface Props {
  value: AverageScoreValue | null;
  isLoading?: boolean;
  error?: string;
}

export function AverageScoreCard({ value, isLoading, error }: Props) {
  const score = value?.averageScore ?? 0;
  const scoreColor =
    score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <IndicatorCard
      title="Puntaje promedio"
      icon={TrendingUp}
      iconColor="text-blue-600"
      iconBg="bg-blue-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.totalAttempts === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">—</p>
          <p className="text-xs text-gray-500 mt-1">Sin intentos</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {score.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
          <p className="text-xs text-gray-500">
            Basado en {value.totalAttempts} intento
            {value.totalAttempts !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </IndicatorCard>
  );
}