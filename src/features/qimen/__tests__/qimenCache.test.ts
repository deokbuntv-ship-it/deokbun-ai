// Qimen cache seam tests (directive §24). Memo must equal the pure function and be
// deterministic for the same query time.
import { clearQimenCache, computeQimenBoardMemoized } from '../services/qimenCache';
import { computeQimenBoard } from '../services/qimenService';
import type { QimenQuery } from '../domain/qimenTypes';

const q = (over: Partial<QimenQuery['questionTime'] & object> = {}): QimenQuery => ({
  isTimingQuestion: true,
  questionTime: { year: 2025, month: 3, day: 20, hour: 9, ...over },
});

beforeEach(() => clearQimenCache());

describe('computeQimenBoardMemoized', () => {
  it('equals the pure computeQimenBoard', () => {
    expect(JSON.stringify(computeQimenBoardMemoized(q()))).toBe(JSON.stringify(computeQimenBoard(q())));
  });
  it('serves the same reference on repeated identical query', () => {
    expect(computeQimenBoardMemoized(q())).toBe(computeQimenBoardMemoized(q()));
  });
  it('distinguishes different query hours', () => {
    expect(computeQimenBoardMemoized(q({ hour: 9 }))).not.toBe(computeQimenBoardMemoized(q({ hour: 15 })));
  });
});
