import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  MostFailedQuestionItem,
} from '../dashboard.types.js';

export const mostFailedQuestionsIndicator: Indicator<MostFailedQuestionItem[]> = {
  key: 'mostFailedQuestions',
  label: 'Preguntas más falladas',

  async compute(
    filters: DashboardFilters
  ): Promise<IndicatorResult<MostFailedQuestionItem[]>> {
    try {
      const result = await pool.query<{
        question_id: string;
        statement: string;
        type: string;
        failed: string;
        total: string;
      }>(
        `SELECT
           q.id AS question_id,
           q.statement,
           q.type,
           COUNT(*) FILTER (WHERE aa.is_correct = false)::text AS failed,
           COUNT(*) FILTER (WHERE aa.is_correct IS NOT NULL)::text AS total
         FROM attempt_answers aa
         INNER JOIN questions q ON q.id = aa.question_id
         WHERE aa.is_correct IS NOT NULL
         GROUP BY q.id, q.statement, q.type
         HAVING COUNT(*) FILTER (WHERE aa.is_correct IS NOT NULL) > 0
         ORDER BY failed DESC, q.statement ASC
         LIMIT $1`,
        [filters.topLimit]
      );

      const value: MostFailedQuestionItem[] = result.rows.map((r) => {
        const failed = parseInt(r.failed, 10);
        const total = parseInt(r.total, 10);
        return {
          questionId: r.question_id,
          statement: r.statement,
          questionType: r.type,
          failedAttempts: failed,
          totalAttempts: total,
          failureRatePercent: total > 0 ? Math.round((failed / total) * 100) : 0,
        };
      });

      return wrap(mostFailedQuestionsIndicator.key, mostFailedQuestionsIndicator.label, value);
    } catch (error) {
      return wrapError(mostFailedQuestionsIndicator.key, mostFailedQuestionsIndicator.label, error);
    }
  },
};