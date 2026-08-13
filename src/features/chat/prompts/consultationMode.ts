// Consultation MODE (directive §14/§15). A MINIMAL, product-level classification of
// the user's question used ONLY to shape the response policy (structure/length) — it
// asserts nothing about 역학 facts and never fabricates evidence. Deliberately small
// (4 modes, no sprawling intent taxonomy). This is a Claude-owned heuristic, NOT an
// engine/semantic rule.

export type ConsultationMode =
  | 'GENERAL_READING' // "내 사주풀이 좀 해줘" — comprehensive first reading
  | 'DOMAIN_QUESTION' // 재물/사업/직업/연애/관계/건강/학업 등 특정 영역
  | 'TIMING_QUESTION' // 연/월/시기 관련 (근거 없는 시점 생성은 헌장이 금지)
  | 'FOLLOW_UP'; // 앞선 상담을 가리키는 후속 질문 (그중/그때/그럼 …)

// Anaphora / referential cues that only make sense against a prior turn.
const FOLLOW_UP_CUES = /(그중|그 중|그때|그 때|그럼|그러면|그건|그 시기|그 달|아까|방금|위에서|말한 것 중|어느 쪽)/;

// Timing cues. \d{4} catches an explicit year; the rest are relative-time words.
const TIMING_CUES = /(\d{4}\s*년|올해|내년|작년|몇\s*월|언제|시기|시점|대운|세운|운세 흐름|앞으로|향후)/;

// Domain cues (topic only — not a claim about the chart).
const DOMAIN_CUES = /(재물|재산|돈|금전|사업|장사|투자|직업|취업|이직|진로|커리어|연애|결혼|이혼|궁합|관계|인연|배우자|건강|병|질병|공부|학업|시험|합격|이사|이동)/;

/**
 * Classify a question into a response-shaping mode. `hasHistory` gates FOLLOW_UP so a
 * first message is never treated as a follow-up. Order matters: an anaphoric follow-up
 * wins, then timing, then domain, else a general reading. The HARD policies (no
 * fabricated calc, no ungrounded timing, safety) live in SYSTEM_CONSTITUTION and apply
 * in EVERY mode — mode only affects how the answer is shaped.
 */
export function classifyConsultationMode(
  question: string,
  hasHistory: boolean,
): ConsultationMode {
  const q = question.trim();
  if (hasHistory && FOLLOW_UP_CUES.test(q)) return 'FOLLOW_UP';
  if (TIMING_CUES.test(q)) return 'TIMING_QUESTION';
  if (DOMAIN_CUES.test(q)) return 'DOMAIN_QUESTION';
  return 'GENERAL_READING';
}
