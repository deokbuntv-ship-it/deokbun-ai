// V4F — PERSISTED GRAPH FAIL-CLOSED FINAL GATE. §12 required adversarial tests A-L, plus §13's explicit
// G1-G5 regression pins. The narrow additions this sprint made to decisionMeta.ts's whitelist parser:
// restriction is REQUIRED (not just forbidden) on the rules proven to always mint one; a derived conclusion
// needs its rule's own verified minimum ancestry, not a flat two; persisted adequacy is RECOMPUTED from the
// cited premises, not trusted; a Myungri-native PRIMITIVE's relation/type/direction must be the one
// primitivePropositions() would have produced; the verdict's own direction must not contradict what its
// headline propositions project to; an empty graph may only carry a non-assertive stance; and a malformed
// (present-but-invalid) prior decision row fails a dependent follow-up closed instead of quietly reading as
// "no history".
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type {
  ConsultationDecisionMeta, PriorHistoryLoad, ServerConsultationDeps, ServerConsultationRequest,
} from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { parseDecisionMeta, parseDivinationVerdict } from '@/features/chat/server/decisionMeta';

// ══ A-G, K — GRAPH-SHAPE ADVERSARIAL TESTS (pure parser, no server) ═══════════════════════════════
//
// One minimal but REAL graph shape: a single ASSERTS premise (a Myungri SEAT_CONTACT/CONNECTS reading, DIRECT
// applicability + EXACT reliability) restated by its one legitimate PRIMITIVE proposition. Verified against
// the real reasoner's own output (v4dFollowUpExtension.test.ts turns real questions through the real kernel)
// to actually be the shape restated — not a shape invented for this file to reject conveniently.
describe('§12 — persisted graph integrity, adversarial', () => {
  const good = () => ({
    question: 'q', questionDomain: 'CAREER', questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: 1000, asksTiming: false,
    premises: [{
      id: 'p1', discipline: 'MYUNGRI', sourceFactIds: ['f'], subject: '본인',
      target: { key: 'NATAL_SEAT:MONTH', label: '원국 월지', kind: 'NATAL_SEAT' },
      questionIntent: 'DECISION', questionAxis: 'CAREER', temporalScope: 'DAEWOON',
      semanticRelation: 'CONNECTS', concept: 'SEAT_CONTACT', assertion: 'a', role: 'ASSERTS',
      reliability: 'EXACT', applicability: 'DIRECT', doctrineReference: 'd',
    }],
    primaryConclusion: 'c', direction: 'FOR', dominantBasis: 'b', verdictVersion: 'v',
    disciplineJudgments: [{
      discipline: 'MYUNGRI', stance: 'FOR', applicable: true, dataReliability: 'EXACT',
      questionDomain: 'CAREER', temporalScope: 'DAEWOON', dominantConclusion: 'c', dominantFactor: 'f',
      directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
      domainSubJudgments: [], confidence: 'HIGH', questionDirectness: 'DIRECT',
      evidenceStrength: 'MODERATE', factGroupsUsed: [],
    }],
    contributions: [], axisVerdicts: [], evidenceReferences: [],
    propositions: [{
      id: 'x1', discipline: 'MYUNGRI', subject: '본인',
      target: { key: 'NATAL_SEAT:MONTH', label: '원국 월지', kind: 'NATAL_SEAT' },
      questionIntent: 'DECISION', questionAxis: 'CAREER', temporalScope: 'DAEWOON',
      assertion: 'a', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
      supportingPremiseIds: ['p1'], opposingPremiseIds: [], derivedFromPropositionIds: [],
      unresolvedPremiseIds: [], doctrineReferences: ['d'], derivationRule: 'PRIMITIVE',
      adequacy: {
        supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE',
        dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED',
      },
    }],
    headlinePropositionIds: ['x1'],
    agreementPoints: [], contradictionPoints: [], contradictionResolutions: [],
    natalBaseline: null, currentFlow: null, timingConclusion: null,
    favorableFactors: [], riskFactors: [], actionableInterpretation: 'i',
    confidence: 'HIGH', confidenceReason: 'r',
  });
  const mutated = (f: (g: ReturnType<typeof good>) => void) => {
    const g = good();
    f(g);
    return parseDivinationVerdict(JSON.parse(JSON.stringify(g)));
  };

  // K — the control: an unmodified, legitimately-shaped graph restores.
  it('K — a valid graph still restores', () => {
    expect(parseDivinationVerdict(good())).toBeDefined();
  });

  // A — RESTRICTED with no restriction is rejected, for a rule proven to always mint one.
  it('A — RESTRICTED with no restriction is rejected', () => {
    expect(mutated((g) => {
      const x1 = g.propositions[0] as Record<string, unknown>;
      x1.derivationRule = 'CONTESTED_SHARE';
      x1.derivedFromPropositionIds = ['p:p1']; // satisfies CONTESTED_SHARE's own ancestry minimum (1)
      x1.conclusionType = 'COMPOUND';
      x1.direction = 'RESTRICTED'; // no `restriction` field set — the defect under test
    })).toBeUndefined();
  });

  // B — an impossible STRUCTURAL + RESTRICTED + TIMING combination is rejected.
  it('B — STRUCTURAL conclusion carrying a RESTRICTED/TIMING direction is rejected', () => {
    expect(mutated((g) => {
      const x1 = g.propositions[0] as Record<string, unknown>;
      x1.conclusionType = 'STRUCTURAL';
      x1.direction = 'RESTRICTED';
      x1.restriction = 'TIMING';
    })).toBeUndefined();
  });

  // C — a forged ADEQUATE grade over a DIRECT+REDUCED premise (sideAdequacy needs DIRECT *and* EXACT).
  it('C — a DIRECT+REDUCED premise cannot back a persisted ADEQUATE', () => {
    expect(mutated((g) => {
      (g.premises[0] as Record<string, unknown>).reliability = 'REDUCED';
      // g.propositions[0].adequacy.supportAdequacy stays 'ADEQUATE' — stale/forged relative to the premise.
    })).toBeUndefined();
  });

  // D — an OPPOSES premise cannot back a FAVORABLE primitive (OPPOSES projects to UNFAVORABLE only).
  it('D — an OPPOSES premise supporting a FAVORABLE primitive is rejected', () => {
    expect(mutated((g) => {
      (g.premises[0] as Record<string, unknown>).semanticRelation = 'OPPOSES';
      // g.propositions[0].direction stays 'FAVORABLE' — incompatible with what an OPPOSES premise licenses.
    })).toBeUndefined();
  });

  // E — a known rule name with fewer parents than that rule could ever cite.
  it('E — a known derivation rule with an insufficient parent set is rejected', () => {
    expect(mutated((g) => {
      const x1 = g.propositions[0] as Record<string, unknown>;
      x1.derivationRule = 'RECURRING_FRICTION_CAUSE'; // requires >= 2 ancestry
      // derivedFromPropositionIds stays [] — zero parents, below even CONTESTED_SHARE's relaxed minimum of 1.
    })).toBeUndefined();
  });

  // F — the graph's own headline stances FOR, but the persisted verdict claims AGAINST.
  it('F — a FAVORABLE-projecting graph cannot back a persisted AGAINST verdict', () => {
    expect(mutated((g) => { g.direction = 'AGAINST'; })).toBeUndefined();
  });

  // G — zero propositions can never back an authoritative directional verdict.
  it('G — an empty graph cannot back a persisted FOR', () => {
    expect(mutated((g) => {
      g.premises = [];
      g.propositions = [];
      g.headlinePropositionIds = [];
      // g.direction stays 'FOR'.
    })).toBeUndefined();
  });
});

