import { pool } from '../../../config/database.config.js';
import type { QuestionType, QuestionOptionData } from './question.types.js';

interface QuestionRow {
  id: string;
  assessment_id: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  payload: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface OptionRow {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface QuestionRecord {
  id: string;
  assessmentId: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  payload: Record<string, unknown>;
  options: QuestionOptionData[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function findById(id: string): Promise<QuestionRecord | null> {
  const result = await pool.query<QuestionRow>(
    `SELECT id, assessment_id, type, statement, points, "order", payload, created_at, updated_at
     FROM questions WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export async function listByAssessment(assessmentId: string): Promise<QuestionRecord[]> {
  const result = await pool.query<QuestionRow>(
    `SELECT id, assessment_id, type, statement, points, "order", payload, created_at, updated_at
     FROM questions WHERE assessment_id = $1
     ORDER BY "order" ASC, created_at ASC`,
    [assessmentId]
  );
  return Promise.all(result.rows.map(hydrate));
}

export async function getNextOrder(assessmentId: string): Promise<number> {
  const result = await pool.query<{ max_order: number | null }>(
    'SELECT MAX("order") AS max_order FROM questions WHERE assessment_id = $1',
    [assessmentId]
  );
  const maxOrder = result.rows[0].max_order;
  return maxOrder === null ? 0 : maxOrder + 1;
}

export interface CreateQuestionData {
  assessmentId: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  payload: Record<string, unknown>;
  options: QuestionOptionData[] | null;
}

export async function create(data: CreateQuestionData): Promise<QuestionRecord> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query<{ id: string }>(
      `INSERT INTO questions (assessment_id, type, statement, points, "order", payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.assessmentId,
        data.type,
        data.statement,
        data.points,
        data.order,
        JSON.stringify(data.payload),
      ]
    );

    const questionId = result.rows[0].id;

    if (data.options && data.options.length > 0) {
      for (const opt of data.options) {
        await client.query(
          `INSERT INTO question_options (question_id, text, is_correct, "order")
           VALUES ($1, $2, $3, $4)`,
          [questionId, opt.text, opt.isCorrect, opt.order]
        );
      }
    }

    await client.query('COMMIT');
    const created = await findById(questionId);
    if (!created) throw new Error('Failed to retrieve created question');
    return created;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export interface UpdateQuestionData {
  statement?: string;
  points?: number;
  order?: number;
  payload?: Record<string, unknown>;
  options?: QuestionOptionData[];
}

export async function update(
  id: string,
  data: UpdateQuestionData
): Promise<QuestionRecord | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.statement !== undefined) {
      fields.push(`statement = $${idx++}`);
      values.push(data.statement);
    }
    if (data.points !== undefined) {
      fields.push(`points = $${idx++}`);
      values.push(data.points);
    }
    if (data.order !== undefined) {
      fields.push(`"order" = $${idx++}`);
      values.push(data.order);
    }
    if (data.payload !== undefined) {
      fields.push(`payload = $${idx++}`);
      values.push(JSON.stringify(data.payload));
    }

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE questions SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );
    }

    if (data.options !== undefined) {
      await client.query('DELETE FROM question_options WHERE question_id = $1', [id]);
      for (const opt of data.options) {
        await client.query(
          `INSERT INTO question_options (question_id, text, is_correct, "order")
           VALUES ($1, $2, $3, $4)`,
          [id, opt.text, opt.isCorrect, opt.order]
        );
      }
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

export async function reorder(id: string, order: number): Promise<QuestionRecord | null> {
  await pool.query('UPDATE questions SET "order" = $1 WHERE id = $2', [order, id]);
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

async function hydrate(row: QuestionRow): Promise<QuestionRecord> {
  let options: QuestionOptionData[] | null = null;

  if (row.type === 'SINGLE_CHOICE' || row.type === 'MULTIPLE_CHOICE') {
    const optResult = await pool.query<OptionRow>(
      `SELECT id, question_id, text, is_correct, "order"
       FROM question_options WHERE question_id = $1 ORDER BY "order" ASC`,
      [row.id]
    );
    options = optResult.rows.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.is_correct,
      order: o.order,
    }));
  }

  return {
    id: row.id,
    assessmentId: row.assessment_id,
    type: row.type,
    statement: row.statement,
    points: row.points,
    order: row.order,
    payload: row.payload,
    options,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}