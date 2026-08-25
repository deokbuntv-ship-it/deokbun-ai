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
  computeAdequacy, sameTarget, target,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type SemanticTarget,
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

/**
 * RELATION CLASSIFICATION ORDER — V4B §4.
 *
 * V4A asked "different temporal band?" BEFORE "different target?", so two propositions about different things
 * could be classified DIFFERENT_TIME and then temporally decomposed into "방향은 맞지만 지금은 아니다". Identity
 * is settled first here — subject, claim kind, then target — and TIME IS ASKED LAST, inside the same-target
 * branch only. A temporal split with differing targets is unreachable by construction rather than by a guard
 * inside the timing rule.
 */
export function classifyPair(a: ReasonedProposition, b: ReasonedProposition): CrossRelation {
  // 1. SAME SUBJECT? Two people's charts never contradict each other.
  if (a.subject !== b.subject) return 'ORTHOGONAL';
  // A claim with no direction cannot agree or disagree with anything.
  if (a.direction === 'NONE' || b.direction === 'NONE') return 'ORTHOGONAL';
  // 2. COMPATIBLE CLAIM TYPE? A description and a recommendation are not rival answers.
  const decisional = (p: ReasonedProposition) => p.conclusionType !== 'STRUCTURAL' && p.conclusionType !== 'CAUSAL';
  if (decisional(a) !== decisional(b)) return 'ORTHOGONAL';

  // 3. SAME STRUCTURAL TARGET? This is the branch that may reach DIFFERENT_TIME.
  if (sameTarget(a.target, b.target)) {
    if (a.questionAxis !== b.questionAxis) return 'DIFFERENT_AXIS';
    if (band(a.temporalScope) !== band(b.temporalScope)) return 'DIFFERENT_TIME';
    if (opposed(a, b)) return 'CONTRADICTORY';
    if (a.direction === b.direction) return 'REINFORCING';
    return 'SAME_PROPOSITION';
  }

  // 4. DIFFERENT structural targets. Two claims may still be rival ANSWERS to the asked question — 명리 reading
  //    월지 and 자미 reading 관록궁 are reading different structures but answering the same thing. That is enough
  //    to agree or disagree, and NOT enough to decompose into direction-vs-timing: no single thing is being
  //    described, so there is nothing whose direction could be right while its timing is wrong.
  //    DIFFERENT_TIME is unreachable from here — which is precisely the C7 fix.
  if (a.answersAsked && b.answersAsked && a.questionAxis === b.questionAxis) {
    // The temporal band is deliberately NOT consulted here. These two are rival answers, so they can conflict
    // or agree — but with different structural targets there is no single thing whose direction and timing
    // could come apart, so DIFFERENT_TIME must stay unreachable no matter which bands they sit in.
    if (opposed(a, b)) return 'CONTRADICTORY';
    if (a.direction === b.direction) return 'REINFORCING';
    return 'SAME_PROPOSITION';
  }

  return a.questionAxis === b.questionAxis ? 'DIFFERENT_TARGET' : 'DIFFERENT_AXIS';
}

/**
 * WHY one proposition is SUBORDINATE to another — V4B §14.
 *
 * These are not a priority ladder. V4A ran an ordered sequence (directness → named obstruction → exactness →
 * derived status → definiteness → first match) and returned the first hit, which is rank arbitration with the
 * ranks spelled in words. Each reason below is instead a PREDICATE whose applicability arises from the actual
 * relationship between the two propositions; a reason that does not apply says nothing at all.
 *
 * Resolution requires UNANIMITY among the reasons that apply. If two applicable reasons point at different
 * subordinates, the relationship does not settle the matter and the result is a standoff — deliberately, since
 * picking between them again would need an ordering, which is the thing being removed.
 */
export type SubordinationReason =
  | 'EXACT_TARGET_VS_CONTEXT'
  | 'EXACT_TIME_VS_BROAD_TIME'
  | 'DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT'
  | 'DATA_KNOWN_VS_DATA_UNCERTAIN'
  | 'DOCTRINE_APPLICABLE_VS_DOCTRINE_BLOCKED';

