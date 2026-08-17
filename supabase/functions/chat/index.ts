// DeokbunAI — Chat Edge Function  (Server Trust Boundary — Server-Trust sprint)
//
// This is the ONLY place a real LLM provider is called AND — as of the server-trust sprint — the ONLY
// place the authoritative deterministic grounding is built. The client is authoritative for NOTHING
// deterministic (§7/§8): it sends birth INPUT + a question + untrusted prior turns. The SERVER recomputes
// every fact, builds the grounding + system prompt, calls OpenAI, validates the output, and returns a
// bounded result. A modified client can no longer fabricate SAJU/Ziwei/Qimen facts, availability,
// provenance, or "세 학문 일치" consensus.
//
// Principles enforced here:
// - OpenAI API key lives only in server secrets (never in the client).
// - Only authenticated Supabase users may call this function (`withSupabase({ auth: 'user' })`,
//   platform `verify_jwt = true`).
// - The client CANNOT send messages/grounding/system prompts. The server builds them from input.        [§8]
// - The question time (Qimen + current-year 세운/월운) is the SERVER receipt time, not the client clock.  [§10]
// - The model + output-token limit are server-decided.
// - Per-user burst rate limit runs before any paid LLM call, reusing ai_usage_logs.
//
// Runtime: Supabase Edge Functions (Deno). Excluded from the app tsconfig; never bundled by Metro. It
// imports the app's runtime-neutral orchestrator via the sibling deno.json import map ('@/' → src).
// NOTE: engine execution under Deno is UNVERIFIED in this workspace (no deno/supabase CLI) —
// EDGE_RUNTIME_NOT_EXECUTED; the orchestrator logic itself is verified under Node/Jest.

// Pinned for reproducible Edge builds: @supabase/supabase-js to the app's exact locked version
// (package-lock: 2.112.1), and @supabase/server (a Deno-only helper, not in the app lockfile) to the
// owner-verified current version 1.4.1.
import { withSupabase } from 'npm:@supabase/server@1.4.1';
import { createClient } from 'npm:@supabase/supabase-js@2.112.1';

// Explicit /index.ts on the one VALUE import into the app graph (the directory the bundler flagged).
// Everything deeper (108-file graph) resolves via `sloppy-imports` in deno.json.
import { buildServerConsultation, buildServerSummary } from '@/features/chat/server/index.ts';
import type { TrustedBirthResolution } from '@/features/chat/server/index.ts';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import type { BirthInfoDraft } from '@/features/consultation';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5-mini';
const DEFAULT_MAX_OUTPUT_TOKENS = 800;

function readServerConfig() {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
  const model = Deno.env.get('LLM_MODEL')?.trim() || DEFAULT_MODEL;
  const rawMaxOutputTokens = Deno.env.get('LLM_MAX_OUTPUT_TOKENS')?.trim();
  const parsed = Number(rawMaxOutputTokens);
  const maxOutputTokens =
    Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_MAX_OUTPUT_TOKENS;
  return { apiKey, model, maxOutputTokens };
}

// Deno-native DigestProvider (Web Crypto). Byte-identical hex to the app's Node provider
// (createHash('sha256').update(x,'utf8').digest('hex')) so the frozen engine's fingerprint is stable.
const denoDigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },
};

function extractText(payload: unknown): string {
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

// The one outbound provider call, shared by the consultation + summary paths. Throws OpenAIFault (with a
// stable code) on any transport/HTTP fault so callers can map it uniformly.
class OpenAIFault extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.name = 'OpenAIFault';
    this.code = code;
  }
}
async function callOpenAI(
  messages: LLMMessage[],
  cfg: { apiKey: string; model: string; maxOutputTokens: number },
): Promise<{ text: string; usage: Record<string, unknown> }> {
  let providerResponse: Response;
  try {
    providerResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, input: messages, max_output_tokens: cfg.maxOutputTokens }),
    });
  } catch {
    throw new OpenAIFault('OPENAI_FETCH_FAILED');
  }
  if (!providerResponse.ok) throw new OpenAIFault(`OPENAI_${providerResponse.status}`);
  const payload = await providerResponse.json();
  const usage = (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};
  return { text: extractText(payload), usage };
}

