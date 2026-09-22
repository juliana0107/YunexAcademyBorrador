import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../shared/errors/http-error.js';
import { pool } from '../../config/database.config.js';
import * as repo from './assessment.repository.js';
import { toDetail, toListItem } from './assessment.mapper.js';
import type {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  ListAssessmentsQuery,
} from './assessment.schema.js';
import type {
  PaginatedAssessments,
  AssessmentDetail,
} from './assessment.types.js';
import type { AssessmentStatus } from './assessment.types.js';

async function assertCourseEditable(courseId: string): Promise<void> {
  const result = await pool.query<{ status: string }>(
    'SELECT status FROM training_courses WHERE id = $1',
    [courseId]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError('Training course not found');
  }
  if (result.rows[0].status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot modify assessments of an archived training course');
  }
}

export async function list(query: ListAssessmentsQuery): Promise<PaginatedAssessments> {
  const { items, total } = await repo.list({
    trainingCourseId: query.trainingCourseId,
    submoduleId: query.submoduleId,
    status: query.status,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

  return {
    items: items.map(toListItem),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function listByCourse(courseId: string) {
  const items = await repo.listByCourse(courseId);
  return items.map(toListItem);
}

export async function listBySubmodule(submoduleId: string) {
  const items = await repo.listBySubmodule(submoduleId);
  return items.map(toListItem);
}

export async function getById(id: string): Promise<AssessmentDetail> {
  const assessment = await repo.findById(id);
  if (!assessment) throw new NotFoundError('Assessment not found');
  return toDetail(assessment);
}

export async function create(input: CreateAssessmentInput): Promise<AssessmentDetail> {
  await assertCourseEditable(input.trainingCourseId);

  // Si viene submoduleId, verificar que pertenece al curso
  if (input.submoduleId) {
    const submoduleCheck = await pool.query<{ training_course_id: string }>(
      'SELECT training_course_id FROM submodules WHERE id = $1',
      [input.submoduleId]
    );
    if (submoduleCheck.rows.length === 0) {
      throw new NotFoundError('Submodule not found');
    }
    if (submoduleCheck.rows[0].training_course_id !== input.trainingCourseId) {
      throw new ForbiddenError('Submodule does not belong to the specified training course');
    }
  }

  const created = await repo.create({
    trainingCourseId: input.trainingCourseId,
    submoduleId: input.submoduleId ?? null,
    title: input.title,
    description: input.description,
    passingScore: input.passingScore,
    maxAttempts: input.maxAttempts,
    timeLimitMinutes: input.timeLimitMinutes ?? null,
    shuffleQuestions: input.shuffleQuestions,
  });

  return toDetail(created);
}

export async function update(
  id: string,
  input: UpdateAssessmentInput
): Promise<AssessmentDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Assessment not found');

  await assertCourseEditable(existing.trainingCourseId);

  if (existing.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot edit an archived assessment');
  }

  const updated = await repo.update(id, {
    title: input.title,
    description: input.description,
    passingScore: input.passingScore,
    maxAttempts: input.maxAttempts,
    timeLimitMinutes: input.timeLimitMinutes,
    shuffleQuestions: input.shuffleQuestions,
  });

  if (!updated) throw new NotFoundError('Assessment not found');
  return toDetail(updated);
}

export async function changeStatus(
  id: string,
  status: AssessmentStatus
): Promise<AssessmentDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Assessment not found');

  if (existing.status === status) return toDetail(existing);

  // RN-XX: no se puede publicar una evaluación sin preguntas
  if (status === 'PUBLISHED') {
    const count = await repo.countQuestions(id);
    if (count === 0) {
      throw new ConflictError('Cannot publish an assessment without at least one question');
    }
  }

  if (existing.status === 'ARCHIVED' && status !== 'ARCHIVED') {
    throw new ForbiddenError('Cannot change status of an archived assessment');
  }

  const updated = await repo.changeStatus(id, status);
  if (!updated) throw new NotFoundError('Assessment not found');
  return toDetail(updated);
}

export async function remove(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Assessment not found');

  if (existing.status === 'PUBLISHED') {
    throw new ForbiddenError('Cannot delete a published assessment. Archive it first.');
  }

  await repo.remove(id);
}