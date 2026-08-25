// V4A §16–§18 — CROSS DERIVATION.
//
// Cross never reads "which discipline's stance won". It receives SEMANTIC PROPOSITIONS, first classifies how
// each pair relates, and only then derives. That ordering is what removes C7 as a CLASS of bug rather than as a
// patched case: the old judge asked "is one side structural and the other near-term?" before asking "are these
// even about the same thing?", so an unrelated structural positive could convert a direct negative into
// FOR_BUT_LATER. Here `DIFFERENT_TIME` is only reachable after `sameProposition()` has already confirmed the
// two claims are about the same axis and the same target.
import type { ContradictionResolutionKind, JudgmentDomain, TemporalScope } from '../contracts';

/** Which named decomposition a compound pair represents — carried through so the verdict can report it. */
type CompoundKind = ContradictionResolutionKind;
import {
  computeAdequacy,
  type DerivationContext, type DivinationPremise, type ReasonedProposition,
} from './kernel';

/** How two propositions relate. Decided structurally, before any dominance question is asked. */
export type CrossRelation =
  | 'SAME_PROPOSITION'   // same axis, same target, same time band
  | 'DIFFERENT_AXIS'     // both true, about different things
  | 'DIFFERENT_TIME'     // same claim, different time band
  | 'DIFFERENT_TARGET'   // same axis, but about different seats/palaces
  | 'REINFORCING'        // same proposition, same direction
  | 'CONTRADICTORY'      // same proposition, opposed directions
  | 'ORTHOGONAL';        // no meaningful relation

const NEAR: TemporalScope[] = ['SEWOON', 'WOLWOON', 'PRESENT_MOMENT'];
const band = (s: TemporalScope): 'NEAR' | 'STRUCTURAL' => (NEAR.includes(s) ? 'NEAR' : 'STRUCTURAL');
const opposed = (a: ReasonedProposition, b: ReasonedProposition): boolean =>
  (a.direction === 'FAVORABLE' && (b.direction === 'UNFAVORABLE' || b.direction === 'RESTRICTED'))
  || (b.direction === 'FAVORABLE' && (a.direction === 'UNFAVORABLE' || a.direction === 'RESTRICTED'));

export function classifyPair(a: ReasonedProposition, b: ReasonedProposition): CrossRelation {
  if (a.direction === 'NONE' || b.direction === 'NONE') return 'ORTHOGONAL';
  if (a.questionAxis !== b.questionAxis) return 'DIFFERENT_AXIS';
  if (band(a.temporalScope) !== band(b.temporalScope)) return 'DIFFERENT_TIME';
  if (a.target !== b.target && a.discipline === b.discipline) return 'DIFFERENT_TARGET';
  if (opposed(a, b)) return 'CONTRADICTORY';
  if (a.direction === b.direction) return 'REINFORCING';
  return 'SAME_PROPOSITION';
}

/** WHY one proposition dominated another. Categorical and inspectable — there is no score to compare. */
export type DominanceReason =
  | 'DIRECT_AXIS_EVIDENCE_VS_CONTEXTUAL'
  | 'NAMED_OBSTRUCTION_VS_NONE'
  | 'EXACT_INPUT_VS_DEGRADED'
  | 'DERIVED_PATTERN_VS_SINGLE_FACT'
  | 'DEFINITE_VS_QUALIFIED_CLAIM';

export const DOMINANCE_TEXT: Record<DominanceReason, string> = {
  DIRECT_AXIS_EVIDENCE_VS_CONTEXTUAL: '한쪽은 물어보신 축을 직접 짚는 근거 위에 서 있고, 다른 쪽은 곁가지 근거입니다',
  NAMED_OBSTRUCTION_VS_NONE: '한쪽은 막는 자리를 이름까지 짚어내고, 다른 쪽은 걸림돌을 짚어내지 못했습니다',
  EXACT_INPUT_VS_DEGRADED: '한쪽은 확정된 입력에서 나왔고, 다른 쪽은 불확실한 입력에 기대고 있습니다',
  DERIVED_PATTERN_VS_SINGLE_FACT: '한쪽은 여러 근거가 맞물린 구조를 설명하고, 다른 쪽은 단일 사실에 머뭅니다',
  DEFINITE_VS_QUALIFIED_CLAIM: '한쪽은 분명하게 막힌다고 보고, 다른 쪽은 조건이 갖춰지면 열린다는 정도에 그칩니다',
};

/**
 * Decide dominance by ORDERED, NAMED structural tests. Returns null when nothing distinguishes the two — and
 * that null is load-bearing: §17 forbids inventing a winner, so a genuine standoff must stay a standoff.
 */
