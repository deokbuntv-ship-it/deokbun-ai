// DeokbunAI — Chat Edge Function  (Server Trust Boundary — Server-Trust sprint)
//
// This is the ONLY place a real LLM provider is called AND — as of the server-trust sprint — the ONLY
// place the authoritative deterministic grounding is built. The client is authoritative for NOTHING
// deterministic (§7/§8): it sends a question + untrusted prior turns. The SERVER resolves canonical SELF,
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
// - An atomic DB reservation runs before every paid LLM call; cache hits need no reservation.
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

// The server orchestrator + its whole runtime-neutral graph (108 files incl. the FROZEN Saju engine) is
// pre-bundled by esbuild into ONE Deno-safe ESM file (build: _server/build.mjs). Deno's Edge runtime
// rejects the app's Node/Metro-style extensionless + directory imports and does NOT honor sloppy-imports,
// so the Edge imports the single generated bundle instead. The 3 engine deps stay external → resolved by
// deno.json to pinned npm: specifiers. No app-SOURCE import remains in this file.
import {
  buildServerConsultation,
  buildCompatibilityConsultation,
  parseDecisionMeta,
  buildTodayFortune,
  dailyFortuneResponseFormat,
  buildMonthlyFortune,
  monthlyFortuneResponseFormat,
  buildServerSummary,
  classifyQuestionComplexity,
  consultationResponseFormat,
  extractResponsesText,
  openAiFailureCode,
  parseUsageDetails,
  redactDiag,
  resolveConsultationProfile,
  resolveLlmBudgets,
  runCanonicalGeneration,
  validateConsultationInputBounds,
  TODAY_CANONICAL_VERSION,
  MONTHLY_CANONICAL_VERSION,
  fortuneDateStringFromEpoch,
  currentTargetMonth,
  monthKey,
  MAX_REQUEST_BODY_BYTES,
} from './_server/serverBundle.mjs';
import {
  globalSpendGuardFailure,
  reserveGlobalPaidGeneration,
  type GlobalSpendGuardVerdict,
} from '../_shared/globalSpendGuard.ts';

// Types the Edge's own locals reference. Kept INLINE (not imported from @/) so this file exposes NO
// extensionless/directory/@/ specifier to Deno. They mirror the source contracts; the authoritative
// shapes are enforced at runtime by the bundled buildServerConsultation/buildServerSummary.
type LLMMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type BirthInfoDraft = {
  displayName: string;
  gender: 'male' | 'female' | null;
  calendarType: 'solar' | 'lunar' | null;
  lunarMonthType: 'regular' | 'leap' | null;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTimeAccuracy: 'exact' | 'approximate' | 'unknown' | null;
  birthHour: string;
  birthMinute: string;
  approximateTimePeriod: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | null;
  birthPlace: string;
};
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5-mini';
const REQUIRED_TERMS_VERSION = '2026-08-v1';
const CURRENT_TIER = 'FREE';

// apiKey + model + the two per-path OUTPUT-token budgets. resolveLlmBudgets (bundled, bounded) gives the
// consultation long-form and the summary DIFFERENT caps — a shared 800 made gpt-5-mini return
// status=incomplete (reasoning ate the budget). Model is unchanged; env vars can tune within hard bounds.
function readServerConfig() {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim() ?? '';
  const model = Deno.env.get('LLM_MODEL')?.trim() || DEFAULT_MODEL;
  const budgets = resolveLlmBudgets({
    consultation: Deno.env.get('LLM_CONSULTATION_MAX_OUTPUT_TOKENS'),
    summary: Deno.env.get('LLM_SUMMARY_MAX_OUTPUT_TOKENS'),
  });
  return { apiKey, model, budgets };
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

// extractResponsesText / openAiFailureCode / redactDiag are imported from the bundle (unit-tested in Jest).

// SAFE diagnostic line (§F). redactDiag keeps ONLY an allowlist of non-sensitive fields — never the
// prompt, birth data, question, engine evidence, API key, auth header, or the OpenAI response text.
type DiagStage =
  | 'AUTH' | 'INPUT' | 'PROFILE_RESOLUTION' | 'GROUNDING'
  | 'OPENAI_REQUEST' | 'OPENAI_RESPONSE' | 'RESPONSE_VALIDATION' | 'USAGE_LOG';
function logDiag(requestId: string | null, stage: DiagStage, code: string, extra?: Record<string, unknown>) {
  console.error('[chat.diag]', JSON.stringify(redactDiag({ requestId, stage, code, ...(extra ?? {}) })));
}

// The one outbound provider call, shared by the consultation + summary paths. NEVER throws — it returns a
// CLASSIFIED outcome (transport fault / HTTP status / Responses `status` + `incomplete_details.reason` /
// extracted text / usage) so a 502 can be attributed to an exact class without exposing any content.
type OpenAiCall = {
  ok: boolean; // false = transport/HTTP failure
  statusCode: number; // 0 when fetch threw
  text: string;
  usage: Record<string, unknown>;
  responseStatus: string | null;
  incompleteReason: string | null;
};
async function callOpenAI(
  messages: LLMMessage[],
  cfg: { apiKey: string; model: string; maxOutputTokens: number; responseFormat?: unknown; reasoningEffort?: string },
): Promise<OpenAiCall> {
  const base: OpenAiCall = { ok: false, statusCode: 0, text: '', usage: {}, responseStatus: null, incompleteReason: null };
  let providerResponse: Response;
  try {
    providerResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.model,
        input: messages,
        max_output_tokens: cfg.maxOutputTokens,
        // Reasoning effort (Overnight Sprint §4/§8) — gpt-5-mini bills reasoning tokens as OUTPUT; without
        // this it ran at the provider default (medium) and reasoning dominated cost. The per-question
        // complexity profile sets it (SIMPLE/STANDARD 'low', DEEP 'medium'). Absent for summary (free text).
        ...(cfg.reasoningEffort ? { reasoning: { effort: cfg.reasoningEffort } } : {}),
        // Structured Outputs (consultation only) — the Responses API constrains output to the JSON schema
        // so the server always gets parseable JSON. Absent for summary (free text).
        ...(cfg.responseFormat ? { text: { format: cfg.responseFormat } } : {}),
      }),
    });
  } catch {
    return base; // transport failure → ok:false, statusCode:0
  }
  if (!providerResponse.ok) return { ...base, statusCode: providerResponse.status };
  let payload: unknown;
  try {
    payload = await providerResponse.json();
  } catch {
    return { ...base, ok: true, statusCode: providerResponse.status }; // 2xx but unparseable → empty text
  }
  const usage = (payload as { usage?: Record<string, unknown> } | null)?.usage ?? {};
  const rawStatus = (payload as { status?: unknown } | null)?.status;
  const responseStatus = typeof rawStatus === 'string' ? rawStatus : null;
  const rawReason = (payload as { incomplete_details?: { reason?: unknown } } | null)?.incomplete_details?.reason;
  const incompleteReason = typeof rawReason === 'string' ? rawReason : null;
  return { ok: true, statusCode: providerResponse.status, text: extractResponsesText(payload), usage, responseStatus, incompleteReason };
}

