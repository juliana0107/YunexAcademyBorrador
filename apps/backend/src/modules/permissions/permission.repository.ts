import { pool } from '../../config/database.config.js';
import type { PermissionName } from '@yunexacademy/shared-types';
import type { PermissionRecord } from './permission.types.js';

interface PermissionRow {
  id: string;
  name: PermissionName;
  description: string;
  created_at: Date;
}

function toRecord(row: PermissionRow): PermissionRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function listAll(): Promise<PermissionRecord[]> {
  const result = await pool.query<PermissionRow>(
    `SELECT id, name, description, created_at
     FROM permissions
     ORDER BY name ASC`
  );

  return result.rows.map(toRecord);
}

export async function findById(id: string): Promise<PermissionRecord | null> {
  const result = await pool.query<PermissionRow>(
    `SELECT id, name, description, created_at
     FROM permissions WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;
  return toRecord(result.rows[0]);
}