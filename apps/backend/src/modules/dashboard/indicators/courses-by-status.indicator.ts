import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError, buildDateFilter } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  CoursesByStatusValue,
} from '../dashboard.types.js';

export const coursesByStatusIndicator: Indicator<CoursesByStatusValue> = {
  key: 'coursesByStatus',
  label: 'Cursos por estado',

  async compute(filters: DashboardFilters): Promise<IndicatorResult<CoursesByStatusValue>> {
    try {
      const dateFilter = buildDateFilter(filters, 'created_at', 1);

      const result = await pool.query<{
        status: string;
        count: string;
      }>(
        `SELECT status, COUNT(*)::text AS count
         FROM training_courses
         ${dateFilter.sql ? `WHERE ${dateFilter.sql}` : ''}
         GROUP BY status`,
        dateFilter.values
      );

      const value: CoursesByStatusValue = {
        draft: 0,
        published: 0,
        archived: 0,
      };

      for (const row of result.rows) {
        const n = parseInt(row.count, 10);
        if (row.status === 'DRAFT') value.draft = n;
        else if (row.status === 'PUBLISHED') value.published = n;
        else if (row.status === 'ARCHIVED') value.archived = n;
      }

      return wrap(coursesByStatusIndicator.key, coursesByStatusIndicator.label, value);
    } catch (error) {
      return wrapError(coursesByStatusIndicator.key, coursesByStatusIndicator.label, error);
    }
  },
};