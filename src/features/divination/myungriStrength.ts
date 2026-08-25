// CONSTITUTION V2 §8–§14 — 일간 강약(身强/身弱) + 용신(用神) STRUCTURAL JUDGMENT.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// PROVENANCE AND STANDING — READ BEFORE TRUSTING THIS MODULE
//
// The product-level prohibition on 강약/용신 was REMOVED by Judgment Constitution V2, which requires both
// as core Myungri capabilities. This module implements them FRESH. It deliberately does NOT reuse the
// previously rejected candidate (`services/natalStrength.ts`): no 18-cell lookup table, no lexicographic
// 월령>통근>구성 priority, no invented extreme caps, no same-ELEMENT rooting mislabelled as 통근.
//
// ⚠ UNRESOLVED OWNER CONFLICT (surfaced, not silently resolved): the owner's own
// `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` reaches the OPPOSITE conclusion —
//   · M-18 강약  → "CONDITIONAL(입력만·판정 제외)", §8.2: "身强/身弱 판정값을 fact로 출력 금지"
//   · M-20 용신  → "REFERENCE_ONLY", risk 매우높음, §8.6: "결정론적 fact 아님 … LLM 해석 계층에서만 사용"
// This sprint's instruction is newer and explicit, so the capability is implemented — but it is declared
// C-class (newly adopted doctrine, PENDING REVIEW), never as a frozen fact. The owner must reconcile this
// module with M-18/M-20 before it ships to paying users.
//
// ADOPTED METHOD (named, single school — §12 forbids silent school-mixing):
//   강약 = 억부(扶抑) 구조 판정 over FOUR named structural factors, each read from a frozen result:
//     F1 월령   — 일간의 계절 phase (왕/상/휴/수/사) → 득령 여부
//     F2 통근   — 일간과 同干이 지지 지장간에 있는가 (same-干 identity; NOT same-element)
//     F3 득지   — 일간과 同오행 비겁이 지지 지장간에 있는가 (labelled 득지, kept DISTINCT from 통근)
//     F4 구성   — 천간에 드러난 아군(비겁·인성) 대 타군(식상·재성·관성)
//   Classification counts SATISFIED STRUCTURAL FACTORS. There is deliberately NO hidden numeric weighting
//   (0.7/0.5/0.3-style scoring is exactly the "가짜 정밀도" the owner's analysis rejects), and when support
//   and drain are both structurally present the result stays in the 중화 band with the tension recorded.
//   용신 = 억부용신 only. 조후 is NOT mixed in; when the season is extreme it is surfaced separately as an
//   explicitly-labelled ALTERNATIVE reading, never blended into the primary.
// ─────────────────────────────────────────────────────────────────────────────────────────────────
import type { FiveElement, HeavenlyStem } from '@/features/interpretation';
import type { SajuPillarPosition } from '@/features/interpretation/saju/derived/contracts';

import type { JudgmentEvidence } from './contracts';

export const DIVINATION_STRENGTH_METHOD = 'deokbunai.divination-strength.eokbu-structural.v2' as const;
export const DIVINATION_YONGSHIN_METHOD = 'deokbunai.divination-yongshin.eokbu.v2' as const;

/** 7-level spectrum. Used because the adopted 억부 method distinguishes these bands structurally. */
export type StrengthClassification =
  | 'EXTREMELY_WEAK'   // 극신약
  | 'WEAK'             // 신약
  | 'BALANCED_WEAK'    // 중화신약
  | 'BALANCED'         // 중화
  | 'BALANCED_STRONG'  // 중화신강
  | 'STRONG'           // 신강
  | 'EXTREMELY_STRONG';// 극신강

export const STRENGTH_LABEL: Record<StrengthClassification, string> = {
  EXTREMELY_WEAK: '극신약', WEAK: '신약', BALANCED_WEAK: '중화신약', BALANCED: '중화',
  BALANCED_STRONG: '중화신강', STRONG: '신강', EXTREMELY_STRONG: '극신강',
};

export type FactorState = 'SUPPORT' | 'NEUTRAL' | 'DRAIN';

