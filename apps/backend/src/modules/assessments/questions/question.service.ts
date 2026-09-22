import { ForbiddenError, NotFoundError } from '../../../shared/errors/http-error.js';
import { pool } from '../../../config/database.config.js';
import * as repo from './question.repository.js';
import { toDetail, toListItem } from './question.mapper.js';
import * as attemptRepo from '../attempts/attempt.repository.js';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from './question.schema.js';
import type { QuestionListItem, QuestionDetail } from './question.types.js';

async function assertAssessmentEditable(assessmentId: string): Promise<void> {
  const result = await pool.query<{ status: string; training_course_id: string }>(
    `SELECT a.status, a.training_course_id
     FROM assessments a WHERE a.id = $1`,
    [assessmentId]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError('Assessment not found');
  }
  if (result.rows[0].status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot modify questions of an archived assessment');
  }
  const courseResult = await pool.query<{ status: string }>(
    'SELECT status FROM training_courses WHERE id = $1',
    [result.rows[0].training_course_id]
  );
  if (courseResult.rows[0]?.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot modify questions of an archived training course');
  }
}

/**
 * RN-ATTEMPT-11: no se puede modificar una pregunta si ya tiene intentos.
 * Esto protege la calificación: si un estudiante ya respondió una pregunta,
 * cambiar su contenido dejaría el intento en un estado inconsistente.
 */
async function assertNoActiveAttempts(questionId: string): Promise<void> {
  const hasAttempts = await attemptRepo.hasAttemptsForQuestion(questionId);
  if (hasAttempts) {
    throw new ForbiddenError(
      'Cannot modify this question because it already has attempts. ' +
        'Archive the assessment or create a new question instead.'
    );
  }
}

export async function listByAssessment(assessmentId: string): Promise<QuestionListItem[]> {
  const questions = await repo.listByAssessment(assessmentId);
  return questions.map(toListItem);
}

export async function getById(id: string): Promise<QuestionDetail> {
  const question = await repo.findById(id);
  if (!question) throw new NotFoundError('Question not found');
  return toDetail(question);
}

export async function create(
  assessmentId: string,
  input: CreateQuestionInput
): Promise<QuestionDetail> {
  await assertAssessmentEditable(assessmentId);

  const order = input.order ?? (await repo.getNextOrder(assessmentId));

  let payload: Record<string, unknown> = input.payload ?? {};

  if (input.type === 'SINGLE_CHOICE' || input.type === 'MULTIPLE_CHOICE') {
    payload = {};
  }

  const created = await repo.create({
    assessmentId,
    type: input.type,
    statement: input.statement,
    points: input.points,
    order,
    payload,
    options: input.options ?? null,
  });

  return toDetail(created);
}

export async function update(
  id: string,
  input: UpdateQuestionInput
): Promise<QuestionDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Question not found');

  await assertAssessmentEditable(existing.assessmentId);
  await assertNoActiveAttempts(id);

  const updated = await repo.update(id, {
    statement: input.statement,
    points: input.points,
    order: input.order,
    payload: input.payload,
    options: input.options,
  });

  if (!updated) throw new NotFoundError('Question not found');
  return toDetail(updated);
}

export async function reorder(id: string, order: number): Promise<QuestionDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Question not found');

  await assertAssessmentEditable(existing.assessmentId);
  await assertNoActiveAttempts(id);

  const updated = await repo.reorder(id, order);
  if (!updated) throw new NotFoundError('Question not found');
  return toDetail(updated);
}

export async function remove(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Question not found');

  await assertAssessmentEditable(existing.assessmentId);
  await assertNoActiveAttempts(id);

  await repo.remove(id);
}