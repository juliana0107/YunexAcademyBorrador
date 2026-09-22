import { pool } from '../../config/database.config.js';
import type { RoleName, PermissionName } from '@yunexacademy/shared-types';

export interface UserAuthRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  status: string;
  avatarUrl: string | null;
  roles: RoleName[];
  permissions: PermissionName[];
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  status: string;
  avatar_url: string | null;
}

export async function findByEmailWithRoles(email: string): Promise<UserAuthRecord | null> {
  const userResult = await pool.query<UserRow>(
    `SELECT id, email, password_hash, first_name, last_name, status, avatar_url
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) return null;

  const user = userResult.rows[0];

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.password_hash,
    firstName: user.first_name,
    lastName: user.last_name,
    status: user.status,
    avatarUrl: user.avatar_url,
    roles: await getRolesByUserId(user.id),
    permissions: await getPermissionsByUserId(user.id),
  };
}

export async function findByIdWithRoles(userId: string): Promise<UserAuthRecord | null> {
  const userResult = await pool.query<UserRow>(
    `SELECT id, email, password_hash, first_name, last_name, status, avatar_url
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) return null;

  const user = userResult.rows[0];

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.password_hash,
    firstName: user.first_name,
    lastName: user.last_name,
    status: user.status,
    avatarUrl: user.avatar_url,
    roles: await getRolesByUserId(user.id),
    permissions: await getPermissionsByUserId(user.id),
  };
}

async function getRolesByUserId(userId: string): Promise<RoleName[]> {
  const result = await pool.query<{ name: RoleName }>(
    `SELECT r.name
     FROM roles r
     INNER JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = $1
     ORDER BY r.name`,
    [userId]
  );
  return result.rows.map((row) => row.name);
}

async function getPermissionsByUserId(userId: string): Promise<PermissionName[]> {
  const result = await pool.query<{ name: PermissionName }>(
    `SELECT DISTINCT p.name
     FROM permissions p
     INNER JOIN role_permissions rp ON rp.permission_id = p.id
     INNER JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = $1
     ORDER BY p.name`,
    [userId]
  );
  return result.rows.map((row) => row.name);
}

export async function updateLastLogin(userId: string): Promise<void> {
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
}