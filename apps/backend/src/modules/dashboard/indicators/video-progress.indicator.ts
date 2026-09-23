import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  VideoProgressValue,
} from '../dashboard.types.js';

export const videoProgressIndicator: Indicator<VideoProgressValue> = {
  key: 'videoProgress',
  label: 'Progreso de videos',

  async compute(_filters: DashboardFilters): Promise<IndicatorResult<VideoProgressValue>> {
    try {
      const result = await pool.query<{
        total_videos: string;
        completed_videos: string;
        in_progress_videos: string;
        average_progress_percent: string | null;
      }>(
        `WITH totals AS (
           SELECT COUNT(*)::text AS total_videos
           FROM videos WHERE status = 'READY'
         ),
         progress AS (
           SELECT
             COUNT(*) FILTER (WHERE completed) AS completed_videos,
             COUNT(*) FILTER (WHERE NOT completed AND watched_seconds > 0) AS in_progress_videos,
             COALESCE(AVG(
               CASE WHEN total_seconds > 0
                 THEN (watched_seconds::float / total_seconds) * 100
                 ELSE 0
               END
             ), 0) AS average_progress_percent
           FROM video_progress
         )
         SELECT
           t.total_videos,
           COALESCE(p.completed_videos, 0)::text AS completed_videos,
           COALESCE(p.in_progress_videos, 0)::text AS in_progress_videos,
           COALESCE(p.average_progress_percent, 0)::text AS average_progress_percent
         FROM totals t
         LEFT JOIN progress p ON TRUE`
      );

      const row = result.rows[0];
      const totalVideos = parseInt(row.total_videos, 10);
      const completedVideos = parseInt(row.completed_videos, 10);
      const inProgressVideos = parseInt(row.in_progress_videos, 10);

      const value: VideoProgressValue = {
        totalVideos,
        completedVideos,
        inProgressVideos,
        notStartedVideos: Math.max(0, totalVideos - completedVideos - inProgressVideos),
        averageProgressPercent: Math.round(parseFloat(row.average_progress_percent ?? '0')),
      };

      return wrap(videoProgressIndicator.key, videoProgressIndicator.label, value);
    } catch (error) {
      return wrapError(videoProgressIndicator.key, videoProgressIndicator.label, error);
    }
  },
};