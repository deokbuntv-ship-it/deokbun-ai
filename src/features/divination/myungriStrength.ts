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
// ⚠ DOCTRINE BLOCKER — the strength CLASS is WITHHELD (V3 §11–§13, `classificationBlocker`).
// The V2 build turned four structural factors into support-votes vs drain-votes and read a 7-level label off
// thresholds. The independent re-audit rejected that as factor voting, and §12 forbids it: 월령 is not one equal
// vote, 통근 and 득지 are not independent tallies, and root count/quality/position cannot collapse into booleans.
// A legitimate 억부 classification needs an authority this repository does not contain (월령-vs-통근 priority,
// root quality weighting, band boundaries). The owner's own `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` lands in the
// same place from the other side — M-18 강약 "CONDITIONAL(입력만·판정 제외)", §8.2 "身强/身弱 판정값을 fact로
// 출력 금지"; M-20 용신 "REFERENCE_ONLY", risk 매우높음. §13 therefore applies: build all safe structural
// preparation, name the gap, report it as a blocker — do NOT return to voting merely to produce a label.
//
// WHAT THIS MODULE DOES ASSERT (all canonical, all frozen-derived — 억부 구조 요소):
//     F1 월령   — 일간의 계절 phase (왕/상/휴/수/사) → 득령 여부
//     F2 통근   — 일간과 同干이 지지 지장간에 있는가 (same-干 identity; NOT same-element)
//     F3 득지   — 일간과 同오행 비겁이 지지 지장간에 있는가 (labelled 득지, kept DISTINCT from 통근)
//     F4 구성   — 천간에 드러난 아군(비겁·인성) 대 타군(식상·재성·관성)
//   Each is emitted as named evidence with its own effect. Structural tensions (득령·무근, 실령·유근) are
//   reported as such. No numeric weighting, no vote tally, no band label.
//   용신: 억부용신 is derived FROM the class, so with the class withheld none is asserted and — critically —
//   nothing downstream is allowed to flip on it (§16). 조후 is never blended into the primary (§12).
// ─────────────────────────────────────────────────────────────────────────────────────────────────
import type { FiveElement, HeavenlyStem } from '@/features/interpretation';
import type { SajuPillarPosition } from '@/features/interpretation/saju/derived/contracts';

import type { JudgmentEvidence } from './contracts';

export const DIVINATION_STRENGTH_METHOD = 'deokbunai.divination-strength.eokbu-structural.v2' as const;
export const DIVINATION_YONGSHIN_METHOD = 'deokbunai.divination-yongshin.eokbu.v2' as const;

/**
 * The 7-level spectrum remains DECLARED (the product wants it) but is not currently emitted: `UNDETERMINED`
 * is the only value this module produces until a strength doctrine is adopted. §14 permits the spectrum
 * "ONLY if structurally and canonically justified" — fabricating precision is worse than withholding it.
 */
export type StrengthClassification =
  | 'EXTREMELY_WEAK'   // 극신약
  | 'WEAK'             // 신약
  | 'BALANCED_WEAK'    // 중화신약
  | 'BALANCED'         // 중화
  | 'BALANCED_STRONG'  // 중화신강
  | 'STRONG'           // 신강
  | 'EXTREMELY_STRONG' // 극신강
  | 'UNDETERMINED';    // 채택 학파 미확정 — 판정 보류

