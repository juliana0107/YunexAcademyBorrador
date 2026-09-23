import { Play, Pencil, Trash2, Clock, FileVideo, CheckCircle2 } from 'lucide-react';
import type { VideoListItem } from '../types/video.types';
import type { SubmoduleVideoProgress } from '@/features/video-progress/types/video-progress.types';

interface Props {
  videos: VideoListItem[];
  isLoading: boolean;
  canEdit: boolean;
  selectedVideoId: string | null;
  progressMap?: Map<string, SubmoduleVideoProgress>;
  onSelect: (video: VideoListItem) => void;
  onEdit: (video: VideoListItem) => void;
  onDelete: (video: VideoListItem) => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoList({
  videos,
  isLoading,
  canEdit,
  selectedVideoId,
  progressMap,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Cargando videos...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <FileVideo className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500">Este módulo aún no tiene videos</p>
      </div>
    );
  }

  return (
    <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
      {videos.map((video, index) => {
        const isSelected = selectedVideoId === video.id;
        const progress = progressMap?.get(video.id);
        const isCompleted = progress?.completed ?? false;
       
        return (
          <li
            key={video.id}
            className={`group transition-colors ${
              isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="p-4 flex items-start gap-3">
              <button
                type="button"
                onClick={() => onSelect(video)}
                className={`relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}
                title="Reproducir"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" fill="currentColor" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {index + 1}. {video.title}
                </p>
                {video.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.durationSeconds)}
                  </span>
                  <span>{formatBytes(video.fileSizeBytes)}</span>
                  <span className="uppercase">{video.mimeType.replace('video/', '')}</span>
                </div>

                {/* Barra de progreso */}
                {progress && progress.watchedSeconds > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : 'text-brand-600'
                      }`}
                    >
                      {progress.progressPercent}%
                    </span>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(video)}
                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(video)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}