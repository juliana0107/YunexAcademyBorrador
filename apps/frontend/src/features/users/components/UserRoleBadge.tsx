import type { RoleName } from '@yunexacademy/shared-types';

const ROLE_STYLES: Record<RoleName, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  INSTRUCTOR: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-amber-100 text-amber-700',
};

interface Props {
  role: RoleName;
}

export function UserRoleBadge({ role }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}