import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Upload,
  Eye,
  Clock,
  CheckSquare,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAssessment, useQuestions } from '../hooks/useAssessments';
import {
  useChangeAssessmentStatus,
  useDeleteAssessment,
  useDeleteQuestion,
} from '../hooks/useAssessmentMutations';
import { useTrainingCourse } from '@/features/training-courses/hooks/useTrainingCourses';
import { AssessmentStatusBadge } from '../components/AssessmentStatusBadge';
import { AssessmentFormModal } from '../components/AssessmentFormModal';
import { AssessmentDeleteDialog } from '../components/AssessmentDeleteDialog';
import { QuestionList } from '../components/QuestionList';
import { QuestionFormModal } from '../components/QuestionFormModal';
import { AssessmentPreviewModal } from '../components/AssessmentPreviewModal';
import { extractErrorMessage } from '@/features/auth/api/auth.api';
import type { QuestionListItem } from '../types/assessment.types';

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const canEdit = user?.permissions?.includes('assessments:write' as never) ?? false;
  const canDelete = user?.permissions?.includes('assessments:delete' as never) ?? false;

  const { data: assessment, isLoading: assessmentLoading } = useAssessment(id);
  const { data: questions = [], isLoading: questionsLoading } = useQuestions(id);
  const { data: course } = useTrainingCourse(assessment?.trainingCourseId);

  const statusMutation = useChangeAssessmentStatus(id ?? '', assessment?.trainingCourseId);
  const deleteMutation = useDeleteAssessment(assessment?.trainingCourseId ?? '');
  const deleteQuestionMutation = useDeleteQuestion(id ?? '');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionListItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!id) return null;

  if (assessmentLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Cargando evaluación...
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Evaluación no encontrada</p>
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

  async function handleDeleteQuestion(question: QuestionListItem): Promise<void> {
    if (!window.confirm(`¿Eliminar la pregunta "${question.statement}"?`)) return;
    try {
      await deleteQuestionMutation.mutateAsync(question.id);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleStatusChange(status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') {
    try {
      await statusMutation.mutateAsync(status);
      setActionError(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      await deleteMutation.mutateAsync(id!);
      // Navegar al curso
      window.location.href = `/training-courses/${assessment!.trainingCourseId}`;
    } catch (err) {
      setActionError(extractErrorMessage(err));
      setDeleteModalOpen(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {course && (
        <Link
          to={`/training-courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {course.title}
        </Link>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {assessment.title}
            </h1>
            {assessment.description && (
              <p className="text-gray-600 mb-3">{assessment.description}</p>
            )}
            <AssessmentStatusBadge status={assessment.status} />
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              <Eye className="w-4 h-4" />
              Vista previa
            </button>
            {canEdit && assessment.status !== 'ARCHIVED' && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
            )}
            {canEdit && assessment.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange('PUBLISHED')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Publicar
              </button>
            )}
            {canEdit && assessment.status === 'PUBLISHED' && (
              <button
                onClick={() => handleStatusChange('ARCHIVED')}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                <Archive className="w-4 h-4" />
                Archivar
              </button>
            )}
            {canDelete && assessment.status === 'DRAFT' && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <InfoCell
            icon={CheckSquare}
            label="Preguntas"
            value={String(assessment.questionCount)}
          />
          <InfoCell
            icon={CheckSquare}
            label="Nota mínima"
            value={`${assessment.passingScore}%`}
          />
          <InfoCell
            icon={RotateCcw}
            label="Intentos"
            value={String(assessment.maxAttempts)}
          />
          <InfoCell
            icon={assessment.timeLimitMinutes ? Clock : Shuffle}
            label={assessment.timeLimitMinutes ? 'Duración' : 'Barajar'}
            value={
              assessment.timeLimitMinutes
                ? `${assessment.timeLimitMinutes} min`
                : assessment.shuffleQuestions
                  ? 'Sí'
                  : 'No'
            }
          />
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">
          Preguntas ({questions.length})
        </h2>
        {canEdit && assessment.status !== 'ARCHIVED' && (
          <button
            onClick={() => {
              setEditingQuestion(null);
              setQuestionModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva pregunta
          </button>
        )}
      </div>

      <QuestionList
        questions={questions}
        isLoading={questionsLoading}
        canEdit={canEdit && assessment.status !== 'ARCHIVED'}
        onEdit={(q) => {
          setEditingQuestion(q);
          setQuestionModalOpen(true);
        }}
        onDelete={handleDeleteQuestion}
      />

      <AssessmentFormModal
        isOpen={editModalOpen}
        courseId={assessment.trainingCourseId}
        assessment={assessment}
        onClose={() => setEditModalOpen(false)}
      />

      <QuestionFormModal
        isOpen={questionModalOpen}
        assessmentId={id}
        question={editingQuestion}
        onClose={() => {
          setQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
      />

      <AssessmentPreviewModal
        isOpen={previewOpen}
        assessment={assessment}
        questions={questions}
        onClose={() => setPreviewOpen(false)}
      />

      <AssessmentDeleteDialog
        isOpen={deleteModalOpen}
        assessmentTitle={assessment.title}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

interface InfoCellProps {
  icon: typeof CheckSquare;
  label: string;
  value: string;
}

function InfoCell({ icon: Icon, label, value }: InfoCellProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}