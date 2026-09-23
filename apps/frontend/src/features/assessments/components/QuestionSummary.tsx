import type {
  FillInTheBlanksPayload,
  DropdownPayload,
  ReorderPayload,
  TableFillPayload,
  DragAndDropPayload,
  CategorizePayload,
  MatchPairsPayload,
  MatchingGridPayload,
  TrueFalsePayload,
  OpenAnswerPayload,
} from '@yunexacademy/shared-types';
import type {
  QuestionListItem,
  QuestionOptionData,
} from '../types/assessment.types';

interface Props {
  question: QuestionListItem;
}

// ────────────────────────────────────────────────────────────
// Sub-renders por tipo
// ────────────────────────────────────────────────────────────

function OptionsSummary({ options }: { options: QuestionOptionData[] }) {
  return (
    <ul className="space-y-1.5">
      {options.map((opt, i) => (
        <li
          key={opt.id ?? i}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
            opt.isCorrect
              ? 'bg-green-50 text-green-800 font-medium'
              : 'bg-gray-50 text-gray-700'
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              opt.isCorrect
                ? 'border-green-600 bg-green-600'
                : 'border-gray-300'
            }`}
          />
          {opt.text}
        </li>
      ))}
    </ul>
  );
}

function TrueFalseSummary({ correct }: { correct: boolean }) {
  return (
    <p className="text-xs text-gray-500">
      Respuesta correcta:{' '}
      <strong className="text-green-700">
        {correct ? 'Verdadero' : 'Falso'}
      </strong>
    </p>
  );
}

function OpenAnswerSummary({ min, max }: { min?: number; max?: number }) {
  return (
    <p className="text-xs text-gray-500">
      Requiere revisión manual
      {min !== undefined && <> · Mín. {min} palabras</>}
      {max !== undefined && <> · Máx. {max} palabras</>}
    </p>
  );
}

function FillInTheBlanksSummary({
  payload,
}: {
  payload: FillInTheBlanksPayload;
}) {
  return (
    <div className="text-xs text-gray-600 space-y-1">
      <p className="font-medium text-gray-500">
        Espacios ({payload.blanks.length})
      </p>
      {payload.blanks.map((b) => (
        <p key={b.id} className="bg-gray-50 px-2 py-1 rounded">
          <code className="bg-white px-1 rounded">{`{{${b.id}}}`}</code>{' '}
          → <strong className="text-green-700">{b.correctAnswer}</strong>
          {b.caseSensitive && (
            <span className="ml-2 text-amber-600">(sensible a mayúsculas)</span>
          )}
        </p>
      ))}
    </div>
  );
}

function DropdownSummary({ payload }: { payload: DropdownPayload }) {
  return (
    <div className="text-xs text-gray-600 space-y-1">
      <p className="font-medium text-gray-500">
        Plantilla: <span className="font-normal italic">{payload.template}</span>
      </p>
      <p className="font-medium text-gray-500 mt-2">
        Desplegables ({payload.dropdowns.length})
      </p>
      {payload.dropdowns.map((d) => (
        <p key={d.id} className="bg-gray-50 px-2 py-1 rounded">
          <code className="bg-white px-1 rounded">{`{{${d.id}}}`}</code>{' '}
          → <strong className="text-green-700">{d.correctAnswer}</strong>{' '}
          <span className="text-gray-400">({d.options.join(', ')})</span>
        </p>
      ))}
    </div>
  );
}

function ReorderSummary({ payload }: { payload: ReorderPayload }) {
  const sorted = [...payload.items].sort(
    (a, b) => a.correctOrder - b.correctOrder
  );
  return (
    <div className="text-xs text-gray-600">
      <p className="font-medium text-gray-500 mb-1">Orden correcto</p>
      <ol className="list-decimal list-inside space-y-0.5 bg-gray-50 px-3 py-2 rounded">
        {sorted.map((it) => (
          <li key={it.id} className="text-gray-700">
            {it.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function TableFillSummary({ payload }: { payload: TableFillPayload }) {
  return (
    <div className="text-xs text-gray-600">
      <p className="font-medium text-gray-500 mb-2">
        Tabla {payload.rows}×{payload.columns} · {payload.blanks.length}{' '}
        espacio(s)
      </p>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <tbody>
            {Array.from({ length: payload.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: payload.columns }).map((_, c) => {
                  const index = r * payload.columns + c;
                  const cell = payload.cells[index];
                  const blank = payload.blanks.find(
                    (b) => b.row === r && b.column === c
                  );
                  return (
                    <td
                      key={c}
                      className={`border border-gray-300 px-2 py-1 min-w-[60px] ${
                        cell?.isHeader ? 'bg-gray-100 font-semibold' : ''
                      } ${blank ? 'bg-yellow-50' : ''}`}
                    >
                      {blank ? (
                        <span className="text-green-700">
                          {blank.correctAnswer}
                        </span>
                      ) : (
                        cell?.value || ' '
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DragAndDropSummary({ payload }: { payload: DragAndDropPayload }) {
  return (
    <div className="text-xs text-gray-600 space-y-1">
      <p className="font-medium text-gray-500">
        Zonas: {payload.zones.map((z) => z.label).join(' · ')}
      </p>
      <div className="space-y-1">
        {payload.items.map((it) => {
          const zone = payload.zones.find((z) => z.id === it.correctZoneId);
          return (
            <p key={it.id} className="bg-gray-50 px-2 py-1 rounded">
              <strong>{it.label}</strong>
              <span className="text-gray-400"> → {zone?.label ?? '?'}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

function CategorizeSummary({ payload }: { payload: CategorizePayload }) {
  return (
    <div className="text-xs text-gray-600 space-y-2">
      {payload.categories.map((cat) => {
        const items = payload.items.filter(
          (it) => it.correctCategoryId === cat.id
        );
        return (
          <div key={cat.id} className="bg-gray-50 px-2 py-1 rounded">
            <strong className="text-gray-700">{cat.name}</strong>
            <span className="text-gray-400">
              {' '}
              → {items.map((i) => i.label).join(', ') || '(vacío)'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MatchPairsSummary({ payload }: { payload: MatchPairsPayload }) {
  return (
    <div className="text-xs text-gray-600 space-y-1">
      {payload.pairs.map((p) => (
        <p key={p.id} className="bg-gray-50 px-2 py-1 rounded flex gap-2">
          <span className="font-medium">{p.left}</span>
          <span className="text-gray-400">↔</span>
          <span className="text-green-700">{p.right}</span>
        </p>
      ))}
    </div>
  );
}

function MatchingGridSummary({ payload }: { payload: MatchingGridPayload }) {
  return (
    <div className="text-xs text-gray-600">
      <p className="font-medium text-gray-500 mb-2">
        Cuadrícula {payload.rowLabels.length}×{payload.columnLabels.length}
      </p>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 px-2 py-1"></th>
              {payload.columnLabels.map((c, i) => (
                <th
                  key={i}
                  className="border border-gray-300 bg-gray-50 px-2 py-1 font-medium"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payload.rowLabels.map((r, ri) => (
              <tr key={ri}>
                <th className="border border-gray-300 bg-gray-50 px-2 py-1 font-medium text-left">
                  {r}
                </th>
                {payload.columnLabels.map((_, ci) => (
                  <td
                    key={ci}
                    className={`border border-gray-300 px-2 py-1 text-center ${
                      payload.correctCells[ri]?.[ci]
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {payload.correctCells[ri]?.[ci] ? '✓' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────

export function QuestionSummary({ question }: Props) {
  const { type, payload, options } = question;

  if (options && options.length > 0) {
    return <OptionsSummary options={options} />;
  }

  switch (type) {
    case 'TRUE_FALSE':
      return (
        <TrueFalseSummary
          correct={Boolean((payload as unknown as TrueFalsePayload).correctAnswer)}
        />
      );
    case 'OPEN_ANSWER': {
      const p = payload as unknown as OpenAnswerPayload;
      return <OpenAnswerSummary min={p.minWords} max={p.maxWords} />;
    }
    case 'FILL_IN_THE_BLANKS':
      return (
        <FillInTheBlanksSummary
          payload={payload as unknown as FillInTheBlanksPayload}
        />
      );
    case 'DROPDOWN':
      return (
        <DropdownSummary payload={payload as unknown as DropdownPayload} />
      );
    case 'REORDER':
      return <ReorderSummary payload={payload as unknown as ReorderPayload} />;
    case 'TABLE_FILL':
      return (
        <TableFillSummary payload={payload as unknown as TableFillPayload} />
      );
    case 'DRAG_AND_DROP':
      return (
        <DragAndDropSummary
          payload={payload as unknown as DragAndDropPayload}
        />
      );
    case 'CATEGORIZE':
      return (
        <CategorizeSummary payload={payload as unknown as CategorizePayload} />
      );
    case 'MATCH_PAIRS':
      return (
        <MatchPairsSummary payload={payload as unknown as MatchPairsPayload} />
      );
    case 'MATCHING_GRID':
      return (
        <MatchingGridSummary
          payload={payload as unknown as MatchingGridPayload}
        />
      );
    default:
      return null;
  }
}