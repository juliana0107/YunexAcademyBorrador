import type { PermissionName } from '@yunexacademy/shared-types';

export interface PermissionListItem {
  id: string;
  name: PermissionName;
  description: string;
  category: string;
  createdAt: string;
}

export interface PermissionRecord {
  id: string;
  name: PermissionName;
  description: string;
  createdAt: Date;
}