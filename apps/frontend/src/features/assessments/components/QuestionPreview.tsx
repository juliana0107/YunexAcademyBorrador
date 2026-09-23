import type {
  OpenAnswerPayload,
  FillInTheBlanksPayload,
  DropdownPayload,
  ReorderPayload,
  TableFillPayload,
  DragAndDropPayload,
  CategorizePayload,
  MatchPairsPayload,
  MatchingGridPayload,
} from '@yunexacademy/shared-types';
import type {
  QuestionListItem,
  QuestionOptionData,
} from '../types/assessment.types';

interface Props {
  question: QuestionListItem;
}

// ────────────────────────────────────────────────────────────
// Sub-renders por tipo (deshabilitados, solo visuales)
// ────────────────────────────────────────────────────────────

function OptionsPreview({
  question,
  options,
}: {
  question: QuestionListItem;
  options: QuestionOptionData[];
}) {
  const inputType =
    question.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox';
  return (
    <div className="ml-11 space-y-2">
      {options.map((opt, i) => (
        <label
          key={opt.id ?? i}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-brand-300 cursor-pointer transition-colors"
        >
          <input
            type={inputType}
            name={`q-${question.id}`}
            disabled
            className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-800">{opt.text}</span>
        </label>
      ))}
    </div>
  );
}

function TrueFalsePreview({ question }: { question: QuestionListItem }) {
  return (
    <div className="ml-11 space-y-2">
      {['Verdadero', 'Falso'].map((label) => (
        <label
          key={label}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer"
        >
          <input
            type="radio"
            name={`q-${question.id}`}
            disabled
            className="w-4 h-4 text-brand-600 border-gray-300"
          />
          <span className="text-sm text-gray-800">{label}</span>
        </label>
      ))}
    </div>
  );
}

function OpenAnswerPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as OpenAnswerPayload;
  return (
    <div className="ml-11">
      <textarea
        rows={4}
        disabled
        placeholder="Tu respuesta..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 resize-none"
      />
      {(payload.minWords !== undefined || payload.maxWords !== undefined) && (
        <p className="text-xs text-gray-500 mt-1">
          {payload.minWords !== undefined && (
            <>Mín. {payload.minWords} palabras </>
          )}
          {payload.maxWords !== undefined && (
            <>· Máx. {payload.maxWords} palabras</>
          )}
        </p>
      )}
    </div>
  );
}

function FillInTheBlanksPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as FillInTheBlanksPayload;
  const parts = question.statement.split(/(\{\{[^}]+\}\})/g);

  return (
    <div className="ml-11">
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed">
        {parts.map((part, i) => {
          const match = part.match(/^\{\{([^}]+)\}\}$/);
          if (match) {
            return (
              <input
                key={i}
                type="text"
                disabled
                placeholder={match[1]}
                className="inline-block w-32 mx-1 px-2 py-0.5 border-b-2 border-gray-400 bg-white text-sm text-center"
              />
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {payload.blanks?.length ?? 0} espacio(s) a completar
      </p>
    </div>
  );
}

function DropdownPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as DropdownPayload;
  const template = payload.template ?? '';
  const parts = template.split(/(\{\{[^}]+\}\})/g);

  return (
    <div className="ml-11">
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-loose">
        {parts.map((part, i) => {
          const match = part.match(/^\{\{([^}]+)\}\}$/);
          if (match) {
            const dropdown = payload.dropdowns?.find((d) => d.id === match[1]);
            return (
              <select
                key={i}
                disabled
                className="inline-block mx-1 px-2 py-0.5 border border-gray-300 rounded bg-white text-sm"
              >
                <option value="">—</option>
                {dropdown?.options.map((opt, j) => (
                  <option key={j} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {payload.dropdowns?.length ?? 0} desplegable(s)
      </p>
    </div>
  );
}

function ReorderPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as ReorderPayload;
  // Mostramos en orden "revuelto" por id para simular lo que verá el alumno
  const shuffled = [...(payload.items ?? [])].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  return (
    <div className="ml-11 space-y-2">
      {shuffled.map((item, i) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white"
        >
          <span className="text-xs font-semibold text-gray-400 w-5">
            {i + 1}.
          </span>
          <span className="text-sm text-gray-800">{item.label}</span>
        </div>
      ))}
      <p className="text-xs text-gray-500 mt-1">
        El estudiante debe arrastrar para ordenar (vista previa deshabilitada)
      </p>
    </div>
  );
}

function TableFillPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as TableFillPayload;
  return (
    <div className="ml-11">
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <tbody>
            {Array.from({ length: payload.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: payload.columns }).map((_, c) => {
                  const index = r * payload.columns + c;
                  const cell = payload.cells[index];
                  const isBlank = payload.blanks.some(
                    (b) => b.row === r && b.column === c
                  );
                  return (
                    <td
                      key={c}
                      className={`border border-gray-300 px-2 py-1 min-w-[80px] ${
                        cell?.isHeader
                          ? 'bg-gray-100 font-semibold text-gray-800'
                          : ''
                      }`}
                    >
                      {isBlank ? (
                        <input
                          type="text"
                          disabled
                          placeholder="..."
                          className="w-full px-1 py-0.5 border-b border-gray-400 bg-yellow-50 text-sm text-center"
                        />
                      ) : (
                        <span className="text-gray-800">{cell?.value || ' '}</span>
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

function DragAndDropPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as DragAndDropPayload;
  return (
    <div className="ml-11">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {payload.zones.map((zone) => (
          <div
            key={zone.id}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[80px] bg-gray-50"
          >
            <p className="text-xs font-medium text-gray-500 mb-2">
              {zone.label}
            </p>
            <p className="text-xs text-gray-400 italic">Arrastra aquí</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-500 mb-2">
          Elementos a arrastrar
        </p>
        <div className="flex flex-wrap gap-2">
          {payload.items.map((item) => (
            <span
              key={item.id}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-move"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategorizePreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as CategorizePayload;
  return (
    <div className="ml-11">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {payload.categories.map((cat) => (
          <div
            key={cat.id}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[80px] bg-gray-50"
          >
            <p className="text-xs font-medium text-gray-500 mb-2">{cat.name}</p>
            <p className="text-xs text-gray-400 italic">Suelta aquí</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-500 mb-2">
          Elementos a clasificar
        </p>
        <div className="flex flex-wrap gap-2">
          {payload.items.map((item) => (
            <span
              key={item.id}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-move"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchPairsPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as MatchPairsPayload;
  return (
    <div className="ml-11 grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
          Columna izquierda
        </p>
        <div className="space-y-2">
          {payload.pairs.map((pair) => (
            <div
              key={pair.id}
              className="p-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800"
            >
              {pair.left}
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
          Columna derecha
        </p>
        <div className="space-y-2">
          {[...payload.pairs]
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((pair) => (
              <div
                key={pair.id}
                className="p-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800"
              >
                {pair.right}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function MatchingGridPreview({ question }: { question: QuestionListItem }) {
  const payload = question.payload as unknown as MatchingGridPayload;
  return (
    <div className="ml-11 overflow-x-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-50 px-3 py-1.5"></th>
            {payload.columnLabels.map((c, i) => (
              <th
                key={i}
                className="border border-gray-300 bg-gray-50 px-3 py-1.5 font-medium text-gray-700"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payload.rowLabels.map((r, ri) => (
            <tr key={ri}>
              <th className="border border-gray-300 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 text-left">
                {r}
              </th>
              {payload.columnLabels.map((_, ci) => (
                <td
                  key={ci}
                  className="border border-gray-300 px-3 py-1.5 text-center"
                >
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────

export function QuestionPreview({ question }: Props) {
  const { type, options } = question;

  if (options && options.length > 0) {
    return <OptionsPreview question={question} options={options} />;
  }

  switch (type) {
    case 'TRUE_FALSE':
      return <TrueFalsePreview question={question} />;
    case 'OPEN_ANSWER':
      return <OpenAnswerPreview question={question} />;
    case 'FILL_IN_THE_BLANKS':
      return <FillInTheBlanksPreview question={question} />;
    case 'DROPDOWN':
      return <DropdownPreview question={question} />;
    case 'REORDER':
      return <ReorderPreview question={question} />;
    case 'TABLE_FILL':
      return <TableFillPreview question={question} />;
    case 'DRAG_AND_DROP':
      return <DragAndDropPreview question={question} />;
    case 'CATEGORIZE':
      return <CategorizePreview question={question} />;
    case 'MATCH_PAIRS':
      return <MatchPairsPreview question={question} />;
    case 'MATCHING_GRID':
      return <MatchingGridPreview question={question} />;
    default:
      return null;
  }
}