export const SUBORDINATION_TEXT: Record<SubordinationReason, string> = {
  EXACT_TARGET_VS_CONTEXT: '한쪽은 물어보신 그 대상을 직접 다루고, 다른 쪽은 그 주변 맥락을 말합니다',
  EXACT_TIME_VS_BROAD_TIME: '한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다',
  DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT: '한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다',
  DATA_KNOWN_VS_DATA_UNCERTAIN: '한쪽은 확정된 입력에서 나왔고, 다른 쪽은 불확실한 입력에 기대고 있습니다',
  DOCTRINE_APPLICABLE_VS_DOCTRINE_BLOCKED: '한쪽은 채택된 학설로 판단할 수 있고, 다른 쪽은 판단 근거가 보류된 상태입니다',
};

export type SubordinationContext = {
  askedAxis: JudgmentDomain;
  /** True when the QUESTION is about a moment ("지금 계약해도 될까요?"), which is what makes time decisive. */
  asksTiming: boolean;
};

/** One relational test. Returns the SUBORDINATE side, or null when this reason has nothing to say here. */
type Test = (
  a: ReasonedProposition, b: ReasonedProposition,
  premises: Map<string, DivinationPremise>, ctx: SubordinationContext,
) => ReasonedProposition | null;

const applies = (aWins: boolean | null, a: ReasonedProposition, b: ReasonedProposition) =>
  (aWins === null ? null : aWins ? b : a);

const TESTS: Record<SubordinationReason, Test> = {
  // Applies only when the two claims are about different KINDS of thing: one the asked matter, one context.
  EXACT_TARGET_VS_CONTEXT: (a, b, _p, ctx) => {
    const onAsked = (p: ReasonedProposition) => p.questionAxis === ctx.askedAxis && p.target.kind !== 'COMPOSITE';
    return onAsked(a) === onAsked(b) ? null : applies(onAsked(a), a, b);
  },
  // Applies only when the QUESTION is about a moment. Otherwise "sooner" is not a reason to believe something.
  EXACT_TIME_VS_BROAD_TIME: (a, b, _p, ctx) => {
    if (!ctx.asksTiming) return null;
    const near = (p: ReasonedProposition) => band(p.temporalScope) === 'NEAR';
    return near(a) === near(b) ? null : applies(near(a), a, b);
  },
  DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT: (a, b, premises) => {
    const direct = (p: ReasonedProposition) => [...p.supportingPremiseIds, ...p.opposingPremiseIds]
      .some((id) => premises.get(id)?.applicability === 'DIRECT');
    return direct(a) === direct(b) ? null : applies(direct(a), a, b);
  },
  DATA_KNOWN_VS_DATA_UNCERTAIN: (a, b) => {
    const known = (p: ReasonedProposition) => p.adequacy.dataCompleteness === 'COMPLETE';
    return known(a) === known(b) ? null : applies(known(a), a, b);
  },
  DOCTRINE_APPLICABLE_VS_DOCTRINE_BLOCKED: (a, b) => {
    const ok = (p: ReasonedProposition) => p.adequacy.doctrineApplicability === 'ADOPTED';
    const blocked = (p: ReasonedProposition) => p.adequacy.doctrineApplicability === 'BLOCKED';
    if (ok(a) && blocked(b)) return b;
    if (ok(b) && blocked(a)) return a;
    return null;
  },
};

export type Subordination = {
  dominant: ReasonedProposition;
  subordinate: ReasonedProposition;
  /** EVERY reason that applied. They all agree — that is the condition for subordination at all. */
  reasons: SubordinationReason[];
};

/**
 * Try to subordinate one proposition to the other from their RELATIONSHIP. Returns null for a genuine standoff:
 * either no reason applied, or the applicable reasons disagreed. §14 — a standoff is a valid outcome.
 */
