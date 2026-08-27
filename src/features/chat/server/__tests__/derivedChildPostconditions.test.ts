// FINAL G6 — a persisted derived child must be an output its named runtime constructor could mint.
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';
import type { JudgmentDomain, TemporalScope } from '@/features/divination/contracts';
import {
  computeAdequacy,
  runDerivations,
  target,
  type DerivationContext,
  type DivinationPremise,
  type ReasonedProposition,
  type SemanticTarget,
} from '@/features/divination/reasoning/kernel';
import { deriveCross } from '@/features/divination/reasoning/crossRules';
import { legitimatePrimaryConclusions } from '@/features/divination/reasoning/crossReasoner';
import { MYUNGRI_RULES, primitivePropositions } from '@/features/divination/reasoning/myungriRules';
import { projectVerdictFromGraph } from '@/features/divination/reasoning/persistedGraphValidation';

const SUBJECT = '김서윤';
const NATAL_SEAT = target('NATAL_SEAT', 'MONTH', '월지');
const DAY_SEAT = target('NATAL_SEAT', 'DAY', '일지');
const WEALTH = target('TEN_GOD_FAMILY', 'WEALTH', '재성');
const RIVAL = target('LUCK_LAYER', 'SEWOON:RIVAL', '세운 겁재');
const LAYER = target('LUCK_LAYER', 'SEWOON', '세운');
const PALACE = target('PALACE', 'WEALTH_PALACE', '재백궁');
const CAREER_PALACE = target('PALACE', 'CAREER_PALACE', '관록궁');
const BOARD = target('BOARD_SEAT', 'QIMEN_BOARD', '기문 국');

const nativePremise = (
  id: string,
  over: Partial<DivinationPremise>,
): DivinationPremise => ({
  id,
  discipline: 'MYUNGRI',
  sourceFactIds: [`fact:${id}`],
  subject: SUBJECT,
  target: NATAL_SEAT,
  questionIntent: 'DECISION',
  questionAxis: 'CAREER',
  temporalScope: 'NATAL',
  semanticRelation: 'ENABLES',
  concept: 'SEAT_CONTACT',
  assertion: id,
  role: 'ASSERTS',
  reliability: 'EXACT',
  applicability: 'DIRECT',
  doctrineReference: 'frozen-software-semantics',
  ...over,
});

const ctx = (axis: JudgmentDomain): DerivationContext => ({
  subject: SUBJECT, questionIntent: 'DECISION', askedAxis: axis, dataComplete: true,
});

const myungriGraph = (premises: DivinationPremise[], axis: JudgmentDomain): ReasonedProposition[] =>
  runDerivations(MYUNGRI_RULES, premises, primitivePropositions(premises, ctx(axis)), ctx(axis));

function verdict(
  premises: DivinationPremise[], propositions: ReasonedProposition[], axis: JudgmentDomain,
): Record<string, unknown> {
  const projection = projectVerdictFromGraph(propositions, axis, 'DECISION');
  // G6 FINAL — primaryConclusion is now verified against the graph; compute the actual legitimate value via
  // the same shared function the validator uses, rather than an arbitrary placeholder.
  const primaryConclusion = legitimatePrimaryConclusions(propositions, axis, 'DECISION', ['MYUNGRI'])[0];
  return {
    question: 'q', questionDomain: axis, questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: 1_700_000_000, asksTiming: false,
    premises, propositions,
    primaryConclusion, direction: projection.direction, dominantBasis: 'b', verdictVersion: 'v',
    headlinePropositionIds: projection.headlinePropositionIds,
    disciplineJudgments: [{
      discipline: 'MYUNGRI', stance: projection.direction, applicable: true, dataReliability: 'EXACT',
      questionDomain: axis, temporalScope: 'NATAL', dominantConclusion: 'c', dominantFactor: 'f',
      directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
      domainSubJudgments: [], confidence: 'HIGH', questionDirectness: 'DIRECT',
      evidenceStrength: 'MODERATE', factGroupsUsed: [],
    }],
    contributions: [], axisVerdicts: [], evidenceReferences: [], agreementPoints: [], contradictionPoints: [],
    contradictionResolutions: [], natalBaseline: null, currentFlow: null, timingConclusion: null,
    favorableFactors: [], riskFactors: [], actionableInterpretation: 'i', confidence: 'HIGH', confidenceReason: 'r',
  };
}

