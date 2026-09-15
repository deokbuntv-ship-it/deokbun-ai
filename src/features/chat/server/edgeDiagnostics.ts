// Runtime-neutral Edge diagnostics (Server-Trust — chat 502 diagnosis). Pure, no I/O, no secrets. Bundled
// into the chat Edge so the 502-class classification + SAFE redaction is unit-tested under Jest (the Deno
// Edge itself cannot run under Jest). NEVER handles the prompt, birth data, question, engine evidence, API
// key, auth header, or the OpenAI response TEXT — only shape + status + token counts.

// Parse the OpenAI Responses API payload → assistant text. Tolerant of malformed shapes (returns '').
// (Moved verbatim from the Edge so the "malformed response → empty" behavior is testable.)
export function extractResponsesText(payload: unknown): string {
  const output = (payload as { output?: unknown } | null)?.output;
  if (Array.isArray(output)) {
    const parts: string[] = [];
    for (const item of output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const contentPart of item.content) {
          if (contentPart?.type === 'output_text' && typeof contentPart.text === 'string') {
            parts.push(contentPart.text);
          }
        }
      }
    }
    const joined = parts.join('').trim();
    if (joined.length > 0) return joined;
  }
  const convenience = (payload as { output_text?: unknown } | null)?.output_text;
  if (typeof convenience === 'string' && convenience.trim().length > 0) return convenience.trim();
  return '';
}

// Classify a single OpenAI Responses outcome into a stable INTERNAL code (no content). Distinguishes the
// otherwise-indistinguishable 502 classes:
//   transport failure (fetch threw)     → OPENAI_FETCH_FAILED
//   non-2xx HTTP                         → OPENAI_HTTP_<status>   (e.g. 401 bad key, 429 quota, 404 model)
//   2xx but response 'incomplete'        → OPENAI_INCOMPLETE_<reason>  (e.g. max_output_tokens → reasoning ate the budget)
//   2xx, complete, but no visible text   → OPENAI_EMPTY_OUTPUT
//   otherwise                            → OK
export type OpenAiOutcome = {
  ok: boolean; // false = transport/HTTP failure
  statusCode?: number; // HTTP status (0/undefined when fetch threw)
  text: string;
  incompleteReason?: string | null; // Responses API `incomplete_details.reason`
};
export function openAiFailureCode(o: OpenAiOutcome): string {
  if (!o.ok) return o.statusCode ? `OPENAI_HTTP_${o.statusCode}` : 'OPENAI_FETCH_FAILED';
  // Incomplete (e.g. max_output_tokens) is a FAILURE even with partial text — a truncated structured
  // answer is unusable (mid-JSON, no closing brace) and must never proceed to parse. Fail closed with a
  // clear reason instead of leaking through as an unparseable payload.
  if (o.incompleteReason) return `OPENAI_INCOMPLETE_${o.incompleteReason}`;
  if (o.text.trim().length === 0) return 'OPENAI_EMPTY_OUTPUT';
  return 'OK';
}

// Extract the token DETAIL breakdown from an OpenAI Responses `usage` object (cost telemetry §13).
// gpt-5-mini reports reasoning tokens under output_tokens_details.reasoning_tokens and cache hits under
// input_tokens_details.cached_tokens — the two fields needed to SEE the reasoning share + verify prompt
// caching. Tolerant of missing/malformed shapes (null per field). Reads ONLY token counts, never content.
export function parseUsageDetails(usage: unknown): {
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
} {
  const u = (usage ?? {}) as {
    input_tokens_details?: { cached_tokens?: unknown };
    output_tokens_details?: { reasoning_tokens?: unknown };
  };
  const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : null;
  return {
    cachedInputTokens: num(u.input_tokens_details?.cached_tokens),
    reasoningTokens: num(u.output_tokens_details?.reasoning_tokens),
  };
}