export function subordinate(
  a: ReasonedProposition, b: ReasonedProposition,
  premises: Map<string, DivinationPremise>, ctx: SubordinationContext,
): Subordination | null {
  const verdicts: { reason: SubordinationReason; subordinate: ReasonedProposition }[] = [];
  for (const [reason, test] of Object.entries(TESTS) as [SubordinationReason, Test][]) {
    const loser = test(a, b, premises, ctx);
    if (loser) verdicts.push({ reason, subordinate: loser });
  }
  if (verdicts.length === 0) return null;
  const losers = new Set(verdicts.map((v) => v.subordinate.id));
  if (losers.size > 1) return null; // the applicable reasons disagree → the relationship does not settle it
  const subordinateProp = verdicts[0].subordinate;
  return {
    dominant: subordinateProp === a ? b : a,
    subordinate: subordinateProp,
    reasons: verdicts.map((v) => v.reason),
  };
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
    axis: JudgmentDomain; temporalScope: TemporalScope; target: SemanticTarget; assertion: string;
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
  /** EVERY relational reason that applied. Unanimous by construction (see subordinate()). */
  subordinationReasons?: SubordinationReason[];
  /** For a compound truth, WHICH named decomposition it is. */
  compoundKind?: ContradictionResolutionKind;
  /** True when the relationship could not subordinate either side — no winner was invented (§14). */
  standoff?: boolean;
};

/**
 * Derive cross conclusions from RELATED PAIRS.
 *
 * Every branch below is reached only through classifyPair(), which settles identity (subject → target → axis →
 * claim kind) BEFORE time. A timing decomposition is therefore unreachable unless both halves are about the
 * same subject, the same target and the same axis — which is what removes C7 as a class rather than as a case.
 */
