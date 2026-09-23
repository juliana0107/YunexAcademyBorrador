import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  TopProgressingUserItem,
} from '../dashboard.types.js';

export const topProgressingUsersIndicator: Indicator<TopProgressingUserItem[]> = {
  key: 'topProgressingUsers',
  label: 'Usuarios con más progreso',

  async compute(
    filters: DashboardFilters
  ): Promise<IndicatorResult<TopProgressingUserItem[]>> {
    try {
      const totalVideosResult = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM videos WHERE status = 'READY'`
      );
      const totalVideos = parseInt(totalVideosResult.rows[0].count, 10);

      const result = await pool.query<{
        user_id: string;
        first_name: string;
        last_name: string;
        completed: string;
      }>(
        `SELECT
           u.id AS user_id,
           u.first_name,
           u.last_name,
           COUNT(*) FILTER (WHERE vp.completed)::text AS completed
         FROM users u
         INNER JOIN video_progress vp ON vp.user_id = u.id
         GROUP BY u.id, u.first_name, u.last_name
         HAVING COUNT(*) FILTER (WHERE vp.completed) > 0
         ORDER BY completed DESC, u.first_name ASC
         LIMIT $1`,
        [filters.topLimit]
      );

      const value: TopProgressingUserItem[] = result.rows.map((r) => {
        const completed = parseInt(r.completed, 10);
        return {
          userId: r.user_id,
          fullName: `${r.first_name} ${r.last_name}`.trim(),
          completedVideos: completed,
          totalVideos,
          progressPercent:
            totalVideos > 0 ? Math.round((completed / totalVideos) * 100) : 0,
        };
      });

      return wrap(topProgressingUsersIndicator.key, topProgressingUsersIndicator.label, value);
    } catch (error) {
      return wrapError(topProgressingUsersIndicator.key, topProgressingUsersIndicator.label, error);
    }
  },
};