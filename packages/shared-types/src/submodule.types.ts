export interface Submodule {
  id: string;
  trainingCourseId: string;
  title: string;
  description: string;
  order: number;
  videoCount: number;
  estimatedDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmoduleInput {
  trainingCourseId: string;
  title: string;
  description: string;
  order: number;
}

export interface UpdateSubmoduleInput {
  title?: string;
  description?: string;
  order?: number;
}