import type { UserAuthRecord } from './auth.repository.js';
import type { AuthUser } from './auth.types.js';

export function toAuthUser(user: UserAuthRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
    permissions: user.permissions,
  };
}