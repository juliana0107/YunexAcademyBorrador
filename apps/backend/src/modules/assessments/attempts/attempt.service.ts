import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../shared/errors/http-error.js';
import { pool } from '../../../config/database.config.js';
import * as repo from './attempt.repository.js';
import { toDetail, toListItem, toAttemptQuestion } from './attempt.mapper.js';
import { validateAnswer } from './answer-validators.js';
import { gradeAnswer } from './grading/grading.service.js';
import type {
  AttemptDetail,
  AttemptListItem,
  StartAttemptResult,
  SubmitResult,
} from './attempt.types.js';
import type {
  ListMyAttemptsQuery,
  GradeOpenAnswerInput,
} from './attempt.schema.js';
import { eventBus, EVENTS } from '../../../shared/events/event-bus.js';

//  HELPERS 

interface AssessmentContext {
  id: string;
  trainingCourseId: string;
  status: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  showResultsToStudents: boolean;
  resultsVisibleAfter: string;
  courseStatus: string;
}

async function getAssessmentContext(assessmentId: string): Promise<AssessmentContext> {
  const result = await pool.query<{
    id: string;
    training_course_id: string;
    status: string;
    passing_score: number;
    max_attempts: number;
    time_limit_minutes: number | null;
    shuffle_questions: boolean;
    show_results_to_students: boolean;
    results_visible_after: string;
    course_status: string;
  }>(
    `SELECT a.id, a.training_course_id, a.status, a.passing_score, a.max_attempts,
            a.time_limit_minutes, a.shuffle_questions, a.show_results_to_students,
            a.results_visible_after, tc.status AS course_status
     FROM assessments a
     INNER JOIN training_courses tc ON tc.id = a.training_course_id
     WHERE a.id = $1`,
    [assessmentId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Assessment not found');
  }

  const row = result.rows[0];
  return {
    id: row.id,
    trainingCourseId: row.training_course_id,
    status: row.status,
    passingScore: row.passing_score,
    maxAttempts: row.max_attempts,
    timeLimitMinutes: row.time_limit_minutes,
    shuffleQuestions: row.shuffle_questions,
    showResultsToStudents: row.show_results_to_students,
    resultsVisibleAfter: row.results_visible_after,
    courseStatus: row.course_status,
  };
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function computeExpiresAt(
  startedAt: Date,
  timeLimitMinutes: number | null
): Date | null {
  if (!timeLimitMinutes) return null;
  return new Date(startedAt.getTime() + timeLimitMinutes * 60_000);
}

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt.getTime() + 30_000;
}

async function buildStartResult(
  attempt: repo.AttemptRecord
): Promise<StartAttemptResult> {
  const assessment = await getAssessmentContext(attempt.assessmentId);
  const expiresAt = computeExpiresAt(attempt.startedAt, assessment.timeLimitMinutes);

  const allQuestions = await repo.getQuestionsForAssessment(attempt.assessmentId);
  const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

  const orderedQuestions = attempt.questionOrder
    .map((id) => questionMap.get(id))
    .filter((q): q is NonNullable<typeof q> => q !== undefined);

  const finalQuestions = orderedQuestions.length > 0 ? orderedQuestions : allQuestions;

  return {
    attemptId: attempt.id,
    assessmentId: attempt.assessmentId,
    attemptNumber: attempt.attemptNumber,
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: expiresAt?.toISOString() ?? null,
    questions: finalQuestions.map(toAttemptQuestion),
  };
}

//  INICIAR INTENTO 

export async function startAttempt(
  assessmentId: string,
  userId: string
): Promise<StartAttemptResult> {
  const assessment = await getAssessmentContext(assessmentId);

  if (assessment.status !== 'PUBLISHED') {
    throw new ForbiddenError('Assessment is not published');
  }

  if (assessment.courseStatus === 'ARCHIVED') {
    throw new ForbiddenError('Cannot start attempts on an archived training course');
  }

  const inProgress = await repo.findInProgressAttempt(assessmentId, userId);
  if (inProgress) {
    const expiresAt = computeExpiresAt(
      inProgress.startedAt,
      assessment.timeLimitMinutes
    );
    if (isExpired(expiresAt)) {
      await submitAttemptInternal(inProgress, true);
    } else {
      return buildStartResult(inProgress);
    }
  }

  const previousCount = await repo.countAttemptsByUser(assessmentId, userId);
  if (previousCount >= assessment.maxAttempts) {
    throw new ConflictError(
      `Maximum attempts reached (${assessment.maxAttempts})`
    );
  }

  const questions = await repo.getQuestionsForAssessment(assessmentId);
  if (questions.length === 0) {
    throw new ConflictError(
      'Cannot start an attempt on an assessment with no questions'
    );
  }

  const orderedQuestions = assessment.shuffleQuestions
    ? shuffle(questions)
    : questions;

  const attempt = await repo.createAttempt({
    assessmentId,
    userId,
    passingScore: assessment.passingScore,
    attemptNumber: previousCount + 1,
    questionOrder: orderedQuestions.map((q) => q.id),
  });

  await repo.createEmptyAnswers(
    attempt.id,
    orderedQuestions.map((q) => ({ id: q.id, points: q.points }))
  );

  return buildStartResult(attempt);
}

//  GUARDAR RESPUESTA 

export async function saveAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  answer: Record<string, unknown>
): Promise<void> {
  const attempt = await repo.findAttemptById(attemptId);
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (attempt.userId !== userId) {
    throw new ForbiddenError('You cannot modify this attempt');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new ConflictError(`Attempt is ${attempt.status}, cannot save answer`);
  }

  const assessment = await getAssessmentContext(attempt.assessmentId);
  const expiresAt = computeExpiresAt(attempt.startedAt, assessment.timeLimitMinutes);

  if (isExpired(expiresAt)) {
    await submitAttemptInternal(attempt, true);
    throw new ConflictError('Attempt has expired and was auto-submitted');
  }

  const attemptAnswer = await repo.findAnswer(attemptId, questionId);
  if (!attemptAnswer) {
    throw new NotFoundError('Question does not belong to this attempt');
  }

  const question = await repo.getFullQuestionById(questionId);
  if (!question) throw new NotFoundError('Question not found');

  const validation = validateAnswer(question.type, answer);
  if (!validation.valid) {
    throw new BadRequestError(`Invalid answer format: ${validation.error}`);
  }

  await repo.upsertAnswer(attemptId, questionId, answer);
}

