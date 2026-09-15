// V7.1 — RESTRICTED POLARITY. A conditional negative must stay negative all the way to the customer.
//
// The read-only census measured the defect end to end: 5 of 77 consultations whose deciding judgments were
// ALL negative were delivered as PROCEED, three of them while the graph verdict itself said
// CONDITIONAL_AGAINST. Cause: `CONDITIONAL_FOR` projects to FAVORABLE but `CONDITIONAL_AGAINST` projects to
// RESTRICTED, and three synthesis branches asked `=== 'UNFAVORABLE' ? negative : positive`, so every
// conditional negative fell into the positive arm.
//
// These tests lock the repair AND its limit: a SCOPE restriction is a conditional negative, a TIMING one is
// a delayed positive, and nothing here may flatten the two together.
//
// Every fixture is SYNTHETIC. None is copied from any benchmark.
import { buildConsumerDecisionPlan } from '@/features/chat/server/consumerDecisionPlan';
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';
import { synthesizeDecisionCross, polarityOf, judgeCross } from '@/features/divination';
import type {
  DecisionAssessment, DecisionJudgmentV1, JudgedProposition, SynthesisParticipant,
} from '@/features/divination';
import { propositionDirectionOf, propositionRestrictionOf } from '@/features/divination/reasoning/disciplineAdapter';
import type {
  CrossDivinationVerdict, Discipline, DivinationJudgment, JudgmentDomain, JudgmentEvidence, Stance,
} from '@/features/divination/contracts';

const PROP: JudgedProposition = {
  kind: 'SHOULD_I_DO_X',
  requestedOutcome: 'DIRECTION',
  bearingAxes: [{ axis: 'CAREER', role: 'PRIMARY' }, { axis: 'MOVEMENT', role: 'CONSTRAINT' }],
  wholeDomain: false,
  options: [],
  optionComparability: 'NOT_A_COMPARISON',
  askedDomain: 'CAREER',
};
const PID = 'SHOULD_I_DO_X|DIRECTION|CAREER|CAREER|ASPECT';

const ev = (fact: string, domain: JudgmentDomain = 'CAREER'): JudgmentEvidence => ({
  fact, meaning: `${fact} 근거`, domain, temporalScope: 'NATAL', directness: 'DIRECT',
});

const assess = (over: Partial<DecisionAssessment> & { stance: Stance }): DecisionAssessment => ({
  axis: 'CAREER', role: 'PRIMARY', statement: '판단', evidence: [ev('정관 통근')], counterEvidence: [],
  temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT', basis: 'AXIS_SUB_JUDGMENT',
  ...over,
});

const dj = (discipline: Discipline, stance: Stance, over: Partial<DecisionJudgmentV1> = {}): DecisionJudgmentV1 => ({
  discipline,
  propositionId: PID,
  propositionKind: PROP.kind,
  requestedOutcome: PROP.requestedOutcome,
  applicable: true,
  dataReliability: 'EXACT',
  decisionStance: stance.includes('FOR') ? 'FOR' : 'AGAINST',
  primaryAssessment: assess({ stance }),
  supportingAssessments: [],
  limitingAssessments: [],
  timingAssessments: [],
  unresolvedReasons: [],
  evidenceIds: ['정관 통근'],
  confidence: 'MEDIUM',
  questionDirectness: 'DIRECT',
  evidenceStrength: 'MODERATE',
  optionComparability: 'NOT_A_COMPARISON',
  provenance: ['deokbunai.decision-judgment.v1'],
  ...over,
});

const synth = (judgments: DecisionJudgmentV1[], proposition: JudgedProposition = PROP) =>
  synthesizeDecisionCross({ proposition, propositionId: PID, judgments });