// ---- AI usage logging -------------------------------------------------------
type AiUsageLog = {
  user_id: string | null;
  model: string | null;
  request_type: 'chat' | 'today_fortune' | 'monthly_fortune';
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
  if (trimmed.length < 8 || trimmed.length > 64) return null;
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

type AdminClient = ReturnType<typeof createClient>;
type ConsumerAuthority =
  | { status: 'ok'; subjectId: string; subjectLabel: string; birthInfo: BirthInfoDraft; tier: 'FREE' }
  | { status: 'consent_required' | 'profile_required' | 'unavailable' };

function storedSubjectBirth(row: Record<string, unknown>): BirthInfoDraft | null {
  const raw = row.birth_info;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const birth = raw as BirthInfoDraft;
  if (typeof birth.birthYear !== 'string' || typeof birth.birthMonth !== 'string'
      || typeof birth.birthDay !== 'string') return null;
  return { ...birth, displayName: String(row.display_name ?? birth.displayName ?? '나') };
}

async function resolveConsumerAuthority(userId: string | null, admin: AdminClient | null): Promise<ConsumerAuthority> {
  if (!userId || !admin) return { status: 'unavailable' };
  try {
    const [profileResult, subjectResult] = await Promise.all([
      admin.from('profiles').select('terms_version').eq('id', userId).maybeSingle(),
      admin.from('consultation_subjects')
        .select('id,display_name,birth_info')
        .eq('user_id', userId).eq('is_self', true).maybeSingle(),
    ]);
    if (profileResult.error || subjectResult.error) return { status: 'unavailable' };
    if (!profileResult.data || (profileResult.data as { terms_version?: unknown }).terms_version !== REQUIRED_TERMS_VERSION) {
      return { status: 'consent_required' };
    }
    if (!subjectResult.data) return { status: 'profile_required' };
    const row = subjectResult.data as Record<string, unknown>;
    const birthInfo = storedSubjectBirth(row);
    if (!birthInfo || typeof row.id !== 'string') return { status: 'profile_required' };
    return {
      status: 'ok', subjectId: row.id, subjectLabel: String(row.display_name ?? '나'), birthInfo, tier: CURRENT_TIER,
    };
  } catch {
    return { status: 'unavailable' };
  }
}

async function resolveOwnedPartner(
  userId: string,
  partnerSubjectId: string,
  admin: AdminClient,
): Promise<{ birthInfo: BirthInfoDraft; label: string; relationship: string | null } | null> {
  try {
    const { data, error } = await admin.from('consultation_subjects')
      .select('id,display_name,relationship,birth_info')
      .eq('id', partnerSubjectId).eq('user_id', userId).maybeSingle();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    const birthInfo = storedSubjectBirth(row);
    return birthInfo ? {
      birthInfo,
      label: String(row.display_name ?? '상대방'),
      relationship: typeof row.relationship === 'string' ? row.relationship : null,
    } : null;
  } catch {
    return null;
  }
}
async function logAiUsage(
  entry: AiUsageLog,
  requestId: string | null,
  extra?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = adminClient();
    if (!admin) return;
    const withReq = requestId ? { ...entry, request_id: requestId } : { ...entry };
    // Progressive fallback (same policy as request_id): try the richest row first; if a telemetry
    // column (cost §13) is not applied yet, retry without it so usage is NEVER lost.
    if (extra && Object.keys(extra).length > 0) {
      const { error } = await admin.from('ai_usage_logs').insert({ ...withReq, ...extra });
      if (!error) return;
    }
    if (requestId) {
      const { error } = await admin.from('ai_usage_logs').insert(withReq);
      if (!error) return;
    }
    await admin.from('ai_usage_logs').insert(entry);
  } catch {
    // Usage logging must never affect the chat response.
  }
}

// ---- atomic paid-work reservation ------------------------------------------
const RATE_WINDOW_MS = (() => {
  const v = Number(Deno.env.get('CHAT_RATE_WINDOW_MS')?.trim());
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 60_000;
})();
const RATE_MAX_REQUESTS = (() => {
  const v = Number(Deno.env.get('CHAT_RATE_MAX_REQUESTS')?.trim());
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 20;
})();
type PaidReservationVerdict =
  | { status: 'allowed' }
  | { status: 'rate_limited'; retryAfterMs: number }
  | { status: 'unavailable' };
