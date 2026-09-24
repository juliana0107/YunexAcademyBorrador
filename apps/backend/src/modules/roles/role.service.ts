import { NotFoundError, ForbiddenError } from '../../shared/errors/http-error.js';
import type { PermissionName } from '@yunexacademy/shared-types';
import * as repo from './role.repository.js';
import type { RoleDetail, RoleListItem } from './role.types.js';

const SYSTEM_ROLES = ['ADMIN', 'INSTRUCTOR', 'STUDENT'] as const;

export async function list(): Promise<RoleListItem[]> {
  const roles = await repo.listAll();

  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissionCount: r.permissionCount,
    isSystem: SYSTEM_ROLES.includes(r.name as (typeof SYSTEM_ROLES)[number]),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getById(id: string): Promise<RoleDetail> {
  const role = await repo.findById(id);
  if (!role) throw new NotFoundError('Role not found');

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissionCount: role.permissions.length,
    isSystem: SYSTEM_ROLES.includes(role.name as (typeof SYSTEM_ROLES)[number]),
    permissions: role.permissions,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

export async function updatePermissions(
  roleId: string,
  permissions: PermissionName[]
): Promise<RoleDetail> {
  const role = await repo.findById(roleId);
  if (!role) throw new NotFoundError('Role not found');

  // El rol ADMIN siempre debe tener TODOS los permisos para no bloquearse
  if (role.name === 'ADMIN') {
    const allPerms = permissions;
    if (!allPerms.some((p) => p.startsWith('users:'))) {
      throw new ForbiddenError(
        'El rol ADMIN no puede perder los permisos de usuarios'
      );
    }
  }

  await repo.replacePermissions(roleId, permissions);

  return getById(roleId);
}