// V4B §16/§17 — SYNTHETIC INFERENCE, CERTIFIED BY THE HARNESS RATHER THAN BY THE ENGINE.
//
// V4A's version of this file counted the engine's OWN `REAL_SYNTHETIC_INFERENCE` labels, which the engine
// awarded itself from object shape. The independent audit put the true count at 2 against 117 reported.
//
// Nothing here trusts a label. Each candidate is certified by `certify()`, which removes or reverses that
// candidate's OWN premises, re-runs the derivation, and checks whether THAT conclusion moved — and for cross
// conclusions also mutates the parent propositions' target and temporal scope (§19).
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import {
  PRIMITIVE_RULE, isDirectional, screenAll, screenSynthesis, standingPropositions, validatePaidReading,
  type CrossDivinationVerdict, type DerivationContext,
} from '@/features/divination';
import { certify, crossMutations, crossRederive, myungriRederive } from './support/certify';

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

/**
 * V4B §17 — the runtime may only NOMINATE. Certification runs here, in the harness, by mutating each
 * candidate's own inputs and observing whether THAT conclusion moves.
 */
const certifyAll = (v: CrossDivinationVerdict) => {
  const ctx: DerivationContext & { asksTiming?: boolean } = {
    subject: v.premises[0]?.subject ?? '본인', questionIntent: v.questionIntent,
    askedAxis: v.questionDomain, dataComplete: true, asksTiming: v.asksTiming,
  };
  return standingPropositions(v.propositions)
    .filter((p) => p.derivationRule !== PRIMITIVE_RULE)
    .map((p) => (p.discipline === 'CROSS'
      // A cross conclusion is re-derived from the PROPOSITIONS it reconciles, and additionally attacked by
      // re-targeting and re-scoping those parents (§19).
      ? certify(p, v.premises, crossRederive(v.propositions, ctx), crossMutations(p, v.propositions, v.premises, ctx))
      : certify(p, v.premises, myungriRederive(ctx))));
};
const screened = (v: CrossDivinationVerdict) => screenAll(v.propositions, v.premises);

describe('§7 — every produced verdict carries at least one CERTIFIED synthetic inference', () => {
  it.each(CASES)('%s', async (question, birth) => {
    const v = await verdict(question, birth);
    if (v.propositions.length === 0) {
      // Declining is allowed — but then nothing may be claimed either.
      expect(isDirectional(v.direction)).toBe(false);
      return;
    }
    const certified = certifyAll(v);
    expect(certified.filter((c) => c.klass === 'REAL_SYNTHETIC_INFERENCE').length).toBeGreaterThan(0);
  });

  it('no case ever produces an UNSUPPORTED inference (a claim standing on nothing)', async () => {
    const all = await Promise.all(CASES.map(([q, b]) => verdict(q, b)));
    for (const v of all) {
      expect(screened(v).UNSUPPORTED_INFERENCE).toBe(0);
      expect(certifyAll(v).filter((c) => c.klass === 'UNSUPPORTED_INFERENCE')).toEqual([]);
    }
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
      expect(screenSynthesis(p, byId)).toBe('STATIC_RULE_OUTPUT');
    }
  });

  it('Ziwei/Qimen are honestly under-claimed — they contribute no synthesis while unmigrated (§19)', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    const byId = new Map(v.premises.map((p) => [p.id, p]));
    for (const p of v.propositions.filter((x) => x.discipline === 'ZIWEI' || x.discipline === 'QIMEN')) {
      expect(screenSynthesis(p, byId)).toBe('STATIC_RULE_OUTPUT');
    }
  });

  it('§17 — the runtime never emits a REAL label; only the harness can produce one', async () => {
    const v = await verdict('올해 돈을 벌 수 있을까요?');
    const byId = new Map(v.premises.map((p) => [p.id, p]));
    for (const p of v.propositions) {
      // `screenSynthesis` has no REAL in its vocabulary at all — CANDIDATE is the strongest it can say.
      expect(screenSynthesis(p, byId)).not.toBe('REAL_SYNTHETIC_INFERENCE');
    }
    expect(JSON.stringify(v)).not.toMatch(/REAL_SYNTHETIC_INFERENCE/);
  });

  it('§19 — every CROSS conclusion is certified by mutating the propositions it was built from', async () => {
    const all = await Promise.all(CASES.map(([q, b]) => verdict(q, b)));
    const crossCerts = all.flatMap((v) => certifyAll(v).filter((c) => c.rule.startsWith('CROSS_')));
    expect(crossCerts.length).toBeGreaterThan(0);
    // EVERY cross conclusion is attacked (removal, re-targeting, re-scoping of each parent) …
    for (const c of crossCerts) expect(c.structural.length).toBeGreaterThan(0);
    // … and only those the attacks actually MOVE are certified REAL. A conclusion several independent pairs
    // arrive at is over-determined: no single parent is necessary, so its necessity is unproven and it is not
    // claimed as a real inference.
    const real = crossCerts.filter((c) => c.klass === 'REAL_SYNTHETIC_INFERENCE');
    expect(real.length).toBeGreaterThan(0);
    for (const c of real) expect([...c.structural, ...c.removals, ...c.reversals].some((m) => m.changed)).toBe(true);
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
