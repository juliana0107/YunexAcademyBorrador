import { Plus, Trash2 } from 'lucide-react';
import type {
  DragAndDropPayload,
  DragAndDropZone,
  DragAndDropItem,
} from '@yunexacademy/shared-types';

interface Props {
  payload: DragAndDropPayload;
  onChange: (payload: DragAndDropPayload) => void;
}

function generateZoneId(): string {
  return `z${Math.random().toString(36).slice(2, 8)}`;
}

function generateItemId(): string {
  return `it${Math.random().toString(36).slice(2, 8)}`;
}

export function DragAndDropEditor({ payload, onChange }: Props) {
  function addZone(): void {
    onChange({
      ...payload,
      zones: [
        ...payload.zones,
        { id: generateZoneId(), label: '' },
      ],
    });
  }

  function removeZone(index: number): void {
    const removed = payload.zones[index];
    onChange({
      zones: payload.zones.filter((_, i) => i !== index),
      items: payload.items.filter((it) => it.correctZoneId !== removed.id),
    });
  }

  function updateZone(index: number, label: string): void {
    onChange({
      ...payload,
      zones: payload.zones.map((z, i) => (i === index ? { ...z, label } : z)),
    });
  }

  function addItem(): void {
    if (payload.zones.length === 0) return;
    onChange({
      ...payload,
      items: [
        ...payload.items,
        {
          id: generateItemId(),
          label: '',
          correctZoneId: payload.zones[0].id,
        },
      ],
    });
  }

  function removeItem(index: number): void {
    onChange({
      ...payload,
      items: payload.items.filter((_, i) => i !== index),
    });
  }

  function updateItem(index: number, patch: Partial<DragAndDropItem>): void {
    onChange({
      ...payload,
      items: payload.items.map((it, i) =>
        i === index ? { ...it, ...patch } : it
      ),
    });
  }

  return (
    <div className="space-y-5">
      {/* Zonas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Zonas de destino
          </label>
          <button
            type="button"
            onClick={addZone}
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar zona
          </button>
        </div>

        {payload.zones.length < 2 ? (
          <p className="text-xs text-gray-500 italic text-center py-3 bg-gray-50 rounded-lg">
            Necesitas al menos 2 zonas
          </p>
        ) : (
          <div className="space-y-2">
            {payload.zones.map((zone: DragAndDropZone, i: number) => (
              <div key={zone.id} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  required
                  value={zone.label}
                  onChange={(e) => updateZone(i, e.target.value)}
                  placeholder={`Zona ${i + 1}`}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeZone(i)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Eliminar zona"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Elementos a arrastrar
          </label>
          <button
            type="button"
            onClick={addItem}
            disabled={payload.zones.length < 2}
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar elemento
          </button>
        </div>

        {payload.zones.length < 2 ? (
          <p className="text-xs text-gray-500 italic text-center py-3 bg-gray-50 rounded-lg">
            Primero agrega al menos 2 zonas
          </p>
        ) : payload.items.length < 2 ? (
          <p className="text-xs text-gray-500 italic text-center py-3 bg-gray-50 rounded-lg">
            Necesitas al menos 2 elementos
          </p>
        ) : (
          <div className="space-y-2">
            {payload.items.map((item: DragAndDropItem, i: number) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white"
              >
                <input
                  type="text"
                  required
                  value={item.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  placeholder={`Elemento ${i + 1}`}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                  value={item.correctZoneId}
                  onChange={(e) =>
                    updateItem(i, { correctZoneId: e.target.value })
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {payload.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label || '(sin nombre)'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Eliminar elemento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function createEmptyDragAndDropPayload(): DragAndDropPayload {
  return { zones: [], items: [] };
}