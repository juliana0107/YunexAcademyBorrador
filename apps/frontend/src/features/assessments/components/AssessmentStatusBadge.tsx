import type { AssessmentStatus } from '@yunexacademy/shared-types';

const LABELS: Record<AssessmentStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  ARCHIVED: 'Archivada',
};

const STYLES: Record<AssessmentStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

interface Props {
  status: AssessmentStatus;
}

export function AssessmentStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}