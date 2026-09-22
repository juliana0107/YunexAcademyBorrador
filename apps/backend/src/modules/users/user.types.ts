import type { RoleName, PermissionName } from '@yunexacademy/shared-types';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  avatarUrl: string | null;
  roles: RoleName[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends UserListItem {
  permissions: PermissionName[];
}

export interface UserListFilters {
  search?: string;
  status?: string;
  role?: RoleName;
  page: number;
  limit: number;
}

export interface PaginatedUsers {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}