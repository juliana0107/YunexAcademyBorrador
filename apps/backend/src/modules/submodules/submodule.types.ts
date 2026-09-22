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

export interface SubmoduleDetail extends SubmoduleListItem {}

export interface PaginatedSubmodules {
  items: SubmoduleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubmoduleListFilters {
  trainingCourseId?: string;
  search?: string;
  page: number;
  limit: number;
}