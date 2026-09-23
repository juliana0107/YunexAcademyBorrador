import type { DashboardFilters, IndicatorResult } from '../dashboard.types.js';

export interface Indicator<T = unknown> {
  readonly key: string;
  readonly label: string;
  compute(filters: DashboardFilters): Promise<IndicatorResult<T>>;
}

/**
 * Helper que envuelve el resultado de un indicador con el formato estándar.
 */
export function wrap<T>(
  key: string,
  label: string,
  value: T
): IndicatorResult<T> {
  return {
    key,
    label,
    value,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper que envuelve un error en el formato del indicador.
 */
export function wrapError<T>(
  key: string,
  label: string,
  error: unknown
): IndicatorResult<T> {
  const message = error instanceof Error ? error.message : String(error);
  return {
    key,
    label,
    value: null,
    error: message,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Aplica los filtros de fecha a una query SQL agregándolos al WHERE.
 * Retorna el fragmento SQL y los valores para el array de parámetros.
 */
export function buildDateFilter(
  filters: DashboardFilters,
  column: string,
  startIndex: number
): { sql: string; values: unknown[]; nextIndex: number } {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = startIndex;

  if (filters.dateFrom) {
    conditions.push(`${column} >= $${idx++}`);
    values.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`${column} <= $${idx++}`);
    values.push(filters.dateTo);
  }

  return {
    sql: conditions.length > 0 ? conditions.join(' AND ') : '',
    values,
    nextIndex: idx,
  };
}