import { logDbError } from '@/features/analysis';
import { toConsultationPresentation } from '@/features/chat/presentation/consultationPresentationVM';
import {
  buildConsultationReport,
  type ConsultationReportPayload,
} from '@/features/chat/report/consultationReportComposer';
import { conversationService } from '@/features/chat/services/conversationService';
import { getSupabaseClient } from '@/services/supabase';

// Consultation report persistence (Commercial UX V4 §16/§29). Builds a report DETERMINISTICALLY from the
// conversation's already-validated structured answers + stored summary (buildConsultationReport — ZERO
// extra LLM calls) and upserts it to consultation_reports. Idempotent per conversation (one report;
// regenerate = update). RLS enforces owner-only access (never a broad SELECT); the service does not use
// the service-role key. Report payload holds ONLY user-facing sections — no raw prompt/grounding/engine.

const REPORTS = 'consultation_reports';

export type ConsultationReport = {
  id: string;
  conversationId: string | null;
  title: string;
  payload: ConsultationReportPayload;
  createdAt: string;
};

type ReportRow = {
  id: string;
  conversation_id: string | null;
  title: string;
  report_payload: ConsultationReportPayload;
  created_at: string;
};
const COLUMNS = 'id, conversation_id, title, report_payload, created_at';
const toReport = (r: ReportRow): ConsultationReport => ({
  id: r.id,
  conversationId: r.conversation_id,
  title: r.title,
  payload: r.report_payload,
  createdAt: r.created_at,
});

// Build (or refresh) the report for a conversation. Returns null when there is nothing to report yet
// (no structured assistant answer — eligibility §33) or on a DB failure (logged, never thrown).
async function createOrUpdateReport(
  conversationId: string,
  nowIso: string,
): Promise<ConsultationReport | null> {
  const supabase = getSupabaseClient();

  // 1) The conversation (messages + stored summary), RLS-scoped to the owner. loadConversationById
  //    returns null for a non-owned/absent conversation → nothing to report.
  const loaded = await conversationService.loadConversationById(conversationId);
  if (!loaded) return null;
  const questions = loaded.messages.filter((m) => m.role === 'user').map((m) => m.text);
  const answers = loaded.messages
    .filter((m) => m.role === 'assistant' && m.structuredResult)
    .map((m) => toConsultationPresentation(m.structuredResult!));
  if (answers.length === 0) return null; // eligibility: nothing substantive to report yet

  // Stored summary is reused, never regenerated (§26/§30 — zero extra LLM calls).
  const payload = buildConsultationReport({
    questions,
    answers,
    storedSummary: loaded.summary,
    generatedAt: nowIso,
  });

  // 3) Idempotent: update the existing report (owner-scoped) or insert a new one. user_id is filled by
  //    the DB default auth.uid(); the unique (user_id, conversation_id) index backs the one-per-convo rule.
  const { data: existing } = await supabase
    .from(REPORTS)
    .select('id')
    .eq('conversation_id', conversationId)
    .maybeSingle();

  if (existing && (existing as { id?: string }).id) {
    const { data, error } = await supabase
      .from(REPORTS)
      .update({ title: payload.title, report_payload: payload, status: 'ready' })
      .eq('id', (existing as { id: string }).id)
      .select(COLUMNS)
      .single();
    if (error) {
      logDbError(error, 'report', 'db');
      return null;
    }
    return toReport(data as ReportRow);
  }

  const { data, error } = await supabase
    .from(REPORTS)
    .insert({ conversation_id: conversationId, title: payload.title, report_payload: payload, status: 'ready' })
    .select(COLUMNS)
    .single();
  if (error) {
    logDbError(error, 'report', 'db');
    return null;
  }
  return toReport(data as ReportRow);
}

async function listReports(): Promise<ConsultationReport[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REPORTS)
    .select(COLUMNS)
    .order('created_at', { ascending: false });
  if (error) logDbError(error, 'report', 'db');
  return ((data as ReportRow[] | null) ?? []).map(toReport);
}

async function loadReport(id: string): Promise<ConsultationReport | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(REPORTS).select(COLUMNS).eq('id', id).maybeSingle();
  if (error) logDbError(error, 'report', 'db');
  return data ? toReport(data as ReportRow) : null;
}

export const reportService = { createOrUpdateReport, listReports, loadReport };
