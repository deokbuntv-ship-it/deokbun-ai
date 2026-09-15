// Qimen evidence STRUCTURED sections (directive §11) — question-time board facts + honest validation
// split + no-long-term-timing, delivered to the prompt. Facts only.
import { toQimenEvidence } from '../adapters/qimenEvidenceAdapter';
import { computeQimenBoard } from '../services/qimenService';
import type { QimenQuery } from '../domain/qimenTypes';

// 2024-01-15 10시 → 小寒 中元 陽 (provider-supported per the golden fixtures).
const timing: QimenQuery = { isTimingQuestion: true, questionTime: { year: 2024, month: 1, day: 15, hour: 10 } };

describe('toQimenEvidence — structured sections', () => {
  const ev = toQimenEvidence(computeQimenBoard(timing));

  it('available with backward-compatible summary/detail', () => {
    expect(ev.availability).toBe('available');
    expect(ev.summary).toMatch(/(陽遁|陰遁)/);
    expect(ev.summary).toContain('值符');
    expect((ev.detail ?? '').length).toBeGreaterThan(0);
  });
  it('emits labeled sections: 상황판 기준 / 값부·값사 / 구궁 / 근거·한계', () => {
    const labels = (ev.sections ?? []).map((s) => s.label);
    expect(labels).toContain('상황판 기준(질문 시점)');
    expect(labels).toContain('값부·값사');
    expect(labels).toContain('구궁(九宮)');
    expect(labels).toContain('근거·한계');
  });
  it('구궁 lists all nine palaces', () => {
    expect(ev.sections?.find((s) => s.label === '구궁(九宮)')?.lines).toHaveLength(9);
  });
  it('상황판 기준 states the QUESTION-TIME basis (출생 기반 아님)', () => {
    const basis = ev.sections?.find((s) => s.label === '상황판 기준(질문 시점)')?.lines.join(' ') ?? '';
    expect(basis).toContain('질문 시점');
    expect(basis).toContain('출생 기반 아님');
  });
  it('근거·한계 states the HONEST validation split + timezone + no long-term timing', () => {
    const prov = ev.sections?.find((s) => s.label === '근거·한계')?.lines.join(' ') ?? '';
    expect(prov).toContain('qimen-dunjia');
    expect(prov).toContain('교차 검증'); // 陰陽遁·三元·節氣·query 干支 independently validated
    expect(prov).toContain('특성 고정'); // 局數·八門·九星·八神 characterization-locked
    expect(prov).toContain('Asia/Seoul'); // question-time timezone assumption
    expect(prov).toMatch(/장기\s*연도|2028/); // NOT a long-term year predictor
  });
  it('hasTimingEvidence is false — question-time, not long-term year anchors', () => {
    expect(ev.hasTimingEvidence).toBe(false);
  });
  it('states facts, not interpretation (no verdict/decision words)', () => {
    const all = (ev.sections ?? []).flatMap((s) => s.lines).join(' ');
    for (const verdict of ['좋다', '나쁘다', '성공', '가면 좋', '길하다', '흉하다', '하세요']) {
      expect(all).not.toContain(verdict);
    }
  });
  it('not_applicable / missing_question_time → no fabricated sections', () => {
    const na = toQimenEvidence(computeQimenBoard({ isTimingQuestion: false, questionTime: null }));
    expect(na.availability).toBe('not_applicable');
    expect(na.sections).toBeUndefined();
    const miss = toQimenEvidence(computeQimenBoard({ isTimingQuestion: true, questionTime: null }));
    expect(miss.availability).toBe('calculation_failed');
    expect(miss.sections).toBeUndefined();
  });
});
