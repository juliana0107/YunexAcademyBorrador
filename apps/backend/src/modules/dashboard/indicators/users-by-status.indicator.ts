import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  UsersByStatusValue,
} from '../dashboard.types.js';

export const usersByStatusIndicator: Indicator<UsersByStatusValue> = {
  key: 'usersByStatus',
  label: 'Usuarios por estado',

  async compute(_filters: DashboardFilters): Promise<IndicatorResult<UsersByStatusValue>> {
    try {
      const result = await pool.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text AS count
         FROM users
         GROUP BY status`
      );

      const value: UsersByStatusValue = { active: 0, inactive: 0, suspended: 0 };

      for (const row of result.rows) {
        const n = parseInt(row.count, 10);
        if (row.status === 'ACTIVE') value.active = n;
        else if (row.status === 'INACTIVE') value.inactive = n;
        else if (row.status === 'SUSPENDED') value.suspended = n;
      }

      return wrap(usersByStatusIndicator.key, usersByStatusIndicator.label, value);
    } catch (error) {
      return wrapError(usersByStatusIndicator.key, usersByStatusIndicator.label, error);
    }
  },
};