//  ENVIAR Y CALIFICAR 

export async function submitAttempt(
  attemptId: string,
  userId: string
): Promise<SubmitResult> {
  const attempt = await repo.findAttemptById(attemptId);
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (attempt.userId !== userId) {
    throw new ForbiddenError('You cannot submit this attempt');
  }

  if (attempt.status === 'IN_PROGRESS') {
    const assessment = await getAssessmentContext(attempt.assessmentId);
    const expiresAt = computeExpiresAt(attempt.startedAt, assessment.timeLimitMinutes);
    return submitAttemptInternal(attempt, isExpired(expiresAt));
  }

  return buildSubmitResult(attempt);
}

async function submitAttemptInternal(
  attempt: repo.AttemptRecord,
  expired: boolean
): Promise<SubmitResult> {
  const items = await repo.listAnswersWithQuestions(attempt.id);

  let totalPointsPossible = 0;
  let totalPointsEarned = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let pendingCount = 0;

  for (const { answer, question } of items) {
    totalPointsPossible += answer.pointsPossible;

    const result = gradeAnswer(question, answer.answer);

    await repo.gradeAnswer(attempt.id, answer.questionId, {
      isCorrect: result.isCorrect,
      pointsEarned: result.pointsEarned,
    });

    totalPointsEarned += result.pointsEarned;

    if (result.isCorrect === null) pendingCount++;
    else if (result.isCorrect) correctCount++;
    else incorrectCount++;
  }

  const score =
    totalPointsPossible > 0
      ? Math.round((totalPointsEarned / totalPointsPossible) * 10000) / 100
      : 0;

  const passed = score >= attempt.passingScore;

  const now = new Date();
  const timeSpentSeconds = Math.max(
    0,
    Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000)
  );

  const newStatus = expired
    ? 'EXPIRED'
    : pendingCount > 0
      ? 'SUBMITTED'
      : 'GRADED';

  const updated = await repo.updateAttemptStatus(attempt.id, newStatus, {
    score,
    passed,
    submittedAt: now,
    gradedAt: pendingCount === 0 ? now : undefined,
    timeSpentSeconds,
  });

  if (!updated) throw new NotFoundError('Attempt not found');

  await eventBus.emit(EVENTS.ATTEMPT_SUBMITTED, {
    attemptId: attempt.id,
    userId: attempt.userId,
    score,
    passed,
  });

  // Devuelve el SubmitResult con contadores reales
  return {
    attemptId: updated.id,
    score,
    passed,
    passingScore: updated.passingScore,
    status: updated.status,
    correctCount,
    incorrectCount,
    pendingCount,
    totalQuestions: items.length,
    submittedAt: now.toISOString(),
    gradedAt: updated.gradedAt?.toISOString() ?? null,
  };
}

