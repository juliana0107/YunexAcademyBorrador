export interface SubmoduleListItem {
  id: string;
  trainingCourseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDurationMinutes: number;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmoduleInput {
  trainingCourseId: string;
  title: string;
  description: string;
  estimatedDurationMinutes?: number;
  order?: number;
}

export interface UpdateSubmoduleInput {
  title?: string;
  description?: string;
  estimatedDurationMinutes?: number;
}