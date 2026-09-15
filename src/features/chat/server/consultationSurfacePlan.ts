// CONSULTATION DELIVERY V6 — THE SERVER-OWNED SURFACE CONTRACT.
//
// The final Blind-84 run measured a grounding foundation that HELD (0 fabricated facts, 0 fabricated
// technical relations, 0 wrong-person, 0 wrong-discipline, 0 temporal corruption) sitting under a delivery
// layer that did not. Three structural defects, all of them decided in presentation:
//
//   1. THE CLOSING SENTENCE WAS AN INDEPENDENT DECISION GENERATOR. 64 of 82 delivered answers ended with the
//      same directional tail, and 12 of them contradicted the conclusion printed directly above it — two as
//      outright polarity reversals. The tail is `verdict.actionableInterpretation`, which the Cross reasoner
//      emits for the "no single conclusion owns the direction" case; the PROMPT renderer already refuses to
//      hand it to the model under a declined verdict (verdictDirective.isDeclinedToDecide), but the
//      PRESENTATION path — the grounded composition's causal chain and the 한마디 section — took it
//      unconditionally. Nothing here reads the reasoner's internals: `closingDirectionOf` classifies the
//      sentence the verdict actually produced, and `ConclusionSurfacePlan` decides whether the asked-axis
//      authority justifies that direction.
//
//   2. GROUNDED WAS TREATED AS RELEVANT. A spouse-position claim reached 40 of 82 answers, including margin,
//      inheritance-timing, promotion and business questions, and in 18 of them it was promoted into the
//      action contract. Every claim in the catalog is authoritative — that was never the problem.
//      `surfaceRelevanceOf` adds the missing axis question: does this claim speak to the PROPOSITION THAT
//      WAS ASKED, or merely to the same chart?
//
//   3. AUTHORITATIVE TEMPORAL FACTS WERE DISCARDED. 26 TIMING-mode and 12 TIMING-domain cases produced ZERO
//      answers containing a year, month, age or date — while the grounding carried 세운 years, 월운 months, a
//      civil reference year/month and a 대운 age span the whole time. `buildTemporalSurfacePlan` surfaces
//      ONLY those already-computed facts, and says so plainly when there are none.
//
// NOTHING IN THIS MODULE CALCULATES. It selects, classifies and frames material the Cross verdict and the
// grounding already carry — the same contract `consultationContentPlan` and `groundedNarrative` hold.
import {
  routeConsultationJudgeDomain,
  type ConsultationJudgeDomain,
  type CrossDivinationVerdict,
  type JudgmentDomain,
  axisLabel,
} from '@/features/divination';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ResolvedTemporalContext } from './serverConsultationTypes';
import { buildConsumerDecisionPlan, type ConsumerDecisionPlanV1 } from './consumerDecisionPlan';

export const CONSULTATION_SURFACE_PLAN_VERSION = 'consultation-surface-plan@1.0.0';

// ── 1. CONCLUSION SURFACE ────────────────────────────────────────────────────────────────────────────

/**
 * The asked proposition's authoritative direction, as ONE value. Every directional word the reader meets —
 * the headline, the causal body's close, the closing line, and the proceed/hold labels — must be consistent
 * with it.
 *
 * MIXED is a real answer, not a failure to answer: the verdict found a direction that holds under one
 * condition and not another, and flattening it to either side loses the product. UNRESOLVED and INSUFFICIENT
 * are NOT directions and must never be spoken as advice.
 */
export type ConclusionState = 'OPEN' | 'BLOCKED' | 'MIXED' | 'UNRESOLVED' | 'INSUFFICIENT';

/** Which way a closing sentence pushes the reader. NEUTRAL asserts no direction of its own. */
export type ClosingDirection = 'PROCEED' | 'HOLD' | 'NEUTRAL';

