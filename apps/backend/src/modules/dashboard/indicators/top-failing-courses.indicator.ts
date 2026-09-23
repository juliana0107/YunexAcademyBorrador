import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  TopFailingCourseItem,
} from '../dashboard.types.js';

export const topFailingCoursesIndicator: Indicator<TopFailingCourseItem[]> = {
  key: 'topFailingCourses',
  label: 'Cursos con más fallos',

  async compute(
    filters: DashboardFilters
  ): Promise<IndicatorResult<TopFailingCourseItem[]>> {
    try {
      const result = await pool.query<{
        training_course_id: string;
        title: string;
        failed: string;
        total: string;
      }>(
        `SELECT
           tc.id AS training_course_id,
           tc.title,
           COUNT(*) FILTER (WHERE NOT a.passed)::text AS failed,
           COUNT(*)::text AS total
         FROM attempts a
         INNER JOIN assessments ass ON ass.id = a.assessment_id
         INNER JOIN training_courses tc ON tc.id = ass.training_course_id
         WHERE a.status IN ('SUBMITTED', 'GRADED')
         GROUP BY tc.id, tc.title
         HAVING COUNT(*) > 0
         ORDER BY failed DESC, tc.title ASC
         LIMIT $1`,
        [filters.topLimit]
      );

      const value: TopFailingCourseItem[] = result.rows.map((r) => {
        const failed = parseInt(r.failed, 10);
        const total = parseInt(r.total, 10);
        return {
          trainingCourseId: r.training_course_id,
          title: r.title,
          failedAttempts: failed,
          totalAttempts: total,
          failureRatePercent: total > 0 ? Math.round((failed / total) * 100) : 0,
        };
      });

      return wrap(topFailingCoursesIndicator.key, topFailingCoursesIndicator.label, value);
    } catch (error) {
      return wrapError(topFailingCoursesIndicator.key, topFailingCoursesIndicator.label, error);
    }
  },
};