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

export interface StreamTicket {
  ticket: string;
  expiresIn: number;
}

export interface CreateVideoInput {
  submoduleId: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  order?: number;
  file: File;
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  durationSeconds?: number;
}