import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { QuestionTypeBadge } from './QuestionTypeBadge';
import type { QuestionListItem } from '../types/assessment.types';

interface Props {
  questions: QuestionListItem[];
  isLoading: boolean;
  canEdit: boolean;
  onEdit: (question: QuestionListItem) => void;
  onDelete: (question: QuestionListItem) => void;
}

export function QuestionList({ questions, isLoading, canEdit, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Cargando preguntas...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Esta evaluación aún no tiene preguntas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <QuestionTypeBadge type={question.type} />
                <span className="text-xs text-gray-500">
                  {question.points} punto{question.points !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-3">
                {question.statement}
              </p>

              {/* Opciones para SINGLE / MULTIPLE */}
              {question.options && question.options.length > 0 && (
                <ul className="space-y-1.5">
                  {question.options.map((opt, i) => (
                    <li
                      key={opt.id ?? i}
                      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                        opt.isCorrect
                          ? 'bg-green-50 text-green-800 font-medium'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      {opt.text}
                    </li>
                  ))}
                </ul>
              )}

              {/* TRUE_FALSE */}
              {question.type === 'TRUE_FALSE' && (
                <p className="text-xs text-gray-500 mt-2">
                  Respuesta correcta:{' '}
                  <strong className="text-green-700">
                    {question.payload.correctAnswer ? 'Verdadero' : 'Falso'}
                  </strong>
                </p>
              )}

              {/* OPEN_ANSWER */}
              {question.type === 'OPEN_ANSWER' && (
                <p className="text-xs text-gray-500 mt-2">
                  Requiere revisión manual del instructor
                </p>
              )}
            </div>

            {canEdit && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(question)}
                  className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(question)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}