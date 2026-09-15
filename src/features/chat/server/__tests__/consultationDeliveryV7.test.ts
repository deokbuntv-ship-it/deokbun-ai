// CONSULTATION DECISION DELIVERY V7 — the synthesis reaches the customer, or it does not exist.
//
// DecisionCrossSynthesisV1 shipped with no consumer, so 28 compound truths and 4 genuine standoffs were still
// delivered through a vocabulary whose only word for them is 정하지 않겠습니다. These tests lock the bridge,
// and with equal weight lock what the bridge may not do: no invented winner, no overclaimed corroboration,
// no raw chart relation as the conclusion, and no advice that points away from the conclusion above it.
//
// Every fixture is SYNTHETIC. None is copied from any benchmark.
import { createHash } from 'crypto';

import {
  buildConsumerDecisionPlan, consumerMeaningDirective, renderConsumerDecisionSections,
  validateConsumerCoverage, CONFLICT_SECTION_TITLE, DECISION_MEANING_TITLE,
} from '@/features/chat/server/consumerDecisionPlan';
import { buildConclusionSurfacePlan, closingDirectionOf } from '@/features/chat/server/consultationSurfacePlan';
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { renderVerdictDirective, judgeCross } from '@/features/divination';
import type {
  CrossDivinationVerdict, DivinationJudgment, JudgmentDomain, JudgmentEvidence, Stance,
} from '@/features/divination/contracts';
import type {
  DecisionCrossSynthesisV1, SynthesisParticipant, SynthesisTruth,
} from '@/features/divination';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────
const ev = (fact: string, domain: JudgmentDomain = 'CAREER'): JudgmentEvidence => ({
  fact, meaning: `${fact} 근거`, domain, temporalScope: 'NATAL', directness: 'DIRECT',
});

const participant = (over: Partial<SynthesisParticipant> = {}): SynthesisParticipant => ({
  discipline: 'MYUNGRI', authority: 'DIRECT_PROPOSITION', axis: 'CAREER', role: 'PRIMARY',
  direction: 'FAVORABLE', statement: '자리는 열립니다.', directness: 'DIRECT', reliability: 'EXACT',
  temporalBand: 'STRUCTURAL', evidenceIds: ['정관 통근'], derivedFromAxes: [], ...over,
});

const truth = (over: Partial<SynthesisTruth> = {}): SynthesisTruth => ({
  discipline: 'MYUNGRI', axis: 'MOVEMENT', role: 'CONSTRAINT', direction: 'UNFAVORABLE',
  temporalBand: 'STRUCTURAL', statement: '움직임 쪽은 걸립니다.', evidenceIds: ['역마 충'], ...over,
});

const synthesis = (over: Partial<DecisionCrossSynthesisV1> = {}): DecisionCrossSynthesisV1 => ({
  propositionId: 'SHOULD_I_DO_X|DIRECTION|CAREER|CAREER|ASPECT',
  requestedOutcome: 'DIRECTION',
  participatingJudgments: [participant()],
  primaryJudgments: [participant()],
  qualifiers: [],
  resolutionKind: 'AGREED',
  finalStance: 'FOR',
  supportingTruths: [],
  limitingTruths: [],
  temporalQualifications: [],
  outcomeQualifications: [],
  conflictPairs: [],
  provenance: ['deokbunai.decision-cross-synthesis.v1'],
  ...over,
});

