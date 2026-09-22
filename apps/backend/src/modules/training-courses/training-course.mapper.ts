import type { TrainingCourseRecord } from './training-course.repository.js';
import type {
  TrainingCourseListItem,
  TrainingCourseDetail,
} from './training-course.types.js';

export function toListItem(course: TrainingCourseRecord): TrainingCourseListItem {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    status: course.status,
    level: course.level,
    thumbnailUrl: course.thumbnailUrl,
    submoduleCount: course.submoduleCount,
    videoCount: course.videoCount,
    estimatedDurationMinutes: course.estimatedDurationMinutes,
    createdBy: course.createdBy,
    createdByName: course.createdByName,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

export function toDetail(course: TrainingCourseRecord): TrainingCourseDetail {
  return toListItem(course);
}