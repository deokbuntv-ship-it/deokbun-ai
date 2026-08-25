// DIVINATION_ENGINE_V1 — MYUNGRI (명리) INDEPENDENT JUDGE (§5).
//
// Reads ONLY facts the frozen engine already computed (four pillars / ten gods / 합충형파해 relations /
// month command / active 대운 / 세운 / 월운) and produces ONE decisive DivinationJudgment. It runs WITHOUT
// seeing Ziwei or Qimen — that isolation is what makes later cross-discipline agreement meaningful.
//
// IT INVENTS NO THEORY. Two canonical, already-shipped rule sets are COMPOSED:
//   1. 십신 → life-domain, the SAME family mapping the shipped monthly plan uses
//      (재성=재물, 관성=직업/자리, 식상=활동/표현, 비겁=경쟁/동료, 인성=지원/문서).
//   2. 합충형파해 → harmony/friction → tier, via the FROZEN polarity kernel (derivePolarity).
// Nothing here activates deferred theory: no 신강/신약, 용신, 희신, 기신, 격국, 종격, 12운성, 12신살, and no
// element weighting. Where a ten-god's own canonical identity carries the meaning (겁재 = ROB_WEALTH →
// retention pressure) that identity is used as-is; it is not a new rule.
import { derivePolarity, type PolarityTier } from '@/features/polarity/polarityKernel';
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';

import {
  type DataReliability,
  type DivinationJudgment,
  type DomainSubJudgment,
  type JudgmentDomain,
  type JudgmentEvidence,
  type QuestionDirectness,
  type Stance,
  type TemporalScope,
} from './contracts';

// ── 십신 semantics (canonical identities, mirrored from the shipped monthly-plan mapping) ─────────────
export type TenGodFamily = 'WEALTH' | 'OFFICER' | 'OUTPUT' | 'PEER' | 'RESOURCE';

export function tenGodFamily(tg: TenGod): TenGodFamily {
  switch (tg) {
    case 'DIRECT_WEALTH':
    case 'INDIRECT_WEALTH':
      return 'WEALTH'; // 재성
    case 'DIRECT_OFFICER':
    case 'SEVEN_KILLINGS':
      return 'OFFICER'; // 관성
    case 'EATING_GOD':
    case 'HURTING_OFFICER':
      return 'OUTPUT'; // 식상
    case 'PEER':
    case 'ROB_WEALTH':
      return 'PEER'; // 비겁
    default:
      return 'RESOURCE'; // 인성
  }
}

/** The life-domain a ten-god activates — same families the shipped monthly plan routes by. */
export function tenGodJudgmentDomain(tg: TenGod): JudgmentDomain {
  switch (tenGodFamily(tg)) {
    case 'WEALTH':
      return 'MONEY_INFLOW';
    case 'OFFICER':
      return 'CAREER';
    case 'OUTPUT':
      return 'OPPORTUNITY'; // 식상 = 활동·표현·생산 → the chance to make something happen
    case 'PEER':
      return 'INFLUENCE'; // 비겁 = 동료·경쟁 → who shares/competes for the same ground
    case 'RESOURCE':
      return 'GENERAL'; // 인성 = 지원·문서·배움 → supportive background rather than one outcome axis
  }
}

const FAMILY_LABEL: Record<TenGodFamily, string> = {
  WEALTH: '재물의 기운',
  OFFICER: '자리·책임의 기운',
  OUTPUT: '활동·표현의 기운',
  PEER: '경쟁·동료의 기운',
  RESOURCE: '지원·배움의 기운',
};

// ── inputs ─────────────────────────────────────────────────────────────────────────────────────────
export type TemporalLayerFacts = {
  /** 대운/세운/월운 pillar ten-gods (stem drives the layer's dominant theme). */
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  relationsToNatal: RelationsToNatal;
  /** Year/month label for evidence text (e.g. 2026). Null for 대운. */
  targetYear?: number | null;
};

export type MyungriJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  /** 시주 확정 여부 — an unknown hour reduces what the chart can support. */
  hourKnown: boolean;
  /** 원국 내부 관계 (natal baseline friction/harmony). */
  natalRelations: RelationsToNatal | null;
  /** 득령/실령 — the day master's seasonal footing (canonical month-command fact). */
  monthCommandInCommand: boolean | null;
  activeDaewoon: TemporalLayerFacts | null;
  sewoon: TemporalLayerFacts | null;
  wolwoon: TemporalLayerFacts | null;
  /** Does the question ask about acting NOW / this period (vs a structural "what am I like")? */
  asksTiming: boolean;
};

