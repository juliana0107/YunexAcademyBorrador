import { describe, it, expect } from 'vitest';
import {
  normalizePagination,
  calculateOffset,
  buildPaginationMeta,
} from '../../../src/shared/utils/pagination.util.js';

describe('pagination.util', () => {
  describe('normalizePagination', () => {
    it('returns valid values when input is valid', () => {
      const result = normalizePagination({ page: 3, limit: 15 });
      expect(result).toEqual({ page: 3, limit: 15 });
    });

    it('clamps limit to between 1 and 100', () => {
    expect(normalizePagination({ page: 1, limit: 0 }).limit).toBe(20);
    expect(normalizePagination({ page: 1, limit: -5 }).limit).toBe(20);
    expect(normalizePagination({ page: 1, limit: 500 }).limit).toBe(100);
    });

    it('clamps limit to between 1 and 100', () => {
      expect(normalizePagination({ page: 1, limit: 0 }).limit).toBe(20);
      expect(normalizePagination({ page: 1, limit: 500 }).limit).toBe(100);
    });

    it('floors decimal values', () => {
      const result = normalizePagination({ page: 2.7, limit: 10.9 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  describe('calculateOffset', () => {
    it('returns 0 for page 1', () => {
      expect(calculateOffset({ page: 1, limit: 20 })).toBe(0);
    });

    it('returns correct offset for page 3 with limit 20', () => {
      expect(calculateOffset({ page: 3, limit: 20 })).toBe(40);
    });

    it('normalizes input before calculating', () => {
      expect(calculateOffset({ page: 0, limit: 10 })).toBe(0);
    });
  });

  describe('buildPaginationMeta', () => {
    it('builds correct meta for middle page', () => {
      const meta = buildPaginationMeta({ page: 2, limit: 10 }, 35);
      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 35,
        totalPages: 4,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('sets hasNext to false on last page', () => {
      const meta = buildPaginationMeta({ page: 4, limit: 10 }, 35);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
    });

    it('sets hasPrev to false on first page', () => {
      const meta = buildPaginationMeta({ page: 1, limit: 10 }, 35);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(false);
    });

    it('handles zero results', () => {
      const meta = buildPaginationMeta({ page: 1, limit: 10 }, 0);
      expect(meta.totalPages).toBe(0);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(false);
    });
  });
});