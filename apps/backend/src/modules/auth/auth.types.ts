import type { RoleName, PermissionName } from '@yunexacademy/shared-types';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  avatarUrl: string | null;
  roles: RoleName[];
  permissions: PermissionName[];
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleName[];
  iat?: number;
  exp?: number;
}