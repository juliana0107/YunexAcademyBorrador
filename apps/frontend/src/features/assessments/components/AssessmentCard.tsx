import { Link } from 'react-router-dom';
import { ClipboardList, Pencil, Trash2, Archive, Upload } from 'lucide-react';
import type { AssessmentStatus } from '@yunexacademy/shared-types';
import { AssessmentStatusBadge } from './AssessmentStatusBadge';
import type { AssessmentListItem } from '../types/assessment.types';

interface Props {
  assessment: AssessmentListItem;
  onEdit: (assessment: AssessmentListItem) => void;
  onDelete: (assessment: AssessmentListItem) => void;
  onChangeStatus: (assessment: AssessmentListItem, status: AssessmentStatus) => void;
}

export function AssessmentCard({
  assessment,
  onEdit,
  onDelete,
  onChangeStatus,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/assessments/${assessment.id}`}
            className="text-base font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
          >
            {assessment.title}
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {assessment.description || 'Sin descripción'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <AssessmentStatusBadge status={assessment.status} />
        <span className="text-xs text-gray-500">
          {assessment.questionCount} pregunta{assessment.questionCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-gray-500">
          {assessment.passingScore}% para aprobar
        </span>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(assessment)}
          disabled={assessment.status === 'ARCHIVED'}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>

        {assessment.status === 'DRAFT' && (
          <button
            onClick={() => onChangeStatus(assessment, 'PUBLISHED')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Publicar
          </button>
        )}

        {assessment.status === 'PUBLISHED' && (
          <button
            onClick={() => onChangeStatus(assessment, 'ARCHIVED')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            Archivar
          </button>
        )}

        {assessment.status === 'DRAFT' && (
          <button
            onClick={() => onDelete(assessment)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}