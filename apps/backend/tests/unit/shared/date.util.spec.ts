import { describe, it, expect } from 'vitest';
import {
  toISOString,
  addMinutes,
  addSeconds,
  diffInSeconds,
  isPast,
  isFuture,
} from '../../../src/shared/utils/date.util.js';

describe('date.util', () => {
  describe('toISOString', () => {
    it('converts Date to ISO string', () => {
      const date = new Date('2026-01-15T10:30:00Z');
      expect(toISOString(date)).toBe('2026-01-15T10:30:00.000Z');
    });

    it('returns null for null/undefined', () => {
      expect(toISOString(null)).toBeNull();
      expect(toISOString(undefined)).toBeNull();
    });
  });

  describe('addMinutes', () => {
    it('adds minutes correctly', () => {
      const base = new Date('2026-01-15T10:00:00Z');
      const result = addMinutes(base, 30);
      expect(result.toISOString()).toBe('2026-01-15T10:30:00.000Z');
    });

    it('handles negative minutes', () => {
      const base = new Date('2026-01-15T10:00:00Z');
      const result = addMinutes(base, -15);
      expect(result.toISOString()).toBe('2026-01-15T09:45:00.000Z');
    });
  });

  describe('addSeconds', () => {
    it('adds seconds correctly', () => {
      const base = new Date('2026-01-15T10:00:00Z');
      expect(addSeconds(base, 45).toISOString()).toBe('2026-01-15T10:00:45.000Z');
    });
  });

  describe('diffInSeconds', () => {
    it('calculates difference in seconds', () => {
      const from = new Date('2026-01-15T10:00:00Z');
      const to = new Date('2026-01-15T10:01:30Z');
      expect(diffInSeconds(from, to)).toBe(90);
    });

    it('floors partial seconds', () => {
      const from = new Date('2026-01-15T10:00:00.000Z');
      const to = new Date('2026-01-15T10:00:00.999Z');
      expect(diffInSeconds(from, to)).toBe(0);
    });
  });

  describe('isPast / isFuture', () => {
    it('correctly identifies past dates', () => {
      expect(isPast(new Date(Date.now() - 1000))).toBe(true);
      expect(isPast(new Date(Date.now() + 1000))).toBe(false);
    });

    it('correctly identifies future dates', () => {
      expect(isFuture(new Date(Date.now() + 1000))).toBe(true);
      expect(isFuture(new Date(Date.now() - 1000))).toBe(false);
    });
  });
});