/** A verdict whose GRAPH declined — the case the old vocabulary could only render as a refusal. */
const verdict = (over: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict => ({
  question: '지금 다니는 곳을 그만두고 다른 데로 옮겨도 될까요?',
  questionDomain: 'CAREER',
  questionIntent: 'DECISION',
  evaluatedAtEpochSeconds: 0,
  asksTiming: false,
  premises: [],
  primaryConclusion: '자리·직업에 대해서는 서로 다른 결론이 함께 성립합니다.',
  headlinePropositionIds: [],
  direction: 'INSUFFICIENT_EVIDENCE' as Stance,
  dominantBasis: '서로 다른 방향으로 함께 서는 결론 3건 (미확정)',
  disciplineJudgments: [] as DivinationJudgment[],
  contributions: [],
  axisVerdicts: [],
  propositions: [],
  agreementPoints: [],
  contradictionPoints: [],
  contradictionResolutions: [],
  natalBaseline: null,
  currentFlow: null,
  timingConclusion: null,
  favorableFactors: [],
  riskFactors: [],
  actionableInterpretation: '',
  confidence: 'MEDIUM',
  confidenceReason: '',
  evidenceReferences: [],
  verdictVersion: 'x',
  decisionCrossSynthesis: synthesis(),
  ...over,
} as unknown as CrossDivinationVerdict);

const planFor = (s: DecisionCrossSynthesisV1) => buildConsumerDecisionPlan(verdict({ decisionCrossSynthesis: s }))!;

// ════ 1–2. AGREED ═══════════════════════════════════════════════════════════════════════════════════
describe('AGREED delivers a clear direction', () => {
  it('1 — AGREED FOR reaches the customer as a supported direction, not a decline', () => {
    const p = planFor(synthesis({
      primaryJudgments: [participant(), participant({ discipline: 'ZIWEI' })],
      participatingJudgments: [participant(), participant({ discipline: 'ZIWEI' })],
    }));
    expect(p.resolutionKind).toBe('AGREED');
    expect(p.primaryDirection).toBe('PROCEED');
    expect(p.conclusionState).toBe('OPEN');
    expect(p.headlineMeaning).toMatch(/열려/);
    // The graph declined; the delivered surface does not.
    const surface = buildConclusionSurfacePlan(verdict({ decisionCrossSynthesis: p.resolutionKind ? synthesis({
      primaryJudgments: [participant(), participant({ discipline: 'ZIWEI' })],
      participatingJudgments: [participant(), participant({ discipline: 'ZIWEI' })],
    }) : undefined }));
    expect(surface.state).toBe('OPEN');
    expect(surface.headlineOverride).toBe(p.headlineMeaning);
  });

  it('2 — AGREED AGAINST reaches the customer as a clearly opposed direction', () => {
    const against = participant({ direction: 'UNFAVORABLE', statement: '자리는 막힙니다.' });
    const p = planFor(synthesis({
      finalStance: 'AGAINST',
      primaryJudgments: [against, { ...against, discipline: 'ZIWEI' }],
      participatingJudgments: [against, { ...against, discipline: 'ZIWEI' }],
    }));
    expect(p.primaryDirection).toBe('HOLD');
    expect(p.conclusionState).toBe('BLOCKED');
    expect(p.headlineMeaning).toMatch(/벌일 자리는 아닙니다/);
  });
});

// ════ 3, 14–15. AUTHORITY DISCLOSURE ════════════════════════════════════════════════════════════════
describe('the answer is factually accurate about who contributed', () => {
  it('3 & 15 — SINGLE_AUTHORITY gives the direction but never claims agreement', () => {
    const p = planFor(synthesis({
      resolutionKind: 'SINGLE_AUTHORITY',
      primaryJudgments: [participant({ discipline: 'ZIWEI' })],
      participatingJudgments: [
        participant({ discipline: 'ZIWEI' }),
        participant({ discipline: 'MYUNGRI', authority: 'CONTEXT_ONLY', direction: 'NONE' }),
      ],
    }));
    expect(p.primaryDirection).toBe('PROCEED');
    expect(p.conclusionState).toBe('OPEN');
    expect(p.headlineMeaning).toContain('자미두수');
    expect(p.headlineMeaning).toMatch(/한 곳에서 나온/);
    expect(p.authorityDisclosure).not.toMatch(/같은 결론에 이르렀습니다/);
    expect(p.authorityDisclosure).not.toMatch(/세\s*(?:체계|학문)/);
  });

  it('14 — disclosure never names more corroborating disciplines than actually decided', () => {
    const p = planFor(synthesis({
      primaryJudgments: [participant()],
      participatingJudgments: [
        participant(),
        participant({ discipline: 'ZIWEI', authority: 'CONTEXT_ONLY', direction: 'NONE' }),
        participant({ discipline: 'QIMEN', authority: 'CONTEXT_ONLY', direction: 'NONE' }),
      ],
    }));
    // Only 명리 decided. 자미두수/기문둔갑 may be mentioned, but never as agreeing.
    expect(p.authorityDisclosure).toMatch(/명리/);
    expect(p.authorityDisclosure).not.toMatch(/같은 결론에 이르렀습니다/);
  });
});

// ════ 4–7. THE COMPOUND SHAPES ══════════════════════════════════════════════════════════════════════
describe('compound truths are delivered as answers, not as refusals', () => {
  it('4 — QUALIFIED carries both the direction and the limitation, and does not reverse', () => {
    const p = planFor(synthesis({
      resolutionKind: 'QUALIFIED', finalStance: 'QUALIFIED_FOR',
      limitingTruths: [truth()],
    }));
    expect(p.primaryDirection).toBe('PROCEED');
    expect(p.conclusionState).toBe('MIXED');
    expect(p.headlineMeaning).toMatch(/열려 있는 쪽/);      // direction
    expect(p.headlineMeaning).toMatch(/다만|범위/);          // limitation
    expect(p.limitingTruths).toHaveLength(1);
  });

  it('5 — OUTCOME_SPLIT distinguishes the action from its downstream result', () => {
    const p = planFor(synthesis({
      resolutionKind: 'OUTCOME_SPLIT', finalStance: 'COMPOUND',
      outcomeQualifications: [truth({ axis: 'MONEY_RETENTION', role: 'OUTCOME', statement: '남는 쪽은 약합니다.' })],
    }));
    expect(p.conclusionState).toBe('MIXED');
    expect(p.primaryDirection).toBe('PROCEED');
    // BOTH sides are named, and the action separates doing it from controlling what follows.
    expect(p.headlineMeaning).toMatch(/나눠서/);
    expect(p.outcomeQualifications).toHaveLength(1);
    expect(p.actionBoundary).toMatch(/다음|뒤/);
    expect(p.actionBoundary).not.toMatch(/신중하게 결정|상황을 지켜보/);
  });

  it('6 — TEMPORAL_SPLIT preserves both time scopes and invents no period', () => {
    const p = planFor(synthesis({
      resolutionKind: 'TEMPORAL_SPLIT', finalStance: 'COMPOUND',
      temporalQualifications: [truth({
        axis: 'TIMING', role: 'TIMING', temporalBand: 'NEAR', statement: '가까운 시기는 눌립니다.',
      })],
    }));
    expect(p.conclusionState).toBe('MIXED');
    expect(p.headlineMeaning).toMatch(/큰 흐름|시점/);
    expect(p.temporalQualifications).toHaveLength(1);
    expect(JSON.stringify(p)).not.toMatch(/\d{4}년|\d+월/);
  });

  it('7 — COMPOUND_MIXED keeps two material truths and states a practical implication', () => {
    const p = planFor(synthesis({
      resolutionKind: 'COMPOUND_MIXED', finalStance: 'COMPOUND',
      supportingTruths: [truth({ axis: 'MONEY_INFLOW', role: 'OUTCOME', direction: 'FAVORABLE', statement: '들어오는 쪽은 열립니다.' })],
      limitingTruths: [truth({ axis: 'MONEY_RETENTION', statement: '남는 쪽은 막힙니다.' })],
    }));
    expect(p.supportingTruths.length + p.limitingTruths.length).toBeGreaterThanOrEqual(2);
    expect(p.actionBoundary.length).toBeGreaterThan(0);
    expect(p.actionBoundary).not.toBe('좋은 점도 있고 나쁜 점도 있습니다.');
    const sections = renderConsumerDecisionSections(p);
    const meaning = sections.find((s) => s.title === DECISION_MEANING_TITLE)!;
    expect(meaning).toBeTruthy();
    expect(meaning.body).toContain('들어오는 쪽은 열립니다.');
    expect(meaning.body).toContain('남는 쪽은 막힙니다.');
    expect(meaning.body).toContain(p.actionBoundary);
  });
});

// ════ 8–9. TRUE STANDOFF ════════════════════════════════════════════════════════════════════════════
describe('a true standoff is honest and still useful', () => {
  const standoff = () => synthesis({
    resolutionKind: 'TRUE_STANDOFF', finalStance: 'UNRESOLVED',
    primaryJudgments: [
      participant({ discipline: 'MYUNGRI', direction: 'FAVORABLE', statement: '자리는 열립니다.' }),
      participant({ discipline: 'ZIWEI', direction: 'UNFAVORABLE', statement: '자리는 막힙니다.' }),
    ],
    participatingJudgments: [
      participant({ discipline: 'MYUNGRI', direction: 'FAVORABLE', statement: '자리는 열립니다.' }),
      participant({ discipline: 'ZIWEI', direction: 'UNFAVORABLE', statement: '자리는 막힙니다.' }),
    ],
    limitingTruths: [truth()],
    conflictPairs: [{ a: 'MYUNGRI', b: 'ZIWEI', axis: 'CAREER', directions: ['FAVORABLE', 'UNFAVORABLE'], reconciledBy: null }],
    unresolvedReason: '어느 쪽이 더 직접적이라고 볼 근거가 없습니다.',
  });

  it('8 — no winner is invented', () => {
    const p = planFor(standoff());
    expect(p.primaryDirection).toBe('NONE');
    expect(p.conclusionState).toBe('UNRESOLVED');
    expect(closingDirectionOf(p.actionBoundary)).toBe('NEUTRAL');
  });

  it('9 — both sides, their provenance, and why it cannot be collapsed all reach the reader', () => {
    const p = planFor(standoff());
    expect(p.conflictExplanation).toContain('명리');
    expect(p.conflictExplanation).toContain('자미두수');
    expect(p.conflictExplanation).toContain('자리는 열립니다.');
    expect(p.conflictExplanation).toContain('자리는 막힙니다.');
    expect(p.conflictExplanation).toContain('근거가 없습니다');
    const section = renderConsumerDecisionSections(p).find((s) => s.title === CONFLICT_SECTION_TITLE)!;
    expect(section).toBeTruthy();
    expect(section.body).toContain(p.authorityDisclosure);
    // NOT an empty refusal: a grounded boundary is offered.
    expect(section.body).toContain(p.actionBoundary);
    expect(p.actionBoundary.length).toBeGreaterThan(10);
    // And the delivered close is that grounded boundary, not the fixed generic sentence.
    const surface = buildConclusionSurfacePlan(verdict({ decisionCrossSynthesis: standoff() }));
    expect(surface.closing).toBe(p.actionBoundary);
  });
});

// ════ 10–13. WHAT MAY NOT REACH THE CONCLUSION ══════════════════════════════════════════════════════
describe('non-deciding material and raw chart relations stay out of the conclusion', () => {
  it('10 — CONTEXT_ONLY material cannot change the conclusion', () => {
    const base = synthesis();
    const withContext = synthesis({
      participatingJudgments: [
        participant(),
        participant({ discipline: 'QIMEN', authority: 'CONTEXT_ONLY', direction: 'UNFAVORABLE' }),
      ],
    });
    expect(planFor(withContext).primaryDirection).toBe(planFor(base).primaryDirection);
    expect(planFor(withContext).conclusionState).toBe(planFor(base).conclusionState);
  });

  it('11 — a raw primitive engine relation never becomes the customer headline', () => {
    const raw = '올해 흐름이 원국 월주 자형에 마찰을 일으킨다';
    const v = verdict({
      primaryConclusion: raw,
      dominantBasis: '단일 근거 · 원국 월주',
      decisionCrossSynthesis: synthesis(),
    });
    const surface = buildConclusionSurfacePlan(v);
    expect(surface.headlineOverride).toBeTruthy();
    expect(surface.headlineOverride).not.toBe(raw);
    expect(surface.headlineOverride).not.toMatch(/월주|자형|원국/);
  });

  it('12 — the action never contradicts the conclusion', () => {
    for (const s of [
      synthesis(),
      synthesis({ finalStance: 'AGAINST', primaryJudgments: [participant({ direction: 'UNFAVORABLE' })] }),
      synthesis({ resolutionKind: 'QUALIFIED', finalStance: 'QUALIFIED_FOR', limitingTruths: [truth()] }),
      synthesis({ resolutionKind: 'OUTCOME_SPLIT', finalStance: 'COMPOUND', outcomeQualifications: [truth({ role: 'OUTCOME' })] }),
    ]) {
      const p = planFor(s);
      const violations = validateConsumerCoverage(
        p, { headline: p.headlineMeaning, action: p.actionBoundary, body: '' }, closingDirectionOf,
      );
      expect(violations).not.toContain('ACTION_CONTRADICTION');
      expect(violations).not.toContain('HEADLINE_POLARITY');
    }
  });

  it('13 — the action names the material constraint rather than ignoring it', () => {
    const p = planFor(synthesis({
      resolutionKind: 'QUALIFIED', finalStance: 'QUALIFIED_FOR',
      limitingTruths: [truth({ axis: 'MONEY_RETENTION', statement: '남는 쪽이 약합니다.' })],
    }));
    expect(p.actionBoundary).toContain('돈이 남는 쪽');
  });
});

// ════ 16–18. REQUESTED OUTCOME ══════════════════════════════════════════════════════════════════════
describe('the requested outcome stays authoritative', () => {
  it('16 & 18 — a PERIOD request is not turned into directional advice or an invented month', () => {
    const p = planFor(synthesis({
      requestedOutcome: 'PERIOD', resolutionKind: 'NON_DIRECTIONAL', finalStance: 'UNRESOLVED',
      primaryJudgments: [], participatingJudgments: [participant({ authority: 'INDIRECT_QUALIFIER', direction: 'NONE' })],
      temporalQualifications: [truth({ axis: 'TIMING', role: 'TIMING', direction: 'NONE', statement: '지금 시점을 좁힐 근거가 없습니다.' })],
    }));
    expect(p.primaryDirection).toBe('NONE');
    expect(p.headlineMeaning).not.toMatch(/열려 있는 쪽|벌일 자리는 아닙니다/);
    expect(JSON.stringify(p)).not.toMatch(/\d{4}년|\d+월/);
  });

  it('17 — a conduct request produces grounded conduct guidance, not a manufactured direction', () => {
    const p = planFor(synthesis({
      requestedOutcome: 'CONDUCT', resolutionKind: 'NON_DIRECTIONAL', finalStance: 'UNRESOLVED',
      primaryJudgments: [], participatingJudgments: [participant({ authority: 'INDIRECT_QUALIFIER', direction: 'NONE' })],
      limitingTruths: [truth({ axis: 'MONEY_RETENTION', statement: '새는 자리가 있습니다.' })],
    }));
    expect(p.primaryDirection).toBe('NONE');
    expect(p.actionBoundary).toContain('돈이 남는 쪽');
    expect(p.actionBoundary).not.toMatch(/신중하게 결정|상황을 지켜보|현실적으로 확인/);
  });
});

// ════ 19–22. NOTHING FABRICATED ═════════════════════════════════════════════════════════════════════
describe('the plan fabricates nothing', () => {
  it('19–20 — every meaning and evidence id traces to the synthesis that supplied it', () => {
    const s = synthesis({
      resolutionKind: 'COMPOUND_MIXED', finalStance: 'COMPOUND',
      supportingTruths: [truth({ direction: 'FAVORABLE', statement: '열립니다.', evidenceIds: ['정관 통근'] })],
      limitingTruths: [truth({ statement: '걸립니다.', evidenceIds: ['역마 충'] })],
    });
    const p = planFor(s);
    const supplied = ['정관 통근', '역마 충'];
    for (const id of p.evidenceRefs) expect(supplied).toContain(id);
    const meanings = [...p.supportingTruths, ...p.limitingTruths].map((t) => t.meaning);
    expect(meanings).toEqual(expect.arrayContaining(['열립니다.', '걸립니다.']));
  });

  it('21–22 — no discipline is named that did not participate, and none is mis-attributed', () => {
    const p = planFor(synthesis({
      primaryJudgments: [participant({ discipline: 'QIMEN' })],
      participatingJudgments: [participant({ discipline: 'QIMEN' })],
      resolutionKind: 'SINGLE_AUTHORITY',
    }));
    expect(p.authorityDisclosure).toContain('기문둔갑');
    expect(p.authorityDisclosure).not.toContain('명리');
    expect(p.authorityDisclosure).not.toContain('자미두수');
    expect(p.headlineMeaning).not.toContain('자미두수');
  });
});

// ════ 23–25. PERSISTENCE ════════════════════════════════════════════════════════════════════════════
describe('the synthesis survives the persistence boundary', () => {
  const live = (): CrossDivinationVerdict => {
    const j: DivinationJudgment = {
      discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT', questionDomain: 'CAREER',
      temporalScope: 'NATAL', stance: 'FOR' as Stance, dominantConclusion: '자리는 열립니다.',
      dominantFactor: '정관 통근', directEvidence: [ev('정관 통근')], counterEvidence: [],
      internalContradictions: [], timingSignals: [],
      domainSubJudgments: [{
        domain: 'CAREER', stance: 'FOR' as Stance, conclusion: '자리는 열립니다.',
        temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
        evidence: [ev('정관 통근')], counterEvidence: [],
      }],
      confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'MODERATE', factGroupsUsed: [],
    };
    const v = judgeCross({
      question: '직장을 옮겨도 될까요?', questionDomain: 'CAREER', subject: '본인',
      judgments: [j], asksTiming: false,
    });
    return { ...v, decisionCrossSynthesis: synthesis() };
  };

  it('23 — it round-trips through decisionMeta intact', () => {
    const restored = parseDivinationVerdict(JSON.parse(JSON.stringify(live())));
    expect(restored).toBeDefined();
    expect(restored!.decisionCrossSynthesis).toBeTruthy();
    expect(restored!.decisionCrossSynthesis!.resolutionKind).toBe('AGREED');
    expect(restored!.decisionCrossSynthesis!.primaryJudgments[0].discipline).toBe('MYUNGRI');
  });

  it('24 — a restored follow-up derives the SAME customer meaning', () => {
    const before = buildConsumerDecisionPlan(live())!;
    const restored = parseDivinationVerdict(JSON.parse(JSON.stringify(live())))!;
    const after = buildConsumerDecisionPlan(restored)!;
    expect(after.propositionId).toBe(before.propositionId);
    expect(after.resolutionKind).toBe(before.resolutionKind);
    expect(after.conclusionState).toBe(before.conclusionState);
    expect(after.headlineMeaning).toBe(before.headlineMeaning);
    expect(after.authorityDisclosure).toBe(before.authorityDisclosure);
  });

  it('25 — an invalid persisted synthesis is rejected, not partly trusted', () => {
    for (const bad of [
      { resolutionKind: 'TOTALLY_MADE_UP' },
      { finalStance: 'WINNER' },
      { provenance: ['someone.else.v1'] },
      { primaryJudgments: [{ ...participant(), discipline: 'TAROT' }] },
      { supportingTruths: [{ ...truth(), axis: 'NOT_AN_AXIS' }] },
      { conflictPairs: [{ a: 'MYUNGRI', b: 'ZIWEI', axis: 'CAREER', directions: ['FAVORABLE'], reconciledBy: null }] },
    ]) {
      const row = JSON.parse(JSON.stringify(live())) as Record<string, unknown>;
      row.decisionCrossSynthesis = { ...synthesis(), ...bad };
      expect(parseDivinationVerdict(row)).toBeUndefined();
    }
  });
});

// ════ 26–27. PRIOR INVARIANTS ═══════════════════════════════════════════════════════════════════════
describe('previous safety invariants hold', () => {
  it('26 — a verdict with no synthesis keeps its pre-V7 surface exactly', () => {
    const v = verdict({ decisionCrossSynthesis: undefined, direction: 'FOR' as Stance });
    const surface = buildConclusionSurfacePlan(v);
    expect(surface.consumerPlan).toBeNull();
    expect(surface.state).toBe('OPEN');
    expect(surface.headlineOverride).toBeNull();
  });

  it('27 — the language layer is instructed from the plan, never from a contradicting graph direction', () => {
    const p = planFor(synthesis({
      resolutionKind: 'OUTCOME_SPLIT', finalStance: 'COMPOUND',
      outcomeQualifications: [truth({ role: 'OUTCOME' })],
    }));
    const directive = renderVerdictDirective(
      verdict({ decisionCrossSynthesis: synthesis({ resolutionKind: 'OUTCOME_SPLIT', finalStance: 'COMPOUND' }) }),
      'DIRECTION', consumerMeaningDirective(p),
    );
    expect(directive).toContain(p.headlineMeaning);
    expect(directive).toContain(p.authorityDisclosure);
    // The graph's own "no direction" instruction must NOT also be present — that is the two-authorities bug.
    expect(directive).not.toContain('억지로 좋다·나쁘다를 만들지 말고');
    expect(directive).toMatch(/둘 다 말하고/);
  });
});

// ════ LIVE PATH ═════════════════════════════════════════════════════════════════════════════════════
describe('the plan is reachable end to end', () => {
  it('a real turn produces a consumer plan whose state governs the delivered surface', async () => {
    clearZiweiCache(); clearQimenCache();
    const digestProvider: DigestProvider = {
      async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
    };
    const draft = {
      subject: { id: 's1', displayName: '테스트', relationship: null },
      birthInfo: {
        displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
        birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact',
        birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
      },
    } as unknown as ConsultationDraft;
    const g = await buildConsultationGrounding(draft, {
      digestProvider, nowEpochSeconds: Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000),
    }, '지금 다니는 곳을 그만두고 다른 데로 옮겨도 될까요?');
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    const v = g.divinationVerdict!;
    const surface = buildConclusionSurfacePlan(v);
    expect(surface.consumerPlan).toBeTruthy();
    expect(surface.state).toBe(
      surface.consumerPlan!.resolutionKind === 'NO_APPLICABLE_JUDGMENT'
        ? surface.state : surface.consumerPlan!.conclusionState,
    );
    // And the row this turn would persist restores with its meaning intact.
    const restored = parseDivinationVerdict(JSON.parse(JSON.stringify(v)));
    expect(restored).toBeDefined();
    expect(restored!.decisionCrossSynthesis).toBeTruthy();
  });
});