export function decideDominance(
  a: ReasonedProposition, b: ReasonedProposition, premises: Map<string, DivinationPremise>,
): { winner: ReasonedProposition; loser: ReasonedProposition; reason: DominanceReason } | null {
  const directOn = (p: ReasonedProposition) =>
    [...p.supportingPremiseIds, ...p.opposingPremiseIds]
      .some((id) => premises.get(id)?.applicability === 'DIRECT');
  if (directOn(a) !== directOn(b)) {
    const [w, l] = directOn(a) ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'DIRECT_AXIS_EVIDENCE_VS_CONTEXTUAL' };
  }

  const namesObstruction = (p: ReasonedProposition) => p.opposingPremiseIds.length > 0;
  if (namesObstruction(a) !== namesObstruction(b)) {
    const [w, l] = namesObstruction(a) ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'NAMED_OBSTRUCTION_VS_NONE' };
  }

  const exact = (p: ReasonedProposition) => p.adequacy.dataCompleteness === 'COMPLETE';
  if (exact(a) !== exact(b)) {
    const [w, l] = exact(a) ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'EXACT_INPUT_VS_DEGRADED' };
  }

  const derived = (p: ReasonedProposition) => p.derivationRule !== 'PRIMITIVE';
  if (derived(a) !== derived(b)) {
    const [w, l] = derived(a) ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'DERIVED_PATTERN_VS_SINGLE_FACT' };
  }

  // A side that COMMITS asserts more than one that merely leaves the door open. Last criterion, because it is
  // about the claim's own firmness rather than about its grounding.
  if (Boolean(a.qualified) !== Boolean(b.qualified)) {
    const [w, l] = a.qualified ? [b, a] : [a, b];
    return { winner: w, loser: l, reason: 'DEFINITE_VS_QUALIFIED_CLAIM' };
  }

  return null;
}

/** Axis pairs whose opposite-looking verdicts are BOTH true — a compound truth, not a contradiction. */
const COMPOUND_PAIRS: { a: JudgmentDomain; b: JudgmentDomain; frame: string; kind: CompoundKind }[] = [
  { a: 'MONEY_INFLOW', b: 'MONEY_RETENTION', frame: '돈이 들어오는 것과 남는 것', kind: 'INFLOW_VS_RETENTION' },
  { a: 'RELATION_BOND', b: 'RELATION_STABILITY', frame: '끌리는 힘과 같이 사는 난도', kind: 'BOND_VS_STABILITY' },
  { a: 'OPPORTUNITY', b: 'OUTCOME', frame: '기회가 오는 것과 그것을 잡아서 남는 것', kind: 'OPPORTUNITY_VS_OUTCOME' },
  { a: 'CAREER', b: 'MONEY_RETENTION', frame: '자리가 열리는 것과 실속이 남는 것', kind: 'DIFFERENT_DOMAIN' },
];

const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
const axisLabel = (d: JudgmentDomain) => AXIS_LABEL[d] ?? '이 축';
// User-visible Korean: the topic particle must agree with the preceding 받침 ('…것' → 은, '…난도' → 는).
const topic = (w: string): string => {
  const ch = w.charCodeAt(w.length - 1);
  const closed = ch >= 0xac00 && ch <= 0xd7a3 ? (ch - 0xac00) % 28 !== 0 : false;
  return `${w}${closed ? '은' : '는'}`;
};

const crossId = (rule: string, parts: ReasonedProposition[]): string =>
  `x:${rule}:${parts.map((p) => p.id).sort().join('+')}`;

function crossProp(
  rule: string, ctx: DerivationContext,
  spec: {
    axis: JudgmentDomain; temporalScope: TemporalScope; target: string; assertion: string;
    conclusionType: ReasonedProposition['conclusionType']; direction: ReasonedProposition['direction'];
    restriction?: ReasonedProposition['restriction'];
    from: ReasonedProposition[];
  },
  premises: Map<string, DivinationPremise>,
): ReasonedProposition {
  const supportIds = [...new Set(spec.from.flatMap((p) => p.supportingPremiseIds))];
  const opposeIds = [...new Set(spec.from.flatMap((p) => p.opposingPremiseIds))];
  const pick = (ids: string[]) => ids.map((id) => premises.get(id)).filter((p): p is DivinationPremise => !!p);
  return {
    id: crossId(rule, spec.from),
    discipline: 'CROSS',
    subject: ctx.subject,
    target: spec.target,
    questionIntent: ctx.questionIntent,
    questionAxis: spec.axis,
    temporalScope: spec.temporalScope,
    assertion: spec.assertion,
    conclusionType: spec.conclusionType,
    direction: spec.direction,
    ...(spec.restriction ? { restriction: spec.restriction } : {}),
    supportingPremiseIds: supportIds,
    opposingPremiseIds: opposeIds,
    derivedFromPropositionIds: spec.from.map((p) => p.id),
    unresolvedPremiseIds: [],
    doctrineReferences: [...new Set(spec.from.flatMap((p) => p.doctrineReferences))],
    derivationRule: rule,
    adequacy: computeAdequacy(pick(supportIds), pick(opposeIds), { dataComplete: ctx.dataComplete, doctrine: 'ADOPTED' }),
  };
}

