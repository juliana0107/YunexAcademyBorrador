import { pool } from '../../../config/database.config.js';
import type { AttemptStatus } from './attempt.types.js';
import type { QuestionType } from '../questions/question.types.js';

//  INTERFACES DE FILAS 

interface AttemptRow {
  id: string;
  assessment_id: string;
  user_id: string;
  status: AttemptStatus;
  score: number;
  passing_score: number;
  passed: boolean;
  attempt_number: number;
  started_at: Date;
  submitted_at: Date | null;
  graded_at: Date | null;
  time_spent_seconds: number;
  question_order: string[] | null;
  created_at: Date;
  updated_at: Date;
  assessment_title: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
}

interface AnswerRow {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: Record<string, unknown>;
  is_correct: boolean | null;
  points_earned: number;
  points_possible: number;
  feedback: string | null;
  created_at: Date;
  updated_at: Date;
  question_type: QuestionType;
  question_statement: string;
}

interface QuestionRow {
  id: string;
  assessment_id: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  payload: Record<string, unknown>;
}

interface OptionRow {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

//  RECORDS 

export interface AttemptRecord {
  id: string;
  assessmentId: string;
  userId: string;
  status: AttemptStatus;
  score: number;
  passingScore: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: Date;
  submittedAt: Date | null;
  gradedAt: Date | null;
  timeSpentSeconds: number;
  questionOrder: string[];
  createdAt: Date;
  updatedAt: Date;
  assessmentTitle: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
}

export interface AnswerRecord {
  id: string;
  attemptId: string;
  questionId: string;
  answer: Record<string, unknown>;
  isCorrect: boolean | null;
  pointsEarned: number;
  pointsPossible: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  questionType: QuestionType;
  questionStatement: string;
}

export interface QuestionRecord {
  id: string;
  assessmentId: string;
  type: QuestionType;
  statement: string;
  points: number;
  order: number;
  payload: Record<string, unknown>;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    order: number;
  }> | null;
}

//  HIDRATACIÓN 

function hydrateAttempt(row: AttemptRow): AttemptRecord {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    userId: row.user_id,
    status: row.status,
    score: Number(row.score),
    passingScore: row.passing_score,
    passed: row.passed,
    attemptNumber: row.attempt_number,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    gradedAt: row.graded_at,
    timeSpentSeconds: row.time_spent_seconds,
    questionOrder: Array.isArray(row.question_order) ? row.question_order : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assessmentTitle: row.assessment_title,
    userEmail: row.user_email,
    userFirstName: row.user_first_name,
    userLastName: row.user_last_name,
  };
}

function hydrateAnswer(row: AnswerRow): AnswerRecord {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    questionId: row.question_id,
    answer: row.answer,
    isCorrect: row.is_correct,
    pointsEarned: Number(row.points_earned),
    pointsPossible: Number(row.points_possible),
    feedback: row.feedback,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    questionType: row.question_type,
    questionStatement: row.question_statement,
  };
}

//  SELECT BASE 

const BASE_ATTEMPT_SELECT = `
  SELECT
    a.id, a.assessment_id, a.user_id, a.status, a.score, a.passing_score,
    a.passed, a.attempt_number, a.started_at, a.submitted_at, a.graded_at,
    a.time_spent_seconds, a.question_order, a.created_at, a.updated_at,
    ass.title AS assessment_title,
    u.email AS user_email,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name
  FROM attempts a
  INNER JOIN assessments ass ON ass.id = a.assessment_id
  INNER JOIN users u ON u.id = a.user_id
`;

//  ATTEMPTS 

