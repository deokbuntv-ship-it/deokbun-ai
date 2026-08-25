// DIVINATION_ENGINE_V1 — PAIRWISE (궁합) JUDGES (§19).
//
// AUDIT FINDING THIS FIXES. Paid 궁합 (12덕) ran on Myungri pairwise facts only and hard-coded
// `ziwei: engine_not_connected` — the marriage palace was never consulted, so the reading could describe
// attraction but never the DIFFICULTY OF LIVING TOGETHER. That is why 궁합 answers collapsed into
// "서로 대화와 배려가 필요합니다" (§19's forbidden terminal answer).
//
// The decisive split this enables (§10-F): 명리's 일주 관계 says how strongly two people PULL; 자미's 부처궁
// says how hard the MARRIAGE runs. Those are different axes, so "인연은 강하지만 결혼생활은 쉽지 않다" is a
// resolved verdict — not a hedge.
import type { PairwiseRelationFacts, CompatibilityAssessment } from '@/features/compatibility/engine/types';
import type { ZiweiChart } from '@/features/ziwei/domain/ziweiTypes';

import { type DivinationJudgment, type JudgmentDomain, type JudgmentEvidence, type Stance } from './contracts';
import { sihuaKind } from './ziweiJudge';

export type PairMyungriJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  facts: PairwiseRelationFacts;
  assessment: CompatibilityAssessment;
  selfLabel: string;
  targetLabel: string;
};

const TEN_GOD_PULL: Record<string, string> = {
  DIRECT_WEALTH: '상대를 챙기고 관리하려는 결',
  INDIRECT_WEALTH: '상대에게 크게 베풀고 벌이려는 결',
  DIRECT_OFFICER: '상대의 기준과 책임을 따르는 결',
  SEVEN_KILLINGS: '상대에게 강하게 밀어붙이는 결',
  EATING_GOD: '상대에게 편하게 표현하는 결',
  HURTING_OFFICER: '상대에게 할 말을 다 하는 결',
  PEER: '상대와 대등하게 맞서는 결',
  ROB_WEALTH: '상대와 같은 것을 두고 겨루는 결',
  DIRECT_RESOURCE: '상대에게 기대고 배우는 결',
  INDIRECT_RESOURCE: '상대를 한 발 떨어져 보는 결',
};

/**
 * 명리 pairwise judgment. Uses the SHIPPED, versioned compatibility tier model (BOND / FRICTION / ELEMENT) —
 * no new astrology — and adds the INFLUENCE axis from the 십신 each person is to the other, a canonical fact
 * the tier model computes but never surfaced.
 */
