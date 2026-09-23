import type { QuestionType } from '@yunexacademy/shared-types';
import { QUESTION_TYPE_LABELS } from '@yunexacademy/shared-types';

interface Props {
  type: QuestionType;
}

export function QuestionTypeBadge({ type }: Props) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700">
      {QUESTION_TYPE_LABELS[type]}
    </span>
  );
}