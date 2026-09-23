import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  AverageScoreValue,
} from '../dashboard.types.js';

export const averageScoreIndicator: Indicator<AverageScoreValue> = {
  key: 'averageScore',
  label: 'Puntaje promedio',

  async compute(_filters: DashboardFilters): Promise<IndicatorResult<AverageScoreValue>> {
    try {
      const result = await pool.query<{
        average_score: string | null;
        total_attempts: string;
      }>(
        `SELECT
           COALESCE(AVG(score), 0)::text AS average_score,
           COUNT(*)::text AS total_attempts
         FROM attempts
         WHERE status IN ('SUBMITTED', 'GRADED')`
      );

      const row = result.rows[0];
      const value: AverageScoreValue = {
        averageScore: Math.round(parseFloat(row.average_score ?? '0') * 100) / 100,
        totalAttempts: parseInt(row.total_attempts, 10),
      };

      return wrap(averageScoreIndicator.key, averageScoreIndicator.label, value);
    } catch (error) {
      return wrapError(averageScoreIndicator.key, averageScoreIndicator.label, error);
    }
  },
};