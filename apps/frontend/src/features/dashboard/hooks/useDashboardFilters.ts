import { useState, useMemo, useCallback } from 'react';
import type {
  DateRangePreset,
  DashboardFilters,
} from '../types/dashboard.types';

const DEFAULT_TOP_LIMIT = 10;

function getPresetRange(preset: DateRangePreset): {
  dateFrom?: string;
  dateTo?: string;
} {
  const now = new Date();
  const to = now.toISOString();

  if (preset === 'all-time') {
    return {};
  }

  const daysMap: Record<Exclude<DateRangePreset, 'all-time'>, number> = {
    'last-7-days': 7,
    'last-30-days': 30,
    'last-90-days': 90,
  };

  const days = daysMap[preset];
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    dateFrom: from.toISOString(),
    dateTo: to,
  };
}

export function useDashboardFilters() {
  const [preset, setPresetState] = useState<DateRangePreset>('all-time');
  const [topLimit, setTopLimitState] = useState(DEFAULT_TOP_LIMIT);
  const [trainingCourseId, setTrainingCourseIdState] = useState<string | undefined>();

  const filters: DashboardFilters = useMemo(() => {
    const range = getPresetRange(preset);
    return {
      ...range,
      trainingCourseId,
      topLimit,
    };
  }, [preset, topLimit, trainingCourseId]);

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setPresetState(newPreset);
  }, []);

  const setTopLimit = useCallback((limit: number) => {
    setTopLimitState(limit);
  }, []);

  const setTrainingCourseId = useCallback((courseId: string | undefined) => {
    setTrainingCourseIdState(courseId);
  }, []);

  const reset = useCallback(() => {
    setPresetState('all-time');
    setTopLimitState(DEFAULT_TOP_LIMIT);
    setTrainingCourseIdState(undefined);
  }, []);

  return {
    filters,
    preset,
    topLimit,
    trainingCourseId,
    setPreset,
    setTopLimit,
    setTrainingCourseId,
    reset,
  };
}