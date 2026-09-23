import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, Video as VideoIcon } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSubmodule } from '@/features/submodules/hooks/useSubmodules';
import { useTrainingCourse } from '@/features/training-courses/hooks/useTrainingCourses';
import { useSubmoduleProgress } from '@/features/video-progress/hooks/useVideoProgress';
import { useVideos } from '../hooks/useVideos';
import { useDeleteVideo } from '../hooks/useVideoMutations';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoList } from '../components/VideoList';
import { VideoUploadModal } from '../components/VideoUploadModal';
import { VideoDeleteDialog } from '../components/VideoDeleteDialog';
import { extractErrorMessage } from '@/lib/errors';
import type { VideoListItem } from '../types/video.types';

export function SubmoduleDetailPage() {
  const { submoduleId } = useParams<{ submoduleId: string }>();
  const user = useAuthStore((s) => s.user);

  const canEdit = user?.permissions?.includes('videos:write' as never) ?? false;

  // 1. Datos base
  const { data: submodule } = useSubmodule(submoduleId);
  const courseId = submodule?.trainingCourseId;

  const { data: course } = useTrainingCourse(courseId);
  const { data: videos = [], isLoading: videosLoading } = useVideos(submoduleId);
  const { data: progressData } = useSubmoduleProgress(submoduleId);

  // 2. Estado local
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VideoListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 3. Mutación de borrado
  const deleteMutation = useDeleteVideo(submoduleId ?? '', courseId);

  // 4. Mapa de progreso por videoId
  const progressMap = useMemo(
    () => new Map(progressData?.videos.map((v) => [v.videoId, v]) ?? []),
    [progressData]
  );

  // 5. Auto-seleccionar el primer video al cargar
  useEffect(() => {
    if (!selectedVideoId && videos.length > 0) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  // 6. Early return DESPUÉS de todos los hooks
  if (!submoduleId) return null;

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if (selectedVideoId === deleteTarget.id) {
        setSelectedVideoId(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
      setDeleteTarget(null);
    }
  }

  const selectedVideo = videos.find((v) => v.id === selectedVideoId) ?? null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {course && (
        <Link
          to={`/training-courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {course.title}
        </Link>
      )}

      {submodule && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{submodule.title}</h1>
          <p className="text-gray-600 mt-1">
            {submodule.description || 'Sin descripción'}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <VideoIcon className="w-4 h-4" />
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {submodule.estimatedDurationMinutes} min
            </span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {actionError}
        </div>
      )}

      {selectedVideo ? (
        <div className="mb-6">
          <VideoPlayer videoId={selectedVideo.id} />
          <div className="mt-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedVideo.title}
            </h2>
            {selectedVideo.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedVideo.description}</p>
            )}
          </div>
        </div>
      ) : videos.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 mb-6">
          Selecciona un video para reproducirlo
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Videos del módulo</h3>
        {canEdit && (
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Subir video
          </button>
        )}
      </div>

      <VideoList
        videos={videos}
        isLoading={videosLoading}
        canEdit={canEdit}
        selectedVideoId={selectedVideoId}
        progressMap={progressMap}
        onSelect={(v) => setSelectedVideoId(v.id)}
        onEdit={() => {
          // TODO: modal de editar (por ahora solo título/description/duration)
          setActionError('Editar video: próximamente');
        }}
        onDelete={setDeleteTarget}
      />

      <VideoUploadModal
        isOpen={uploadOpen}
        submoduleId={submoduleId}
        courseId={courseId}
        onClose={() => setUploadOpen(false)}
        onUploaded={(video) => setSelectedVideoId(video.id)}
      />

      <VideoDeleteDialog
        isOpen={!!deleteTarget}
        videoTitle={deleteTarget?.title ?? ''}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}