const restore = (v: Record<string, unknown>) => parseDivinationVerdict(JSON.parse(JSON.stringify(v)) as unknown);

const cloneWithMutation = (
  source: Record<string, unknown>, rule: string, mutate: (p: Record<string, unknown>) => void,
): Record<string, unknown> => {
  const cloned = JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
  const propositions = cloned.propositions as Record<string, unknown>[];
  const child = propositions.find((p) => p.derivationRule === rule);
  if (!child) throw new Error(`missing runtime child ${rule}`);
  mutate(child);
  const projection = projectVerdictFromGraph(
    propositions as unknown as ReasonedProposition[], cloned.questionDomain as JudgmentDomain, 'DECISION',
  );
  cloned.direction = projection.direction;
  cloned.headlinePropositionIds = projection.headlinePropositionIds;
  return cloned;
};

const DVE_PREMISES = [
  nativePremise('open', { temporalScope: 'DAEWOON', semanticRelation: 'ENABLES' }),
  nativePremise('strike', { temporalScope: 'WOLWOON', semanticRelation: 'DESTABILIZES' }),
];
const DVE = verdict(DVE_PREMISES, myungriGraph(DVE_PREMISES, 'CAREER'), 'CAREER');

const CONTEST_PREMISES = [
  nativePremise('rival', {
    target: RIVAL, questionAxis: 'INFLUENCE', temporalScope: 'SEWOON', semanticRelation: 'OPPOSES',
    concept: 'RIVAL_CLAIM',
  }),
  nativePremise('wealth', {
    target: WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', semanticRelation: 'SUPPORTS',
    concept: 'NATAL_FAMILY', role: 'DESCRIBES', applicability: 'CONTEXTUAL',
  }),
];
const CONTEST = verdict(CONTEST_PREMISES, myungriGraph(CONTEST_PREMISES, 'MONEY_RETENTION'), 'MONEY_RETENTION');

const INFLOW_PREMISES = [
  nativePremise('inflow', {
    target: LAYER, questionAxis: 'MONEY_INFLOW', temporalScope: 'SEWOON', semanticRelation: 'ACTIVATES',
    concept: 'LAYER_ACTIVATION',
  }),
  nativePremise('retention', {
    target: DAY_SEAT, questionAxis: 'MONEY_RETENTION', temporalScope: 'SEWOON',
    semanticRelation: 'DESTABILIZES',
  }),
];
const INFLOW = verdict(INFLOW_PREMISES, myungriGraph(INFLOW_PREMISES, 'MONEY_INFLOW'), 'MONEY_INFLOW');

const FRICTION_PREMISES = [
  nativePremise('natal-weak', { temporalScope: 'NATAL', semanticRelation: 'DESTABILIZES' }),
  nativePremise('year-hit', { temporalScope: 'SEWOON', semanticRelation: 'DESTABILIZES' }),
];
const FRICTION = verdict(FRICTION_PREMISES, myungriGraph(FRICTION_PREMISES, 'CAREER'), 'CAREER');

