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
  computeAdequacy, PRIMITIVE_RULE,
  type DerivationContext, type DerivationRule, type DivinationPremise, type ReasonedProposition,
} from './kernel';

const NEAR: TemporalScope[] = ['SEWOON', 'WOLWOON', 'PRESENT_MOMENT'];
/** Axis names for user-facing assertions — two conclusions about different axes must not read identically. */
const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
const STRUCTURAL: TemporalScope[] = ['NATAL', 'DAEWOON'];

/**
 * Content-addressed id: the SAME pattern over the SAME premises is the SAME conclusion, so the fixed-point
 * loop converges and two runs of identical input produce identical graphs (no clock, no counter).
 */
const derivedId = (rule: string, axis: JudgmentDomain, premiseIds: string[]): string =>
  `d:${rule}:${axis}:${[...premiseIds].sort().join('+')}`;

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
    target: string;
  },
): ReasonedProposition {
  const support = spec.support;
  const oppose = spec.oppose;
  return {
    id: derivedId(rule, spec.axis, [...support, ...oppose].map((p) => p.id)),
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
    supportingPremiseIds: support.map((p) => p.id),
    opposingPremiseIds: oppose.map((p) => p.id),
    derivedFromPropositionIds: (spec.from ?? []).map((p) => p.id),
    unresolvedPremiseIds: (spec.unresolved ?? []).map((p) => p.id),
    doctrineReferences: [...new Set([...support, ...oppose].map((p) => p.doctrineReference))],
    derivationRule: rule,
    adequacy: computeAdequacy(support, oppose, { dataComplete: ctx.dataComplete, doctrine: 'ADOPTED' }),
  };
}

/** R1 — 겁재가 들어와도 다툴 몫이 없으면 다툼이 아니다. 두 전제가 만나야 비로소 경합이 성립한다. */
const CONTESTED_SHARE: DerivationRule = {
  id: 'CONTESTED_SHARE',
  describes: '겁재가 들어온 시기 × 원국에 실제로 존재하는 재물 자리 → 몫을 두고 겨루는 구조',
  apply(premises, _derived, ctx) {
    const rivals = premises.filter((p) => p.concept === 'RIVAL_CLAIM');
    const wealth = premises.filter((p) =>
      p.concept === 'NATAL_FAMILY' && p.questionAxis === 'MONEY_INFLOW'
      && (p.semanticRelation === 'ENABLES' || p.semanticRelation === 'SUPPORTS'));
    if (rivals.length === 0 || wealth.length === 0) return [];
    return [make('CONTESTED_SHARE', ctx, {
      axis: 'MONEY_RETENTION',
      temporalScope: rivals[0].temporalScope,
      target: '벌이는 몫과 남는 몫',
      assertion: '원국에 실제로 재물 자리가 있는데 지금 그 몫을 나눠 갖는 기운이 함께 들어와, 버는 것과 남기는 것이 서로 다른 문제가 된다.',
      conclusionType: 'COMPOUND',
      direction: 'RESTRICTED',
      restriction: 'SCOPE',
      support: wealth,
      oppose: rivals,
    })];
  },
};

/** R2 — 운은 축을 열지만 원국에 받을 자리가 없으면, 기회는 지나간다. */
const UNRECEIVED_OPPORTUNITY: DerivationRule = {
  id: 'UNRECEIVED_OPPORTUNITY',
  describes: '운에서 어떤 축이 활성화됨 × 그 축을 받칠 원국 자리 부재 → 기회는 오되 손에 남지 않음',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const activations = premises.filter((p) => p.semanticRelation === 'ACTIVATES');
    for (const act of activations) {
      const absent = premises.find((p) =>
        p.semanticRelation === 'ABSENT' && p.temporalScope === 'NATAL' && p.questionAxis === act.questionAxis);
      if (!absent) continue;
      out.push(make('UNRECEIVED_OPPORTUNITY', ctx, {
        axis: act.questionAxis,
        temporalScope: act.temporalScope,
        target: absent.target,
        assertion: `${act.assertion.replace(/\.$/, '')} 그러나 원국에 그것을 받아 둘 자리가 없어, 움직임은 생겨도 손에 남는 형태가 되기는 어렵다.`,
        conclusionType: 'COMPOUND',
        direction: 'RESTRICTED',
        restriction: 'CAPACITY',
        support: [act],
        oppose: [absent],
      }));
    }
    return out;
  },
};

