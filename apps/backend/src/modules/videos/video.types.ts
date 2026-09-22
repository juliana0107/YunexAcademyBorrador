export type VideoStatus = 'PROCESSING' | 'READY' | 'FAILED';

export interface VideoListItem {
  id: string;
  submoduleId: string;
  title: string;
  description: string;
  status: VideoStatus;
  order: number;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoDetail extends VideoListItem {
  storagePath: string;
}

export interface VideoListFilters {
  submoduleId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedVideos {
  items: VideoListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}