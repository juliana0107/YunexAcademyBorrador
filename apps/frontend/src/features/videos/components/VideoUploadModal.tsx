import { useEffect, useState, type ChangeEvent } from 'react';
import { X, Upload, FileVideo } from 'lucide-react';
import { useUploadVideo } from '../hooks/useVideoMutations';
import { extractErrorMessage } from '@/lib/errors';
import type { VideoListItem } from '../types/video.types';

interface Props {
  isOpen: boolean;
  submoduleId: string;
  courseId?: string;
  onClose: () => void;
  onUploaded: (video: VideoListItem) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoUploadModal({
  isOpen,
  submoduleId,
  courseId,
  onClose,
  onUploaded,
}: Props) {
  const uploadMutation = useUploadVideo(submoduleId, courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDuration(0);
      setFile(null);
      setError(null);
    }
  }, [isOpen]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    if (!title) {
      // Auto-sugerir título a partir del nombre del archivo
      const baseName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(baseName);
    }

    // Leer duración con un <video> temporal
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      const secs = Math.round(videoEl.duration);
      if (!isNaN(secs) && secs > 0) setDuration(secs);
      URL.revokeObjectURL(videoEl.src);
    };
    videoEl.src = URL.createObjectURL(selected);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Selecciona un archivo de video');
      return;
    }

    try {
      const created = await uploadMutation.mutateAsync({
        submoduleId,
        title,
        description,
        durationSeconds: duration,
        file,
      });
      onUploaded(created);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (!isOpen) return null;

  const isSubmitting = uploadMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Subir video</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo de video
            </label>
            {file ? (
              <div className="flex items-center gap-3 p-3 bg-brand-50 border border-brand-200 rounded-lg">
                <FileVideo className="w-8 h-8 text-brand-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-600">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label="Quitar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 hover:bg-brand-50/30 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Haz clic o arrastra el video aquí
                </p>
                <p className="text-xs text-gray-500">
                  MP4, WebM u OGG · máx. 500 MB
                </p>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:bg-gray-100"
            />
          </div>

          {duration > 0 && (
            <div className="text-xs text-gray-500">
              Duración detectada: <strong>{duration}s</strong> (
              {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')})
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
              Subiendo video... esto puede tardar unos minutos.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Subiendo...' : 'Subir video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}