export function judgePairMyungri(input: PairMyungriJudgeInput): DivinationJudgment {
  const { facts, assessment } = input;
  const bond = assessment.dimensions.find((d) => d.key === 'BOND')!;
  const friction = assessment.dimensions.find((d) => d.key === 'FRICTION')!;

  const dayCombo = facts.dayStemRelation?.kind === 'STEM_COMBINATION';
  const dayClash = facts.dayStemRelation?.kind === 'STEM_CLASH';
  const daySeatHarmony = facts.dayBranchRelations.some(
    (r) => r.kind === 'BRANCH_SIX_COMBINATION' || r.kind === 'BRANCH_HALF_THREE_HARMONY',
  );
  // 일지 = 배우자궁. A clash/punishment THERE is the classical "사는 자리가 부딪힌다" signal.
  const daySeatStrain = facts.dayBranchRelations.some(
    (r) => r.kind === 'BRANCH_CLASH' || r.kind === 'BRANCH_PUNISHMENT' || r.kind === 'BRANCH_HARM',
  );

  const evidenceFor: JudgmentEvidence[] = [];
  const evidenceAgainst: JudgmentEvidence[] = [];
  if (dayCombo) evidenceFor.push({ fact: '일간 천간합', meaning: '두 사람이 서로에게 자연히 끌리는 결이 있습니다.', domain: 'RELATION_BOND', temporalScope: 'NATAL', directness: 'DIRECT' });
  if (daySeatHarmony) evidenceFor.push({ fact: '일지 육합/반합', meaning: '함께 있는 자리가 서로 편안하게 맞물립니다.', domain: 'RELATION_STABILITY', temporalScope: 'NATAL', directness: 'DIRECT' });
  if (dayClash) evidenceAgainst.push({ fact: '일간 천간충', meaning: '생각을 정하는 방식에서 정면으로 부딪힙니다.', domain: 'CONFLICT', temporalScope: 'NATAL', directness: 'DIRECT' });
  if (daySeatStrain) evidenceAgainst.push({ fact: '일지 충·형·해(배우자 자리)', meaning: '같이 사는 자리에서 반복해 부딪히기 쉽습니다.', domain: 'RELATION_STABILITY', temporalScope: 'NATAL', directness: 'DIRECT' });

  const bondPositive = bond.signal === 'POSITIVE';
  const frictionHeavy = friction.signal === 'WATCH';

  let stance: Stance;
  let dominantConclusion: string;
  if (bondPositive && !frictionHeavy) {
    stance = 'STRONGLY_FOR';
    dominantConclusion = '두 분은 서로 당기는 힘이 분명하고 부딪히는 지점도 적은 궁합입니다.';
  } else if (bondPositive && frictionHeavy) {
    // §10-F — strong pull AND heavy friction is not "반반": it is a NAMED structure.
    stance = 'CONDITIONAL_FOR';
    dominantConclusion = '끌리는 힘은 분명하지만 부딪히는 자리도 함께 있는, 인연은 강하고 살림은 쉽지 않은 궁합입니다.';
  } else if (!bondPositive && frictionHeavy) {
    stance = 'AGAINST';
    dominantConclusion = '서로 당기는 힘보다 부딪히는 자리가 앞서는 궁합입니다.';
  } else {
    stance = 'CONDITIONAL_FOR';
    dominantConclusion = '크게 끌리지도 크게 부딪히지도 않는, 서로 맞춰 가며 사는 궁합입니다.';
  }

  const influence: JudgmentEvidence[] = [];
  if (facts.tenGodTargetToSelf) {
    influence.push({
      fact: `상대→나: ${facts.tenGodTargetToSelf}`,
      meaning: `상대는 ${input.selfLabel}에게 ${TEN_GOD_PULL[facts.tenGodTargetToSelf] ?? '고유한 결'}로 작용합니다.`,
      domain: 'INFLUENCE', temporalScope: 'NATAL', directness: 'DIRECT',
    });
  }
  if (facts.tenGodSelfToTarget) {
    influence.push({
      fact: `나→상대: ${facts.tenGodSelfToTarget}`,
      meaning: `${input.selfLabel}는 상대에게 ${TEN_GOD_PULL[facts.tenGodSelfToTarget] ?? '고유한 결'}로 작용합니다.`,
      domain: 'INFLUENCE', temporalScope: 'NATAL', directness: 'DIRECT',
    });
  }

  return {
    discipline: 'MYUNGRI',
    applicable: true,
    dataReliability: assessment.reducedPrecision ? 'REDUCED' : 'EXACT',
    ...(assessment.reducedPrecision ? { applicabilityReason: '두 분 중 한 명 이상 출생시간이 확정되지 않아 정밀도가 제한됩니다.' } : {}),
    questionDomain: input.questionDomain,
    temporalScope: 'NATAL',
    stance,
    dominantConclusion,
    dominantFactor: dayCombo ? '일간 천간합' : dayClash ? '일간 천간충' : daySeatStrain ? '일지 충·형·해' : `종합 ${assessment.overallLabel}`,
    directEvidence: [...evidenceFor, ...influence],
    counterEvidence: evidenceAgainst,
    internalContradictions: bondPositive && frictionHeavy ? ['끌리는 힘과 부딪히는 자리가 함께 있습니다.'] : [],
    timingSignals: [],
    domainSubJudgments: [
      { domain: 'RELATION_BOND', stance: bondPositive ? 'FOR' : 'CONDITIONAL_FOR', conclusion: bond.verdict },
      { domain: 'CONFLICT', stance: frictionHeavy ? 'AGAINST' : 'FOR', conclusion: friction.verdict },
      ...(influence.length ? [{ domain: 'INFLUENCE' as JudgmentDomain, stance, conclusion: influence[0].meaning }] : []),
    ],
    confidence: assessment.reducedPrecision ? 'MEDIUM' : 'HIGH',
    questionDirectness: 'DIRECT',
  };
}