export async function findAttemptById(id: string): Promise<AttemptRecord | null> {
  const result = await pool.query<AttemptRow>(
    `${BASE_ATTEMPT_SELECT} WHERE a.id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return hydrateAttempt(result.rows[0]);
}

export async function countAttemptsByUser(
  assessmentId: string,
  userId: string
): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM attempts
     WHERE assessment_id = $1 AND user_id = $2 AND status != 'IN_PROGRESS'`,
    [assessmentId, userId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function findInProgressAttempt(
  assessmentId: string,
  userId: string
): Promise<AttemptRecord | null> {
  const result = await pool.query<AttemptRow>(
    `${BASE_ATTEMPT_SELECT}
     WHERE a.assessment_id = $1 AND a.user_id = $2 AND a.status = 'IN_PROGRESS'
     LIMIT 1`,
    [assessmentId, userId]
  );
  if (result.rows.length === 0) return null;
  return hydrateAttempt(result.rows[0]);
}

export interface CreateAttemptData {
  assessmentId: string;
  userId: string;
  passingScore: number;
  attemptNumber: number;
  questionOrder: string[];
}

export async function createAttempt(data: CreateAttemptData): Promise<AttemptRecord> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO attempts
       (assessment_id, user_id, status, passing_score, attempt_number, question_order)
     VALUES ($1, $2, 'IN_PROGRESS', $3, $4, $5)
     RETURNING id`,
    [
      data.assessmentId,
      data.userId,
      data.passingScore,
      data.attemptNumber,
      JSON.stringify(data.questionOrder),
    ]
  );
  const created = await findAttemptById(result.rows[0].id);
  if (!created) throw new Error('Failed to retrieve created attempt');
  return created;
}

export async function updateAttemptStatus(
  id: string,
  status: AttemptStatus,
  patch: {
    score?: number;
    passed?: boolean;
    submittedAt?: Date;
    gradedAt?: Date;
    timeSpentSeconds?: number;
  } = {}
): Promise<AttemptRecord | null> {
  const fields: string[] = ['status = $1'];
  const values: unknown[] = [status];
  let idx = 2;

  if (patch.score !== undefined) {
    fields.push(`score = $${idx++}`);
    values.push(patch.score);
  }
  if (patch.passed !== undefined) {
    fields.push(`passed = $${idx++}`);
    values.push(patch.passed);
  }
  if (patch.submittedAt !== undefined) {
    fields.push(`submitted_at = $${idx++}`);
    values.push(patch.submittedAt);
  }
  if (patch.gradedAt !== undefined) {
    fields.push(`graded_at = $${idx++}`);
    values.push(patch.gradedAt);
  }
  if (patch.timeSpentSeconds !== undefined) {
    fields.push(`time_spent_seconds = $${idx++}`);
    values.push(patch.timeSpentSeconds);
  }

  values.push(id);
  await pool.query(
    `UPDATE attempts SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );
  return findAttemptById(id);
}

export interface ListAttemptsFilters {
  assessmentId?: string;
  trainingCourseId?: string;
  userId?: string;
  status?: AttemptStatus;
  passed?: boolean;
  page: number;
  limit: number;
}

export async function listAttempts(filters: ListAttemptsFilters): Promise<{
  items: AttemptRecord[];
  total: number;
}> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.assessmentId) {
    conditions.push(`a.assessment_id = $${idx++}`);
    values.push(filters.assessmentId);
  }
  if (filters.trainingCourseId) {
    conditions.push(
      `a.assessment_id IN (SELECT id FROM assessments WHERE training_course_id = $${idx++})`
    );
    values.push(filters.trainingCourseId);
  }
  if (filters.userId) {
    conditions.push(`a.user_id = $${idx++}`);
    values.push(filters.userId);
  }
  if (filters.status) {
    conditions.push(`a.status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters.passed !== undefined) {
    conditions.push(`a.passed = $${idx++}`);
    values.push(filters.passed);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM attempts a ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (filters.page - 1) * filters.limit;
  const listResult = await pool.query<AttemptRow>(
    `${BASE_ATTEMPT_SELECT} ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    [...values, filters.limit, offset]
  );

  return { items: listResult.rows.map(hydrateAttempt), total };
}

//  ANSWERS 

const BASE_ANSWER_SELECT = `
  SELECT
    aa.id, aa.attempt_id, aa.question_id, aa.answer, aa.is_correct,
    aa.points_earned, aa.points_possible, aa.feedback,
    aa.created_at, aa.updated_at,
    q.type AS question_type,
    q.statement AS question_statement
  FROM attempt_answers aa
  INNER JOIN questions q ON q.id = aa.question_id
`;

export async function listAnswersByAttempt(attemptId: string): Promise<AnswerRecord[]> {
  const result = await pool.query<AnswerRow>(
    `${BASE_ANSWER_SELECT} WHERE aa.attempt_id = $1 ORDER BY q."order" ASC`,
    [attemptId]
  );
  return result.rows.map(hydrateAnswer);
}

export async function findAnswer(
  attemptId: string,
  questionId: string
): Promise<AnswerRecord | null> {
  const result = await pool.query<AnswerRow>(
    `${BASE_ANSWER_SELECT} WHERE aa.attempt_id = $1 AND aa.question_id = $2`,
    [attemptId, questionId]
  );
  if (result.rows.length === 0) return null;
  return hydrateAnswer(result.rows[0]);
}

