import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { ReorderItem } from '@yunexacademy/shared-types';

interface Props {
  items: ReorderItem[];
  onChange: (items: ReorderItem[]) => void;
}

function generateId(): string {
  return `r${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeOrder(items: ReorderItem[]): ReorderItem[] {
  return items.map((item, i) => ({ ...item, correctOrder: i }));
}

export function ReorderEditor({ items, onChange }: Props) {
  function addItem(): void {
    onChange(
      normalizeOrder([
        ...items,
        { id: generateId(), label: '', correctOrder: items.length },
      ])
    );
  }

  function removeItem(index: number): void {
    onChange(normalizeOrder(items.filter((_, i) => i !== index)));
  }

  function updateLabel(index: number, label: string): void {
    onChange(items.map((item, i) => (i === index ? { ...item, label } : item)));
  }

  function moveUp(index: number): void {
    if (index <= 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onChange(normalizeOrder(newItems));
  }

  function moveDown(index: number): void {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onChange(normalizeOrder(newItems));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Elementos en orden correcto
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar elemento
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs mb-3">
        Escribe los elementos en el orden correcto. Al estudiante se le mostrarán
        desordenados.
      </div>

      {items.length < 2 ? (
        <p className="text-xs text-gray-500 italic text-center py-4">
          Necesitas al menos 2 elementos
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center gap-1 flex-shrink-0">
                <GripVertical className="w-4 h-4 text-gray-300" />
                <span className="text-xs font-semibold text-gray-500 w-5">
                  {i + 1}.
                </span>
              </div>
              <input
                type="text"
                required
                value={item.label}
                onChange={(e) => updateLabel(i, e.target.value)}
                placeholder={`Elemento ${i + 1}`}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Subir"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Bajar"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}