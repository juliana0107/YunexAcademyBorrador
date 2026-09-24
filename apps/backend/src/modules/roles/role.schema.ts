import { z } from 'zod';

const permissionNameSchema = z.string().min(1);

export const updateRolePermissionsSchema = z.object({
  permissions: z
    .array(permissionNameSchema)
    .min(1, 'At least one permission is required'),
});

export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>;