/**
 * 자미 pairwise judgment — read from the 부처궁 (spouse palace) of BOTH charts when available. This is the
 * marriage-STABILITY axis 명리's 일주 reading cannot supply on its own. Never applicable without an exact
 * birth time (the engine returns no chart at all).
 */
export function judgePairZiwei(input: {
  question: string;
  questionDomain: JudgmentDomain;
  selfChart: ZiweiChart | null;
  targetChart: ZiweiChart | null;
}): DivinationJudgment {
  const charts = [input.selfChart, input.targetChart].filter((c): c is ZiweiChart => c !== null);
  if (charts.length === 0) {
    return {
      discipline: 'ZIWEI', applicable: false,
      applicabilityReason: '두 분의 출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.',
      dataReliability: 'UNUSABLE', questionDomain: input.questionDomain, temporalScope: 'NATAL',
      stance: 'NOT_APPLICABLE', dominantConclusion: '자미두수로는 이 궁합을 볼 수 없습니다.',
      dominantFactor: '명반 없음', directEvidence: [], counterEvidence: [], internalContradictions: [],
      timingSignals: [], domainSubJudgments: [], confidence: 'LOW', questionDirectness: 'GENERAL',
    };
  }

  const evidenceFor: JudgmentEvidence[] = [];
  const evidenceAgainst: JudgmentEvidence[] = [];
  for (const chart of charts) {
    const spouse = chart.palaces.find((p) => p.name.includes('부처'));
    if (!spouse) continue;
    const landed = chart.transformations.filter((t) => spouse.name.includes(t.palaceName) || t.palaceName.includes(spouse.name));
    for (const t of landed) {
      const kind = sihuaKind(t.transformation);
      if (kind === null) continue;
      const item: JudgmentEvidence = {
        fact: `부처궁에 ${t.star} 화${t.transformation}`,
        meaning: kind === 'GI'
          ? '배우자 자리가 얽히는 구조라, 같이 사는 과정의 난도가 올라갑니다.'
          : '배우자 자리에 힘이 실려, 관계를 끌고 갈 동력이 있습니다.',
        domain: 'RELATION_STABILITY', temporalScope: 'NATAL', directness: 'DIRECT',
      };
      if (kind === 'GI') evidenceAgainst.push(item);
      else evidenceFor.push(item);
    }
  }

  const stance: Stance = evidenceAgainst.length > 0 ? 'AGAINST' : evidenceFor.length > 0 ? 'FOR' : 'CONDITIONAL_FOR';
  return {
    discipline: 'ZIWEI', applicable: true, dataReliability: 'EXACT',
    questionDomain: 'RELATION_STABILITY', temporalScope: 'NATAL',
    stance,
    dominantConclusion:
      evidenceAgainst.length > 0
        ? '배우자 자리에 얽히는 기운이 있어, 결혼생활의 난도는 높게 봅니다.'
        : evidenceFor.length > 0
          ? '배우자 자리에 힘이 실려, 관계를 끌고 갈 동력이 있습니다.'
          : '배우자 자리에 특별히 두드러진 기운은 없습니다.',
    dominantFactor: (evidenceAgainst[0] ?? evidenceFor[0])?.fact ?? '부처궁 사화 없음',
    directEvidence: evidenceFor, counterEvidence: evidenceAgainst, internalContradictions: [],
    timingSignals: [],
    domainSubJudgments: [{ domain: 'RELATION_STABILITY', stance, conclusion: '결혼생활의 난도' }],
    confidence: evidenceAgainst.length + evidenceFor.length > 0 ? 'HIGH' : 'LOW',
    questionDirectness: 'DIRECT',
  };
}
