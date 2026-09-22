import { useState } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import type {
  TrainingCourseStatus,
  TrainingCourseLevel,
} from '@yunexacademy/shared-types';
import { useTrainingCourses } from '../hooks/useTrainingCourses';
import {
  useDeleteTrainingCourse,
  useChangeTrainingCourseStatus,
} from '../hooks/useTrainingCourseMutations';
import { TrainingCourseCard } from '../components/TrainingCourseCard';
import { TrainingCourseFormModal } from '../components/TrainingCourseFormModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { extractErrorMessage } from '@/lib/errors';
import type { TrainingCourseListItem } from '../types/training-course.types';

const STATUS_OPTIONS: { value: TrainingCourseStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Borradores' },
  { value: 'PUBLISHED', label: 'Publicados' },
  { value: 'ARCHIVED', label: 'Archivados' },
];

const LEVEL_OPTIONS: { value: TrainingCourseLevel | ''; label: string }[] = [
  { value: '', label: 'Todos los niveles' },
  { value: 'BEGINNER', label: 'Principiante' },
  { value: 'INTERMEDIATE', label: 'Intermedio' },
  { value: 'ADVANCED', label: 'Avanzado' },
];

export function TrainingCourseListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrainingCourseStatus | ''>('');
  const [levelFilter, setLevelFilter] = useState<TrainingCourseLevel | ''>('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourseListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingCourseListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filters = {
    search: search || undefined,
    status: statusFilter || undefined,
    level: levelFilter || undefined,
    page,
    limit: 12,
  };

  const { data, isLoading } = useTrainingCourses(filters);
  const deleteMutation = useDeleteTrainingCourse();
  const statusMutation = useChangeTrainingCourseStatus();

  function openCreate(): void {
    setEditingCourse(null);
    setModalOpen(true);
  }

  function openEdit(course: TrainingCourseListItem): void {
    setEditingCourse(course);
    setModalOpen(true);
  }

  function closeModal(): void {
    setModalOpen(false);
    setEditingCourse(null);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
      setDeleteTarget(null);
    }
  }

  async function handleStatusChange(
    course: TrainingCourseListItem,
    status: TrainingCourseStatus
  ): Promise<void> {
    try {
      await statusMutation.mutateAsync({ id: course.id, status });
      setActionError(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  const courses = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los cursos de formación de la plataforma
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo curso
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TrainingCourseStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value as TrainingCourseLevel | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Cargando cursos...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">
            {search || statusFilter || levelFilter
              ? 'No se encontraron cursos con esos filtros'
              : 'Aún no hay cursos creados'}
          </p>
          {!search && !statusFilter && !levelFilter && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear el primer curso
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <TrainingCourseCard
                key={course.id}
                course={course}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onChangeStatus={handleStatusChange}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">{total} curso(s) en total</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <TrainingCourseFormModal
        isOpen={modalOpen}
        course={editingCourse}
        onClose={closeModal}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        courseTitle={deleteTarget?.title ?? ''}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}