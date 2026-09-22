import {
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/http-error.js';
import { pool } from '../../config/database.config.js';
import * as repo from './submodule.repository.js';
import { toDetail, toListItem } from './submodule.mapper.js';
import type {
  CreateSubmoduleInput,
  UpdateSubmoduleInput,
  ListSubmodulesQuery,
} from './submodule.schema.js';
import type {
  PaginatedSubmodules,
  SubmoduleDetail,
  SubmoduleListItem,
} from './submodule.types.js';

async function assertCourseExists(courseId: string): Promise<{
  id: string;
  status: string;
}> {
  const result = await pool.query<{ id: string; status: string }>(
    'SELECT id, status FROM training_courses WHERE id = $1',
    [courseId]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError('Training course not found');
  }
  return result.rows[0];
}

export async function listByCourse(courseId: string): Promise<SubmoduleListItem[]> {
  await assertCourseExists(courseId);
  const items = await repo.listByCourse(courseId);
  return items.map(toListItem);
}

export async function list(
  query: ListSubmodulesQuery
): Promise<PaginatedSubmodules> {
  const { items, total } = await repo.list({
    trainingCourseId: query.trainingCourseId,
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

export async function getById(id: string): Promise<SubmoduleDetail> {
  const submodule = await repo.findById(id);
  if (!submodule) throw new NotFoundError('Submodule not found');
  return toDetail(submodule);
}

export async function create(input: CreateSubmoduleInput): Promise<SubmoduleDetail> {
  const course = await assertCourseExists(input.trainingCourseId);

  // RN-02: no puedes agregar submódulos a un curso archivado
  if (course.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot add submodules to an archived training course');
  }

  // RN-03: si no viene order, se auto-calcula
  const order = input.order ?? (await repo.getNextOrder(input.trainingCourseId));

  const created = await repo.create({
    trainingCourseId: input.trainingCourseId,
    title: input.title,
    description: input.description,
    order,
    estimatedDurationMinutes: input.estimatedDurationMinutes,
  });

  await repo.recalculateCourseDuration(input.trainingCourseId);

  return toDetail(created);
}

export async function update(
  id: string,
  input: UpdateSubmoduleInput
): Promise<SubmoduleDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Submodule not found');

  const course = await assertCourseExists(existing.trainingCourseId);
  if (course.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot edit a submodule of an archived training course');
  }

  const updated = await repo.update(id, {
    title: input.title,
    description: input.description,
    estimatedDurationMinutes: input.estimatedDurationMinutes,
  });

  if (!updated) throw new NotFoundError('Submodule not found');

  if (input.estimatedDurationMinutes !== undefined) {
    await repo.recalculateCourseDuration(existing.trainingCourseId);
  }

  return toDetail(updated);
}

export async function changeOrder(id: string, order: number): Promise<SubmoduleDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Submodule not found');

  const course = await assertCourseExists(existing.trainingCourseId);
  if (course.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot reorder submodules of an archived training course');
  }

  const updated = await repo.changeOrder(id, order);
  if (!updated) throw new NotFoundError('Submodule not found');
  return toDetail(updated);
}

export async function remove(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Submodule not found');

  const course = await assertCourseExists(existing.trainingCourseId);
  if (course.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot delete a submodule of an archived training course');
  }

  // RN-04: no puedes eliminar un submódulo que tiene videos
  const videoCount = await repo.countVideos(id);
  if (videoCount > 0) {
    throw new ForbiddenError(
      `Cannot delete a submodule with ${videoCount} video(s). Delete the videos first.`
    );
  }

  await repo.remove(id);
  await repo.recalculateCourseDuration(existing.trainingCourseId);
}