export type DayMasterStrengthJudgment = {
  classification: StrengthClassification;
  label: string;
  supportingEvidence: JudgmentEvidence[];
  weakeningEvidence: JudgmentEvidence[];
  monthCommandEffect: FactorState;
  rootingEffect: FactorState;
  transparencyEffect: FactorState;
  compositionEffect: FactorState;
  structuralModifiers: string[];
  /** Genuine tensions that the classification could NOT resolve — never hidden to look confident. */
  ambiguities: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  doctrineProvenance: string[];
};

export type StrengthInput = {
  dayMaster: HeavenlyStem;
  dayMasterElement: FiveElement;
  /** 왕/상/휴/수/사 as the frozen month-command service computed it. */
  seasonalPhase: string | null;
  inCommand: boolean | null;
  /** 일간과 同干이 지지 지장간에 있는 자리 (frozen rootingTransparency, same-干 only). */
  rootPositions: SajuPillarPosition[];
  /** 일간과 同오행 비겁이 지지 지장간에 있는 자리 (득지 — distinct from 통근). */
  peerHiddenPositions: SajuPillarPosition[];
  /** 천간에 드러난 아군(비겁·인성) 자리. */
  visibleSupportPositions: SajuPillarPosition[];
  /** 천간에 드러난 타군(식상·재성·관성) 자리. */
  visibleDrainPositions: SajuPillarPosition[];
  /** 아군 지장간이 천간으로 투출했는가 (투간). */
  supportRevealed: boolean;
  hourKnown: boolean;
};

const ev = (fact: string, meaning: string): JudgmentEvidence => ({
  fact, meaning, domain: 'GENERAL', temporalScope: 'NATAL', directness: 'ADJACENT',
});

/** 왕/상 = 得令, 휴 = 중립, 수/사 = 失令. Read from the frozen phase; no new seasonal theory. */
function monthFactor(phase: string | null, inCommand: boolean | null): { state: FactorState; note: string } {
  if (phase === null && inCommand === null) return { state: 'NEUTRAL', note: '월령 정보 없음' };
  if (phase) {
    if (phase.includes('왕') || phase.includes('WANG') || phase.includes('PROSPEROUS')) return { state: 'SUPPORT', note: '월령에서 왕(旺) — 계절이 일간을 그대로 밀어 줍니다' };
    if (phase.includes('상') || phase.includes('XIANG') || phase.includes('SUPPORTED')) return { state: 'SUPPORT', note: '월령에서 상(相) — 계절이 일간을 도와줍니다' };
    if (phase.includes('휴') || phase.includes('XIU') || phase.includes('RESTING')) return { state: 'NEUTRAL', note: '월령에서 휴(休) — 계절이 밀어주지도 깎지도 않습니다' };
    if (phase.includes('수') || phase.includes('사') || phase.includes('QIU') || phase.includes('SI') || phase.includes('TRAPPED') || phase.includes('DEAD')) {
      return { state: 'DRAIN', note: '월령에서 수·사(囚死) — 계절이 일간의 힘을 빼앗습니다' };
    }
  }
  return inCommand ? { state: 'SUPPORT', note: '득령' } : { state: 'DRAIN', note: '실령' };
}

/**
 * Judge 일간 강약 by counting SATISFIED STRUCTURAL FACTORS (억부 구조 판정). Deliberately transparent: the
 * caller can see which of the four factors held, and any unresolved tension is reported rather than hidden.
 */