export type ConclusionSurfacePlan = {
  state: ConclusionState;
  /**
   * DELIVERY V7 — the one customer meaning this surface was derived from, when the verdict carried a
   * synthesis. Present so every downstream section reads the SAME plan instead of re-deriving polarity, and
   * `null` for a legacy/restored verdict without one (behaviour then unchanged).
   */
  consumerPlan: ConsumerDecisionPlanV1 | null;
  /**
   * DECISION SEMANTICS V1 — the headline the reader receives, which must answer the PROPOSITION.
   *
   * `verdict.primaryConclusion` is the winning proposition's own `assertion`, and a PRIMITIVE winner's
   * assertion is a raw engine relation ("올해 흐름이 원국 월주 자형에 마찰을 일으킨다"). Three of 78 delivered
   * consultations shipped that as the entire answer to a decision question, because a proposition carries no
   * separate consumer-conclusion field. When the winner is primitive this is a bounded, direction-faithful
   * sentence built from the SAME resolved state, and the raw relation stays available as supporting reason.
   * Null ⇒ the verdict's own conclusion already answers the proposition and is used unchanged.
   */
  headlineOverride: string | null;
  /**
   * The closing sentence the answer is allowed to end on, or null when the verdict authorizes none. Never
   * invented: it is `verdict.actionableInterpretation` verbatim when its own direction is consistent with
   * `state`, one of the two fixed non-directional sentences below when the state carries no direction, and
   * null when the verdict supplied nothing that survives.
   */
  closing: string | null;
  /** true ⇒ proceed/hold language is authorized for this question. OPEN and BLOCKED only. */
  directional: boolean;
};

// A CLOSED lexicon of the product's own directional advice forms — the vocabulary a closing sentence uses to
// tell the reader to move or to hold. It is deliberately NOT a general "is this factual language" detector
// (the brief forbids recognising facts lexically, and RED-TEAM BLOCKER 1 moved fact authority to the server
// for exactly that reason): it recognises the ADVICE VERB in a sentence the server itself composed, which is
// a closed set by construction.
const PROCEED_LEXICON =
  /밀고\s*가|그대로\s*가|진행하(?:셔도|시면|십시오)|계속\s*하(?:셔도|시면)|움직이(?:셔도|시면|십시오)|해도\s*됩니다|시작하(?:셔도|시면)/;
const HOLD_LEXICON =
  /유지하시는|유지하십시오|방향을\s*틀기보다|미루십시오|미루시는|늦추십시오|줄이(?:고|십시오|시는)|확정하지\s*(?:마|않)|크게\s*벌리지|하지\s*마십시오|보류/;

/**
 * Which direction a closing sentence asserts.
 *
 * A sentence carrying BOTH forms is a CONDITIONAL statement ("방향은 유지하시되, 큰 실행은 … 미루십시오"). It
 * is reported as HOLD, because the restricting half is the one a reader acts on — and because reporting the
 * permissive half would let a conditional close stand under a clean OPEN verdict it does not actually match.
 */
export function closingDirectionOf(text: string): ClosingDirection {
  if (HOLD_LEXICON.test(text)) return 'HOLD';
  return PROCEED_LEXICON.test(text) ? 'PROCEED' : 'NEUTRAL';
}

// The non-directional close. It states the boundary of the evidence and offers nothing to act on in either
// direction, so it cannot re-decide a question the verdict left open. Fixed text, no variable slot.
export const NON_DIRECTIONAL_CLOSING =
  '지금 확인된 근거는 여기까지입니다. 한쪽으로 미리 정해 두지 마시고, 되돌릴 수 있는 범위에서 확인해 보십시오.';

// The compound close. MIXED means both sides are genuinely standing; this says so without picking one.
// Like the sentence above, it is deliberately free of every form in the two lexicons — a fixed closing that
// its own classifier would read as directional would make the whole contract circular.
export const MIXED_CLOSING =
  '이 두 조건은 함께 걸려 있습니다. 한쪽만 떼어 놓고 보시면 결론이 달라지니, 두 가지를 같이 두고 판단하십시오.';

const FOR_DIRECTIONS: readonly string[] = ['STRONGLY_FOR', 'FOR'];
const CONDITIONAL_DIRECTIONS: readonly string[] =
  ['CONDITIONAL_FOR', 'FOR_BUT_LATER', 'AGAINST_FOR_NOW', 'CONDITIONAL_AGAINST'];