/** The full path a stance takes to the customer, which is what actually regressed. */
const deliver = (judgments: DecisionJudgmentV1[]) => {
  const s = synth(judgments);
  const v = { question: 'q', questionDomain: 'CAREER', decisionCrossSynthesis: s } as unknown as CrossDivinationVerdict;
  return { synthesis: s, plan: buildConsumerDecisionPlan(v)! };
};

// ════ 1–3. THE DEFECT ═══════════════════════════════════════════════════════════════════════════════
describe('a conditional negative survives to the customer', () => {
  it('1 — CONDITIONAL_AGAINST projects to a SCOPE-restricted direction, and that is negative', () => {
    expect(propositionDirectionOf('CONDITIONAL_AGAINST')).toBe('RESTRICTED');
    expect(propositionRestrictionOf('CONDITIONAL_AGAINST')).toBe('SCOPE');
    expect(polarityOf({ direction: 'RESTRICTED', restriction: 'SCOPE' })).toBe('NEGATIVE');
    const { synthesis } = deliver([dj('MYUNGRI', 'CONDITIONAL_AGAINST')]);
    expect(synthesis.finalStance).toBe('QUALIFIED_AGAINST');
  });

  it('2 — it reaches the ConsumerDecisionPlan as a negative meaning', () => {
    const { plan } = deliver([dj('MYUNGRI', 'CONDITIONAL_AGAINST')]);
    expect(plan.primaryDirection).toBe('HOLD');
    // QUALIFIED is a compound kind, so the state is MIXED with a HOLD direction — the delivery contract's
    // own shape for "negative, but not absolutely". BLOCKED is reserved for a non-compound negative.
    expect(plan.conclusionState).toBe('MIXED');
    expect(plan.headlineMeaning).toMatch(/크게 벌일 자리는 아닙니다|미루/);
  });

  it('3 — it MUST NOT become PROCEED', () => {
    for (const stance of ['CONDITIONAL_AGAINST', 'AGAINST', 'STRONGLY_AGAINST'] as Stance[]) {
      const { plan } = deliver([dj('MYUNGRI', stance)]);
      expect(plan.primaryDirection).not.toBe('PROCEED');
      expect(plan.conclusionState).not.toBe('OPEN');
    }
  });
});

// ════ 4–6. EVERY BRANCH, NOT ONLY THE OBSERVED ONE ══════════════════════════════════════════════════
describe('all three synthesis branches preserve conditional-negative polarity', () => {
  it('4 — AGREED never resolves a negative set to a positive stance', () => {
    const firm = deliver([dj('MYUNGRI', 'AGAINST'), dj('ZIWEI', 'AGAINST')]);
    expect(firm.synthesis.resolutionKind).toBe('AGREED');
    expect(firm.synthesis.finalStance).toBe('AGAINST');
    expect(firm.plan.primaryDirection).toBe('HOLD');
    expect(firm.plan.conclusionState).toBe('BLOCKED');
  });

  it('5 — SINGLE_AUTHORITY never resolves a lone negative to a positive stance', () => {
    const one = deliver([dj('ZIWEI', 'AGAINST')]);
    expect(one.synthesis.resolutionKind).toBe('SINGLE_AUTHORITY');
    expect(one.synthesis.finalStance).toBe('AGAINST');
    expect(one.plan.primaryDirection).toBe('HOLD');
    // A lone CONDITIONAL negative is a qualified one, so it lands in QUALIFIED — still negative.
    const conditional = deliver([dj('ZIWEI', 'CONDITIONAL_AGAINST')]);
    expect(conditional.synthesis.finalStance).toBe('QUALIFIED_AGAINST');
    expect(conditional.plan.primaryDirection).toBe('HOLD');
  });

  it('6 — QUALIFIED preserves it, whether the negative is the decider or the qualifier', () => {
    // Decider is the conditional negative.
    const deciderNeg = deliver([dj('MYUNGRI', 'CONDITIONAL_AGAINST'), dj('ZIWEI', 'CONDITIONAL_AGAINST')]);
    expect(deciderNeg.synthesis.finalStance).toBe('QUALIFIED_AGAINST');
    // Decider positive, a constraint on a DIFFERENT matter narrows it — still a qualified POSITIVE, which
    // must not flip. (A constraint sharing the decider's matter is a one-matter compound instead — that is
    // the axis ontology's own relation and is asserted separately below.)
    const qualifierNeg = deliver([dj('MYUNGRI', 'FOR', {
      limitingAssessments: [assess({
        axis: 'MONEY_RETENTION', role: 'CONSTRAINT', stance: 'CONDITIONAL_AGAINST',
        evidence: [], counterEvidence: [ev('겁재 투간', 'MONEY_RETENTION')], statement: '실속은 좁혀야 합니다.',
      })],
    })]);
    expect(qualifierNeg.synthesis.resolutionKind).toBe('QUALIFIED');
    expect(qualifierNeg.synthesis.finalStance).toBe('QUALIFIED_FOR');
    expect(qualifierNeg.plan.primaryDirection).toBe('PROCEED');
    // Same shape on an axis of the SAME matter stays a compound truth, unchanged by this repair.
    const sameMatter = deliver([dj('MYUNGRI', 'FOR', {
      limitingAssessments: [assess({
        axis: 'MOVEMENT', role: 'CONSTRAINT', stance: 'CONDITIONAL_AGAINST',
        evidence: [], counterEvidence: [ev('역마 충', 'MOVEMENT')], statement: '움직임은 좁혀야 합니다.',
      })],
    })]);
    expect(sameMatter.synthesis.resolutionKind).toBe('COMPOUND_MIXED');
    expect(sameMatter.plan.primaryDirection).toBe('PROCEED');
  });
});

