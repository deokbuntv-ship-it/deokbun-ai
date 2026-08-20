// Post-output guarantee / event-certainty guard (Sprint A §8-§10). The consultation prompt already
// discourages certainty (SYSTEM_CONSTITUTION), but there was NO deterministic OUTPUT check. This is the
// second, structural boundary: it REUSES the shipped event-guarantee detector (`containsEventGuarantee`,
// already used by Today/Monthly) and ADDS the bounded certainty adverbs + guaranteed-financial phrasing
// the consultation path was missing. NARROW + high-precision (per-sentence, hedge-aware) — NOT generic
// Korean sentiment parsing, NO critic LLM.
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import {
  classifyConsultationOutput,
  composeConsultationText,
  type ConsultationOutcome,
} from '@/features/chat/prompts/structuredConsultation';
import { containsEventGuarantee } from '@/features/monthly/server';
import type { PolarityTier } from '@/features/polarity/polarityKernel';

// Bounded certainty adverb + an ASSERTIVE positive outcome nearby (반드시 성공합니다 / 무조건 잘 됩니다 /
// 100% 합격 / 틀림없이 부자). The outcome anchor keeps precision high: a bare adverb alone is not flagged.
const CERTAINTY_GUARANTEE =
  /(반드시|무조건|틀림없이|꼭|100\s*%|100\s*퍼)[^.!?。\n]{0,14}(성공|합격|부자|이뤄|이룹|잘\s*(된|됩|돼|될)|좋아[집지]|벌(어|게|ㄹ|립|린)|해결|성사|이깁|생깁|들어[와옵]|풀립|됩니다|돼요|될\s*겁)/;
// "절대 실패하지 않는다 / 절대 안 됩니다 / 절대 잃지 않아요" — an absolute NEGATIVE-outcome guarantee.
const ABSOLUTE_NEGATIVE_GUARANTEE =
  /절대[^.!?。\n]{0,10}(실패|망하|잃|틀리|안\s*(됩|돼|되|해)|못\s*[한할해])/;
// Guaranteed financial return.
const FINANCIAL_GUARANTEE =
  /원금\s*보장|수익[^.!?。\n]{0,6}보장|보장[^.!?。\n]{0,6}수익|확정\s*수익|(무조건|반드시)[^.!?。\n]{0,8}(수익|이득|벌)|손실\s*(이\s*)?없(어|이|습|다)/;
// Hedge / negation tokens. When a sentence carries a hedge, an adverb match is treated as SAFE (e.g.
// "반드시 성공한다고 단정할 수는 없습니다" / "원금 보장은 어렵습니다") — biases toward not over-rejecting a
// GOOD hedged answer. The concrete event-guarantee detector is NOT hedge-gated (it matches only assertions).
const HEDGE =
  /없|아니|않|어렵|힘들|불가|단정|장담|모르|수도\s*있|일\s*수\s*있|가능성|경향|편(이|입니다)|참고|보장(은|할)/;

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?。\n])/).map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Does the answer text carry a forbidden guarantee / event-certainty claim? Per-sentence so a hedge in
 * one sentence never excuses a guarantee in another. High precision; a false negative (letting a
 * borderline phrase through) is preferred to a false positive (rejecting a good hedged answer).
 */
export function containsForbiddenCertainty(text: string): boolean {
  if (typeof text !== 'string' || text.length === 0) return false;
  for (const s of splitSentences(text)) {
    if (containsEventGuarantee(s)) return true; // shipped concrete-event detector (assertions only)
    const hedged = HEDGE.test(s);
    if (!hedged && FINANCIAL_GUARANTEE.test(s)) return true;
    if (!hedged && (CERTAINTY_GUARANTEE.test(s) || ABSOLUTE_NEGATIVE_GUARANTEE.test(s))) return true;
  }
  return false;
}

// ── Option B winner/ranking output guard (Sprint C.1 §11) ──────────────────────────────────────
// V1 has NO server-decided temporal/comparison winner, so an LLM winner/rank/best/worst claim on a
// comparison or ranking question is unsupported. Per-sentence + hedge-aware (mirrors the certainty guard):
// a sentence that DECLINES to pick ("한쪽이 더 낫다고 단정하기 어렵습니다", "1순위를 정하지 않습니다") is NOT flagged.
const WINNER_CLAIM =
  /보다\s*(더\s*)?(좋|낫|유리|나은)|(이쪽|저쪽|한쪽|이\s*편|그\s*편)\s*(이|가)?\s*더\s*(좋|낫|유리)|더\s*나은\s*(쪽|편|시기|달|해)|가장\s*(좋|나은|유리|나쁜|안\s*좋)|제일\s*(좋|나은|유리)|최고의\s*(시기|해|달|때)|최악의\s*(시기|해|달)|1\s*순위|우선\s*추천|먼저\s*추천/;
const WINNER_HEDGE = /단정|어렵|아니|않|없|정하지|고르지|가리기|우열|비슷|팽팽|섣불리/;
export function containsWinnerClaim(text: string): boolean {
  if (typeof text !== 'string' || text.length === 0) return false;
  for (const s of splitSentences(text)) {
    if (WINNER_CLAIM.test(s) && !WINNER_HEDGE.test(s)) return true;
  }
  return false;
}

