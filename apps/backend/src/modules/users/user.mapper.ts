import type { UserRecord } from './user.repository.js';
import type { UserListItem, UserDetail } from './user.types.js';

export function toListItem(user: UserRecord): UserListItem {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toDetail(user: UserRecord): UserDetail {
  return {
    ...toListItem(user),
    permissions: user.permissions,
  };
}