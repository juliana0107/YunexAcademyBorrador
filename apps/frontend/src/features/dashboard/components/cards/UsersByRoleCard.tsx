import { Users } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import type { UsersByRoleValue } from '../../types/dashboard.types';

interface Props {
  value: UsersByRoleValue | null;
  isLoading?: boolean;
  error?: string;
}

export function UsersByRoleCard({ value, isLoading, error }: Props) {
  const total = value ? value.admin + value.instructor + value.student : 0;

  return (
    <IndicatorCard
      title="Usuarios por rol"
      icon={Users}
      iconColor="text-purple-600"
      iconBg="bg-purple-50"
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
            <span className="text-xs text-gray-500">usuarios</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <RoleBox label="Admins" count={value.admin} color="bg-purple-100 text-purple-700" />
            <RoleBox
              label="Instructores"
              count={value.instructor}
              color="bg-blue-100 text-blue-700"
            />
            <RoleBox
              label="Estudiantes"
              count={value.student}
              color="bg-amber-100 text-amber-700"
            />
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}

function RoleBox({
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