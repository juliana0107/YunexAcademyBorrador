import { describe, it, expect } from 'vitest';
import { gradeAnswer } from '../../../../../src/modules/assessments/attempts/grading/grading.service.js';
import type { QuestionRecord } from '../../../../../src/modules/assessments/attempts/attempt.repository.js';

function q(partial: Partial<QuestionRecord>): QuestionRecord {
  return {
    id: 'q-1',
    assessmentId: 'a-1',
    type: 'SINGLE_CHOICE',
    statement: '',
    points: 10,
    order: 0,
    payload: {},
    options: null,
    ...partial,
  };
}

describe('grading.service', () => {
  // ============ SINGLE_CHOICE ============
  describe('SINGLE_CHOICE', () => {
    const question = q({
      type: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { id: 'o-1', text: 'A', isCorrect: false, order: 0 },
        { id: 'o-2', text: 'B', isCorrect: true, order: 1 },
        { id: 'o-3', text: 'C', isCorrect: false, order: 2 },
      ],
    });

    it('returns correct when optionId matches', () => {
      const result = gradeAnswer(question, { optionId: 'o-2' });
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('returns incorrect when optionId differs', () => {
      const result = gradeAnswer(question, { optionId: 'o-1' });
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it('returns incorrect when no correct option exists', () => {
      const broken = q({
        type: 'SINGLE_CHOICE',
        options: [
          { id: 'o-1', text: 'A', isCorrect: false, order: 0 },
          { id: 'o-2', text: 'B', isCorrect: false, order: 1 },
        ],
      });
      const result = gradeAnswer(broken, { optionId: 'o-1' });
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it('returns incorrect when answer is empty', () => {
      const result = gradeAnswer(question, {});
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ MULTIPLE_CHOICE ============
  describe('MULTIPLE_CHOICE', () => {
    const question = q({
      type: 'MULTIPLE_CHOICE',
      points: 15,
      options: [
        { id: 'o-1', text: 'A', isCorrect: true, order: 0 },
        { id: 'o-2', text: 'B', isCorrect: false, order: 1 },
        { id: 'o-3', text: 'C', isCorrect: true, order: 2 },
      ],
    });

    it('returns correct when sets match exactly', () => {
      const result = gradeAnswer(question, { optionIds: ['o-1', 'o-3'] });
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(15);
    });

    it('returns correct when order of optionIds is different', () => {
      const result = gradeAnswer(question, { optionIds: ['o-3', 'o-1'] });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when missing one correct option', () => {
      const result = gradeAnswer(question, { optionIds: ['o-1'] });
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it('returns incorrect when extra option selected', () => {
      const result = gradeAnswer(question, { optionIds: ['o-1', 'o-2', 'o-3'] });
      expect(result.isCorrect).toBe(false);
    });

    it('returns incorrect when empty', () => {
      const result = gradeAnswer(question, { optionIds: [] });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ TRUE_FALSE ============
  describe('TRUE_FALSE', () => {
    const question = q({
      type: 'TRUE_FALSE',
      points: 5,
      payload: { correctAnswer: true },
    });

    it('returns correct when answer is true', () => {
      const result = gradeAnswer(question, { answer: true });
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(5);
    });

    it('returns incorrect when answer is false', () => {
      const result = gradeAnswer(question, { answer: false });
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it('returns incorrect when answer is missing', () => {
      const result = gradeAnswer(question, {});
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ FILL_IN_THE_BLANKS ============
  describe('FILL_IN_THE_BLANKS', () => {
    const question = q({
      type: 'FILL_IN_THE_BLANKS',
      points: 10,
      payload: {
        blanks: [
          { id: 'b1', correctAnswer: 'París', caseSensitive: false },
          { id: 'b2', correctAnswer: 'Roma', caseSensitive: false },
        ],
      },
    });

    it('returns correct when all blanks match', () => {
      const result = gradeAnswer(question, {
        blanks: { b1: 'París', b2: 'Roma' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('is case-insensitive by default', () => {
      const result = gradeAnswer(question, {
        blanks: { b1: 'PARÍS', b2: 'roma' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('trims whitespace', () => {
      const result = gradeAnswer(question, {
        blanks: { b1: '  París  ', b2: '  Roma  ' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when one blank differs', () => {
      const result = gradeAnswer(question, {
        blanks: { b1: 'París', b2: 'Milán' },
      });
      expect(result.isCorrect).toBe(false);
    });

    it('is case-sensitive when specified', () => {
      const sensitive = q({
        type: 'FILL_IN_THE_BLANKS',
        points: 5,
        payload: {
          blanks: [{ id: 'b1', correctAnswer: 'Test', caseSensitive: true }],
        },
      });
      expect(
        gradeAnswer(sensitive, { blanks: { b1: 'test' } }).isCorrect
      ).toBe(false);
      expect(
        gradeAnswer(sensitive, { blanks: { b1: 'Test' } }).isCorrect
      ).toBe(true);
    });

    it('returns incorrect when blank is empty', () => {
      const result = gradeAnswer(question, { blanks: { b1: 'París' } });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ DROPDOWN ============
  describe('DROPDOWN', () => {
    const question = q({
      type: 'DROPDOWN',
      points: 8,
      payload: {
        template: 'El {{d1}} es satélite de la {{d2}}.',
        dropdowns: [
          { id: 'd1', options: ['Sol', 'Luna'], correctAnswer: 'Luna' },
          { id: 'd2', options: ['Tierra', 'Marte'], correctAnswer: 'Tierra' },
        ],
      },
    });

    it('returns correct when all dropdowns match', () => {
      const result = gradeAnswer(question, {
        dropdowns: { d1: 'Luna', d2: 'Tierra' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when one dropdown differs', () => {
      const result = gradeAnswer(question, {
        dropdowns: { d1: 'Sol', d2: 'Tierra' },
      });
      expect(result.isCorrect).toBe(false);
    });

    it('returns incorrect when empty', () => {
      const result = gradeAnswer(question, { dropdowns: {} });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ REORDER ============
  describe('REORDER', () => {
    const question = q({
      type: 'REORDER',
      points: 10,
      payload: {
        items: [
          { id: 'i-1', label: 'Uno', correctOrder: 0 },
          { id: 'i-2', label: 'Dos', correctOrder: 1 },
          { id: 'i-3', label: 'Tres', correctOrder: 2 },
        ],
      },
    });

    it('returns correct when order matches exactly', () => {
      const result = gradeAnswer(question, { order: ['i-1', 'i-2', 'i-3'] });
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('returns incorrect when order differs', () => {
      const result = gradeAnswer(question, { order: ['i-2', 'i-1', 'i-3'] });
      expect(result.isCorrect).toBe(false);
    });

    it('returns incorrect when missing items', () => {
      const result = gradeAnswer(question, { order: ['i-1', 'i-2'] });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ MATCH_PAIRS ============
  describe('MATCH_PAIRS', () => {
    const question = q({
      type: 'MATCH_PAIRS',
      points: 12,
      payload: {
        pairs: [
          { id: 'p-1', left: 'Francia', right: 'París' },
          { id: 'p-2', left: 'Italia', right: 'Roma' },
        ],
      },
    });

    it('returns correct when all pairs match', () => {
      const result = gradeAnswer(question, {
        pairs: [
          { leftId: 'p-1', rightId: 'p-1' },
          { leftId: 'p-2', rightId: 'p-2' },
        ],
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when one pair is swapped', () => {
      const result = gradeAnswer(question, {
        pairs: [
          { leftId: 'p-1', rightId: 'p-2' },
          { leftId: 'p-2', rightId: 'p-1' },
        ],
      });
      expect(result.isCorrect).toBe(false);
    });

    it('returns incorrect when count differs', () => {
      const result = gradeAnswer(question, {
        pairs: [{ leftId: 'p-1', rightId: 'p-1' }],
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ CATEGORIZE ============
  describe('CATEGORIZE', () => {
    const question = q({
      type: 'CATEGORIZE',
      points: 10,
      payload: {
        categories: [
          { id: 'c-1', name: 'Mamíferos' },
          { id: 'c-2', name: 'Reptiles' },
        ],
        items: [
          { id: 'i-1', label: 'Perro', correctCategoryId: 'c-1' },
          { id: 'i-2', label: 'Serpiente', correctCategoryId: 'c-2' },
        ],
      },
    });

    it('returns correct when all assignments match', () => {
      const result = gradeAnswer(question, {
        assignments: { 'i-1': 'c-1', 'i-2': 'c-2' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when one is wrong', () => {
      const result = gradeAnswer(question, {
        assignments: { 'i-1': 'c-2', 'i-2': 'c-2' },
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ DRAG_AND_DROP ============
  describe('DRAG_AND_DROP', () => {
    const question = q({
      type: 'DRAG_AND_DROP',
      points: 10,
      payload: {
        targets: [
          { id: 't-1', label: 'Frutas', correctItemId: 'i-1' },
          { id: 't-2', label: 'Verduras', correctItemId: 'i-2' },
        ],
        items: [
          { id: 'i-1', label: 'Manzana' },
          { id: 'i-2', label: 'Zanahoria' },
        ],
      },
    });

    it('returns correct when all placements match', () => {
      const result = gradeAnswer(question, {
        placements: { 't-1': 'i-1', 't-2': 'i-2' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when swapped', () => {
      const result = gradeAnswer(question, {
        placements: { 't-1': 'i-2', 't-2': 'i-1' },
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ TABLE_FILL ============
  describe('TABLE_FILL', () => {
    const question = q({
      type: 'TABLE_FILL',
      points: 15,
      payload: {
        headers: ['País', 'Capital'],
        rows: [
          {
            id: 'r-1',
            cells: [
              { id: 'c-1', correctAnswer: 'Francia' },
              { id: 'c-2', correctAnswer: 'París' },
            ],
          },
        ],
      },
    });

    it('returns correct when all cells match', () => {
      const result = gradeAnswer(question, {
        cells: { 'c-1': 'Francia', 'c-2': 'París' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('is case-insensitive', () => {
      const result = gradeAnswer(question, {
        cells: { 'c-1': 'francia', 'c-2': 'parís' },
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when one cell differs', () => {
      const result = gradeAnswer(question, {
        cells: { 'c-1': 'Francia', 'c-2': 'Lyon' },
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ MATCHING_GRID ============
  describe('MATCHING_GRID', () => {
    const question = q({
      type: 'MATCHING_GRID',
      points: 10,
      payload: {
        rows: [
          { id: 'r-1', label: 'Juan' },
          { id: 'r-2', label: 'María' },
        ],
        columns: [
          { id: 'c-1', label: 'Programación' },
          { id: 'c-2', label: 'Diseño' },
        ],
        correctMatches: [
          { rowId: 'r-1', columnId: 'c-1' },
          { rowId: 'r-2', columnId: 'c-2' },
        ],
      },
    });

    it('returns correct when matches match exactly', () => {
      const result = gradeAnswer(question, {
        matches: [
          { rowId: 'r-1', columnId: 'c-1' },
          { rowId: 'r-2', columnId: 'c-2' },
        ],
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns correct when order is different', () => {
      const result = gradeAnswer(question, {
        matches: [
          { rowId: 'r-2', columnId: 'c-2' },
          { rowId: 'r-1', columnId: 'c-1' },
        ],
      });
      expect(result.isCorrect).toBe(true);
    });

    it('returns incorrect when one match is missing', () => {
      const result = gradeAnswer(question, {
        matches: [{ rowId: 'r-1', columnId: 'c-1' }],
      });
      expect(result.isCorrect).toBe(false);
    });

    it('returns incorrect when there is an extra match', () => {
      const result = gradeAnswer(question, {
        matches: [
          { rowId: 'r-1', columnId: 'c-1' },
          { rowId: 'r-2', columnId: 'c-2' },
          { rowId: 'r-1', columnId: 'c-2' },
        ],
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============ OPEN_ANSWER ============
  describe('OPEN_ANSWER', () => {
    const question = q({ type: 'OPEN_ANSWER', points: 20 });

    it('always returns null isCorrect (pending manual grading)', () => {
      const result = gradeAnswer(question, { text: 'Una respuesta' });
      expect(result.isCorrect).toBeNull();
      expect(result.pointsEarned).toBe(0);
    });

    it('returns null even when answer is empty', () => {
      const result = gradeAnswer(question, {});
      expect(result.isCorrect).toBeNull();
    });
  });
});