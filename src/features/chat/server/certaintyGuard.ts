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

// ── Option B winner/ranking output guard (Sprint C.1 §11, hardened Sprint F.1 §B-§F) ────────────
// V1 has NO server-decided temporal/comparison winner, so the LLM must never manufacture one — EXPLICIT
// ("가장 좋은", "1순위") OR IMPLICIT (선택/추천/진행하세요/무게를 둔다/A보다 낫다/더 적합/피하고 택한다). The server
// owns candidate identity; the LLM may only describe each candidate. Per-sentence + hedge-aware: a sentence that
// DECLINES to pick ("한쪽이 더 낫다고 단정하기 어렵습니다", "1순위를 정하지 않습니다") is NOT flagged. Structural fields
// for a winner (§C) are also forbidden — see WINNER_FIELD below.
const WINNER_CLAIM =
  /보다\s*(더\s*)?(좋|낫|유리|나은)|(이쪽|저쪽|한쪽|이\s*편|그\s*편)\s*(이|가)?\s*더\s*(좋|낫|유리)|더\s*나은\s*(쪽|편|시기|달|해)|가장\s*(좋|나은|유리|나쁜|안\s*좋)|제일\s*(좋|나은|유리)|최고의\s*(시기|해|달|때)|최악의\s*(시기|해|달)|1\s*순위|우선\s*추천|먼저\s*추천/;
// IMPLICIT winner: recommendation / selection / direction / weighting / comparative-preference / avoidance.
const IMPLICIT_WINNER = new RegExp(
  [
    // recommend / advise one side
    '추천', '권합니다', '권해', '권하', '권장', '권유',
    // choose / select as a preference or directive
    '선택하(는\\s*(게|것이|편)|세요|시길|길|시는\\s*걸)', '택하(는\\s*(게|것이|편)|세요|시)',
    '(고르|골라)(는\\s*(게|편)|면|서|야|주)', '고른다면', '고를\\s*(게|까요)?',
    // "if it were me / if I choose … it's X"
    '저라면', '제가\\s*(고르|고른다면|선택|택한다면|본다면|한다면|정한다면)', '굳이\\s*(하나\\s*)?(고르|고른다면|선택|정한다)', '둘\\s*중이?라면',
    // imperative direction: go with / proceed with X
    '로\\s*(진행하|하|가|정하)(세요|십시오|시)', '진행하시는\\s*것', '진행하는\\s*(게|것이|편이)\\s*(좋|낫|맞|적합)',
    // weight / lean toward one side
    '무게를?\\s*(두|싣|실)', '힘을?\\s*(싣|실|실어)', '(쪽|편)에\\s*(무게|비중)', '손을?\\s*들',
    // comparative preference "better than" (allow words between 보다 and the predicate)
    '보다\\s*는?\\s*[^.!?。\\n]{0,12}(더\\s*)?(좋|낫|나아|유리|적합|편|맞|나은)',
    // one side is better / recommended (side-anchored predicate)
    '(쪽|편)(으로|이|을|에|은|가)?\\s*[^.!?。\\n]{0,6}(권|추천|가시|택|선택|무게|낫|나아|유리|적합|맞)',
    // comparative adjectives that imply ranking
    '(조금|좀|약간|상대적으로|여러모로|아무래도)?\\s*더\\s*(적합|유리|나은|나아|적절)',
    '(조금|좀|약간|상대적으로|여러모로)\\s*더\\s*(좋|낫|맞|편)',
    '더\\s*나은\\s*선택',
    // bare preference conclusion / avoidance of one side
    '낫겠|낫습니다|나은\\s*편', '피하(시는|는|고|세요|십시오)',
  ].join('|'),
);
const WINNER_HEDGE = /단정|어렵|아니|않|없|정하지|고르지|가리기|우열|비슷|팽팽|섣불리|못\s*(정|고르|가리)/;
export function containsWinnerClaim(text: string): boolean {
  if (typeof text !== 'string' || text.length === 0) return false;
  for (const s of splitSentences(text)) {
    if ((WINNER_CLAIM.test(s) || IMPLICIT_WINNER.test(s)) && !WINNER_HEDGE.test(s)) return true;
  }
  return false;
}

