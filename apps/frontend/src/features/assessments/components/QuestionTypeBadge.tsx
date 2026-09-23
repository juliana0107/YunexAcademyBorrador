import type { QuestionType } from '@yunexacademy/shared-types';

const LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Selección única',
  MULTIPLE_CHOICE: 'Selección múltiple',
  TRUE_FALSE: 'Verdadero / Falso',
  OPEN_ANSWER: 'Respuesta abierta',
  FILL_IN_THE_BLANKS: 'Rellenar espacios',
  TABLE_FILL: 'Rellenar tabla',
  DRAG_AND_DROP: 'Arrastrar y soltar',
  DROPDOWN: 'Desplegable',
  CATEGORIZE: 'Categorizar',
  REORDER: 'Ordenar',
  MATCH_PAIRS: 'Emparejar',
  MATCHING_GRID: 'Cuadrícula',
};

interface Props {
  type: QuestionType;
}

export function QuestionTypeBadge({ type }: Props) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700">
      {LABELS[type]}
    </span>
  );
}