// ── Prose ↔ machine-polarity contradiction guard (Sprint C.1 §14) ──────────────────────────────
// BOUNDED, not full sentiment analysis: a CAUTION conclusion must not read as strongly positive, and a
// FAVORABLE conclusion must not read as strongly negative, in the high-salience fields. STEADY/DYNAMIC are
// not gated (no strong directional claim to contradict).
const STRONG_POSITIVE = /매우\s*좋|아주\s*좋|정말\s*좋|최고|더할\s*나위|걱정\s*(할\s*것[도은]?\s*)?없|문제\s*(가\s*)?없|순조|탄탄대로|거침없|막힘\s*없|대박|크게\s*이룰/;
const STRONG_NEGATIVE = /매우\s*나쁘|아주\s*나쁘|최악|가망\s*(이\s*)?없|답이\s*없|암울|절망|크게\s*위험|파산|망(할|한다|합니다|해요)/;
export function contradictsPolarity(text: string, polarity: PolarityTier): boolean {
  if (typeof text !== 'string' || text.length === 0) return false;
  if (polarity === 'CAUTION') return STRONG_POSITIVE.test(text);
  if (polarity === 'FAVORABLE') return STRONG_NEGATIVE.test(text);
  return false;
}

// A short directive appended to the SECOND (only) attempt. Names the fault(s) and re-orients the answer.
export const CERTAINTY_REGEN_DIRECTIVE =
  '[중요 — 재작성] 앞 답변에 다음 중 하나가 있었습니다: (1) "반드시/무조건/100%/절대/틀림없이" 같은 단정·결과 보장, (2) 여러 후보 중 한쪽을 승자/1순위/가장 좋음(또는 가장 나쁨)으로 고르는 표현, (3) 서버가 판단한 전반 흐름과 어긋나는 과장. 사건/결과를 확정·보장하지 말고, 후보를 비교하는 질문이면 한쪽을 승자로 정하지 말고 각각 설명하며, 근거 범위 안 적합도·흐름·조언으로만 다시 답하십시오.';

// The user-facing text an outcome would render (accepted card composed, or structural-fallback prose).
// SEMANTIC_REJECTED already renders a safe canned message → nothing to guard.
function renderableText(outcome: ConsultationOutcome): string | null {
  if (outcome.kind === 'ACCEPTED') return composeConsultationText(outcome.result);
  if (outcome.kind === 'STRUCTURAL_FALLBACK') return outcome.text;
  return null;
}

// A cautionary conclusion must carry at least one practical direction. Enforced only when the plan set
// requireMitigation (server-owned). Until the deterministic polarity kernel exists, the plan keeps this
// false, so this branch is INACTIVE in production but wired + unit-tested via a synthetic requireMitigation.
function lacksMitigation(outcome: ConsultationOutcome): boolean {
  if (outcome.kind !== 'ACCEPTED') return false; // a fallback/rejection is not a structured caution card
  return (outcome.result.cautions?.length ?? 0) === 0;
}

// The high-salience conclusion text for the polarity-contradiction check (§14): the card's headline + core
// interpretation, or the fallback prose — so the guard targets the CONCLUSION, not incidental asides.
function highSalienceText(outcome: ConsultationOutcome): string | null {
  if (outcome.kind === 'ACCEPTED') return `${outcome.result.coreSummary ?? ''} ${outcome.result.coreInterpretation ?? ''}`;
  if (outcome.kind === 'STRUCTURAL_FALLBACK') return outcome.text;
  return null;
}

type GuardOpts = { requireMitigation: boolean; forbidWinner: boolean; polarity?: PolarityTier };
function outcomeViolates(outcome: ConsultationOutcome, opts: GuardOpts): boolean {
  const text = renderableText(outcome);
  if (text === null) return false;
  if (containsForbiddenCertainty(text)) return true;
  if (opts.forbidWinner && containsWinnerClaim(text)) return true;
  if (opts.requireMitigation && lacksMitigation(outcome)) return true;
  if (opts.polarity) {
    const hs = highSalienceText(outcome);
    if (hs !== null && contradictsPolarity(hs, opts.polarity)) return true;
  }
  return false;
}

export type GuardedClassification = {
  outcome: ConsultationOutcome;
  regenerated: boolean; // a second (constrained) attempt was made
  guardRejected: boolean; // the guard forced the safe fallback (both attempts violated)
};

/**
 * Classify the LLM output, then enforce the certainty + (optional) mitigation guard: on a violation, allow
 * exactly ONE constrained regeneration; if it still violates (or fails), return a SEMANTIC_REJECTED outcome
 * so the caller shows the safe fallback. No infinite retries, no critic LLM. `regenerate` returns the raw
 * second response (or null on failure).
 */
export async function classifyWithGuards(args: {
  raw: string;
  grounding: ConsultationGrounding;
  requireMitigation: boolean;
  // Option B (Sprint C.1 §11): set for comparison/ranking questions — reject an LLM-invented winner/rank.
  forbidWinner?: boolean;
  // Server-owned target polarity (§14): reject a prose conclusion that clearly contradicts it.
  polarity?: PolarityTier;
  regenerate: () => Promise<string | null>;
}): Promise<GuardedClassification> {
  const opts: GuardOpts = {
    requireMitigation: args.requireMitigation,
    forbidWinner: args.forbidWinner ?? false,
    polarity: args.polarity,
  };
  const first = classifyConsultationOutput(args.raw, args.grounding);
  if (!outcomeViolates(first, opts)) {
    return { outcome: first, regenerated: false, guardRejected: false };
  }

  let raw2: string | null = null;
  try {
    raw2 = await args.regenerate();
  } catch {
    raw2 = null;
  }
  if (typeof raw2 !== 'string' || raw2.trim().length === 0) {
    return { outcome: { kind: 'SEMANTIC_REJECTED', reason: 'guard_option_b_polarity' }, regenerated: true, guardRejected: true };
  }

  const second = classifyConsultationOutput(raw2, args.grounding);
  if (outcomeViolates(second, opts)) {
    return { outcome: { kind: 'SEMANTIC_REJECTED', reason: 'guard_option_b_polarity' }, regenerated: true, guardRejected: true };
  }
  return { outcome: second, regenerated: true, guardRejected: false };
}
