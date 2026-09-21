export type RoleName = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export type PermissionName =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'roles:read'
  | 'roles:write'
  | 'training-courses:read'
  | 'training-courses:write'
  | 'training-courses:delete'
  | 'submodules:read'
  | 'submodules:write'
  | 'submodules:delete'
  | 'videos:read'
  | 'videos:write'
  | 'videos:delete'
  | 'assessments:read'
  | 'assessments:write'
  | 'assessments:delete'
  | 'attempts:read'
  | 'attempts:write'
  | 'dashboard:read';

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  permissions: PermissionName[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: RoleName;
  description: string;
  permissions: PermissionName[];
}

export interface UpdateRoleInput {
  description?: string;
  permissions?: PermissionName[];
}