import type { RoleName } from '@yunexacademy/shared-types';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  avatarUrl: string | null;
  roles: RoleName[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends UserListItem {
  permissions: string[];
}

export interface PaginatedUsers {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListFilters {
  search?: string;
  status?: UserStatus;
  role?: RoleName;
  page?: number;
  limit?: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
  roles?: RoleName[];
  avatarUrl?: string | null;
}