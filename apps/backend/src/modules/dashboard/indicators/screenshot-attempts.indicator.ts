import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError, buildDateFilter } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  ScreenshotAttemptsValue,
} from '../dashboard.types.js';

export const screenshotAttemptsIndicator: Indicator<ScreenshotAttemptsValue> = {
  key: 'screenshotAttempts',
  label: 'Intentos de captura',

  async compute(
    filters: DashboardFilters
  ): Promise<IndicatorResult<ScreenshotAttemptsValue>> {
    try {
      const dateFilter = buildDateFilter(filters, 'occurred_at', 1);

      const result = await pool.query<{
        total: string;
        unique_users: string;
        affected_videos: string;
      }>(
        `SELECT
           COUNT(*)::text AS total,
           COUNT(DISTINCT user_id)::text AS unique_users,
           COUNT(DISTINCT video_id)::text AS affected_videos
         FROM screenshot_attempts
         ${dateFilter.sql ? `WHERE ${dateFilter.sql}` : ''}`,
        dateFilter.values
      );

      const row = result.rows[0];
      const value: ScreenshotAttemptsValue = {
        totalAttempts: parseInt(row.total, 10),
        uniqueUsers: parseInt(row.unique_users, 10),
        affectedVideos: parseInt(row.affected_videos, 10),
      };

      return wrap(screenshotAttemptsIndicator.key, screenshotAttemptsIndicator.label, value);
    } catch (error) {
      return wrapError(screenshotAttemptsIndicator.key, screenshotAttemptsIndicator.label, error);
    }
  },
};