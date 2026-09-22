/**
 * Tipos compartidos de cursos de formación.
 *
 * IMPORTANTE: deben coincidir EXACTAMENTE con:
 *   - apps/backend/src/database/migrations/006_create_training_courses_table.sql (CHECKs)
 */

export const TRAINING_COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type TrainingCourseStatus =
  (typeof TRAINING_COURSE_STATUS)[keyof typeof TRAINING_COURSE_STATUS];

export const TRAINING_COURSE_LEVEL = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

export type TrainingCourseLevel =
  (typeof TRAINING_COURSE_LEVEL)[keyof typeof TRAINING_COURSE_LEVEL];

export const TRAINING_COURSE_STATUSES: readonly TrainingCourseStatus[] =
  Object.values(TRAINING_COURSE_STATUS);

export const TRAINING_COURSE_LEVELS: readonly TrainingCourseLevel[] =
  Object.values(TRAINING_COURSE_LEVEL);