export function judgeDayMasterStrength(input: StrengthInput): DayMasterStrengthJudgment {
  const supportingEvidence: JudgmentEvidence[] = [];
  const weakeningEvidence: JudgmentEvidence[] = [];
  const structuralModifiers: string[] = [];
  const ambiguities: string[] = [];

  // F1 월령
  const month = monthFactor(input.seasonalPhase, input.inCommand);
  (month.state === 'SUPPORT' ? supportingEvidence : month.state === 'DRAIN' ? weakeningEvidence : supportingEvidence)
    .push(ev(`월령: ${month.note.split(' — ')[0]}`, month.note));

  // F2 통근 (same-干) — the strongest single structural anchor in the 억부 method.
  const rooted = input.rootPositions.length > 0;
  const rootingEffect: FactorState = rooted ? 'SUPPORT' : 'DRAIN';
  if (rooted) {
    supportingEvidence.push(ev(`통근 ${input.rootPositions.length}자리`, '일간과 같은 기운이 지지에 뿌리로 박혀 있어, 흔들려도 되돌아옵니다.'));
  } else {
    weakeningEvidence.push(ev('무통근', '일간이 지지에 뿌리를 두지 못해, 겉으로 강해 보여도 오래 버티기 어렵습니다.'));
  }

  // F3 득지 (same-element 비겁 hidden) — kept DISTINCT from 통근 (the rejected build conflated them).
  const seated = input.peerHiddenPositions.length > 0;
  if (seated) {
    supportingEvidence.push(ev(`득지 ${input.peerHiddenPositions.length}자리`, '지지 속에 같은 편의 기운이 있어 일간을 받쳐 줍니다.'));
  }

  // F4 구성 (visible 천간 아군 vs 타군)
  const sup = input.visibleSupportPositions.length;
  const drn = input.visibleDrainPositions.length;
  const compositionEffect: FactorState = sup > drn ? 'SUPPORT' : drn > sup ? 'DRAIN' : 'NEUTRAL';
  if (sup > 0) supportingEvidence.push(ev(`천간 아군 ${sup}자리`, '드러난 자리에서 일간을 돕는 기운이 있습니다.'));
  if (drn > 0) weakeningEvidence.push(ev(`천간 타군 ${drn}자리`, '드러난 자리에서 일간의 힘을 쓰거나 누르는 기운이 있습니다.'));

  const transparencyEffect: FactorState = input.supportRevealed ? 'SUPPORT' : 'NEUTRAL';
  if (input.supportRevealed) {
    supportingEvidence.push(ev('아군 투간', '지지에 숨은 같은 편이 천간으로 드러나 실제로 쓸 수 있는 힘이 됩니다.'));
    structuralModifiers.push('투간으로 지지의 아군이 실효화');
  }

  // ── classification: count satisfied SUPPORT factors vs DRAIN factors (no hidden weights) ─────────
  const supportFactors = [month.state === 'SUPPORT', rooted, seated, compositionEffect === 'SUPPORT'].filter(Boolean).length;
  const drainFactors = [month.state === 'DRAIN', !rooted && !seated, compositionEffect === 'DRAIN'].filter(Boolean).length;

  let classification: StrengthClassification;
  if (supportFactors === 4 && drainFactors === 0) classification = 'EXTREMELY_STRONG';
  else if (supportFactors >= 3 && drainFactors <= 1) classification = 'STRONG';
  else if (supportFactors === 3) classification = 'BALANCED_STRONG';
  else if (supportFactors === 2 && drainFactors <= 1) classification = 'BALANCED_STRONG';
  else if (supportFactors === 2) classification = 'BALANCED';
  else if (supportFactors === 1 && drainFactors >= 2) classification = 'BALANCED_WEAK';
  else if (supportFactors === 1) classification = 'BALANCED';
  else if (drainFactors >= 3) classification = 'EXTREMELY_WEAK';
  else classification = 'WEAK';

  // Honest tension reporting — the rejected build hid these behind a lookup result.
  if (supportFactors >= 2 && drainFactors >= 2) {
    ambiguities.push('일간을 돕는 구조와 빼앗는 구조가 함께 뚜렷해, 강약을 한쪽으로 확정하기 어렵습니다.');
  }
  if (month.state === 'SUPPORT' && !rooted && !seated) {
    ambiguities.push('계절은 얻었지만 지지에 뿌리가 없어, 겉과 속의 힘이 다릅니다.');
    structuralModifiers.push('득령·무근 — 표면적 강함');
  }
  if (month.state === 'DRAIN' && rooted && seated) {
    ambiguities.push('계절은 잃었지만 지지 뿌리가 단단해, 약해 보여도 버티는 구조입니다.');
    structuralModifiers.push('실령·유근 — 내실형');
  }
  if (!input.hourKnown) {
    ambiguities.push('시주가 확정되지 않아 한 기둥의 정보가 빠진 상태의 판정입니다.');
  }

  return {
    classification,
    label: STRENGTH_LABEL[classification],
    supportingEvidence,
    weakeningEvidence,
    monthCommandEffect: month.state,
    rootingEffect,
    transparencyEffect,
    compositionEffect,
    structuralModifiers,
    ambiguities,
    confidence: ambiguities.length === 0 && input.hourKnown ? 'HIGH' : ambiguities.length > 1 ? 'LOW' : 'MEDIUM',
    doctrineProvenance: [
      `method=${DIVINATION_STRENGTH_METHOD}`,
      'class=C (억부 구조 판정 — 널리 쓰이는 표준 원리이나 본 제품에서는 신규 채택, 검토 대기)',
      '⚠ owner MYUNGRI_100 분석은 M-18 강약을 "판정값 출력 금지"로 분류함 — 반드시 재확인 필요',
    ],
  };
}

