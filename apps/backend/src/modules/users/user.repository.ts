import { pool } from '../../config/database.config.js';
import type { RoleName, PermissionName } from '@yunexacademy/shared-types';
import type { UserListFilters } from './user.types.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  status: string;
  avatar_url: string | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface RoleRow {
  name: RoleName;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  status: string;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: RoleName[];
  permissions: PermissionName[];
}

export async function findById(id: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, first_name, last_name, status, avatar_url,
            last_login_at, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, first_name, last_name, status, avatar_url,
            last_login_at, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function list(filters: UserListFilters): Promise<{
  items: UserRecord[];
  total: number;
}> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(
      `(u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`
    );
    values.push(`%${filters.search}%`);
    idx++;
  }

  if (filters.status) {
    conditions.push(`u.status = $${idx}`);
    values.push(filters.status);
    idx++;
  }

  if (filters.role) {
    conditions.push(
      `EXISTS (
        SELECT 1 FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id AND r.name = $${idx}
      )`
    );
    values.push(filters.role);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM users u ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const listResult = await pool.query<UserRow>(
    `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.status,
            u.avatar_url, u.last_login_at, u.created_at, u.updated_at
     FROM users u
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, filters.limit, offset]
  );

  const items = await Promise.all(listResult.rows.map((row) => hydrate(row)));
  return { items, total };
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
}

export async function create(data: CreateUserData): Promise<UserRecord> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query<UserRow>(
      `INSERT INTO users (email, password_hash, first_name, last_name, status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       RETURNING id, email, password_hash, first_name, last_name, status,
                 avatar_url, last_login_at, created_at, updated_at`,
      [data.email, data.passwordHash, data.firstName, data.lastName]
    );

    const userId = result.rows[0].id;
    await assignRoles(client, userId, data.roles);

    await client.query('COMMIT');
    return (await findById(userId))!;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  status?: string;
  avatarUrl?: string | null;
  roles?: RoleName[];
}

export async function update(id: string, data: UpdateUserData): Promise<UserRecord | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.firstName !== undefined) {
      fields.push(`first_name = $${idx++}`);
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      fields.push(`last_name = $${idx++}`);
      values.push(data.lastName);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }
    if (data.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(data.avatarUrl);
    }

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );
    }

    if (data.roles !== undefined) {
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      await assignRoles(client, id, data.roles);
    }

    await client.query('COMMIT');
    return findById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function updatePassword(id: string, passwordHash: string): Promise<void> {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

async function assignRoles(
  client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  userId: string,
  roleNames: RoleName[]
): Promise<void> {
  if (roleNames.length === 0) return;

  const placeholders = roleNames.map((_, i) => `$${i + 1}`).join(', ');
  const roles = (await client.query(
    `SELECT id, name FROM roles WHERE name IN (${placeholders})`,
    roleNames
  )) as { rows: { id: string; name: RoleName }[] };

  for (const role of roles.rows) {
    await client.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, role.id]
    );
  }
}

async function hydrate(row: UserRow): Promise<UserRecord> {
  const rolesResult = await pool.query<RoleRow>(
    `SELECT r.name FROM roles r
     INNER JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = $1 ORDER BY r.name`,
    [row.id]
  );

  const permsResult = await pool.query<{ name: PermissionName }>(
    `SELECT DISTINCT p.name FROM permissions p
     INNER JOIN role_permissions rp ON rp.permission_id = p.id
     INNER JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = $1 ORDER BY p.name`,
    [row.id]
  );

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    status: row.status,
    avatarUrl: row.avatar_url,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    roles: rolesResult.rows.map((r) => r.name),
    permissions: permsResult.rows.map((p) => p.name),
  };
}