/**
 * R3 — C7 CLASS FIX. 구조(원국·대운)가 여는 축과 근시일(세운·월운)이 흔드는 축이 같을 때에만 방향/시점을 분리한다.
 * 무관한 구조적 긍정이 FOR_BUT_LATER를 만들어 내던 옛 버그는 축·대상이 일치해야 발화하므로 재현되지 않는다.
 */
const DIRECTION_VS_EXECUTION: DerivationRule = {
  id: 'DIRECTION_VS_EXECUTION',
  describes: '같은 축에서 구조적 개방(원국·대운) × 근시일 타격(세운·월운) → 방향과 실행 시점의 분리',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const axes = [...new Set(premises.map((p) => p.questionAxis))];
    for (const axis of axes) {
      const opens = premises.filter((p) => p.questionAxis === axis
        && STRUCTURAL.includes(p.temporalScope)
        && (p.semanticRelation === 'ENABLES' || p.semanticRelation === 'ACTIVATES' || p.semanticRelation === 'CONNECTS'));
      const strikes = premises.filter((p) => p.questionAxis === axis
        && NEAR.includes(p.temporalScope)
        && (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS'));
      if (opens.length === 0 || strikes.length === 0) continue;
      out.push(make('DIRECTION_VS_EXECUTION', ctx, {
        axis,
        temporalScope: strikes[0].temporalScope,
        target: '방향과 실행 시점',
        assertion: `${AXIS_LABEL[axis] ?? '이 축'}은 가는 방향 자체는 바탕이 받쳐 주지만, 가까운 시기에 같은 자리가 흔들리고 있어 지금 크게 벌이는 실행만 따로 떼어 불리하게 본다.`,
        conclusionType: 'COMPOUND',
        direction: 'RESTRICTED',
        restriction: 'TIMING',
        support: opens,
        oppose: strikes,
      }));
    }
    return out;
  },
};

/** R4 — 같은 타격이라도 버틸 바탕이 있느냐에 따라 결론이 갈린다. 뿌리/월령 전제를 뒤집으면 결론이 뒤집힌다. */
const PRESSURE_AGAINST_CAPACITY: DerivationRule = {
  id: 'PRESSURE_AGAINST_CAPACITY',
  describes: '자리를 흔드는 타격 × 그것을 버틸 바탕(통근·득령)의 유무 → 견딤 / 못 견딤',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const holds = premises.filter((p) =>
      (p.concept === 'ROOTING' && p.semanticRelation === 'STABILIZES')
      || (p.concept === 'SEASONAL_FOOTING' && p.semanticRelation === 'ENABLES'));
    const lacks = premises.filter((p) =>
      (p.concept === 'ROOTING' && p.semanticRelation === 'WEAKENS')
      || (p.concept === 'SEASONAL_FOOTING' && p.semanticRelation === 'CONSTRAINS'));
    if (holds.length === 0 && lacks.length === 0) return [];
    const axes = [...new Set(premises.filter((p) => p.semanticRelation === 'DESTABILIZES').map((p) => p.questionAxis))];
    for (const axis of axes) {
      const strikes = premises.filter((p) => p.semanticRelation === 'DESTABILIZES' && p.questionAxis === axis);
      const canHold = holds.length > 0;
      out.push(make('PRESSURE_AGAINST_CAPACITY', ctx, {
        axis,
        temporalScope: strikes[0].temporalScope,
        target: strikes[0].target,
        assertion: canHold
          ? `${strikes[0].target}가 흔들리지만 되돌아올 바탕이 있어, 범위를 좁히면 감당할 수 있다.`
          : `${strikes[0].target}가 흔들리는데 받쳐 줄 바탕도 없어, 그대로 밀고 가면 무리가 된다.`,
        conclusionType: 'DIRECTIONAL',
        direction: canHold ? 'RESTRICTED' : 'UNFAVORABLE',
        ...(canHold ? { restriction: 'SCOPE' as const } : {}),
        support: canHold ? holds : [],
        oppose: canHold ? strikes : [...strikes, ...lacks],
      }));
    }
    return out;
  },
};