function buildSubmitResult(attempt: repo.AttemptRecord): SubmitResult {
  return {
    attemptId: attempt.id,
    score: attempt.score,
    passed: attempt.passed,
    passingScore: attempt.passingScore,
    status: attempt.status,
    correctCount: 0,
    incorrectCount: 0,
    pendingCount: 0,
    totalQuestions: 0,
    submittedAt: attempt.submittedAt?.toISOString() ?? '',
    gradedAt: attempt.gradedAt?.toISOString() ?? null,
  };
}

//  CALIFICAR OPEN ANSWER 

export async function gradeOpenAnswer(
  attemptId: string,
  questionId: string,
  requesterIsAdmin: boolean,
  requesterRoles: string[],
  input: GradeOpenAnswerInput
): Promise<AttemptDetail> {
  const attempt = await repo.findAttemptById(attemptId);
  if (!attempt) throw new NotFoundError('Attempt not found');

  const isInstructor = requesterRoles.includes('INSTRUCTOR');
  if (!requesterIsAdmin && !isInstructor) {
    throw new ForbiddenError('Only instructors and admins can grade answers');
  }

  if (attempt.status === 'IN_PROGRESS') {
    throw new ConflictError('Cannot grade answers of an in-progress attempt');
  }

  const question = await repo.getFullQuestionById(questionId);
  if (!question) throw new NotFoundError('Question not found');
  if (question.type !== 'OPEN_ANSWER') {
    throw new BadRequestError('Only OPEN_ANSWER questions can be graded manually');
  }

  const answerRow = await repo.findAnswer(attemptId, questionId);
  if (!answerRow) throw new NotFoundError('Answer not found');

  const maxPoints = answerRow.pointsPossible;
  if (input.pointsEarned > maxPoints) {
    throw new BadRequestError(
      `pointsEarned (${input.pointsEarned}) cannot exceed pointsPossible (${maxPoints})`
    );
  }

  const isCorrect = input.pointsEarned > 0;

  await repo.gradeAnswer(attemptId, questionId, {
    isCorrect,
    pointsEarned: input.pointsEarned,
    feedback: input.feedback ?? null,
  });

  const allAnswers = await repo.listAnswersByAttempt(attemptId);
  let totalPointsPossible = 0;
  let totalPointsEarned = 0;
  let pendingCount = 0;

  for (const a of allAnswers) {
    totalPointsPossible += a.pointsPossible;
    totalPointsEarned += a.pointsEarned;
    if (a.isCorrect === null) pendingCount++;
  }

  const newScore =
    totalPointsPossible > 0
      ? Math.round((totalPointsEarned / totalPointsPossible) * 10000) / 100
      : 0;

  const newPassed = newScore >= attempt.passingScore;
  const newStatus = pendingCount === 0 ? 'GRADED' : 'SUBMITTED';

  await repo.updateAttemptStatus(attemptId, newStatus, {
    score: newScore,
    passed: newPassed,
    gradedAt: pendingCount === 0 ? new Date() : undefined,
  });

  await eventBus.emit(EVENTS.ATTEMPT_GRADED, {
    attemptId,
    score: newScore,
    passed: newPassed,
  });

  const updatedAttempt = await repo.findAttemptById(attemptId);
  if (!updatedAttempt) throw new NotFoundError('Attempt not found');

  const answers = await repo.listAnswersByAttempt(attemptId);
  const assessment = await getAssessmentContext(updatedAttempt.assessmentId);

  return toDetail(updatedAttempt, answers, true);
}

