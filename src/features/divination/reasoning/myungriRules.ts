// V4A §6/§14 — MYUNGRI DERIVATION RULES.
//
// Each rule recognises a PATTERN ACROSS PREMISES and states a conclusion none of those premises states alone.
// A rule that always fires would be a template, so every rule returns [] when its pattern is absent, and the
// metamorphic suite proves materiality by deleting or reversing one premise and watching the conclusion move.
//
// NO NEW ASTROLOGY (§26). Every rule combines interpretations already licensed in `myungriPremises.ts`; the
// combination is software reasoning, not a new doctrine. Where the classical texts would need a school to
// settle the question (강약 등급, 용신), the rule does not fire and the premises stay `unresolved`.
import type { JudgmentDomain, TemporalScope } from '../contracts';
import {
  compositeTarget, computeAdequacy, PRIMITIVE_RULE, sameTarget, sideAdequacy, target,
  type DerivationContext, type DerivationRule, type DivinationPremise, type ReasonedProposition,
  type SemanticTarget, type SupportGroup,
} from './kernel';

const NEAR: TemporalScope[] = ['SEWOON', 'WOLWOON', 'PRESENT_MOMENT'];
/** Axis names for user-facing assertions — two conclusions about different axes must not read identically. */
/** Which layer a near-term claim is about, named so two layers never read as the same sentence. */
const LAYER_LABEL: Record<TemporalScope, string> = {
  NATAL: '원국', DAEWOON: '지금의 큰 흐름', SEWOON: '올해', WOLWOON: '이 달',
  PRESENT_MOMENT: '지금 이 시점', UNSCOPED: '시기와 무관하게',
};
const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
const STRUCTURAL: TemporalScope[] = ['NATAL', 'DAEWOON'];
/**
 * V4C §21 — NARROWEST-FIRST, DETERMINISTICALLY.
 *
 * A conclusion that genuinely spans several layers still has to declare ONE scope, and V4B took it from
 * whichever premise the array happened to yield first. That is array order deciding a user-visible temporal
 * claim. The layer a claim is most immediately about is the narrowest one it stands on, and "narrowest" is a
 * fixed property of the layers, not of the iteration.
 */
const SCOPE_WIDTH: Record<TemporalScope, number> = {
  PRESENT_MOMENT: 0, WOLWOON: 1, SEWOON: 2, DAEWOON: 3, NATAL: 4, UNSCOPED: 5,
};
const narrowestScope = (ps: { temporalScope: TemporalScope }[]): TemporalScope =>
  ps.map((p) => p.temporalScope).sort((a, b) => SCOPE_WIDTH[a] - SCOPE_WIDTH[b])[0];

/**
 * Content-addressed id: the SAME pattern over the SAME premises is the SAME conclusion, so the fixed-point
 * loop converges and two runs of identical input produce identical graphs (no clock, no counter).
 */
/**
 * Content-addressed id. V4D §13 — DERIVED PARENTS COUNT TOWARD IDENTITY.
 *
 * V4C hashed only the premises a conclusion cites directly, so INFLOW_VS_RETENTION — which stands on a
 * derived CONTESTED_SHARE it does not cite premise-wise — produced the SAME id for two conclusions built on
 * two different contests. `runDerivations` dedupes by id, so one of them would simply never appear.
 */
const derivedId = (
  rule: string, axis: JudgmentDomain, premiseIds: string[], parentIds: string[] = [],
): string => `d:${rule}:${axis}:${[...premiseIds].sort().join('+')}`
  + (parentIds.length > 0 ? `^${[...parentIds].sort().join('+')}` : '');

