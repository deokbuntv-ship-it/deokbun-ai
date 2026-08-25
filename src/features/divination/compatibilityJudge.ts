// DIVINATION_ENGINE_V1 — PAIRWISE (궁합) JUDGES. REBUILT (audit: COMPATIBILITY_MONEY_AXIS =
// LABEL_ONLY_MATERIAL_BLOCKER; "궁합 보통" single-score collapse).
//
// WHAT THE AUDIT FOUND, AND WHAT CHANGED:
//   · The money axis existed as a LABEL only — a money question was routed, but the pair stance was still
//     decided by BOND/FRICTION and pair Ziwei hard-coded `questionDomain: RELATION_STABILITY`. Nothing about
//     money was ever computed, so the LLM was free to fill the gap with invented prose.
//     → A real MONEY axis is now computed from facts that actually exist for BOTH people:
//         · the mutual 십신 between the two day masters — 재성 means one is the other's resource to manage,
//           비견/겁재 means they pull on the SAME resources (겁재's own canonical identity is ROB_WEALTH);
//         · each chart's 재백궁(earning) and 전택궁(keeping) 四化 — 化忌 there is a real leak signal;
//         · shared elemental gaps, which show where neither partner covers the other.
//   · One global tier hid real structure → the pair now returns independent axes (BOND / CONFLICT /
//     RELATION_STABILITY / MONEY_RETENTION / INFLUENCE), so a couple can be BOND-high and MONEY-frictional
//     at once instead of averaging to "보통".
import type { CompatibilityAssessment, PairwiseRelationFacts } from '@/features/compatibility/engine/types';
import type { ZiweiChart } from '@/features/ziwei/domain/ziweiTypes';

import {
  NO_SIGNAL,
  type DivinationJudgment,
  type DomainSubJudgment,
  type EvidenceStrength,
  type JudgmentDomain,
  type JudgmentEvidence,
  type Stance,
} from './contracts';
import { sihuaKind } from './ziweiJudge';
import { tenGodFamily } from './myungriJudge';

export type PairMyungriJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  facts: PairwiseRelationFacts;
  assessment: CompatibilityAssessment;
  selfLabel: string;
  targetLabel: string;
};

const TEN_GOD_PULL: Record<string, string> = {
  DIRECT_WEALTH: '상대를 챙기고 관리하려는 결', INDIRECT_WEALTH: '상대에게 크게 베풀고 벌이려는 결',
  DIRECT_OFFICER: '상대의 기준과 책임을 따르는 결', SEVEN_KILLINGS: '상대에게 강하게 밀어붙이는 결',
  EATING_GOD: '상대에게 편하게 표현하는 결', HURTING_OFFICER: '상대에게 할 말을 다 하는 결',
  PEER: '상대와 대등하게 맞서는 결', ROB_WEALTH: '상대와 같은 것을 두고 겨루는 결',
  DIRECT_RESOURCE: '상대에게 기대고 배우는 결', INDIRECT_RESOURCE: '상대를 한 발 떨어져 보는 결',
};

const ev = (fact: string, meaning: string, domain: JudgmentDomain): JudgmentEvidence => ({
  fact, meaning, domain, temporalScope: 'NATAL', directness: 'DIRECT',
});

const sub = (
  domain: JudgmentDomain, stance: Stance, conclusion: string,
  evidence: JudgmentEvidence[], counterEvidence: JudgmentEvidence[], reduced: boolean,
): DomainSubJudgment => ({
  domain, stance, conclusion, temporalScope: 'NATAL', directness: 'DIRECT',
  reliability: reduced ? 'REDUCED' : 'EXACT', evidence, counterEvidence,
});

