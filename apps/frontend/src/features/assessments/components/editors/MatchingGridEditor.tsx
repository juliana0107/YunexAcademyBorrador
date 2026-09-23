import { Plus, Minus, Check } from 'lucide-react';
import type { MatchingGridPayload } from '@yunexacademy/shared-types';

interface Props {
  payload: MatchingGridPayload;
  onChange: (payload: MatchingGridPayload) => void;
}

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

function buildEmpty(rows: number, cols: number): MatchingGridPayload {
  return {
    rowLabels: Array.from({ length: rows }, (_, i) => `Fila ${i + 1}`),
    columnLabels: Array.from({ length: cols }, (_, i) => `Col ${i + 1}`),
    correctCells: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => false)
    ),
  };
}

export function MatchingGridEditor({ payload, onChange }: Props) {
  function resize(newRows: number, newCols: number): void {
    if (newRows < 2 || newCols < 2) return;

    const rowLabels = Array.from({ length: newRows }, (_, i) =>
      i < payload.rowLabels.length ? payload.rowLabels[i] : `Fila ${i + 1}`
    );
    const columnLabels = Array.from({ length: newCols }, (_, i) =>
      i < payload.columnLabels.length ? payload.columnLabels[i] : `Col ${i + 1}`
    );
    const correctCells = Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) =>
        r < payload.correctCells.length &&
        c < (payload.correctCells[r]?.length ?? 0)
          ? payload.correctCells[r][c]
          : false
      )
    );

    onChange({ rowLabels, columnLabels, correctCells });
  }

  function updateRowLabel(index: number, value: string): void {
    onChange({
      ...payload,
      rowLabels: payload.rowLabels.map((l, i) => (i === index ? value : l)),
    });
  }

  function updateColumnLabel(index: number, value: string): void {
    onChange({
      ...payload,
      columnLabels: payload.columnLabels.map((l, i) =>
        i === index ? value : l
      ),
    });
  }

  function toggleCell(r: number, c: number): void {
    onChange({
      ...payload,
      correctCells: payload.correctCells.map((row, ri) =>
        ri === r
          ? row.map((val, ci) => (ci === c ? !val : val))
          : row
      ),
    });
  }

  const totalCorrect = payload.correctCells.reduce(
    (acc, row) => acc + row.filter(Boolean).length,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Cuadrícula
        </label>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Filas:</span>
            <button
              type="button"
              onClick={() => resize(payload.rowLabels.length - 1, payload.columnLabels.length)}
              disabled={payload.rowLabels.length <= 2}
              className="p-0.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-semibold w-4 text-center">
              {payload.rowLabels.length}
            </span>
            <button
              type="button"
              onClick={() => resize(payload.rowLabels.length + 1, payload.columnLabels.length)}
              className="p-0.5 text-gray-500 hover:text-gray-800"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Columnas:</span>
            <button
              type="button"
              onClick={() => resize(payload.rowLabels.length, payload.columnLabels.length - 1)}
              disabled={payload.columnLabels.length <= 2}
              className="p-0.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-semibold w-4 text-center">
              {payload.columnLabels.length}
            </span>
            <button
              type="button"
              onClick={() => resize(payload.rowLabels.length, payload.columnLabels.length + 1)}
              className="p-0.5 text-gray-500 hover:text-gray-800"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs mb-3">
        Edita las etiquetas de filas y columnas, y marca las celdas{' '}
        <strong>correctas</strong> con el ícono de check. El estudiante debe
        seleccionar todas las celdas correctas.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-200 bg-gray-50 p-1 w-40"></th>
              {payload.columnLabels.map((col, c) => (
                <th
                  key={c}
                  className="border border-gray-200 bg-gray-50 p-1 min-w-[120px]"
                >
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => updateColumnLabel(c, e.target.value)}
                    className="w-full px-2 py-1 text-xs font-medium text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payload.rowLabels.map((row, r) => (
              <tr key={r}>
                <th className="border border-gray-200 bg-gray-50 p-1">
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => updateRowLabel(r, e.target.value)}
                    className="w-full px-2 py-1 text-xs font-medium text-left border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </th>
                {payload.columnLabels.map((_, c) => {
                  const isCorrect = payload.correctCells[r]?.[c] ?? false;
                  return (
                    <td key={c} className="border border-gray-200 p-1">
                      <button
                        type="button"
                        onClick={() => toggleCell(r, c)}
                        className={`w-full h-9 flex items-center justify-center rounded transition-colors ${
                          isCorrect
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-white text-gray-300 hover:bg-gray-50'
                        }`}
                        title={isCorrect ? 'Celda correcta' : 'Marcar como correcta'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {totalCorrect} celda(s) marcada(s) como correcta(s)
      </p>
    </div>
  );
}

export function createEmptyMatchingGridPayload(): MatchingGridPayload {
  return buildEmpty(DEFAULT_ROWS, DEFAULT_COLS);
}