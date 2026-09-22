import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  useCreateSubmodule,
  useUpdateSubmodule,
} from '@/features/submodules/hooks/useSubmoduleMutations';
import { extractErrorMessage } from '@/lib/errors';
import type { SubmoduleListItem } from '@/features/submodules/types/submodule.types';

interface Props {
  isOpen: boolean;
  courseId: string;
  submodule: SubmoduleListItem | null;
  onClose: () => void;
}

export function SubmoduleFormModal({ isOpen, courseId, submodule, onClose }: Props) {
  const isEditing = !!submodule;
  const createMutation = useCreateSubmodule(courseId);
  const updateMutation = useUpdateSubmodule(courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submodule) {
      setTitle(submodule.title);
      setDescription(submodule.description);
      setDuration(submodule.estimatedDurationMinutes);
    } else {
      setTitle('');
      setDescription('');
      setDuration(0);
    }
    setError(null);
  }, [submodule, isOpen]);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: submodule.id,
          input: {
            title,
            description,
            estimatedDurationMinutes: duration,
          },
        });
      } else {
        await createMutation.mutateAsync({
          trainingCourseId: courseId,
          title,
          description,
          estimatedDurationMinutes: duration,
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
            {isEditing ? 'Editar submódulo' : 'Nuevo submódulo'}
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
              placeholder="Ej: Módulo 1: Introducción"
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
              placeholder="Descripción breve del módulo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración estimada (minutos)
            </label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se recalcula automáticamente cuando los videos tengan duración.
            </p>
          </div>

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
                  : 'Crear submódulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}