describe('Myungri derived-child postconditions', () => {
  it('accepts a runtime-generated DIRECTION_VS_EXECUTION', () => {
    expect(restore(DVE)).toBeDefined();
  });

  it('rejects the exact TIMING → SCOPE child mutation with unchanged parents', () => {
    const changed = JSON.parse(JSON.stringify(DVE)) as Record<string, unknown>;
    const child = (changed.propositions as Record<string, unknown>[])
      .find((p) => p.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    child.restriction = 'SCOPE';
    expect(restore(changed)).toBeUndefined();
  });

  it('rejects the FOR_BUT_LATER → CONDITIONAL_AGAINST equivalent even when stored projection matches it', () => {
    const changed = cloneWithMutation(DVE, 'DIRECTION_VS_EXECUTION', (p) => { p.restriction = 'SCOPE'; });
    expect(changed.direction).toBe('CONDITIONAL_AGAINST');
    expect(restore(changed)).toBeUndefined();
  });

  it('accepts valid INFLOW_VS_RETENTION and CONTESTED_SHARE runtime outputs', () => {
    expect(restore(INFLOW)).toBeDefined();
    expect(restore(CONTEST)).toBeDefined();
  });

  it.each([
    ['CONTESTED_SHARE', CONTEST, (p: Record<string, unknown>) => { p.restriction = 'TIMING'; }],
    ['INFLOW_VS_RETENTION', INFLOW, (p: Record<string, unknown>) => { p.restriction = 'TIMING'; }],
    ['CONVERGENT_SEAT_PRESSURE', FRICTION,
      (p: Record<string, unknown>) => { p.temporalScope = 'WOLWOON'; }],
    ['RECURRING_FRICTION_CAUSE', FRICTION,
      (p: Record<string, unknown>) => { p.temporalScope = 'WOLWOON'; }],
  ])('rejects an impossible %s child while its ancestry stays unchanged', (rule, source, mutate) => {
    expect(restore(source as Record<string, unknown>)).toBeDefined();
    expect(restore(cloneWithMutation(source as Record<string, unknown>, rule as string, mutate as never)))
      .toBeUndefined();
  });
});

type CrossParentSpec = {
  id: string;
  discipline: 'MYUNGRI' | 'ZIWEI' | 'QIMEN';
  direction: 'FAVORABLE' | 'UNFAVORABLE' | 'RESTRICTED';
  target: SemanticTarget;
  axis: JudgmentDomain;
  scope: TemporalScope;
  applicability?: DivinationPremise['applicability'];
  answersAsked?: boolean;
};

function crossParent(spec: CrossParentSpec): { premise: DivinationPremise; proposition: ReasonedProposition } {
  const semanticRelation = spec.direction === 'FAVORABLE' ? 'SUPPORTS'
    : spec.direction === 'UNFAVORABLE' ? 'OPPOSES' : 'CONSTRAINS';
  const premise: DivinationPremise = {
    id: `premise:${spec.id}`, discipline: spec.discipline, sourceFactIds: [`fact:${spec.id}`], subject: SUBJECT,
    target: spec.target, questionIntent: 'DECISION', questionAxis: spec.axis, temporalScope: spec.scope,
    semanticRelation, concept: 'ADAPTED', assertion: spec.id, role: 'ASSERTS', reliability: 'EXACT',
    applicability: spec.applicability ?? 'DIRECT', doctrineReference: `doctrine:${spec.discipline}`,
  };
  return {
    premise,
    proposition: {
      id: `p:${premise.id}`, discipline: spec.discipline, subject: SUBJECT, target: spec.target,
      questionIntent: 'DECISION', questionAxis: spec.axis, temporalScope: spec.scope, assertion: spec.id,
      conclusionType: 'DIRECTIONAL', direction: spec.direction,
      ...(spec.direction === 'RESTRICTED' ? { restriction: 'SCOPE' as const } : {}),
      answersAsked: spec.answersAsked ?? true,
      supportingPremiseIds: [premise.id], opposingPremiseIds: [], derivedFromPropositionIds: [],
      unresolvedPremiseIds: [], doctrineReferences: [premise.doctrineReference], derivationRule: 'PRIMITIVE',
      adequacy: computeAdequacy([premise], [], { dataComplete: true, doctrine: 'PARTIAL' }),
    },
  };
}

function crossCase(
  rule: string, specs: CrossParentSpec[], askedAxis: JudgmentDomain, asksTiming = false,
): Record<string, unknown> {
  const parents = specs.map(crossParent);
  const premises = parents.map((x) => x.premise);
  const propositions = parents.map((x) => x.proposition);
  const child = deriveCross(propositions, premises, { ...ctx(askedAxis), asksTiming })
    .find((d) => d.proposition.derivationRule === rule)?.proposition;
  if (!child) throw new Error(`runtime did not produce ${rule}`);
  return verdict(premises, [...propositions, child], askedAxis);
}

const REINFORCEMENT = crossCase('CROSS_REINFORCEMENT', [
  { id: 'reinforce-a', discipline: 'ZIWEI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'reinforce-b', discipline: 'QIMEN', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
], 'CAREER');

const STANDOFF = crossCase('CROSS_STANDOFF', [
  { id: 'standoff-a', discipline: 'ZIWEI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'standoff-b', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
], 'CAREER');

const RESOLVED = crossCase('CROSS_CONTRADICTION_RESOLVED', [
  { id: 'resolved-a', discipline: 'ZIWEI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'resolved-b', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL', applicability: 'BACKGROUND' },
], 'CAREER');

const TIMING = crossCase('CROSS_TIMING_SPLIT', [
  { id: 'timing-a', discipline: 'ZIWEI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'timing-b', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: PALACE, axis: 'CAREER', scope: 'WOLWOON' },
], 'CAREER');

const AXIS = crossCase('CROSS_AXIS_COMPOUND', [
  { id: 'axis-a', discipline: 'ZIWEI', direction: 'FAVORABLE', target: PALACE, axis: 'MONEY_INFLOW', scope: 'NATAL' },
  { id: 'axis-b', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: BOARD, axis: 'MONEY_RETENTION', scope: 'SEWOON', answersAsked: false },
], 'MONEY_INFLOW');

const MERGED_REINFORCEMENT = crossCase('CROSS_REINFORCEMENT', [
  { id: 'merge-r1', discipline: 'MYUNGRI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'merge-r2', discipline: 'MYUNGRI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'merge-r3', discipline: 'ZIWEI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
], 'CAREER');

const MERGED_TIMING = crossCase('CROSS_TIMING_SPLIT', [
  { id: 'merge-t1', discipline: 'MYUNGRI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'merge-t2', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: PALACE, axis: 'CAREER', scope: 'WOLWOON' },
  { id: 'merge-t3', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: PALACE, axis: 'CAREER', scope: 'WOLWOON' },
], 'CAREER');

// Codex production case: TWO duplicate-shaped STRUCTURAL parents (same discipline/target/axis/scope/direction,
// different provenance) + ONE near parent. crossTimingSplitChild's spec is keyed off the structural side alone,
// so two structural premises with an identical value-tuple collide into the same candidate exactly like
// MERGED_REINFORCEMENT's duplicate MYUNGRI parents do — a real runtime shape the old "exactly one structural
// parent" validator rejected.
const TIMING_STRUCTURAL_SPECS: CrossParentSpec[] = [
  { id: 'merge-ts1', discipline: 'MYUNGRI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'merge-ts2', discipline: 'MYUNGRI', direction: 'FAVORABLE', target: PALACE, axis: 'CAREER', scope: 'NATAL' },
  { id: 'merge-ts3', discipline: 'QIMEN', direction: 'UNFAVORABLE', target: PALACE, axis: 'CAREER', scope: 'WOLWOON' },
];
const MERGED_TIMING_STRUCTURAL = crossCase('CROSS_TIMING_SPLIT', TIMING_STRUCTURAL_SPECS, 'CAREER');

describe('Cross derived-child postconditions', () => {
  it.each([
    ['CROSS_REINFORCEMENT', REINFORCEMENT, (p: Record<string, unknown>) => { p.direction = 'UNFAVORABLE'; }],
    ['CROSS_STANDOFF', STANDOFF, (p: Record<string, unknown>) => { p.temporalScope = 'SEWOON'; }],
    ['CROSS_CONTRADICTION_RESOLVED', RESOLVED,
      (p: Record<string, unknown>) => { p.conclusionType = 'COMPOUND'; }],
    ['CROSS_TIMING_SPLIT', TIMING, (p: Record<string, unknown>) => { p.restriction = 'SCOPE'; }],
    ['CROSS_AXIS_COMPOUND', AXIS, (p: Record<string, unknown>) => { p.temporalScope = 'SEWOON'; }],
  ])('accepts valid %s and rejects an impossible child with the same parents', (rule, source, mutate) => {
    expect(restore(source as Record<string, unknown>)).toBeDefined();
    expect(restore(cloneWithMutation(source as Record<string, unknown>, rule as string, mutate as never)))
      .toBeUndefined();
  });

  it('preserves valid 3-parent merged reinforcement and timing-split outputs', () => {
    const reinforcement = restore(MERGED_REINFORCEMENT);
    const timing = restore(MERGED_TIMING);
    expect(reinforcement).toBeDefined();
    expect(timing).toBeDefined();
    expect(reinforcement!.propositions.find((p) => p.derivationRule === 'CROSS_REINFORCEMENT')!
      .derivedFromPropositionIds).toHaveLength(3);
    expect(timing!.propositions.find((p) => p.derivationRule === 'CROSS_TIMING_SPLIT')!
      .derivedFromPropositionIds).toHaveLength(3);
  });

  describe('CROSS_TIMING_SPLIT — two structural parents + one near parent (Codex production case)', () => {
    it('runtime-generated 2-structural+1-near split serializes and strictly restores with identity preserved', () => {
      const restored = restore(MERGED_TIMING_STRUCTURAL);
      expect(restored).toBeDefined();
      const child = restored!.propositions.find((p) => p.derivationRule === 'CROSS_TIMING_SPLIT')!;
      expect(child.derivedFromPropositionIds).toHaveLength(3);
      expect(child.target).toEqual(PALACE);
      expect(child.questionAxis).toBe('CAREER');
      expect(child.conclusionType).toBe('COMPOUND');
      expect(child.direction).toBe('RESTRICTED');
      // structural (ts1/ts2) is FAVORABLE → crossTimingSplitChild's restriction is 'TIMING', not 'SCOPE'.
      expect(child.restriction).toBe('TIMING');
    });

    it('rejects the same graph with an unrelated extra parent spliced into derivedFromPropositionIds', () => {
      const cloned = JSON.parse(JSON.stringify(MERGED_TIMING_STRUCTURAL)) as Record<string, unknown>;
      const propositions = cloned.propositions as Record<string, unknown>[];
      const child = propositions.find((p) => p.derivationRule === 'CROSS_TIMING_SPLIT')!;
      // An unrelated proposition: different target, different axis, never paired with anything in this graph.
      const stray = crossParent({
        id: 'stray-unrelated', discipline: 'ZIWEI', direction: 'FAVORABLE',
        target: CAREER_PALACE, axis: 'MONEY_INFLOW', scope: 'SEWOON',
      });
      propositions.push(stray.proposition as unknown as Record<string, unknown>);
      (cloned.premises as unknown[]).push(stray.premise);
      (child.derivedFromPropositionIds as string[]).push(stray.proposition.id);
      expect(restore(cloned)).toBeUndefined();
    });

    it('accepts the identical valid parent set under permutation of derivedFromPropositionIds order', () => {
      const cloned = JSON.parse(JSON.stringify(MERGED_TIMING_STRUCTURAL)) as Record<string, unknown>;
      const propositions = cloned.propositions as Record<string, unknown>[];
      const child = propositions.find((p) => p.derivationRule === 'CROSS_TIMING_SPLIT')!;
      const ids = child.derivedFromPropositionIds as string[];
      expect(ids).toHaveLength(3);
      child.derivedFromPropositionIds = [...ids].reverse();
      const restored = restore(cloned);
      expect(restored).toBeDefined();
      expect(new Set(restored!.propositions.find((p) => p.derivationRule === 'CROSS_TIMING_SPLIT')!
        .derivedFromPropositionIds)).toEqual(new Set(ids));
    });

    it('rejects a mutated restriction (TIMING → SCOPE) on the same valid 2-structural+1-near parents', () => {
      expect(restore(cloneWithMutation(MERGED_TIMING_STRUCTURAL, 'CROSS_TIMING_SPLIT',
        (p) => { p.restriction = 'SCOPE'; }))).toBeUndefined();
    });
  });

  it('accepts a historical Cross child when the restored turn now asks a different axis', () => {
    const old = restore(REINFORCEMENT)!;
    const money = crossParent({
      id: 'new-money', discipline: 'QIMEN', direction: 'FAVORABLE', target: CAREER_PALACE,
      axis: 'MONEY_INFLOW', scope: 'SEWOON',
    });
    const extended = verdict(
      [...old.premises, money.premise], [...old.propositions, money.proposition], 'MONEY_INFLOW',
    );
    expect(restore(extended)).toBeDefined();
  });
});
