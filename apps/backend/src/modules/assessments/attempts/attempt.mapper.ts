import type {
  AttemptRecord,
  AnswerRecord,
  QuestionRecord,
} from './attempt.repository.js';
import type {
  AttemptListItem,
  AttemptDetail,
  AttemptAnswerItem,
  AttemptQuestion,
} from './attempt.types.js';

export function toListItem(attempt: AttemptRecord): AttemptListItem {
  return {
    id: attempt.id,
    assessmentId: attempt.assessmentId,
    assessmentTitle: attempt.assessmentTitle,
    userId: attempt.userId,
    userName: `${attempt.userFirstName} ${attempt.userLastName}`.trim(),
    status: attempt.status,
    score: attempt.score,
    passingScore: attempt.passingScore,
    passed: attempt.passed,
    attemptNumber: attempt.attemptNumber,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    gradedAt: attempt.gradedAt?.toISOString() ?? null,
    timeSpentSeconds: attempt.timeSpentSeconds,
    createdAt: attempt.createdAt.toISOString(),
    updatedAt: attempt.updatedAt.toISOString(),
  };
}

export function toAnswerItem(answer: AnswerRecord): AttemptAnswerItem {
  return {
    id: answer.id,
    attemptId: answer.attemptId,
    questionId: answer.questionId,
    questionType: answer.questionType,
    questionStatement: answer.questionStatement,
    pointsPossible: answer.pointsPossible,
    pointsEarned: answer.pointsEarned,
    isCorrect: answer.isCorrect,
    answer: answer.answer,
    feedback: answer.feedback,
    createdAt: answer.createdAt.toISOString(),
    updatedAt: answer.updatedAt.toISOString(),
  };
}

export function toDetail(
  attempt: AttemptRecord,
  answers: AnswerRecord[],
  showResults: boolean
): AttemptDetail {
  return {
    ...toListItem(attempt),
    answers: answers.map(toAnswerItem),
    showResults,
  };
}

/**
 * Convierte una pregunta a la versión que ve el estudiante.
 * IMPORTANTE: elimina `isCorrect` de las opciones y ciertos campos del payload
 * para no filtrar respuestas.
 */
export function toAttemptQuestion(question: QuestionRecord): AttemptQuestion {
  return {
    id: question.id,
    type: question.type,
    statement: question.statement,
    points: question.points,
    order: question.order,
    options: question.options
      ? question.options.map((o) => ({
          id: o.id,
          text: o.text,
          order: o.order,
        }))
      : null,
    payload: sanitizePayload(question.type, question.payload),
  };
}

function sanitizePayload(
  type: string,
  payload: Record<string, unknown>
): Record<string, unknown> {
  // Para tipos que tienen respuestas correctas dentro del payload,
  // las removemos antes de mandarlas al estudiante.
  const sanitized = { ...payload };

  if (type === 'TRUE_FALSE') {
    // El estudiante no debe ver la respuesta correcta
    delete sanitized.correctAnswer;
  }

  if (type === 'FILL_IN_THE_BLANKS') {
    // El estudiante no debe ver las respuestas de los blanks
    if (Array.isArray(sanitized.blanks)) {
      sanitized.blanks = (sanitized.blanks as Array<{ id: string }>).map((b) => ({
        id: b.id,
      }));
    }
  }

  if (type === 'DROPDOWN') {
    // El estudiante no debe ver la respuesta correcta de cada dropdown
    if (Array.isArray(sanitized.dropdowns)) {
      sanitized.dropdowns = (
        sanitized.dropdowns as Array<{ id: string; options: string[] }>
      ).map((d) => ({
        id: d.id,
        options: d.options,
      }));
    }
  }

  if (type === 'CATEGORIZE') {
    // Quitar correctCategoryId
    if (Array.isArray(sanitized.items)) {
      sanitized.items = (
        sanitized.items as Array<{ id: string; label: string }>
      ).map((it) => ({
        id: it.id,
        label: it.label,
      }));
    }
  }

  if (type === 'DRAG_AND_DROP') {
    // Quitar correctItemId de los targets
    if (Array.isArray(sanitized.targets)) {
      sanitized.targets = (
        sanitized.targets as Array<{ id: string; label: string }>
      ).map((t) => ({
        id: t.id,
        label: t.label,
      }));
    }
  }

  if (type === 'TABLE_FILL') {
    // Quitar correctAnswer de cada celda
    if (Array.isArray(sanitized.rows)) {
      sanitized.rows = (
        sanitized.rows as Array<{
          id: string;
          cells: Array<{ id: string }>;
        }>
      ).map((r) => ({
        id: r.id,
        cells: r.cells.map((c) => ({ id: c.id })),
      }));
    }
  }

  if (type === 'MATCHING_GRID') {
    // Quitar correctMatches
    delete sanitized.correctMatches;
  }

  if (type === 'MATCH_PAIRS') {
    // El estudiante ve solo la columna "left"
    // La columna "right" se le da por separado, barajada
    if (Array.isArray(sanitized.pairs)) {
      const pairs = sanitized.pairs as Array<{
        id: string;
        left: string;
        right: string;
      }>;
      sanitized.pairs = pairs.map((p) => ({ id: p.id, left: p.left }));
      // Mandamos los rights como un array aparte, sin id
      sanitized.rightOptions = pairs
        .map((p) => p.right)
        .sort(() => Math.random() - 0.5);
    }
  }

  if (type === 'REORDER') {
    // El estudiante no debe ver correctOrder
    if (Array.isArray(sanitized.items)) {
      sanitized.items = (
        sanitized.items as Array<{ id: string; label: string; correctOrder: number }>
      ).map((it) => ({
        id: it.id,
        label: it.label,
      }));
    }
  }

  return sanitized;
}