const AGAINST_DIRECTIONS: readonly string[] = ['AGAINST', 'STRONGLY_AGAINST'];

/**
 * The asked-axis conclusion state, read straight off the ALREADY-DECIDED `verdict.direction`.
 *
 * The CONDITIONAL stances are MIXED rather than OPEN/BLOCKED on purpose. "된다, 다만 지금은 아니다" and
 * "된다, 다만 규모를 줄여서" are the verdict's own compound truths; presenting either as a clean proceed or a
 * clean hold is precisely the flattening that produced a headline and a closing pointing opposite ways.
 * STRUCTURAL_ANSWER / NOT_APPLICABLE were never decisions — they are non-directional by construction.
 */
export function conclusionStateOf(verdict: CrossDivinationVerdict): ConclusionState {
  const d = verdict.direction as string;
  if (d === 'INSUFFICIENT_DATA') return 'INSUFFICIENT';
  if (d === 'INSUFFICIENT_EVIDENCE') return 'UNRESOLVED';
  if (FOR_DIRECTIONS.includes(d)) return 'OPEN';
  if (AGAINST_DIRECTIONS.includes(d)) return 'BLOCKED';
  if (CONDITIONAL_DIRECTIONS.includes(d)) return 'MIXED';
  return 'UNRESOLVED'; // STRUCTURAL_ANSWER / NOT_APPLICABLE — answered, but never a direction.
}

/**
 * THE ONE ASKED-PROPOSITION AUTHORITY. Every directional surface derives from this and nothing else.
 *
 * The rule is a single consistency check, not a rewrite: a closing sentence survives when its own direction
 * is one the state authorizes, and is REPLACED (never re-pointed) otherwise. A generic hold tail therefore
 * cannot reach an OPEN answer, and cannot reach an UNRESOLVED one at all — which is what the two Blind-84
 * HARD_FAIL polarity reversals were.
 */
// A PRIMITIVE winner is reported by the reasoner as `단일 근거 · <target>`; every synthesised winner names its
// derivation rule instead. That existing field is the signal — no new flag, and no re-parsing of the prose.
const PRIMITIVE_BASIS = /^단일 근거/;

// The bounded, proposition-answering headline. One fixed sentence per resolved state, with the asked axis
// named from the shared ontology. It asserts nothing the verdict did not already resolve.
const HEADLINE_BY_STATE: Record<ConclusionState, (axis: string) => string> = {
  OPEN: (a) => `${a}에 대해서는 지금 열려 있는 쪽으로 봅니다. 아래 근거가 그 방향으로 함께 서 있습니다.`,
  BLOCKED: (a) => `${a}에 대해서는 지금 크게 벌일 자리는 아닙니다. 아래 근거가 같은 제한을 가리킵니다.`,
  MIXED: (a) => `${a}에 대해서는 열리는 쪽과 걸리는 쪽이 함께 있습니다. 어느 한쪽만 보고 정하기는 이릅니다.`,
  UNRESOLVED: (a) => `${a}에 대해서는 지금 근거만으로 한쪽을 확정하기 어렵습니다.`,
  INSUFFICIENT: (a) => `${a}에 대해서는 판단에 필요한 근거가 아직 충분하지 않습니다.`,
};