export async function createEmptyAnswers(
  attemptId: string,
  questions: Array<{ id: string; points: number }>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const q of questions) {
      await client.query(
        `INSERT INTO attempt_answers (attempt_id, question_id, answer, points_possible)
         VALUES ($1, $2, '{}'::jsonb, $3)`,
        [attemptId, q.id, q.points]
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

export async function upsertAnswer(
  attemptId: string,
  questionId: string,
  answer: Record<string, unknown>
): Promise<AnswerRecord | null> {
  await pool.query(
    `UPDATE attempt_answers
     SET answer = $1, updated_at = NOW()
     WHERE attempt_id = $2 AND question_id = $3`,
    [JSON.stringify(answer), attemptId, questionId]
  );
  return findAnswer(attemptId, questionId);
}

export interface GradeAnswerData {
  isCorrect: boolean | null;
  pointsEarned: number;
  feedback?: string | null;
}

export async function gradeAnswer(
  attemptId: string,
  questionId: string,
  data: GradeAnswerData
): Promise<AnswerRecord | null> {
  await pool.query(
    `UPDATE attempt_answers
     SET is_correct = $1, points_earned = $2, feedback = $3, updated_at = NOW()
     WHERE attempt_id = $4 AND question_id = $5`,
    [
      data.isCorrect,
      data.pointsEarned,
      data.feedback ?? null,
      attemptId,
      questionId,
    ]
  );
  return findAnswer(attemptId, questionId);
}

export async function countPendingOpenAnswers(attemptId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM attempt_answers aa
     INNER JOIN questions q ON q.id = aa.question_id
     WHERE aa.attempt_id = $1
       AND q.type = 'OPEN_ANSWER'
       AND aa.is_correct IS NULL`,
    [attemptId]
  );
  return parseInt(result.rows[0].count, 10);
}

//  PREGUNTAS DEL INTENTO 

export async function getQuestionsForAssessment(
  assessmentId: string
): Promise<QuestionRecord[]> {
  const result = await pool.query<QuestionRow>(
    `SELECT id, assessment_id, type, statement, points, "order", payload
     FROM questions
     WHERE assessment_id = $1
     ORDER BY "order" ASC, created_at ASC`,
    [assessmentId]
  );

  const questions: QuestionRecord[] = [];

  for (const row of result.rows) {
    let options: QuestionRecord['options'] = null;

    if (row.type === 'SINGLE_CHOICE' || row.type === 'MULTIPLE_CHOICE') {
      const optResult = await pool.query<OptionRow>(
        `SELECT id, question_id, text, is_correct, "order"
         FROM question_options
         WHERE question_id = $1
         ORDER BY "order" ASC`,
        [row.id]
      );
      options = optResult.rows.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.is_correct,
        order: o.order,
      }));
    }

    questions.push({
      id: row.id,
      assessmentId: row.assessment_id,
      type: row.type,
      statement: row.statement,
      points: row.points,
      order: row.order,
      payload: row.payload,
      options,
    });
  }

  return questions;
}

export async function getFullQuestionById(
  questionId: string
): Promise<QuestionRecord | null> {
  const result = await pool.query<QuestionRow>(
    `SELECT id, assessment_id, type, statement, points, "order", payload
     FROM questions WHERE id = $1`,
    [questionId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  let options: QuestionRecord['options'] = null;

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
  };
}

export async function getFullQuestionsByIds(
  questionIds: string[]
): Promise<Map<string, QuestionRecord>> {
  if (questionIds.length === 0) return new Map();

  const result = await pool.query<QuestionRow>(
    `SELECT id, assessment_id, type, statement, points, "order", payload
     FROM questions WHERE id = ANY($1::uuid[])`,
    [questionIds]
  );

  const map = new Map<string, QuestionRecord>();

  for (const row of result.rows) {
    let options: QuestionRecord['options'] = null;

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

    map.set(row.id, {
      id: row.id,
      assessmentId: row.assessment_id,
      type: row.type,
      statement: row.statement,
      points: row.points,
      order: row.order,
      payload: row.payload,
      options,
    });
  }

  return map;
}

export interface AnswerWithQuestion {
  answer: AnswerRecord;
  question: QuestionRecord;
}

export async function listAnswersWithQuestions(
  attemptId: string
): Promise<AnswerWithQuestion[]> {
  const answers = await listAnswersByAttempt(attemptId);
  const questionIds = answers.map((a) => a.questionId);
  const questionMap = await getFullQuestionsByIds(questionIds);

  return answers
    .map((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) return null;
      return { answer, question };
    })
    .filter((x): x is AnswerWithQuestion => x !== null);
}

export async function hasAttemptsForQuestion(questionId: string): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM attempt_answers
     WHERE question_id = $1`,
    [questionId]
  );
  return parseInt(result.rows[0].count, 10) > 0;
}

export async function hasActiveAttemptsForAssessment(
  assessmentId: string
): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM attempts
     WHERE assessment_id = $1
       AND status IN ('IN_PROGRESS', 'SUBMITTED')`,
    [assessmentId]
  );
  return parseInt(result.rows[0].count, 10) > 0;
}