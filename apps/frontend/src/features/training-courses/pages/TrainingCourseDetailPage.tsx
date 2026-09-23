import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Pencil,
  Trash2,
  Video as VideoIcon,
  Users,
} from 'lucide-react';
import type { TrainingCourseStatus } from '@yunexacademy/shared-types';
import { useTrainingCourse } from '../hooks/useTrainingCourses';
import {
  useChangeTrainingCourseStatus,
  useDeleteTrainingCourse,
} from '../hooks/useTrainingCourseMutations';
import { useSubmodules } from '@/features/submodules/hooks/useSubmodules';
import {
  useDeleteSubmodule,
  useChangeSubmoduleOrder,
} from '@/features/submodules/hooks/useSubmoduleMutations';
import { TrainingCourseStatusBadge } from '../components/TrainingCourseStatusBadge';
import { TrainingCourseLevelBadge } from '../components/TrainingCourseLevelBadge';
import { TrainingCourseFormModal } from '../components/TrainingCourseFormModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { SubmoduleList } from '../components/SubmoduleList';
import { SubmoduleFormModal } from '../components/SubmoduleFormModal';
import { SubmoduleDeleteDialog } from '../components/SubmoduleDeleteDialog';
import { AssessmentTab } from '../components/AssessmentTab';
import { extractErrorMessage } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { SubmoduleListItem } from '@/features/submodules/types/submodule.types';
import type { TrainingCourseListItem } from '../types/training-course.types';

