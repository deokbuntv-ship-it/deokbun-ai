// DIVINATION_ENGINE_V1 — ZIWEI (자미두수) INDEPENDENT JUDGE (§6).
//
// AUDIT FINDING THIS FIXES. The Ziwei engine computes a rich natal chart — 12 named palaces, 主星 per palace,
// and 四化 with the palace each lands in — but the evidence adapter FLATTENS it to ~4 prompt lines and sets no
// timing anchors, so nothing downstream could ever use it. Ziwei therefore contributed ZERO to the verdict
// while still being advertised to the user (§24's forbidden "compute it, then ignore it"). This judge reads
// the CHART directly, before flattening.
//
// INTERPRETATION RULES USED (both are core, textbook 자미두수 — NOT invented for this sprint, but they ARE new
// to this repository, so they are declared here as explicit, reviewable tables rather than hidden in code):
//   R1. 궁위(palace) → 질문 영역. 재백=재물, 관록=직업/자리, 부처=배우자·결혼생활, 천이=이동, 전택=집·재산 보관,
//       질액=몸/컨디션, 형제·노복=주변 사람, 복덕=마음, 명궁=본인 전반.
//   R2. 四化 in that palace is the directional signal: 화록(祿)=흐름이 열림, 화권(權)=주도권이 붙음,
//       화과(科)=이름·문서가 따름, 화기(忌)=막히거나 얽힘.
// NOTHING ELSE is inferred. Star names are reported as computed; no brightness is used (the engine emits
// numeric codes under ko-KR, not 묘왕리함, so it is deliberately ignored rather than guessed).
//
// NOT AVAILABLE AT RUNTIME (so never claimed): 유년/流年 annual layer is not computed by the engine, so this
// judge NEVER produces a year-level timing claim. 大限 is computed and used only as a background note.
import type { ZiweiChart } from '@/features/ziwei/domain/ziweiTypes';

import {
  type DataReliability,
  type DivinationJudgment,
  type DomainSubJudgment,
  type JudgmentDomain,
  type JudgmentEvidence,
  type Stance,
} from './contracts';

// ── R1: palace → domain ──────────────────────────────────────────────────────────────────────────
// Keys match the engine's ko-KR palace labels (명궁/형제/부처/자녀/재백/질액/천이/노복/관록/전택/복덕/부모).
const PALACE_DOMAIN: Record<string, JudgmentDomain> = {
  재백: 'MONEY_INFLOW',
  전택: 'MONEY_RETENTION', // 田宅 = 집·부동산·재산이 머무는 자리 → 남기는 힘
  관록: 'CAREER',
  천이: 'MOVEMENT',
  부처: 'RELATION_STABILITY', // 夫妻 = 배우자궁 → 결혼생활의 난도
  형제: 'INFLUENCE',
  노복: 'INFLUENCE',
  복덕: 'HEALTH_ENERGY',
  질액: 'HEALTH_ENERGY',
  명궁: 'GENERAL',
  부모: 'GENERAL',
  자녀: 'GENERAL',
};

/** The palace this question should be read from (R1). Null → Ziwei has no dedicated seat for it. */
export function palaceForDomain(domain: JudgmentDomain): string | null {
  switch (domain) {
    case 'MONEY_INFLOW':
      return '재백';
    case 'MONEY_RETENTION':
      return '전택';
    case 'CAREER':
    case 'OUTCOME':
      return '관록';
    case 'MOVEMENT':
      return '천이';
    case 'RELATION_STABILITY':
    case 'RELATION_BOND':
      return '부처';
    case 'CONFLICT':
    case 'INFLUENCE':
      return '형제';
    case 'HEALTH_ENERGY':
      return '질액';
    case 'OPPORTUNITY':
    case 'DECISION':
    case 'GENERAL':
      return '명궁';
    default:
      return null;
  }
}

// ── R2: 四化 → direction ─────────────────────────────────────────────────────────────────────────
export type SihuaKind = 'ROK' | 'GWON' | 'GWA' | 'GI';

/** Normalize the engine's 四化 label (ko-KR single char 록/권/과/기, or hanja) to a kind. */
export function sihuaKind(label: string | undefined): SihuaKind | null {
  if (!label) return null;
  if (label.includes('록') || label.includes('祿')) return 'ROK';
  if (label.includes('권') || label.includes('權')) return 'GWON';
  if (label.includes('과') || label.includes('科')) return 'GWA';
  if (label.includes('기') || label.includes('忌')) return 'GI';
  return null;
}

