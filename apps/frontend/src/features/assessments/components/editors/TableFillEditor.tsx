import { Plus, Minus, Type, Lock } from 'lucide-react';
import type { TableFillPayload, TableFillCell } from '@yunexacademy/shared-types';

interface Props {
  payload: TableFillPayload;
  onChange: (payload: TableFillPayload) => void;
}

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

function emptyCell(): TableFillCell {
  return { value: '', isHeader: false };
}

function buildEmptyPayload(rows: number, cols: number): TableFillPayload {
  const cells: TableFillCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        value: '',
        isHeader: r === 0, // primera fila = encabezado por defecto
      });
    }
  }
  return { rows, columns: cols, cells, blanks: [] };
}

function idx(row: number, col: number, cols: number): number {
  return row * cols + col;
}

export function TableFillEditor({ payload, onChange }: Props) {
  function isBlank(row: number, col: number): boolean {
    return payload.blanks.some((b) => b.row === row && b.column === col);
  }

  function getBlank(row: number, col: number): string {
    return (
      payload.blanks.find((b) => b.row === row && b.column === col)
        ?.correctAnswer ?? ''
    );
  }

  function toggleBlank(row: number, col: number): void {
    if (isBlank(row, col)) {
      onChange({
        ...payload,
        blanks: payload.blanks.filter(
          (b) => !(b.row === row && b.column === col)
        ),
      });
    } else {
      onChange({
        ...payload,
        blanks: [...payload.blanks, { row, column: col, correctAnswer: '' }],
      });
    }
  }

  function setBlankAnswer(row: number, col: number, answer: string): void {
    onChange({
      ...payload,
      blanks: payload.blanks.map((b) =>
        b.row === row && b.column === col ? { ...b, correctAnswer: answer } : b
      ),
    });
  }

  function updateCellValue(row: number, col: number, value: string): void {
    const index = idx(row, col, payload.columns);
    const newCells = payload.cells.map((c, i) =>
      i === index ? { ...c, value } : c
    );
    onChange({ ...payload, cells: newCells });
  }

  function toggleHeader(row: number, col: number): void {
    const index = idx(row, col, payload.columns);
    const newCells = payload.cells.map((c, i) =>
      i === index ? { ...c, isHeader: !c.isHeader } : c
    );
    onChange({ ...payload, cells: newCells });
  }

  function resize(newRows: number, newCols: number): void {
    if (newRows < 1 || newCols < 1) return;
    // Reconstruir matriz preservando celdas existentes
    const newCells: TableFillCell[] = [];
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const oldIndex = r < payload.rows && c < payload.columns
          ? idx(r, c, payload.columns)
          : -1;
        newCells.push(
          oldIndex >= 0 ? payload.cells[oldIndex] : emptyCell()
        );
      }
    }
    const newBlanks = payload.blanks.filter(
      (b) => b.row < newRows && b.column < newCols
    );
    onChange({
      rows: newRows,
      columns: newCols,
      cells: newCells,
      blanks: newBlanks,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Tabla
        </label>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Filas:</span>
            <button
              type="button"
              onClick={() => resize(payload.rows - 1, payload.columns)}
              disabled={payload.rows <= 1}
              className="p-0.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-semibold w-4 text-center">{payload.rows}</span>
            <button
              type="button"
              onClick={() => resize(payload.rows + 1, payload.columns)}
              className="p-0.5 text-gray-500 hover:text-gray-800"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Columnas:</span>
            <button
              type="button"
              onClick={() => resize(payload.rows, payload.columns - 1)}
              disabled={payload.columns <= 1}
              className="p-0.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-semibold w-4 text-center">
              {payload.columns}
            </span>
            <button
              type="button"
              onClick={() => resize(payload.rows, payload.columns + 1)}
              className="p-0.5 text-gray-500 hover:text-gray-800"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs mb-3">
        Escribe el contenido de cada celda. Usa el botón de candado para marcar
        celdas como <strong>espacios vacíos</strong> que el estudiante debe
        completar. El ícono <Type className="w-3 h-3 inline" /> marca celdas
        como encabezado.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <tbody>
            {Array.from({ length: payload.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: payload.columns }).map((_, c) => {
                  const index = idx(r, c, payload.columns);
                  const cell = payload.cells[index] ?? emptyCell();
                  const blank = isBlank(r, c);
                  return (
                    <td
                      key={c}
                      className={`border border-gray-300 p-0 ${
                        cell.isHeader ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => toggleHeader(r, c)}
                          className={`p-1.5 border-r border-gray-200 hover:bg-gray-100 flex-shrink-0 ${
                            cell.isHeader ? 'text-brand-600' : 'text-gray-300'
                          }`}
                          title="Marcar como encabezado"
                        >
                          <Type className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          value={blank ? '' : cell.value}
                          onChange={(e) => updateCellValue(r, c, e.target.value)}
                          disabled={blank}
                          placeholder={blank ? '— vacío —' : ''}
                          className={`flex-1 min-w-0 px-2 py-1 text-sm focus:outline-none ${
                            cell.isHeader ? 'font-semibold' : ''
                          } ${blank ? 'bg-yellow-50 text-gray-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleBlank(r, c)}
                          className={`p-1.5 border-l border-gray-200 hover:bg-gray-100 flex-shrink-0 ${
                            blank ? 'text-amber-600' : 'text-gray-300'
                          }`}
                          title="Marcar como espacio vacío"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {blank && (
                        <div className="border-t border-gray-200 px-2 py-1 bg-yellow-50">
                          <input
                            type="text"
                            required
                            value={getBlank(r, c)}
                            onChange={(e) =>
                              setBlankAnswer(r, c, e.target.value)
                            }
                            placeholder="Respuesta correcta"
                            className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {payload.blanks.length} espacio(s) a completar
      </p>
    </div>
  );
}

// Helper para inicializar el payload
export function createEmptyTableFillPayload(): TableFillPayload {
  return buildEmptyPayload(DEFAULT_ROWS, DEFAULT_COLS);
}