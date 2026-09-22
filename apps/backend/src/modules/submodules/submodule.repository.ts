import { pool } from '../../config/database.config.js';
import type { SubmoduleListFilters } from './submodule.types.js';

interface SubmoduleRow {
  id: string;
  training_course_id: string;
  title: string;
  description: string;
  order: number;
  estimated_duration_minutes: number;
  video_count: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubmoduleRecord {
  id: string;
  trainingCourseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDurationMinutes: number;
  videoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BASE_SELECT = `
  SELECT
    sm.id,
    sm.training_course_id,
    sm.title,
    sm.description,
    sm."order",
    sm.estimated_duration_minutes,
    COALESCE((SELECT COUNT(*)::text FROM videos v WHERE v.submodule_id = sm.id), '0') AS video_count,
    sm.created_at,
    sm.updated_at
  FROM submodules sm
`;

export async function findById(id: string): Promise<SubmoduleRecord | null> {
  const result = await pool.query<SubmoduleRow>(`${BASE_SELECT} WHERE sm.id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function listByCourse(courseId: string): Promise<SubmoduleRecord[]> {
  const result = await pool.query<SubmoduleRow>(
    `${BASE_SELECT} WHERE sm.training_course_id = $1 ORDER BY sm."order" ASC, sm.created_at ASC`,
    [courseId]
  );
  return result.rows.map(hydrate);
}

export async function list(filters: SubmoduleListFilters): Promise<{
  items: SubmoduleRecord[];
  total: number;
}> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.trainingCourseId) {
    conditions.push(`sm.training_course_id = $${idx}`);
    values.push(filters.trainingCourseId);
    idx++;
  }

  if (filters.search) {
    conditions.push(`(sm.title ILIKE $${idx} OR sm.description ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM submodules sm ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const listResult = await pool.query<SubmoduleRow>(
    `${BASE_SELECT} ${whereClause}
     ORDER BY sm."order" ASC, sm.created_at ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, filters.limit, offset]
  );

  return { items: listResult.rows.map(hydrate), total };
}

export async function getNextOrder(courseId: string): Promise<number> {
  const result = await pool.query<{ max_order: number | null }>(
    'SELECT MAX("order") AS max_order FROM submodules WHERE training_course_id = $1',
    [courseId]
  );
  const maxOrder = result.rows[0].max_order;
  return maxOrder === null ? 0 : maxOrder + 1;
}

export interface CreateSubmoduleData {
  trainingCourseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDurationMinutes: number;
}

export async function create(data: CreateSubmoduleData): Promise<SubmoduleRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO submodules (training_course_id, title, description, "order", estimated_duration_minutes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      data.trainingCourseId,
      data.title,
      data.description,
      data.order,
      data.estimatedDurationMinutes,
    ]
  );

  const created = await findById(result.rows[0].id);
  if (!created) throw new Error('Failed to retrieve created submodule');
  return created;
}

export interface UpdateSubmoduleData {
  title?: string;
  description?: string;
  estimatedDurationMinutes?: number;
}

export async function update(
  id: string,
  data: UpdateSubmoduleData
): Promise<SubmoduleRecord | null> {
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
  if (data.estimatedDurationMinutes !== undefined) {
    fields.push(`estimated_duration_minutes = $${idx++}`);
    values.push(data.estimatedDurationMinutes);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE submodules SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );

  return findById(id);
}

export async function changeOrder(id: string, order: number): Promise<SubmoduleRecord | null> {
  await pool.query('UPDATE submodules SET "order" = $1 WHERE id = $2', [order, id]);
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM submodules WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function countVideos(submoduleId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM videos WHERE submodule_id = $1',
    [submoduleId]
  );
  return parseInt(result.rows[0].count, 10);
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

function hydrate(row: SubmoduleRow): SubmoduleRecord {
  return {
    id: row.id,
    trainingCourseId: row.training_course_id,
    title: row.title,
    description: row.description,
    order: row.order,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    videoCount: parseInt(row.video_count, 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}