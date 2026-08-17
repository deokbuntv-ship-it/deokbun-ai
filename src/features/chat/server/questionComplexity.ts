// Deterministic question-complexity classifier (Overnight Sprint §4). PURE, bundled,
// Jest-tested. Routes each consultation question to SIMPLE / STANDARD / DEEP so the
// LLM tuning profile (reasoning effort + output-token ceiling — see llmBudget
// `resolveConsultationProfile`) matches the answer actually needed. This is the
// single biggest cost lever: gpt-5-mini bills REASONING tokens as output, so a simple
// "내 성격은?" must not pay a deep-analysis reasoning budget.
//
// SAFETY: never calls an LLM (constitution §13 — minimal, deterministic selection),
// never touches grounding/validation. A misclassification only shifts the token
// CEILING + reasoning effort; it can NEVER fabricate, drop, or alter evidence, and
// the output budget stays a truncation-safe ceiling in every class.

export type QuestionComplexity = 'SIMPLE' | 'STANDARD' | 'DEEP';

// DEEP — multi-period / life-spanning / comprehensive synthesis (needs the most
// reasoning + the largest answer).
const DEEP_PATTERNS: RegExp[] = [
  /대운/, // Daewoon = 10-year luck cycles (inherently multi-period)
  /평생|일생|한평생|인생\s*전체|전\s*생애|생애\s*전반/,
  /\d{2,}\s*년\s*(?:동안|간|간의|흐름)/, // "10년 동안/흐름"
  /(?:향후|앞으로|지난)\s*\d{2,}\s*년/, // "향후 10년"
  /종합(?:적|해|분석)|총정리|전반적(?:인)?\s*흐름|장기적|전체적인\s*흐름/,
  /대운별|시기별\s*(?:흐름|운)/,
];

// STANDARD signals — a concrete TIMING window …
const TIMING_PATTERNS: RegExp[] = [
  /\d{4}\s*년/, // "2027년"
  /올해|금년|내년|내후년|작년|재작년/,
  /이번\s*달|다음\s*달|이번\s*주|다음\s*주|이달|다음달/,
  /상반기|하반기|이번\s*분기|분기/,
  /요즘|최근|당분간|지금\s*시기/,
];

// … or a concrete EVENT/FORTUNE domain (needs domain interpretation over time).
// NOTE: relationship SUBJECT nouns (배우자/자녀/부모) are deliberately NOT here — they
// scope WHO the question is about, not an event, so "배우자 성향은?" stays SIMPLE.
const EVENT_DOMAIN_PATTERNS: RegExp[] = [
  /사업|장사|창업|투자|재물|재정|금전|수입|매출|돈\s*(?:운|복)/,
  /직업|직장|이직|취업|퇴사|승진|커리어|진로|사업운/,
  /연애운|결혼운|이혼|재혼|궁합|이별/,
  /건강|질병|수술|병/,
  /시험|합격|입시|고시|취업\s*시험/,
  /이사|이전|매매|계약|부동산|분양/,
  /소송|합격운|취업운|재물운|금전운|직장운|애정운|연애/,
];

// SIMPLE — a single natal-TRAIT facet with no timing/event.
const TRAIT_PATTERNS: RegExp[] = [
  /성격|성향|기질|성정|본성|타고난|천성/,
  /장점|단점|강점|약점|장단점/,
  /어떤\s*사람|나는\s*누구|자아|정체성/,
  /적성|재능|소질|잘하는|어울리는\s*일/,
];

function anyMatch(patterns: RegExp[], q: string): boolean {
  return patterns.some((re) => re.test(q));
}

export function classifyQuestionComplexity(question: string): QuestionComplexity {
  const q = (question ?? '').trim();
  if (q.length === 0) return 'STANDARD'; // safe middle default (never SIMPLE by accident)

  // DEEP wins outright — a multi-period/comprehensive ask always needs the full budget.
  if (anyMatch(DEEP_PATTERNS, q)) return 'DEEP';

  const hasTiming = anyMatch(TIMING_PATTERNS, q);
  const hasEvent = anyMatch(EVENT_DOMAIN_PATTERNS, q);
  const hasTrait = anyMatch(TRAIT_PATTERNS, q);

  // A pure trait question ("내 성격은?", "배우자 성향은?") with no timing/event → SIMPLE.
  if (hasTrait && !hasTiming && !hasEvent) return 'SIMPLE';

  // A timing window or a concrete event/fortune domain → STANDARD.
  if (hasTiming || hasEvent) return 'STANDARD';

  // No strong signal: a very short question is treated as SIMPLE; otherwise the safe
  // middle (STANDARD) so a nuanced ask never under-budgets.
  if (q.length <= 12) return 'SIMPLE';
  return 'STANDARD';
}