// ══ §13 — G1-G5 REGRESSION, PINNED EXPLICITLY ═══════════════════════════════════════════════════
//
// V4F touches only decisionMeta.ts's whitelist parser; it must not be possible for that change to have
// altered what G1-G5 (target identity, order invariance, no-arbitrary-arbitration, temporal independence,
// follow-up continuity) certified. Each assertion below names the G it stands for.
describe('§13 — G1-G5 regression, explicit', () => {
  const digestProvider: DigestProvider = {
    async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
  };
  const T1 = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
  const T2 = Math.floor(Date.UTC(2024, 6, 15, 1, 0, 0) / 1000);
  const birth: BirthInfoDraft = {
    displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
    birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
  };
  const GOOD_ANSWER = JSON.stringify({
    coreSummary: '차분한 흐름입니다.',
    coreInterpretation:
      '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. '
      + '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
    strengths: ['끈기'], cautions: ['속도를 조절하는 편이 좋습니다.'], followUps: ['어떤 방식이 맞을까요?'],
  });
  const deps = (now: number, loadPreviousDecision?: () => Promise<PriorHistoryLoad>): ServerConsultationDeps => ({
    digestProvider, nowEpochSeconds: now, async callLLM() { return GOOD_ANSWER; },
    ...(loadPreviousDecision ? { loadPreviousDecision } : {}),
  });
  const request = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });

  /** Round-trips through the real whitelist parser, exactly as a re-read database row would. */
  async function turn(
    question: string, now: number, previous?: ConsultationDecisionMeta | null,
  ): Promise<ConsultationDecisionMeta> {
    const load = previous === undefined ? undefined
      : async () => (previous === null ? { status: 'NONE' as const } : { status: 'VALID' as const, meta: previous });
    const out = await buildServerConsultation(request(question), deps(now, load));
    if (!out.ok) throw new Error(`turn failed: ${out.reason}`);
    const meta = out.structuredResult?.decisionMeta as ConsultationDecisionMeta | undefined;
    if (!meta) throw new Error('no decisionMeta');
    const restored = parseDecisionMeta(JSON.parse(JSON.stringify(meta)) as unknown);
    if (!restored) throw new Error('decisionMeta failed to restore');
    return restored;
  }

  it('G1 — target identity still restores a real graph unchanged', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    expect(q1.divinationVerdict).toBeDefined();
    expect(q1.divinationVerdict!.propositions.length).toBeGreaterThan(0);
  });

  it('G4 — temporal independence: a refinement six months later still answers from T1', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T2, q1);
    expect(q2.divinationVerdict!.evaluatedAtEpochSeconds).toBe(T1);
    expect(q2.resolvedTemporalContext.anchorEpochSeconds).toBe(T1);
  });

  // L — G5 (follow-up continuity): a valid MONEY refinement still EXTENDS the graph, not replaces it.
  it('L / G5 — a valid MONEY refinement still extends the standing graph', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('돈은?', T1, q1);
    const before = new Set(q1.divinationVerdict!.propositions.map((p) => p.id));
    const after = new Set(q2.divinationVerdict!.propositions.map((p) => p.id));
    for (const id of before) expect(after.has(id)).toBe(true);
    expect(q2.graphRevision?.kind).toBe('EXTENDED');
  });

  it('G2/G3 — an explicit re-evaluation still restarts cleanly (order invariance / no arbitration)', async () => {
    const q1 = await turn('사업을 확장할까?', T1);
    const q2 = await turn('지금 다시 보면?', T2, q1);
    expect(q2.divinationVerdict!.evaluatedAtEpochSeconds).toBe(T2);
    expect(q2.graphRevision?.kind).toBe('REEVALUATED');
  });
});

