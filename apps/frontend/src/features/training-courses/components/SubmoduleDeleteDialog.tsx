import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  submoduleTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmoduleDeleteDialog({
  isOpen,
  submoduleTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Eliminar submódulo</h3>
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que quieres eliminar <strong>{submoduleTitle}</strong>? Esta
              acción no se puede deshacer.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}