/**
 * Roles del sistema Yunex Academy.
 *
 * IMPORTANTE: estos valores deben coincidir EXACTAMENTE con:
 *   - apps/backend/src/database/migrations/002_create_roles_table.sql (CHECK)
 *   - apps/backend/src/database/seeds/001_roles_and_permissions.ts
 * Si el backend cambia, esto debe cambiar también. Coordinar con backend.
 */
export const ROLE = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const;

export type RoleName = (typeof ROLE)[keyof typeof ROLE];

export const ROLES: readonly RoleName[] = [
  ROLE.ADMIN,
  ROLE.INSTRUCTOR,
  ROLE.STUDENT,
];

/**
 * Permisos atómicos del sistema.
 *
 * IMPORTANTE: deben coincidir EXACTAMENTE con:
 *   - apps/backend/src/database/seeds/001_roles_and_permissions.ts
 * Si el backend cambia, esto debe cambiar también. Coordinar con backend.
 */
export const PERMISSION = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  ROLES_READ: 'roles:read',
  ROLES_WRITE: 'roles:write',
  TRAINING_COURSES_READ: 'training-courses:read',
  TRAINING_COURSES_WRITE: 'training-courses:write',
  TRAINING_COURSES_DELETE: 'training-courses:delete',
  SUBMODULES_READ: 'submodules:read',
  SUBMODULES_WRITE: 'submodules:write',
  SUBMODULES_DELETE: 'submodules:delete',
  VIDEOS_READ: 'videos:read',
  VIDEOS_WRITE: 'videos:write',
  VIDEOS_DELETE: 'videos:delete',
  ASSESSMENTS_READ: 'assessments:read',
  ASSESSMENTS_WRITE: 'assessments:write',
  ASSESSMENTS_DELETE: 'assessments:delete',
  ATTEMPTS_READ: 'attempts:read',
  ATTEMPTS_WRITE: 'attempts:write',
  DASHBOARD_READ: 'dashboard:read',
} as const;

export type PermissionName = (typeof PERMISSION)[keyof typeof PERMISSION];

export const PERMISSIONS: readonly PermissionName[] = Object.values(PERMISSION);

/**
 * Mapa rol → permisos por defecto.
 * Refleja exactamente lo que el seed inserta en `role_permissions`.
 */
export const ROLE_PERMISSIONS: Record<RoleName, readonly PermissionName[]> = {
  [ROLE.ADMIN]: PERMISSIONS,
  [ROLE.INSTRUCTOR]: [
    PERMISSION.TRAINING_COURSES_READ,
    PERMISSION.TRAINING_COURSES_WRITE,
    PERMISSION.SUBMODULES_READ,
    PERMISSION.SUBMODULES_WRITE,
    PERMISSION.VIDEOS_READ,
    PERMISSION.VIDEOS_WRITE,
    PERMISSION.ASSESSMENTS_READ,
    PERMISSION.ASSESSMENTS_WRITE,
    PERMISSION.ATTEMPTS_READ,
    PERMISSION.DASHBOARD_READ,
  ],
  [ROLE.STUDENT]: [
    PERMISSION.TRAINING_COURSES_READ,
    PERMISSION.SUBMODULES_READ,
    PERMISSION.VIDEOS_READ,
    PERMISSION.ASSESSMENTS_READ,
    PERMISSION.ATTEMPTS_READ,
    PERMISSION.ATTEMPTS_WRITE,
  ],
};

export function hasPermission(
  role: RoleName,
  permission: PermissionName
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}