import { RotateCcw } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { AverageAttemptsValue } from '../../types/dashboard.types';

interface Props {
  value: AverageAttemptsValue | null;
  isLoading?: boolean;
  error?: string;
}

export function AverageAttemptsCard({ value, isLoading, error }: Props) {
  return (
    <IndicatorCard
      title="Intentos promedio"
      icon={RotateCcw}
      iconColor="text-indigo-600"
      iconBg="bg-indigo-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.totalStudents === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">—</p>
          <p className="text-xs text-gray-500 mt-1">Sin estudiantes</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {value.averageAttempts.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">por estudiante</span>
          </div>
          <p className="text-xs text-gray-500">
            Calculado sobre {value.totalStudents} estudiante
            {value.totalStudents !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </IndicatorCard>
  );
}