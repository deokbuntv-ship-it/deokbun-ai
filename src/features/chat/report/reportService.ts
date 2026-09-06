import { logDbError } from '@/features/analysis';
import type { ConsultationPresentationVM } from '@/features/chat/presentation/consultationPresentationVM';
import { toConsultationPresentation } from '@/features/chat/presentation/consultationPresentationVM';
import {
  buildConsultationReport,
  type ConsultationReportPayload,
} from '@/features/chat/report/consultationReportComposer';
import {
  buildCompatibilityReport,
  type CompatibilityReportDimension,
} from '@/features/chat/report/compatibilityReportComposer';
import { conversationService } from '@/features/chat/services/conversationService';
import type { PremiumReportPayload } from '@/features/premium/types';
import { getSupabaseClient } from '@/services/supabase';

// 'premium' (2026-09-02) is the 50덕 Premium Report. It shares this table and the payload-agnostic
// renderer, but carries its OWN payload shape (PremiumReportPayload) — see src/features/premium/types.ts.
export type ReportType = 'consultation' | 'compatibility' | 'premium';

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
  // A premium row carries PremiumReportPayload instead — discriminate on reportType before reading it.
  payload: ConsultationReportPayload | PremiumReportPayload;
  reportType: ReportType;
  createdAt: string;
  updatedAt: string | null;
};

type ReportRow = {
  id: string;
  conversation_id: string | null;
  title: string;
  report_payload: ConsultationReportPayload | PremiumReportPayload;
  report_type?: string | null;
  created_at: string;
  updated_at?: string | null;
};
// report_type is additive (migration 20260819000000); default 'consultation' keeps every existing row.
const COLUMNS = 'id, conversation_id, title, report_payload, report_type, created_at, updated_at';
const toReport = (r: ReportRow): ConsultationReport => ({
  id: r.id,
  conversationId: r.conversation_id,
  title: r.title,
  payload: r.report_payload,
  reportType: r.report_type === 'compatibility' || r.report_type === 'premium' ? r.report_type : 'consultation',
  createdAt: r.created_at,
  updatedAt: r.updated_at ?? null,
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

// Existing report for a conversation, if any (§29 — the chat CTA shows "보고서 보기" vs "만들기").
// RLS-scoped to the owner; a missing/other-owner report simply returns null.
async function loadReportByConversation(
  conversationId: string,
): Promise<ConsultationReport | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REPORTS)
    .select(COLUMNS)
    .eq('conversation_id', conversationId)
    .maybeSingle();
  if (error) logDbError(error, 'report', 'db');
  return data ? toReport(data as ReportRow) : null;
}

// Build + persist a DETERMINISTIC 궁합 report (Compatibility V1 §41/§48/§50 — ZERO extra LLM calls).
// V1 stores it with conversation_id = null (the pair chat is not conversation-persisted yet) and
// report_type = 'compatibility'; the unique (user_id, conversation_id) index only applies WHERE
// conversation_id IS NOT NULL, so multiple pair reports per owner are allowed. Returns null when there
// is no substantive pair answer yet, or on a DB failure (logged, never thrown).
async function createCompatibilityReport(input: {
  selfLabel: string;
  targetLabel: string;
  overallLabel: string;
  dimensions: readonly CompatibilityReportDimension[];
  questions: readonly string[];
  answers: readonly ConsultationPresentationVM[];
  storedSummary?: string | null;
  generatedAt: string;
}): Promise<ConsultationReport | null> {
  if (input.answers.length === 0) return null; // eligibility: nothing substantive to report yet
  const supabase = getSupabaseClient();
  const payload = buildCompatibilityReport(input);
  const { data, error } = await supabase
    .from(REPORTS)
    .insert({
      conversation_id: null,
      title: payload.title,
      report_payload: payload,
      report_type: 'compatibility',
      status: 'ready',
    })
    .select(COLUMNS)
    .single();
  if (error) {
    logDbError(error, 'report', 'db');
    return null;
  }
  return toReport(data as ReportRow);
}

// Owner-scoped list filtered by report_type (운세우편함 categories: 보고서=consultation / 궁합=compatibility).
async function listReportsByType(reportType: ReportType): Promise<ConsultationReport[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REPORTS)
    .select(COLUMNS)
    .eq('report_type', reportType)
    .order('created_at', { ascending: false });
  if (error) logDbError(error, 'report', 'db');
  return ((data as ReportRow[] | null) ?? []).map(toReport);
}

export const reportService = {
  createOrUpdateReport,
  createCompatibilityReport,
  listReports,
  listReportsByType,
  loadReport,
  loadReportByConversation,
};
