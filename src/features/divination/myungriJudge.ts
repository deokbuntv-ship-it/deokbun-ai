// DIVINATION_ENGINE_V1 — MYUNGRI (명리) INDEPENDENT JUDGE. REBUILT for depth (audit: MYUNGRI_DEPTH = LOW).
//
// WHAT THE AUDIT FOUND, AND WHAT CHANGED:
//   · natal chart entirely discarded (production even passed `natalRelations: null`) → now the natal baseline
//     (십신 by position, 원국 관계, 월령, 통근/투간) is the reference plane every luck layer is judged against.
//   · relations flattened to two counts → now each relation keeps its KIND and the natal POSITION it struck,
//     and position determines WHICH life axis is disturbed (년=뿌리, 월=사회·직업, 일=배우자·자기, 시=결과).
//   · one broad domain per discipline → now multiple real sub-axes are emitted, which is what lets the cross
//     judge decompose on the REAL path instead of only in fixtures.
//   · a layer with ZERO relations counted as positive (STEADY) → now silence is silence: no directional vote.
//
// STILL NO DEFERRED THEORY: no 신강/신약, 용신, 희신, 기신, 격국, 종격, no element weighting. Reading how many
// positions carry 재성, or which pillar a 충 lands on, is reading the engine's own output — not a strength verdict.
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';

import {
  NO_SIGNAL,
  type DataReliability,
  type DivinationJudgment,
  type DomainSubJudgment,
  type EvidenceStrength,
  type JudgmentDomain,
  type JudgmentEvidence,
  type QuestionDirectness,
  type Stance,
  type TemporalScope,
} from './contracts';
import { analyzeLayer, axisPressure, type LayerAnalysis } from './myungriLayer';
import { natalSupportForDomain, readNatalBaseline, type NatalStructureInput } from './myungriNatal';

// ── 십신 semantics (canonical identities, mirrored from the shipped monthly/today mapping) ────────────
export type TenGodFamily = 'WEALTH' | 'OFFICER' | 'OUTPUT' | 'PEER' | 'RESOURCE';

export function tenGodFamily(tg: TenGod): TenGodFamily {
  switch (tg) {
    case 'DIRECT_WEALTH':
    case 'INDIRECT_WEALTH':
      return 'WEALTH';
    case 'DIRECT_OFFICER':
    case 'SEVEN_KILLINGS':
      return 'OFFICER';
    case 'EATING_GOD':
    case 'HURTING_OFFICER':
      return 'OUTPUT';
    case 'PEER':
    case 'ROB_WEALTH':
      return 'PEER';
    default:
      return 'RESOURCE';
  }
}

export function tenGodJudgmentDomain(tg: TenGod): JudgmentDomain {
  switch (tenGodFamily(tg)) {
    case 'WEALTH': return 'MONEY_INFLOW';
    case 'OFFICER': return 'CAREER';
    case 'OUTPUT': return 'OPPORTUNITY';
    case 'PEER': return 'INFLUENCE';
    case 'RESOURCE': return 'GENERAL';
  }
}

const FAMILY_LABEL: Record<TenGodFamily, string> = {
  WEALTH: '재물의 기운', OFFICER: '자리·책임의 기운', OUTPUT: '활동·표현의 기운',
  PEER: '경쟁·동료의 기운', RESOURCE: '지원·배움의 기운',
};
const SCOPE_LABEL: Record<TemporalScope, string> = {
  NATAL: '타고난 바탕', DAEWOON: '지금의 큰 흐름', SEWOON: '올해 흐름',
  WOLWOON: '이 시기 흐름', PRESENT_MOMENT: '지금 시점', UNSCOPED: '전반 흐름',
};

export type TemporalLayerFacts = {
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  relationsToNatal: RelationsToNatal;
  targetYear?: number | null;
};

export type MyungriJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  hourKnown: boolean;
  /** REBUILD: the full natal structure. Previously null in production — the audit's headline finding. */
  natal: NatalStructureInput | null;
  activeDaewoon: TemporalLayerFacts | null;
  sewoon: TemporalLayerFacts | null;
  wolwoon: TemporalLayerFacts | null;
  asksTiming: boolean;
};

