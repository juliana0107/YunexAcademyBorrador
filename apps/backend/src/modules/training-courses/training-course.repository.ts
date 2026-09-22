import { pool } from '../../config/database.config.js';
import type {
  TrainingCourseStatus,
  TrainingCourseLevel,
} from '@yunexacademy/shared-types';
import type { TrainingCourseListFilters } from './training-course.types.js';

interface CourseRow {
  id: string;
  title: string;
  description: string;
  status: TrainingCourseStatus;
  level: TrainingCourseLevel;
  thumbnail_url: string | null;
  estimated_duration_minutes: number;
  created_by: string;
  created_by_name: string;
  submodule_count: string;
  video_count: string;
  created_at: Date;
  updated_at: Date;
}

export interface TrainingCourseRecord {
  id: string;
  title: string;
  description: string;
  status: TrainingCourseStatus;
  level: TrainingCourseLevel;
  thumbnailUrl: string | null;
  estimatedDurationMinutes: number;
  createdBy: string;
  createdByName: string;
  submoduleCount: number;
  videoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BASE_SELECT = `
  SELECT
    tc.id,
    tc.title,
    tc.description,
    tc.status,
    tc.level,
    tc.thumbnail_url,
    tc.estimated_duration_minutes,
    tc.created_by,
    u.first_name || ' ' || u.last_name AS created_by_name,
    COALESCE((SELECT COUNT(*)::text FROM submodules sm WHERE sm.training_course_id = tc.id), '0') AS submodule_count,
    COALESCE((
      SELECT COUNT(*)::text
      FROM videos v
      INNER JOIN submodules sm ON sm.id = v.submodule_id
      WHERE sm.training_course_id = tc.id
    ), '0') AS video_count,
    tc.created_at,
    tc.updated_at
  FROM training_courses tc
  INNER JOIN users u ON u.id = tc.created_by
`;

export async function findById(id: string): Promise<TrainingCourseRecord | null> {
  const result = await pool.query<CourseRow>(`${BASE_SELECT} WHERE tc.id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function list(filters: TrainingCourseListFilters): Promise<{
  items: TrainingCourseRecord[];
  total: number;
}> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(
      `(tc.title ILIKE $${idx} OR tc.description ILIKE $${idx})`
    );
    values.push(`%${filters.search}%`);
    idx++;
  }

  if (filters.status) {
    conditions.push(`tc.status = $${idx}`);
    values.push(filters.status);
    idx++;
  }

  if (filters.level) {
    conditions.push(`tc.level = $${idx}`);
    values.push(filters.level);
    idx++;
  }

  if (filters.createdBy) {
    conditions.push(`tc.created_by = $${idx}`);
    values.push(filters.createdBy);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM training_courses tc ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const listResult = await pool.query<CourseRow>(
    `${BASE_SELECT} ${whereClause}
     ORDER BY tc.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, filters.limit, offset]
  );

  return { items: listResult.rows.map(hydrate), total };
}

export interface CreateTrainingCourseData {
  title: string;
  description: string;
  level: TrainingCourseLevel;
  thumbnailUrl: string | null;
  createdBy: string;
}

export async function create(data: CreateTrainingCourseData): Promise<TrainingCourseRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO training_courses (title, description, level, thumbnail_url, created_by, status)
     VALUES ($1, $2, $3, $4, $5, 'DRAFT')
     RETURNING id`,
    [data.title, data.description, data.level, data.thumbnailUrl, data.createdBy]
  );

  const created = await findById(result.rows[0].id);
  if (!created) throw new Error('Failed to retrieve created training course');
  return created;
}

export interface UpdateTrainingCourseData {
  title?: string;
  description?: string;
  level?: TrainingCourseLevel;
  thumbnailUrl?: string | null;
}

export async function update(
  id: string,
  data: UpdateTrainingCourseData
): Promise<TrainingCourseRecord | null> {
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
  if (data.level !== undefined) {
    fields.push(`level = $${idx++}`);
    values.push(data.level);
  }
  if (data.thumbnailUrl !== undefined) {
    fields.push(`thumbnail_url = $${idx++}`);
    values.push(data.thumbnailUrl);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE training_courses SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );

  return findById(id);
}

export async function changeStatus(
  id: string,
  status: TrainingCourseStatus
): Promise<TrainingCourseRecord | null> {
  await pool.query('UPDATE training_courses SET status = $1 WHERE id = $2', [status, id]);
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM training_courses WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function countSubmodules(courseId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM submodules WHERE training_course_id = $1',
    [courseId]
  );
  return parseInt(result.rows[0].count, 10);
}

function hydrate(row: CourseRow): TrainingCourseRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    level: row.level,
    thumbnailUrl: row.thumbnail_url,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    submoduleCount: parseInt(row.submodule_count, 10),
    videoCount: parseInt(row.video_count, 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}