export function judgePairMyungri(input: PairMyungriJudgeInput): DivinationJudgment {
  const { facts, assessment } = input;
  const reduced = assessment.reducedPrecision;
  const bond = assessment.dimensions.find((d) => d.key === 'BOND')!;
  const friction = assessment.dimensions.find((d) => d.key === 'FRICTION')!;

  const dayCombo = facts.dayStemRelation?.kind === 'STEM_COMBINATION';
  const dayClash = facts.dayStemRelation?.kind === 'STEM_CLASH';
  const daySeatHarmony = facts.dayBranchRelations.some((r) => r.kind === 'BRANCH_SIX_COMBINATION' || r.kind === 'BRANCH_HALF_THREE_HARMONY');
  const daySeatStrain = facts.dayBranchRelations.some((r) => r.kind === 'BRANCH_CLASH' || r.kind === 'BRANCH_PUNISHMENT' || r.kind === 'BRANCH_HARM');

  // ── BOND ────────────────────────────────────────────────────────────────────────────────────────
  const bondFor: JudgmentEvidence[] = [];
  const bondAgainst: JudgmentEvidence[] = [];
  if (dayCombo) bondFor.push(ev('일간 천간합', '두 사람이 서로에게 자연히 끌리는 결이 있습니다.', 'RELATION_BOND'));
  if (daySeatHarmony) bondFor.push(ev('일지 육합/반합', '함께 있는 자리가 서로 편안하게 맞물립니다.', 'RELATION_BOND'));
  if (dayClash) bondAgainst.push(ev('일간 천간충', '생각을 정하는 방식에서 정면으로 부딪힙니다.', 'RELATION_BOND'));
  const bondStance: Stance = bondFor.length > bondAgainst.length ? (bondFor.length >= 2 ? 'STRONGLY_FOR' : 'FOR')
    : bondAgainst.length > 0 ? 'CONDITIONAL_AGAINST' : NO_SIGNAL;

  // ── MARRIAGE / DOMESTIC STABILITY (일지 = 배우자 자리) ────────────────────────────────────────────
  const marFor: JudgmentEvidence[] = [];
  const marAgainst: JudgmentEvidence[] = [];
  if (daySeatHarmony) marFor.push(ev('일지 육합/반합', '같이 사는 자리가 서로 맞물립니다.', 'RELATION_STABILITY'));
  if (daySeatStrain) marAgainst.push(ev('일지 충·형·해(배우자 자리)', '같이 사는 자리에서 반복해 부딪히기 쉽습니다.', 'RELATION_STABILITY'));
  const marStance: Stance = marAgainst.length > 0 ? 'AGAINST' : marFor.length > 0 ? 'FOR' : NO_SIGNAL;

  // ── CONFLICT ────────────────────────────────────────────────────────────────────────────────────
  const conflictHeavy = friction.signal === 'WATCH';
  const conflictEvidence = conflictHeavy
    ? [ev('두 사람 사이 충·형·파·해 다수', friction.verdict, 'CONFLICT')]
    : [ev('두 사람 사이 충돌 적음', friction.verdict, 'CONFLICT')];

  // ── MONEY / HOUSEHOLD (REAL AXIS — was label-only) ──────────────────────────────────────────────
  const moneyFor: JudgmentEvidence[] = [];
  const moneyAgainst: JudgmentEvidence[] = [];
  const famTargetToSelf = facts.tenGodTargetToSelf ? tenGodFamily(facts.tenGodTargetToSelf) : null;
  const famSelfToTarget = facts.tenGodSelfToTarget ? tenGodFamily(facts.tenGodSelfToTarget) : null;

  if (famTargetToSelf === 'WEALTH' || famSelfToTarget === 'WEALTH') {
    moneyFor.push(ev(
      `상호 십신에 재성 (${facts.tenGodTargetToSelf ?? ''}${facts.tenGodSelfToTarget ? `/${facts.tenGodSelfToTarget}` : ''})`,
      '한쪽이 다른 쪽의 살림을 실제로 굴리는 관계라, 돈이 도는 축은 분명합니다.',
      'MONEY_RETENTION',
    ));
  }
  // 겁재(ROB_WEALTH)는 그 이름 그대로 같은 재물을 두고 겨루는 십신 — 가계 마찰의 정통 신호.
  const rivalry = facts.tenGodTargetToSelf === 'ROB_WEALTH' || facts.tenGodSelfToTarget === 'ROB_WEALTH';
  const peerLevel = famTargetToSelf === 'PEER' || famSelfToTarget === 'PEER';
  if (rivalry) {
    moneyAgainst.push(ev('상호 십신에 겁재', '같은 몫을 두고 겨루는 자리라, 돈 문제에서 부딪히기 쉽습니다.', 'MONEY_RETENTION'));
  } else if (peerLevel) {
    moneyAgainst.push(ev('상호 십신에 비견', '살림의 주도권을 두고 서로 물러서지 않는 편입니다.', 'MONEY_RETENTION'));
  }
  if (facts.elementComplement.sharedMissing.length >= 2) {
    moneyAgainst.push(ev(
      `공통으로 약한 기운 ${facts.elementComplement.sharedMissing.length}가지`,
      '두 사람 모두 비어 있는 자리가 있어, 그 부분은 서로 메워 주지 못합니다.',
      'MONEY_RETENTION',
    ));
  }
  if (facts.elementComplement.selfSuppliesTarget.length + facts.elementComplement.targetSuppliesSelf.length >= 2) {
    moneyFor.push(ev('서로 부족한 기운을 채움', '한쪽이 비는 자리를 다른 쪽이 메워, 살림이 굴러가는 편입니다.', 'MONEY_RETENTION'));
  }
  const moneyStance: Stance =
    moneyAgainst.length > moneyFor.length ? (rivalry ? 'AGAINST' : 'CONDITIONAL_AGAINST')
      : moneyFor.length > moneyAgainst.length ? 'FOR'
        : moneyFor.length > 0 ? 'CONDITIONAL_FOR' : NO_SIGNAL;

  // ── INFLUENCE (who exerts what on whom) ─────────────────────────────────────────────────────────
  const influence: JudgmentEvidence[] = [];
  if (facts.tenGodTargetToSelf) {
    influence.push(ev(`상대→${input.selfLabel}: ${facts.tenGodTargetToSelf}`, `상대는 ${TEN_GOD_PULL[facts.tenGodTargetToSelf] ?? '고유한 결'}로 작용합니다.`, 'INFLUENCE'));
  }
  if (facts.tenGodSelfToTarget) {
    influence.push(ev(`${input.selfLabel}→상대: ${facts.tenGodSelfToTarget}`, `${input.selfLabel}는 ${TEN_GOD_PULL[facts.tenGodSelfToTarget] ?? '고유한 결'}로 작용합니다.`, 'INFLUENCE'));
  }

  const subs: DomainSubJudgment[] = [
    sub('RELATION_BOND', bondStance, bond.verdict, bondFor, bondAgainst, reduced),
    sub('RELATION_STABILITY', marStance,
      marAgainst.length ? '같이 사는 과정의 난도는 높게 봅니다.' : marFor.length ? '같이 사는 자리는 맞물립니다.' : '배우자 자리에 두드러진 신호는 없습니다.',
      marFor, marAgainst, reduced),
    sub('CONFLICT', conflictHeavy ? 'AGAINST' : 'FOR', friction.verdict,
      conflictHeavy ? [] : conflictEvidence, conflictHeavy ? conflictEvidence : [], reduced),
    sub('MONEY_RETENTION', moneyStance,
      moneyAgainst.length ? '돈·살림에서는 부딪히는 자리가 있습니다.' : moneyFor.length ? '돈·살림은 서로 굴러가는 편입니다.' : '돈 쪽으로는 뚜렷한 신호가 잡히지 않습니다.',
      moneyFor, moneyAgainst, reduced),
    ...(influence.length ? [sub('INFLUENCE', 'CONDITIONAL_FOR', influence[0].meaning, influence, [], reduced)] : []),
  ];

  const primary = subs.find((s) => s.domain === input.questionDomain) ?? subs[0];
  const evidenceStrength: EvidenceStrength =
    primary.stance === NO_SIGNAL ? 'NONE'
      : primary.evidence.length + primary.counterEvidence.length >= 3 ? 'STRONG'
        : primary.evidence.length + primary.counterEvidence.length >= 1 ? 'MODERATE' : 'WEAK';

  const bondPositive = bondStance === 'FOR' || bondStance === 'STRONGLY_FOR';
  const dominantConclusion =
    bondPositive && (marStance === 'AGAINST' || conflictHeavy)
      ? '끌리는 힘은 분명하지만 부딪히는 자리도 함께 있는, 인연은 강하고 살림은 쉽지 않은 궁합입니다.'
      : primary.conclusion;

  return {
    discipline: 'MYUNGRI', applicable: true, dataReliability: reduced ? 'REDUCED' : 'EXACT',
    ...(reduced ? { applicabilityReason: '두 분 중 한 명 이상 출생시간이 확정되지 않아 정밀도가 제한됩니다.' } : {}),
    questionDomain: input.questionDomain, temporalScope: 'NATAL',
    stance: primary.stance, dominantConclusion,
    dominantFactor: dayCombo ? '일간 천간합' : dayClash ? '일간 천간충' : daySeatStrain ? '일지 충·형·해' : `종합 ${assessment.overallLabel}`,
    directEvidence: subs.flatMap((s) => s.evidence),
    counterEvidence: subs.flatMap((s) => s.counterEvidence),
    internalContradictions: bondPositive && conflictHeavy ? ['끌리는 힘과 부딪히는 자리가 함께 있습니다.'] : [],
    timingSignals: [],
    domainSubJudgments: subs,
    confidence: reduced ? 'MEDIUM' : evidenceStrength === 'STRONG' ? 'HIGH' : 'MEDIUM',
    questionDirectness: 'DIRECT',
    evidenceStrength,
    factGroupsUsed: ['일주 궁합(일간·일지)', '교차 합충형파해', '상호 십신', '오행 보완'],
  };
}

