import { Play, Pencil, Trash2, Clock, FileVideo } from 'lucide-react';
import type { VideoListItem } from '../types/video.types';

interface Props {
  videos: VideoListItem[];
  isLoading: boolean;
  canEdit: boolean;
  selectedVideoId: string | null;
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
        return (
          <li
            key={video.id}
            className={`p-4 group transition-colors ${
              isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onSelect(video)}
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}
                title="Reproducir"
              >
                <Play className="w-4 h-4" fill="currentColor" />
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