async function reservePaidWorkAtomic(
  admin: AdminClient | null,
  userId: string | null,
  workload: 'chat' | 'today_fortune' | 'monthly_fortune',
): Promise<PaidReservationVerdict> {
  if (!admin || !userId) return { status: 'unavailable' };
  try {
    const { data, error } = await admin.rpc('reserve_paid_work', {
      p_user_id: userId, p_workload: workload,
      p_window_ms: RATE_WINDOW_MS, p_max_requests: RATE_MAX_REQUESTS,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row || typeof row.allowed !== 'boolean') return { status: 'unavailable' };
    return row.allowed
      ? { status: 'allowed' }
      : { status: 'rate_limited', retryAfterMs: Number(row.retry_after_ms) || RATE_WINDOW_MS };
  } catch {
    return { status: 'unavailable' };
  }
}

type FortuneIdentity = {
  userId: string;
  kind: 'today' | 'monthly';
  periodKey: string;
  subjectId: string;
  tier: 'FREE';
  semanticVersion: string;
};

type CanonicalFortuneRead =
  | { status: 'found'; record: Record<string, unknown> }
  | { status: 'missing' }
  | { status: 'unavailable' };
async function readCanonicalFortune(admin: AdminClient, identity: FortuneIdentity): Promise<CanonicalFortuneRead> {
  try {
    let query = admin.from(identity.kind === 'today' ? 'daily_fortunes' : 'monthly_fortunes')
      .select('*').eq('user_id', identity.userId).eq('subject_id', identity.subjectId)
      .eq('tier', identity.tier).eq('semantic_version', identity.semanticVersion);
    if (identity.kind === 'today') {
      query = query.eq('fortune_date', identity.periodKey);
    } else {
      const [year, month] = identity.periodKey.split('-').map(Number);
      query = query.eq('fortune_year', year).eq('fortune_month', month);
    }
    const { data, error } = await query.maybeSingle();
    if (error) return { status: 'unavailable' };
    return data
      ? { status: 'found', record: data as Record<string, unknown> }
      : { status: 'missing' };
  } catch {
    return { status: 'unavailable' };
  }
}

async function acquireFortuneLease(admin: AdminClient, identity: FortuneIdentity) {
  try {
    const { data, error } = await admin.rpc('acquire_fortune_generation_lease', {
      p_user_id: identity.userId, p_kind: identity.kind, p_period_key: identity.periodKey,
      p_subject_id: identity.subjectId, p_tier: identity.tier,
      p_semantic_version: identity.semanticVersion, p_lease_seconds: 300,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return { status: 'unavailable' as const };
    if (row.outcome === 'COMPLETED') return { status: 'completed' as const };
    if (row.outcome === 'BUSY') return { status: 'busy' as const };
    return row.outcome === 'ACQUIRED' && typeof row.lease_token === 'string'
      ? { status: 'acquired' as const, token: row.lease_token }
      : { status: 'unavailable' as const };
  } catch {
    return { status: 'unavailable' as const };
  }
}

async function releaseFortuneLease(admin: AdminClient, identity: FortuneIdentity, token: string): Promise<void> {
  try {
    await admin.rpc('release_fortune_generation_lease', {
      p_user_id: identity.userId, p_kind: identity.kind, p_period_key: identity.periodKey,
      p_subject_id: identity.subjectId, p_tier: identity.tier,
      p_semantic_version: identity.semanticVersion, p_lease_token: token,
    });
  } catch {
    // DB-clock expiry is the final recovery path; never let a cleanup fault mask the original result.
  }
}

async function completeTodayFortune(
  admin: AdminClient, identity: FortuneIdentity, token: string, generated: Record<string, unknown>, model: string,
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await admin.rpc('complete_today_fortune_generation', {
      p_user_id: identity.userId, p_period_key: identity.periodKey, p_subject_id: identity.subjectId,
      p_tier: identity.tier, p_semantic_version: identity.semanticVersion, p_lease_token: token,
      p_overall_tone: generated.overallTone, p_result_json: generated.result,
      p_evidence_version: generated.evidenceVersion ?? null,
      p_policy_version: generated.policyVersion ?? null, p_model: model,
    });
    return error || !data ? null : data as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function completeMonthlyFortune(
  admin: AdminClient, identity: FortuneIdentity, token: string, generated: Record<string, unknown>, model: string,
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await admin.rpc('complete_monthly_fortune_generation', {
      p_user_id: identity.userId, p_period_key: identity.periodKey, p_subject_id: identity.subjectId,
      p_tier: identity.tier, p_semantic_version: identity.semanticVersion, p_lease_token: token,
      p_overall_tier: generated.overallTier, p_result_json: generated.result,
      p_evidence_version: generated.evidenceVersion ?? null,
      p_plan_version: generated.planVersion ?? null, p_policy_version: generated.policyVersion ?? null,
      p_model: model,
    });
    return error || !data ? null : data as Record<string, unknown>;
  } catch {
    return null;
  }
}

type PaidRequestWorkload = 'chat' | 'compatibility' | 'summary';
type PaidRequestContext = { admin: AdminClient; userId: string; workload: PaidRequestWorkload; requestId: string; token: string };
type PaidRequestStart =
  | { status: 'acquired'; context: PaidRequestContext }
  | { status: 'completed'; response: Record<string, unknown> }
  | { status: 'processing' | 'rate_limited' | 'unavailable'; retryAfterMs?: number }
  | { status: 'generation_disabled' }
  | { status: 'global_limit_reached'; period: 'hourly' | 'daily'; retryAfterMs: number };

async function acquirePaidRequest(
  admin: AdminClient | null, userId: string | null, workload: PaidRequestWorkload, requestId: string | null,
): Promise<PaidRequestStart> {
  if (!admin || !userId || !requestId) return { status: 'unavailable' };
  try {
    const { data, error } = await admin.rpc('acquire_paid_request', {
      p_user_id: userId, p_workload: workload, p_request_id: requestId, p_lease_seconds: 300,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return { status: 'unavailable' };
    if (row.outcome === 'COMPLETED' && row.response_json && typeof row.response_json === 'object') {
      return { status: 'completed', response: row.response_json as Record<string, unknown> };
    }
    if (row.outcome === 'PROCESSING') return { status: 'processing' };
    if (row.outcome !== 'ACQUIRED' || typeof row.lease_token !== 'string') return { status: 'unavailable' };
    const reservation = await reservePaidWorkAtomic(admin, userId, 'chat');
    if (reservation.status !== 'allowed') {
      await admin.rpc('release_paid_request', {
        p_user_id: userId, p_workload: workload, p_request_id: requestId, p_lease_token: row.lease_token,
      });
      return reservation.status === 'rate_limited'
        ? { status: 'rate_limited', retryAfterMs: reservation.retryAfterMs }
        : { status: 'unavailable' };
    }
    const global = await reserveGlobalPaidGeneration(admin, userId, workload);
    if (global.status !== 'allowed') {
      await admin.rpc('release_paid_request', {
        p_user_id: userId, p_workload: workload, p_request_id: requestId, p_lease_token: row.lease_token,
      });
      if (global.status === 'disabled') return { status: 'generation_disabled' };
      if (global.status === 'exhausted') {
        return {
          status: 'global_limit_reached', period: global.period, retryAfterMs: global.retryAfterMs,
        };
      }
      return { status: 'unavailable' };
    }
    return { status: 'acquired', context: { admin, userId, workload, requestId, token: row.lease_token } };
  } catch {
    return { status: 'unavailable' };
  }
}

async function releasePaidRequest(ctx: PaidRequestContext): Promise<void> {
  try {
    await ctx.admin.rpc('release_paid_request', {
      p_user_id: ctx.userId, p_workload: ctx.workload,
      p_request_id: ctx.requestId, p_lease_token: ctx.token,
    });
  } catch {
    // Lease expiry is the recovery path.
  }
}

async function readCompletedPaidRequest(ctx: PaidRequestContext): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await ctx.admin.from('paid_request_idempotency')
      .select('response_json').eq('user_id', ctx.userId).eq('workload', ctx.workload)
      .eq('request_id', ctx.requestId).eq('status', 'COMPLETED').maybeSingle();
    const response = (data as { response_json?: unknown } | null)?.response_json;
    return !error && response && typeof response === 'object' ? response as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

async function completePaidRequest(
  ctx: PaidRequestContext,
  response: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await ctx.admin.rpc('complete_paid_request', {
      p_user_id: ctx.userId, p_workload: ctx.workload, p_request_id: ctx.requestId,
      p_lease_token: ctx.token, p_response_json: response,
    });
    if (!error && data === true) return response;
    const replay = await readCompletedPaidRequest(ctx);
    if (replay) return replay;
  } catch {
    const replay = await readCompletedPaidRequest(ctx);
    if (replay) return replay;
  }
  await releasePaidRequest(ctx);
  return null;
}

// ---- request contract (§7) --------------------------------------------------
// The client sends ONLY untrusted inputs. No messages / grounding / system prompt.
//   mode 'consultation' (default): question + untrusted turns; server resolves canonical SELF and grounds.
//   mode 'summary': existingSummary + raw turns → the SERVER builds the summary prompt (§20).
type ConsultationRequestBody = {
  mode?: 'consultation' | 'summary';
  // 오늘의 운세 / 이번 달 운세: server resolves canonical SELF and owns the date/month.
  kind?: 'today_fortune' | 'monthly_fortune';
  subjectProfileId?: string | null;
  birthInput?: unknown;
  subjectLabel?: string | null;
  question?: unknown;
  conversationContext?: unknown;
  conversationSummary?: unknown;
  // Sprint E — the CURRENT conversation id, used ONLY to server-load the previous decision (ownership-
  // verified below). It is an identifier, not authoritative decision data; the client's own copy of a
  // previous polarity/version/target is never trusted.
  conversationId?: unknown;
  requestMetadata?: { clientQuestionTimeEpoch?: number | null; requestId?: string | null } | null;
  // 궁합(compatibility) mode: the partner's untrusted birth INPUT (server recomputes the pair). Absent →
  // the existing single-subject consultation path is used unchanged.
  consultationMode?: 'solo' | 'compatibility';
  partnerBirthInput?: unknown;
  partnerLabel?: string | null;
  partnerSubjectId?: string | null;
  targetSource?: 'OWNED_SUBJECT' | 'RAW_UNSAVED';
  // summary mode only
  existingSummary?: unknown;
  turns?: unknown;
};

const REASON_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  REQUEST_TOO_LARGE: 413,
  SUBJECT_FORBIDDEN: 403,
  SUBJECT_NOT_FOUND: 404,
  LLM_FAILED: 502,
  CONSENT_REQUIRED: 403,
  PROFILE_REQUIRED: 403,
  GENERATION_IN_PROGRESS: 409,
  REQUEST_IN_PROGRESS: 409,
  TEMPORARILY_UNAVAILABLE: 503,
};

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req: Request, _ctx: unknown): Promise<Response> => {
      let stage = 'auth_completed';
      const startedAt = Date.now();
      const userId = userIdFromRequest(req);
      const admin = adminClient();

      try {
        if (req.method !== 'POST') {
          return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
        }

        if (!userId) return Response.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
        const declaredLength = Number(req.headers.get('content-length'));
        if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BODY_BYTES) {
          return Response.json({ error: 'REQUEST_TOO_LARGE' }, { status: 413 });
        }

        const { apiKey, model, budgets } = readServerConfig();

        let body: ConsultationRequestBody;
        try {
          body = (await req.json()) as ConsultationRequestBody;
        } catch {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }
        if (body === null || typeof body !== 'object') {
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }
        const requestId = sanitizeRequestId(body.requestMetadata?.requestId);

        // Server-authoritative input bounds (§A3) — reject clearly oversized untrusted payloads BEFORE any
        // grounding/LLM work, so a modified client cannot inflate prompt cost past the client UI's maxLength.
        const bounds = validateConsultationInputBounds(body);
        if (!bounds.ok) {
          logDiag(requestId, 'INPUT', 'REQUEST_TOO_LARGE', {});
          return Response.json({ error: bounds.code }, { status: REASON_STATUS[bounds.code] ?? 413 });
        }

        // Authenticated is not product-authorized. Resolve required consent + the ONE canonical SELF from the
        // actual consumer tables before any paid work. Raw client SELF birth input is ignored downstream.
        const authority = await resolveConsumerAuthority(userId, admin);
        if (authority.status !== 'ok') {
          const code = authority.status === 'consent_required'
            ? 'CONSENT_REQUIRED'
            : authority.status === 'profile_required' ? 'PROFILE_REQUIRED' : 'TEMPORARILY_UNAVAILABLE';
          return Response.json({ error: code }, { status: REASON_STATUS[code] });
        }

        // Summary output budget (small, free text). The CONSULTATION config is built PER-QUESTION after the
        // question is validated (below) so its output ceiling + reasoning effort follow the question's
        // complexity (Overnight Sprint §4/§8) — SIMPLE/STANDARD run cheaper 'low' reasoning, DEEP 'medium'.
        const summaryCfg = { apiKey, model, maxOutputTokens: budgets.summary };

        // 오늘의 운세 (Today Fortune V1): a stateless daily-fortune generation. The SERVER owns the date
        // (nowEpochSeconds = receipt time, §6/§29), builds the deterministic daily evidence + plan from the
        // stored canonical SELF, and makes EXACTLY ONE OpenAI call. The completion RPC persists before success.
        if (body.kind === 'today_fortune') {
          stage = 'today_fortune_request';
          if (!admin) return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
          const serverEpoch = Math.floor(startedAt / 1000);
          const periodKey = fortuneDateStringFromEpoch(serverEpoch);
          const identity: FortuneIdentity = {
            userId, kind: 'today', periodKey, subjectId: authority.subjectId,
            tier: authority.tier, semanticVersion: TODAY_CANONICAL_VERSION,
          };
          const todayEffort = Deno.env.get('LLM_TODAY_REASONING_EFFORT')?.trim() || 'low';
          const todayMaxRaw = Number(Deno.env.get('LLM_TODAY_MAX_OUTPUT_TOKENS'));
          const todayMaxTokens = Number.isFinite(todayMaxRaw) && todayMaxRaw > 0 ? Math.floor(todayMaxRaw) : 2500;
          const todayCfg = { apiKey, model, maxOutputTokens: todayMaxTokens, reasoningEffort: todayEffort, responseFormat: dailyFortuneResponseFormat() };
          let todayUsage: Record<string, unknown> = {};
          let todayErrorCode: string | null = null;
          let todayOutcome: OpenAiCall | null = null;
          let nonPaidFailure: Record<string, unknown> | null = null;
          const globalGuard = {
            failure: null as Exclude<GlobalSpendGuardVerdict, { status: 'allowed' }> | null,
          };
          const guarded = await runCanonicalGeneration({
            readCanonical: () => readCanonicalFortune(admin, identity),
            acquireLease: () => acquireFortuneLease(admin, identity),
            reservePaidWork: async () => {
              if (apiKey.length === 0) return { status: 'unavailable' as const };
              const userReservation = await reservePaidWorkAtomic(admin, userId, 'today_fortune');
              if (userReservation.status !== 'allowed') return userReservation;
              const global = await reserveGlobalPaidGeneration(admin, userId, 'today_fortune');
              if (global.status === 'allowed') return { status: 'allowed' as const };
              globalGuard.failure = global;
              return { status: 'unavailable' as const };
            },
            generate: async () => {
              const fortune = await buildTodayFortune(
                { birthInput: authority.birthInfo },
                {
                  digestProvider: denoDigestProvider, nowEpochSeconds: serverEpoch,
                  callLLM: async (messages: LLMMessage[]): Promise<string> => {
                    stage = 'openai_request';
                    const r = await callOpenAI(messages, todayCfg);
                    todayUsage = r.usage; todayOutcome = r;
                    const code = openAiFailureCode(r);
                    if (code === 'OK') return r.text;
                    todayErrorCode = code; return '';
                  },
                },
              );
              if (!fortune.ok) {
                if (fortune.reason === 'EVIDENCE_UNAVAILABLE') {
                  nonPaidFailure = { ok: false, reason: fortune.reason, fortuneDate: fortune.fortuneDate };
                } else {
                  const code = todayErrorCode ?? fortune.reason;
                  await logAiUsage({ user_id: userId, model, request_type: 'today_fortune',
                    input_tokens: null, output_tokens: null, total_tokens: null,
                    latency_ms: Date.now() - startedAt, status: 'error', error_code: code }, requestId);
                }
                return { ok: false as const };
              }
              const details = parseUsageDetails(todayUsage);
              await logAiUsage({ user_id: userId, model, request_type: 'today_fortune',
                input_tokens: toNullableInt(todayUsage.input_tokens), output_tokens: toNullableInt(todayUsage.output_tokens),
                total_tokens: toNullableInt(todayUsage.total_tokens), latency_ms: Date.now() - startedAt,
                status: 'success', error_code: null }, requestId, {
                cached_input_tokens: details.cachedInputTokens, reasoning_tokens: details.reasoningTokens,
                max_output_tokens: todayMaxTokens, complexity: 'TODAY', reasoning_effort: todayEffort,
              });
              return { ok: true as const, value: fortune as unknown as Record<string, unknown> };
            },
            complete: (token: string, value: Record<string, unknown>) => completeTodayFortune(admin, identity, token, value, model),
            release: (token: string) => releaseFortuneLease(admin, identity, token),
          });
          if (guarded.status === 'ok') {
            const row = guarded.record as Record<string, unknown>;
            return Response.json({ ok: true, fortuneDate: row.fortune_date, overallTone: row.overall_tone,
              result: row.result_json, policyVersion: row.policy_version, evidenceVersion: row.evidence_version,
              model: row.model });
          }
          if (guarded.status === 'in_progress') return Response.json({ error: 'GENERATION_IN_PROGRESS' }, { status: 409 });
          if (guarded.status === 'rate_limited') return Response.json(
            { error: 'RATE_LIMITED', retryAfterMs: guarded.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(guarded.retryAfterMs / 1000)) } },
          );
          if (globalGuard.failure) {
            const failure = globalSpendGuardFailure(globalGuard.failure);
            return Response.json(failure.body, { status: failure.status, headers: failure.headers });
          }
          if (nonPaidFailure) return Response.json(nonPaidFailure);
          if (guarded.status === 'generation_failed') {
            logDiag(requestId, 'OPENAI_RESPONSE', todayErrorCode ?? 'LLM_FAILED', {
              path: 'today_fortune', model, upstreamStatus: todayOutcome?.statusCode || undefined,
              responseStatus: todayOutcome?.responseStatus, incompleteReason: todayOutcome?.incompleteReason,
            });
            return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
          }
          return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
        }

        // 이번 달 운세 (Monthly Fortune V1) — a SEPARATE temporal product (NOT Today×30). The SERVER owns the
        // CURRENT target month (nowEpochSeconds = receipt time; never a client-supplied month → abuse-proof
        // §60) and makes EXACTLY ONE OpenAI call. Slightly larger output ceiling than Today (a month digest is
        // longer, §33) but still fixed 'low' reasoning. The completion RPC persists before success.
        if (body.kind === 'monthly_fortune') {
          stage = 'monthly_fortune_request';
          if (!admin) return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
          const serverEpoch = Math.floor(startedAt / 1000);
          const targetMonth = currentTargetMonth(serverEpoch);
          const periodKey = monthKey(targetMonth);
          const identity: FortuneIdentity = {
            userId, kind: 'monthly', periodKey, subjectId: authority.subjectId,
            tier: authority.tier, semanticVersion: MONTHLY_CANONICAL_VERSION,
          };
          const monthlyEffort = Deno.env.get('LLM_MONTHLY_REASONING_EFFORT')?.trim() || 'low';
          const monthlyMaxRaw = Number(Deno.env.get('LLM_MONTHLY_MAX_OUTPUT_TOKENS'));
          const monthlyMaxTokens = Number.isFinite(monthlyMaxRaw) && monthlyMaxRaw > 0 ? Math.floor(monthlyMaxRaw) : 3000;
          const monthlyCfg = { apiKey, model, maxOutputTokens: monthlyMaxTokens, reasoningEffort: monthlyEffort, responseFormat: monthlyFortuneResponseFormat() };
          let monthlyUsage: Record<string, unknown> = {};
          let monthlyErrorCode: string | null = null;
          let monthlyOutcome: OpenAiCall | null = null;
          let nonPaidFailure: Record<string, unknown> | null = null;
          const globalGuard = {
            failure: null as Exclude<GlobalSpendGuardVerdict, { status: 'allowed' }> | null,
          };
          const guarded = await runCanonicalGeneration({
            readCanonical: () => readCanonicalFortune(admin, identity),
            acquireLease: () => acquireFortuneLease(admin, identity),
            reservePaidWork: async () => {
              if (apiKey.length === 0) return { status: 'unavailable' as const };
              const userReservation = await reservePaidWorkAtomic(admin, userId, 'monthly_fortune');
              if (userReservation.status !== 'allowed') return userReservation;
              const global = await reserveGlobalPaidGeneration(admin, userId, 'monthly_fortune');
              if (global.status === 'allowed') return { status: 'allowed' as const };
              globalGuard.failure = global;
              return { status: 'unavailable' as const };
            },
            generate: async () => {
              const monthly = await buildMonthlyFortune(
                { birthInput: authority.birthInfo },
                {
                  digestProvider: denoDigestProvider, nowEpochSeconds: serverEpoch,
                  callLLM: async (messages: LLMMessage[]): Promise<string> => {
                    stage = 'openai_request';
                    const r = await callOpenAI(messages, monthlyCfg);
                    monthlyUsage = r.usage; monthlyOutcome = r;
                    const code = openAiFailureCode(r);
                    if (code === 'OK') return r.text;
                    monthlyErrorCode = code; return '';
                  },
                },
              );
              if (!monthly.ok) {
                if (monthly.reason === 'EVIDENCE_UNAVAILABLE') {
                  nonPaidFailure = { ok: false, reason: monthly.reason, year: monthly.year, month: monthly.month };
                } else {
                  const code = monthlyErrorCode ?? monthly.reason;
                  await logAiUsage({ user_id: userId, model, request_type: 'monthly_fortune',
                    input_tokens: null, output_tokens: null, total_tokens: null,
                    latency_ms: Date.now() - startedAt, status: 'error', error_code: code }, requestId);
                }
                return { ok: false as const };
              }
              const details = parseUsageDetails(monthlyUsage);
              await logAiUsage({ user_id: userId, model, request_type: 'monthly_fortune',
                input_tokens: toNullableInt(monthlyUsage.input_tokens), output_tokens: toNullableInt(monthlyUsage.output_tokens),
                total_tokens: toNullableInt(monthlyUsage.total_tokens), latency_ms: Date.now() - startedAt,
                status: 'success', error_code: null }, requestId, {
                cached_input_tokens: details.cachedInputTokens, reasoning_tokens: details.reasoningTokens,
                max_output_tokens: monthlyMaxTokens, complexity: 'MONTHLY', reasoning_effort: monthlyEffort,
              });
              return { ok: true as const, value: monthly as unknown as Record<string, unknown> };
            },
            complete: (token: string, value: Record<string, unknown>) => completeMonthlyFortune(admin, identity, token, value, model),
            release: (token: string) => releaseFortuneLease(admin, identity, token),
          });
          if (guarded.status === 'ok') {
            const row = guarded.record as Record<string, unknown>;
            return Response.json({ ok: true, year: row.fortune_year, month: row.fortune_month,
              overallTier: row.overall_tier, result: row.result_json, policyVersion: row.policy_version,
              evidenceVersion: row.evidence_version, planVersion: row.plan_version, model: row.model });
          }
          if (guarded.status === 'in_progress') return Response.json({ error: 'GENERATION_IN_PROGRESS' }, { status: 409 });
          if (guarded.status === 'rate_limited') return Response.json(
            { error: 'RATE_LIMITED', retryAfterMs: guarded.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(guarded.retryAfterMs / 1000)) } },
          );
          if (globalGuard.failure) {
            const failure = globalSpendGuardFailure(globalGuard.failure);
            return Response.json(failure.body, { status: failure.status, headers: failure.headers });
          }
          if (nonPaidFailure) return Response.json(nonPaidFailure);
          if (guarded.status === 'generation_failed') {
            logDiag(requestId, 'OPENAI_RESPONSE', monthlyErrorCode ?? 'LLM_FAILED', {
              path: 'monthly_fortune', model, upstreamStatus: monthlyOutcome?.statusCode || undefined,
              responseStatus: monthlyOutcome?.responseStatus, incompleteReason: monthlyOutcome?.incompleteReason,
            });
            return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
          }
          return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
        }

        // Summary mode (FIX A/B/C): the SERVER owns the summary prompt (buildServerSummary → existingSummary
        // is untrusted content, never system) and applies hard input bounds server-side. Usage is logged
        // exactly like consultation so summary calls COUNT toward the ai_usage_logs burst window — no
        // rate-limit bypass, no double count.
        if (body.mode === 'summary') {
          stage = 'summary_request';
          if (!requestId) return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
          const paid = await acquirePaidRequest(admin, userId, 'summary', requestId);
          if (paid.status === 'completed') return Response.json(paid.response);
          if (paid.status === 'processing') return Response.json({ error: 'REQUEST_IN_PROGRESS' }, { status: 409 });
          if (paid.status === 'rate_limited') return Response.json(
            { error: 'RATE_LIMITED', retryAfterMs: paid.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((paid.retryAfterMs ?? RATE_WINDOW_MS) / 1000)) } },
          );
          if (paid.status === 'generation_disabled') {
            return Response.json({ error: 'GENERATION_DISABLED' }, { status: 503 });
          }
          if (paid.status === 'global_limit_reached') return Response.json(
            { error: 'GLOBAL_GENERATION_LIMIT_REACHED', period: paid.period, retryAfterMs: paid.retryAfterMs },
            { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil(paid.retryAfterMs / 1000))) } },
          );
          if (paid.status !== 'acquired') return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
          if (apiKey.length === 0) {
            await releasePaidRequest(paid.context);
            return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
          }
          let summaryUsage: Record<string, unknown> = {};
          let summaryErrorCode: string | null = null;
          const summaryCallLLM = async (messages: LLMMessage[]): Promise<string> => {
            const r = await callOpenAI(messages, summaryCfg);
            summaryUsage = r.usage;
            const code = openAiFailureCode(r);
            if (code === 'OK') return r.text;
            summaryErrorCode = code;
            logDiag(requestId, 'OPENAI_RESPONSE', code, {
              path: 'summary',
              model,
              upstreamStatus: r.statusCode || undefined,
              responseStatus: r.responseStatus,
              incompleteReason: r.incompleteReason,
              outputTokens: toNullableInt(r.usage.output_tokens),
              totalTokens: toNullableInt(r.usage.total_tokens),
            });
            return ''; // empty → buildServerSummary maps to LLM_FAILED
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
              await releasePaidRequest(paid.context);
              return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
            }
            // INVALID_INPUT: pre-flight (no OpenAI call) → no usage row, matching consultation's policy.
            logDiag(requestId, 'INPUT', 'SUMMARY_INVALID_INPUT', { path: 'summary' });
            await releasePaidRequest(paid.context);
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
          const response = { text: summary.text };
          const completed = await completePaidRequest(paid.context, response);
          return completed
            ? Response.json(completed)
            : Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
        }

        if (typeof body.question !== 'string') {
          logDiag(requestId, 'INPUT', 'MISSING_QUESTION', { path: 'consultation' });
          return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        }
        if (body.question.trim().length === 0) return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
        if (!requestId) return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });

        let partnerBirthInput: BirthInfoDraft | null = null;
        let partnerLabel: string | null = null;
        if (body.consultationMode === 'compatibility') {
          if (typeof body.partnerSubjectId === 'string' && admin) {
            const partner = await resolveOwnedPartner(userId, body.partnerSubjectId, admin);
            if (!partner) return Response.json({ error: 'SUBJECT_NOT_FOUND' }, { status: 404 });
            partnerBirthInput = partner.birthInfo;
            partnerLabel = partner.relationship ? `${partner.label} (${partner.relationship})` : partner.label;
          } else if (body.targetSource === 'RAW_UNSAVED'
              && body.partnerBirthInput && typeof body.partnerBirthInput === 'object') {
            // Explicit raw TARGET only. SELF always remains the server-owned canonical subject.
            partnerBirthInput = body.partnerBirthInput as BirthInfoDraft;
            partnerLabel = typeof body.partnerLabel === 'string' ? body.partnerLabel : '상대방';
          } else {
            return Response.json({ error: 'INVALID_INPUT' }, { status: 400 });
          }
        }

        const requestWorkload: PaidRequestWorkload = body.consultationMode === 'compatibility' ? 'compatibility' : 'chat';
        const paid = await acquirePaidRequest(admin, userId, requestWorkload, requestId);
        if (paid.status === 'completed') return Response.json(paid.response);
        if (paid.status === 'processing') return Response.json({ error: 'REQUEST_IN_PROGRESS' }, { status: 409 });
        if (paid.status === 'rate_limited') return Response.json(
          { error: 'RATE_LIMITED', retryAfterMs: paid.retryAfterMs },
          { status: 429, headers: { 'Retry-After': String(Math.ceil((paid.retryAfterMs ?? RATE_WINDOW_MS) / 1000)) } },
        );
        if (paid.status === 'generation_disabled') {
          return Response.json({ error: 'GENERATION_DISABLED' }, { status: 503 });
        }
        if (paid.status === 'global_limit_reached') return Response.json(
          { error: 'GLOBAL_GENERATION_LIMIT_REACHED', period: paid.period, retryAfterMs: paid.retryAfterMs },
          { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil(paid.retryAfterMs / 1000))) } },
        );
        if (paid.status !== 'acquired') return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
        if (apiKey.length === 0) {
          await releasePaidRequest(paid.context);
          return Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
        }

        // Per-question complexity → LLM tuning profile (Overnight Sprint §4/§8). DETERMINISTIC (no LLM call)
        // and with NO effect on grounding/validation — it only sets the output-token CEILING + reasoning
        // effort. gpt-5-mini bills reasoning tokens as output, so 'low' effort on SIMPLE/STANDARD questions is
        // the dominant, truncation-SAFE cost saving (a lower effort leaves MORE budget for the answer, not
        // less). Global env overrides both the ceiling (LLM_CONSULTATION_MAX_OUTPUT_TOKENS) and the effort
        // (LLM_CONSULTATION_REASONING_EFFORT) when set.
        const complexity = classifyQuestionComplexity(body.question);
        const profile = resolveConsultationProfile(complexity, {
          maxOutputTokens: Deno.env.get('LLM_CONSULTATION_MAX_OUTPUT_TOKENS'),
          reasoningEffort: Deno.env.get('LLM_CONSULTATION_REASONING_EFFORT'),
        });
        const consultationCfg = {
          apiKey,
          model,
          maxOutputTokens: profile.maxOutputTokens,
          reasoningEffort: profile.reasoningEffort,
          responseFormat: consultationResponseFormat(),
        };
        // SAFE routing breadcrumb — only the class + tuning scalars, never question/PII. Lets the owner
        // confirm the router is live and see the per-question effort/ceiling in edge logs.
        console.log(
          `[chat.route] req=${requestId} complexity=${complexity} effort=${profile.reasoningEffort} cap=${profile.maxOutputTokens}`,
        );

        // The single outbound trust exit. Captures the classified OpenAI outcome so a 502 can be attributed
        // to an exact class. callLLM never throws — a non-OK outcome returns '' → the orchestrator maps it
        // to LLM_FAILED, and we log the precise code + safe diagnostics here.
        let capturedUsage: Record<string, unknown> = {};
        let llmErrorCode: string | null = null;
        let capturedOutcome: OpenAiCall | null = null;
        const callLLM = async (messages: LLMMessage[]): Promise<string> => {
          stage = 'openai_request';
          const r = await callOpenAI(messages, consultationCfg);
          capturedUsage = r.usage;
          capturedOutcome = r;
          stage = 'response_parse';
          const code = openAiFailureCode(r);
          if (code === 'OK') return r.text;
          llmErrorCode = code;
          return ''; // empty → buildServerConsultation maps to LLM_FAILED (diagnostics logged at the branch)
        };

        stage = 'server_consultation';
        const conversationContext = Array.isArray(body.conversationContext)
          ? (body.conversationContext as { role: 'user' | 'assistant'; content: string }[])
          : undefined;
        const conversationSummary =
          typeof body.conversationSummary === 'string' ? body.conversationSummary : null;
        // 궁합(compatibility) mode routes to the pairwise orchestrator (SAME one-LLM-call boundary + validator);
        // Sprint E — SERVER-AUTHORITATIVE previous-decision loader for live follow-ups (solo path). Ownership
        // is verified (the conversation must belong to this user) BEFORE reading the latest assistant row's
        // persisted decisionMeta. Fail-clean: any gap → undefined → no follow-up (normal behavior).
        const conversationId =
          typeof body.conversationId === 'string' && body.conversationId.length > 0 ? body.conversationId : null;
        const loadPreviousDecision =
          admin && userId && conversationId
            ? async () => {
                try {
                  const { data: conv } = await admin
                    .from('conversations').select('id').eq('id', conversationId).eq('user_id', userId).maybeSingle();
                  if (!conv) return null; // not the caller's conversation → never leak another user's decision
                  const { data: msg } = await admin
                    .from('conversation_messages')
                    .select('structured_result')
                    .eq('conversation_id', conversationId)
                    .eq('role', 'assistant')
                    .order('seq', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                  const sr = (msg as { structured_result?: { decisionMeta?: unknown } } | null)?.structured_result;
                  return parseDecisionMeta(sr?.decisionMeta) ?? null;
                } catch {
                  return null;
                }
              }
            : undefined;

        // solo path is unchanged. Both return the identical ServerConsultationResult shape.
        const result =
          body.consultationMode === 'compatibility'
            ? await buildCompatibilityConsultation(
                  {
                   birthInput: authority.birthInfo,
                   subjectLabel: authority.subjectLabel,
                   partnerBirthInput,
                   partnerLabel,
                  consultationMode: 'compatibility',
                  question: body.question,
                  conversationContext,
                  conversationSummary,
                  requestMetadata: {
                    clientQuestionTimeEpoch: body.requestMetadata?.clientQuestionTimeEpoch ?? null,
                    requestId,
                  },
                },
                {
                  digestProvider: denoDigestProvider,
                  nowEpochSeconds: Math.floor(startedAt / 1000), // SERVER receipt time (§10)
                  callLLM,
                  modelId: model, // Sprint E §10 — actual runtime model id into decisionMeta
                },
              )
            : await buildServerConsultation(
                  {
                   subjectProfileId: null,
                   birthInput: authority.birthInfo,
                   subjectLabel: authority.subjectLabel,
                  question: body.question,
                  conversationContext,
                  requestMetadata: {
                    clientQuestionTimeEpoch: body.requestMetadata?.clientQuestionTimeEpoch ?? null,
                    requestId,
                  },
                },
                {
                  digestProvider: denoDigestProvider,
                  nowEpochSeconds: Math.floor(startedAt / 1000), // SERVER receipt time (§10)
                  callLLM,
                  modelId: model, // Sprint E §10 — actual runtime model id into decisionMeta
                  ...(loadPreviousDecision ? { loadPreviousDecision } : {}),
                },
              );

        if (!result.ok) {
          const status = REASON_STATUS[result.reason] ?? 500;
          if (result.reason === 'LLM_FAILED') {
            const code = llmErrorCode ?? 'LLM_FAILED';
            // The precise 502 class (§F): transport / HTTP status / incomplete-reason / empty-output +
            // token counts — enough to tell WHY without exposing prompt, birth, question, or the answer.
            logDiag(requestId, 'OPENAI_RESPONSE', code, {
              path: 'consultation',
              model,
              upstreamStatus: capturedOutcome?.statusCode || undefined,
              responseStatus: capturedOutcome?.responseStatus,
              incompleteReason: capturedOutcome?.incompleteReason,
              outputTokens: toNullableInt(capturedUsage.output_tokens),
              totalTokens: toNullableInt(capturedUsage.total_tokens),
            });
            await logAiUsage(
              {
                user_id: userId, model, request_type: 'chat',
                input_tokens: null, output_tokens: null, total_tokens: null,
                latency_ms: Date.now() - startedAt, status: 'error',
                error_code: code,
              },
              requestId,
            );
            await releasePaidRequest(paid.context);
            return Response.json({ error: 'REQUEST_FAILED' }, { status: 502 });
          }
          // SUBJECT_FORBIDDEN(403) / SUBJECT_NOT_FOUND(404) / INVALID_INPUT(400) — attribute the stage.
          logDiag(requestId, result.reason === 'INVALID_INPUT' ? 'INPUT' : 'PROFILE_RESOLUTION', result.reason, { path: 'consultation' });
          await releasePaidRequest(paid.context);
          return Response.json({ error: result.reason }, { status });
        }

        // Cost telemetry (§13): reasoning + cached tokens split out of usage, plus the chosen
        // complexity/effort/ceiling. All non-PII scalars; written via the progressive fallback so a
        // not-yet-applied column never loses the row. Turns the cost estimates into MEASURED per-Q&A cost.
        const usageDetails = parseUsageDetails(capturedUsage);
        await logAiUsage(
          {
            user_id: userId, model, request_type: 'chat',
            input_tokens: toNullableInt(capturedUsage.input_tokens),
            output_tokens: toNullableInt(capturedUsage.output_tokens),
            total_tokens: toNullableInt(capturedUsage.total_tokens),
            latency_ms: Date.now() - startedAt, status: 'success', error_code: null,
          },
          requestId,
          {
            cached_input_tokens: usageDetails.cachedInputTokens,
            reasoning_tokens: usageDetails.reasoningTokens,
            max_output_tokens: profile.maxOutputTokens,
            complexity,
            reasoning_effort: profile.reasoningEffort,
          },
        );

        // Diagnose WHY a success response was NOT rendered as a card (§3): a card-worthy answer
        // (structuredResult present) needs no diagnostic; a fallback / safe-message does. Safe fields only.
        if (result.diagnostics && result.diagnostics.outputClassification !== 'ACCEPTED') {
          logDiag(requestId, 'RESPONSE_VALIDATION', result.diagnostics.rejectionReason ?? 'UNKNOWN', {
            path: 'consultation',
            model,
            validationCategory: result.diagnostics.outputClassification,
            grounded: result.groundingMeta.grounded,
          });
        }

        // Bounded response (§17): server-validated text + optional structured view-model + safe meta.
        // `diagnostics` is intentionally NOT returned to the client — it is log-only.
        const response = {
          text: result.text,
          ...(result.structuredResult ? { structuredResult: result.structuredResult } : {}),
          groundingMeta: result.groundingMeta,
          // Deterministic 궁합 tier (compatibility mode only) — the client renders/persists it (no extra LLM).
          ...(result.compatibility ? { compatibility: result.compatibility } : {}),
        };
        const completed = await completePaidRequest(paid.context, response);
        return completed
          ? Response.json(completed)
          : Response.json({ error: 'TEMPORARILY_UNAVAILABLE' }, { status: 503 });
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
