// Admin Consultation Intelligence Inspector — READ SEAM (backend contract, §40).
// Lets an admin trace WHY a past consultation was given: which evidence → which
// assessment (categorical, never a fake score) → the answer, plus its quality
// review, user feedback, and any later outcome.
//
// STATUS: the engine→assessment pipeline is CODEX-owned and NOT connected, and
// docs/CONSULTATION_INTELLIGENCE_DB.sql is HOLD (owner-apply). So this seam reports
// `connected: false` and returns empty/null — the Inspector screen renders a
// truthful "연결 준비 중" state and NEVER fabricates runs, levels, scores, or
// outcomes (AI_CONSTITUTION 제3조 Mock 금지; directive §44 fail-closed / §45 no fake
// score). When the pipeline + SQL ship, wire the two `TODO(codex)` lines to the
// SECURITY DEFINER RPCs (admin_list_intelligence_runs / admin_get_intelligence_run,
// both gated by public.is_admin()) — this file is the single place that changes.
//
// PII-MINIMAL (§51): only refs, categorical levels, statuses, counts, timestamps
// are ever surfaced — never name/email/birth/question/answer text.

import type {
  AssessmentAxis,
  AssessmentLevel,
  AssessmentConfidence,
  FeedbackVerdict,
  OutcomeVerificationStatus,
  QualityStatus,
} from '@/features/intelligence';

export type AdminIntelligenceRunListItem = {
  runId: string;
  conversationRef: string;
  questionScope: string;
  createdAt: string;
  assessmentCount: number;
  qualityStatus: QualityStatus;
  feedbackVerdict: FeedbackVerdict | null;
  outcomeCount: number;
};

export type AdminAssessmentRow = {
  axisKey: AssessmentAxis;
  level: AssessmentLevel; // categorical only — no numeric score
  confidence: AssessmentConfidence;
  rulesetVersion: string; // 'not_connected' until the ruleset is wired (fail-closed)
  supportingEvidenceCount: number;
  counterEvidenceCount: number;
};

export type AdminOutcomeRow = {
  outcomeType: string;
  source: string;
  verificationStatus: OutcomeVerificationStatus; // user reports stay 'unverified' (§30)
  occurredAtPeriod: string | null;
};

export type AdminIntelligenceRunDetail = {
  runId: string;
  conversationRef: string;
  questionScope: string;
  createdAt: string;
  schemaVersion: string;
  assessments: AdminAssessmentRow[];
  qualityStatus: QualityStatus;
  feedbackVerdict: FeedbackVerdict | null;
  outcomes: AdminOutcomeRow[];
};

// False until the intelligence pipeline is connected AND the schema is applied.
// The screen reads this to choose "연결 준비 중" over an empty data table.
const INTELLIGENCE_INSPECTOR_CONNECTED = false;

async function isConnected(): Promise<boolean> {
  return INTELLIGENCE_INSPECTOR_CONNECTED;
}

async function listRuns(_params: {
  search?: string;
  limit: number;
  offset: number;
}): Promise<AdminIntelligenceRunListItem[]> {
  if (!INTELLIGENCE_INSPECTOR_CONNECTED) return [];
  // TODO(codex): return supabase.rpc('admin_list_intelligence_runs', {...})
  return [];
}

async function getRun(_runId: string): Promise<AdminIntelligenceRunDetail | null> {
  if (!INTELLIGENCE_INSPECTOR_CONNECTED) return null;
  // TODO(codex): return supabase.rpc('admin_get_intelligence_run', { p_run_id })
  return null;
}

export const adminIntelligenceService = { isConnected, listRuns, getRun };
