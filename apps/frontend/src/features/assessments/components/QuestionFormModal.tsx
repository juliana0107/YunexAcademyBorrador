import { useEffect, useState, type FormEvent } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import type { QuestionType } from '@yunexacademy/shared-types';
import {
  useCreateQuestion,
  useUpdateQuestion,
} from '../hooks/useAssessmentMutations';
import { extractErrorMessage } from '@/features/auth/api/auth.api';
import type {
  QuestionListItem,
  QuestionOptionData,
} from '../types/assessment.types';

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'SINGLE_CHOICE', label: 'Selección única' },
  { value: 'MULTIPLE_CHOICE', label: 'Selección múltiple' },
  { value: 'TRUE_FALSE', label: 'Verdadero / Falso' },
  { value: 'OPEN_ANSWER', label: 'Respuesta abierta' },
];

interface Props {
  isOpen: boolean;
  assessmentId: string;
  question: QuestionListItem | null;
  onClose: () => void;
}

export function QuestionFormModal({ isOpen, assessmentId, question, onClose }: Props) {
  const isEditing = !!question;
  const createMutation = useCreateQuestion(assessmentId);
  const updateMutation = useUpdateQuestion(assessmentId);

  const [type, setType] = useState<QuestionType>('SINGLE_CHOICE');
  const [statement, setStatement] = useState('');
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState<QuestionOptionData[]>([]);
  const [correctTrueFalse, setCorrectTrueFalse] = useState(true);
  const [minWords, setMinWords] = useState<string>('');
  const [maxWords, setMaxWords] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setType(question.type);
      setStatement(question.statement);
      setPoints(question.points);
      setOptions(question.options ?? []);

      if (question.type === 'TRUE_FALSE') {
        setCorrectTrueFalse(Boolean(question.payload.correctAnswer));
      }

      if (question.type === 'OPEN_ANSWER') {
        setMinWords(question.payload.minWords ? String(question.payload.minWords) : '');
        setMaxWords(question.payload.maxWords ? String(question.payload.maxWords) : '');
      }
    } else {
      setType('SINGLE_CHOICE');
      setStatement('');
      setPoints(1);
      setOptions([
        { text: '', isCorrect: true, order: 0 },
        { text: '', isCorrect: false, order: 1 },
      ]);
      setCorrectTrueFalse(true);
      setMinWords('');
      setMaxWords('');
    }
    setError(null);
  }, [question, isOpen]);

  function handleTypeChange(newType: QuestionType): void {
    setType(newType);

    if (newType === 'SINGLE_CHOICE' || newType === 'MULTIPLE_CHOICE') {
      if (options.length < 2) {
        setOptions([
          { text: '', isCorrect: newType === 'SINGLE_CHOICE', order: 0 },
          { text: '', isCorrect: false, order: 1 },
        ]);
      }
    }
  }

  function addOption(): void {
    setOptions((prev) => [
      ...prev,
      { text: '', isCorrect: false, order: prev.length },
    ]);
  }

  function removeOption(index: number): void {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOptionText(index: number, text: string): void {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, text } : o))
    );
  }

  function toggleOptionCorrect(index: number): void {
    setOptions((prev) => {
      if (type === 'SINGLE_CHOICE') {
        return prev.map((o, i) => ({ ...o, isCorrect: i === index }));
      }
      return prev.map((o, i) => (i === index ? { ...o, isCorrect: !o.isCorrect } : o));
    });
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    // Armar payload según tipo
    let payload: Record<string, unknown> = {};
    if (type === 'TRUE_FALSE') {
      payload = { correctAnswer: correctTrueFalse };
    } else if (type === 'OPEN_ANSWER') {
      payload = {};
      if (minWords) payload.minWords = parseInt(minWords, 10);
      if (maxWords) payload.maxWords = parseInt(maxWords, 10);
    }

    const opts =
      type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' ? options : undefined;

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: question.id,
          input: {
            statement,
            points,
            options: opts,
            payload,
          },
        });
      } else {
        await createMutation.mutateAsync({
          type,
          statement,
          points,
          options: opts,
          payload,
        });
      }
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (!isOpen) return null;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar pregunta' : 'Nueva pregunta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de pregunta
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enunciado
            </label>
            <textarea
              required
              minLength={3}
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Escribe la pregunta..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puntos
            </label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value, 10) || 1)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* SINGLE / MULTIPLE */}
          {(type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Opciones
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar opción
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                {type === 'SINGLE_CHOICE'
                  ? 'Haz clic en el círculo para marcar la respuesta correcta (solo una).'
                  : 'Haz clic en el círculo para marcar las respuestas correctas (una o más).'}
              </p>

              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleOptionCorrect(i)}
                      className="flex-shrink-0"
                    >
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => updateOptionText(i, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder={`Opción ${i + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRUE_FALSE */}
          {type === 'TRUE_FALSE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Respuesta correcta
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectTrueFalse(true)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    correctTrueFalse
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Verdadero
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectTrueFalse(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    !correctTrueFalse
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Falso
                </button>
              </div>
            </div>
          )}

          {/* OPEN_ANSWER */}
          {type === 'OPEN_ANSWER' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mínimo de palabras
                </label>
                <input
                  type="number"
                  min={0}
                  value={minWords}
                  onChange={(e) => setMinWords(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de palabras
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxWords}
                  onChange={(e) => setMaxWords(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <p className="col-span-2 text-xs text-gray-500">
                Las respuestas abiertas requieren revisión manual del instructor.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 rounded-lg transition-colors"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear pregunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}