/**
 * 자미 pairwise judgment — reads 부처궁 (marriage), 재백궁 (earning) and 전택궁 (keeping) of BOTH charts, so the
 * pair verdict carries a real money axis instead of a hard-coded RELATION_STABILITY label.
 */
export function judgePairZiwei(input: {
  question: string;
  questionDomain: JudgmentDomain;
  selfChart: ZiweiChart | null;
  targetChart: ZiweiChart | null;
  selfLabel?: string;
  targetLabel?: string;
}): DivinationJudgment {
  const people = [
    { chart: input.selfChart, label: input.selfLabel ?? '본인' },
    { chart: input.targetChart, label: input.targetLabel ?? '상대' },
  ].filter((p): p is { chart: ZiweiChart; label: string } => p.chart !== null);

  if (people.length === 0) {
    return {
      discipline: 'ZIWEI', applicable: false,
      applicabilityReason: '두 분의 출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.',
      dataReliability: 'UNUSABLE', questionDomain: input.questionDomain, temporalScope: 'NATAL',
      stance: 'NOT_APPLICABLE', dominantConclusion: '자미두수로는 이 궁합을 볼 수 없습니다.',
      dominantFactor: '명반 없음', directEvidence: [], counterEvidence: [], internalContradictions: [],
      timingSignals: [], domainSubJudgments: [], confidence: 'LOW', questionDirectness: 'GENERAL',
      evidenceStrength: 'NONE', factGroupsUsed: [],
    };
  }

  const axisFrom = (palaceName: string, domain: JudgmentDomain, giMeaning: string, okMeaning: string) => {
    const evidence: JudgmentEvidence[] = [];
    const counter: JudgmentEvidence[] = [];
    for (const p of people) {
      const palace = p.chart.palaces.find((x) => x.name.includes(palaceName));
      if (!palace) continue;
      const landed = p.chart.transformations.filter((t) => palace.name.includes(t.palaceName) || t.palaceName.includes(palace.name));
      for (const t of landed) {
        const kind = sihuaKind(t.transformation);
        if (kind === null) continue;
        const item = ev(`${p.label} ${palaceName}궁에 ${t.star} 화${t.transformation}`, kind === 'GI' ? giMeaning : okMeaning, domain);
        if (kind === 'GI') counter.push(item);
        else evidence.push(item);
      }
    }
    const stance: Stance = counter.length > 0 ? 'AGAINST' : evidence.length > 0 ? 'FOR' : NO_SIGNAL;
    return { evidence, counter, stance };
  };

  const marriage = axisFrom('부처', 'RELATION_STABILITY', '배우자 자리가 얽혀, 같이 사는 과정의 난도가 올라갑니다.', '배우자 자리에 힘이 실려 관계를 끌고 갈 동력이 있습니다.');
  const earning = axisFrom('재백', 'MONEY_INFLOW', '버는 길목이 매끄럽지 않습니다.', '버는 자리는 열려 있습니다.');
  const keeping = axisFrom('전택', 'MONEY_RETENTION', '쌓아 두는 자리가 새는 구조라, 가계에 구멍이 생기기 쉽습니다.', '쌓아 두는 자리는 크게 새지 않습니다.');

  const subs: DomainSubJudgment[] = [
    sub('RELATION_STABILITY', marriage.stance,
      marriage.counter.length ? '결혼생활의 난도는 높게 봅니다.' : marriage.evidence.length ? '관계를 끌고 갈 동력이 있습니다.' : '배우자 자리에 두드러진 신호는 없습니다.',
      marriage.evidence, marriage.counter, false),
    sub('MONEY_INFLOW', earning.stance,
      earning.counter.length ? '버는 쪽이 매끄럽지 않습니다.' : earning.evidence.length ? '버는 자리는 열려 있습니다.' : '버는 쪽에 두드러진 신호는 없습니다.',
      earning.evidence, earning.counter, false),
    sub('MONEY_RETENTION', keeping.stance,
      keeping.counter.length ? '모아 두는 쪽이 샙니다.' : keeping.evidence.length ? '모아 두는 쪽은 무난합니다.' : '모아 두는 쪽에 두드러진 신호는 없습니다.',
      keeping.evidence, keeping.counter, false),
  ];

  const primary = subs.find((s) => s.domain === input.questionDomain) ?? subs[0];
  const evidenceStrength: EvidenceStrength =
    primary.stance === NO_SIGNAL ? 'NONE'
      : primary.evidence.length + primary.counterEvidence.length >= 3 ? 'STRONG'
        : primary.evidence.length + primary.counterEvidence.length >= 1 ? 'MODERATE' : 'WEAK';

  return {
    discipline: 'ZIWEI', applicable: true, dataReliability: 'EXACT',
    questionDomain: input.questionDomain, temporalScope: 'NATAL',
    stance: primary.stance, dominantConclusion: primary.conclusion,
    dominantFactor: primary.counterEvidence[0]?.fact ?? primary.evidence[0]?.fact ?? '해당 궁에 사화 없음',
    directEvidence: subs.flatMap((s) => s.evidence),
    counterEvidence: subs.flatMap((s) => s.counterEvidence),
    internalContradictions: [], timingSignals: [], domainSubJudgments: subs,
    confidence: evidenceStrength === 'STRONG' ? 'HIGH' : evidenceStrength === 'NONE' ? 'LOW' : 'MEDIUM',
    questionDirectness: 'DIRECT',
    evidenceStrength,
    factGroupsUsed: ['부처궁', '재백궁', '전택궁', '사화(두 명반)'],
  };
}