// ---- trusted profile resolution (§9/§25) ------------------------------------
// Map a server-owned consumer_birth_profiles row → BirthInfoDraft. Because the Edge uses the
// service_role client (which BYPASSES RLS), the owner check below is REQUIRED, not optional.
function rowToBirthInfo(row: Record<string, unknown>): BirthInfoDraft {
  const s = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
  return {
    displayName: s(row.display_name),
    gender: (row.gender as BirthInfoDraft['gender']) ?? null,
    calendarType: (row.calendar_type as BirthInfoDraft['calendarType']) ?? null,
    lunarMonthType: (row.lunar_month_type as BirthInfoDraft['lunarMonthType']) ?? null,
    birthYear: s(row.birth_year),
    birthMonth: s(row.birth_month),
    birthDay: s(row.birth_day),
    birthTimeAccuracy: (row.birth_time_accuracy as BirthInfoDraft['birthTimeAccuracy']) ?? null,
    birthHour: s(row.birth_hour),
    birthMinute: s(row.birth_minute),
    approximateTimePeriod: (row.approximate_time_period as BirthInfoDraft['approximateTimePeriod']) ?? null,
    birthPlace: s(row.birth_place),
  };
}

function makeResolveTrustedBirth(
  userId: string | null,
  admin: ReturnType<typeof createClient> | null,
): (subjectProfileId: string) => Promise<TrustedBirthResolution> {
  return async (subjectProfileId: string) => {
    if (!userId || !admin) return { status: 'FORBIDDEN' };
    try {
      const { data, error } = await admin
        .from('consumer_birth_profiles')
        .select('*')
        .eq('id', subjectProfileId)
        .maybeSingle();
      if (error || !data) return { status: 'NOT_FOUND' };
      // Service role bypasses RLS → verify ownership in code (defense in depth, §25).
      if ((data as { owner_user_id?: unknown }).owner_user_id !== userId) return { status: 'FORBIDDEN' };
      return {
        status: 'RESOLVED',
        birthInfo: rowToBirthInfo(data as Record<string, unknown>),
        subjectLabel:
          ((data as { subject_label?: string | null }).subject_label ??
            (data as { display_name?: string | null }).display_name) ?? null,
      };
    } catch {
      return { status: 'NOT_FOUND' }; // fail closed
    }
  };
}

// ---- AI usage logging -------------------------------------------------------
type AiUsageLog = {
  user_id: string | null;
  model: string | null;
  request_type: 'chat';
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  latency_ms: number;
  status: 'success' | 'error';
  error_code: string | null;
};
function toNullableInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : null;
}
function sanitizeRequestId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return null;
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null;
}
function userIdFromRequest(req: Request): string | null {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { sub?: unknown };
    return typeof decoded.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}
function adminClient(): ReturnType<typeof createClient> | null {
  const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
  if (url.length === 0 || serviceRoleKey.length === 0) return null;
  return createClient(url, serviceRoleKey);
}
async function logAiUsage(entry: AiUsageLog, requestId: string | null): Promise<void> {
  try {
    const admin = adminClient();
    if (!admin) return;
    if (requestId) {
      const { error } = await admin.from('ai_usage_logs').insert({ ...entry, request_id: requestId });
      if (!error) return;
    }
    await admin.from('ai_usage_logs').insert(entry);
  } catch {
    // Usage logging must never affect the chat response.
  }
}