export type CrossDerivation = {
  proposition: ReasonedProposition;
  relation: CrossRelation;
  dominant?: ReasonedProposition;
  counter?: ReasonedProposition;
  dominanceReason?: DominanceReason;
  /** For a compound truth, WHICH named decomposition it is (인연 vs 결혼생활, 유입 vs 보유 …). */
  compoundKind?: ContradictionResolutionKind;
  /** True when nothing distinguished the two sides — no winner was invented (§17). */
  standoff?: boolean;
};

/**
 * Derive cross conclusions from every meaningfully-related pair. Only pairs from DIFFERENT disciplines are
 * considered: two propositions from the same discipline were already reconciled inside that discipline's own
 * graph, and re-deriving them here would double-count one piece of reasoning as two.
 */
export function deriveCross(
  props: ReasonedProposition[],
  premises: DivinationPremise[],
  ctx: DerivationContext,
): CrossDerivation[] {
  const byId = new Map(premises.map((p) => [p.id, p]));

  // "기회와 결과는 다르다" is ONE conclusion no matter how many proposition pairs reveal it. Candidates are
  // keyed by SEMANTIC UNIT (rule + axis + target) and merged, so the graph records every pair that supports the
  // claim without emitting the same sentence three times.
  type Candidate = {
    key: string; rule: string; relation: CrossRelation;
    spec: Omit<Parameters<typeof crossProp>[2], 'from'>;
    from: ReasonedProposition[];
    dominant?: ReasonedProposition; counter?: ReasonedProposition;
    dominanceReason?: DominanceReason; compoundKind?: ContradictionResolutionKind; standoff?: boolean;
  };
  const candidates = new Map<string, Candidate>();
  const add = (c: Candidate) => {
    const existing = candidates.get(c.key);
    if (!existing) { candidates.set(c.key, c); return; }
    for (const p of c.from) if (!existing.from.some((x) => x.id === p.id)) existing.from.push(p);
  };

  for (let i = 0; i < props.length; i += 1) {
    for (let k = i + 1; k < props.length; k += 1) {
      const a = props[i];
      const b = props[k];
      const relation = classifyPair(a, b);

      if (relation === 'REINFORCING') {
        // Reinforcement is meaningful ONLY across disciplines — two propositions from the same engine agreeing
        // is one reading, not two independent ones. Every OTHER relation is legitimate within a discipline:
        // "돈은 들어오지만 남지 않는다" is a compound truth about two AXES, and skipping same-discipline pairs
        // meant a single-engine chart could never produce it.
        if (a.discipline === b.discipline) continue;
        // NEW information: neither proposition states that an INDEPENDENT discipline reached the same place.
        add({
          key: `CROSS_REINFORCEMENT:${a.questionAxis}:${a.direction}`,
          rule: 'CROSS_REINFORCEMENT', relation, from: [a, b],
          spec: {
            axis: a.questionAxis,
            temporalScope: a.temporalScope,
            target: '서로 다른 학문의 일치',
            assertion: `${axisLabel(a.questionAxis)}에 대해 서로 다른 학문이 각각의 근거로 같은 자리를 가리킵니다. 한쪽만 보고 내린 결론이 아니라는 뜻입니다.`,
            conclusionType: a.conclusionType === 'COMPOUND' || b.conclusionType === 'COMPOUND' ? 'COMPOUND' : 'DIRECTIONAL',
            direction: a.direction,
            ...(a.restriction ? { restriction: a.restriction } : {}),
          },
        });
        continue;
      }

      if (relation === 'CONTRADICTORY') {
        const decided = decideDominance(a, b, byId);
        if (!decided) {
          // §17 — a genuine standoff. Both truths are preserved and NO winner is manufactured.
          add({
            key: `CROSS_STANDOFF:${a.questionAxis}:${a.target}`,
            rule: 'CROSS_STANDOFF', relation, standoff: true, from: [a, b],
            spec: {
              axis: a.questionAxis,
              temporalScope: a.temporalScope,
              target: a.target,
              assertion: `${axisLabel(a.questionAxis)}에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 근거가 없습니다. 한쪽으로 정하지 않겠습니다.`,
              conclusionType: 'STRUCTURAL',
              direction: 'NONE',
            },
          });
          continue;
        }
        add({
          key: `CROSS_CONTRADICTION_RESOLVED:${a.questionAxis}:${decided.winner.target}`,
          rule: 'CROSS_CONTRADICTION_RESOLVED', relation, from: [decided.winner, decided.loser],
          dominant: decided.winner, counter: decided.loser, dominanceReason: decided.reason,
          spec: {
            axis: a.questionAxis,
            temporalScope: decided.winner.temporalScope,
            target: decided.winner.target,
            assertion: `${decided.winner.assertion} 반대 근거도 있으나, ${DOMINANCE_TEXT[decided.reason]}.`,
            conclusionType: 'DIRECTIONAL',
            direction: decided.winner.direction,
            ...(decided.winner.restriction ? { restriction: decided.winner.restriction } : {}),
          },
        });
        continue;
      }

      if (relation === 'DIFFERENT_TIME' && opposed(a, b)) {
        // C7-SAFE, TWO WAYS.
        //  (1) reachable only because the axis already matched — a structural positive on an UNRELATED axis
        //      classifies as DIFFERENT_AXIS above and can never produce a timing split;
        //  (2) "방향은 맞지만 지금은 아니다" asserts TWO things, so BOTH halves must be independently grounded.
        //      A structural side resting on nothing must not get to own the direction through the timing door.
        const grounded = (p: ReasonedProposition) => p.supportingPremiseIds.length + p.opposingPremiseIds.length > 0;
        if (!grounded(a) || !grounded(b)) continue;
        const structural = band(a.temporalScope) === 'STRUCTURAL' ? a : b;
        const near = structural === a ? b : a;
        const structuralOpens = structural.direction === 'FAVORABLE';
        add({
          key: `CROSS_TIMING_SPLIT:${a.questionAxis}:${structuralOpens}`,
          rule: 'CROSS_TIMING_SPLIT', relation, from: [structural, near],
          compoundKind: near.temporalScope === 'PRESENT_MOMENT' ? 'ACTION_VS_TIMING' : 'DIFFERENT_TIMESCALE',
          spec: {
            axis: a.questionAxis,
            temporalScope: near.temporalScope,
            target: '방향과 시점',
            assertion: structuralOpens
              ? `${axisLabel(a.questionAxis)}은 큰 흐름에서 방향이 열려 있는데 가까운 시기가 같은 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.`
              : `${axisLabel(a.questionAxis)}은 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 같은 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.`,
            conclusionType: 'COMPOUND',
            direction: 'RESTRICTED',
            // Only the structure-opens case is a TIMING restriction ("방향은 맞으나 지금은 아니다"). A structure
            // that does NOT open is a SCOPE restriction — projecting it to FOR_BUT_LATER would tell the user the
            // opposite of what was derived.
            restriction: structuralOpens ? 'TIMING' : 'SCOPE',
          },
        });
        continue;
      }

      if (relation === 'DIFFERENT_AXIS' && opposed(a, b)) {
        const frame = COMPOUND_PAIRS.find((p) =>
          (p.a === a.questionAxis && p.b === b.questionAxis) || (p.a === b.questionAxis && p.b === a.questionAxis));
        if (!frame) continue; // unrelated axes disagreeing is not a contradiction and not a compound truth
        const asked = a.questionAxis === ctx.askedAxis ? a : b;
        const other = asked === a ? b : a;
        // Naming the split is only half an answer. "기회와 결과는 다릅니다" tells a paying reader nothing about
        // what to DO, so each side's own direction is stated too — which is also what keeps the verdict's
        // headline consistent with its own direction field.
        const way = (p: ReasonedProposition) =>
          p.direction === 'FAVORABLE' ? '열립니다'
            : p.direction === 'UNFAVORABLE' ? '막힙니다'
              : '범위를 좁혀야 합니다';
        add({
          key: `CROSS_AXIS_COMPOUND:${frame.frame}`,
          rule: 'CROSS_AXIS_COMPOUND', relation, from: [a, b], compoundKind: frame.kind,
          spec: {
            axis: asked.questionAxis,
            temporalScope: asked.temporalScope,
            target: frame.frame,
            assertion: `${topic(frame.frame)} 다르게 봅니다. ${axisLabel(asked.questionAxis)}은 ${way(asked)}, ${axisLabel(other.questionAxis)}은 ${way(other)}. 둘 다 사실이라 나누어 말씀드립니다.`,
            conclusionType: 'COMPOUND',
            direction: asked.direction,
            ...(asked.restriction ? { restriction: asked.restriction } : {}),
          },
        });
      }
    }
  }

  return [...candidates.values()].map((c) => ({
    proposition: crossProp(c.rule, ctx, { ...c.spec, from: c.from }, byId),
    relation: c.relation,
    ...(c.dominant ? { dominant: c.dominant } : {}),
    ...(c.counter ? { counter: c.counter } : {}),
    ...(c.dominanceReason ? { dominanceReason: c.dominanceReason } : {}),
    ...(c.compoundKind ? { compoundKind: c.compoundKind } : {}),
    ...(c.standoff ? { standoff: c.standoff } : {}),
  }));
}