//  OBTENER INTENTO 

export async function getAttempt(
  attemptId: string,
  requesterUserId: string,
  requesterIsAdmin: boolean
): Promise<AttemptDetail> {
  const attempt = await repo.findAttemptById(attemptId);
  if (!attempt) throw new NotFoundError('Attempt not found');

  if (attempt.userId !== requesterUserId && !requesterIsAdmin) {
    throw new ForbiddenError('You cannot view this attempt');
  }

  if (attempt.status === 'IN_PROGRESS') {
    const assessment = await getAssessmentContext(attempt.assessmentId);
    const expiresAt = computeExpiresAt(attempt.startedAt, assessment.timeLimitMinutes);

    if (isExpired(expiresAt)) {
      await submitAttemptInternal(attempt, true);
      const reloaded = await repo.findAttemptById(attemptId);
      if (!reloaded) throw new NotFoundError('Attempt not found');
      const answers = await repo.listAnswersByAttempt(attemptId);
      const assessmentCtx = await getAssessmentContext(reloaded.assessmentId);
      const showResults = computeShowResults(reloaded, assessmentCtx, requesterIsAdmin);
      return toDetail(reloaded, answers, showResults);
    }
  }

  const answers = await repo.listAnswersByAttempt(attemptId);
  const assessment = await getAssessmentContext(attempt.assessmentId);
  const showResults = computeShowResults(attempt, assessment, requesterIsAdmin);

  return toDetail(attempt, answers, showResults);
}

function computeShowResults(
  attempt: repo.AttemptRecord,
  assessment: AssessmentContext,
  requesterIsAdmin: boolean
): boolean {
  if (requesterIsAdmin) return true;
  if (!assessment.showResultsToStudents) return false;

  if (assessment.resultsVisibleAfter === 'NEVER') return false;
  if (assessment.resultsVisibleAfter === 'SUBMIT') {
    return attempt.status !== 'IN_PROGRESS';
  }
  if (assessment.resultsVisibleAfter === 'GRADE') {
    return attempt.status === 'GRADED';
  }
  return false;
}

//  LISTAR MIS INTENTOS 

export async function listMyAttempts(
  userId: string,
  query: ListMyAttemptsQuery
): Promise<{
  items: AttemptListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { items, total } = await repo.listAttempts({
    userId,
    assessmentId: query.assessmentId,
    trainingCourseId: query.trainingCourseId,
    status: query.status,
    page: query.page,
    limit: query.limit,
  });

  return {
    items: items.map(toListItem),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

//  LISTAR INTENTOS DE UNA EVALUACIÓN 

export async function listAssessmentAttempts(
  assessmentId: string,
  filters: {
    status?: string;
    userId?: string;
    passed?: boolean;
    page: number;
    limit: number;
  }
): Promise<{
  items: AttemptListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await getAssessmentContext(assessmentId);

  const { items, total } = await repo.listAttempts({
    assessmentId,
    userId: filters.userId,
    status: filters.status as never,
    passed: filters.passed,
    page: filters.page,
    limit: filters.limit,
  });

  return {
    items: items.map(toListItem),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}