// ---- burst rate limiting ----------------------------------------------------
const RATE_WINDOW_MS = (() => {
  const v = Number(Deno.env.get('CHAT_RATE_WINDOW_MS')?.trim());
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 60_000;
})();
const RATE_MAX_REQUESTS = (() => {
  const v = Number(Deno.env.get('CHAT_RATE_MAX_REQUESTS')?.trim());
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 20;
})();
type RateVerdict = { limited: false } | { limited: true; retryAfterMs: number };
async function checkBurstRateLimit(userId: string | null, now: number): Promise<RateVerdict> {
  if (!userId) return { limited: false };
  try {
    const admin = adminClient();
    if (!admin) return { limited: false };
    const cutoffIso = new Date(now - RATE_WINDOW_MS).toISOString();
    const { count, error } = await admin
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('request_type', 'chat')
      .gte('created_at', cutoffIso);
    if (error || count === null) return { limited: false };
    if (count >= RATE_MAX_REQUESTS) return { limited: true, retryAfterMs: RATE_WINDOW_MS };
    return { limited: false };
  } catch {
    return { limited: false };
  }
}

// ---- request contract (§7) --------------------------------------------------
// The client sends ONLY untrusted inputs. No messages / grounding / system prompt.
//   mode 'consultation' (default): birthInput + question + untrusted turns → server grounds + answers.
//   mode 'summary': existingSummary + raw turns → the SERVER builds the summary prompt (§20).
type ConsultationRequestBody = {
  mode?: 'consultation' | 'summary';
  subjectProfileId?: string | null;
  birthInput?: unknown;
  subjectLabel?: string | null;
  question?: unknown;
  conversationContext?: unknown;
  requestMetadata?: { clientQuestionTimeEpoch?: number | null; requestId?: string | null } | null;
  // summary mode only
  existingSummary?: unknown;
  turns?: unknown;
};

