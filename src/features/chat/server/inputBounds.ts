// Server-authoritative input bounds + the paid-LLM request-type set (cost/abuse hardening, §A2/§A3).
//
// WHY: the client UI has a maxLength, but the SERVER must not trust it — a modified client can send an
// arbitrarily large question / context and inflate prompt (input-token) cost, or spam a workload the burst
// limiter does not count. These ceilings are enforced at the Edge boundary BEFORE any grounding/LLM work.
// Generous enough for real consultation use (a normal question is well under these); the point is to reject
// clearly abusive payloads, never to truncate meaning.
//
// This module is pure + jest-tested and lives in the server graph, so it is bundled into the Edge and its
// behavior is verified under Node even though the Deno Edge runtime itself is not executed here.

export const MAX_QUESTION_CHARS = 2000;
export const MAX_CONTEXT_ITEMS = 100;
export const MAX_CONTEXT_ITEM_CHARS = 4000;
export const MAX_LABEL_CHARS = 160;
export const MAX_BIRTH_FIELD_CHARS = 256;
export const MAX_REQUEST_BODY_CHARS = 100_000;
export const MAX_REQUEST_BODY_BYTES = 120_000;

// Every request_type that results in a paid LLM call. The burst limiter counts ALL of these against one
// window so 오늘의 운세 / 이번 달 운세 generations are throttled like consultations — closing the gap where
// only request_type='chat' was counted and fortune generation was effectively unbounded (§A2). (Summary and
// compatibility are logged as 'chat', so they are already covered by that member.)
export const LLM_RATE_LIMITED_REQUEST_TYPES = ['chat', 'today_fortune', 'monthly_fortune'] as const;

export type InputBoundsVerdict = { ok: true } | { ok: false; code: 'REQUEST_TOO_LARGE' };

function strTooLong(v: unknown, max: number): boolean {
  return typeof v === 'string' && v.length > max;
}
function arrTooLong(v: unknown, max: number): boolean {
  return Array.isArray(v) && v.length > max;
}

// Bound the untrusted, LLM-bound free-text/array fields of a consultation/fortune request. Only rejects
// clearly oversized input; shape/semantic validation happens downstream. Never truncates — returns a typed
// REQUEST_TOO_LARGE (413) so meaning is never silently altered.
export function validateConsultationInputBounds(body: unknown): InputBoundsVerdict {
  const b = (body ?? {}) as Record<string, unknown>;
  try {
    const serialized = JSON.stringify(body);
    if (typeof serialized === 'string' && serialized.length > MAX_REQUEST_BODY_CHARS) {
      return { ok: false, code: 'REQUEST_TOO_LARGE' };
    }
  } catch {
    return { ok: false, code: 'REQUEST_TOO_LARGE' };
  }
  if (strTooLong(b.question, MAX_QUESTION_CHARS)) return { ok: false, code: 'REQUEST_TOO_LARGE' };
  if (strTooLong(b.subjectLabel, MAX_LABEL_CHARS) || strTooLong(b.partnerLabel, MAX_LABEL_CHARS)) {
    return { ok: false, code: 'REQUEST_TOO_LARGE' };
  }
  if (strTooLong(b.conversationSummary, MAX_CONTEXT_ITEM_CHARS)
      || strTooLong(b.existingSummary, MAX_CONTEXT_ITEM_CHARS)) {
    return { ok: false, code: 'REQUEST_TOO_LARGE' };
  }
  for (const birth of [b.birthInput, b.partnerBirthInput]) {
    if (birth && typeof birth === 'object' && !Array.isArray(birth)) {
      for (const value of Object.values(birth as Record<string, unknown>)) {
        if (strTooLong(value, MAX_BIRTH_FIELD_CHARS)) return { ok: false, code: 'REQUEST_TOO_LARGE' };
      }
    }
  }
  if (arrTooLong(b.conversationContext, MAX_CONTEXT_ITEMS)) return { ok: false, code: 'REQUEST_TOO_LARGE' };
  if (arrTooLong(b.turns, MAX_CONTEXT_ITEMS)) return { ok: false, code: 'REQUEST_TOO_LARGE' };
  for (const arr of [b.conversationContext, b.turns]) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        const t = item as { text?: unknown; content?: unknown } | null;
        if (t && (strTooLong(t.text, MAX_CONTEXT_ITEM_CHARS) || strTooLong(t.content, MAX_CONTEXT_ITEM_CHARS))) {
          return { ok: false, code: 'REQUEST_TOO_LARGE' };
        }
      }
    }
  }
  return { ok: true };
}
