import type { ComponentType } from 'react';
import type {
  QuestionType,
  TrueFalsePayload,
  OpenAnswerPayload,
  FillInTheBlanksPayload,
  DropdownPayload,
  ReorderPayload,
  TableFillPayload,
  DragAndDropPayload,
  CategorizePayload,
  MatchPairsPayload,
  MatchingGridPayload,
  FillBlank,
  Dropdown,
  ReorderItem,
  CategorizeCategory,
  CategorizeItem,
  MatchPair,
} from '@yunexacademy/shared-types';

import { CategorizeEditor } from './CategorizeEditor';
import { MatchPairsEditor } from './MatchPairsEditor';
import { FillInTheBlanksEditor } from './FillInTheBlanksEditor';
import { DropdownEditor } from './DropdownEditor';
import { ReorderEditor } from './ReorderEditor';
import {
  TableFillEditor,
  createEmptyTableFillPayload,
} from './TableFillEditor';
import {
  DragAndDropEditor,
  createEmptyDragAndDropPayload,
} from './DragAndDropEditor';
import {
  MatchingGridEditor,
  createEmptyMatchingGridPayload,
} from './MatchingGridEditor';

/**
 * Firma común para todos los editores.
 * El registry los envuelve para que el modal solo use esta forma.
 */
export interface EditorProps {
  payload: Record<string, unknown>;
  onChange: (payload: Record<string, unknown>) => void;
}

/**
 * Firma interna para editores que reciben el payload tipado.
 */
type TypedEditorProps<P> = {
  payload: P;
  onChange: (payload: P) => void;
};

function wrap<P extends object>(
  Component: ComponentType<TypedEditorProps<P>>
): ComponentType<EditorProps> {
  return function Wrapped({ payload, onChange }: EditorProps) {
    return (
      <Component
        payload={payload as unknown as P}
        onChange={(p) => onChange(p as unknown as Record<string, unknown>)}
      />
    );
  };
}

// ────────────────────────────────────────────────────────────
// Envoltorios para editores con firmas especiales
// ────────────────────────────────────────────────────────────

function FillInTheBlanksWrapper({ payload, onChange }: EditorProps) {
  const typed = payload as unknown as FillInTheBlanksPayload;
  const blanks: FillBlank[] = typed.blanks ?? [];
  return (
    <FillInTheBlanksEditor
      blanks={blanks}
      onChange={(blanks) => onChange({ ...payload, blanks })}
    />
  );
}

function DropdownWrapper({ payload, onChange }: EditorProps) {
  const typed = payload as unknown as DropdownPayload;
  const template = typed.template ?? '';
  const dropdowns: Dropdown[] = typed.dropdowns ?? [];
  return (
    <DropdownEditor
      template={template}
      dropdowns={dropdowns}
      onChange={(data) => onChange({ ...payload, ...data })}
    />
  );
}

function ReorderWrapper({ payload, onChange }: EditorProps) {
  const typed = payload as unknown as ReorderPayload;
  const items: ReorderItem[] = typed.items ?? [];
  return (
    <ReorderEditor
      items={items}
      onChange={(items) => onChange({ ...payload, items })}
    />
  );
}

function CategorizeWrapper({ payload, onChange }: EditorProps) {
  const typed = payload as unknown as CategorizePayload;
  const categories: CategorizeCategory[] = typed.categories ?? [];
  const items: CategorizeItem[] = typed.items ?? [];
  return (
    <CategorizeEditor
      categories={categories}
      items={items}
      onChange={(data) => onChange({ ...payload, ...data })}
    />
  );
}

function MatchPairsWrapper({ payload, onChange }: EditorProps) {
  const typed = payload as unknown as MatchPairsPayload;
  const pairs: MatchPair[] = typed.pairs ?? [];
  return (
    <MatchPairsEditor
      pairs={pairs}
      onChange={(pairs) => onChange({ ...payload, pairs })}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Registry principal
// ────────────────────────────────────────────────────────────

type EditorComponent = ComponentType<EditorProps>;

export const EDITOR_REGISTRY: Partial<Record<QuestionType, EditorComponent>> = {
  FILL_IN_THE_BLANKS: FillInTheBlanksWrapper,
  DROPDOWN: DropdownWrapper,
  REORDER: ReorderWrapper,
  TABLE_FILL: wrap<TableFillPayload>(
    TableFillEditor as ComponentType<TypedEditorProps<TableFillPayload>>
  ),
  DRAG_AND_DROP: wrap<DragAndDropPayload>(
    DragAndDropEditor as ComponentType<TypedEditorProps<DragAndDropPayload>>
  ),
  CATEGORIZE: CategorizeWrapper,
  MATCH_PAIRS: MatchPairsWrapper,
  MATCHING_GRID: wrap<MatchingGridPayload>(
    MatchingGridEditor as ComponentType<TypedEditorProps<MatchingGridPayload>>
  ),
};

// ────────────────────────────────────────────────────────────
// Payloads iniciales por tipo
// ────────────────────────────────────────────────────────────

export function createInitialPayload(
  type: QuestionType
): Record<string, unknown> {
  switch (type) {
    case 'TRUE_FALSE':
      return { correctAnswer: true } satisfies TrueFalsePayload;
    case 'OPEN_ANSWER':
      return {} satisfies OpenAnswerPayload;
    case 'FILL_IN_THE_BLANKS':
      return { blanks: [] } satisfies FillInTheBlanksPayload;
    case 'DROPDOWN':
      return { template: '', dropdowns: [] } satisfies DropdownPayload;
    case 'REORDER':
      return { items: [] } satisfies ReorderPayload;
    case 'TABLE_FILL':
      return createEmptyTableFillPayload() as unknown as Record<string, unknown>;
    case 'DRAG_AND_DROP':
      return createEmptyDragAndDropPayload() as unknown as Record<string, unknown>;
    case 'CATEGORIZE':
      return {
        categories: [],
        items: [],
      } satisfies CategorizePayload;
    case 'MATCH_PAIRS':
      return { pairs: [] } satisfies MatchPairsPayload;
    case 'MATCHING_GRID':
      return createEmptyMatchingGridPayload() as unknown as Record<string, unknown>;
    default:
      return {};
  }
}