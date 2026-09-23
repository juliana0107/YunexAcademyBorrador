import { X, Clock, CheckSquare } from 'lucide-react';
import type { AssessmentListItem, QuestionListItem } from '../types/assessment.types';
import { QuestionTypeBadge } from './QuestionTypeBadge';

interface Props {
  isOpen: boolean;
  assessment: AssessmentListItem;
  questions: QuestionListItem[];
  onClose: () => void;
}

export function AssessmentPreviewModal({ isOpen, assessment, questions, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-8">
        {/* Header fijo con aviso de preview */}
        <div className="sticky top-0 bg-amber-500 text-white px-6 py-3 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <p className="text-sm font-semibold">Modo vista previa</p>
            <p className="text-xs opacity-90">
              Así verá el estudiante esta evaluación
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Info de la evaluación */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assessment.title}
            </h1>
            {assessment.description && (
              <p className="text-gray-600 mb-4">{assessment.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                {questions.length} pregunta{questions.length !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-gray-700">
                  {assessment.passingScore}%
                </span>
                para aprobar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-gray-700">
                  {assessment.maxAttempts}
                </span>
                intento{assessment.maxAttempts !== 1 ? 's' : ''} máximo
                {assessment.maxAttempts !== 1 ? 's' : ''}
              </span>
              {assessment.timeLimitMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {assessment.timeLimitMinutes} minutos
                </span>
              )}
            </div>
          </div>

          {/* Preguntas */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                Esta evaluación aún no tiene preguntas
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <QuestionTypeBadge type={question.type} />
                        <span className="text-xs text-gray-500">
                          {question.points} punto{question.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-base text-gray-900 font-medium">
                        {question.statement}
                      </p>
                    </div>
                  </div>

                  {/* SINGLE / MULTIPLE */}
                  {question.options && question.options.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {question.options.map((opt, i) => (
                        <label
                          key={opt.id ?? i}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-brand-300 cursor-pointer transition-colors"
                        >
                          <input
                            type={question.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                            name={`q-${question.id}`}
                            disabled
                            className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                          />
                          <span className="text-sm text-gray-800">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* TRUE_FALSE */}
                  {question.type === 'TRUE_FALSE' && (
                    <div className="ml-11 space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          disabled
                          className="w-4 h-4 text-brand-600 border-gray-300"
                        />
                        <span className="text-sm text-gray-800">Verdadero</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          disabled
                          className="w-4 h-4 text-brand-600 border-gray-300"
                        />
                        <span className="text-sm text-gray-800">Falso</span>
                      </label>
                    </div>
                  )}

                  {/* OPEN_ANSWER */}
                  {question.type === 'OPEN_ANSWER' && (
                    <div className="ml-11">
                      <textarea
                        rows={4}
                        disabled
                        placeholder="Tu respuesta..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 resize-none"
                      />
                      {(question.payload.minWords !== undefined ||
                        question.payload.maxWords !== undefined) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {question.payload.minWords !== undefined && (
                            <>Mín. {String(question.payload.minWords)} palabras </>
                          )}
                          {question.payload.maxWords !== undefined && (
                            <>· Máx. {String(question.payload.maxWords)} palabras</>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer simulado */}
          {questions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 flex justify-end">
              <button
                type="button"
                disabled
                className="px-6 py-2.5 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
              >
                Enviar respuestas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}