export function TrainingCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const canEdit = user?.permissions?.includes('training-courses:write' as never) ?? false;
  const canDelete = user?.permissions?.includes('training-courses:delete' as never) ?? false;
  const canEditSubmodules =
    user?.permissions?.includes('submodules:write' as never) ?? false;

  const { data: course, isLoading: courseLoading } = useTrainingCourse(id);
  const { data: submodules = [], isLoading: submodulesLoading } = useSubmodules(id);

  const statusMutation = useChangeTrainingCourseStatus();
  const deleteCourseMutation = useDeleteTrainingCourse();

  const [activeTab, setActiveTab] = useState<'submodules' | 'assessments'>('submodules');
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deleteCourseTarget, setDeleteCourseTarget] =
    useState<TrainingCourseListItem | null>(null);
  const [submoduleModalOpen, setSubmoduleModalOpen] = useState(false);
  const [editingSubmodule, setEditingSubmodule] = useState<SubmoduleListItem | null>(null);
  const [deleteSubmoduleTarget, setDeleteSubmoduleTarget] =
    useState<SubmoduleListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const deleteSubmoduleMutation = useDeleteSubmodule(id ?? '');
  const changeOrderMutation = useChangeSubmoduleOrder(id ?? '');

  if (!id) return null;

  if (courseLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Cargando curso...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Curso no encontrado</p>
          <Link
            to="/training-courses"
            className="text-brand-600 hover:text-brand-700 font-medium text-sm"
          >
            ← Volver a cursos
          </Link>
        </div>
      </div>
    );
  }

  function openCreateSubmodule(): void {
    setEditingSubmodule(null);
    setSubmoduleModalOpen(true);
  }

  function openEditSubmodule(submodule: SubmoduleListItem): void {
    setEditingSubmodule(submodule);
    setSubmoduleModalOpen(true);
  }

  function closeSubmoduleModal(): void {
    setSubmoduleModalOpen(false);
    setEditingSubmodule(null);
  }

  async function confirmDeleteSubmodule(): Promise<void> {
    if (!deleteSubmoduleTarget) return;
    try {
      await deleteSubmoduleMutation.mutateAsync(deleteSubmoduleTarget.id);
      setDeleteSubmoduleTarget(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
      setDeleteSubmoduleTarget(null);
    }
  }

  async function handleStatusChange(status: TrainingCourseStatus): Promise<void> {
    if (!course) return;
    try {
      await statusMutation.mutateAsync({ id: course.id, status });
      setActionError(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function confirmDeleteCourse(): Promise<void> {
    if (!deleteCourseTarget) return;
    try {
      await deleteCourseMutation.mutateAsync(deleteCourseTarget.id);
      navigate('/training-courses');
    } catch (err) {
      setActionError(extractErrorMessage(err));
      setDeleteCourseTarget(null);
    }
  }

  async function moveSubmodule(
    submodule: SubmoduleListItem,
    direction: 'up' | 'down'
  ) {
    const currentIndex = submodules.findIndex((s) => s.id === submodule.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= submodules.length) return;

    const target = submodules[targetIndex];

    try {
      await Promise.all([
        changeOrderMutation.mutateAsync({ id: submodule.id, order: target.order }),
        changeOrderMutation.mutateAsync({ id: target.id, order: submodule.order }),
      ]);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/training-courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a cursos
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-3">{course.description || 'Sin descripción'}</p>
            <div className="flex flex-wrap gap-2">
              <TrainingCourseStatusBadge status={course.status} />
              <TrainingCourseLevelBadge level={course.level} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {canEdit && course.status !== 'ARCHIVED' && (
              <button
                onClick={() => setCourseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
            )}
            {canEdit && course.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange('PUBLISHED')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
              >
                Publicar curso
              </button>
            )}
            {canEdit && course.status === 'PUBLISHED' && (
              <button
                onClick={() => handleStatusChange('ARCHIVED')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Archivar
              </button>
            )}
            {canDelete && course.status === 'DRAFT' && (
              <button
                onClick={() => setDeleteCourseTarget(course)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-1">
              <VideoIcon className="w-3.5 h-3.5" />
              Submódulos
            </div>
            <p className="text-2xl font-bold text-gray-900">{course.submoduleCount}</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-1">
              <VideoIcon className="w-3.5 h-3.5" />
              Videos
            </div>
            <p className="text-2xl font-bold text-gray-900">{course.videoCount}</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-1">
              <Clock className="w-3.5 h-3.5" />
              Duración
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {course.estimatedDurationMinutes} min
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5" />
          Creado por {course.createdByName}
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('submodules')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'submodules'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Submódulos
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assessments'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Evaluaciones
          </button>
        </nav>
      </div>

      {activeTab === 'submodules' && (
        <SubmoduleList
          submodules={submodules}
          isLoading={submodulesLoading}
          canEdit={canEditSubmodules && course.status !== 'ARCHIVED'}
          onCreate={openCreateSubmodule}
          onEdit={openEditSubmodule}
          onDelete={setDeleteSubmoduleTarget}
          onMoveUp={(s) => moveSubmodule(s, 'up')}
          onMoveDown={(s) => moveSubmodule(s, 'down')}
        />
      )}

      {activeTab === 'assessments' && (
        <AssessmentTab
          courseId={id}
          canEdit={canEdit}
          courseIsArchived={course.status === 'ARCHIVED'}
        />
      )}

      <TrainingCourseFormModal
        isOpen={courseModalOpen}
        course={course}
        onClose={() => setCourseModalOpen(false)}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteCourseTarget}
        courseTitle={deleteCourseTarget?.title ?? ''}
        isDeleting={deleteCourseMutation.isPending}
        onConfirm={confirmDeleteCourse}
        onCancel={() => setDeleteCourseTarget(null)}
      />

      <SubmoduleFormModal
        isOpen={submoduleModalOpen}
        courseId={id}
        submodule={editingSubmodule}
        onClose={closeSubmoduleModal}
      />

      <SubmoduleDeleteDialog
        isOpen={!!deleteSubmoduleTarget}
        submoduleTitle={deleteSubmoduleTarget?.title ?? ''}
        isDeleting={deleteSubmoduleMutation.isPending}
        onConfirm={confirmDeleteSubmodule}
        onCancel={() => setDeleteSubmoduleTarget(null)}
      />
    </div>
  );
}