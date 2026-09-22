import type {
  TrainingCourseStatus,
  TrainingCourseLevel,
} from '@yunexacademy/shared-types';

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

export interface PaginatedTrainingCourses {
  items: TrainingCourseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrainingCourseListFilters {
  search?: string;
  status?: TrainingCourseStatus;
  level?: TrainingCourseLevel;
  page?: number;
  limit?: number;
}

export interface CreateTrainingCourseInput {
  title: string;
  description: string;
  level: TrainingCourseLevel;
  thumbnailUrl?: string | null;
}

export interface UpdateTrainingCourseInput {
  title?: string;
  description?: string;
  level?: TrainingCourseLevel;
  thumbnailUrl?: string | null;
}