// Premium Report client service — generate via the Edge, then persist so the report survives the screen.
//
// The Edge already charged 50덕 and stored the response in `paid_requests.response_json` for idempotent
// replay. That row is a REQUEST artifact, not a library entry: it is keyed by requestId and nothing lists
// it. Saving to `consultation_reports` is what puts the report in 운세우편함 and makes it re-openable.
//
// SAVE FAILURE MUST NOT TOUCH BILLING. The charge already happened server-side and the reader already has
// the report on screen; a DB hiccup here is a library problem, not a refund event. So the save is
// best-effort and returns null on failure — the screen still renders the generated result.
import { logDbError, newRequestId } from '@/features/analysis';
import { isAuthTransportError } from '@/features/chat/adapters/llmError';
import type { ConsultationReport } from '@/features/chat/report/reportService';
import { premiumReportTitle } from '@/features/premium/presentation/premiumReportProjection';
import type { PremiumReportPayload, PremiumReportResult } from '@/features/premium/types';
import { getSupabaseClient } from '@/services/supabase';

const REPORTS = 'consultation_reports';
const COLUMNS = 'id, conversation_id, title, report_payload, report_type, created_at, updated_at';

export type PremiumGenerateOutcome =
  | { status: 'ok'; payload: PremiumReportPayload }
  /** The chart could not be built (e.g. 절기 경계일 + 시각 미상). 청구 0 — the Edge released the reserve. */
  | { status: 'grounding_unavailable'; message: string | null }
  | { status: 'insufficient_duk'; balance: number; required: number; shortfall: number }
  | { status: 'auth' }
  /** AI 처리 동의가 없다 (403 AI_CONSENT_REQUIRED). 화면이 동의 시트를 연다. */
  | { status: 'consent' }
  /** 기본 정보(본인 명식)가 없거나 모양이 깨졌다 (403 PROFILE_REQUIRED). 청구 0 · 재시도로 풀리지 않는다. */
  | { status: 'profile_required' }
  | { status: 'busy' }
  | { status: 'error' };

type EdgeOk = {
  kind?: string;
  result?: PremiumReportResult;
  coveredMonths?: { year: number; month: number }[];
  policyVersion?: string;
  evidenceVersion?: string;
};

/**
 * 2xx 가 아닌 응답의 **본문**을 읽는다.
 *
 * ⚠ 2026-09-18 전수 조사: 예전 코드는 `error.context.body` 를 읽었는데 functions-js 는 `context` 에
 *   **Response 객체**를 담는다(`FunctionsClient.js:273-275`) — `body` 라는 칸은 없다. 그래서 본문이 늘
 *   null 이었고, 덕 부족(402)도 근거 없음(422)도 화면에 **뜬 적이 없다**. 상담 쪽(`llmError.ts`)과
 *   인물 본문(`famousBodyService.ts`)은 이미 `json()` 으로 읽고 있었다 — 그 방법으로 맞춘다.
 */
async function readEdgeErrorBody(error: unknown): Promise<{ body: Record<string, unknown> | null; status?: number }> {
  const ctx = (error as { context?: { status?: number; json?: () => Promise<unknown> } } | null)?.context;
  if (!ctx) return { body: null };
  if (typeof ctx.json !== 'function') return { body: null, status: ctx.status };
  try {
    return { body: (await ctx.json()) as Record<string, unknown>, status: ctx.status };
  } catch {
    return { body: null, status: ctx.status };
  }
}

/**
 * ONE Edge call. `nowIso` is passed in rather than read here so the stored `generatedAt` is the caller's
 * clock and the whole path stays testable without mocking time.
 */
async function generate(nowIso: string): Promise<PremiumGenerateOutcome> {
  try {
    // ⚠ **요청 번호가 없으면 서버가 아무것도 하지 못한다.** 서버는 요청 자리를 요청 번호로 잡는데
    //   (`acquire_paid_request`), 번호가 없으면 자리를 못 잡아 **항상 503** 을 돌려준다
    //   (`chat/index.ts:546` → `:1140`). 2026-09-18 전수 조사에서 찾았다: 앱은 `{ kind }` 만 보내고 있었고,
    //   staging 검증 하네스는 번호를 붙여 보내고 있어서 이 차이가 드러나지 않았다.
    //   번호는 **호출마다 새로** 만든다 — 같은 번호로 다시 부르면 서버가 저장된 답을 돌려주고 다시
    //   청구하지 않는다(멱등). 새 리포트는 새 청구다.
    const requestId = newRequestId();
    const { data, error } = await getSupabaseClient().functions.invoke('chat', {
      body: { kind: 'premium_report', requestMetadata: { requestId } },
    });
    if (error) {
      if (isAuthTransportError(error)) return { status: 'auth' };
      const { body, status } = await readEdgeErrorBody(error);
      const code = typeof body?.error === 'string' ? body.error : null;
      if (code === 'GROUNDING_UNAVAILABLE') {
        return { status: 'grounding_unavailable', message: typeof body?.message === 'string' ? body.message : null };
      }
      if (code === 'INSUFFICIENT_DUK') {
        return {
          status: 'insufficient_duk',
          balance: Number(body?.balance ?? 0),
          required: Number(body?.required ?? 0),
          shortfall: Number(body?.shortfall ?? 0),
        };
      }
      // 403 중에서도 **기본 정보 문제**는 로그인 문제가 아니다 — 재시도 대신 정보 화면으로 보낸다(F-05).
      if (code === 'AI_CONSENT_REQUIRED') return { status: 'consent' };
      if (code === 'PROFILE_REQUIRED') return { status: 'profile_required' };
      if (status === 409 || status === 429) return { status: 'busy' };
      if (status === 401 || status === 403) return { status: 'auth' };
      return { status: 'error' };
    }
    const d = (data ?? {}) as EdgeOk;
    if (!d.result || !Array.isArray(d.coveredMonths)) return { status: 'error' };
    return {
      status: 'ok',
      payload: {
        kind: 'premium_report',
        result: d.result,
        coveredMonths: d.coveredMonths,
        policyVersion: String(d.policyVersion ?? ''),
        evidenceVersion: String(d.evidenceVersion ?? ''),
        generatedAt: nowIso,
      },
    };
  } catch (e) {
    if (isAuthTransportError(e)) return { status: 'auth' };
    return { status: 'error' };
  }
}

/**
 * Persist as a `report_type = 'premium'` row. Always an INSERT: Premium has no conversation, so the
 * one-report-per-conversation unique index does not apply and each purchase is its own library entry.
 * Returns null on any failure — never throws, never affects the charge.
 */
async function save(payload: PremiumReportPayload): Promise<ConsultationReport | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from(REPORTS)
      .insert({
        conversation_id: null,
        title: premiumReportTitle(payload),
        report_payload: payload,
        report_type: 'premium',
        status: 'ready',
      })
      .select(COLUMNS)
      .single();
    if (error) {
      logDbError(error, 'report', 'db');
      return null;
    }
    const r = data as { id: string; conversation_id: string | null; title: string; report_payload: PremiumReportPayload; created_at: string; updated_at?: string | null };
    return {
      id: r.id,
      conversationId: r.conversation_id,
      title: r.title,
      payload: r.report_payload,
      reportType: 'premium',
      createdAt: r.created_at,
      updatedAt: r.updated_at ?? null,
    };
  } catch {
    return null;
  }
}

export const premiumReportService = { generate, save };
