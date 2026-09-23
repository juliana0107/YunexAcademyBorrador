import { CheckCircle2 } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { ApprovalRateValue } from '../../types/dashboard.types';

interface Props {
  value: ApprovalRateValue | null;
  isLoading?: boolean;
  error?: string;
}

export function ApprovalRateCard({ value, isLoading, error }: Props) {
  const rate = value?.approvalRatePercent ?? 0;
  const rateColor =
    rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-amber-600' : 'text-red-600';

  return (
    <IndicatorCard
      title="Tasa de aprobación"
      icon={CheckCircle2}
      iconColor="text-green-600"
      iconBg="bg-green-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.totalGradedAttempts === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">—</p>
          <p className="text-xs text-gray-500 mt-1">Sin intentos</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${rateColor}`}>{rate}%</span>
          </div>
          <p className="text-xs text-gray-500">
            {value.approvedAttempts} de {value.totalGradedAttempts} intento
            {value.totalGradedAttempts !== 1 ? 's' : ''} aprobados
          </p>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}