import { Plus, Trash2 } from 'lucide-react';
import type { Dropdown } from '@yunexacademy/shared-types';

interface Props {
  template: string;
  dropdowns: Dropdown[];
  onChange: (data: { template: string; dropdowns: Dropdown[] }) => void;
}

function generateId(): string {
  return `d${Math.random().toString(36).slice(2, 8)}`;
}

export function DropdownEditor({ template, dropdowns, onChange }: Props) {
  function setTemplate(newTemplate: string): void {
    onChange({ template: newTemplate, dropdowns });
  }

  function addDropdown(): void {
    onChange({
      template,
      dropdowns: [
        ...dropdowns,
        { id: generateId(), options: ['', ''], correctAnswer: '' },
      ],
    });
  }

  function removeDropdown(index: number): void {
    onChange({
      template,
      dropdowns: dropdowns.filter((_, i) => i !== index),
    });
  }

  function updateDropdown(index: number, patch: Partial<Dropdown>): void {
    onChange({
      template,
      dropdowns: dropdowns.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    });
  }

  function updateOption(dropIndex: number, optIndex: number, value: string): void {
    const dropdown = dropdowns[dropIndex];
    const newOptions = dropdown.options.map((o, i) => (i === optIndex ? value : o));
    updateDropdown(dropIndex, { options: newOptions });
  }

  function addOption(dropIndex: number): void {
    const dropdown = dropdowns[dropIndex];
    updateDropdown(dropIndex, { options: [...dropdown.options, ''] });
  }

  function removeOption(dropIndex: number, optIndex: number): void {
    const dropdown = dropdowns[dropIndex];
    if (dropdown.options.length <= 2) return;
    const newOptions = dropdown.options.filter((_, i) => i !== optIndex);
    updateDropdown(dropIndex, { options: newOptions });
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plantilla con placeholders
        </label>
        <textarea
          required
          rows={3}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-sm"
          placeholder="Ej: El {{d1}} es el satélite natural de la {{d2}}."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs mb-3">
        Usa <code className="bg-white px-1 rounded">{'{{d1}}'}</code>,{' '}
        <code className="bg-white px-1 rounded">{'{{d2}}'}</code>, etc. en la
        plantilla. Abajo agrega las opciones de cada desplegable.
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Desplegables
        </label>
        <button
          type="button"
          onClick={addDropdown}
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar desplegable
        </button>
      </div>

      {dropdowns.length === 0 ? (
        <p className="text-xs text-gray-500 italic text-center py-4">
          Aún no hay desplegables definidos
        </p>
      ) : (
        <div className="space-y-3">
          {dropdowns.map((dropdown, di) => (
            <div
              key={dropdown.id}
              className="border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {`{{${dropdown.id}}}`}
                </code>
                <button
                  type="button"
                  onClick={() => removeDropdown(di)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Eliminar desplegable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                Marca con el radio cuál es la respuesta correcta.
              </p>

              <div className="space-y-1.5">
                {dropdown.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${dropdown.id}`}
                      checked={dropdown.correctAnswer === option && option !== ''}
                      onChange={() =>
                        updateDropdown(di, { correctAnswer: option })
                      }
                      className="w-4 h-4 text-brand-600"
                    />
                    <input
                      type="text"
                      required
                      value={option}
                      onChange={(e) => updateOption(di, oi, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder={`Opción ${oi + 1}`}
                    />
                    {dropdown.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(di, oi)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addOption(di)}
                className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                + Agregar opción
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
