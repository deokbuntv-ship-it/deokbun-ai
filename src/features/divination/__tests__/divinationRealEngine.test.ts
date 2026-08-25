// DIVINATION_ENGINE_V1 — REAL-ENGINE end-to-end (§34 no fake pass).
//
// The benchmark proves the cross judge's LOGIC on constructed judgments. This file proves the judges actually
// bind to what the SHIPPED engines emit — in particular that the Ziwei judge's palace lookup matches the
// engine's real localized palace names (명궁/부처/재백/관록/천이/전택) and that a verdict reaches the paid
// consultation grounding. If a future engine/locale change renamed a palace, this fails instead of silently
// degrading every paid reading to "no Ziwei signal".
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import { computeZiweiChartMemoized, toZiweiBirthInput } from '@/features/ziwei';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { isDirectional, judgeZiwei, palaceForDomain, validatePaidReading } from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15, 3, 0, 0) / 1000);
const birthInfo = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

describe('REAL Ziwei engine — the judge binds to the actual chart, not a hoped-for shape', () => {
  const result = computeZiweiChartMemoized(toZiweiBirthInput(birthInfo));

  it('the engine emits the localized palace names the judge looks up', () => {
    expect(result.availability).toBe('available');
    const names = (result.chart?.palaces ?? []).map((p) => p.name);
    expect(names.length).toBe(12);
    // every domain the judge routes must resolve to a palace that actually exists in the chart
    for (const domain of ['MONEY_INFLOW', 'MONEY_RETENTION', 'CAREER', 'MOVEMENT', 'RELATION_STABILITY', 'GENERAL'] as const) {
      const target = palaceForDomain(domain);
      expect(target).not.toBeNull();
      expect(names.some((n) => n.includes(target!))).toBe(true);
    }
  });

  it('produces a DIRECTIONAL, evidence-named judgment from the real chart', () => {
    const j = judgeZiwei({
      question: '올해 돈을 벌 수 있을까요?',
      questionDomain: 'MONEY_INFLOW',
      chart: result.chart,
      availability: result.availability,
    });
    expect(j.applicable).toBe(true);
    expect(j.stance).not.toBe('NOT_APPLICABLE');
    expect(j.dominantConclusion.length).toBeGreaterThan(0);
    // the dominant factor must name a real chart element (palace name), never a generic phrase
    expect(j.dominantFactor).toMatch(/재백/);
  });

  it('a different question reads a DIFFERENT palace (the answer is question-specific)', () => {
    const money = judgeZiwei({ question: '돈?', questionDomain: 'MONEY_INFLOW', chart: result.chart, availability: result.availability });
    const marriage = judgeZiwei({ question: '결혼?', questionDomain: 'RELATION_STABILITY', chart: result.chart, availability: result.availability });
    expect(money.dominantFactor).not.toBe(marriage.dominantFactor);
    expect(marriage.dominantFactor).toMatch(/부처/);
  });

  it('fail-closed without an exact birth time — never a guessed chart', () => {
    const noTime = computeZiweiChartMemoized(
      toZiweiBirthInput({ ...birthInfo, birthTimeAccuracy: 'unknown', birthHour: null } as unknown as BirthInfoDraft),
    );
    const j = judgeZiwei({ question: '결혼?', questionDomain: 'RELATION_STABILITY', chart: noTime.chart, availability: noTime.availability });
    expect(j.applicable).toBe(false);
    expect(j.stance).toBe('NOT_APPLICABLE');
    expect(j.applicabilityReason).toMatch(/출생시간/);
  });
});

describe('REAL paid-consultation grounding carries a cross-discipline verdict', () => {
  const draft: ConsultationDraft = {
    subject: { id: 'self', displayName: '테스트', relationship: null },
    birthInfo,
  };

  it('a money question yields a directional verdict with named contributions', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '올해 돈을 벌 수 있을까요?');
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    const v = g.divinationVerdict;
    expect(v).toBeTruthy();
    if (!v) return;
    expect(isDirectional(v.direction)).toBe(true); // never a shrug on a real chart
    expect(v.primaryConclusion).not.toMatch(/반반|경우에\s*따라/);
    // every discipline is accounted for: applied with a contribution, or declared not applicable
    const names = v.contributions.map((c) => c.discipline).sort();
    expect(names).toEqual(['MYUNGRI', 'QIMEN', 'ZIWEI']);
    for (const c of v.contributions) expect(c.contribution.trim().length).toBeGreaterThan(0);
    // subject-specific evidence is cited (this could not have been written for a stranger)
    expect(v.evidenceReferences.some((r) => r.lines.length > 0)).toBe(true);
  });

  it('a NATAL question leaves Qimen not-applicable (never fabricated to show three disciplines)', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '제 타고난 성격이 어떤가요?');
    if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
    const qimen = g.divinationVerdict.contributions.find((c) => c.discipline === 'QIMEN')!;
    expect(qimen.applied).toBe(false);
    expect(qimen.contribution).toMatch(/적용하지 않았습니다|볼 성질|세우지 못했/);
  });

  it('the quality guard accepts prose that carries the verdict and rejects prose that neutralizes it', async () => {
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '사업 확장해도 될까요?');
    if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
    const v = g.divinationVerdict;
    const neutralized = '좋은 점도 있고 어려운 점도 있습니다. 경우에 따라 다릅니다. 신중하게 결정하세요.';
    expect(validatePaidReading(v, neutralized).length).toBeGreaterThan(0);
    // and an answer that states the verdict's own conclusion passes the direction check
    expect(
      validatePaidReading(v, `${v.primaryConclusion} ${v.actionableInterpretation}`)
        .filter((f) => f.code === 'VERDICT_LOST_IN_PROSE' || f.code === 'NEUTRALIZED_CONTRADICTION').length,
    ).toBe(0);
  });
});
