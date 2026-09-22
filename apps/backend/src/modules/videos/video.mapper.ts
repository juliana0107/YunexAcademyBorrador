import type { VideoRecord } from './video.repository.js';
import type { VideoListItem, VideoDetail } from './video.types.js';

export function toListItem(video: VideoRecord): VideoListItem {
  return {
    id: video.id,
    submoduleId: video.submoduleId,
    title: video.title,
    description: video.description,
    status: video.status,
    order: video.order,
    durationSeconds: video.durationSeconds,
    fileSizeBytes: video.fileSizeBytes,
    mimeType: video.mimeType,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
  };
}

export function toDetail(video: VideoRecord): VideoDetail {
  return {
    ...toListItem(video),
    storagePath: video.storagePath,
  };
}