function directnessFor(layerDomain: JudgmentDomain, asked: JudgmentDomain): QuestionDirectness {
  if (layerDomain === asked) return 'DIRECT';
  if (asked === 'GENERAL' || layerDomain === 'GENERAL') return 'GENERAL';
  const adjacency: Partial<Record<JudgmentDomain, JudgmentDomain[]>> = {
    MONEY_INFLOW: ['MONEY_RETENTION', 'OPPORTUNITY', 'DECISION'],
    MONEY_RETENTION: ['MONEY_INFLOW', 'INFLUENCE'],
    CAREER: ['MOVEMENT', 'OPPORTUNITY', 'DECISION'],
    MOVEMENT: ['CAREER', 'TIMING', 'DECISION'],
    OPPORTUNITY: ['OUTCOME', 'DECISION', 'CAREER', 'MONEY_INFLOW'],
    OUTCOME: ['OPPORTUNITY', 'DECISION'],
    RELATION_BOND: ['RELATION_STABILITY', 'CONFLICT', 'INFLUENCE'],
    RELATION_STABILITY: ['RELATION_BOND', 'CONFLICT'],
    CONFLICT: ['RELATION_STABILITY', 'INFLUENCE'],
    INFLUENCE: ['RELATION_BOND', 'CONFLICT', 'MONEY_RETENTION'],
    TIMING: ['DECISION', 'MOVEMENT'],
    DECISION: ['OUTCOME', 'TIMING', 'OPPORTUNITY'],
  };
  return (adjacency[asked] ?? []).includes(layerDomain) ? 'ADJACENT' : 'GENERAL';
}

function unavailable(asked: JudgmentDomain, reason: string, reliability: DataReliability): DivinationJudgment {
  return {
    discipline: 'MYUNGRI', applicable: false, applicabilityReason: reason, dataReliability: reliability,
    questionDomain: asked, temporalScope: 'UNSCOPED', stance: 'INSUFFICIENT_DATA',
    dominantConclusion: '명리로는 이 질문에 답할 근거가 아직 부족합니다.', dominantFactor: '계산 가능한 시기 흐름 없음',
    directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
    domainSubJudgments: [], confidence: 'LOW', questionDirectness: 'GENERAL',
    evidenceStrength: 'NONE', factGroupsUsed: [],
  };
}

/**
 * Judge ONE axis from the natal baseline + every temporal layer that touches it. This is the unit of depth:
 * the same 세운 lands differently depending on which natal position it strikes and whether the chart is
 * natively built for that axis.
 */
function judgeAxis(
  axis: JudgmentDomain,
  layers: LayerAnalysis[],
  baseline: ReturnType<typeof readNatalBaseline> | null,
  asked: JudgmentDomain,
  reliability: DataReliability,
): DomainSubJudgment | null {
  const pressures = layers.map((l) => ({ layer: l, p: axisPressure(l, axis) }));
  const touched = pressures.filter((x) => x.p.friction > 0 || x.p.harmony > 0);
  const natal = baseline ? natalSupportForDomain(baseline, axis) : { support: 'UNKNOWN' as const, note: '' };

  // Nothing in the chart or the luck cycles speaks to this axis → emit nothing (never a filler positive).
  if (touched.length === 0 && natal.support === 'UNKNOWN') return null;

  const friction = pressures.reduce((n, x) => n + x.p.friction, 0);
  const harmony = pressures.reduce((n, x) => n + x.p.harmony, 0);
  const heavy = pressures.some((x) => x.p.heavyHit);
  const evidence = pressures.flatMap((x) => x.p.evidence);
  const counterEvidence = pressures.flatMap((x) => x.p.counterEvidence);
  const nearest = touched.find((x) => x.layer.scope === 'WOLWOON') ?? touched.find((x) => x.layer.scope === 'SEWOON') ?? touched[0];

  const natalEvidence: JudgmentEvidence[] = natal.note
    ? [{ fact: `원국 바탕(${axis})`, meaning: natal.note, domain: axis, temporalScope: 'NATAL', directness: 'ADJACENT' }]
    : [];

  let stance: Stance;
  let conclusion: string;
  if (friction === 0 && harmony === 0) {
    // The natal chart has something to say about this axis, but no luck cycle is activating it.
    stance = natal.support === 'ABSENT' ? 'CONDITIONAL_AGAINST' : NO_SIGNAL;
    conclusion = natal.support === 'ABSENT'
      ? `${natal.note} 지금 이 부분을 크게 벌일 자리는 아닙니다.`
      : '지금 이 부분을 흔드는 흐름은 따로 없습니다.';
  } else if (friction > harmony) {
    stance = heavy && natal.support !== 'STRONG' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
    conclusion = heavy
      ? '이 부분은 직접 흔들리는 자리가 있어, 그대로 밀고 가기 어렵습니다.'
      : '이 부분은 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.';
  } else if (harmony > friction) {
    stance = natal.support === 'STRONG' ? 'FOR' : 'CONDITIONAL_FOR';
    conclusion = natal.support === 'STRONG'
      ? `${natal.note} 흐름도 맞물려 열리는 자리입니다.`
      : '이 부분은 흐름이 맞물려 열리는 편입니다.';
  } else {
    // equal push and pull on the SAME axis — a real internal tension, not a coin flip
    stance = 'CONDITIONAL_FOR';
    conclusion = '이 부분은 열리는 힘과 부딪히는 힘이 함께 있어, 조건을 정리하고 가야 합니다.';
  }

  return {
    domain: axis,
    stance,
    conclusion,
    temporalScope: nearest?.layer.scope ?? 'NATAL',
    directness: directnessFor(axis, asked),
    reliability,
    evidence: [...evidence, ...natalEvidence],
    counterEvidence,
  };
}