function make(
  rule: string,
  ctx: DerivationContext,
  spec: {
    axis: JudgmentDomain;
    temporalScope: TemporalScope;
    assertion: string;
    conclusionType: ReasonedProposition['conclusionType'];
    direction: ReasonedProposition['direction'];
    restriction?: ReasonedProposition['restriction'];
    support: DivinationPremise[];
    oppose: DivinationPremise[];
    from?: ReasonedProposition[];
    unresolved?: DivinationPremise[];
    target: SemanticTarget;
    /** §15 — how this instance's inputs are load-bearing. Declarative; only certification reads it. */
    supportGroups?: SupportGroup[];
  },
): ReasonedProposition {
  const support = spec.support;
  const oppose = spec.oppose;
  return {
    id: derivedId(rule, spec.axis, [...support, ...oppose].map((p) => p.id),
      (spec.from ?? []).map((p) => p.id)),
    discipline: 'MYUNGRI',
    subject: ctx.subject,
    target: spec.target,
    questionIntent: ctx.questionIntent,
    questionAxis: spec.axis,
    temporalScope: spec.temporalScope,
    assertion: spec.assertion,
    conclusionType: spec.conclusionType,
    direction: spec.direction,
    ...(spec.restriction ? { restriction: spec.restriction } : {}),
    answersAsked: spec.axis === ctx.askedAxis,
    supportingPremiseIds: support.map((p) => p.id),
    opposingPremiseIds: oppose.map((p) => p.id),
    // V4C §6/§7 — A DERIVED CONCLUSION DECLARES ITS PARENTS.
    //
    // These rules match on PREMISES, so V4B left `derivedFromPropositionIds` empty and the graph had no edge
    // between a derived conclusion and the single-premise readings it was built from. Supersession then had to
    // infer the relationship by counting premises, and answer selection could not tell that one conclusion
    // already accounted for the others. The edge is stated instead: every premise that produced a primitive
    // proposition (`role === 'ASSERTS'`, id `p:<premiseId>`) is a parent of the conclusion built on it.
    derivedFromPropositionIds: [...new Set([
      ...(spec.from ?? []).map((p) => p.id),
      ...[...support, ...oppose].filter((p) => p.role === 'ASSERTS').map((p) => `p:${p.id}`),
    ])],
    ...(spec.supportGroups ? { supportGroups: spec.supportGroups } : {}),
    unresolvedPremiseIds: (spec.unresolved ?? []).map((p) => p.id),
    doctrineReferences: [...new Set([...support, ...oppose].map((p) => p.doctrineReference))],
    derivationRule: rule,
    adequacy: computeAdequacy(support, oppose, { dataComplete: ctx.dataComplete, doctrine: 'ADOPTED' }),
  };
}

/**
 * R1 — CONTESTED_SHARE. 겁재가 들어와도 다툴 몫이 없으면 다툼이 아니다.
 *
 * This is a COMPOSITE conclusion about the relationship BETWEEN two different targets (the arriving rival and
 * the natal wealth seats), which is exactly why it is informative. §3's target-identity requirement governs
 * contradiction / temporal decomposition / causal chains / reinforcement / dominance — not compositions, where
 * the whole point is that the targets differ. The composite target records both sides.
 */
const CONTESTED_SHARE: DerivationRule = {
  id: 'CONTESTED_SHARE',
  describes: '겁재가 들어온 시기 × 원국에 실제로 존재하는 재물 자리 → 몫을 두고 겨루는 구조',
  apply(premises, _derived, ctx) {
    const rivals = premises.filter((p) => p.concept === 'RIVAL_CLAIM');
    const wealth = premises.filter((p) =>
      p.concept === 'NATAL_FAMILY' && p.questionAxis === 'MONEY_INFLOW' && p.semanticRelation === 'SUPPORTS');
    if (rivals.length === 0 || wealth.length === 0) return [];
    return [make('CONTESTED_SHARE', ctx, {
      axis: 'MONEY_RETENTION',
      temporalScope: narrowestScope(rivals),
      target: compositeTarget(
        'RIVAL_VS_WEALTH', [rivals.map((p) => p.target), wealth.map((p) => p.target)], '벌이는 몫과 남는 몫'),
      assertion: '원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.',
      conclusionType: 'COMPOUND',
      direction: 'RESTRICTED',
      restriction: 'SCOPE',
      // Both sides SUPPORT this compound claim: the wealth seats and the rival together are what make it true.
      support: [...wealth, ...rivals],
      oppose: [],
      supportGroups: [
        { role: 'ALTERNATIVE', label: '몫을 나누는 기운', ids: rivals.map((p) => p.id) },
        { role: 'ALTERNATIVE', label: '원국의 재물 자리', ids: wealth.map((p) => p.id) },
      ],
    })];
  },
};
/**
 * R3 — DIRECTION_VS_EXECUTION. **TARGET-GATED (V4B §5).**
 *
 * V4A fired this on "same axis + different temporal band", so a structural reading of 원국 관성 and a this-month
 * strike on 원국 월지 — two claims about different things — became "방향은 맞지만 지금은 아니다". A temporal
 * decomposition is only meaningful when both halves are about the SAME SUBJECT and the SAME EXACT TARGET;
 * otherwise there is no single thing whose direction and timing could come apart.
 */
