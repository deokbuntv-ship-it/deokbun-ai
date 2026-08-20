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

// A short directive appended to the SECOND (only) attempt. Names the fault and re-orients to suitability.
export const CERTAINTY_REGEN_DIRECTIVE =
  '[중요 — 재작성] 앞 답변에 "반드시/무조건/100%/절대/틀림없이" 같은 단정이나 결과 보장(합격합니다·부자가 됩니다·원금 보장 등)이 있었습니다. 사건의 발생이나 결과를 확정·보장하지 말고, 근거 범위 안에서 적합도·흐름·조언으로만 다시 답하십시오.';

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

function outcomeViolates(outcome: ConsultationOutcome, requireMitigation: boolean): boolean {
  const text = renderableText(outcome);
  if (text === null) return false;
  if (containsForbiddenCertainty(text)) return true;
  if (requireMitigation && lacksMitigation(outcome)) return true;
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
  regenerate: () => Promise<string | null>;
}): Promise<GuardedClassification> {
  const first = classifyConsultationOutput(args.raw, args.grounding);
  if (!outcomeViolates(first, args.requireMitigation)) {
    return { outcome: first, regenerated: false, guardRejected: false };
  }

  let raw2: string | null = null;
  try {
    raw2 = await args.regenerate();
  } catch {
    raw2 = null;
  }
  if (typeof raw2 !== 'string' || raw2.trim().length === 0) {
    return { outcome: { kind: 'SEMANTIC_REJECTED', reason: 'guard_certainty_mitigation' }, regenerated: true, guardRejected: true };
  }

  const second = classifyConsultationOutput(raw2, args.grounding);
  if (outcomeViolates(second, args.requireMitigation)) {
    return { outcome: { kind: 'SEMANTIC_REJECTED', reason: 'guard_certainty_mitigation' }, regenerated: true, guardRejected: true };
  }
  return { outcome: second, regenerated: true, guardRejected: false };
}
