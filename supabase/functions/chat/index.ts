// DeokbunAI — Chat Edge Function
//
// This is the ONLY place a real LLM provider is called (server trust boundary).
//
// Principles enforced here:
// - OpenAI API key lives only in server secrets (never in the client).           [Sprint 2-19 #1, #6]
// - Only authenticated Supabase users may call this function.                     [#3, #4]
//   Auth uses the recommended `withSupabase({ auth: 'user' })` wrapper with the
//   platform-level `verify_jwt = true`; unauthenticated requests are rejected
//   before this handler runs.
// - The client only sends `messages`. The MODEL and OUTPUT TOKEN LIMIT are
//   decided by the server (env/secret), so the client cannot inflate cost.       [#15, #16, #17]
// - A per-user burst Rate Limit runs at the top of this handler (before any LLM
//   call) using the existing ai_usage_logs table; fail-open, no new infra.       [#13]
//
// Logging policy: the success path is silent. Only failure paths log, via
// `console.error`, and never include secrets, tokens, the Authorization header,
// the user JWT, the request body, or the full OpenAI response body — only a
// stage marker, HTTP status, or exception name/message.
//
// Runtime: Supabase Edge Functions (Deno). This file is intentionally excluded
// from the app's TypeScript project (see tsconfig `exclude`) and is never bundled
// by Metro — it runs only on Supabase.

import { withSupabase } from 'npm:@supabase/server';
import { createClient } from 'npm:@supabase/supabase-js';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5-mini';
const DEFAULT_MAX_OUTPUT_TOKENS = 800;

function readServerConfig() {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
  const model = Deno.env.get('LLM_MODEL')?.trim() || DEFAULT_MODEL;

  const rawMaxOutputTokens = Deno.env.get('LLM_MAX_OUTPUT_TOKENS')?.trim();
  const parsedMaxOutputTokens = Number(rawMaxOutputTokens);
  const maxOutputTokens =
    Number.isFinite(parsedMaxOutputTokens) && parsedMaxOutputTokens > 0
      ? Math.floor(parsedMaxOutputTokens)
      : DEFAULT_MAX_OUTPUT_TOKENS;

  return { apiKey, model, maxOutputTokens };
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (message) =>
        message !== null &&
        typeof message === 'object' &&
        (message.role === 'system' ||
          message.role === 'user' ||
          message.role === 'assistant') &&
        typeof message.content === 'string',
    )
  );
}

// Extract assistant text from the raw Responses API JSON.
// The raw HTTP response exposes an `output` array; the assistant text lives in a
// `message` item's `output_text` content parts. `output_text` at the top level
// is an SDK convenience and may be absent in the raw payload, so it is only a
// fallback here.
function extractText(payload: unknown): string {
  const output = (payload as { output?: unknown } | null)?.output;

  if (Array.isArray(output)) {
    const parts: string[] = [];

    for (const item of output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const contentPart of item.content) {
          if (
            contentPart?.type === 'output_text' &&
            typeof contentPart.text === 'string'
          ) {
            parts.push(contentPart.text);
          }
        }
      }
    }

    const joined = parts.join('').trim();
    if (joined.length > 0) {
      return joined;
    }
  }

  const convenience = (payload as { output_text?: unknown } | null)?.output_text;
  if (typeof convenience === 'string' && convenience.trim().length > 0) {
    return convenience.trim();
  }

  return '';
}

// ---- AI usage logging (ADMIN-04) --------------------------------------------
// Fail-safe, server-side only. Writes public.ai_usage_logs via the service_role
// key (auto-injected into Edge Functions). It NEVER blocks or fails the chat
// response — every path swallows its own errors. The user id is read from the
// already-verified JWT `sub` claim (no extra network call). Only raw usage is
// stored; no cost/price calculation happens here.
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
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.trunc(value)
    : null;
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

async function logAiUsage(entry: AiUsageLog): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
    const serviceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
    if (url.length === 0 || serviceRoleKey.length === 0) {
      return;
    }
    const admin = createClient(url, serviceRoleKey);
    await admin.from('ai_usage_logs').insert(entry);
  } catch {
    // Usage logging must never affect the chat response.
  }
}

// ---- burst rate limiting (Sprint 2-13, directive §2-A) ----------------------
// Server-side abuse guard: caps sustained per-user request volume in a sliding
// window BEFORE any paid LLM call. It reuses the EXISTING public.ai_usage_logs
// table (no new infra / no Redis) — counting this user's chat rows written in
// the last window. This is NOT a UX quota (free beta is not throttled); it only
// blunts burst / runaway-cost abuse. Deterministic policy mirrors the pure
// module src/features/analysis/rateLimit.ts (DEFAULT_RATE_LIMIT). Denials use
// the standard Error Contract token RATE_LIMITED (→ LLM_RATE_LIMIT client-side).
//
// FAIL-OPEN by design: any infra error here must never block a legitimate user,
// so the guard is skipped (request allowed) on error. Denials are console-logged
// only and are NOT written to ai_usage_logs — a denial must not feed back into
// the window count and extend its own block.
const RATE_WINDOW_MS = (() => {
  const v = Number(Deno.env.get('CHAT_RATE_WINDOW_MS')?.trim());
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 60_000;
})();
const RATE_MAX_REQUESTS = (() => {
  const v = Number(Deno.env.get('CHAT_RATE_MAX_REQUESTS')?.trim());
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 20;
})();