export function buildConclusionSurfacePlan(verdict: CrossDivinationVerdict): ConclusionSurfacePlan {
  // DELIVERY V7 — THE SYNTHESIS IS THE CUSTOMER AUTHORITY.
  //
  // `verdict.direction` is the proposition graph's own projection and stays exactly as it was (it is the raw
  // verdict provenance, and `decisionMeta` still re-derives it). What it cannot express is a compound truth:
  // a graph that finds "the action is supported and its downstream result is limited" resolves to
  // INSUFFICIENT_EVIDENCE, and the reader was then told 정하지 않겠습니다 about something the system had in
  // fact decided. 28 of the 77 replayable consultations are compound, so this is the common case, not an edge.
  //
  // Where the synthesis resolved something, its state governs every directional surface in the answer —
  // which is the point of this being the ONE conclusion authority rather than a second one.
  const consumerPlan = buildConsumerDecisionPlan(verdict);
  const graphState = conclusionStateOf(verdict);
  const state = consumerPlan && consumerPlan.resolutionKind !== 'NO_APPLICABLE_JUDGMENT'
    ? consumerPlan.conclusionState
    : graphState;
  const supplied = (verdict.actionableInterpretation ?? '').trim();
  const directional = state === 'OPEN' || state === 'BLOCKED';
  const suppliedIsNeutral = supplied.length > 0 && closingDirectionOf(supplied) === 'NEUTRAL';
  // The headline is replaced in exactly two cases: a PRIMITIVE winner (whose assertion is a raw engine
  // relation, never a customer conclusion), and a verdict whose own state could not express what the
  // synthesis resolved. A verdict that already states a good synthesised conclusion keeps it.
  const headlineOverride = PRIMITIVE_BASIS.test(verdict.dominantBasis ?? '')
    ? (consumerPlan?.headlineMeaning ?? HEADLINE_BY_STATE[state](axisLabel(verdict.questionDomain)))
    : consumerPlan && state !== graphState
      ? consumerPlan.headlineMeaning
      : null;

  if (state === 'UNRESOLVED' || state === 'INSUFFICIENT') {
    // A verdict that declined to decide gets a close that also declines. Its own supplied sentence is only
    // usable when it asserts nothing — which is exactly the STRUCTURAL/CAUSAL "이 구조를 알고 계시는 것 자체가
    // 다음 판단의 기준이 됩니다" case.
    //
    // DELIVERY V7 — a TRUE_STANDOFF or a non-direction request is not an empty refusal. Its plan carries a
    // GROUNDED boundary that names what can actually be checked, and that is a better close than the fixed
    // sentence. It is admitted only after the SAME neutrality test every other close passes, so a boundary
    // that reads as advice can never re-decide a question the synthesis left open.
    const boundary = consumerPlan
      && (consumerPlan.resolutionKind === 'TRUE_STANDOFF' || consumerPlan.resolutionKind === 'NON_DIRECTIONAL')
      && closingDirectionOf(consumerPlan.actionBoundary) === 'NEUTRAL'
      ? consumerPlan.actionBoundary
      : null;
    return {
      state, consumerPlan, headlineOverride,
      closing: boundary ?? (suppliedIsNeutral ? supplied : NON_DIRECTIONAL_CLOSING),
      directional: false,
    };
  }
  if (state === 'MIXED') {
    return { state, consumerPlan, headlineOverride, closing: suppliedIsNeutral ? supplied : MIXED_CLOSING, directional: false };
  }
  if (supplied.length === 0) return { state, consumerPlan, headlineOverride, closing: null, directional };
  const asserted = closingDirectionOf(supplied);
  const consistent = asserted === 'NEUTRAL'
    || (state === 'OPEN' ? asserted === 'PROCEED' : asserted === 'HOLD');
  return { state, consumerPlan, headlineOverride, closing: consistent ? supplied : NON_DIRECTIONAL_CLOSING, directional };
}

// ── 2. QUESTION-AXIS SURFACE RELEVANCE ───────────────────────────────────────────────────────────────

/**
 * What a grounded claim is allowed to be USED FOR in this particular answer.
 *
 * ASKED_AXIS_PRIMARY       — speaks to the proposition the reader asked about.
 * CROSS_MATERIAL_QUALIFIER — a different axis that the Cross judge ITSELF tied to this proposition, as a
 *                            contradiction, limitation, interaction or scope qualifier.
 * SUPPORTING_CONTEXT       — carries no axis of its own (timing, general, cross synthesis, structural
 *                            baseline), so it qualifies any question without competing with it.
 * OFF_AXIS_NON_MATERIAL    — a real finding about a DIFFERENT proposition, which Cross did not connect to
 *                            this one. Grounded, and not an answer to what was asked.
 */
export type SurfaceRelevance =
  | 'ASKED_AXIS_PRIMARY' | 'CROSS_MATERIAL_QUALIFIER' | 'SUPPORTING_CONTEXT' | 'OFF_AXIS_NON_MATERIAL';

/** The frame that says WHY a second axis is on the page. Fixed text — it asserts no relation beyond the one
 *  Cross already recorded, and never names an entity, a period or a magnitude. */