// Structural guard (§C): the LLM output JSON must carry NO winner/ranking field. Even if the prose is neutral,
// a field like winner/recommendedCandidate/rank/score/best/preference asserts a selection the server never made.
const WINNER_FIELD = /"(winner|recommendedCandidate|recommended|rank|ranking|score|best|worst|preference|preferred|choice|chosen|pick|top(Choice|Pick)?)"\s*:/i;
export function containsWinnerField(rawJson: string): boolean {
  return typeof rawJson === 'string' && WINNER_FIELD.test(rawJson);
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

// ── Compatibility relationship-safety guard (Sprint D §D5) ─────────────────────────────────────
// The 궁합 answer may describe relationship dynamics/friction/risks, but must NOT (as fortune facts):
// command/predict a breakup or divorce, read the other person's private feelings, condemn their immutable
// personality, assert absolute relationship-fate, or claim certainty about their future behavior. Per-
// sentence + hedge-aware. Hedged framings ("단정할 수 없습니다", "알 수 없습니다") are NOT flagged.
const COMPAT_BREAKUP =
  /헤어지(세요|십시오|는\s*게\s*(답|낫|좋|맞)|어라)|이혼(하세요|하십시오|하는\s*게\s*(답|낫|좋)|해야)|(결국|반드시|틀림없이|무조건)\s*[^.!?。\n]{0,8}(헤어|이혼)|헤어질\s*수밖에|만나지\s*마(세요|십시오)|(그만|이제)\s*(만나지|정리)/;
// Euphemistic breakup/relationship-ENDING recommendations (Sprint E.1 §10). Targets 관계 정리/끝내 + a
// recommendation frame, and 헤어지는/이혼하는 편이 좋. Preserves "갈등을 정리할 필요가 있습니다" (conflict, not
// the relationship) — the 정리 must attach to 관계, not 갈등.
const COMPAT_BREAKUP_EUPHEMISM =
  /(이\s*)?관계[를은는]?\s*(정리|끝내|접)(하)?(는\s*(게|것이|편이)|할\s*(필요|때))[^.!?。\n]{0,5}(좋|낫|있|겠)|(헤어지|이혼하)는\s*(게|편이|것이)[^.!?。\n]{0,4}(좋|낫)|관계[를은는]?\s*끝내는\s*(게|편이|것이)[^.!?。\n]{0,4}(좋|낫)/;
const COMPAT_MINDREAD =
  /상대[는가]?\s*[^.!?。\n]{0,6}(당신을\s*)?(사랑하지\s*않|좋아하지\s*않|마음이\s*없|관심이\s*없)|속으로\s*[^.!?。\n]{0,8}(다른|딴)\s*(사람|생각|마음)|(진심|속마음)[은는이가]\s*[^.!?。\n]{0,10}(다른|없|아니)/;
const COMPAT_CONDEMN =
  /(이\s*사람|상대)[은는이가]?\s*[^.!?。\n]{0,4}(나쁜\s*사람|못된\s*사람|글러|인간성이|사람이\s*안\s*[됐된])|성격이\s*[^.!?。\n]{0,4}(최악|파탄|쓰레기|글러먹)/;
const COMPAT_FATE =
  /천생연분(이\s*확실|입니다|이에요|이야)|(절대|무조건)\s*[^.!?。\n]{0,4}(안\s*맞|잘\s*맞)|운명(입니다|이에요|이야|적으로\s*맞)|(반드시|틀림없이)\s*[^.!?。\n]{0,6}(잘\s*맞|안\s*맞)/;
const COMPAT_OTHER_BEHAVIOR =
  /상대[는가]?\s*[^.!?。\n]{0,8}(반드시|틀림없이|무조건|분명히)\s*[^.!?。\n]{0,8}(할\s*겁|합니다|됩니다|해요|바람|떠날|돌아올)/;
const COMPAT_HEDGE = /단정|알\s*수\s*없|속단|확신할\s*수\s*없|섣불리|라고\s*(볼|말할)\s*수\s*(는\s*)?없|아닐\s*수|모릅니다/;

export function containsCompatibilityHarm(text: string): boolean {
  if (typeof text !== 'string' || text.length === 0) return false;
  for (const s of splitSentences(text)) {
    if (COMPAT_HEDGE.test(s)) continue;
    if (COMPAT_BREAKUP.test(s) || COMPAT_BREAKUP_EUPHEMISM.test(s) || COMPAT_MINDREAD.test(s) || COMPAT_CONDEMN.test(s) || COMPAT_FATE.test(s) || COMPAT_OTHER_BEHAVIOR.test(s)) {
      return true;
    }
  }
  return false;
}

// Negative-compatibility mitigation (§D6): a poor-tier answer must carry ≥1 constructive relationship-
// management direction, not fear/fatalism only.
const CONSTRUCTIVE_DIRECTION = /맞춰|조율|대화|소통|이해|배려|노력하면|관리하면|신경\s*쓰면|방식을\s*맞추|시간을\s*두고|천천히|존중|표현하|먼저\s*다가|거리를\s*조절/;
export function hasConstructiveDirection(text: string): boolean {
  return typeof text === 'string' && CONSTRUCTIVE_DIRECTION.test(text);
}

// A short directive appended to the SECOND (only) attempt. Names the fault(s) and re-orients the answer.
export const CERTAINTY_REGEN_DIRECTIVE =
  '[중요 — 재작성] 앞 답변에 다음 중 하나가 있었습니다: (1) "반드시/무조건/100%/절대/틀림없이" 같은 단정·결과 보장, (2) 여러 후보 중 한쪽을 고르거나 미는 표현 — 승자/1순위/가장 좋음뿐 아니라 "A로 진행하세요/A를 추천/권합니다/선택하는 편이 좋다/A가 더 낫다·적합하다/A에 무게를 둔다/B를 피하라/저라면 A" 같은 은근한 추천·선택·방향 제시도 모두 금지, (3) 서버가 판단한 전반 흐름과 어긋나는 과장. 사건/결과를 확정·보장하지 말고, 후보를 비교하는 질문이면 어느 한쪽도 고르거나 권하지 말고 각 후보의 장점과 주의점을 균형 있게 설명한 뒤 "지금 기준으로는 한쪽을 더 낫다고 정하지 않습니다"로 맺으며, 근거 범위 안 적합도·흐름·조언으로만 다시 답하십시오.';

// Appended to the compatibility regeneration (§D5/§D6).
export const COMPAT_REGEN_DIRECTIVE =
  '[중요 — 궁합 재작성] 헤어짐/이혼을 지시하거나 확정하지 말고, 상대의 속마음·성격·미래 행동을 사실로 단정하지 말며, "천생연분/절대 안 맞음" 같은 절대적 궁합 운명을 단정하지 마십시오. 두 사람의 결·마찰·리스크를 설명하고, 관계를 어떻게 조율·관리하면 좋은지 실질적 방향을 최소 한 가지 함께 제시하십시오.';

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

type GuardOpts = {
  requireMitigation: boolean;
  forbidWinner: boolean;
  polarity?: PolarityTier;
  forbidCompatibilityHarm?: boolean; // §D5 — 궁합 relationship-safety
  requireConstructive?: boolean; // §D6 — negative-tier 궁합 must carry a management direction
};
function outcomeViolates(outcome: ConsultationOutcome, opts: GuardOpts, rawJson?: string): boolean {
  // Structural winner field (§C): even neutral prose is rejected if the raw JSON asserts a selection field.
  if (opts.forbidWinner && typeof rawJson === 'string' && containsWinnerField(rawJson)) return true;
  const text = renderableText(outcome);
  if (text === null) return false;
  if (containsForbiddenCertainty(text)) return true;
  if (opts.forbidWinner && containsWinnerClaim(text)) return true;
  if (opts.forbidCompatibilityHarm && containsCompatibilityHarm(text)) return true;
  if (opts.requireMitigation && lacksMitigation(outcome)) return true;
  if (opts.requireConstructive && !hasConstructiveDirection(text)) return true;
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
  // 궁합 relationship-safety (§D5) + negative-tier constructive-direction requirement (§D6).
  forbidCompatibilityHarm?: boolean;
  requireConstructive?: boolean;
  regenerate: () => Promise<string | null>;
}): Promise<GuardedClassification> {
  const opts: GuardOpts = {
    requireMitigation: args.requireMitigation,
    forbidWinner: args.forbidWinner ?? false,
    polarity: args.polarity,
    forbidCompatibilityHarm: args.forbidCompatibilityHarm ?? false,
    requireConstructive: args.requireConstructive ?? false,
  };
  const first = classifyConsultationOutput(args.raw, args.grounding);
  if (!outcomeViolates(first, opts, args.raw)) {
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
  if (outcomeViolates(second, opts, raw2)) {
    return { outcome: { kind: 'SEMANTIC_REJECTED', reason: 'guard_option_b_polarity' }, regenerated: true, guardRejected: true };
  }
  return { outcome: second, regenerated: true, guardRejected: false };
}