// ── 용신 (억부용신 only) ─────────────────────────────────────────────────────────────────────────
export type YongshinJudgment = {
  primaryYongshin: FiveElement | null;
  basis: string;
  secondaryFavorableFactors: string[];
  unfavorableFactors: string[];
  structuralReasoningReferences: string[];
  alternativeInterpretation: string | null;
  alternativeReason: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  doctrineProvenance: string[];
};

// 오행 상생/상극 — frozen classical cycles, used only to name which element supports/drains the day master.
const GENERATES: Record<FiveElement, FiveElement> = { WOOD: 'FIRE', FIRE: 'EARTH', EARTH: 'METAL', METAL: 'WATER', WATER: 'WOOD' };
const GENERATED_BY: Record<FiveElement, FiveElement> = { FIRE: 'WOOD', EARTH: 'FIRE', METAL: 'EARTH', WATER: 'METAL', WOOD: 'WATER' };
const CONTROLS: Record<FiveElement, FiveElement> = { WOOD: 'EARTH', EARTH: 'WATER', WATER: 'FIRE', FIRE: 'METAL', METAL: 'WOOD' };
const CONTROLLED_BY: Record<FiveElement, FiveElement> = { EARTH: 'WOOD', WATER: 'EARTH', FIRE: 'WATER', METAL: 'FIRE', WOOD: 'METAL' };

const EL_LABEL: Record<FiveElement, string> = { WOOD: '목', FIRE: '화', EARTH: '토', METAL: '금', WATER: '수' };

const WEAK_SIDE: StrengthClassification[] = ['EXTREMELY_WEAK', 'WEAK', 'BALANCED_WEAK'];
const STRONG_SIDE: StrengthClassification[] = ['EXTREMELY_STRONG', 'STRONG', 'BALANCED_STRONG'];

/**
 * 억부용신. A 용신 is only named when (a) the strength verdict actually leans, and (b) the needed element is
 * PRESENT in the chart — an element the chart does not contain cannot be its 용신 in this method. Genuine
 * ambiguity is preserved (§13) instead of forcing a pick.
 */