// ── helpers ────────────────────────────────────────────────────────────────────────────────────────
const TIER_MEANING: Record<PolarityTier, string> = {
  FAVORABLE: '흐름이 받쳐주는',
  STEADY: '큰 흔들림이 없는',
  DYNAMIC: '변화가 잦은',
  CAUTION: '마찰이 걸리는',
};

/** How directly a layer speaks to the asked domain. */
function directnessFor(layerDomain: JudgmentDomain, asked: JudgmentDomain): QuestionDirectness {
  if (layerDomain === asked) return 'DIRECT';
  if (asked === 'GENERAL' || layerDomain === 'GENERAL') return 'GENERAL';
  // money-inflow evidence is adjacent to a retention question, career to movement, etc.
  const adjacency: Record<string, JudgmentDomain[]> = {
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

const SCOPE_LABEL: Record<TemporalScope, string> = {
  NATAL: '타고난 바탕',
  DAEWOON: '지금의 큰 흐름',
  SEWOON: '올해 흐름',
  WOLWOON: '이 시기 흐름',
  PRESENT_MOMENT: '지금 시점',
  UNSCOPED: '전반 흐름',
};

type LayerReading = {
  scope: TemporalScope;
  tier: PolarityTier;
  harmony: number;
  friction: number;
  domain: JudgmentDomain;
  family: TenGodFamily;
  directness: QuestionDirectness;
  evidence: JudgmentEvidence;
  /** true when 겁재(ROB_WEALTH) sits in this layer — canonical retention pressure. */
  robWealth: boolean;
};

function readLayer(
  facts: TemporalLayerFacts,
  scope: TemporalScope,
  asked: JudgmentDomain,
): LayerReading {
  const polarity = derivePolarity(facts.relationsToNatal);
  const family = tenGodFamily(facts.stemTenGod);
  const domain = tenGodJudgmentDomain(facts.stemTenGod);
  const directness = directnessFor(domain, asked);
  const robWealth = facts.stemTenGod === 'ROB_WEALTH' || facts.branchTenGod === 'ROB_WEALTH';
  const where = SCOPE_LABEL[scope];
  return {
    scope,
    tier: polarity.tier,
    harmony: polarity.evidence.harmony,
    friction: polarity.evidence.friction,
    domain,
    family,
    directness,
    robWealth,
    evidence: {
      fact: `${where}: ${FAMILY_LABEL[family]} · 원국과 ${TIER_MEANING[polarity.tier]} 관계`,
      meaning: `${where}에서는 ${FAMILY_LABEL[family]}이 두드러지고, 원국과는 ${TIER_MEANING[polarity.tier]} 흐름입니다.`,
      domain,
      temporalScope: scope,
      directness,
    },
  };
}

const POSITIVE_TIERS: PolarityTier[] = ['FAVORABLE', 'STEADY'];

/** Rank layers so the most question-relevant evidence — not the loudest — drives the stance (§10-B/§12). */
function layerWeight(l: LayerReading, asksTiming: boolean): number {
  const directnessScore = l.directness === 'DIRECT' ? 3 : l.directness === 'ADJACENT' ? 2 : 1;
  // A timing question is answered by the nearer layer; a structural question by the larger one.
  const scopeScore = asksTiming
    ? l.scope === 'WOLWOON' ? 3 : l.scope === 'SEWOON' ? 3 : l.scope === 'DAEWOON' ? 2 : 1
    : l.scope === 'DAEWOON' ? 3 : l.scope === 'SEWOON' ? 2 : 1;
  return directnessScore * 2 + scopeScore;
}

/**
 * Judge the question from the Myungri facts alone. DECISIVE by construction: when layers disagree it
 * resolves them by temporal scope + question directness (long-term FOR + near-term CAUTION → FOR_BUT_LATER,
 * never "반반"). INSUFFICIENT_DATA only when no layer could be computed at all.
 */
export function judgeMyungri(input: MyungriJudgeInput): DivinationJudgment {
  const asked = input.questionDomain;
  const layers: LayerReading[] = [];
  if (input.activeDaewoon) layers.push(readLayer(input.activeDaewoon, 'DAEWOON', asked));
  if (input.sewoon) layers.push(readLayer(input.sewoon, 'SEWOON', asked));
  if (input.wolwoon) layers.push(readLayer(input.wolwoon, 'WOLWOON', asked));

  const reliability: DataReliability = input.hourKnown ? 'EXACT' : 'REDUCED';

  if (layers.length === 0) {
    return {
      discipline: 'MYUNGRI',
      applicable: false,
      applicabilityReason: '이 질문에 쓸 수 있는 시기 흐름(대운·세운)이 계산되지 않았습니다.',
      dataReliability: input.hourKnown ? 'MINIMAL' : 'UNUSABLE',
      questionDomain: asked,
      temporalScope: 'UNSCOPED',
      stance: 'INSUFFICIENT_DATA',
      dominantConclusion: '명리로는 이 질문에 답할 근거가 아직 부족합니다.',
      dominantFactor: '계산 가능한 시기 흐름 없음',
      directEvidence: [],
      counterEvidence: [],
      internalContradictions: [],
      timingSignals: [],
      domainSubJudgments: [],
      confidence: 'LOW',
      questionDirectness: 'GENERAL',
    };
  }

  // The layer that best answers THIS question drives the stance.
  const ranked = [...layers].sort((a, b) => layerWeight(b, input.asksTiming) - layerWeight(a, input.asksTiming));
  const primary = ranked[0];
  const supporting = layers.filter((l) => POSITIVE_TIERS.includes(l.tier));
  const opposing = layers.filter((l) => !POSITIVE_TIERS.includes(l.tier));

  const near = layers.find((l) => l.scope === 'WOLWOON') ?? layers.find((l) => l.scope === 'SEWOON') ?? null;
  const large = layers.find((l) => l.scope === 'DAEWOON') ?? null;

  // ── stance resolution (never "mixed") ────────────────────────────────────────────────────────────
  let stance: Stance;
  let dominantConclusion: string;
  const internalContradictions: string[] = [];

  const primaryPositive = POSITIVE_TIERS.includes(primary.tier);
  const largePositive = large ? POSITIVE_TIERS.includes(large.tier) : null;
  const nearPositive = near ? POSITIVE_TIERS.includes(near.tier) : null;

  if (large && near && largePositive !== nearPositive) {
    // §10-D/§10-H — direction and timing disagree: resolve into a TIMED verdict, not a hedge.
    internalContradictions.push(
      `${SCOPE_LABEL.DAEWOON}과 ${SCOPE_LABEL[near.scope]}가 서로 다른 방향을 가리킵니다.`,
    );
    if (largePositive) {
      stance = 'FOR_BUT_LATER';
      dominantConclusion = '방향 자체는 맞지만, 지금 시점보다 흐름이 풀린 뒤에 움직이는 쪽이 낫습니다.';
    } else {
      stance = 'AGAINST_FOR_NOW';
      dominantConclusion = '당장의 흐름은 열려 있지만 큰 흐름이 받쳐주지 않아, 크게 벌이는 선택은 미루는 쪽으로 봅니다.';
    }
  } else if (primaryPositive) {
    const strong = primary.directness === 'DIRECT' && primary.tier === 'FAVORABLE' && opposing.length === 0;
    stance = strong ? 'STRONGLY_FOR' : primary.tier === 'FAVORABLE' ? 'FOR' : 'CONDITIONAL_FOR';
    dominantConclusion = strong
      ? `${SCOPE_LABEL[primary.scope]}이 ${FAMILY_LABEL[primary.family]}을 분명하게 받쳐줍니다. 하는 쪽으로 봅니다.`
      : `${SCOPE_LABEL[primary.scope]}은 ${FAMILY_LABEL[primary.family]} 쪽으로 열려 있습니다. 조건을 갖추면 진행해도 좋은 흐름입니다.`;
  } else {
    const strong = primary.directness === 'DIRECT' && primary.tier === 'CAUTION' && supporting.length === 0;
    stance = strong ? 'STRONGLY_AGAINST' : primary.tier === 'CAUTION' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
    dominantConclusion = strong
      ? `${SCOPE_LABEL[primary.scope]}에서 ${FAMILY_LABEL[primary.family]}에 마찰이 분명합니다. 지금은 하지 않는 쪽으로 봅니다.`
      : `${SCOPE_LABEL[primary.scope]}이 흔들리는 구간이라, 범위를 좁혀 움직이는 쪽으로 봅니다.`;
  }

  // ── domain sub-judgments (opportunity vs outcome, inflow vs retention) ───────────────────────────
  const subs: DomainSubJudgment[] = [];
  const wealthLayer = layers.find((l) => l.family === 'WEALTH');
  const retentionRisk = layers.some((l) => l.robWealth) || layers.some((l) => l.family === 'PEER' && !POSITIVE_TIERS.includes(l.tier));
  if (wealthLayer) {
    subs.push({
      domain: 'MONEY_INFLOW',
      stance: POSITIVE_TIERS.includes(wealthLayer.tier) ? 'FOR' : 'CONDITIONAL_FOR',
      conclusion: '재물이 움직이는 자리는 열려 있습니다.',
    });
    // §10-G — money entering and money staying are judged separately, never equated.
    subs.push({
      domain: 'MONEY_RETENTION',
      stance: retentionRisk ? 'AGAINST' : 'CONDITIONAL_FOR',
      conclusion: retentionRisk
        ? '다만 들어온 돈이 남는 구조는 약합니다. 버는 것과 남기는 것을 따로 보셔야 합니다.'
        : '들어온 것을 지키는 쪽도 크게 새지 않습니다.',
    });
  }
  const outputLayer = layers.find((l) => l.family === 'OUTPUT');
  if (outputLayer) {
    // §10-E — an opportunity appearing is NOT the same as taking it being good.
    subs.push({
      domain: 'OPPORTUNITY',
      stance: POSITIVE_TIERS.includes(outputLayer.tier) ? 'FOR' : 'CONDITIONAL_FOR',
      conclusion: '벌이거나 새로 시작할 자리 자체는 생깁니다.',
    });
    subs.push({
      domain: 'OUTCOME',
      stance: opposing.length > supporting.length ? 'CONDITIONAL_AGAINST' : 'CONDITIONAL_FOR',
      conclusion:
        opposing.length > supporting.length
          ? '기회가 생기는 것과 그것을 잡아서 남는 것은 다릅니다. 잡는 선택은 신중히 봅니다.'
          : '잡았을 때 남는 쪽도 무리는 없습니다.',
    });
  }
  const officerLayer = layers.find((l) => l.family === 'OFFICER');
  if (officerLayer) {
    subs.push({
      domain: 'CAREER',
      stance: POSITIVE_TIERS.includes(officerLayer.tier) ? 'FOR' : 'CONDITIONAL_AGAINST',
      conclusion: POSITIVE_TIERS.includes(officerLayer.tier)
        ? '자리와 책임이 안정적으로 붙는 흐름입니다.'
        : '자리 문제로 부딪히기 쉬운 구간입니다.',
    });
  }

  const timingSignals = near ? [near.evidence] : [];
  // 득령/실령 is a canonical single-factor month-command FACT (never a 신강/신약 verdict). It is surfaced as
  // natal-baseline evidence so the reading can say what the person's footing is, without classifying strength.
  const natalEvidence: JudgmentEvidence[] =
    input.monthCommandInCommand === null
      ? []
      : [{
          fact: input.monthCommandInCommand ? '원국: 일간이 월령을 얻음(득령)' : '원국: 일간이 월령을 얻지 못함(실령)',
          meaning: input.monthCommandInCommand
            ? '타고난 바탕이 계절의 기운을 등에 업고 있습니다.'
            : '타고난 바탕이 계절의 기운을 등에 업지는 못했습니다.',
          domain: 'GENERAL',
          temporalScope: 'NATAL',
          directness: 'GENERAL',
        }];

  return {
    discipline: 'MYUNGRI',
    applicable: true,
    dataReliability: reliability,
    ...(input.hourKnown ? {} : { applicabilityReason: '출생시간이 확정되지 않아 시(時)에 기대는 해석은 제한됩니다.' }),
    questionDomain: asked,
    temporalScope: primary.scope,
    stance,
    dominantConclusion,
    dominantFactor: primary.evidence.fact,
    directEvidence: [...supporting.map((l) => l.evidence), ...natalEvidence],
    counterEvidence: opposing.map((l) => l.evidence),
    internalContradictions,
    timingSignals,
    domainSubJudgments: subs,
    confidence:
      primary.directness === 'DIRECT' && reliability === 'EXACT'
        ? 'HIGH'
        : primary.directness === 'GENERAL' || reliability !== 'EXACT'
          ? 'LOW'
          : 'MEDIUM',
    questionDirectness: primary.directness,
  };
}
