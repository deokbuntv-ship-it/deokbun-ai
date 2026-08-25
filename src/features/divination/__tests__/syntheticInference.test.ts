// V4A §6/§7/§23 — REAL SYNTHETIC INFERENCE, MEASURED ON THE PRODUCTION PATH.
//
// The V3 version of this file counted `derivation !== 'SINGLE_FACT_RESTATEMENT'` on a proposition that was
// built AFTER the stance was chosen, from an evidence-array length. It reported 108 real inferences; the
// independent re-audit counted 0, and the re-audit was right.
//
// This version counts what `classifySynthesis` certifies: a NAMED derivation rule combined premises the caller
// can inspect, and the conclusion is not something any one of those premises already said. Materiality itself
// is proven separately, in `metamorphicReasoning.test.ts` — no static property of an object can show that.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import {
  PRIMITIVE_RULE, classifySynthesis, countRealSynthesis, isDirectional, validatePaidReading,
  type CrossDivinationVerdict,
} from '@/features/divination';

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

const census = (v: CrossDivinationVerdict) => countRealSynthesis(v.propositions, v.premises);

describe('§7 — every produced verdict carries at least one CERTIFIED synthetic inference', () => {
  it.each(CASES)('%s', async (question, birth) => {
    const v = await verdict(question, birth);
    if (v.propositions.length === 0) {
      // Declining is allowed — but then nothing may be claimed either.
      expect(isDirectional(v.direction)).toBe(false);
      return;
    }
    expect(census(v).REAL_SYNTHETIC_INFERENCE).toBeGreaterThan(0);
  });

  it('no case ever produces an UNSUPPORTED inference (a claim standing on nothing)', async () => {
    const all = await Promise.all(CASES.map(([q, b]) => verdict(q, b)));
    for (const v of all) expect(census(v).UNSUPPORTED_INFERENCE).toBe(0);
  });
});

describe('§6/§23 — the graph is traceable, and its classification is earned not asserted', () => {
  it('every proposition names its rule, and every non-PRIMITIVE one cites premises it did not restate', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    const byId = new Map(v.premises.map((p) => [p.id, p]));
    for (const p of v.propositions) {
      expect(p.derivationRule.length).toBeGreaterThan(0);
      if (p.derivationRule === PRIMITIVE_RULE) continue;
      const sources = [...p.supportingPremiseIds, ...p.opposingPremiseIds, ...p.derivedFromPropositionIds];
      expect(sources.length).toBeGreaterThan(0);
      // whatever it concluded, it did not simply repeat one of its own premises verbatim
      for (const id of [...p.supportingPremiseIds, ...p.opposingPremiseIds]) {
        expect(byId.get(id)?.assertion).not.toBe(p.assertion);
      }
    }
  });

  it('every premise link RESOLVES — a proposition cannot cite a premise that was not persisted', async () => {
    const v = await verdict('지금 사업을 확장해도 될까요?', CASES[3][1]);
    const ids = new Set(v.premises.map((p) => p.id));
    const propIds = new Set(v.propositions.map((p) => p.id));
    for (const p of v.propositions) {
      for (const id of [...p.supportingPremiseIds, ...p.opposingPremiseIds]) expect(ids.has(id)).toBe(true);
      for (const id of p.derivedFromPropositionIds) expect(propIds.has(id) || ids.has(id)).toBe(true);
    }
  });

  it('PRIMITIVE propositions are counted as STATIC_RULE_OUTPUT, never as inference', async () => {
    const v = await verdict('저축이 남을까요?');
    const byId = new Map(v.premises.map((p) => [p.id, p]));
    for (const p of v.propositions.filter((x) => x.derivationRule === PRIMITIVE_RULE)) {
      expect(classifySynthesis(p, byId)).toBe('STATIC_RULE_OUTPUT');
    }
  });

  it('Ziwei/Qimen are honestly under-claimed — they contribute no REAL synthesis while unmigrated (§19)', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    const byId = new Map(v.premises.map((p) => [p.id, p]));
    for (const p of v.propositions.filter((x) => x.discipline === 'ZIWEI' || x.discipline === 'QIMEN')) {
      expect(classifySynthesis(p, byId)).not.toBe('REAL_SYNTHETIC_INFERENCE');
    }
  });
});

describe('§12 — a non-decision question is never answered with a decision', () => {
  it.each([
    ['제 타고난 성격이 어떤가요?', chart()],
    ['왜 자꾸 부딪힐까요?', chart({ birthYear: '2001', birthMonth: '9', birthDay: '18', birthHour: '11' })],
  ])('%s', async (question, birth) => {
    const v = await verdict(question, birth);
    expect(isDirectional(v.direction)).toBe(false);
    if (v.direction === 'STRUCTURAL_ANSWER') {
      expect(v.propositions.some((p) => p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL')).toBe(true);
    }
  });
});

describe('§28 — a directional verdict states its direction in its OWN headline', () => {
  it.each(CASES)('%s', async (question, birth) => {
    const v = await verdict(question, birth);
    if (!isDirectional(v.direction)) return;
    const findings = validatePaidReading(v, `${v.primaryConclusion} ${v.actionableInterpretation}`)
      .filter((f) => f.code === 'VERDICT_LOST_IN_PROSE' || f.code === 'VERDICT_REVERSED_IN_PROSE');
    expect(findings).toEqual([]);
  });
});
