import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  UsersByRoleValue,
} from '../dashboard.types.js';

export const usersByRoleIndicator: Indicator<UsersByRoleValue> = {
  key: 'usersByRole',
  label: 'Usuarios por rol',

  async compute(_filters: DashboardFilters): Promise<IndicatorResult<UsersByRoleValue>> {
    try {
      const result = await pool.query<{ name: string; count: string }>(
        `SELECT r.name, COUNT(DISTINCT ur.user_id)::text AS count
         FROM roles r
         LEFT JOIN user_roles ur ON ur.role_id = r.id
         GROUP BY r.name`
      );

      const value: UsersByRoleValue = { admin: 0, instructor: 0, student: 0 };

      for (const row of result.rows) {
        const n = parseInt(row.count, 10);
        if (row.name === 'ADMIN') value.admin = n;
        else if (row.name === 'INSTRUCTOR') value.instructor = n;
        else if (row.name === 'STUDENT') value.student = n;
      }

      return wrap(usersByRoleIndicator.key, usersByRoleIndicator.label, value);
    } catch (error) {
      return wrapError(usersByRoleIndicator.key, usersByRoleIndicator.label, error);
    }
  },
};