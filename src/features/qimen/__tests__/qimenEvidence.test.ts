// Qimen evidence adapter tests (directive §23). Facts-only, availability passthrough.
import { toQimenEvidence } from '../adapters/qimenEvidenceAdapter';
import { computeQimenBoard } from '../services/qimenService';
import type { QimenQuery } from '../domain/qimenTypes';

const timing: QimenQuery = { isTimingQuestion: true, questionTime: { year: 2024, month: 6, day: 21, hour: 14 } };

describe('toQimenEvidence', () => {
  it('maps an available board to available evidence with factual summary + detail', () => {
    const ev = toQimenEvidence(computeQimenBoard(timing));
    expect(ev.availability).toBe('available');
    expect(ev.summary).toMatch(/(陽遁|陰遁)/);
    expect(ev.summary).toContain('국');
    expect(ev.summary).toContain('值符');
    expect(ev.detail!.length).toBeGreaterThan(0);
  });

  it('maps a non-timing question to not_applicable (no board)', () => {
    const ev = toQimenEvidence(computeQimenBoard({ isTimingQuestion: false, questionTime: null }));
    expect(ev.availability).toBe('not_applicable');
    expect(ev.summary).toBeUndefined();
  });

  it('maps missing question time to calculation_failed evidence (no fabricated summary)', () => {
    const ev = toQimenEvidence(computeQimenBoard({ isTimingQuestion: true, questionTime: null }));
    expect(ev.availability).toBe('calculation_failed');
    expect(ev.summary).toBeUndefined();
  });

  it('states facts, not interpretation (no verdict words)', () => {
    const ev = toQimenEvidence(computeQimenBoard(timing));
    for (const verdict of ['좋다', '나쁘다', '성공', '가면 좋', '길하다', '흉하다']) {
      expect(ev.summary).not.toContain(verdict);
    }
  });
});
