import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  AverageWatchTimeValue,
} from '../dashboard.types.js';

export const averageWatchTimeIndicator: Indicator<AverageWatchTimeValue> = {
  key: 'averageWatchTime',
  label: 'Tiempo promedio de visualización',

  async compute(
    _filters: DashboardFilters
  ): Promise<IndicatorResult<AverageWatchTimeValue>> {
    try {
      const result = await pool.query<{
        average: string | null;
        total: string | null;
      }>(
        `SELECT
           COALESCE(AVG(watched_seconds), 0)::text AS average,
           COALESCE(SUM(watched_seconds), 0)::text AS total
         FROM video_progress`
      );

      const row = result.rows[0];
      const value: AverageWatchTimeValue = {
        averageWatchTimeSeconds: Math.round(parseFloat(row.average ?? '0')),
        totalWatchTimeSeconds: parseInt(row.total ?? '0', 10),
      };

      return wrap(averageWatchTimeIndicator.key, averageWatchTimeIndicator.label, value);
    } catch (error) {
      return wrapError(averageWatchTimeIndicator.key, averageWatchTimeIndicator.label, error);
    }
  },
};