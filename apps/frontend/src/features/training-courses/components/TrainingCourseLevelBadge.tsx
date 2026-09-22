import type { TrainingCourseLevel } from '@yunexacademy/shared-types';

const LEVEL_LABELS: Record<TrainingCourseLevel, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

const LEVEL_STYLES: Record<TrainingCourseLevel, string> = {
  BEGINNER: 'bg-blue-100 text-blue-700',
  INTERMEDIATE: 'bg-indigo-100 text-indigo-700',
  ADVANCED: 'bg-purple-100 text-purple-700',
};

interface Props {
  level: TrainingCourseLevel;
}

export function TrainingCourseLevelBadge({ level }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${LEVEL_STYLES[level]}`}
    >
      {LEVEL_LABELS[level]}
    </span>
  );
}