export const CROSS_QUALIFIER_FRAME = '이 판단에 함께 걸리는 다른 축입니다';

const contentDomainOf = (d: JudgmentDomain): ConsultationJudgeDomain | null =>
  routeConsultationJudgeDomain(undefined, d);

const squash = (s: string): string => s.replace(/\s+/g, '');

/**
 * The Cross judge's OWN cross-axis material, as one searchable corpus: the agreement points and both halves
 * of every contradiction resolution. A claim whose text Cross quoted into one of these is, by Cross's own
 * decision, material to this proposition — no new inference is made here, and an axis Cross never mentioned
 * cannot smuggle itself in.
 */
export function crossMaterialCorpus(verdict: CrossDivinationVerdict): string {
  return squash([
    ...verdict.agreementPoints,
    ...verdict.contradictionResolutions.flatMap((r) => [r.conflict, r.resolution]),
    ...verdict.contradictionPoints,
  ].join('\n'));
}

/**
 * Classify one claim against the asked proposition. Pure; `domain === null` (a claim with no axis of its
 * own) and an asked axis that routes to no content domain both fail OPEN to context — an unroutable question
 * has no "off axis" to speak of, and inventing one would hide material the reader legitimately needs.
 */
export function surfaceRelevanceOf(
  claim: { domain: JudgmentDomain | null; authoritativeMeaning: string },
  askedAxis: JudgmentDomain,
  materialCorpus: string,
): SurfaceRelevance {
  if (claim.domain === null) return 'SUPPORTING_CONTEXT';
  // A TIMING claim is a SUPPORTING judgment for whatever was asked — "이 흐름은 하반기로 갈수록 옅어집니다"
  // qualifies a business question and a relationship question alike, and is off-axis to neither. It is
  // stated here explicitly because V6.1 gave TIMING its own consultation domain (so that a question whose
  // proposition IS the period can be routed); without this line that routing change would silently reclassify
  // every temporal claim on every other axis as off-axis and strip it from the answer.
  if (claim.domain === 'TIMING') return 'SUPPORTING_CONTEXT';
  const asked = contentDomainOf(askedAxis);
  const own = contentDomainOf(claim.domain);
  if (asked === null || own === null) return 'SUPPORTING_CONTEXT';
  if (own === asked) return 'ASKED_AXIS_PRIMARY';
  return materialCorpus.includes(squash(claim.authoritativeMeaning))
    ? 'CROSS_MATERIAL_QUALIFIER'
    : 'OFF_AXIS_NON_MATERIAL';
}

/** The one predicate the delivery path filters on: may this claim reach a user-visible surface at all? */
export const isSurfaceable = (r: SurfaceRelevance): boolean => r !== 'OFF_AXIS_NON_MATERIAL';

// ── 3. TEMPORAL SURFACE ──────────────────────────────────────────────────────────────────────────────

/** The already-computed temporal facts a consultation may speak from. Every field is read from the
 *  grounding's own `timingAnchors` / reference clock — none of it is derived here. */
export type TemporalAuthority = {
  /** Grounded 세운 years (the saju years the engines actually produced evidence for). */
  years: readonly number[];
  /** Grounded 월운 month keys (year*100+month). */
  months: readonly number[];
  referenceYear: number | null;
  referenceMonth: number | null;
  /** The active 대운 age span, when one was computed. */
  ageMin: number | null;
  ageMax: number | null;
  /** The Cross verdict's own timing sentence, when it produced one. */
  timingConclusion: string | null;
};

export type TemporalSurfacePlan = {
  /**
   * NARROW — a specific grounded year/month (or the verdict's own timing sentence) can be named.
   * BROAD  — only a wide period exists (the active 대운 span); the precision limit is stated with it.
   * NONE   — no temporal authority at all; the answer says the timing cannot be narrowed rather than
   *          silently answering a different question.
   */
  precision: 'NARROW' | 'BROAD' | 'NONE';
  /** Ordinary Korean, ready to deliver. Built only from the fields above plus the fixed frames. */
  text: string;
};

