import type { QuestionRecord } from './question.repository.js';
import type { QuestionListItem, QuestionDetail } from './question.types.js';

export function toListItem(question: QuestionRecord): QuestionListItem {
  return {
    id: question.id,
    assessmentId: question.assessmentId,
    type: question.type,
    statement: question.statement,
    points: question.points,
    order: question.order,
    options: question.options,
    payload: question.payload,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
}

export function toDetail(question: QuestionRecord): QuestionDetail {
  return toListItem(question);
}