const SIHUA_MEANING: Record<SihuaKind, string> = {
  ROK: '흐름이 열리고 들어오는 힘',
  GWON: '주도권을 쥐고 밀어붙이는 힘',
  GWA: '이름·평판·문서가 따라오는 힘',
  GI: '막히거나 얽혀서 애를 먹는 힘',
};
const SIHUA_POSITIVE: Record<SihuaKind, boolean> = { ROK: true, GWON: true, GWA: true, GI: false };

export type ZiweiJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  chart: ZiweiChart | null;
  /** Engine availability — anything other than 'available' means Ziwei cannot speak. */
  availability: 'available' | 'partial' | 'missing_birth_time' | 'unsupported_case' | 'calculation_failed';
};

function notApplicable(reason: string, reliability: DataReliability, domain: JudgmentDomain): DivinationJudgment {
  return {
    discipline: 'ZIWEI',
    applicable: false,
    applicabilityReason: reason,
    dataReliability: reliability,
    questionDomain: domain,
    temporalScope: 'NATAL',
    stance: 'NOT_APPLICABLE',
    dominantConclusion: '자미두수로는 이 질문을 볼 수 없습니다.',
    dominantFactor: reason,
    directEvidence: [],
    counterEvidence: [],
    internalContradictions: [],
    timingSignals: [],
    domainSubJudgments: [],
    confidence: 'LOW',
    questionDirectness: 'GENERAL',
  };
}

/**
 * Judge the question from the Ziwei chart alone (no Myungri/Qimen input). Decisive: the 四化 landing in the
 * question's palace sets the direction; 主星 give it character. NATAL scope only — the engine computes no
 * annual layer, so this judge never asserts a year.
 */
