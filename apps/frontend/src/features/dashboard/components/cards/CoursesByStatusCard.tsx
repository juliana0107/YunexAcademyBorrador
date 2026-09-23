import { BookOpen } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { CoursesByStatusValue } from '../../types/dashboard.types';

interface Props {
  value: CoursesByStatusValue | null;
  isLoading?: boolean;
  error?: string;
}

export function CoursesByStatusCard({ value, isLoading, error }: Props) {
  const total = value ? value.draft + value.published + value.archived : 0;

  return (
    <IndicatorCard
      title="Cursos por estado"
      icon={BookOpen}
      isLoading={isLoading}
      error={error}
    >
      {!value || total === 0 ? (
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-gray-300">0</p>
          <p className="text-xs text-gray-500 mt-1">Sin cursos creados</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">totales</span>
          </div>

          <div className="space-y-2">
            <StatusRow
              label="Publicados"
              count={value.published}
              total={total}
              color="bg-green-500"
            />
            <StatusRow
              label="Borradores"
              count={value.draft}
              total={total}
              color="bg-amber-500"
            />
            <StatusRow
              label="Archivados"
              count={value.archived}
              total={total}
              color="bg-gray-400"
            />
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}

function StatusRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{count}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}