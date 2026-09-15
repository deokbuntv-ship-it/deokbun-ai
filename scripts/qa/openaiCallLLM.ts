// FINAL DIVINATION CONSULTATION QA V1 — the ONE real outbound LLM call this QA harness makes, mirroring
// `supabase/functions/chat/index.ts`'s `callOpenAI` (lines 140-179) + its `callLLM` closure (lines
// 1211-1221) EXACTLY: same URL, same request shape, same Structured Outputs schema, same failure
// classification — reusing the runtime-neutral, already-unit-tested helpers from `@/features/chat/server`
// rather than re-deriving any of this. The only thing genuinely new here is the `fetch` call itself, since
// the Edge (Deno) is not executable in this workspace.
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import {
  classifyQuestionComplexity,
  consultationResponseFormat,
  consultationWorkload,
  extractResponsesText,
  openAiFailureCode,
  resolveConsultationProfile,
  resolveModelRoute,
} from '@/features/chat/server';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

export type QaLlmOutcome = {
  ok: boolean;
  text: string;
  model: string;
  reasoningEffort: string;
  maxOutputTokens: number;
  failureCode: string | null;
  latencyMs: number;
  usage: Record<string, unknown>;
};

/** Builds a real `callLLM` (per-question tuned exactly like production) for one QA case's question. */
export function buildRealCallLLM(apiKey: string, question: string): { callLLM: (messages: LLMMessage[]) => Promise<string>; meta: () => QaLlmOutcome } {
  const complexity = classifyQuestionComplexity(question);
  const profile = resolveConsultationProfile(complexity);
  const modelRoute = resolveModelRoute(consultationWorkload('solo'));
  let lastMeta: QaLlmOutcome = {
    ok: false, text: '', model: modelRoute.modelId, reasoningEffort: profile.reasoningEffort,
    maxOutputTokens: profile.maxOutputTokens, failureCode: 'NOT_CALLED', latencyMs: 0, usage: {},
  };
  const callLLM = async (messages: LLMMessage[]): Promise<string> => {
    const startedAt = Date.now();
    let res: Response;
    try {
      res = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelRoute.modelId,
          input: messages,
          max_output_tokens: profile.maxOutputTokens,
          reasoning: { effort: profile.reasoningEffort },
          text: { format: consultationResponseFormat() },
        }),
      });
    } catch {
      lastMeta = { ...lastMeta, ok: false, failureCode: 'OPENAI_FETCH_FAILED', latencyMs: Date.now() - startedAt };
      return '';
    }
    if (!res.ok) {
      lastMeta = { ...lastMeta, ok: false, failureCode: `OPENAI_HTTP_${res.status}`, latencyMs: Date.now() - startedAt };
      return '';
    }
    const payload: unknown = await res.json().catch(() => null);
    const usage = (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};
    const rawStatus = (payload as { status?: unknown } | null)?.status;
    const rawReason = (payload as { incomplete_details?: { reason?: unknown } } | null)?.incomplete_details?.reason;
    const text = extractResponsesText(payload);
    const code = openAiFailureCode({
      ok: true, statusCode: res.status, text,
      incompleteReason: typeof rawReason === 'string' ? rawReason : null,
    });
    lastMeta = {
      ok: code === 'OK', text, model: modelRoute.modelId, reasoningEffort: profile.reasoningEffort,
      maxOutputTokens: profile.maxOutputTokens, failureCode: code === 'OK' ? null : code,
      latencyMs: Date.now() - startedAt, usage,
    };
    void rawStatus;
    return code === 'OK' ? text : '';
  };
  return { callLLM, meta: () => lastMeta };
}

/** A small, separate plain-text OpenAI call used ONLY for LLM-as-judge scoring — no Structured Outputs
 *  schema needed (the judge prompt asks for a JSON object it self-describes), no product routing/complexity
 *  tuning (that machinery is specific to the CONSULTATION path, not grading). */
export async function judgeCallLLM(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        // gpt-5-mini bills reasoning tokens as OUTPUT (the same lesson `llmBudget.ts` already encodes for
        // the product's own consultation path) — 1200 truncated/emptied ~8% of judge calls in the first QA
        // run. A structured 9-field JSON verdict + Korean issues/notes prose needs real headroom.
        max_output_tokens: 3000,
        reasoning: { effort: 'low' },
        text: { format: { type: 'json_object' } },
      }),
    });
  } catch {
    return '';
  }
  if (!res.ok) return '';
  const payload: unknown = await res.json().catch(() => null);
  return extractResponsesText(payload);
}
