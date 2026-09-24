import { pool } from '../../config/database.config.js';
import type { RoleName, PermissionName } from '@yunexacademy/shared-types';
import type { RoleRecord } from './role.types.js';

interface RoleRow {
  id: string;
  name: RoleName;
  description: string;
  created_at: Date;
  updated_at: Date;
}

interface RoleWithCountRow extends RoleRow {
  permission_count: string;
}

interface PermissionRow {
  name: PermissionName;
}

function toRecord(row: RoleRow): RoleRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAll(): Promise<
  Array<RoleRecord & { permissionCount: number }>
> {
  const result = await pool.query<RoleWithCountRow>(
    `SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
            COUNT(rp.permission_id)::text AS permission_count
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     GROUP BY r.id
     ORDER BY r.name ASC`
  );

  return result.rows.map((row) => ({
    ...toRecord(row),
    permissionCount: parseInt(row.permission_count, 10),
  }));
}

export async function findById(
  id: string
): Promise<(RoleRecord & { permissions: PermissionName[] }) | null> {
  const roleResult = await pool.query<RoleRow>(
    `SELECT id, name, description, created_at, updated_at
     FROM roles WHERE id = $1`,
    [id]
  );

  if (roleResult.rows.length === 0) return null;

  const role = toRecord(roleResult.rows[0]);

  const permResult = await pool.query<PermissionRow>(
    `SELECT p.name
     FROM permissions p
     INNER JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = $1
     ORDER BY p.name ASC`,
    [id]
  );

  return {
    ...role,
    permissions: permResult.rows.map((r) => r.name),
  };
}

export async function findByName(name: RoleName): Promise<RoleRecord | null> {
  const result = await pool.query<RoleRow>(
    `SELECT id, name, description, created_at, updated_at
     FROM roles WHERE name = $1`,
    [name]
  );

  if (result.rows.length === 0) return null;
  return toRecord(result.rows[0]);
}

/**
 * Reemplaza los permisos de un rol.
 * Espera que los permisos vengan por nombre (no por id).
 * Falla si algún permiso no existe.
 */
export async function replacePermissions(
  roleId: string,
  permissionNames: PermissionName[]
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificar que todos los permisos existen
    const existing = await client.query<{ name: string }>(
      `SELECT name FROM permissions WHERE name = ANY($1)`,
      [permissionNames]
    );

    const existingNames = new Set(existing.rows.map((r) => r.name));
    const missing = permissionNames.filter((p) => !existingNames.has(p));

    if (missing.length > 0) {
      throw new Error(`Unknown permissions: ${missing.join(', ')}`);
    }

    // 2. Borrar los permisos actuales del rol
    await client.query('DELETE FROM role_permissions WHERE role_id = $1', [
      roleId,
    ]);

    // 3. Insertar los nuevos
    for (const name of permissionNames) {
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE name = $2`,
        [roleId, name]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}