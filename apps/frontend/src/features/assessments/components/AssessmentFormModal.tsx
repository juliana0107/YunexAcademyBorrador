import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useCreateAssessment, useUpdateAssessment } from '../hooks/useAssessmentMutations';
import { extractErrorMessage } from '@/features/auth/api/auth.api';
import type { AssessmentListItem } from '../types/assessment.types';

interface Props {
  isOpen: boolean;
  courseId: string;
  assessment: AssessmentListItem | null;
  onClose: () => void;
}

export function AssessmentFormModal({ isOpen, courseId, assessment, onClose }: Props) {
  const isEditing = !!assessment;
  const createMutation = useCreateAssessment(courseId);
  const updateMutation = useUpdateAssessment(assessment?.id ?? '', courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title);
      setDescription(assessment.description);
      setPassingScore(assessment.passingScore);
      setMaxAttempts(assessment.maxAttempts);
      setTimeLimitMinutes(
        assessment.timeLimitMinutes ? String(assessment.timeLimitMinutes) : ''
      );
      setShuffleQuestions(assessment.shuffleQuestions);
    } else {
      setTitle('');
      setDescription('');
      setPassingScore(70);
      setMaxAttempts(3);
      setTimeLimitMinutes('');
      setShuffleQuestions(false);
    }
    setError(null);
  }, [assessment, isOpen]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    const timeLimit = timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : null;

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          title,
          description,
          passingScore,
          maxAttempts,
          timeLimitMinutes: timeLimit,
          shuffleQuestions,
        });
      } else {
        await createMutation.mutateAsync({
          trainingCourseId: courseId,
          title,
          description,
          passingScore,
          maxAttempts,
          timeLimitMinutes: timeLimit,
          shuffleQuestions,
        });
      }
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (!isOpen) return null;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar evaluación' : 'Nueva evaluación'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota mínima (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intentos máximos
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo límite (minutos)
            </label>
            <input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
              placeholder="Sin límite"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Deja vacío para no poner límite de tiempo.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">
              Barajar preguntas en cada intento
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 rounded-lg transition-colors"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear evaluación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}