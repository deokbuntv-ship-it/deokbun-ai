-- ============================================================================
-- DeokbunAI — Compatibility (궁합) V1: additive discriminators (report_type, consultation_mode)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- This sprint does not deploy or apply it (NO db push).
--
-- PURPOSE — the report / mailbox / sharing pipeline is already report-type-AGNOSTIC by
-- payload (get_shared_report + PremiumReportView + report_shares all work on the generic
-- 6-field ConsultationReportPayload). The ONLY missing thing to distinguish a 궁합 report
-- from a solo consultation report — and to identify a compatibility conversation on reload
-- — is a discriminator column. This migration adds two ADDITIVE, IDEMPOTENT columns:
--
--   • consultation_reports.report_type  — 'consultation' (default, preserves every existing
--     row) | 'compatibility'. Lets 운세우편함 filter a 궁합 category and lets the report
--     presentation vary its eyebrow/title without a new table.
--   • conversations.consultation_mode   — null (default, = solo) | 'compatibility'. Lets a
--     compatibility conversation be identified on reload/history so its pair chat can resume.
--
-- The 궁합 PAIR itself is DERIVED, not stored (owner §10/§68 — avoid unnecessary tables): the
-- pair = the owner's is_self subject + the conversation's subject_id (= the target subject).
-- No compatibility_pairs table is created. RLS is UNCHANGED (both columns inherit the existing
-- owner-only policies on their tables). No data is migrated; no dating/matching table exists.
-- ============================================================================

-- ---- consultation_reports.report_type ------------------------------------------
alter table public.consultation_reports
  add column if not exists report_type text not null default 'consultation';

-- Filter index for the 운세우편함 궁합 category (owner-scoped list by type).
create index if not exists consultation_reports_user_type_idx
  on public.consultation_reports (user_id, report_type);

-- ---- conversations.consultation_mode -------------------------------------------
-- Nullable: existing + solo conversations stay null; a compatibility conversation is 'compatibility'.
alter table public.conversations
  add column if not exists consultation_mode text;