/** Which axes are worth judging for this question (the asked one + the ones its answer genuinely depends on). */
function axesFor(asked: JudgmentDomain): JudgmentDomain[] {
  switch (asked) {
    case 'MONEY_INFLOW':
    case 'MONEY_RETENTION':
      return ['MONEY_INFLOW', 'MONEY_RETENTION', 'OPPORTUNITY', 'CAREER'];
    case 'OPPORTUNITY':
    case 'DECISION':
      return ['OPPORTUNITY', 'OUTCOME', 'MONEY_INFLOW', 'CAREER'];
    case 'CAREER':
    case 'MOVEMENT':
      return ['CAREER', 'OUTCOME', 'OPPORTUNITY', 'MONEY_INFLOW'];
    case 'RELATION_BOND':
    case 'RELATION_STABILITY':
    case 'CONFLICT':
      return ['RELATION_STABILITY', 'RELATION_BOND', 'CONFLICT', 'INFLUENCE'];
    default:
      return ['GENERAL', 'CAREER', 'RELATION_STABILITY', 'MONEY_INFLOW'];
  }
}

export function judgeMyungri(input: MyungriJudgeInput): DivinationJudgment {
  const asked = input.questionDomain;
  const layers: LayerAnalysis[] = [];
  if (input.activeDaewoon) layers.push(analyzeLayer('DAEWOON', input.activeDaewoon.stemTenGod, input.activeDaewoon.branchTenGod, input.activeDaewoon.relationsToNatal));
  if (input.sewoon) layers.push(analyzeLayer('SEWOON', input.sewoon.stemTenGod, input.sewoon.branchTenGod, input.sewoon.relationsToNatal));
  if (input.wolwoon) layers.push(analyzeLayer('WOLWOON', input.wolwoon.stemTenGod, input.wolwoon.branchTenGod, input.wolwoon.relationsToNatal));

  const reliability: DataReliability = input.hourKnown ? 'EXACT' : 'REDUCED';
  if (layers.length === 0 && !input.natal) {
    return unavailable(asked, '이 질문에 쓸 수 있는 시기 흐름(대운·세운)이 계산되지 않았습니다.', input.hourKnown ? 'MINIMAL' : 'UNUSABLE');
  }

  const baseline = input.natal ? readNatalBaseline(input.natal) : null;
  const factGroupsUsed: string[] = [];
  if (baseline) factGroupsUsed.push('원국 십신 배치', '원국 합충형파해', '월령', '통근·투간');
  if (layers.some((l) => l.scope === 'DAEWOON')) factGroupsUsed.push('대운');
  if (layers.some((l) => l.scope === 'SEWOON')) factGroupsUsed.push('세운');
  if (layers.some((l) => l.scope === 'WOLWOON')) factGroupsUsed.push('월운');
  if (layers.some((l) => l.hits.length > 0)) factGroupsUsed.push('원국×운 관계(종류·위치)');

  // ── per-axis sub-judgments (the real decomposition source) ───────────────────────────────────────
  const subs = axesFor(asked)
    .map((axis) => judgeAxis(axis, layers, baseline, asked, reliability))
    .filter((s): s is DomainSubJudgment => s !== null);

  // Retention gets one extra canonical signal: 겁재(ROB_WEALTH) + a floating (rootless) chart both mean
  // "what comes in does not stay". Both are the facts' own identities, not a new rule.
  const retentionSub = subs.find((s) => s.domain === 'MONEY_RETENTION');
  if (retentionSub) {
    const robbed = layers.some((l) => l.robWealth);
    const floating = baseline?.anchored === 'FLOATING';
    if (robbed || floating) {
      retentionSub.stance = 'AGAINST';
      retentionSub.conclusion = robbed
        ? '들어온 돈을 나눠 가져가는 자리가 있어, 버는 것과 남기는 것을 반드시 나눠 보셔야 합니다.'
        : '뿌리가 약해 들어온 것이 오래 머물지 않습니다.';
      retentionSub.counterEvidence = [
        ...retentionSub.counterEvidence,
        {
          fact: robbed ? '운에 겁재' : '원국 통근 약함',
          meaning: robbed ? '같은 것을 두고 나눠 갖는 기운이 함께 옵니다.' : '뿌리가 얕아 쌓이지 않습니다.',
          domain: 'MONEY_RETENTION', temporalScope: robbed ? 'SEWOON' : 'NATAL', directness: 'DIRECT',
        },
      ];
    }
  }

  // ── primary stance = the axis that answers the ASKED question ────────────────────────────────────
  const primarySub = subs.find((s) => s.domain === asked) ?? subs.find((s) => s.directness === 'DIRECT') ?? subs[0] ?? null;
  const allEvidence = subs.flatMap((s) => s.evidence);
  const allCounter = subs.flatMap((s) => s.counterEvidence);

  const directionalSubs = subs.filter((s) => s.stance !== NO_SIGNAL);
  const evidenceStrength: EvidenceStrength =
    primarySub === null || primarySub.stance === NO_SIGNAL
      ? 'NONE'
      : primarySub.evidence.length + primarySub.counterEvidence.length >= 3
        ? 'STRONG'
        : primarySub.evidence.length + primarySub.counterEvidence.length >= 1
          ? 'MODERATE'
          : 'WEAK';

  const internalContradictions: string[] = [];
  const forSubs = directionalSubs.filter((s) => s.stance.includes('FOR'));
  const againstSubs = directionalSubs.filter((s) => s.stance.includes('AGAINST'));
  if (forSubs.length > 0 && againstSubs.length > 0) {
    internalContradictions.push(
      `${forSubs.map((s) => s.domain).join('/')}는 열리고 ${againstSubs.map((s) => s.domain).join('/')}는 걸립니다.`,
    );
  }

  const stance: Stance = primarySub?.stance ?? NO_SIGNAL;
  const nearest = layers.find((l) => l.scope === 'WOLWOON') ?? layers.find((l) => l.scope === 'SEWOON') ?? layers[0] ?? null;

  return {
    discipline: 'MYUNGRI',
    applicable: true,
    dataReliability: reliability,
    ...(input.hourKnown ? {} : { applicabilityReason: '출생시간이 확정되지 않아 시(時)에 기대는 해석은 제한됩니다.' }),
    questionDomain: asked,
    temporalScope: primarySub?.temporalScope ?? 'NATAL',
    stance,
    dominantConclusion:
      primarySub?.conclusion ?? '명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.',
    dominantFactor:
      primarySub?.counterEvidence[0]?.fact ??
      primarySub?.evidence[0]?.fact ??
      (nearest ? `${SCOPE_LABEL[nearest.scope]}: ${FAMILY_LABEL[nearest.family]}` : '원국 구조'),
    directEvidence: [...allEvidence, ...(baseline?.evidence ?? [])],
    counterEvidence: allCounter,
    internalContradictions,
    timingSignals: nearest && nearest.hits.length > 0 ? [nearest.hits[0].evidence] : [],
    domainSubJudgments: subs,
    confidence:
      evidenceStrength === 'STRONG' && reliability === 'EXACT' && primarySub?.directness === 'DIRECT'
        ? 'HIGH'
        : evidenceStrength === 'NONE' || reliability !== 'EXACT'
          ? 'LOW'
          : 'MEDIUM',
    questionDirectness: primarySub?.directness ?? 'GENERAL',
    evidenceStrength,
    factGroupsUsed,
  };
}
