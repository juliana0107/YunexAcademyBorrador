import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../shared/errors/http-error.js';
import * as repo from './training-course.repository.js';
import { toDetail, toListItem } from './training-course.mapper.js';
import type {
  CreateTrainingCourseInput,
  UpdateTrainingCourseInput,
  ListTrainingCoursesQuery,
} from './training-course.schema.js';
import type {
  PaginatedTrainingCourses,
  TrainingCourseDetail,
} from './training-course.types.js';
import type { TrainingCourseStatus } from '@yunexacademy/shared-types';

export async function list(
  query: ListTrainingCoursesQuery
): Promise<PaginatedTrainingCourses> {
  const { items, total } = await repo.list({
    search: query.search,
    status: query.status,
    level: query.level,
    createdBy: query.createdBy,
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

export async function getById(id: string): Promise<TrainingCourseDetail> {
  const course = await repo.findById(id);
  if (!course) throw new NotFoundError('Training course not found');
  return toDetail(course);
}

export async function create(
  input: CreateTrainingCourseInput,
  createdBy: string
): Promise<TrainingCourseDetail> {
  const created = await repo.create({
    title: input.title,
    description: input.description,
    level: input.level,
    thumbnailUrl: input.thumbnailUrl ?? null,
    createdBy,
  });
  return toDetail(created);
}

export async function update(
  id: string,
  input: UpdateTrainingCourseInput
): Promise<TrainingCourseDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Training course not found');

  if (existing.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot edit an archived training course');
  }

  const updated = await repo.update(id, {
    title: input.title,
    description: input.description,
    level: input.level,
    thumbnailUrl: input.thumbnailUrl,
  });

  if (!updated) throw new NotFoundError('Training course not found');
  return toDetail(updated);
}

export async function changeStatus(
  id: string,
  status: TrainingCourseStatus
): Promise<TrainingCourseDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Training course not found');

  if (existing.status === status) {
    return toDetail(existing);
  }

  // RN-01: No se puede publicar un curso sin al menos un submódulo
  if (status === 'PUBLISHED') {
    const submoduleCount = await repo.countSubmodules(id);
    if (submoduleCount === 0) {
      throw new ConflictError(
        'Cannot publish a training course without at least one submodule'
      );
    }
  }

  // No se puede volver de ARCHIVED a DRAFT/PUBLISHED sin pasar por update explícito
  if (existing.status === 'ARCHIVED' && status !== 'ARCHIVED') {
    throw new ForbiddenError('Cannot change status of an archived training course');
  }

  const updated = await repo.changeStatus(id, status);
  if (!updated) throw new NotFoundError('Training course not found');
  return toDetail(updated);
}

export async function remove(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Training course not found');

  if (existing.status === 'PUBLISHED') {
    throw new ForbiddenError(
      'Cannot delete a published training course. Archive it first.'
    );
  }

  await repo.remove(id);
}