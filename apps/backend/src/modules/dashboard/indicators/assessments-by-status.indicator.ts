import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  AssessmentsByStatusValue,
} from '../dashboard.types.js';

export const assessmentsByStatusIndicator: Indicator<AssessmentsByStatusValue> = {
  key: 'assessmentsByStatus',
  label: 'Evaluaciones por estado',

  async compute(
    _filters: DashboardFilters
  ): Promise<IndicatorResult<AssessmentsByStatusValue>> {
    try {
      const result = await pool.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text AS count
         FROM assessments
         GROUP BY status`
      );

      const value: AssessmentsByStatusValue = { draft: 0, published: 0, archived: 0 };

      for (const row of result.rows) {
        const n = parseInt(row.count, 10);
        if (row.status === 'DRAFT') value.draft = n;
        else if (row.status === 'PUBLISHED') value.published = n;
        else if (row.status === 'ARCHIVED') value.archived = n;
      }

      return wrap(
        assessmentsByStatusIndicator.key,
        assessmentsByStatusIndicator.label,
        value
      );
    } catch (error) {
      return wrapError(
        assessmentsByStatusIndicator.key,
        assessmentsByStatusIndicator.label,
        error
      );
    }
  },
};