export const STRENGTH_LABEL: Record<StrengthClassification, string> = {
  EXTREMELY_WEAK: '극신약', WEAK: '신약', BALANCED_WEAK: '중화신약', BALANCED: '중화',
  BALANCED_STRONG: '중화신강', STRONG: '신강', EXTREMELY_STRONG: '극신강',
  UNDETERMINED: '강약 판정 보류(학파 미확정)',
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
  /** Genuine tensions in the CHART that a classification would have to resolve — never hidden to look confident. */
  ambiguities: string[];
  /**
   * Non-null when the strength CLASS is withheld because the repository has no adopted doctrine to determine
   * it (§13). Distinct from `ambiguities`: this is a gap in OUR method, not a tension in the chart.
   */
  classificationBlocker: string | null;
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

  // ── CLASSIFICATION IS WITHHELD (V3 §11–§13) ─────────────────────────────────────────────────────
  // The previous build turned these four factors into support-votes vs drain-votes and read a 7-level label
  // off thresholds. The independent audit rejected exactly that as factor voting, and §12 forbids it outright:
  // 월령 is not one equal vote, 통근 and 득지 are not independent tallies, and root count/quality/position and
  // hidden-stem role cannot legitimately collapse into booleans.
  //
  // A correct 억부 classification needs a canonical authority this repository does not contain: how to weigh
  // 월령 against 통근, what root quality/position counts for, and where each band boundary sits. The owner's own
  // `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` reaches the same place from the other side — M-18 강약 is classified
  // "CONDITIONAL(입력만·판정 제외)", §8.2: "身强/身弱 판정값을 fact로 출력 금지" — because the source system's
  // weights were the original author's own, self-described as unfinished.
  //
  // §13 therefore applies: implement the structural PREPARATION, name the gap, and report it as a blocker —
  // do NOT return to voting merely to produce a label. Everything below the classification is real and usable;
  // the label itself stays UNDETERMINED until a doctrine is adopted.
  const classification: StrengthClassification = 'UNDETERMINED';
  const classificationBlocker =
    '강약 등급(신강/신약)을 확정하려면 월령 대 통근의 우선순위·뿌리의 질과 위치·등급 경계를 규정한 채택 학파가 필요합니다. '
    + '본 저장소에는 그 근거가 없어, 구조 요소는 모두 산출하되 등급 판정은 보류합니다.';
  const supportPresent = month.state === 'SUPPORT' || rooted || seated || compositionEffect === 'SUPPORT';
  const drainPresent = month.state === 'DRAIN' || (!rooted && !seated) || compositionEffect === 'DRAIN';
  if (supportPresent && drainPresent) {
    ambiguities.push('일간을 돕는 구조와 빼앗는 구조가 함께 있습니다.');
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
    classificationBlocker,
    // Confidence describes the STRUCTURAL read (the part we do assert), not the withheld class.
    confidence: ambiguities.length === 0 && input.hourKnown ? 'HIGH' : ambiguities.length > 1 ? 'LOW' : 'MEDIUM',
    doctrineProvenance: [
      `method=${DIVINATION_STRENGTH_METHOD}`,
      'class=C (억부 구조 요소 산출 — 널리 쓰이는 표준 원리, 신규 채택·검토 대기)',
      'BLOCKED: 강약 등급 판정은 채택 학파 부재로 보류 (구조 요소만 산출)',
      '⚠ owner MYUNGRI_100 분석도 M-18 강약을 "판정값 출력 금지"로 분류함 — 동일 결론',
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

const EL_LABEL: Record<FiveElement, string> = { WOOD: '목', FIRE: '화', EARTH: '토', METAL: '금', WATER: '수' };

/**
 * 억부용신 — WITHHELD.
 *
 * V3 §15–§17: the 용신 was a lookup off the strength label ("신약 → 인성/비겁, 신강 → 식상/재성/관성, take the
 * first element the chart happens to contain"). That is not a 용신 judgment; it is a table read, and the audit
 * rejected it. Its only input — the strength class — is itself withheld (§13), so the lookup is not merely
 * unsafe, it is unusable. The whole derivation is therefore REMOVED rather than left dormant: leaving it in
 * place would let a future edit re-enable a rejected method without re-deriving the doctrine.
 *
 * What is kept: the structural read that a real 억부 judgment would consume, and a named blocker saying what
 * is missing. §16 is satisfied by construction — with no 용신, `luckElementEffect` returns NEUTRAL for every
 * incoming element, so nothing downstream can flip on a fabricated one.
 */
export function judgeYongshin(input: {
  strength: DayMasterStrengthJudgment;
  dayMasterElement: FiveElement;
  /** Elements actually present in the natal chart (raw counts from the frozen distribution). */
  elementCounts: Record<FiveElement, number>;
  /** Extreme seasonal context, if the chart has one — reported separately, never blended (§12). */
  extremeSeason: '한랭' | '염열' | null;
}): YongshinJudgment {
  return {
    primaryYongshin: null,
    basis: '강약 판정이 보류된 상태라, 억부용신을 세우지 않습니다. (용신을 세우려면 강약 학파 채택이 선행되어야 합니다.)',
    secondaryFavorableFactors: [],
    unfavorableFactors: [],
    structuralReasoningReferences: [
      `월령 ${input.strength.monthCommandEffect} · 통근 ${input.strength.rootingEffect} · 구성 ${input.strength.compositionEffect}`,
      ...input.strength.structuralModifiers,
    ],
    // 조후 context is REPORTED (it is a real seasonal fact) but never promoted into a primary in its place.
    alternativeInterpretation: input.extremeSeason
      ? input.extremeSeason === '한랭'
        ? '계절이 한랭으로 치우쳐 있습니다. 조후를 우선하는 학파라면 화(火)를 먼저 볼 수 있습니다.'
        : '계절이 염열로 치우쳐 있습니다. 조후를 우선하는 학파라면 수(水)를 먼저 볼 수 있습니다.'
      : null,
    alternativeReason: input.extremeSeason
      ? '조후는 억부와 다른 학파의 관점이라, 억부 판정을 대신하지 않습니다.'
      : null,
    confidence: 'LOW',
    doctrineProvenance: [
      `method=${DIVINATION_YONGSHIN_METHOD}`,
      'BLOCKED: 강약 학파 미채택 → 억부용신 산출 불가 (강약 등급이 유일한 입력)',
      '⚠ owner MYUNGRI_100 분석도 M-20 용신을 REFERENCE_ONLY(위험 매우높음)로 분류함 — 동일 결론',
    ],
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