// The ONLY fields a diagnostic line may carry. Redaction is by ALLOWLIST (never blocklist): anything not
// listed here — prompt, birthInput, question, evidence, grounding, apiKey, authorization, openai body,
// messages — is dropped even if a caller passes it.
export const SAFE_DIAG_KEYS = [
  'requestId',
  'stage',
  'code',
  'path', // 'consultation' | 'summary'
  'upstreamStatus', // OpenAI HTTP status (number)
  'responseStatus', // Responses API `status` enum ('completed'|'incomplete'|'failed')
  'incompleteReason',
  'model',
  'grounded',
  'validationCategory',
  'outputTokens',
  'totalTokens',
  'latencyMs',
  // cost telemetry (§13) — all non-PII scalars
  'complexity', // SIMPLE | STANDARD | DEEP
  'reasoningEffort', // low | medium | …
  'maxOutputTokens', // the chosen ceiling
  'cachedInputTokens', // usage.input_tokens_details.cached_tokens
  'reasoningTokens', // usage.output_tokens_details.reasoning_tokens
  // usage-log degradation (2026-09-02) — which telemetry columns an insert had to drop, and the SQLSTATE
  // that forced it. Column NAMES and a 5-char SQLSTATE only: never the failing value, never the message
  // (a constraint message can echo row data, which is exactly what must not reach a log line).
  'droppedColumns',
  'errorCode',
  // Premium 재시도 (2026-09-02) — 한 요청 안에서 LLM 을 몇 번 불렀는가. 1 이면 한 번에 통과, 2 면
  // 첫 표본이 스크럽에 걸려 다시 뽑은 것. 정수 하나이며 본문은 들어가지 않는다.
  'attempts',
  // 게이트 발화 (2026-09-06) — 이 네 키는 진단값으로 **이미 계산되고 있었는데 이 allowlist 에 없어서
  // `redactDiag` 가 통째로 지우고 있었다.** 그래서 "스크러버가 답변을 폐기했다"가 어떤 로그에도 남지
  // 않았다. 전부 닫힌 집합의 식별자·불리언·정수이며 폐기된 본문이나 매칭 토큰은 들어가지 않는다.
  'groundedFallback', // 결정론 조합으로 대체됐는가 (boolean)
  'groundedViolations', // 위반 카테고리 (닫힌 집합, 중복 제거된 목록)
  'groundedViolationCount', // 발화 건수 — 카테고리 목록은 dedupe 되므로 규모가 따로 필요하다
  'groundedGateUnit', // 'answer'(치명적, 전체 폐기) | 'section'(문장/섹션 단위 폐기)
  'safetyRoute', // SELF_HARM | DEATH_LIFESPAN | … — 1389행이 이미 넘기고 있었으나 여기 없어 버려졌다
  'regenerated',
  // ⚠ `llmUnavailable` 은 일부러 빼 두었다 — Edge 가 그 식별자를 담지 않는 것으로 "배달 경로는 하나"가
  // 구조 잠금돼 있고(`consultationDeliveryV6.test.ts`), 관측 목표와도 무관하다.
] as const;
export type SafeDiagKey = (typeof SAFE_DIAG_KEYS)[number];

export function redactDiag(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SAFE_DIAG_KEYS) {
    if (fields[key] !== undefined && fields[key] !== null) out[key] = fields[key];
  }
  return out;
}

// ── 게이트 발화 요약 (2026-09-06) ──────────────────────────────────────────────────────────────
//
// `ai_usage_logs.gate_firings` 에 들어갈 한 덩어리를 만든다. **순수 함수**라 plain-Node 러너가 그대로
// 테스트한다 — 관측 코드가 조용히 틀리는 것이 원래 문제였으므로 이 변환에는 테스트가 붙어야 한다.
//
// ⚠ 개인정보: 규칙 식별자(우리가 정의한 닫힌 집합) · 개수 · 폐기 단위 · 대체 여부만. 폐기된 문장도,
// 매칭된 토큰도 넣지 않는다. 토큰을 넣으면 규칙 오검출을 바로 알 수 있어 유혹적이지만, `untraceableFacts`
// 는 연령대 같은 **모델이 생성한 문자열**도 잡으므로 닫힌 집합이 아니다. 대신 카테고리를 세분화해
// 같은 진단력을 얻는다.
export type GateFiringSummary = {
  v: 1;
  classification: string;
  substituted: 'GROUNDED_COMPOSITION' | 'SEMANTIC_REJECTION_MESSAGE' | null;
  unit: 'answer' | 'section' | null;
  count: number;
  rules: string[];
  safetyRoute?: string;
};

/** 진단값 → 저장 모양. 발화가 하나도 없으면 `null` — 정상 응답에 빈 객체를 쌓지 않는다. */
export function gateFiringSummary(d: {
  outputClassification?: string;
  groundedFallback?: boolean;
  groundedViolations?: readonly string[];
  groundedViolationCount?: number;
  groundedGateUnit?: 'answer' | 'section';
  safetyRoute?: string;
  llmUnavailable?: boolean;
} | null | undefined): GateFiringSummary | null {
  if (!d) return null;
  const rules = [...(d.groundedViolations ?? [])];
  const rejected = d.outputClassification === 'SEMANTIC_REJECTED';
  const routed = typeof d.safetyRoute === 'string' && d.safetyRoute.length > 0;
  // 아무 게이트도 발화하지 않았고 분류도 정상이면 기록할 것이 없다. `llmUnavailable` 은 게이트가 아니라
  // 상류 장애이므로 그것만으로는 행을 만들지 않는다 — 그쪽은 이미 error_code 로 센다.
  if (!d.groundedFallback && rules.length === 0 && !rejected && !routed) return null;
  return {
    v: 1,
    classification: d.outputClassification ?? 'UNKNOWN',
    substituted: d.groundedFallback
      ? 'GROUNDED_COMPOSITION'
      : rejected
        ? 'SEMANTIC_REJECTION_MESSAGE'
        : null,
    unit: d.groundedGateUnit ?? (rejected ? 'answer' : null),
    // 카테고리 목록은 dedupe 돼 있으므로 개수를 따로 받는다. 못 받았으면 최소한 카테고리 수만큼은 났다.
    count: d.groundedViolationCount ?? rules.length,
    rules,
    ...(routed ? { safetyRoute: d.safetyRoute as string } : {}),
  };
}