export function deriveCross(
  props: ReasonedProposition[],
  premises: DivinationPremise[],
  ctx: DerivationContext & { asksTiming?: boolean },
): CrossDerivation[] {
  const byId = new Map(premises.map((p) => [p.id, p]));
  const subCtx: SubordinationContext = { askedAxis: ctx.askedAxis, asksTiming: ctx.asksTiming ?? false };

  type Candidate = {
    key: string; rule: string; relation: CrossRelation;
    spec: Omit<Parameters<typeof crossProp>[2], 'from'>;
    from: ReasonedProposition[];
    dominant?: ReasonedProposition; counter?: ReasonedProposition;
    subordinationReasons?: SubordinationReason[]; compoundKind?: ContradictionResolutionKind; standoff?: boolean;
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
        // is one reading, not two independent ones.
        if (a.discipline === b.discipline) continue;
        add({
          key: 'CROSS_REINFORCEMENT:' + a.target.key + ':' + a.direction,
          rule: 'CROSS_REINFORCEMENT', relation, from: [a, b],
          spec: {
            axis: a.questionAxis,
            temporalScope: a.temporalScope,
            target: a.target,
            // "두 학문이 일치합니다" tells the reader that we agree — not what we agree ABOUT. A reinforcement
            // must carry the direction it reinforces, or it is a directional verdict whose own headline states
            // no direction.
            assertion: a.target.label + '에 대해 서로 다른 학문이 각각의 근거로 같은 결론에 이릅니다: '
              + (a.direction === 'FAVORABLE' ? '이 자리는 열려 있습니다.'
                : a.direction === 'UNFAVORABLE' ? '이 자리는 막혀 있습니다.'
                  : '범위를 좁혀야 하는 자리입니다.')
              + ' 한쪽만 보고 내린 결론이 아니라는 뜻입니다.',
            conclusionType: a.conclusionType === 'COMPOUND' || b.conclusionType === 'COMPOUND' ? 'COMPOUND' : 'DIRECTIONAL',
            direction: a.direction,
            ...(a.restriction ? { restriction: a.restriction } : {}),
          },
        });
        continue;
      }

      if (relation === 'CONTRADICTORY') {
        const decided = subordinate(a, b, byId, subCtx);
        if (!decided) {
          // §14 — the relationship does not settle it. Both truths are preserved; no winner is manufactured.
          add({
            key: 'CROSS_STANDOFF:' + a.target.key,
            rule: 'CROSS_STANDOFF', relation, standoff: true, from: [a, b],
            spec: {
              axis: a.questionAxis,
              temporalScope: a.temporalScope,
              target: a.target,
              assertion: a.target.label + '에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.',
              conclusionType: 'STRUCTURAL',
              direction: 'NONE',
            },
          });
          continue;
        }
        add({
          key: 'CROSS_CONTRADICTION_RESOLVED:' + decided.dominant.target.key,
          rule: 'CROSS_CONTRADICTION_RESOLVED', relation, from: [decided.dominant, decided.subordinate],
          dominant: decided.dominant, counter: decided.subordinate, subordinationReasons: decided.reasons,
          spec: {
            axis: a.questionAxis,
            temporalScope: decided.dominant.temporalScope,
            target: decided.dominant.target,
            assertion: decided.dominant.assertion + ' 반대 근거도 있으나, '
              + decided.reasons.map((r) => SUBORDINATION_TEXT[r]).join('; ') + '.',
            conclusionType: 'DIRECTIONAL',
            direction: decided.dominant.direction,
            ...(decided.dominant.restriction ? { restriction: decided.dominant.restriction } : {}),
          },
        });
        continue;
      }

      if (relation === 'DIFFERENT_TIME' && opposed(a, b)) {
        // Reachable ONLY after subject, target, axis and claim-kind have all matched. Both halves must also be
        // independently grounded — "방향은 맞지만 지금은 아니다" asserts two things, so a side resting on
        // nothing must not get to own the direction through the timing door.
        const grounded = (p: ReasonedProposition) => p.supportingPremiseIds.length + p.opposingPremiseIds.length > 0;
        if (!grounded(a) || !grounded(b)) continue;
        const structural = band(a.temporalScope) === 'STRUCTURAL' ? a : b;
        const near = structural === a ? b : a;
        const structuralOpens = structural.direction === 'FAVORABLE';
        add({
          key: 'CROSS_TIMING_SPLIT:' + a.target.key + ':' + structuralOpens,
          rule: 'CROSS_TIMING_SPLIT', relation, from: [structural, near],
          compoundKind: near.temporalScope === 'PRESENT_MOMENT' ? 'ACTION_VS_TIMING' : 'DIFFERENT_TIMESCALE',
          spec: {
            axis: a.questionAxis,
            temporalScope: near.temporalScope,
            target: a.target,
            assertion: structuralOpens
              ? a.target.label + '은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.'
              : a.target.label + '은(는) 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 바로 그 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.',
            conclusionType: 'COMPOUND',
            direction: 'RESTRICTED',
            restriction: structuralOpens ? 'TIMING' : 'SCOPE',
          },
        });
        continue;
      }

      // A COMPOUND TRUTH is by definition about two DIFFERENT things, so it is reached from DIFFERENT_TARGET or
      // DIFFERENT_AXIS — but only when the product recognises the two axes as a named pair. Two unrelated
      // targets disagreeing is not a compound truth; it is simply two unrelated statements.
      if ((relation === 'DIFFERENT_AXIS' || relation === 'DIFFERENT_TARGET') && opposed(a, b)) {
        const frame = COMPOUND_PAIRS.find((p) =>
          (p.a === a.questionAxis && p.b === b.questionAxis) || (p.a === b.questionAxis && p.b === a.questionAxis));
        if (!frame) continue;
        const asked = a.questionAxis === ctx.askedAxis ? a : b;
        const other = asked === a ? b : a;
        const way = (p: ReasonedProposition) =>
          p.direction === 'FAVORABLE' ? '열립니다'
            : p.direction === 'UNFAVORABLE' ? '막힙니다'
              : '범위를 좁혀야 합니다';
        add({
          key: 'CROSS_AXIS_COMPOUND:' + frame.frame,
          rule: 'CROSS_AXIS_COMPOUND', relation, from: [a, b], compoundKind: frame.kind,
          spec: {
            axis: asked.questionAxis,
            temporalScope: asked.temporalScope,
            target: target('COMPOSITE', frame.frame, frame.frame),
            assertion: topic(frame.frame) + ' 다르게 봅니다. ' + axisLabel(asked.questionAxis) + '은 ' + way(asked)
              + ', ' + axisLabel(other.questionAxis) + '은 ' + way(other) + '. 둘 다 사실이라 나누어 말씀드립니다.',
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
    ...(c.subordinationReasons ? { subordinationReasons: c.subordinationReasons } : {}),
    ...(c.compoundKind ? { compoundKind: c.compoundKind } : {}),
    ...(c.standoff ? { standoff: c.standoff } : {}),
  }));
}
