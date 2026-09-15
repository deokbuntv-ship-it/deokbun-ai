// Premium Report client service — generate via the Edge, then persist so the report survives the screen.
//
// The Edge already charged 50덕 and stored the response in `paid_requests.response_json` for idempotent
// replay. That row is a REQUEST artifact, not a library entry: it is keyed by requestId and nothing lists
// it. Saving to `consultation_reports` is what puts the report in 운세우편함 and makes it re-openable.
//
// SAVE FAILURE MUST NOT TOUCH BILLING. The charge already happened server-side and the reader already has
// the report on screen; a DB hiccup here is a library problem, not a refund event. So the save is
// best-effort and returns null on failure — the screen still renders the generated result.
import { logDbError } from '@/features/analysis';
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
 * ONE Edge call. `nowIso` is passed in rather than read here so the stored `generatedAt` is the caller's
 * clock and the whole path stays testable without mocking time.
 */
async function generate(nowIso: string): Promise<PremiumGenerateOutcome> {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('chat', {
      body: { kind: 'premium_report' },
    });
    if (error) {
      if (isAuthTransportError(error)) return { status: 'auth' };
      // functions.invoke surfaces a non-2xx as an error whose context carries the response body.
      const ctx = (error as { context?: { status?: number; body?: unknown } }).context;
      const status = ctx?.status;
      let body: Record<string, unknown> | null = null;
      try {
        body = typeof ctx?.body === 'string' ? JSON.parse(ctx.body) : (ctx?.body as Record<string, unknown> | null);
      } catch { body = null; }
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
