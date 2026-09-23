import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  AverageAttemptsValue,
} from '../dashboard.types.js';

export const averageAttemptsIndicator: Indicator<AverageAttemptsValue> = {
  key: 'averageAttempts',
  label: 'Intentos promedio por estudiante',

  async compute(
    _filters: DashboardFilters
  ): Promise<IndicatorResult<AverageAttemptsValue>> {
    try {
      const result = await pool.query<{
        average: string | null;
        students: string;
      }>(
        `WITH per_user AS (
           SELECT user_id, COUNT(*) AS attempts
           FROM attempts
           GROUP BY user_id
         )
         SELECT
           COALESCE(AVG(attempts), 0)::text AS average,
           COUNT(*)::text AS students
         FROM per_user`
      );

      const row = result.rows[0];
      const value: AverageAttemptsValue = {
        averageAttempts: Math.round(parseFloat(row.average ?? '0') * 100) / 100,
        totalStudents: parseInt(row.students, 10),
      };

      return wrap(averageAttemptsIndicator.key, averageAttemptsIndicator.label, value);
    } catch (error) {
      return wrapError(averageAttemptsIndicator.key, averageAttemptsIndicator.label, error);
    }
  },
};