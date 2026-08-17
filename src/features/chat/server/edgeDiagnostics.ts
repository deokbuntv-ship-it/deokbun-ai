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
  if (o.text.trim().length === 0) {
    return o.incompleteReason ? `OPENAI_INCOMPLETE_${o.incompleteReason}` : 'OPENAI_EMPTY_OUTPUT';
  }
  return 'OK';
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
] as const;
export type SafeDiagKey = (typeof SAFE_DIAG_KEYS)[number];

export function redactDiag(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SAFE_DIAG_KEYS) {
    if (fields[key] !== undefined && fields[key] !== null) out[key] = fields[key];
  }
  return out;
}
