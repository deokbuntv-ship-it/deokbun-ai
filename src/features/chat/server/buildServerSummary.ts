// Server-owned conversation summary (Server-Trust summary closure FIX A/B). Runtime-neutral (pure TS +
// injected callLLM) so the Edge and Node/Jest run the identical bounding + trust logic.
//
// Memory compression carries NO deterministic facts, but it is still a client-fed LLM call, so the server
// (a) owns the summary system instruction 100% (via buildSummaryPrompt — existingSummary is user content,
// never system), and (b) applies HARD input bounds here (never trusting client-side limits): turn count,
// per-turn chars, prior-summary chars, and total source size; and drops any non user/assistant role.
import { buildSummaryPrompt } from '@/features/chat/prompts/summaryPromptBuilder';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';

// Conservative server-side bounds (fixed by tests). Summaries are short + internal; these blunt oversized
// or abusive payloads regardless of what the client claims.
export const MAX_SUMMARY_TURNS = 40;
export const MAX_SUMMARY_TURN_CHARS = 4000;
export const MAX_EXISTING_SUMMARY_CHARS = 4000;
export const MAX_SUMMARY_SOURCE_CHARS = 24000;

export type ServerSummaryTurn = { role: 'user' | 'assistant'; content: string };
export type ServerSummaryRequest = { existingSummary?: string | null; turns?: unknown };
export type ServerSummaryDeps = { callLLM: (messages: LLMMessage[]) => Promise<string> };
export type ServerSummaryResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'INVALID_INPUT' | 'LLM_FAILED' };

// Sanitize + bound the summary source, server-side. Exported for direct testing.
export function sanitizeSummarySource(request: ServerSummaryRequest): {
  existingSummary: string | null;
  turns: ChatMessage[];
} {
  // Prior summary: bound its length (untrusted; the prompt builder additionally keeps it non-system).
  let existingSummary: string | null =
    typeof request.existingSummary === 'string' && request.existingSummary.trim().length > 0
      ? request.existingSummary.slice(0, MAX_EXISTING_SUMMARY_CHARS)
      : null;

  // Turns: keep the most recent MAX_SUMMARY_TURNS; role must be user/assistant (drops system/developer/
  // tool/anything else — a client cannot smuggle a system instruction through the summary source).
  const rawTurns = Array.isArray(request.turns) ? request.turns : [];
  const turns: ChatMessage[] = [];
  for (const t of rawTurns.slice(-MAX_SUMMARY_TURNS)) {
    if (t === null || typeof t !== 'object') continue;
    const role = (t as { role?: unknown }).role;
    if (role !== 'user' && role !== 'assistant') continue;
    const content = (t as { content?: unknown }).content;
    if (typeof content !== 'string') continue;
    const text = content.slice(0, MAX_SUMMARY_TURN_CHARS);
    if (text.trim().length === 0) continue;
    turns.push({ id: `sum-${turns.length}`, role, text });
  }

  // Aggregate bound: drop the OLDEST turns until the total source size fits. (Per-item caps already ran,
  // so existingSummary ≤ MAX_EXISTING_SUMMARY_CHARS ≤ MAX_SUMMARY_SOURCE_CHARS and cannot overflow alone.)
  const sourceLen = () =>
    (existingSummary?.length ?? 0) + turns.reduce((n, m) => n + m.text.length, 0);
  while (turns.length > 0 && sourceLen() > MAX_SUMMARY_SOURCE_CHARS) turns.shift();

  return { existingSummary, turns };
}

export async function buildServerSummary(
  request: ServerSummaryRequest,
  deps: ServerSummaryDeps,
): Promise<ServerSummaryResult> {
  const { existingSummary, turns } = sanitizeSummarySource(request);
  // Nothing summarizable after sanitization → INVALID_INPUT (pre-flight; no LLM call, no usage).
  if (turns.length === 0) return { ok: false, reason: 'INVALID_INPUT' };

  let raw: string;
  try {
    raw = await deps.callLLM(buildSummaryPrompt(existingSummary, turns));
  } catch {
    return { ok: false, reason: 'LLM_FAILED' };
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) return { ok: false, reason: 'LLM_FAILED' };
  return { ok: true, text: raw };
}
