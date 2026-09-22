import type { User } from './user';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RefreshInput {
  refreshToken: string;
}

export function toAuthUser(user: User): AuthUser {
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