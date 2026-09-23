import { AlertCircle } from 'lucide-react';
import { IndicatorCard } from '../IndicatorCard';
import { NoDataState } from '../NoDataState';
import type { MostFailedQuestionItem } from '../../types/dashboard.types';

interface Props {
  value: MostFailedQuestionItem[] | null;
  isLoading?: boolean;
  error?: string;
}

function getBarColor(percent: number): string {
  if (percent >= 75) return 'bg-red-500';
  if (percent >= 50) return 'bg-amber-500';
  return 'bg-gray-400';
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

export function MostFailedQuestionsCard({ value, isLoading, error }: Props) {
  return (
    <IndicatorCard
      title="Preguntas más falladas"
      icon={AlertCircle}
      iconColor="text-amber-600"
      iconBg="bg-amber-50"
      isLoading={isLoading}
      error={error}
    >
      {!value || value.length === 0 ? (
        <NoDataState message="Sin datos de intentos aún" />
      ) : (
        <ol className="space-y-3">
          {value.map((question, i) => (
            <li key={question.questionId} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-900"
                  title={question.statement}
                >
                  {truncate(question.statement, 70)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 flex-shrink-0">
                    {question.questionType.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(question.failureRatePercent)}`}
                      style={{ width: `${question.failureRatePercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {question.failedAttempts}/{question.totalAttempts}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                {question.failureRatePercent}%
              </span>
            </li>
          ))}
        </ol>
      )}
    </IndicatorCard>
  );
}