export function judgeZiwei(input: ZiweiJudgeInput): DivinationJudgment {
  const asked = input.questionDomain;
  if (input.availability === 'missing_birth_time') {
    // 자미두수 needs an exact 시(時); without it the engine returns no chart at all (fail-closed).
    return notApplicable('출생시간이 확정되지 않아 자미두수 명반을 세울 수 없습니다.', 'UNUSABLE', asked);
  }
  if (input.availability !== 'available' || !input.chart) {
    return notApplicable('자미두수 명반이 계산되지 않았습니다.', 'UNUSABLE', asked);
  }

  const chart = input.chart;
  const targetPalaceName = palaceForDomain(asked);
  const palace =
    targetPalaceName !== null ? chart.palaces.find((p) => p.name.includes(targetPalaceName)) ?? null : null;
  const soulPalace = chart.palaces.find((p) => p.name.includes('명궁')) ?? null;
  const readPalace = palace ?? soulPalace;

  if (!readPalace) {
    return notApplicable('이 질문에 해당하는 궁을 명반에서 찾지 못했습니다.', 'MINIMAL', asked);
  }

  // 四化 landing in the read palace — the directional core (R2).
  const landed = chart.transformations.filter((t) => readPalace.name.includes(t.palaceName) || t.palaceName.includes(readPalace.name));
  const kinds = landed.map((t) => ({ t, kind: sihuaKind(t.transformation) })).filter((x): x is { t: typeof landed[number]; kind: SihuaKind } => x.kind !== null);

  const positives = kinds.filter((k) => SIHUA_POSITIVE[k.kind]);
  const negatives = kinds.filter((k) => !SIHUA_POSITIVE[k.kind]);
  const majorStarNames = readPalace.majorStars.map((s) => s.name).filter(Boolean);
  const palaceLabel = readPalace.name;
  const directness = palace ? 'DIRECT' : 'GENERAL';

  const evidenceFor: JudgmentEvidence[] = positives.map(({ t, kind }) => ({
    fact: `${palaceLabel}에 ${t.star} 화${t.transformation}`,
    meaning: `${palaceLabel}이 다루는 자리에 ${SIHUA_MEANING[kind]}이 들어옵니다.`,
    domain: PALACE_DOMAIN[targetPalaceName ?? '명궁'] ?? asked,
    temporalScope: 'NATAL',
    directness,
  }));
  const evidenceAgainst: JudgmentEvidence[] = negatives.map(({ t, kind }) => ({
    fact: `${palaceLabel}에 ${t.star} 화${t.transformation}`,
    meaning: `${palaceLabel}이 다루는 자리에 ${SIHUA_MEANING[kind]}이 걸립니다.`,
    domain: PALACE_DOMAIN[targetPalaceName ?? '명궁'] ?? asked,
    temporalScope: 'NATAL',
    directness,
  }));

  // ── stance (never "mixed"): 화기 on the asked palace outweighs a generic positive elsewhere ──────
  let stance: Stance;
  let dominantConclusion: string;
  const internalContradictions: string[] = [];

  if (negatives.length > 0 && positives.length > 0) {
    internalContradictions.push(`${palaceLabel}에 열어주는 기운과 막는 기운이 함께 들어옵니다.`);
    // 化忌 on the very palace being asked about is the decisive obstruction signal.
    stance = 'CONDITIONAL_AGAINST';
    dominantConclusion = `${palaceLabel} 자리는 힘은 실리지만 걸리는 지점이 함께 있어, 그대로 밀고 가기보다 조건을 정리하고 가야 하는 구조입니다.`;
  } else if (negatives.length > 0) {
    stance = directness === 'DIRECT' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
    dominantConclusion = `${palaceLabel}에 막히는 기운이 들어와, 이 부분은 수월하게 풀리는 구조가 아닙니다.`;
  } else if (positives.length > 0) {
    const strong = directness === 'DIRECT' && positives.length >= 2;
    stance = strong ? 'STRONGLY_FOR' : 'FOR';
    dominantConclusion = `${palaceLabel}에 힘이 실려, 이 부분은 열려 있는 구조입니다.`;
  } else {
    // No 四化 on the palace: the palace's own 主星 still describe its character, but there is no
    // directional signal — say so honestly rather than inventing one.
    stance = 'CONDITIONAL_FOR';
    dominantConclusion = majorStarNames.length
      ? `${palaceLabel}에 특별히 막히는 기운은 없고, ${majorStarNames.join('·')}의 성향대로 흘러가는 자리입니다.`
      : `${palaceLabel}에 두드러진 힘이 실리지 않아, 이 부분은 크게 흔들리지도 크게 열리지도 않는 자리입니다.`;
  }

  const subs: DomainSubJudgment[] = [];
  // §10-F/§10-G — the two decompositions Ziwei is uniquely good at, when the chart actually carries them.
  const spouse = chart.palaces.find((p) => p.name.includes('부처'));
  const property = chart.palaces.find((p) => p.name.includes('전택'));
  const wealth = chart.palaces.find((p) => p.name.includes('재백'));
  const sihuaOn = (name: string | undefined) =>
    name ? chart.transformations.filter((t) => name.includes(t.palaceName) || t.palaceName.includes(name)) : [];
  const hasGi = (name: string | undefined) => sihuaOn(name).some((t) => sihuaKind(t.transformation) === 'GI');

  if (spouse && (asked === 'RELATION_BOND' || asked === 'RELATION_STABILITY')) {
    subs.push({
      domain: 'RELATION_STABILITY',
      stance: hasGi(spouse.name) ? 'AGAINST' : 'CONDITIONAL_FOR',
      conclusion: hasGi(spouse.name)
        ? '배우자 자리에 얽히는 기운이 있어, 같이 사는 과정의 난도는 높게 봅니다.'
        : '배우자 자리 자체는 크게 얽히지 않습니다.',
    });
  }
  if (wealth && property && (asked === 'MONEY_INFLOW' || asked === 'MONEY_RETENTION')) {
    subs.push({
      domain: 'MONEY_INFLOW',
      stance: hasGi(wealth.name) ? 'CONDITIONAL_AGAINST' : 'FOR',
      conclusion: hasGi(wealth.name) ? '들어오는 길목이 매끄럽지는 않습니다.' : '돈이 들어오는 자리는 열려 있습니다.',
    });
    subs.push({
      domain: 'MONEY_RETENTION',
      stance: hasGi(property.name) ? 'AGAINST' : 'CONDITIONAL_FOR',
      conclusion: hasGi(property.name)
        ? '다만 쌓아 두는 자리가 새는 구조라, 버는 것과 남기는 것을 반드시 나눠 보셔야 합니다.'
        : '쌓아 두는 자리도 크게 새지 않습니다.',
    });
  }

  return {
    discipline: 'ZIWEI',
    applicable: true,
    dataReliability: 'EXACT', // the engine only returns a chart when the birth time was exact
    questionDomain: asked,
    temporalScope: 'NATAL',
    stance,
    dominantConclusion,
    dominantFactor:
      kinds.length > 0
        ? `${palaceLabel}에 ${kinds.map((k) => `${k.t.star} 화${k.t.transformation}`).join(', ')}`
        : `${palaceLabel}의 ${majorStarNames.join('·') || '주성 없음'}`,
    directEvidence: evidenceFor,
    counterEvidence: evidenceAgainst,
    internalContradictions,
    timingSignals: [], // 유년 미계산 — Ziwei never asserts a year here
    domainSubJudgments: subs,
    confidence: directness === 'DIRECT' && kinds.length > 0 ? 'HIGH' : kinds.length > 0 ? 'MEDIUM' : 'LOW',
    questionDirectness: directness,
  };
}
