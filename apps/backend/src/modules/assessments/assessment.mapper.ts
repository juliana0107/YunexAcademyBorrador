import type { AssessmentRecord } from './assessment.repository.js';
import type { AssessmentListItem, AssessmentDetail } from './assessment.types.js';

export function toListItem(assessment: AssessmentRecord): AssessmentListItem {
  return {
    id: assessment.id,
    trainingCourseId: assessment.trainingCourseId,
    submoduleId: assessment.submoduleId,
    title: assessment.title,
    description: assessment.description,
    status: assessment.status,
    passingScore: assessment.passingScore,
    maxAttempts: assessment.maxAttempts,
    timeLimitMinutes: assessment.timeLimitMinutes,
    shuffleQuestions: assessment.shuffleQuestions,
    questionCount: assessment.questionCount,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}

export function toDetail(assessment: AssessmentRecord): AssessmentDetail {
  return toListItem(assessment);
}