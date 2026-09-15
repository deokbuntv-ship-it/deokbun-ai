// V4A §21/§22 — THE PROPOSITION GRAPH SURVIVES THE REAL PERSIST → PARSE → RESTORE PATH.
//
// This is deliberately NOT an in-memory test. A previous sprint "proved" follow-up continuity by passing an
// object from one function to another; production actually round-trips through JSON and a strict whitelist
// parser, which silently dropped the verdict, and the green test hid it for a release. So everything here goes
// through `JSON.parse(JSON.stringify(...))` and the REAL `parseDecisionMeta`.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import { standingPropositions, type CrossDivinationVerdict } from '@/features/divination';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 2, 10, 1, 0, 0) / 1000);
const BIRTH = {
  displayName: 'A', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

async function turn(question: string): Promise<CrossDivinationVerdict> {
  const draft: ConsultationDraft = { subject: { id: 'self', displayName: 'A', relationship: null }, birthInfo: BIRTH };
  const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, question);
  if (g.status !== 'available' || !g.divinationVerdict) throw new Error('expected verdict');
  return g.divinationVerdict;
}

/** The REAL production round trip: serialize → JSON → strict whitelist parser → restore. */
function roundTrip(verdict: CrossDivinationVerdict): CrossDivinationVerdict {
  const meta = {
    answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
    resolvedGranularity: 'NONE', resolvedTargets: [],
    resolvedTemporalContext: {
      anchorEpochSeconds: NOW, resolvedTargets: [], timezone: 'Asia/Seoul',
      qimenActive: false, referenceYear: 2026, referenceMonth: 3,
    },
    divinationVerdict: verdict,
  };
  const parsed = parseDecisionMeta(JSON.parse(JSON.stringify(meta)));
  if (!parsed?.divinationVerdict) throw new Error('the verdict did not survive parseDecisionMeta');
  return parsed.divinationVerdict;
}

describe('§22 — the whole graph round-trips, not a polarity stub', () => {
  it('premises, propositions and derivation links all survive intact', async () => {
    const before = await turn('사업을 확장할까?');
    const after = roundTrip(before);

    expect(after.premises.length).toBe(before.premises.length);
    expect(after.propositions.length).toBe(before.propositions.length);
    expect(after.questionIntent).toBe(before.questionIntent);
    expect(after.evaluatedAtEpochSeconds).toBe(NOW);
    expect(after.questionDomain).toBe(before.questionDomain);
  });

  it('every derivation link still RESOLVES after the round trip (no dangling graph)', async () => {
    const after = roundTrip(await turn('사업을 확장할까?'));
    const premiseIds = new Set(after.premises.map((p) => p.id));
    const propIds = new Set(after.propositions.map((p) => p.id));
    for (const p of after.propositions) {
      for (const id of [...p.supportingPremiseIds, ...p.opposingPremiseIds]) expect(premiseIds.has(id)).toBe(true);
      for (const id of p.derivedFromPropositionIds) expect(propIds.has(id)).toBe(true);
    }
  });

  it('the restored graph re-derives the SAME standing conclusions (supersession is pure)', async () => {
    const before = await turn('사업을 확장할까?');
    const after = roundTrip(before);
    const ids = (v: CrossDivinationVerdict) => standingPropositions(v.propositions).map((p) => p.id).sort();
    expect(ids(after)).toEqual(ids(before));
  });

  it('the premises still carry their grounding facts and semantic relations', async () => {
    const after = roundTrip(await turn('사업을 확장할까?'));
    for (const p of after.premises) {
      expect(typeof p.semanticRelation).toBe('string');
      expect(p.assertion.length).toBeGreaterThan(0);
      expect(Array.isArray(p.sourceFactIds)).toBe(true);
    }
  });

  it('a graph with a BROKEN proposition fails closed — a hollow restore is worse than none', async () => {
    const v = await turn('사업을 확장할까?');
    const broken = JSON.parse(JSON.stringify(v));
    delete broken.propositions[0].derivationRule; // the field that says HOW it was reached
    const meta = {
      answerPlanVersion: 'a', decisionPolicyVersion: 'b', promptVersion: 'c',
      resolvedGranularity: 'NONE', resolvedTargets: [],
      resolvedTemporalContext: {
        anchorEpochSeconds: NOW, resolvedTargets: [], timezone: 'Asia/Seoul',
        qimenActive: false, referenceYear: 2026, referenceMonth: 3,
      },
      divinationVerdict: broken,
    };
    expect(parseDecisionMeta(meta)).toBeUndefined();
  });
});

describe('§22 — the Q1 → 왜? → 돈은? chain keeps the same subject and graph machinery', () => {
  it('"왜?" restores the same graph rather than starting an unrelated computation', async () => {
    const q1 = await turn('사업을 확장할까?');
    const carried = roundTrip(q1);
    // A WHY turn reasons over the RESTORED graph: the premises it must explain are exactly Q1's premises.
    expect(carried.premises.map((p) => p.id)).toEqual(q1.premises.map((p) => p.id));
    expect(carried.primaryConclusion).toBe(q1.primaryConclusion);
    // and the derivation that produced the headline is still inspectable
    const headline = standingPropositions(carried.propositions).find((p) => p.assertion === carried.primaryConclusion);
    if (headline) expect(headline.derivationRule.length).toBeGreaterThan(0);
  });

  it('"돈은?" drills into a DIFFERENT axis and derives it, without discarding the subject', async () => {
    const q1 = await turn('사업을 확장할까?');
    const q3 = await turn('돈은요?');
    expect(q3.questionDomain).not.toBe(q1.questionDomain); // a genuinely different axis was asked
    // same person, same instant, same machinery — not a shallow restart
    expect(q3.evaluatedAtEpochSeconds).toBe(q1.evaluatedAtEpochSeconds);
    expect(q3.premises.length).toBeGreaterThan(0);
    expect(q3.disciplineJudgments.length).toBe(q1.disciplineJudgments.length);
    // and the money axis was actually reasoned about, not inherited from Q1's headline
    expect(q3.propositions.some((p) => p.questionAxis === q3.questionDomain)).toBe(true);
  });

  it('the restored verdict still names every discipline that was applied', async () => {
    const after = roundTrip(await turn('사업을 확장할까?'));
    expect(after.disciplineJudgments.length).toBe(3);
    for (const c of after.contributions) expect(c.contribution.length).toBeGreaterThan(0);
  });
});