type RateVerdict = { limited: false } | { limited: true; retryAfterMs: number };

async function checkBurstRateLimit(
  userId: string | null,
  now: number,
): Promise<RateVerdict> {
  // No attributable user → the auth wrapper already gated the request; allow.
  if (!userId) return { limited: false };
  try {
    const url = Deno.env.get('SUPABASE_URL')?.trim() ?? '';
    const serviceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? '';
    if (url.length === 0 || serviceRoleKey.length === 0) {
      return { limited: false };
    }
    const admin = createClient(url, serviceRoleKey);
    const cutoffIso = new Date(now - RATE_WINDOW_MS).toISOString();
    const { count, error } = await admin
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('request_type', 'chat')
      .gte('created_at', cutoffIso);
    if (error || count === null) {
      return { limited: false }; // fail-open on query error
    }
    if (count >= RATE_MAX_REQUESTS) {
      return { limited: true, retryAfterMs: RATE_WINDOW_MS };
    }
    return { limited: false };
  } catch {
    return { limited: false }; // fail-open on any infra error
  }
}

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      // `stage` is tracked so an unhandled exception can be attributed to a step.
      let stage = 'auth_completed';
      const startedAt = Date.now();
      const userId = userIdFromRequest(req);

      try {
        if (req.method !== 'POST') {
          return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
        }

        // Rate Limit (#13, directive §2-A): burst guard BEFORE any paid LLM call.
        // Fail-open; standard Error Contract token; no ai_usage_logs row written.
        const rate = await checkBurstRateLimit(userId, startedAt);
        if (rate.limited) {
          console.error(
            '[chat] rate_limited',
            JSON.stringify({ retryAfterMs: rate.retryAfterMs }),
          );
          return Response.json(
            { error: 'RATE_LIMITED', retryAfterMs: rate.retryAfterMs },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)),
              },
            },
          );
        }

        const { apiKey, model, maxOutputTokens } = readServerConfig();

        if (apiKey.length === 0) {
          // Missing secret — do not leak configuration details to the client.
          console.error('[chat] server_not_configured');
          return Response.json({ error: 'SERVER_NOT_CONFIGURED' }, { status: 500 });
        }

        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        const messages = (body as { messages?: unknown } | null)?.messages;
        if (!isValidMessages(messages)) {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }

        stage = 'openai_request';

        let providerResponse: Response;
        try {
          providerResponse = await fetch(OPENAI_RESPONSES_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model, // server-decided (#15, #17)
              input: messages,
              max_output_tokens: maxOutputTokens, // server-enforced (#16, #17)
            }),
          });
        } catch (fetchError) {
          // Network/transport failure before any HTTP status was received.
          console.error(
            '[chat] openai_fetch_threw',
            JSON.stringify({
              stage,
              name: (fetchError as Error)?.name ?? 'UnknownError',
              message: (fetchError as Error)?.message ?? String(fetchError),
            }),
          );
          await logAiUsage({
            user_id: userId,
            model,
            request_type: 'chat',
            input_tokens: null,
            output_tokens: null,
            total_tokens: null,
            latency_ms: Date.now() - startedAt,
            status: 'error',
            error_code: 'OPENAI_FETCH_FAILED',
          });
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        if (!providerResponse.ok) {
          // Fault tracking: HTTP status ONLY (e.g. 429 billing/quota, 401, 5xx).
          // Never forward the provider's error body/URL/token to the client (#20).
          console.error(
            '[chat] openai_error_status',
            JSON.stringify({ status: providerResponse.status }),
          );
          await logAiUsage({
            user_id: userId,
            model,
            request_type: 'chat',
            input_tokens: null,
            output_tokens: null,
            total_tokens: null,
            latency_ms: Date.now() - startedAt,
            status: 'error',
            error_code: `OPENAI_${providerResponse.status}`,
          });
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        stage = 'response_parse';

        let payload: unknown;
        try {
          payload = await providerResponse.json();
        } catch {
          return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
        }

        const text = extractText(payload);

        if (text.length === 0) {
          // Fault tracking: no assistant text parsed (marker only, no content).
          console.error('[chat] empty_response');
          await logAiUsage({
            user_id: userId,
            model,
            request_type: 'chat',
            input_tokens: null,
            output_tokens: null,
            total_tokens: null,
            latency_ms: Date.now() - startedAt,
            status: 'error',
            error_code: 'EMPTY_RESPONSE',
          });
          return Response.json({ error: 'EMPTY_RESPONSE' }, { status: 502 });
        }

        // Success: record raw usage (tokens are provider-reported; no cost calc).
        const usage =
          (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};
        await logAiUsage({
          user_id: userId,
          model,
          request_type: 'chat',
          input_tokens: toNullableInt(usage.input_tokens),
          output_tokens: toNullableInt(usage.output_tokens),
          total_tokens: toNullableInt(usage.total_tokens),
          latency_ms: Date.now() - startedAt,
          status: 'success',
          error_code: null,
        });

        return Response.json({ text });
      } catch (error) {
        // Fault tracking: capture the failing stage + exception identity, then
        // re-throw to preserve the platform's EDGE_FUNCTION_ERROR behavior.
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
