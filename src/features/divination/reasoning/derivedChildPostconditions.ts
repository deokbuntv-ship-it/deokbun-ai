// G6 FINAL — canonical, context-independent child semantics for every persisted derived rule.
//
// Runtime constructors and persisted restoration both use these helpers. This keeps restoration from
// accepting a child shape the named rule could never mint, without replaying turn-local arbitration context.
import type { ContradictionResolutionKind, JudgmentDomain, TemporalScope } from '../contracts';
import {
  compositeTarget,
  type ReasonedProposition,
  type SemanticTarget,
} from './kernel';

export type DerivedChildSemantics = Pick<
  ReasonedProposition,
  'target' | 'questionAxis' | 'temporalScope' | 'conclusionType' | 'direction'
> & Pick<Partial<ReasonedProposition>, 'restriction'>;

export type CrossChildEvidence = Pick<
  ReasonedProposition,
  'supportingPremiseIds' | 'opposingPremiseIds' | 'doctrineReferences'
>;

export const MYUNGRI_CHILD_SHAPES = {
  CONTESTED_SHARE: {
    questionAxis: 'MONEY_RETENTION', conclusionType: 'COMPOUND', direction: 'RESTRICTED', restriction: 'SCOPE',
  },
  DIRECTION_VS_EXECUTION: {
    conclusionType: 'COMPOUND', direction: 'RESTRICTED', restriction: 'TIMING',
  },
  CONVERGENT_SEAT_PRESSURE: { conclusionType: 'CAUSAL', direction: 'NONE' },
  INFLOW_VS_RETENTION: {
    questionAxis: 'MONEY_INFLOW', conclusionType: 'COMPOUND', direction: 'RESTRICTED', restriction: 'SCOPE',
  },
  RECURRING_FRICTION_CAUSE: { conclusionType: 'CAUSAL', direction: 'NONE' },
} as const;

const SCOPE_WIDTH: Record<TemporalScope, number> = {
  PRESENT_MOMENT: 0, WOLWOON: 1, SEWOON: 2, DAEWOON: 3, NATAL: 4, UNSCOPED: 5,
};

export const narrowestDerivedScope = (items: { temporalScope: TemporalScope }[]): TemporalScope =>
  items.map((item) => item.temporalScope).sort((a, b) => SCOPE_WIDTH[a] - SCOPE_WIDTH[b])[0];

export function contestedShareChild(
  rivals: { target: SemanticTarget; temporalScope: TemporalScope }[],
  wealth: { target: SemanticTarget }[],
): DerivedChildSemantics {
  return {
    ...MYUNGRI_CHILD_SHAPES.CONTESTED_SHARE,
    temporalScope: narrowestDerivedScope(rivals),
    target: compositeTarget(
      'RIVAL_VS_WEALTH', [rivals.map((p) => p.target), wealth.map((p) => p.target)], '벌이는 몫과 남는 몫',
    ),
  };
}

export function directionVsExecutionChild(
  open: { target: SemanticTarget; questionAxis: JudgmentDomain },
  scope: TemporalScope,
): DerivedChildSemantics {
  return {
    ...MYUNGRI_CHILD_SHAPES.DIRECTION_VS_EXECUTION,
    target: open.target,
    questionAxis: open.questionAxis,
    temporalScope: scope,
  };
}

export const canonicalConvergentGroup = <T extends {
  questionAxis: JudgmentDomain; temporalScope: TemporalScope;
}>(items: T[]): T[] => [...items].sort((a, b) => a.questionAxis.localeCompare(b.questionAxis)
  || SCOPE_WIDTH[a.temporalScope] - SCOPE_WIDTH[b.temporalScope]);

export function convergentSeatPressureChild(
  unordered: { target: SemanticTarget; questionAxis: JudgmentDomain; temporalScope: TemporalScope }[],
): DerivedChildSemantics {
  const group = canonicalConvergentGroup(unordered);
  return {
    ...MYUNGRI_CHILD_SHAPES.CONVERGENT_SEAT_PRESSURE,
    target: group[0].target,
    questionAxis: group[0].questionAxis,
    temporalScope: narrowestDerivedScope(group),
  };
}

export function inflowVsRetentionChild(
  inflow: { target: SemanticTarget; temporalScope: TemporalScope }[],
  retentionMembers: SemanticTarget[],
): DerivedChildSemantics {
  return {
    ...MYUNGRI_CHILD_SHAPES.INFLOW_VS_RETENTION,
    temporalScope: narrowestDerivedScope(inflow),
    target: compositeTarget(
      'INFLOW_VS_RETENTION', [inflow.map((p) => p.target), retentionMembers], '유입과 보유',
    ),
  };
}

export function recurringFrictionChild(
  weak: { target: SemanticTarget; questionAxis: JudgmentDomain },
  again: { temporalScope: TemporalScope }[],
): DerivedChildSemantics {
  return {
    ...MYUNGRI_CHILD_SHAPES.RECURRING_FRICTION_CAUSE,
    target: weak.target,
    questionAxis: weak.questionAxis,
    temporalScope: narrowestDerivedScope(again),
  };
}

