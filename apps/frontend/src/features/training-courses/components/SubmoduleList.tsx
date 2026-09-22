import { Plus, Pencil, Trash2, Video, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import type { SubmoduleListItem } from '@/features/submodules/types/submodule.types';

interface Props {
  submodules: SubmoduleListItem[];
  isLoading: boolean;
  canEdit: boolean;
  onCreate: () => void;
  onEdit: (submodule: SubmoduleListItem) => void;
  onDelete: (submodule: SubmoduleListItem) => void;
  onMoveUp: (submodule: SubmoduleListItem) => void;
  onMoveDown: (submodule: SubmoduleListItem) => void;
}

export function SubmoduleList({
  submodules,
  isLoading,
  canEdit,
  onCreate,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Cargando submódulos...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Submódulos</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {submodules.length} submódulo{submodules.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo submódulo
          </button>
        )}
      </div>

      {submodules.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">
            Este curso aún no tiene submódulos
          </p>
          {canEdit && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primer submódulo
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {submodules.map((submodule, index) => (
            <li
              key={submodule.id}
              className="p-5 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900">
                    {submodule.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {submodule.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      {submodule.videoCount} video
                      {submodule.videoCount !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {submodule.estimatedDurationMinutes} min
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onMoveUp(submodule)}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Subir"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMoveDown(submodule)}
                      disabled={index === submodules.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Bajar"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(submodule)}
                      className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(submodule)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}