import type { Indicator } from './indicator.interface.js';

const indicators = new Map<string, Indicator>();

export function registerIndicator(indicator: Indicator): void {
  if (indicators.has(indicator.key)) {
    throw new Error(`Indicator with key "${indicator.key}" already registered`);
  }
  indicators.set(indicator.key, indicator);
}

export function getIndicators(): Indicator[] {
  return Array.from(indicators.values());
}

export function getIndicator(key: string): Indicator | undefined {
  return indicators.get(key);
}

export function clearRegistry(): void {
  indicators.clear();
}