const DIRECTION_VS_EXECUTION: DerivationRule = {
  id: 'DIRECTION_VS_EXECUTION',
  describes: '같은 대상에 대해 구조적 개방(원국·대운) × 근시일 타격(세운·월운) → 방향과 실행 시점의 분리',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const opens = premises.filter((p) => STRUCTURAL.includes(p.temporalScope)
      && (p.semanticRelation === 'ENABLES' || p.semanticRelation === 'ACTIVATES' || p.semanticRelation === 'CONNECTS'));
    for (const open of opens) {
      const strikes = premises.filter((p) => NEAR.includes(p.temporalScope)
        && sameTarget(p.target, open.target)          // ← the fix: same THING, not merely same axis
        && p.subject === open.subject
        && p.questionAxis === open.questionAxis
        && (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS'));
      if (strikes.length === 0) continue;
      // V4C §9/§13 — BOTH HALVES MUST BE INDEPENDENTLY ASSERTED.
      //
      // "방향은 맞지만 지금은 아니다" asserts two things at once, and each half owns one of them. V4B required
      // only that each side exist, so a single BACKGROUND premise from an approximate birth time could claim
      // ownership of the DIRECTION while a squarely-evidenced near-term obstruction was demoted to a matter of
      // timing — the audit's "weak grounded positive manufactures FOR_BUT_LATER". A half that cannot stand on
      // its own does not get to own half of a compound; the two premises simply remain separate findings.
      if (sideAdequacy([open]) !== 'ADEQUATE') continue;
      // V4C §21/§22 — ONE CONCLUSION PER NEAR LAYER.
      //
      // V4B merged every near-term strike into a single conclusion whose `temporalScope` was
      // `strikes[0].temporalScope`. A year-level pressure and a month-level window then became one claim owned
      // by whichever premise sorted first: deleting the 월운 premise left the conclusion standing (now silently
      // "about" 세운), so the two layers could never be shown to have independent effects — and the user was
      // told about one timing when two were in play. Each near layer now derives its own compound, and they
      // stand or fall separately.
      const byScope = new Map<TemporalScope, DivinationPremise[]>();
      for (const p of strikes) byScope.set(p.temporalScope, [...(byScope.get(p.temporalScope) ?? []), p]);
      for (const [scope, layerStrikes] of byScope) {
        if (sideAdequacy(layerStrikes) !== 'ADEQUATE') continue;
        out.push(make('DIRECTION_VS_EXECUTION', ctx, {
          axis: open.questionAxis,
          temporalScope: scope,
          target: open.target,
          assertion: open.target.label + '은(는) 큰 흐름에서 열려 있는 자리인데, ' + LAYER_LABEL[scope]
            + '에 바로 그 자리가 흔들리고 있다. 방향과 지금 실행할 시점은 나누어 봐야 한다.',
          conclusionType: 'COMPOUND',
          direction: 'RESTRICTED',
          restriction: 'TIMING',
          // V4E §3 — SIDES ARE RELATIVE TO THIS ASSERTION. The compound claims "방향은 열려 있고 지금 실행은
          // 막혀 있다", and the strikes are what ESTABLISH the second half — they support this claim. V4D filed
          // them under `oppose` because their real-world valence is negative, which is precisely the blind
          // polarity mapping the adequacy split was built to remove: the conclusion's own evidence was being
          // reported as the material arguing against it.
          support: [open, ...layerStrikes],
          oppose: [],
          // §15 — the opening is REQUIRED (without it there is no direction to split from the moment); the
          // strikes of this layer substitute for each other.
          supportGroups: [
            { role: 'REQUIRED', label: '큰 흐름의 개방', ids: [open.id] },
            { role: 'ALTERNATIVE', label: LAYER_LABEL[scope] + '의 타격', ids: layerStrikes.map((p) => p.id) },
          ],
        }));
      }
    }
    return out;
  },
};

/** R5 — CONVERGENT_SEAT_PRESSURE. 서로 다른 시기의 압력이 같은 자리에 겹치는 것은 한 번의 타격과 다른 사건이다. */
const CONVERGENT_SEAT_PRESSURE: DerivationRule = {
  id: 'CONVERGENT_SEAT_PRESSURE',
  describes: '둘 이상의 시기 층이 같은 자리를 동시에 건드림 → 그 자리에 압력이 겹침',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const frictions = premises.filter((p) => p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS');
    const bySeat = new Map<string, DivinationPremise[]>();
    for (const p of frictions) bySeat.set(p.target.key, [...(bySeat.get(p.target.key) ?? []), p]);
    for (const [, unordered] of bySeat) {
      // §28 — every member shares the seat (that is the grouping key), but not necessarily the axis. Ordering
      // the group by its own content keeps the reported axis independent of premise emission order.
      const group = [...unordered].sort((a, b) => a.questionAxis.localeCompare(b.questionAxis)
        || SCOPE_WIDTH[a.temporalScope] - SCOPE_WIDTH[b.temporalScope]);
      const scopes = new Set(group.map((p) => p.temporalScope));
      if (scopes.size < 2) continue; // one layer hitting once is not convergence
      out.push(make('CONVERGENT_SEAT_PRESSURE', ctx, {
        axis: group[0].questionAxis,
        temporalScope: narrowestScope(group),
        target: group[0].target,
        assertion: group[0].target.label + '에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.',
        conclusionType: 'CAUSAL',
        // §22 — a CAUSE is not a VERDICT. This explains why something keeps happening; it does not recommend
        // for or against anything. Carrying UNFAVORABLE here let a causal statement become the headline of a
        // money question, which is a category error of the same family as answering a description with advice.
        direction: 'NONE',
        // These premises SUPPORT the claim that the seat is repeatedly struck — the claim is about them.
        support: group,
        oppose: [],
        // §15 — convergence is a claim about the GROUP: it needs two layers on one seat, and no particular
        // one of them. Removing any single layer may legitimately leave a convergence standing, so the honest
        // attack removes them all at once.
        supportGroups: [{ role: 'ALTERNATIVE', label: '같은 자리에 겹친 압력', ids: group.map((p) => p.id) }],
      }));
    }
    return out;
  },
};

/** R6 — INFLOW_VS_RETENTION. 들어오는 축과 남는 축은 다른 축이다. 둘 다 참일 때 복합 진실로 묶는다. */
const INFLOW_VS_RETENTION: DerivationRule = {
  id: 'INFLOW_VS_RETENTION',
  describes: '재물 유입 활성 × 보유 축의 반대 신호 → 들어오는 것과 남는 것의 분리',
  apply(premises, derived, ctx) {
    const inflow = premises.filter((p) => p.questionAxis === 'MONEY_INFLOW' && p.semanticRelation === 'ACTIVATES');
    const retentionRisk = premises.filter((p) => p.questionAxis === 'MONEY_RETENTION'
      && (p.semanticRelation === 'OPPOSES' || p.semanticRelation === 'WEAKENS' || p.semanticRelation === 'DESTABILIZES'));
    const contested = derived.filter((d) => d.derivationRule === 'CONTESTED_SHARE');
    // V4D §13 — THE RETENTION HALF IS NAMED BY WHATEVER ESTABLISHES IT.
    //
    // The guard has always accepted a derived CONTESTED_SHARE as an establishment of the retention side, but
    // the composite key named only `retentionRisk`. With the contest as the ONLY retention-side finding, the
    // key came out '…:TEN_GOD_FAMILY:WEALTH.' — a composite declaring a member group with NO members — so two
    // different contests over two different wealth seats collapsed into one identity, and the certification
    // harness (which mutates only directly-cited premises) never touched the contest at all. The audit found
    // the result: a conclusion certified REAL after exactly one premise was mutated.
    //
    // The contest's PREMISES deliberately stay OUT of `support`: they are cited through the parent edge, they
    // already reach the user through the contest's own standing conclusion, and copying them here would
    // double-report them and let a premise-level citation stand in for a proposition-level one.
    const retentionMembers = [
      ...retentionRisk.map((p) => p.target),
      ...contested.map((c) => c.target),
    ];
    if (inflow.length === 0 || retentionMembers.length === 0) return [];
    return [make('INFLOW_VS_RETENTION', ctx, {
      axis: 'MONEY_INFLOW',
      temporalScope: narrowestScope(inflow),
      // Named members, sorted — a bare constant key made every inflow/retention split in the app one identity.
      target: compositeTarget('INFLOW_VS_RETENTION',
        [inflow.map((p) => p.target), retentionMembers], '유입과 보유'),
      assertion: '돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.',
      conclusionType: 'COMPOUND',
      direction: 'RESTRICTED',
      restriction: 'SCOPE',
      support: [...inflow, ...retentionRisk],
      oppose: [],
      from: contested,
    })];
  },
};

/**
 * R7 — RECURRING_FRICTION_CAUSE. **TARGET-GATED (V4B §6).**
 *
 * V4A matched on axis, so two unrelated events that happened to share the RELATIONSHIP axis could be presented
 * as "계속 같은 문제로 부딪힌다". A recurrence claim requires the SAME EXACT TARGET being struck twice — a
 * standing natal weakness in that seat, and a luck layer landing on that same seat.
 */
const RECURRING_FRICTION_CAUSE: DerivationRule = {
  id: 'RECURRING_FRICTION_CAUSE',
  describes: '원국 자체가 약한 바로 그 자리를 운이 다시 건드림 → 반복되는 부딪힘의 구조적 원인',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const natalWeak = premises.filter((p) => p.temporalScope === 'NATAL' && p.semanticRelation === 'DESTABILIZES');
    for (const weak of natalWeak) {
      const again = premises.filter((p) => p.temporalScope !== 'NATAL'
        && sameTarget(p.target, weak.target)          // ← the fix: the SAME seat, not merely the same axis
        && p.subject === weak.subject
        && (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS'));
      if (again.length === 0) continue;
      out.push(make('RECURRING_FRICTION_CAUSE', ctx, {
        axis: weak.questionAxis,
        temporalScope: narrowestScope(again),
        target: weak.target,
        assertion: '반복해서 부딪히는 데는 이유가 있다. ' + weak.target.label
          + '가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 바로 그 자리를 다시 건드리고 있다.',
        conclusionType: 'CAUSAL',
        direction: 'NONE',
        support: [weak, ...again],
        oppose: [],
        // §15 — the natal weakness is REQUIRED (without it there is no recurrence, only an event); the luck
        // layers that strike it again are interchangeable, so they are attacked as a group.
        supportGroups: [
          { role: 'REQUIRED', label: '원국의 약한 자리', ids: [weak.id] },
          { role: 'ALTERNATIVE', label: '그 자리를 다시 건드리는 운', ids: again.map((p) => p.id) },
        ],
      }));
    }
    return out;
  },
};

// ── REMOVED IN V4B — heuristics that needed doctrine this repository does not have ────────────────
//
// R2 UNRECEIVED_OPPORTUNITY ("기회는 오되 받을 그릇이 없다") — read a natal family's ABSENCE, and could read a
//   DOCTRINE_BLOCK premise, as proof of missing capacity. A withheld or unavailable doctrine result means
//   UNKNOWN / NOT_EVALUATED; it is not evidence of absence, and it is certainly not evidence of incapacity.
//
// R4 PRESSURE_AGAINST_CAPACITY ("흔들려도 버틴다 / 못 버틴다") — applied a GLOBAL personal capacity, inferred
//   from 통근·득령, to whatever target happened to be destabilized. That is a strength judgment in all but
//   name, and 강약 is deliberately WITHHELD. Nothing may be inferred from broad rooting/season state about an
//   unrelated seat.
//
// R8 STRUCTURAL_PROFILE ("이 명식은 …쪽에 무게가 실려 있다") — built an astrology description out of count
//   buckets. Replacing one threshold with another would repeat the mistake, so it is removed outright.
//
// The cost is real: descriptive questions now answer only from individually grounded propositions, and often
// decline. §29 accepts that — precision before coverage.

/**
 * V4D §28 — EVERY RULE THAT CAN LEGALLY APPEAR IN A PERSISTED GRAPH.
 *
 * A restored proposition naming a rule this kernel does not have is not a conclusion — nothing can re-derive
 * it, explain it, or attack it, and `certify` would report UNSUPPORTED for something the graph presented as
 * an answer. Built from the rule objects themselves so it cannot drift.
 */
export const MYUNGRI_RULES: DerivationRule[] = [
  CONTESTED_SHARE,
  DIRECTION_VS_EXECUTION,
  CONVERGENT_SEAT_PRESSURE,
  INFLOW_VS_RETENTION,
  RECURRING_FRICTION_CAUSE,
];

/**
 * PRIMITIVE propositions — one per ASSERTING premise, marked `PRIMITIVE` so the synthesis counter can never
 * mistake a restatement for reasoning. They exist so an axis with only direct premises still has something to
 * say; `classifySynthesis` files every one of them as STATIC_RULE_OUTPUT, which is exactly what they are.
 */
export function primitivePropositions(
  premises: DivinationPremise[],
  ctx: DerivationContext,
): ReasonedProposition[] {
  return premises
    .filter((p) => p.role === 'ASSERTS')
    .map((p) => ({
      id: `p:${p.id}`,
      discipline: p.discipline,
      subject: p.subject,
      target: p.target,
      questionIntent: p.questionIntent,
      questionAxis: p.questionAxis,
      temporalScope: p.temporalScope,
      assertion: p.assertion,
      // ACTIVATES and ABSENT describe WHAT IS THE CASE, not whether it is good. "올해 재물 축이 움직인다" says
      // the axis is in play; reading that as FAVORABLE is an unjustified valence, and it let a bare activation
      // become the headline answer to "돈을 벌 수 있을까요?" — a statement that answers a different question.
      conclusionType: (p.semanticRelation === 'ABSENT' || p.semanticRelation === 'ACTIVATES'
        ? 'STRUCTURAL' : 'DIRECTIONAL') as ReasonedProposition['conclusionType'],
      answersAsked: p.questionAxis === ctx.askedAxis,
      direction: (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'OPPOSES'
        ? 'UNFAVORABLE'
        : p.semanticRelation === 'CONSTRAINS'
          ? 'RESTRICTED'
          : p.semanticRelation === 'CONNECTS' || p.semanticRelation === 'ENABLES'
            ? 'FAVORABLE'
            : 'NONE') as ReasonedProposition['direction'],
      supportingPremiseIds: [p.id],
      opposingPremiseIds: [],
      derivedFromPropositionIds: [],
      unresolvedPremiseIds: [],
      doctrineReferences: [p.doctrineReference],
      derivationRule: PRIMITIVE_RULE,
      adequacy: computeAdequacy([p], [], { dataComplete: ctx.dataComplete, doctrine: 'ADOPTED' }),
    }));
}
