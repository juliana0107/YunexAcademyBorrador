import { pool } from '../../../config/database.config.js';
import type { Indicator } from './indicator.interface.js';
import { wrap, wrapError } from './indicator.interface.js';
import type {
  DashboardFilters,
  IndicatorResult,
  CoursesByVideoCountValue,
} from '../dashboard.types.js';

export const coursesByVideoCountIndicator: Indicator<CoursesByVideoCountValue> = {
  key: 'coursesByVideoCount',
  label: 'Cursos con más videos',

  async compute(filters: DashboardFilters): Promise<IndicatorResult<CoursesByVideoCountValue>> {
    try {
      const result = await pool.query<{
        id: string;
        title: string;
        video_count: string;
      }>(
        `SELECT
           tc.id,
           tc.title,
           COALESCE(COUNT(v.id), 0)::text AS video_count
         FROM training_courses tc
         LEFT JOIN submodules sm ON sm.training_course_id = tc.id
         LEFT JOIN videos v ON v.submodule_id = sm.id
         GROUP BY tc.id, tc.title
         ORDER BY video_count DESC, tc.title ASC
         LIMIT $1`,
        [filters.topLimit]
      );

      const value: CoursesByVideoCountValue = {
        courses: result.rows.map((r) => ({
          id: r.id,
          title: r.title,
          videoCount: parseInt(r.video_count, 10),
        })),
      };

      return wrap(coursesByVideoCountIndicator.key, coursesByVideoCountIndicator.label, value);
    } catch (error) {
      return wrapError(
        coursesByVideoCountIndicator.key,
        coursesByVideoCountIndicator.label,
        error
      );
    }
  },
};