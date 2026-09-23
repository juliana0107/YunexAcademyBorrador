import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import type { AssessmentStatus } from '@yunexacademy/shared-types';
import { useAssessments } from '@/features/assessments/hooks/useAssessments';
import {
  useChangeAssessmentStatus,
  useDeleteAssessment,
} from '@/features/assessments/hooks/useAssessmentMutations';
import { AssessmentCard } from '@/features/assessments/components/AssessmentCard';
import { AssessmentFormModal } from '@/features/assessments/components/AssessmentFormModal';
import { AssessmentDeleteDialog } from '@/features/assessments/components/AssessmentDeleteDialog';
import { extractErrorMessage } from '@/features/auth/api/auth.api';
import type { AssessmentListItem } from '@/features/assessments/types/assessment.types';

interface Props {
  courseId: string;
  canEdit: boolean;
  courseIsArchived: boolean;
}

export function AssessmentTab({ courseId, canEdit, courseIsArchived }: Props) {
  const { data: assessments = [], isLoading } = useAssessments(courseId);
  const statusMutation = useChangeAssessmentStatus('', courseId);
  const deleteMutation = useDeleteAssessment(courseId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssessmentListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusChange(
    assessment: AssessmentListItem,
    status: AssessmentStatus
  ): Promise<void> {
    try {
      // Creamos un mutation ad-hoc usando el hook original
      // Como el hook está atado a un id, hacemos un fallback usando el API directo
      const { changeAssessmentStatus } = await import(
        '@/features/assessments/api/assessments.api'
      );
      await changeAssessmentStatus(assessment.id, status);
      setActionError(null);
      // Refrescar
      window.location.reload();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Evaluaciones ({assessments.length})
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestiona las evaluaciones asociadas a este curso
          </p>
        </div>
        {canEdit && !courseIsArchived && (
          <button
            onClick={() => {
              setEditingAssessment(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva evaluación
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Cargando evaluaciones...
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-gray-500 mb-4">
            Este curso aún no tiene evaluaciones
          </p>
          {canEdit && !courseIsArchived && (
            <button
              onClick={() => {
                setEditingAssessment(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear la primera evaluación
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onEdit={(a) => {
                setEditingAssessment(a);
                setFormOpen(true);
              }}
              onDelete={setDeleteTarget}
              onChangeStatus={handleStatusChange}
            />
          ))}
        </div>
      )}

      <AssessmentFormModal
        isOpen={formOpen}
        courseId={courseId}
        assessment={editingAssessment}
        onClose={() => {
          setFormOpen(false);
          setEditingAssessment(null);
        }}
      />

      <AssessmentDeleteDialog
        isOpen={!!deleteTarget}
        assessmentTitle={deleteTarget?.title ?? ''}
        isDeleting={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}