// ══ H-J — MALFORMED PRIOR HISTORY FAILS CLOSED (real server round trip) ════════════════════════════
describe('§9 — a malformed (present but invalid) prior decision fails closed', () => {
  const digestProvider: DigestProvider = {
    async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
  };
  const T1 = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
  const T2 = Math.floor(Date.UTC(2024, 6, 15, 1, 0, 0) / 1000);
  const birth: BirthInfoDraft = {
    displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
    birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
  };
  const GOOD_ANSWER = JSON.stringify({
    coreSummary: 's',
    coreInterpretation:
      '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. '
      + '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
    strengths: ['끈기'], cautions: ['속도 조절'], followUps: ['?'],
  });
  const deps = (now: number): ServerConsultationDeps => ({
    digestProvider, nowEpochSeconds: now, async callLLM() { return GOOD_ANSWER; },
    loadPreviousDecision: async () => ({ status: 'MALFORMED' as const }),
  });
  const request = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });

  // H — an ordinary dependent follow-up over malformed history declines rather than starting a fresh reading.
  it('H — "돈은?" over malformed history produces no fresh divinationVerdict', async () => {
    const out = await buildServerConsultation(request('돈은?'), deps(T1));
    if (!out.ok) throw new Error(`turn failed: ${out.reason}`);
    expect(out.structuredResult?.decisionMeta?.divinationVerdict).toBeUndefined();
  });

  // I — the WHY path over malformed history ALSO declines, not merely the general REFINE_EXISTING branch.
  it('I — "왜?" over malformed history produces no fresh divinationVerdict', async () => {
    const out = await buildServerConsultation(request('왜?'), deps(T1));
    if (!out.ok) throw new Error(`turn failed: ${out.reason}`);
    expect(out.structuredResult?.decisionMeta?.divinationVerdict).toBeUndefined();
  });

  // J — REEVALUATE_NOW is unaffected by the malformed-history fallback: it may still proceed to a fresh read.
  it('J — "지금 다시 보면?" over malformed history still proceeds to a fresh reading', async () => {
    const out = await buildServerConsultation(request('지금 다시 보면?'), deps(T2));
    if (!out.ok) throw new Error(`turn failed: ${out.reason}`);
    const verdict = out.structuredResult?.decisionMeta?.divinationVerdict;
    expect(verdict).toBeDefined();
    expect(verdict!.evaluatedAtEpochSeconds).toBe(T2);
  });
});
