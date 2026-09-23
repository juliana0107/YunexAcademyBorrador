import { getIndicators } from './indicators/indicator.registry.js';
import * as cache from './cache/dashboard.cache.js';
import { buildCacheKey } from './cache/dashboard.cache-keys.js';
import type {
  DashboardData,
  DashboardFilters,
  IndicatorResult,
} from './dashboard.types.js';
import type { DashboardQuery } from './dashboard.schema.js';

// Importar todos los indicadores para que se registren
import './indicators/courses-by-status.indicator.js';
import './indicators/courses-by-video-count.indicator.js';
import './indicators/users-by-role.indicator.js';
import './indicators/users-by-status.indicator.js';
import './indicators/video-progress.indicator.js';
import './indicators/assessments-by-status.indicator.js';
import './indicators/average-score.indicator.js';
import './indicators/approval-rate.indicator.js';
import './indicators/average-attempts.indicator.js';
import './indicators/top-failing-courses.indicator.js';
import './indicators/top-progressing-users.indicator.js';
import './indicators/screenshot-attempts.indicator.js';
import './indicators/average-watch-time.indicator.js';
import './indicators/most-failed-questions.indicator.js';

import { registerIndicator } from './indicators/indicator.registry.js';
import { coursesByStatusIndicator } from './indicators/courses-by-status.indicator.js';
import { coursesByVideoCountIndicator } from './indicators/courses-by-video-count.indicator.js';
import { usersByRoleIndicator } from './indicators/users-by-role.indicator.js';
import { usersByStatusIndicator } from './indicators/users-by-status.indicator.js';
import { videoProgressIndicator } from './indicators/video-progress.indicator.js';
import { assessmentsByStatusIndicator } from './indicators/assessments-by-status.indicator.js';
import { averageScoreIndicator } from './indicators/average-score.indicator.js';
import { approvalRateIndicator } from './indicators/approval-rate.indicator.js';
import { averageAttemptsIndicator } from './indicators/average-attempts.indicator.js';
import { topFailingCoursesIndicator } from './indicators/top-failing-courses.indicator.js';
import { topProgressingUsersIndicator } from './indicators/top-progressing-users.indicator.js';
import { screenshotAttemptsIndicator } from './indicators/screenshot-attempts.indicator.js';
import { averageWatchTimeIndicator } from './indicators/average-watch-time.indicator.js';
import { mostFailedQuestionsIndicator } from './indicators/most-failed-questions.indicator.js';

// Registrar todos una sola vez al cargar el módulo
let registered = false;
function ensureRegistered(): void {
  if (registered) return;

  registerIndicator(coursesByStatusIndicator);
  registerIndicator(coursesByVideoCountIndicator);
  registerIndicator(usersByRoleIndicator);
  registerIndicator(usersByStatusIndicator);
  registerIndicator(videoProgressIndicator);
  registerIndicator(assessmentsByStatusIndicator);
  registerIndicator(averageScoreIndicator);
  registerIndicator(approvalRateIndicator);
  registerIndicator(averageAttemptsIndicator);
  registerIndicator(topFailingCoursesIndicator);
  registerIndicator(topProgressingUsersIndicator);
  registerIndicator(screenshotAttemptsIndicator);
  registerIndicator(averageWatchTimeIndicator);
  registerIndicator(mostFailedQuestionsIndicator);

  registered = true;
}

export async function getDashboard(query: DashboardQuery): Promise<DashboardData> {
  ensureRegistered();

  const filters: DashboardFilters = {
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    trainingCourseId: query.trainingCourseId,
    topLimit: query.topLimit,
  };

  const cacheKey = buildCacheKey(filters);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const indicators = getIndicators();

  // Ejecutar todos en paralelo; cada uno maneja sus propios errores
  const results = await Promise.all(
    indicators.map((indicator) => indicator.compute(filters))
  );

  const indicatorMap: Record<string, IndicatorResult> = {};
  for (const result of results) {
    indicatorMap[result.key] = result;
  }

  const data: DashboardData = {
    filters,
    generatedAt: new Date().toISOString(),
    indicators: indicatorMap,
  };

  cache.set(cacheKey, data);
  return data;
}

export function invalidateDashboardCache(): void {
  cache.invalidateAll();
}