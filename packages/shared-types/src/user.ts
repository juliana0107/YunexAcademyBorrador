import type { RoleName, PermissionName } from './roles';

export const USER_STATUS = {
  ACTIVE: 'active',      
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  avatarUrl: string | null;
  roles: RoleName[];
  permissions: PermissionName[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export function userFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}