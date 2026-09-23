import { UserCheck } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { UsersByStatusValue } from '../../types/dashboard.types';

interface Props {
  value: UsersByStatusValue | null;
  isLoading?: boolean;
  error?: string;
}

export function UsersByStatusCard({ value, isLoading, error }: Props) {
  const total = value ? value.active + value.inactive + value.suspended : 0;

  return (
    <IndicatorCard
      title="Usuarios por estado"
      icon={UserCheck}
      iconColor="text-teal-600"
      iconBg="bg-teal-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || total === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">0</p>
          <p className="text-xs text-gray-500 mt-1">Sin usuarios</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">totales</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatusBox
              label="Activos"
              count={value.active}
              color="bg-green-100 text-green-700"
            />
            <StatusBox
              label="Inactivos"
              count={value.inactive}
              color="bg-gray-100 text-gray-700"
            />
            <StatusBox
              label="Suspendidos"
              count={value.suspended}
              color="bg-red-100 text-red-700"
            />
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}

function StatusBox({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-2 text-center ${color}`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}