const monthKeyText = (key: number): string => `${Math.trunc(key / 100)}년 ${key % 100}월`;

// The precision-limit and no-authority sentences. Neither names a period, so neither can become a claim.
const BROAD_LIMIT = '그보다 좁은 시점은 지금 근거로는 나누기 어렵습니다.';
const NO_AUTHORITY =
  '지금 확인된 근거로는 시점을 좁혀 말씀드릴 수 없습니다. 없는 시기를 만들어 드리지는 않겠습니다.';
const NO_AUTHORITY_CHECKPOINT = '아래 조건이 실제로 바뀌는 지점을 시점 대신 기준으로 삼으십시오.';

// A 대운 span is a decade-wide bucket, so it is BROAD by definition. Anything narrower the engines produced
// (a 세운 year, a 월운 month, the verdict's own timing sentence, the reference clock) is NARROW.
const MAX_LISTED_PERIODS = 3;

// `timingAnchors.years` is a VALIDATION allowlist, not a list of periods the reading points at: it includes
// the BIRTH YEAR so that mentioning it is never scored as a fabricated timing claim. Naming it as "the year
// the evidence lands on" would be nonsense, so the surface keeps only years inside the window the reading
// can actually speak about — last year through the next decade of 세운 targets, relative to the server's own
// reference clock. This drops nothing the engines computed for a question; it excludes an allowlist entry.
const PAST_YEAR_WINDOW = 1;
const FUTURE_YEAR_WINDOW = 10;

/**
 * The temporal surface, from authoritative facts ONLY.
 *
 * `hasCheckpoint` is the caller's statement that the answer already carries a grounded decision condition
 * (an action bucket standing on a real claim); it only decides whether the NONE case offers that condition
 * as the substitute for a period, and it can never introduce one.
 */
export function buildTemporalSurfacePlan(
  authority: TemporalAuthority,
  hasCheckpoint: boolean,
): TemporalSurfacePlan {
  // This section answers WHICH PERIOD, and only that. The verdict's own timing PROSE is delivered under
  // 앞으로의 흐름 by the narrative renderer, so repeating it here would print the same paragraph twice — it
  // is read below purely as evidence that temporal authority exists at all.
  const hasTimingProse = (authority.timingConclusion ?? '').trim().length > 0;

  // NARROWEST FIRST — a grounded month beats a grounded year beats the reference clock, because that is the
  // order of precision the engines actually computed at. The list is capped so a wide 월운 sweep does not
  // turn the sentence into a table; the cap is a presentation bound, never a claim about the others.
  const ref = authority.referenceYear;
  // A "when should I…" question resolves a WINDOW of months, and the reader is asking about the ones still
  // ahead of them; listing the earliest three of a whole-year sweep would answer with months that have
  // already passed. Forward months are preferred, and the full set is the fallback so a deliberately
  // backward-looking question ("지난달은 왜 그랬나") still gets the period it asked about.
  const nowKey = ref !== null && authority.referenceMonth !== null ? ref * 100 + authority.referenceMonth : null;
  const allMonths = [...authority.months].filter(Number.isInteger).sort((a, b) => a - b);
  const forward = nowKey === null ? allMonths : allMonths.filter((m) => m >= nowKey);
  const months = forward.length > 0 ? forward : allMonths;
  const years = [...authority.years]
    .filter((y) => Number.isFinite(y)
      && (ref === null || (y >= ref - PAST_YEAR_WINDOW && y <= ref + FUTURE_YEAR_WINDOW)))
    .sort((a, b) => a - b);
  if (months.length > 0) {
    return {
      precision: 'NARROW',
      text: `근거가 실제로 잡히는 시점은 ${months.slice(0, MAX_LISTED_PERIODS).map(monthKeyText).join(', ')}입니다.`,
    };
  }
  if (years.length > 0) {
    // DECISION SEMANTICS V1 §TIMING — DO NOT DISCARD THE MONTH BEHIND THE YEAR.
    //
    // The year branch used to return here and the reference-month branch below was unreachable, so 32 of 37
    // timing sections in the V6.1 run said only "2026년" while a populated `referenceMonth` and a directional
    // 월운 layer sat unused. The month is stated as the ANCHOR the judgment was made at — which is exactly what
    // it is. It is deliberately NOT presented as a chosen or best month: current-month evidence is not an
    // engine claim about a future month, and the closing clause says so rather than letting the reader infer it.
    const named = `근거가 실제로 잡히는 해는 ${years.slice(0, MAX_LISTED_PERIODS).map((y) => `${y}년`).join(', ')}입니다.`;
    if (authority.referenceMonth !== null && ref !== null) {
      return {
        precision: 'NARROW',
        text: `${named} 이 판단은 ${ref}년 ${authority.referenceMonth}월 흐름을 기준으로 본 것이고, `
          + `그보다 좁혀 특정 달을 짚을 근거는 아직 없습니다.`,
      };
    }
    return { precision: 'NARROW', text: named };
  }
  if (ref !== null) {
    const month = authority.referenceMonth !== null ? ` ${authority.referenceMonth}월` : '';
    return { precision: 'NARROW', text: `이 판단은 ${ref}년${month} 흐름을 기준으로 본 것입니다.` };
  }
  if (authority.ageMin !== null && authority.ageMax !== null) {
    return {
      precision: 'BROAD',
      text: `지금 보고 있는 큰 흐름은 ${authority.ageMin}~${authority.ageMax}세 구간입니다. ${BROAD_LIMIT}`,
    };
  }
  // Timing prose with no resolvable period is CASE B, not CASE C: the flow is real and shown above, and what
  // is missing is only the precision to name a point in it. Saying "no timing" here would contradict the
  // section the reader just read.
  if (hasTimingProse) return { precision: 'BROAD', text: BROAD_LIMIT };
  return { precision: 'NONE', text: hasCheckpoint ? `${NO_AUTHORITY} ${NO_AUTHORITY_CHECKPOINT}` : NO_AUTHORITY };
}