const REASON_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  SUBJECT_FORBIDDEN: 403,
  SUBJECT_NOT_FOUND: 404,
  LLM_FAILED: 502,
};

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      let stage = 'auth_completed';
      const startedAt = Date.now();
      const userId = userIdFromRequest(req);

      try {
        if (req.method !== 'POST') {
          return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
        }

        const rate = await checkBurstRateLimit(userId, startedAt);
        if (rate.limited) {
          console.error('[chat] rate_limited', JSON.stringify({ retryAfterMs: rate.retryAfterMs }));
          return Response.json(
            { error: 'RATE_LIMITED', retryAfterMs: rate.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)) } },
          );
        }

        const { apiKey, model, maxOutputTokens } = readServerConfig();
        if (apiKey.length === 0) {
          console.error('[chat] server_not_configured');
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        let body: ConsultationRequestBody;
        try {
          body = (await req.json()) as ConsultationRequestBody;
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }
        if (body === null || typeof body !== 'object') {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const cfg = { apiKey, model, maxOutputTokens };
        const requestId = sanitizeRequestId(body.requestMetadata?.requestId);

        // Summary mode (FIX A/B/C): the SERVER owns the summary prompt (buildServerSummary → existingSummary
        // is untrusted content, never system) and applies hard input bounds server-side. Usage is logged
        // exactly like consultation so summary calls COUNT toward the ai_usage_logs burst window — no
        // rate-limit bypass, no double count.
        if (body.mode === 'summary') {
          stage = 'summary_request';
          let summaryUsage: Record<string, unknown> = {};
          let summaryErrorCode: string | null = null;
          const summaryCallLLM = async (messages: LLMMessage[]): Promise<string> => {
            try {
              const r = await callOpenAI(messages, cfg);
              summaryUsage = r.usage;
              return r.text;
            } catch (e) {
              summaryErrorCode = e instanceof OpenAIFault ? e.code : 'LLM_FAILED';
              console.error('[chat] summary_openai_fault', JSON.stringify({ requestId, code: summaryErrorCode }));
              throw e;
            }
          };
          const summary = await buildServerSummary(
            {
              existingSummary: typeof body.existingSummary === 'string' ? body.existingSummary : null,
              turns: body.turns,
            },
            { callLLM: summaryCallLLM },
          );
          if (!summary.ok) {
            if (summary.reason === 'LLM_FAILED') {
              // OpenAI WAS attempted → log the error (consistent with consultation; counts in the window).
              await logAiUsage(
                {
                  user_id: userId, model, request_type: 'chat',
                  input_tokens: null, output_tokens: null, total_tokens: null,
                  latency_ms: Date.now() - startedAt, status: 'error',
                  error_code: summaryErrorCode ?? 'LLM_FAILED',
                },
                requestId,
              );
              return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
            }
            // INVALID_INPUT: pre-flight (no OpenAI call) → no usage row, matching consultation's policy.
            return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
          }
          // Success → log usage exactly once (FIX C: summary now counts toward the burst window).
          await logAiUsage(
            {
              user_id: userId, model, request_type: 'chat',
              input_tokens: toNullableInt(summaryUsage.input_tokens),
              output_tokens: toNullableInt(summaryUsage.output_tokens),
              total_tokens: toNullableInt(summaryUsage.total_tokens),
              latency_ms: Date.now() - startedAt, status: 'success', error_code: null,
            },
            requestId,
          );
          return Response.json({ text: summary.text });
        }

        if (typeof body.question !== 'string') {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        // The single outbound trust exit. Captures usage for logging; throws on provider fault so the
        // orchestrator maps it to LLM_FAILED (and we log the specific code here).
        let capturedUsage: Record<string, unknown> = {};
        let llmErrorCode: string | null = null;
        const callLLM = async (messages: LLMMessage[]): Promise<string> => {
          stage = 'openai_request';
          try {
            const r = await callOpenAI(messages, cfg);
            capturedUsage = r.usage;
            stage = 'response_parse';
            return r.text;
          } catch (e) {
            llmErrorCode = e instanceof OpenAIFault ? e.code : 'LLM_FAILED';
            console.error('[chat] openai_fault', JSON.stringify({ stage, requestId, code: llmErrorCode }));
            throw e;
          }
        };

        stage = 'server_consultation';
        const result = await buildServerConsultation(
          {
            subjectProfileId: body.subjectProfileId ?? null,
            birthInput: body.birthInput as BirthInfoDraft,
            subjectLabel: body.subjectLabel ?? null,
            question: body.question,
            conversationContext: Array.isArray(body.conversationContext)
              ? (body.conversationContext as { role: 'user' | 'assistant'; content: string }[])
              : undefined,
            requestMetadata: {
              clientQuestionTimeEpoch: body.requestMetadata?.clientQuestionTimeEpoch ?? null,
              requestId,
            },
          },
          {
            digestProvider: denoDigestProvider,
            nowEpochSeconds: Math.floor(startedAt / 1000), // SERVER receipt time (§10)
            callLLM,
            resolveTrustedBirth: makeResolveTrustedBirth(userId, adminClient()),
          },
        );

        if (!result.ok) {
          const status = REASON_STATUS[result.reason] ?? 500;
          if (result.reason === 'LLM_FAILED') {
            await logAiUsage(
              {
                user_id: userId, model, request_type: 'chat',
                input_tokens: null, output_tokens: null, total_tokens: null,
                latency_ms: Date.now() - startedAt, status: 'error',
                error_code: llmErrorCode ?? 'LLM_FAILED',
              },
              requestId,
            );
            return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
          }
          return Response.json({ error: result.reason }, { status });
        }

        await logAiUsage(
          {
            user_id: userId, model, request_type: 'chat',
            input_tokens: toNullableInt(capturedUsage.input_tokens),
            output_tokens: toNullableInt(capturedUsage.output_tokens),
            total_tokens: toNullableInt(capturedUsage.total_tokens),
            latency_ms: Date.now() - startedAt, status: 'success', error_code: null,
          },
          requestId,
        );

        // Bounded response (§17): server-validated text + optional structured view-model + safe meta.
        return Response.json({
          text: result.text,
          ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
          groundingMeta: result.groundingMeta,
        });
      } catch (error) {
        console.error(
          '[chat] unhandled_exception',
          JSON.stringify({
            stage,
            name: (error as Error)?.name ?? 'UnknownError',
            message: (error as Error)?.message ?? String(error),
          }),
        );
        throw error;
      }
    },
  ),
};
