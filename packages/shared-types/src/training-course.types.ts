export type TrainingCourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TrainingCourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  status: TrainingCourseStatus;
  level: TrainingCourseLevel;
  thumbnailUrl?: string;
  submoduleCount: number;
  videoCount: number;
  estimatedDurationMinutes: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingCourseInput {
  title: string;
  description: string;
  level: TrainingCourseLevel;
  thumbnailUrl?: string;
}

export interface UpdateTrainingCourseInput {
  title?: string;
  description?: string;
  level?: TrainingCourseLevel;
  status?: TrainingCourseStatus;
  thumbnailUrl?: string;
}