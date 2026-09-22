import type { TrainingCourseStatus, TrainingCourseLevel } from '@yunexacademy/shared-types';

export interface TrainingCourseListItem {
  id: string;
  title: string;
  description: string;
  status: TrainingCourseStatus;
  level: TrainingCourseLevel;
  thumbnailUrl: string | null;
  submoduleCount: number;
  videoCount: number;
  estimatedDurationMinutes: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCourseDetail extends TrainingCourseListItem {
  // por ahora solo extiende el list item
  // los submódulos se agregan después cuando exista ese módulo
}

export interface TrainingCourseListFilters {
  search?: string;
  status?: TrainingCourseStatus;
  level?: TrainingCourseLevel;
  createdBy?: string;
  page: number;
  limit: number;
}

export interface PaginatedTrainingCourses {
  items: TrainingCourseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}