type ReinforcementRelation = 'REINFORCING' | 'RIVAL_AGREEMENT';
type ConflictRelation = 'CONTRADICTORY' | 'RIVAL_CONFLICT';

export function crossReinforcementChild(
  a: ReasonedProposition, b: ReasonedProposition, relation: ReinforcementRelation,
): DerivedChildSemantics {
  const pair = [a, b].sort((x, y) => (x.target.key < y.target.key ? -1 : 1));
  return {
    target: relation === 'RIVAL_AGREEMENT'
      ? compositeTarget('RIVAL', [[a.target, b.target]], pair.map((p) => p.target.label).join('·'))
      : a.target,
    questionAxis: a.questionAxis,
    temporalScope: a.temporalScope,
    conclusionType: a.conclusionType === 'COMPOUND' || b.conclusionType === 'COMPOUND'
      ? 'COMPOUND' : 'DIRECTIONAL',
    direction: a.direction,
    ...(a.restriction ? { restriction: a.restriction } : {}),
  };
}

export function crossStandoffChild(
  a: ReasonedProposition, b: ReasonedProposition, relation: ConflictRelation,
): DerivedChildSemantics {
  const pair = [a, b].sort((x, y) => (x.target.key < y.target.key ? -1 : 1));
  return {
    target: relation === 'RIVAL_CONFLICT'
      ? compositeTarget('RIVAL', [[a.target, b.target]], pair.map((p) => p.target.label).join('·'))
      : a.target,
    questionAxis: a.questionAxis,
    temporalScope: a.temporalScope,
    conclusionType: 'STRUCTURAL',
    direction: 'NONE',
  };
}

export function crossContradictionResolvedChild(
  dominant: ReasonedProposition, axis: JudgmentDomain,
): DerivedChildSemantics {
  return {
    target: dominant.target,
    questionAxis: axis,
    temporalScope: dominant.temporalScope,
    conclusionType: 'DIRECTIONAL',
    direction: dominant.direction,
    ...(dominant.restriction ? { restriction: dominant.restriction } : {}),
  };
}

export function crossTimingSplitChild(
  structural: ReasonedProposition, near: ReasonedProposition,
): DerivedChildSemantics {
  return {
    target: structural.target,
    questionAxis: structural.questionAxis,
    temporalScope: near.temporalScope,
    conclusionType: 'COMPOUND',
    direction: 'RESTRICTED',
    restriction: structural.direction === 'FAVORABLE' ? 'TIMING' : 'SCOPE',
  };
}

export function crossAxisCompoundChild(
  a: ReasonedProposition,
  b: ReasonedProposition,
  askedAxis: JudgmentDomain,
  kind: ContradictionResolutionKind,
  label = '',
): DerivedChildSemantics {
  const asked = a.questionAxis === askedAxis ? a : b;
  return {
    target: compositeTarget(kind, [[a.target, b.target]], label),
    questionAxis: asked.questionAxis,
    temporalScope: asked.temporalScope,
    conclusionType: 'COMPOUND',
    direction: asked.direction,
    ...(asked.restriction ? { restriction: asked.restriction } : {}),
  };
}

/** crossProp's canonical re-siding rule, shared with persisted restoration. */
export function crossChildEvidence(
  fromParents: ReasonedProposition[], againstParents: ReasonedProposition[] = [],
): CrossChildEvidence {
  const byId = (a: ReasonedProposition, b: ReasonedProposition) => a.id.localeCompare(b.id);
  const from = [...fromParents].sort(byId);
  const against = [...againstParents].sort(byId);
  const parents = [...from, ...against];
  const supportingPremiseIds = [...new Set([
    ...from.flatMap((p) => p.supportingPremiseIds),
    ...against.flatMap((p) => p.opposingPremiseIds),
  ])];
  const opposingPremiseIds = [...new Set([
    ...from.flatMap((p) => p.opposingPremiseIds),
    ...against.flatMap((p) => p.supportingPremiseIds),
  ])].filter((id) => !supportingPremiseIds.includes(id));
  return {
    supportingPremiseIds,
    opposingPremiseIds,
    doctrineReferences: [...new Set(parents.flatMap((p) => p.doctrineReferences))],
  };
}

export function derivedChildSemanticsMatch(
  actual: DerivedChildSemantics,
  expected: DerivedChildSemantics,
): boolean {
  return actual.target.key === expected.target.key
    && actual.target.kind === expected.target.kind
    && actual.questionAxis === expected.questionAxis
    && actual.temporalScope === expected.temporalScope
    && actual.conclusionType === expected.conclusionType
    && actual.direction === expected.direction
    && (actual.restriction ?? undefined) === (expected.restriction ?? undefined);
}
