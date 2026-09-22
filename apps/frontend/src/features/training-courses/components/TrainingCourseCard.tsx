import { Link } from 'react-router-dom';
import { BookOpen, Pencil, Trash2, Archive, Upload } from 'lucide-react';
import type { TrainingCourseStatus } from '@yunexacademy/shared-types';
import { TrainingCourseStatusBadge } from './TrainingCourseStatusBadge';
import { TrainingCourseLevelBadge } from './TrainingCourseLevelBadge';
import type { TrainingCourseListItem } from '../types/training-course.types';

interface Props {
  course: TrainingCourseListItem;
  onEdit: (course: TrainingCourseListItem) => void;
  onDelete: (course: TrainingCourseListItem) => void;
  onChangeStatus: (course: TrainingCourseListItem, status: TrainingCourseStatus) => void;
}

export function TrainingCourseCard({ course, onEdit, onDelete, onChangeStatus }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/training-courses/${course.id}`}
            className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors"
          >
            {course.title}
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {course.description || 'Sin descripción'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <TrainingCourseStatusBadge status={course.status} />
        <TrainingCourseLevelBadge level={course.level} />
      </div>

      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <p>
          {course.submoduleCount} submódulo{course.submoduleCount !== 1 ? 's' : ''} ·{' '}
          {course.videoCount} video{course.videoCount !== 1 ? 's' : ''}
        </p>
        <p>Por {course.createdByName}</p>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(course)}
          disabled={course.status === 'ARCHIVED'}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>

        {course.status === 'DRAFT' && (
          <button
            onClick={() => onChangeStatus(course, 'PUBLISHED')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Publicar
          </button>
        )}

        {course.status === 'PUBLISHED' && (
          <button
            onClick={() => onChangeStatus(course, 'ARCHIVED')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            Archivar
          </button>
        )}

        {course.status === 'DRAFT' && (
          <button
            onClick={() => onDelete(course)}
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