// ════ 7–10. THE LIMITS OF THE REPAIR ════════════════════════════════════════════════════════════════
describe('the repair changes only what was wrong', () => {
  it('7 — a firm AGAINST is still negative', () => {
    expect(propositionDirectionOf('AGAINST')).toBe('UNFAVORABLE');
    expect(polarityOf({ direction: 'UNFAVORABLE', restriction: null })).toBe('NEGATIVE');
    expect(deliver([dj('MYUNGRI', 'AGAINST')]).plan.primaryDirection).toBe('HOLD');
  });

  it('8 — an ordinary FOR is still positive', () => {
    expect(polarityOf({ direction: 'FAVORABLE', restriction: null })).toBe('POSITIVE');
    const { synthesis, plan } = deliver([dj('MYUNGRI', 'FOR'), dj('ZIWEI', 'FOR')]);
    expect(synthesis.finalStance).toBe('FOR');
    expect(plan.primaryDirection).toBe('PROCEED');
    expect(plan.conclusionState).toBe('OPEN');
  });

  it('9 — CONDITIONAL_FOR stays positive-qualified', () => {
    expect(propositionDirectionOf('CONDITIONAL_FOR')).toBe('FAVORABLE');
    const { plan } = deliver([dj('MYUNGRI', 'CONDITIONAL_FOR')]);
    expect(plan.primaryDirection).toBe('PROCEED');
  });

  it('10 — a TIMING (DELAYS) restriction is a delayed positive and is NOT flipped to a scope negative', () => {
    // FOR_BUT_LATER and AGAINST_FOR_NOW both project to DELAYS → TIMING, which the graph's own `stanceOf`
    // restores as FOR_BUT_LATER. Treating RESTRICTED as blanket-negative would have inverted these.
    for (const stance of ['FOR_BUT_LATER', 'AGAINST_FOR_NOW'] as Stance[]) {
      expect(propositionDirectionOf(stance)).toBe('RESTRICTED');
      expect(propositionRestrictionOf(stance)).toBe('TIMING');
      expect(polarityOf({ direction: 'RESTRICTED', restriction: 'TIMING' })).toBe('POSITIVE');
    }
    const { synthesis } = deliver([dj('MYUNGRI', 'FOR_BUT_LATER')]);
    expect(synthesis.finalStance).toBe('QUALIFIED_FOR');
  });
});

