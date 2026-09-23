import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  ApprovalRateValue,
} from '../dashboard.types.js';

export const approvalRateIndicator: Indicator<ApprovalRateValue> = {
  key: 'approvalRate',
  label: 'Tasa de aprobación',

  async compute(_filters: DashboardFilters): Promise<IndicatorResult<ApprovalRateValue>> {
    try {
      const result = await pool.query<{
        approved: string;
        total: string;
      }>(
        `SELECT
           COUNT(*) FILTER (WHERE passed) ::text AS approved,
           COUNT(*)::text AS total
         FROM attempts
         WHERE status IN ('SUBMITTED', 'GRADED')`
      );

      const row = result.rows[0];
      const approved = parseInt(row.approved, 10);
      const total = parseInt(row.total, 10);

      const value: ApprovalRateValue = {
        approvedAttempts: approved,
        totalGradedAttempts: total,
        approvalRatePercent: total > 0 ? Math.round((approved / total) * 100) : 0,
      };

      return wrap(approvalRateIndicator.key, approvalRateIndicator.label, value);
    } catch (error) {
      return wrapError(approvalRateIndicator.key, approvalRateIndicator.label, error);
    }
  },
};