import { ClipboardList } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { AssessmentsByStatusValue } from '../../types/dashboard.types';

interface Props {
  value: AssessmentsByStatusValue | null;
  isLoading?: boolean;
  error?: string;
}

export function AssessmentsByStatusCard({ value, isLoading, error }: Props) {
  const total = value ? value.draft + value.published + value.archived : 0;

  return (
    <IndicatorCard
      title="Evaluaciones por estado"
      icon={ClipboardList}
      iconColor="text-violet-600"
      iconBg="bg-violet-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || total === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">0</p>
          <p className="text-xs text-gray-500 mt-1">Sin evaluaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">totales</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatusBox label="Publicadas" count={value.published} color="bg-green-100 text-green-700" />
            <StatusBox label="Borradores" count={value.draft} color="bg-amber-100 text-amber-700" />
            <StatusBox label="Archivadas" count={value.archived} color="bg-gray-100 text-gray-700" />
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