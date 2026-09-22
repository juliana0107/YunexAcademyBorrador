import { BadRequestError, NotFoundError } from '../../shared/errors/http-error.js';
import * as repo from './video-progress.repository.js';
import type {
  VideoProgressItem,
  SubmoduleProgress,
  UserProgressOverview,
  VideoProgressSummary,
} from './video-progress.types.js';
import type { UpsertProgressInput } from './video-progress.schema.js';

const COMPLETION_THRESHOLD = 0.9; // 90%

function toItem(record: repo.VideoProgressRecord): VideoProgressItem {
  const progressPercent =
    record.totalSeconds > 0
      ? Math.min(100, Math.round((record.watchedSeconds / record.totalSeconds) * 100))
      : 0;

  return {
    id: record.id,
    userId: record.userId,
    videoId: record.videoId,
    watchedSeconds: record.watchedSeconds,
    totalSeconds: record.totalSeconds,
    completed: record.completed,
    progressPercent,
    lastWatchedAt: record.lastWatchedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function getByVideo(
  userId: string,
  videoId: string
): Promise<VideoProgressItem | null> {
  const record = await repo.findByUserAndVideo(userId, videoId);
  return record ? toItem(record) : null;
}

export async function upsertProgress(
  userId: string,
  videoId: string,
  input: UpsertProgressInput
): Promise<VideoProgressItem> {
  if (input.watchedSeconds > input.totalSeconds) {
    throw new BadRequestError('watchedSeconds cannot exceed totalSeconds');
  }

  // Regla: completado si alcanzó el 90%
  const completed =
    input.totalSeconds > 0 &&
    input.watchedSeconds / input.totalSeconds >= COMPLETION_THRESHOLD;

  const record = await repo.upsert({
    userId,
    videoId,
    watchedSeconds: input.watchedSeconds,
    totalSeconds: input.totalSeconds,
    completed,
  });

  return toItem(record);
}

export async function getSubmoduleProgress(
  userId: string,
  submoduleId: string
): Promise<SubmoduleProgress> {
  const rows = await repo.listBySubmoduleForUser(submoduleId, userId);

  if (rows.length === 0) {
    // El submódulo no existe o no tiene videos
    // Verificamos que el submódulo exista
    const check = await repo.listBySubmoduleForUser(submoduleId, userId);
    if (check.length === 0) {
      return {
        submoduleId,
        videos: [],
        summary: {
          totalVideos: 0,
          completedVideos: 0,
          inProgressVideos: 0,
          notStartedVideos: 0,
          averageProgressPercent: 0,
        },
      };
    }
  }

  let completedVideos = 0;
  let inProgressVideos = 0;
  let notStartedVideos = 0;
  let totalProgress = 0;

  const videos = rows.map((row) => {
    const watched = row.watched_seconds ?? 0;
    const total = row.total_seconds ?? row.video_duration_seconds ?? 0;
    const percent = total > 0 ? Math.min(100, Math.round((watched / total) * 100)) : 0;

    if (row.completed) completedVideos++;
    else if (watched > 0) inProgressVideos++;
    else notStartedVideos++;

    totalProgress += percent;

    return {
      videoId: row.video_id,
      watchedSeconds: watched,
      totalSeconds: total,
      completed: row.completed ?? false,
      progressPercent: percent,
      lastWatchedAt: row.last_watched_at?.toISOString() ?? null,
    };
  });

  const summary: VideoProgressSummary = {
    totalVideos: rows.length,
    completedVideos,
    inProgressVideos,
    notStartedVideos,
    averageProgressPercent:
      rows.length > 0 ? Math.round(totalProgress / rows.length) : 0,
  };

  return {
    submoduleId,
    videos,
    summary,
  };
}

export async function getOverview(userId: string): Promise<UserProgressOverview> {
  const row = await repo.getOverviewForUser(userId);

  const totalVideos = parseInt(row.total_videos, 10);
  const completedVideos = parseInt(row.completed_videos, 10);
  const inProgressVideos = parseInt(row.in_progress_videos, 10);
  const notStartedVideos = Math.max(
    0,
    totalVideos - completedVideos - inProgressVideos
  );

  return {
    totalVideos,
    completedVideos,
    inProgressVideos,
    notStartedVideos,
    totalWatchTimeSeconds: parseInt(row.total_watch_time_seconds ?? '0', 10),
    averageProgressPercent: Math.round(
      parseFloat(row.average_progress_percent ?? '0')
    ),
  };
}