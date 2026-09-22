import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface Pair {
  id: string;
  left: string;
  right: string;
}

interface Props {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
}

function generateId(): string {
  return `p${Math.random().toString(36).slice(2, 8)}`;
}

export function MatchPairsEditor({ pairs, onChange }: Props) {
  function addPair(): void {
    onChange([...pairs, { id: generateId(), left: '', right: '' }]);
  }

  function removePair(index: number): void {
    onChange(pairs.filter((_, i) => i !== index));
  }

  function updatePair(index: number, patch: Partial<Pair>): void {
    onChange(pairs.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Pares a emparejar
        </label>
        <button
          type="button"
          onClick={addPair}
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar par
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs mb-3">
        Escribe cada elemento de la izquierda con su pareja de la derecha. Al
        estudiante se le mostrarán las dos columnas desordenadas.
      </div>

      {pairs.length < 2 ? (
        <p className="text-xs text-gray-500 italic text-center py-4">
          Necesitas al menos 2 pares
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr,auto,1fr,auto] gap-2 items-center px-1">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Columna izquierda
            </span>
            <span></span>
            <span className="text-xs font-medium text-gray-500 uppercase">
              Columna derecha
            </span>
            <span></span>
          </div>
          {pairs.map((pair, i) => (
            <div
              key={pair.id}
              className="grid grid-cols-[1fr,auto,1fr,auto] gap-2 items-center"
            >
              <input
                type="text"
                required
                value={pair.left}
                onChange={(e) => updatePair(i, { left: e.target.value })}
                placeholder={`Izquierda ${i + 1}`}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={pair.right}
                onChange={(e) => updatePair(i, { right: e.target.value })}
                placeholder={`Derecha ${i + 1}`}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => removePair(i)}
                className="p-1.5 text-gray-400 hover:text-red-600"
                title="Eliminar par"
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