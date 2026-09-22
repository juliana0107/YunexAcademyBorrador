import { pool } from '../../config/database.config.js';
import type { AssessmentStatus } from './assessment.types.js';
import type { AssessmentListFilters } from './assessment.types.js';

interface AssessmentRow {
  id: string;
  training_course_id: string;
  submodule_id: string | null;
  title: string;
  description: string;
  status: AssessmentStatus;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number | null;
  shuffle_questions: boolean;
  question_count: string;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentRecord {
  id: string;
  trainingCourseId: string;
  submoduleId: string | null;
  title: string;
  description: string;
  status: AssessmentStatus;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BASE_SELECT = `
  SELECT
    a.id,
    a.training_course_id,
    a.submodule_id,
    a.title,
    a.description,
    a.status,
    a.passing_score,
    a.max_attempts,
    a.time_limit_minutes,
    a.shuffle_questions,
    COALESCE((SELECT COUNT(*)::text FROM questions q WHERE q.assessment_id = a.id), '0') AS question_count,
    a.created_at,
    a.updated_at
  FROM assessments a
`;

export async function findById(id: string): Promise<AssessmentRecord | null> {
  const result = await pool.query<AssessmentRow>(`${BASE_SELECT} WHERE a.id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function listByCourse(courseId: string): Promise<AssessmentRecord[]> {
  const result = await pool.query<AssessmentRow>(
    `${BASE_SELECT} WHERE a.training_course_id = $1 ORDER BY a.created_at ASC`,
    [courseId]
  );
  return result.rows.map(hydrate);
}

export async function listBySubmodule(submoduleId: string): Promise<AssessmentRecord[]> {
  const result = await pool.query<AssessmentRow>(
    `${BASE_SELECT} WHERE a.submodule_id = $1 ORDER BY a.created_at ASC`,
    [submoduleId]
  );
  return result.rows.map(hydrate);
}

export async function list(filters: AssessmentListFilters): Promise<{
  items: AssessmentRecord[];
  total: number;
}> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.trainingCourseId) {
    conditions.push(`a.training_course_id = $${idx}`);
    values.push(filters.trainingCourseId);
    idx++;
  }
  if (filters.submoduleId) {
    conditions.push(`a.submodule_id = $${idx}`);
    values.push(filters.submoduleId);
    idx++;
  }
  if (filters.status) {
    conditions.push(`a.status = $${idx}`);
    values.push(filters.status);
    idx++;
  }
  if (filters.search) {
    conditions.push(`(a.title ILIKE $${idx} OR a.description ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM assessments a ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const listResult = await pool.query<AssessmentRow>(
    `${BASE_SELECT} ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, filters.limit, offset]
  );

  return { items: listResult.rows.map(hydrate), total };
}

export interface CreateAssessmentData {
  trainingCourseId: string;
  submoduleId: string | null;
  title: string;
  description: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
}

export async function create(data: CreateAssessmentData): Promise<AssessmentRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO assessments
       (training_course_id, submodule_id, title, description, passing_score,
        max_attempts, time_limit_minutes, shuffle_questions, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
     RETURNING id`,
    [
      data.trainingCourseId,
      data.submoduleId,
      data.title,
      data.description,
      data.passingScore,
      data.maxAttempts,
      data.timeLimitMinutes,
      data.shuffleQuestions,
    ]
  );
  const created = await findById(result.rows[0].id);
  if (!created) throw new Error('Failed to retrieve created assessment');
  return created;
}

export interface UpdateAssessmentData {
  title?: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  shuffleQuestions?: boolean;
}

export async function update(
  id: string,
  data: UpdateAssessmentData
): Promise<AssessmentRecord | null> {
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
  if (data.passingScore !== undefined) {
    fields.push(`passing_score = $${idx++}`);
    values.push(data.passingScore);
  }
  if (data.maxAttempts !== undefined) {
    fields.push(`max_attempts = $${idx++}`);
    values.push(data.maxAttempts);
  }
  if (data.timeLimitMinutes !== undefined) {
    fields.push(`time_limit_minutes = $${idx++}`);
    values.push(data.timeLimitMinutes);
  }
  if (data.shuffleQuestions !== undefined) {
    fields.push(`shuffle_questions = $${idx++}`);
    values.push(data.shuffleQuestions);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE assessments SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );
  return findById(id);
}

export async function changeStatus(
  id: string,
  status: AssessmentStatus
): Promise<AssessmentRecord | null> {
  await pool.query('UPDATE assessments SET status = $1 WHERE id = $2', [status, id]);
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM assessments WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function countQuestions(assessmentId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM questions WHERE assessment_id = $1',
    [assessmentId]
  );
  return parseInt(result.rows[0].count, 10);
}

function hydrate(row: AssessmentRow): AssessmentRecord {
  return {
    id: row.id,
    trainingCourseId: row.training_course_id,
    submoduleId: row.submodule_id,
    title: row.title,
    description: row.description,
    status: row.status,
    passingScore: row.passing_score,
    maxAttempts: row.max_attempts,
    timeLimitMinutes: row.time_limit_minutes,
    shuffleQuestions: row.shuffle_questions,
    questionCount: parseInt(row.question_count, 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}