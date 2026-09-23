import { apiClient } from '@/lib/api-client';
import { ENV } from '@/lib/env';
import type {
  VideoListItem,
  VideoDetail,
  StreamTicket,
  CreateVideoInput,
  UpdateVideoInput,
} from '../types/video.types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export async function listBySubmodule(submoduleId: string): Promise<VideoListItem[]> {
  const { data } = await apiClient.get<ApiSuccess<VideoListItem[]>>(
    `/submodules/${submoduleId}/videos`
  );
  return data.data;
}

export async function getVideo(id: string): Promise<VideoDetail> {
  const { data } = await apiClient.get<ApiSuccess<VideoDetail>>(`/videos/${id}`);
  return data.data;
}

export async function requestStreamTicket(videoId: string): Promise<StreamTicket> {
  const { data } = await apiClient.post<ApiSuccess<StreamTicket>>(
    `/videos/${videoId}/stream-ticket`
  );
  return data.data;
}

export function buildStreamUrl(videoId: string, ticket: string): string {
  // ENV.API_URL suele terminar en /api
  return `${ENV.API_URL}/videos/${videoId}/stream?ticket=${encodeURIComponent(ticket)}`;
}

export async function uploadVideo(input: CreateVideoInput): Promise<VideoListItem> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('title', input.title);
  formData.append('description', input.description ?? '');
  formData.append('durationSeconds', String(input.durationSeconds ?? 0));
  if (input.order !== undefined) {
    formData.append('order', String(input.order));
  }

  const { data } = await apiClient.post<ApiSuccess<VideoListItem>>(
    `/submodules/${input.submoduleId}/videos`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Los videos pesan: damos 30 min de timeout
      timeout: 30 * 60 * 1000,
    }
  );
  return data.data;
}

export async function updateVideo(id: string, input: UpdateVideoInput): Promise<VideoListItem> {
  const { data } = await apiClient.patch<ApiSuccess<VideoListItem>>(`/videos/${id}`, input);
  return data.data;
}

export async function deleteVideo(id: string): Promise<void> {
  await apiClient.delete(`/videos/${id}`);
}

export async function recordScreenshotAttempt(videoId: string): Promise<void> {
  await apiClient.post(`/videos/${videoId}/screenshot-attempt`);
}