// V4B §27 — THE LEGACY COMPATIBILITY TIER IS FULLY DECOUPLED FROM PAID DIVINATION.
//
// The tier (`bond.points + friction.points + element.points` against hand-chosen thresholds) may keep existing
// for the summary card. What it may NOT do is act as the professional judgment — and the independent audit
// found it still doing so in three ways: anchoring the LLM's interpretation, standing in as divination when
// the structural judgment declined, and forcing mitigation language.
import { createHash } from 'crypto';

import type { DigestProvider } from '@/features/interpretation';
import { buildCompatibilityEvidence } from '@/features/compatibility/engine';
import { executeSajuFromBirthInput } from '@/features/interpretation';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { computeZiweiChartMemoized, toZiweiBirthInput } from '@/features/ziwei';
import { judgePairMyungri, judgePairZiwei, type JudgmentDomain } from '@/features/divination';
import type { BirthInfoDraft } from '@/features/consultation';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};

const chart = (over: Record<string, unknown>): BirthInfoDraft =>
  ({
    displayName: 'X', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as unknown as BirthInfoDraft;

const A = chart({ displayName: 'A' });
const B = chart({ displayName: 'B', gender: 'female', birthYear: '1978', birthMonth: '2', birthDay: '3', birthHour: '5', birthMinute: '30' });
const C = chart({ displayName: 'C', birthYear: '2001', birthMonth: '11', birthDay: '27', birthHour: '21' });

async function pairFor(self: BirthInfoDraft, target: BirthInfoDraft) {
  const [se, te] = await Promise.all([
    executeSajuFromBirthInput(toSajuEngineInput(self), { digestProvider }),
    executeSajuFromBirthInput(toSajuEngineInput(target), { digestProvider }),
  ]);
  if (!se.success || !te.success) throw new Error('engine failed');
  const pair = buildCompatibilityEvidence(
    { engineResult: se.engineResult, label: String(self.displayName) },
    { engineResult: te.engineResult, label: String(target.displayName) },
  );
  if (pair.availability !== 'available') throw new Error('pair unavailable');
  return pair;
}

const judge = async (self: BirthInfoDraft, target: BirthInfoDraft, domain: JudgmentDomain, assessmentOverride?: unknown) => {
  const pair = await pairFor(self, target);
  return judgePairMyungri({
    question: 'q', questionDomain: domain, facts: pair.facts,
    assessment: (assessmentOverride ?? pair.assessment) as typeof pair.assessment,
    selfLabel: 'A', targetLabel: 'B',
  });
};

describe('§27 — the numeric tier cannot change a professional conclusion', () => {
  it('REWRITING the tier to its worst value leaves every axis stance untouched', async () => {
    const pair = await pairFor(A, B);
    const worst = {
      ...pair.assessment,
      overall: 'WATCH', overallLabel: '주의',
      dimensions: pair.assessment.dimensions.map((d) => ({ ...d, signal: 'WATCH' as const, verdict: '나쁨' })),
    };
    const base = await judge(A, B, 'RELATION_BOND');
    const rigged = await judge(A, B, 'RELATION_BOND', worst);
    expect(rigged.domainSubJudgments.map((s) => `${s.domain}:${s.stance}`))
      .toEqual(base.domainSubJudgments.map((s) => `${s.domain}:${s.stance}`));
    expect(rigged.stance).toBe(base.stance);
  });

  it('REWRITING the tier to its best value likewise changes nothing', async () => {
    const pair = await pairFor(A, C);
    const best = {
      ...pair.assessment,
      overall: 'VERY_GOOD', overallLabel: '아주 좋음',
      dimensions: pair.assessment.dimensions.map((d) => ({ ...d, signal: 'POSITIVE' as const, verdict: '좋음' })),
    };
    const base = await judge(A, C, 'CONFLICT');
    const rigged = await judge(A, C, 'CONFLICT', best);
    expect(rigged.stance).toBe(base.stance);
    expect(rigged.dominantFactor).toBe(base.dominantFactor);
  });

  it('the tier text never leaks into a judgment conclusion or its evidence', async () => {
    const j = await judge(A, B, 'RELATION_STABILITY');
    const text = JSON.stringify(j);
    // the tier's own vocabulary (its labels and dimension verdicts) must not appear as divination reasoning
    for (const label of ['아주 좋음', '보통', '주의', 'VERY_GOOD', 'NEEDS_CARE', 'WATCH']) {
      expect(text).not.toContain(label);
    }
  });

  it('every axis conclusion names a STRUCTURAL fact rather than a summary', async () => {
    const j = await judge(A, B, 'RELATION_BOND');
    const named = j.domainSubJudgments.flatMap((s) => [...s.evidence, ...s.counterEvidence]);
    expect(named.length).toBeGreaterThan(0);
    for (const e of named) expect(String(e.fact).length).toBeGreaterThan(0);
  });

  it('pair Ziwei is likewise judged from palaces, not from any tier', async () => {
    const j = judgePairZiwei({
      question: 'q', questionDomain: 'RELATION_STABILITY',
      selfChart: computeZiweiChartMemoized(toZiweiBirthInput(A)).chart,
      targetChart: computeZiweiChartMemoized(toZiweiBirthInput(B)).chart,
      selfLabel: 'A', targetLabel: 'B',
    });
    const text = JSON.stringify(j);
    for (const label of ['아주 좋음', '보통', '주의']) expect(text).not.toContain(label);
  });
});

describe('§27 — the tier does not anchor the prompt, nor stand in when structure declines', () => {
  const read = (p: string) => require('fs').readFileSync(require('path').join(process.cwd(), p), 'utf8') as string;
  /**
   * Strip comments before matching. These tests ask what the CODE does, and both files carry comments that
   * quote the removed coupling verbatim to explain why it went — matching those would fail the file for
   * documenting its own fix.
   */
  const code = (p: string) => read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  const source = () => read('src/features/chat/server/buildCompatibilityConsultation.ts');

  it('the tier is no longer described or used as the interpretation ANCHOR', () => {
    expect(code('src/features/chat/server/buildCompatibilityConsultation.ts')).not.toMatch(/anchor the LLM must verbalize/);
    expect(source()).toMatch(/요약 카드 표기용 종합 티어/);
  });

  it('when the structural verdict is absent, the prompt says so instead of promoting the tier', () => {
    const s = source();
    expect(s).toMatch(/【구조 판정 없음】/);
    expect(s).toMatch(/요약 카드의 종합 티어를 판정처럼 바꿔 말하지 마십시오/);
  });

  it('and it explicitly forbids covering the gap with hedging language (§27 mitigation)', () => {
    expect(source()).toMatch(/완곡한 표현으로 대신하지 마십시오/);
  });

  it('when a structural verdict EXISTS, it — not the tier — binds the answer', () => {
    expect(source()).toMatch(/위 판정이 이 답변의 결론입니다/);
    expect(source()).toMatch(/티어를 결론처럼 말하지 마십시오/);
  });

  it('the divination judge no longer reads the scored dimensions at all', () => {
    const judgeSource = code('src/features/divination/compatibilityJudge.ts');
    // `reducedPrecision` (an input-quality flag) is the ONLY thing taken from the assessment.
    expect(judgeSource).not.toMatch(/dimensions\.find/);
    expect(judgeSource).not.toMatch(/\.signal\b/);
    expect(judgeSource).not.toMatch(/overallLabel/);
  });
});