export function judgeYongshin(input: {
  strength: DayMasterStrengthJudgment;
  dayMasterElement: FiveElement;
  /** Elements actually present in the natal chart (raw counts from the frozen distribution). */
  elementCounts: Record<FiveElement, number>;
  /** Extreme seasonal context, if the chart has one — surfaced separately, never blended (§12). */
  extremeSeason: '한랭' | '염열' | null;
}): YongshinJudgment {
  const de = input.dayMasterElement;
  const present = (e: FiveElement) => (input.elementCounts[e] ?? 0) > 0;
  const leaning = STRONG_SIDE.includes(input.strength.classification)
    ? 'STRONG'
    : WEAK_SIDE.includes(input.strength.classification)
      ? 'WEAK'
      : 'BALANCED';

  const provenance = [
    `method=${DIVINATION_YONGSHIN_METHOD}`,
    'class=C (억부용신 단일 학파 — 조후와 혼용하지 않음, 신규 채택·검토 대기)',
    '⚠ owner MYUNGRI_100 분석은 M-20 용신을 REFERENCE_ONLY(위험 매우높음)로 분류함 — 반드시 재확인 필요',
  ];

  // 중화 / unresolved tension → no 용신 is asserted.
  if (leaning === 'BALANCED' || input.strength.ambiguities.length >= 2) {
    return {
      primaryYongshin: null,
      basis: '강약이 한쪽으로 기울지 않아, 억부용신을 하나로 확정하지 않습니다.',
      secondaryFavorableFactors: [],
      unfavorableFactors: [],
      structuralReasoningReferences: input.strength.ambiguities,
      alternativeInterpretation: null,
      alternativeReason: null,
      confidence: 'LOW',
      doctrineProvenance: provenance,
    };
  }

  // 신약 → 생조(인성=일간을 생하는 오행 / 비겁=같은 오행). 신강 → 설기(식상)·극제(관성)·소모(재성).
  const candidates: FiveElement[] = leaning === 'WEAK'
    ? [GENERATED_BY[de], de]
    : [GENERATES[de], CONTROLLED_BY[de], CONTROLS[de]];
  const available = candidates.filter(present);
  const primary = available[0] ?? null;

  const unfavorable = leaning === 'WEAK'
    ? [GENERATES[de], CONTROLLED_BY[de]].filter(present).map((e) => `${EL_LABEL[e]} — 약한 일간의 힘을 더 빼갑니다`)
    : [GENERATED_BY[de], de].filter(present).map((e) => `${EL_LABEL[e]} — 이미 강한 일간을 더 밀어 올립니다`);

  return {
    primaryYongshin: primary,
    basis: primary
      ? leaning === 'WEAK'
        ? `일간이 ${input.strength.label}이라 도와주는 ${EL_LABEL[primary]}을 용신으로 봅니다(억부).`
        : `일간이 ${input.strength.label}이라 힘을 덜어 주는 ${EL_LABEL[primary]}을 용신으로 봅니다(억부).`
      : '필요한 오행이 원국에 없어 용신을 세우지 않습니다.',
    secondaryFavorableFactors: available.slice(1).map((e) => `${EL_LABEL[e]} — 보조로 도움이 됩니다`),
    unfavorableFactors: unfavorable,
    structuralReasoningReferences: [
      `강약 ${input.strength.label} (월령 ${input.strength.monthCommandEffect} · 통근 ${input.strength.rootingEffect} · 구성 ${input.strength.compositionEffect})`,
      ...input.strength.structuralModifiers,
    ],
    // 조후 is NOT mixed into the primary — it is offered as a clearly separate reading (§12).
    alternativeInterpretation: input.extremeSeason
      ? input.extremeSeason === '한랭' ? '조후로 보면 화(火)로 덥히는 쪽을 먼저 볼 수도 있습니다.' : '조후로 보면 수(水)로 식히는 쪽을 먼저 볼 수도 있습니다.'
      : null,
    alternativeReason: input.extremeSeason ? '계절이 한쪽으로 치우쳐, 조후를 우선하는 학파라면 결론이 달라질 수 있습니다(본 판정은 억부 기준).' : null,
    confidence: primary === null ? 'LOW' : input.strength.confidence === 'HIGH' ? 'MEDIUM' : 'LOW',
    doctrineProvenance: provenance,
  };
}

/** Is an incoming luck element favourable under the 용신 judgment? Drives §14 downstream effect. */
export function luckElementEffect(
  yongshin: YongshinJudgment,
  dayMasterElement: FiveElement,
  incoming: FiveElement,
): { effect: 'FAVORABLE' | 'ADVERSE' | 'NEUTRAL'; why: string } {
  if (yongshin.primaryYongshin === null) return { effect: 'NEUTRAL', why: '용신이 확정되지 않아 이 흐름을 길흉으로 단정하지 않습니다.' };
  if (incoming === yongshin.primaryYongshin) {
    return { effect: 'FAVORABLE', why: `들어오는 ${EL_LABEL[incoming]} 기운이 용신과 같아, 이 시기의 힘이 실제로 쓰입니다.` };
  }
  const adverse = yongshin.unfavorableFactors.some((f) => f.startsWith(EL_LABEL[incoming]));
  if (adverse) {
    return { effect: 'ADVERSE', why: `들어오는 ${EL_LABEL[incoming]} 기운이 지금 필요한 방향과 반대로 작용합니다.` };
  }
  return { effect: 'NEUTRAL', why: `들어오는 ${EL_LABEL[incoming]} 기운은 용신과 직접 얽히지 않습니다.` };
}
