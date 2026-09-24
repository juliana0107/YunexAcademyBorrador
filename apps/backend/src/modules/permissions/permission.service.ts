import { NotFoundError } from '../../shared/errors/http-error.js';
import * as repo from './permission.repository.js';
import type { PermissionListItem } from './permission.types.js';

/**
 * Extrae la categoría de un permiso a partir de su nombre.
 * Ej: "users:read" → "users"
 */
function getCategory(name: string): string {
  return name.split(':')[0] ?? 'otros';
}

export async function list(): Promise<PermissionListItem[]> {
  const items = await repo.listAll();

  return items.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: getCategory(p.name),
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getById(id: string): Promise<PermissionListItem> {
  const p = await repo.findById(id);
  if (!p) throw new NotFoundError('Permission not found');

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: getCategory(p.name),
    createdAt: p.createdAt.toISOString(),
  };
}