/** The section this plan is delivered under. Registered in the presentation VM's delivery order. */
export const TEMPORAL_SECTION_TITLE = '시기';

/**
 * Collect the temporal authority from material the request ALREADY resolved: each engine's own
 * `timingAnchors` (the 세운 years / 월운 months / 대운 age span the engines produced evidence for), the
 * server-owned reference clock, and the Cross verdict's timing sentence. A straight field read — it neither
 * calculates a period nor widens one, and an anchor no engine supplied simply is not here.
 */
export function temporalAuthorityFrom(
  grounding: ConsultationGrounding,
  temporalContext: ResolvedTemporalContext,
  verdict: CrossDivinationVerdict | null,
): TemporalAuthority {
  const years = new Set<number>();
  const months = new Set<number>();
  let ageMin: number | null = null;
  let ageMax: number | null = null;
  if (grounding.status === 'available') {
    for (const ev of [grounding.evidence.myungri, grounding.evidence.ziwei, grounding.evidence.qimen]) {
      const ta = ev.timingAnchors;
      if (!ta) continue;
      for (const y of ta.years ?? []) if (Number.isFinite(y)) years.add(y);
      for (const m of ta.months ?? []) if (Number.isInteger(m)) months.add(m);
      if (ta.daewoonAgeSpan) {
        ageMin = ageMin === null ? ta.daewoonAgeSpan.min : Math.min(ageMin, ta.daewoonAgeSpan.min);
        ageMax = ageMax === null ? ta.daewoonAgeSpan.max : Math.max(ageMax, ta.daewoonAgeSpan.max);
      }
    }
  }
  // The periods the QUESTION itself resolved to (server-owned, never the client clock) are grounded targets
  // in exactly the same sense: `buildMyungriEvidence` computed a 세운/월운 for each one or dropped it.
  for (const t of temporalContext.resolvedTargets) {
    if (t >= 100000) months.add(t);
    else if (Number.isInteger(t)) years.add(t);
  }
  return {
    years: [...years],
    months: [...months],
    referenceYear: temporalContext.referenceYear ?? null,
    referenceMonth: temporalContext.referenceMonth ?? null,
    ageMin,
    ageMax,
    timingConclusion: verdict?.timingConclusion ?? null,
  };
}
