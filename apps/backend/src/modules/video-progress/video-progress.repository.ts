import { pool } from '../../config/database.config.js';

interface ProgressRow {
  id: string;
  user_id: string;
  video_id: string;
  watched_seconds: number;
  total_seconds: number;
  completed: boolean;
  last_watched_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface VideoProgressRecord {
  id: string;
  userId: string;
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

function hydrate(row: ProgressRow): VideoProgressRecord {
  return {
    id: row.id,
    userId: row.user_id,
    videoId: row.video_id,
    watchedSeconds: row.watched_seconds,
    totalSeconds: row.total_seconds,
    completed: row.completed,
    lastWatchedAt: row.last_watched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findByUserAndVideo(
  userId: string,
  videoId: string
): Promise<VideoProgressRecord | null> {
  const result = await pool.query<ProgressRow>(
    `SELECT id, user_id, video_id, watched_seconds, total_seconds, completed,
            last_watched_at, created_at, updated_at
     FROM video_progress
     WHERE user_id = $1 AND video_id = $2`,
    [userId, videoId]
  );
  if (result.rows.length === 0) return null;
  return hydrate(result.rows[0]);
}

export interface UpsertProgressData {
  userId: string;
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
}

export async function upsert(data: UpsertProgressData): Promise<VideoProgressRecord> {
  const result = await pool.query<ProgressRow>(
    `INSERT INTO video_progress (user_id, video_id, watched_seconds, total_seconds, completed, last_watched_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id, video_id) DO UPDATE
       SET watched_seconds = GREATEST(video_progress.watched_seconds, EXCLUDED.watched_seconds),
           total_seconds   = EXCLUDED.total_seconds,
           completed       = video_progress.completed OR EXCLUDED.completed,
           last_watched_at = NOW(),
           updated_at      = NOW()
     RETURNING id, user_id, video_id, watched_seconds, total_seconds, completed,
               last_watched_at, created_at, updated_at`,
    [
      data.userId,
      data.videoId,
      data.watchedSeconds,
      data.totalSeconds,
      data.completed,
    ]
  );
  return hydrate(result.rows[0]);
}

export interface SubmoduleProgressRow {
  video_id: string;
  video_duration_seconds: number;
  watched_seconds: number | null;
  total_seconds: number | null;
  completed: boolean | null;
  last_watched_at: Date | null;
}

export async function listBySubmoduleForUser(
  submoduleId: string,
  userId: string
): Promise<SubmoduleProgressRow[]> {
  const result = await pool.query<SubmoduleProgressRow>(
    `SELECT
       v.id AS video_id,
       v.duration_seconds AS video_duration_seconds,
       vp.watched_seconds,
       vp.total_seconds,
       vp.completed,
       vp.last_watched_at
     FROM videos v
     LEFT JOIN video_progress vp
       ON vp.video_id = v.id AND vp.user_id = $2
     WHERE v.submodule_id = $1
     ORDER BY v."order" ASC, v.created_at ASC`,
    [submoduleId, userId]
  );
  return result.rows;
}

export interface UserOverviewRow {
  total_videos: string;
  completed_videos: string;
  in_progress_videos: string;
  total_watch_time_seconds: string | null;
  average_progress_percent: string | null;
}

export async function getOverviewForUser(userId: string): Promise<UserOverviewRow> {
  const result = await pool.query<UserOverviewRow>(
    `WITH totals AS (
       SELECT COUNT(*)::text AS total_videos
       FROM videos
       WHERE status = 'READY'
     ),
     user_progress AS (
       SELECT
         COUNT(*) FILTER (WHERE completed) AS completed_videos,
         COUNT(*) FILTER (WHERE NOT completed AND watched_seconds > 0) AS in_progress_videos,
         COALESCE(SUM(watched_seconds), 0) AS total_watch_time_seconds,
         COALESCE(AVG(
           CASE
             WHEN total_seconds > 0 THEN (watched_seconds::float / total_seconds) * 100
             ELSE 0
           END
         ), 0) AS average_progress_percent
       FROM video_progress
       WHERE user_id = $1
     )
     SELECT
       t.total_videos,
       COALESCE(up.completed_videos, 0)::text AS completed_videos,
       COALESCE(up.in_progress_videos, 0)::text AS in_progress_videos,
       COALESCE(up.total_watch_time_seconds, 0)::text AS total_watch_time_seconds,
       COALESCE(up.average_progress_percent, 0)::text AS average_progress_percent
     FROM totals t
     LEFT JOIN user_progress up ON TRUE`,
    [userId]
  );
  return result.rows[0];
}