// ════ 11–14. PRIOR INVARIANTS ═══════════════════════════════════════════════════════════════════════
describe('previous behaviour is unchanged', () => {
  it('11 — a genuine standoff is still unresolved and still invents no winner', () => {
    const { synthesis, plan } = deliver([dj('MYUNGRI', 'FOR'), dj('ZIWEI', 'AGAINST')]);
    expect(synthesis.resolutionKind).toBe('TRUE_STANDOFF');
    expect(synthesis.finalStance).toBe('UNRESOLVED');
    expect(plan.primaryDirection).toBe('NONE');
  });

  it('12 — OUTCOME_SPLIT keeps primary and outcome polarity independent', () => {
    const p: JudgedProposition = {
      ...PROP, bearingAxes: [{ axis: 'MOVEMENT', role: 'PRIMARY' }, { axis: 'CAREER', role: 'OUTCOME' }],
    };
    const j = dj('MYUNGRI', 'CONDITIONAL_AGAINST', {
      primaryAssessment: assess({ axis: 'MOVEMENT', stance: 'CONDITIONAL_AGAINST' }),
      supportingAssessments: [assess({ axis: 'CAREER', role: 'OUTCOME', stance: 'FOR' })],
    });
    const s = synthesizeDecisionCross({ proposition: p, propositionId: PID, judgments: [j] });
    expect(s.resolutionKind).toBe('OUTCOME_SPLIT');
    expect(s.finalStance).toBe('COMPOUND');
    // The compound's primary side is the conditional negative — previously this reported NO direction at all.
    const v = { question: 'q', questionDomain: 'MOVEMENT', decisionCrossSynthesis: s } as unknown as CrossDivinationVerdict;
    expect(buildConsumerDecisionPlan(v)!.primaryDirection).toBe('HOLD');
    expect(s.outcomeQualifications[0].direction).toBe('FAVORABLE');
  });

  it('13 — the conclusion and the action never point opposite ways', () => {
    for (const stance of ['FOR', 'CONDITIONAL_FOR', 'AGAINST', 'CONDITIONAL_AGAINST'] as Stance[]) {
      const { plan } = deliver([dj('MYUNGRI', stance)]);
      const positive = /열려|가셔도|움직이셔도/;
      const negative = /벌일 자리는 아닙니다|미루|좁히|줄이/;
      if (plan.primaryDirection === 'PROCEED') expect(plan.actionBoundary).not.toMatch(/미루십시오/);
      if (plan.primaryDirection === 'HOLD') expect(plan.headlineMeaning).not.toMatch(/^.*열려 있는 쪽으로 봅니다\.$/);
      expect(positive.test(plan.headlineMeaning) || negative.test(plan.headlineMeaning)).toBe(true);
    }
  });

  it('14 — the restriction survives persist/restore, so a follow-up keeps the same polarity', () => {
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
    const base = judgeCross({
      question: '직장을 옮겨도 될까요?', questionDomain: 'CAREER', subject: '본인',
      judgments: [j], asksTiming: false,
    });
    const v = { ...base, decisionCrossSynthesis: synth([dj('MYUNGRI', 'CONDITIONAL_AGAINST')]) };
    const before = buildConsumerDecisionPlan(v)!;
    expect(before.primaryDirection).toBe('HOLD');
    const restored = parseDivinationVerdict(JSON.parse(JSON.stringify(v)))!;
    const participant = restored.decisionCrossSynthesis!.primaryJudgments[0] as SynthesisParticipant;
    expect(participant.restriction).toBe('SCOPE');
    const after = buildConsumerDecisionPlan(restored)!;
    expect(after.primaryDirection).toBe('HOLD');
    expect(after.headlineMeaning).toBe(before.headlineMeaning);
  });
});
