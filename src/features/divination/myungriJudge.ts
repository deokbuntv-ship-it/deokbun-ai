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
  evidenceAdequacy,
  type DataReliability,
  type DivinationJudgment,
  type DomainSubJudgment,
  type EvidenceStrength,
  type JudgmentDomain,
  type JudgmentEvidence,
  type QuestionDirectness,
  type QuestionIntent,
  type Stance,
  type TemporalScope,
} from './contracts';
import { analyzeLayer, axisPressure, type LayerAnalysis } from './myungriLayer';
import { natalSupportForDomain, readNatalBaseline, type NatalStructureInput } from './myungriNatal';
import {
  judgeDayMasterStrength, judgeYongshin, luckElementEffect,
  type DayMasterStrengthJudgment, type YongshinJudgment,
} from './myungriStrength';
import type { FiveElement } from '@/features/interpretation';

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
  /** CONSTITUTION V2 §14 — the element this layer brings, so 용신 can materially change its reading. */
  stemElement?: FiveElement | null;
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
  /** V4A §12 — what SHAPE of answer the question wants. Absent → OUTCOME (legacy behaviour). */
  questionIntent?: QuestionIntent;
  /** Whose chart this is, for premise attribution. */
  subject?: string;
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
  /** §14 — the 용신 reading of each layer's element; it must be able to MOVE the axis stance. */
  elementEffects: { scope: string; effect: 'FAVORABLE' | 'ADVERSE' | 'NEUTRAL'; why: string }[] = [],
): DomainSubJudgment | null {
  const pressures = layers.map((l) => ({ layer: l, p: axisPressure(l, axis) }));
  const touched = pressures.filter((x) => x.p.touched);
  const natal = baseline ? natalSupportForDomain(baseline, axis) : { support: 'UNKNOWN' as const, note: '' };

  // Nothing in the chart or the luck cycles speaks to this axis → emit nothing (never a filler positive).
  if (touched.length === 0 && natal.support === 'UNKNOWN') return null;

  const frictionKinds = [...new Set(pressures.flatMap((x) => x.p.frictionKinds))];
  const harmonyKinds = [...new Set(pressures.flatMap((x) => x.p.harmonyKinds))];
  const friction = frictionKinds.length > 0;
  const harmony = harmonyKinds.length > 0;
  const heavy = pressures.some((x) => x.p.heavyHit);
  const evidence = pressures.flatMap((x) => x.p.evidence);
  const counterEvidence = pressures.flatMap((x) => x.p.counterEvidence);
  const nearest = touched.find((x) => x.layer.scope === 'WOLWOON') ?? touched.find((x) => x.layer.scope === 'SEWOON') ?? touched[0];

  const natalEvidence: JudgmentEvidence[] = natal.note
    ? [{ fact: `원국 바탕(${axis})`, meaning: natal.note, domain: axis, temporalScope: 'NATAL', directness: 'ADJACENT' }]
    : [];

  let stance: Stance;
  let conclusion: string;
  // V3 §5 — the stance follows a NAMED structural configuration, never "which count is bigger". What decides
  // is WHICH kind of relation landed on this axis and whether the natal chart is built to absorb it: a 충 on a
  // chart with no supporting structure is a different event from the same 충 on a chart that has one.
  const structure = frictionKinds.concat(harmonyKinds).join('·');
  if (!friction && !harmony) {
    // The natal chart has something to say about this axis, but no luck cycle is activating it.
    stance = natal.support === 'ABSENT' ? 'CONDITIONAL_AGAINST' : NO_SIGNAL;
    conclusion = natal.support === 'ABSENT'
      ? `${natal.note} 지금 이 부분을 크게 벌일 자리는 아닙니다.`
      : '지금 이 부분을 흔드는 흐름은 따로 없습니다.';
  } else if (heavy) {
    // 충/형 struck this axis directly. The chart's own footing decides whether it breaks or merely bends.
    stance = natal.support === 'STRONG' ? 'CONDITIONAL_AGAINST' : 'AGAINST';
    conclusion = natal.support === 'STRONG'
      ? `${structure}으로 직접 흔들리는 자리가 있지만 바탕이 받쳐 주어, 범위를 좁히면 감당할 수 있습니다.`
      : `${structure}으로 직접 흔들리는 자리가 있고 받쳐 줄 바탕도 약해, 그대로 밀고 가기 어렵습니다.`;
  } else if (friction && !harmony) {
    // Only the lighter frictional kinds (파/해) — a snag, not a break.
    stance = 'CONDITIONAL_AGAINST';
    conclusion = `${structure}으로 부딪히는 지점이 있어 범위를 좁히는 쪽이 낫습니다.`;
  } else if (harmony && !friction) {
    stance = natal.support === 'STRONG' ? 'FOR' : 'CONDITIONAL_FOR';
    conclusion = natal.support === 'STRONG'
      ? `${natal.note} ${structure}으로 흐름도 맞물려 열리는 자리입니다.`
      : `${structure}으로 흐름이 맞물려 열리는 편입니다.`;
  } else {
    // 합 and 충/파/해 on the SAME axis — a real structural tension. It is described, not averaged away.
    stance = 'CONDITIONAL_FOR';
    conclusion = `${harmonyKinds.join('·')}으로 열리면서 ${frictionKinds.join('·')}으로 부딪히는 자리가 겹쳐, 조건을 정리하고 가야 합니다.`;
  }

  // ── §14: 용신 materially shifts the axis, it is not a decorative label ──────────────────────────
  const favorable = elementEffects.filter((e) => e.effect === 'FAVORABLE');
  const adverse = elementEffects.filter((e) => e.effect === 'ADVERSE');
  const yongshinEvidence: JudgmentEvidence[] = favorable.map((e) => ({
    fact: `${e.scope} 기운이 용신에 부합`, meaning: e.why, domain: axis, temporalScope: 'SEWOON', directness: 'ADJACENT',
  }));
  const yongshinCounter: JudgmentEvidence[] = adverse.map((e) => ({
    fact: `${e.scope} 기운이 기신 쪽`, meaning: e.why, domain: axis, temporalScope: 'SEWOON', directness: 'ADJACENT',
  }));
  if (favorable.length > 0 && adverse.length === 0) {
    // a 용신 luck cycle upgrades a hedged positive and softens a mild negative
    if (stance === 'CONDITIONAL_FOR') stance = 'FOR';
    else if (stance === 'CONDITIONAL_AGAINST') stance = 'CONDITIONAL_FOR';
    else if (stance === NO_SIGNAL && natal.support !== 'ABSENT') {
      stance = 'CONDITIONAL_FOR';
      conclusion = '흐름 자체가 지금 이 사주에 필요한 기운으로 들어오고 있습니다.';
    }
  } else if (adverse.length > 0 && favorable.length === 0) {
    if (stance === 'CONDITIONAL_FOR') stance = 'CONDITIONAL_AGAINST';
    else if (stance === 'FOR') stance = 'CONDITIONAL_FOR';
    else if (stance === 'CONDITIONAL_AGAINST') stance = 'AGAINST';
  }

  return {
    domain: axis,
    stance,
    conclusion,
    temporalScope: nearest?.layer.scope ?? 'NATAL',
    directness: directnessFor(axis, asked),
    reliability,
    evidence: [...evidence, ...natalEvidence, ...yongshinEvidence],
    counterEvidence: [...counterEvidence, ...yongshinCounter],
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

  // ── CONSTITUTION V2 §8/§12 — 강약 + 용신 (structural, C-class, review-pending) ────────────────────
  const si = input.natal?.strengthInputs ?? null;
  let strength: DayMasterStrengthJudgment | null = null;
  let yongshin: YongshinJudgment | null = null;
  if (si) {
    strength = judgeDayMasterStrength({
      dayMaster: si.dayMaster,
      dayMasterElement: si.dayMasterElement,
      seasonalPhase: input.natal?.seasonalPhase ?? null,
      inCommand: input.natal?.monthCommandInCommand ?? null,
      rootPositions: si.dayMasterRootPositions,
      peerHiddenPositions: si.peerHiddenPositions,
      visibleSupportPositions: si.visibleSupportPositions,
      visibleDrainPositions: si.visibleDrainPositions,
      supportRevealed: si.supportRevealed,
      hourKnown: input.hourKnown,
    });
    yongshin = judgeYongshin({
      strength,
      dayMasterElement: si.dayMasterElement,
      elementCounts: si.elementCounts,
      extremeSeason: si.extremeSeason,
    });
    factGroupsUsed.push('일간 강약(억부)', '용신(억부)');
  }
  /** Per-layer 용신 reading — the mechanism by which strength changes the verdict rather than decorating it. */
  const elementEffects = (): { scope: string; effect: 'FAVORABLE' | 'ADVERSE' | 'NEUTRAL'; why: string }[] => {
    if (!yongshin || !si) return [];
    const out: { scope: string; effect: 'FAVORABLE' | 'ADVERSE' | 'NEUTRAL'; why: string }[] = [];
    for (const [facts, scopeLabel] of [
      [input.activeDaewoon, '지금의 큰 흐름'],
      [input.sewoon, '올해 흐름'],
      [input.wolwoon, '이 시기 흐름'],
    ] as const) {
      const el = facts?.stemElement ?? null;
      if (!el) continue;
      const r = luckElementEffect(yongshin, si.dayMasterElement, el as FiveElement);
      if (r.effect !== 'NEUTRAL') out.push({ scope: scopeLabel, effect: r.effect, why: r.why });
    }
    return out;
  };
  const layerElementEffects = elementEffects();
  if (layers.some((l) => l.scope === 'DAEWOON')) factGroupsUsed.push('대운');
  if (layers.some((l) => l.scope === 'SEWOON')) factGroupsUsed.push('세운');
  if (layers.some((l) => l.scope === 'WOLWOON')) factGroupsUsed.push('월운');
  if (layers.some((l) => l.hits.length > 0)) factGroupsUsed.push('원국×운 관계(종류·위치)');

  // ── per-axis sub-judgments (the real decomposition source) ───────────────────────────────────────
  // The ASKED axis is always attempted first — `axesFor` lists the axes worth reading AROUND the question and
  // omitted the asked one for several domains, so the judge never even tried the axis the user asked about.
  // Where the chart genuinely offers no route to that axis, `judgeAxis` returns null and nothing is invented.
  const subs = [...new Set<JudgmentDomain>([asked, ...axesFor(asked)])]
    .map((axis) => judgeAxis(axis, layers, baseline, asked, reliability, layerElementEffects))
    .filter((s): s is DomainSubJudgment => s !== null);

  // ── RETENTION (CONSTITUTION V2 §16 — reworked; the previous rule was an automatic universal) ─────
  // The earlier build asserted "겁재 OR 무통근 → 돈이 남지 않는다" as a flat override. That is not defensible:
  // a single 겁재, or a rootless chart, does not by itself decide retention. Retention is now INFERRED from
  // the competing structure — leakage signals weighed against holding signals — and it can only tilt the axis
  // it already computed, never overwrite it with verdict authority of its own.
  const retentionSub = subs.find((s) => s.domain === 'MONEY_RETENTION');
  if (retentionSub) {
    const leakage: JudgmentEvidence[] = [];
    const holding: JudgmentEvidence[] = [];

    // Leakage: 겁재 arriving in a luck cycle — but only counts when the chart HAS wealth to contest.
    const chartHasWealth = (baseline?.familyPresence.WEALTH ?? 0) > 0;
    const robbingLayer = layers.find((l) => l.robWealth);
    if (robbingLayer && chartHasWealth) {
      leakage.push({
        fact: `${robbingLayer.scope === 'DAEWOON' ? '지금의 큰 흐름' : robbingLayer.scope === 'SEWOON' ? '올해 흐름' : '이 시기 흐름'}에 겁재`,
        meaning: '가진 몫을 두고 나눠 갖는 기운이 함께 들어옵니다.',
        domain: 'MONEY_RETENTION', temporalScope: robbingLayer.scope, directness: 'DIRECT',
      });
    }
    // Leakage: a rootless chart holds less — a CONTRIBUTING factor, not a verdict.
    if (baseline?.anchored === 'FLOATING') {
      leakage.push({
        fact: '원국 무통근', meaning: '뿌리가 얕아 들어온 것이 오래 머물기 어렵습니다.',
        domain: 'MONEY_RETENTION', temporalScope: 'NATAL', directness: 'ADJACENT',
      });
    }
    // Holding: 재성 seated in the chart, and a rooted/seasonally-footed day master can actually keep what comes.
    if ((baseline?.familyPresence.WEALTH ?? 0) >= 2) {
      holding.push({
        fact: `원국 재성 ${baseline?.familyPresence.WEALTH}자리`,
        meaning: '재물이 앉을 자리가 여러 곳이라, 들어온 것이 놓일 데가 있습니다.',
        domain: 'MONEY_RETENTION', temporalScope: 'NATAL', directness: 'DIRECT',
      });
    }
    if (baseline?.anchored === 'ROOTED') {
      holding.push({
        fact: '원국 통근 튼튼', meaning: '뿌리가 단단해 한번 잡은 것을 오래 끌고 갑니다.',
        domain: 'MONEY_RETENTION', temporalScope: 'NATAL', directness: 'ADJACENT',
      });
    }
    if (baseline?.inCommand === true) {
      holding.push({
        fact: '원국 득령', meaning: '계절의 힘을 얻어 벌인 것을 감당할 수 있습니다.',
        domain: 'MONEY_RETENTION', temporalScope: 'NATAL', directness: 'ADJACENT',
      });
    }

    retentionSub.evidence = [...retentionSub.evidence, ...holding];
    retentionSub.counterEvidence = [...retentionSub.counterEvidence, ...leakage];

    // V3 §5 — not "more leakage items than holding items". The two kinds of leak are structurally different
    // and are read as such: an ACTIVE 겁재 cycle over a chart that has wealth is a contest happening now, while
    // 무통근 is a standing trait. A standing holding trait does not cancel an active contest — it only decides
    // whether the contest bends the axis or breaks it. That is the same rule the axis judgment uses.
    const contested = robbingLayer !== undefined && chartHasWealth;
    const canHold = baseline?.anchored === 'ROOTED' || baseline?.inCommand === true;
    const leaksByStructure = baseline?.anchored === 'FLOATING';
    if (contested) {
      if (retentionSub.stance !== 'AGAINST') retentionSub.stance = 'CONDITIONAL_AGAINST';
      retentionSub.conclusion = canHold
        ? '지킬 바탕은 있지만 지금은 몫을 나눠 갖는 흐름이 겹쳐, 버는 것과 남기는 것을 나눠 보셔야 합니다.'
        : '들어오는 것에 비해 지키는 쪽이 약해, 버는 것과 남기는 것을 나눠 보셔야 합니다.';
    } else if (leaksByStructure && !canHold) {
      if (retentionSub.stance === 'FOR' || retentionSub.stance === 'CONDITIONAL_FOR' || retentionSub.stance === NO_SIGNAL) {
        retentionSub.stance = 'CONDITIONAL_AGAINST';
      }
      retentionSub.conclusion = '뿌리가 얕아 들어온 것이 머무는 힘이 약합니다. 남기는 쪽을 따로 정해 두셔야 합니다.';
    } else if (holding.length > 0 && retentionSub.stance === NO_SIGNAL) {
      retentionSub.stance = 'CONDITIONAL_FOR';
      retentionSub.conclusion = '들어온 것을 지키는 구조는 크게 새지 않습니다.';
    }
  }

  // ── primary stance = the axis that answers the ASKED question ────────────────────────────────────
  const primarySub = subs.find((s) => s.domain === asked) ?? subs.find((s) => s.directness === 'DIRECT') ?? subs[0] ?? null;
  const allEvidence = subs.flatMap((s) => s.evidence);
  const allCounter = subs.flatMap((s) => s.counterEvidence);

  const directionalSubs = subs.filter((s) => s.stance !== NO_SIGNAL);
  const evidenceStrength: EvidenceStrength = primarySub === null ? 'NONE' : evidenceAdequacy(primarySub);

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
    directEvidence: [
      ...allEvidence,
      ...(baseline?.evidence ?? []),
      // §14 — the strength/용신 reading is EVIDENCE the reading can cite, not a hidden internal flag.
      ...(strength
        ? [{
            fact: `일간 강약: ${strength.label}`,
            meaning: `${strength.supportingEvidence[0]?.meaning ?? ''}${strength.ambiguities.length ? ` 다만 ${strength.ambiguities[0]}` : ''}`.trim(),
            domain: 'GENERAL' as JudgmentDomain, temporalScope: 'NATAL' as const, directness: 'ADJACENT' as const,
          }]
        : []),
      ...(yongshin?.primaryYongshin
        ? [{
            fact: `용신: ${yongshin.basis}`,
            meaning: '이 사주가 지금 가장 필요로 하는 기운입니다. 들어오는 흐름이 이 기운이면 실제로 쓸 수 있습니다.',
            domain: 'GENERAL' as JudgmentDomain, temporalScope: 'NATAL' as const, directness: 'ADJACENT' as const,
          }]
        : []),
    ],
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
