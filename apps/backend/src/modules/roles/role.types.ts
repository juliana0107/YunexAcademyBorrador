import type { RoleName, PermissionName } from '@yunexacademy/shared-types';

export interface RoleListItem {
  id: string;
  name: RoleName;
  description: string;
  permissionCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetail extends RoleListItem {
  permissions: PermissionName[];
}

export interface RoleRecord {
  id: string;
  name: RoleName;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}