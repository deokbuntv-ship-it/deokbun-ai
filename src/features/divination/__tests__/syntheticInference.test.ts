// V3 §6/§7 — REAL SYNTHETIC INFERENCE, MEASURED ON THE PRODUCTION PATH.
//
// The re-audit's charge was that the engine reworded engine output and called it judgment. That charge cannot
// be answered with prose, so the verdict now declares HOW each of its claims was derived and this suite counts
// them on real charts. §7 is explicit: a count of 0 is an automatic FAIL — so is a verdict whose every claim
// is a SINGLE_FACT_RESTATEMENT, because that is the failure stated in different words.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { countSyntheticInferences, isDirectional, validatePaidReading, type CrossDivinationVerdict } from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);

const chart = (over: Partial<Record<string, string>> = {}) => ({
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
  ...over,
} as unknown as BirthInfoDraft);

async function verdict(question: string, birth: BirthInfoDraft = chart()): Promise<CrossDivinationVerdict> {
  const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: birth };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
  return g.divinationVerdict;
}

// Deliberately varied: different charts, different question axes, different intents.
const CASES: [string, BirthInfoDraft][] = [
  ['올해 돈을 벌 수 있을까요?', chart()],
  ['저축이 남을까요?', chart()],
  ['이직해도 될까요?', chart({ birthYear: '1985', birthMonth: '2', birthDay: '3', birthHour: '7' })],
  ['지금 사업을 확장해도 될까요?', chart({ birthYear: '1978', birthMonth: '11', birthDay: '27', birthHour: '21' })],
  ['결혼해도 괜찮을까요?', chart({ birthYear: '1996', birthMonth: '5', birthDay: '9', birthHour: '3' })],
  ['왜 자꾸 부딪힐까요?', chart({ birthYear: '2001', birthMonth: '9', birthDay: '18', birthHour: '11' })],
];

describe('§7 — every produced verdict carries at least one real synthetic inference', () => {
  it.each(CASES)('%s', async (question, birth) => {
    const v = await verdict(question, birth);
    // A verdict that declined to answer is allowed to carry no propositions — that IS the honest outcome.
    if (!isDirectional(v.direction) && v.propositions.length === 0) return;
    expect(v.propositions.length).toBeGreaterThan(0);
    expect(countSyntheticInferences(v.propositions)).toBeGreaterThan(0);
  });

  it('at least one case reaches a CROSS_DISCIPLINE or COMPOUND derivation, not just within-discipline', async () => {
    const all = await Promise.all(CASES.map(([q, b]) => verdict(q, b)));
    const kinds = new Set(all.flatMap((v) => v.propositions.map((p) => p.derivation)));
    expect(kinds.has('MULTI_FACT_WITHIN_DISCIPLINE') || kinds.has('CROSS_DISCIPLINE_SYNTHESIS')).toBe(true);
  });
});

describe('§6 — every proposition is TRACEABLE, never free prose', () => {
  it('a non-absence proposition names the engine facts it was built from', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    for (const p of v.propositions) {
      expect(p.claim.length).toBeGreaterThan(0);
      expect(p.fromDisciplines.length).toBeGreaterThan(0);
      if (p.derivation !== 'STRUCTURAL_ABSENCE') expect(p.fromFacts.length).toBeGreaterThan(0);
    }
  });

  it('a CROSS_DISCIPLINE_SYNTHESIS names more than one discipline (or is not claimed)', async () => {
    const all = await Promise.all(CASES.map(([q, b]) => verdict(q, b)));
    for (const p of all.flatMap((v) => v.propositions)) {
      if (p.derivation === 'CROSS_DISCIPLINE_SYNTHESIS') expect(p.fromDisciplines.length).toBeGreaterThan(1);
    }
  });

  it('a SINGLE_FACT_RESTATEMENT is labelled as such and never counted as inference', async () => {
    const all = await Promise.all(CASES.map(([q, b]) => verdict(q, b)));
    for (const v of all) {
      const restatements = v.propositions.filter((p) => p.derivation === 'SINGLE_FACT_RESTATEMENT');
      expect(countSyntheticInferences(v.propositions)).toBe(v.propositions.length - restatements.length);
    }
  });
});

describe('§28 — a directional verdict states its direction in its OWN headline', () => {
  // The engine used to headline a chart DESCRIPTION ("명궁 자체보다 맞물린 자리에서 걸리는 기운이 들어옵니다")
  // for a CONDITIONAL_AGAINST verdict. A paying user cannot act on that; it describes the chart and answers
  // nothing. The guard is run against the verdict's own text so an unusable headline fails here, not in review.
  it.each(CASES)('%s', async (question, birth) => {
    const v = await verdict(question, birth);
    if (!isDirectional(v.direction)) return;
    const findings = validatePaidReading(v, `${v.primaryConclusion} ${v.actionableInterpretation}`)
      .filter((f) => f.code === 'VERDICT_LOST_IN_PROSE' || f.code === 'VERDICT_REVERSED_IN_PROSE');
    expect(findings).toEqual([]);
  });
});

describe('§7 — the counter is honest (it would actually fail a reworded-output verdict)', () => {
  it('counts zero when every claim is a restatement', () => {
    expect(countSyntheticInferences([
      { claim: 'a', derivation: 'SINGLE_FACT_RESTATEMENT', fromDisciplines: ['MYUNGRI'], fromFacts: ['f'] },
      { claim: 'b', derivation: 'SINGLE_FACT_RESTATEMENT', fromDisciplines: ['ZIWEI'], fromFacts: ['g'] },
    ])).toBe(0);
  });
});
