import { z } from 'zod';

const roleNameSchema = z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
const statusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  roles: z.array(roleNameSchema).min(1, 'At least one role is required'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  status: statusSchema.optional(),
  roles: z.array(roleNameSchema).min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: statusSchema.optional(),
  role: roleNameSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100),
});

export const adminChangePasswordSchema = z.object({
  newPassword: z.string().min(8).max(100),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;