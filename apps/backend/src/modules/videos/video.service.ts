import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/http-error.js';
import { env } from '../../config/env.config.js';
import { pool } from '../../config/database.config.js';
import * as repo from './video.repository.js';
import { toDetail, toListItem } from './video.mapper.js';
import { getStorage } from './storage/storage.factory.js';
import type {
  CreateVideoInput,
  ListVideosQuery,
  UpdateVideoInput,
} from './video.schema.js';
import type {
  PaginatedVideos,
  VideoDetail,
  VideoListItem,
} from './video.types.js';
import { eventBus, EVENTS } from '../../shared/events/event-bus.js';

const ALLOWED_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
]);

const MIME_TO_EXT: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
};

async function assertSubmoduleEditable(submoduleId: string): Promise<string> {
  const result = await pool.query<{ training_course_id: string; status: string }>(
    `SELECT sm.training_course_id, tc.status
     FROM submodules sm
     INNER JOIN training_courses tc ON tc.id = sm.training_course_id
     WHERE sm.id = $1`,
    [submoduleId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Submodule not found');
  }

  const row = result.rows[0];
  if (row.status === 'ARCHIVED') {
    throw new ForbiddenError('Cannot modify videos of an archived training course');
  }

  return row.training_course_id;
}

function validateUpload(file: Express.Multer.File): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new BadRequestError(
      `Invalid video type "${file.mimetype}". Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`
    );
  }

  const maxBytes = env.MAX_VIDEO_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new BadRequestError(
      `Video too large. Maximum allowed: ${env.MAX_VIDEO_SIZE_MB} MB`
    );
  }
}

function buildStoragePath(file: Express.Multer.File): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ext = MIME_TO_EXT[file.mimetype] ?? extname(file.originalname) ?? '.mp4';
  return `videos/${year}/${month}/${randomUUID()}${ext}`;
}

export async function listBySubmodule(submoduleId: string): Promise<VideoListItem[]> {
  const videos = await repo.listBySubmodule(submoduleId);
  return videos.map(toListItem);
}

export async function list(query: ListVideosQuery): Promise<PaginatedVideos> {
  const { items, total } = await repo.list({
    submoduleId: query.submoduleId,
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

export async function getById(id: string): Promise<VideoDetail> {
  const video = await repo.findById(id);
  if (!video) throw new NotFoundError('Video not found');
  return toDetail(video);
}

export async function upload(
  input: CreateVideoInput,
  file: Express.Multer.File
): Promise<VideoDetail> {
  validateUpload(file);

  const courseId = await assertSubmoduleEditable(input.submoduleId);

  const order = input.order ?? (await repo.getNextOrder(input.submoduleId));
  const storagePath = buildStoragePath(file);

  const storage = getStorage();
  const saved = await storage.save(file.buffer, storagePath);

  const created = await repo.create({
    submoduleId: input.submoduleId,
    title: input.title,
    description: input.description,
    order,
    durationSeconds: input.durationSeconds,
    fileSizeBytes: saved.size,
    mimeType: file.mimetype,
    storagePath: saved.path,
  });

  await repo.recalculateSubmoduleDuration(input.submoduleId);
  await repo.recalculateCourseDuration(courseId);

  await eventBus.emit(EVENTS.VIDEO_UPLOADED, { videoId: created.id });

  return toDetail(created);
}

export async function update(id: string, input: UpdateVideoInput): Promise<VideoDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Video not found');

  await assertSubmoduleEditable(existing.submoduleId);

  const updated = await repo.update(id, {
    title: input.title,
    description: input.description,
    durationSeconds: input.durationSeconds,
  });

  if (!updated) throw new NotFoundError('Video not found');

  if (input.durationSeconds !== undefined) {
    await repo.recalculateSubmoduleDuration(existing.submoduleId);
    const courseId = await repo.getSubmoduleCourseId(existing.submoduleId);
    if (courseId) await repo.recalculateCourseDuration(courseId);
  }

  return toDetail(updated);
}

export async function changeOrder(id: string, order: number): Promise<VideoDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Video not found');

  await assertSubmoduleEditable(existing.submoduleId);

  const updated = await repo.changeOrder(id, order);
  if (!updated) throw new NotFoundError('Video not found');
  return toDetail(updated);
}

export async function remove(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Video not found');

  await assertSubmoduleEditable(existing.submoduleId);

  const storage = getStorage();
  await storage.delete(existing.storagePath);

  await repo.remove(id);

  await repo.recalculateSubmoduleDuration(existing.submoduleId);
  const courseId = await repo.getSubmoduleCourseId(existing.submoduleId);
  if (courseId) await repo.recalculateCourseDuration(courseId);

  await eventBus.emit(EVENTS.VIDEO_DELETED, { videoId: id });
}

export async function getStreamInfo(id: string): Promise<{
  storagePath: string;
  mimeType: string;
  size: number;
}> {
  const video = await repo.findById(id);
  if (!video) throw new NotFoundError('Video not found');

  const storage = getStorage();
  const size = await storage.size(video.storagePath);
  if (size < 0) {
    throw new NotFoundError('Video file is missing from storage');
  }

  return {
    storagePath: video.storagePath,
    mimeType: video.mimeType,
    size,
  };
}

export async function recordScreenshotAttempt(
  videoId: string,
  userId: string,
  userAgent: string | undefined
): Promise<void> {
  const video = await repo.findById(videoId);
  if (!video) throw new NotFoundError('Video not found');

  await pool.query(
    `INSERT INTO screenshot_attempts (user_id, video_id, user_agent)
     VALUES ($1, $2, $3)`,
    [userId, videoId, userAgent ?? null]
  );
}