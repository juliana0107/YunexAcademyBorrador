import { pool } from '../../config/database.config.js';
import type { VideoListFilters } from './video.types.js';
import type { VideoStatus } from './video.types.js';

interface VideoRow {
  id: string;
  submodule_id: string;
  title: string;
  description: string;
  status: VideoStatus;
  order: number;
  duration_seconds: number;
  file_size_bytes: string;
  mime_type: string;
  storage_path: string;
  created_at: Date;
  updated_at: Date;
}

export interface VideoRecord {
  id: string;
  submoduleId: string;
  title: string;
  description: string;
  status: VideoStatus;
  order: number;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const BASE_SELECT = `
  SELECT
    v.id,
    v.submodule_id,
    v.title,
    v.description,
    v.status,
    v."order",
    v.duration_seconds,
    v.file_size_bytes,
    v.mime_type,
    v.storage_path,
    v.created_at,
    v.updated_at
  FROM videos v
`;

export async function findById(id: string): Promise<VideoRecord | null> {
  const result = await pool.query<VideoRow>(`${BASE_SELECT} WHERE v.id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function listBySubmodule(submoduleId: string): Promise<VideoRecord[]> {
  const result = await pool.query<VideoRow>(
    `${BASE_SELECT} WHERE v.submodule_id = $1 ORDER BY v."order" ASC, v.created_at ASC`,
    [submoduleId]
  );
  return result.rows.map(hydrate);
}

export async function list(filters: VideoListFilters): Promise<{
  items: VideoRecord[];
  total: number;
}> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.submoduleId) {
    conditions.push(`v.submodule_id = $${idx}`);
    values.push(filters.submoduleId);
    idx++;
  }

  if (filters.search) {
    conditions.push(`(v.title ILIKE $${idx} OR v.description ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM videos v ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const listResult = await pool.query<VideoRow>(
    `${BASE_SELECT} ${whereClause}
     ORDER BY v."order" ASC, v.created_at ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, filters.limit, offset]
  );

  return { items: listResult.rows.map(hydrate), total };
}

export async function getNextOrder(submoduleId: string): Promise<number> {
  const result = await pool.query<{ max_order: number | null }>(
    'SELECT MAX("order") AS max_order FROM videos WHERE submodule_id = $1',
    [submoduleId]
  );
  const maxOrder = result.rows[0].max_order;
  return maxOrder === null ? 0 : maxOrder + 1;
}

export interface CreateVideoData {
  submoduleId: string;
  title: string;
  description: string;
  order: number;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
}

export async function create(data: CreateVideoData): Promise<VideoRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO videos
      (submodule_id, title, description, "order", duration_seconds,
       file_size_bytes, mime_type, storage_path, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'READY')
     RETURNING id`,
    [
      data.submoduleId,
      data.title,
      data.description,
      data.order,
      data.durationSeconds,
      data.fileSizeBytes,
      data.mimeType,
      data.storagePath,
    ]
  );

  const created = await findById(result.rows[0].id);
  if (!created) throw new Error('Failed to retrieve created video');
  return created;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  durationSeconds?: number;
}

export async function update(id: string, data: UpdateVideoData): Promise<VideoRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (data.durationSeconds !== undefined) {
    fields.push(`duration_seconds = $${idx++}`);
    values.push(data.durationSeconds);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(`UPDATE videos SET ${fields.join(', ')} WHERE id = $${idx}`, values);

  return findById(id);
}

export async function changeOrder(id: string, order: number): Promise<VideoRecord | null> {
  await pool.query('UPDATE videos SET "order" = $1 WHERE id = $2', [order, id]);
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM videos WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function recalculateSubmoduleDuration(submoduleId: string): Promise<void> {
  await pool.query(
    `UPDATE submodules
     SET estimated_duration_minutes = COALESCE((
       SELECT (SUM(duration_seconds) / 60)::int
       FROM videos
       WHERE submodule_id = $1
     ), 0)
     WHERE id = $1`,
    [submoduleId]
  );
}

export async function getSubmoduleCourseId(submoduleId: string): Promise<string | null> {
  const result = await pool.query<{ training_course_id: string }>(
    'SELECT training_course_id FROM submodules WHERE id = $1',
    [submoduleId]
  );
  return result.rows[0]?.training_course_id ?? null;
}

export async function recalculateCourseDuration(courseId: string): Promise<void> {
  await pool.query(
    `UPDATE training_courses
     SET estimated_duration_minutes = COALESCE((
       SELECT SUM(estimated_duration_minutes)::int
       FROM submodules
       WHERE training_course_id = $1
     ), 0)
     WHERE id = $1`,
    [courseId]
  );
}

function hydrate(row: VideoRow): VideoRecord {
  return {
    id: row.id,
    submoduleId: row.submodule_id,
    title: row.title,
    description: row.description,
    status: row.status,
    order: row.order,
    durationSeconds: row.duration_seconds,
    fileSizeBytes: parseInt(row.file_size_bytes, 10),
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}