/** R5 — 서로 다른 시기의 압력이 같은 자리에 겹치는 것은 한 번의 타격과 다른 사건이다. */
const CONVERGENT_SEAT_PRESSURE: DerivationRule = {
  id: 'CONVERGENT_SEAT_PRESSURE',
  describes: '둘 이상의 시기 층이 같은 자리를 동시에 건드림 → 그 자리에 압력이 겹침',
  apply(premises, _derived, ctx) {
    const out: ReasonedProposition[] = [];
    const frictions = premises.filter((p) => p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS');
    const bySeat = new Map<string, DivinationPremise[]>();
    for (const p of frictions) bySeat.set(p.target, [...(bySeat.get(p.target) ?? []), p]);
    for (const [seat, group] of bySeat) {
      const scopes = new Set(group.map((p) => p.temporalScope));
      if (scopes.size < 2) continue; // one layer hitting once is not convergence
      out.push(make('CONVERGENT_SEAT_PRESSURE', ctx, {
        axis: group[0].questionAxis,
        temporalScope: group.find((p) => NEAR.includes(p.temporalScope))?.temporalScope ?? group[0].temporalScope,
        target: seat,
        assertion: `${seat}에는 서로 다른 시기의 압력이 겹쳐 들어와, 한 번 스치는 일이 아니라 반복해서 건드려지는 자리다.`,
        conclusionType: 'CAUSAL',
        direction: 'UNFAVORABLE',
        support: [],
        oppose: group,
      }));
    }
    return out;
  },
};

/** R6 — 들어오는 축과 남는 축은 다른 축이다. 둘 다 참일 때 복합 진실로 묶는다. */
const INFLOW_VS_RETENTION: DerivationRule = {
  id: 'INFLOW_VS_RETENTION',
  describes: '재물 유입 활성 × 보유 축의 반대 신호 → 들어오는 것과 남는 것의 분리',
  apply(premises, derived, ctx) {
    const inflow = premises.filter((p) => p.questionAxis === 'MONEY_INFLOW'
      && (p.semanticRelation === 'ACTIVATES' || p.semanticRelation === 'ENABLES'));
    const retentionRisk = [
      ...premises.filter((p) => p.questionAxis === 'MONEY_RETENTION'
        && (p.semanticRelation === 'OPPOSES' || p.semanticRelation === 'WEAKENS' || p.semanticRelation === 'DESTABILIZES')),
    ];
    const contested = derived.filter((d) => d.derivationRule === 'CONTESTED_SHARE');
    if (inflow.length === 0 || (retentionRisk.length === 0 && contested.length === 0)) return [];
    return [make('INFLOW_VS_RETENTION', ctx, {
      axis: 'MONEY_INFLOW',
      temporalScope: inflow[0].temporalScope,
      target: '유입과 보유',
      assertion: '돈이 들어오는 쪽과 남는 쪽은 이 명식에서 같은 답이 아니다. 유입은 움직이는데 보유 쪽에 반대 신호가 붙어 있어, 두 축을 나누어 답해야 한다.',
      conclusionType: 'COMPOUND',
      direction: 'RESTRICTED',
      restriction: 'SCOPE',
      support: inflow,
      oppose: retentionRisk,
      from: contested,
    })];
  },
};

/** R7 — CAUSE_WHY: 원국이 이미 약한 자리를 운이 다시 건드릴 때, 반복의 원인이 구조적으로 설명된다. */
const RECURRING_FRICTION_CAUSE: DerivationRule = {
  id: 'RECURRING_FRICTION_CAUSE',
  describes: '원국 자체의 마찰 × 그 자리를 다시 건드리는 운 → 반복되는 부딪힘의 구조적 원인',
  apply(premises, _derived, ctx) {
    // A causal account of the SPOUSE seat is not an answer to a money question. This rule explains a
    // recurrence, so it fires only when a recurrence was asked about, or when the seat it explains is the
    // asked axis — otherwise it is noise the synthesis would have to filter out later anyway.
    const relevant = (p: DivinationPremise) =>
      ctx.questionIntent === 'CAUSE_WHY' || p.questionAxis === ctx.askedAxis;
    const natalWeak = premises.filter((p) =>
      p.temporalScope === 'NATAL' && p.semanticRelation === 'DESTABILIZES' && relevant(p));
    if (natalWeak.length === 0) return [];
    const axis = natalWeak[0].questionAxis;
    // The recurrence must be on the SAME axis — a different axis being hit is a different story.
    const temporalHit = premises.filter((p) => p.temporalScope !== 'NATAL' && p.questionAxis === axis
      && (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS'));
    if (temporalHit.length === 0) return [];
    return [make('RECURRING_FRICTION_CAUSE', ctx, {
      axis,
      temporalScope: temporalHit[0].temporalScope,
      target: natalWeak[0].target,
      assertion: `반복해서 부딪히는 자리는 우연이 아니다. ${natalWeak[0].target}가 원국에서 이미 약하게 짜여 있는데, 지금 흐름이 같은 성격의 자리를 다시 건드리고 있어 같은 일이 되풀이된다.`,
      conclusionType: 'CAUSAL',
      direction: 'NONE',
      support: natalWeak,
      oppose: temporalHit,
    })];
  },
};

/**
 * R8 — DESCRIPTIVE. 방향을 묻지 않은 질문에는 방향을 만들지 않는다. 원국의 무게중심은 "어느 축에 자리가
 * 겹치는가 대 어느 축이 얇거나 비는가"의 대비이므로, 모든 축이 있든 없든 항상 말할 수 있는 구조가 있다.
 * (첫 구현은 '겹친 축 AND 빈 축'을 동시에 요구해 대부분의 명식에서 침묵했다 — 서술형 질문이 답을 못 받았다.)
 */
const STRUCTURAL_PROFILE: DerivationRule = {
  id: 'STRUCTURAL_PROFILE',
  describes: '원국에서 자리가 겹친 축 × 얇거나 비어 있는 축 → 방향 없는 구조 서술',
  apply(premises, _derived, ctx) {
    const natal = premises.filter((p) => p.concept === 'NATAL_FAMILY'
      && ['ENABLES', 'SUPPORTS', 'ABSENT'].includes(p.semanticRelation));
    if (natal.length < 2) return [];
    const doubled = natal.filter((p) => p.semanticRelation === 'ENABLES');
    const thin = natal.filter((p) => p.semanticRelation !== 'ENABLES');
    // ', ' not '·' — several family names already CONTAIN '·' (자리·책임, 활동·표현), so a '·' join runs them together.
    const name = (ps: typeof natal) => ps.map((p) => p.target.replace('원국 ', '')).join(', ');

    const assertion = doubled.length > 0 && thin.length > 0
      ? `이 명식은 ${name(doubled)} 쪽에 자리가 겹쳐 무게가 실려 있고, ${name(thin)} 쪽은 얇거나 비어 있다. 잘 쓰는 자리와 빌려 써야 하는 자리가 뚜렷하게 갈리는 구조다.`
      : doubled.length > 0
        ? `이 명식은 ${name(doubled)} 쪽 모두에 자리가 겹쳐 있어, 어느 축을 잡아도 받쳐 줄 바탕이 있는 구조다.`
        : `이 명식은 어느 축에도 자리가 몰려 있지 않고 ${name(thin)} 쪽으로 고르게 퍼져 있다. 특정 분야로 쏠리기보다 상황에 따라 쓰는 자리가 달라지는 구조다.`;

    return [make('STRUCTURAL_PROFILE', ctx, {
      axis: 'GENERAL',
      temporalScope: 'NATAL',
      target: '원국의 무게중심',
      assertion,
      conclusionType: 'STRUCTURAL',
      direction: 'NONE',
      support: doubled.length > 0 ? doubled : thin,
      oppose: doubled.length > 0 ? thin : [],
    })];
  },
};

export const MYUNGRI_RULES: DerivationRule[] = [
  CONTESTED_SHARE,
  UNRECEIVED_OPPORTUNITY,
  DIRECTION_VS_EXECUTION,
  PRESSURE_AGAINST_CAPACITY,
  CONVERGENT_SEAT_PRESSURE,
  INFLOW_VS_RETENTION,
  RECURRING_FRICTION_CAUSE,
  STRUCTURAL_PROFILE,
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
      conclusionType: (p.semanticRelation === 'ABSENT' ? 'STRUCTURAL' : 'DIRECTIONAL') as ReasonedProposition['conclusionType'],
      direction: (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'OPPOSES'
        ? 'UNFAVORABLE'
        : p.semanticRelation === 'CONSTRAINS'
          ? 'RESTRICTED'
          : p.semanticRelation === 'CONNECTS' || p.semanticRelation === 'ACTIVATES' || p.semanticRelation === 'ENABLES'
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
