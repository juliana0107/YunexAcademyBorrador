import { Plus, Trash2 } from 'lucide-react';
import type { FillBlank } from '@yunexacademy/shared-types';

interface Props {
  blanks: FillBlank[];
  onChange: (blanks: FillBlank[]) => void;
}

function generateId(): string {
  return `b${Math.random().toString(36).slice(2, 8)}`;
}

export function FillInTheBlanksEditor({ blanks, onChange }: Props) {
  function addBlank(): void {
    onChange([
      ...blanks,
      { id: generateId(), correctAnswer: '', caseSensitive: false },
    ]);
  }

  function removeBlank(index: number): void {
    onChange(blanks.filter((_, i) => i !== index));
  }

  function updateBlank(index: number, patch: Partial<FillBlank>): void {
    onChange(blanks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Respuestas de los espacios
        </label>
        <button
          type="button"
          onClick={addBlank}
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar espacio
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs mb-3">
        En el enunciado, usa <code className="bg-white px-1 rounded">{'{{b1}}'}</code>,{' '}
        <code className="bg-white px-1 rounded">{'{{b2}}'}</code>, etc. para marcar
        cada espacio. Abajo define la respuesta correcta para cada uno.
      </div>

      {blanks.length === 0 ? (
        <p className="text-xs text-gray-500 italic text-center py-4">
          Aún no hay espacios definidos
        </p>
      ) : (
        <div className="space-y-2">
          {blanks.map((blank, i) => (
            <div
              key={blank.id}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
            >
              <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                {`{{${blank.id}}}`}
              </code>
              <input
                type="text"
                required
                value={blank.correctAnswer}
                onChange={(e) =>
                  updateBlank(i, { correctAnswer: e.target.value })
                }
                placeholder="Respuesta correcta"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-600 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={blank.caseSensitive}
                  onChange={(e) =>
                    updateBlank(i, { caseSensitive: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 text-brand-600"
                />
                Mayús.
              </label>
              <button
                type="button"
                onClick={() => removeBlank(i)}
                className="p-1.5 text-gray-400 hover:text-red-600"
                title="Eliminar espacio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}