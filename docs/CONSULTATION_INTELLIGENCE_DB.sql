-- =============================================================================
-- DeokbunAI — Consultation Intelligence V1.0 schema  (ARTIFACT — owner-apply)
-- =============================================================================
-- Backs src/features/intelligence/** (Evidence Ledger refs, Assessment items,
-- Consultation Case/Trace, Quality reviews, User feedback, Outcome registry).
--
-- ⚠️ ARTIFACT ONLY — NOT auto-applied. Additive + idempotent + non-destructive
--   (create if not exists; drop policy if exists + recreate). NO DROP TABLE /
--   TRUNCATE / DELETE. Owner applies in the Supabase SQL editor after reconciling.
--
-- ⚠️ HOLD (like fortune): NO application code writes these tables yet — the
--   engine→assessment pipeline is CODEX-owned and not wired. Applying now creates
--   empty tables nothing reads. Apply when the Consultation Intelligence pipeline
--   ships. See docs/CONSULTATION_INTELLIGENCE_V1.md and CODEX handoff §21.
--
-- RLS model:
--   * runs + assessment_items are READ-ONLY to the owner/admin and WRITTEN ONLY by
--     the server-side pipeline via the service role (bypasses RLS) — no client write
--     path, so a user cannot fabricate provenance rows the app validator rejects.
--   * user_feedback + outcomes are owner-writable (append-only), owned via the parent
--     conversation (conversations.user_id = auth.uid()); no PII/user id duplicated.
--   * quality_reviews are ADMIN-ONLY (internal review), gated by public.is_admin().
--   * §30 invariant enforced at the DB: an owner-inserted outcome must be
--     source='user_report' + verification_status='unverified' (never self-verified).
--   * Append-only everywhere (no UPDATE/DELETE policies except the quality-review
--     workflow) → history is immutable; re-evaluation is a NEW row (§9/§36).
-- Requires: public.conversations (user_id), public.consultation_subjects,
--   public.is_admin() (docs/admin/ADMIN_SETUP.sql).
-- =============================================================================

-- Ownership helper: does the caller own the conversation behind this run?
create or replace function public.ci_owns_run(p_run_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.consultation_intelligence_runs r
    join public.conversations c on c.id = r.conversation_id
    where r.id = p_run_id and c.user_id = auth.uid()
  );
$$;

-- ---- 1. Consultation Intelligence runs (the case/trace) ----------------------
create table if not exists public.consultation_intelligence_runs (
  id                    uuid primary key default gen_random_uuid(),
  conversation_id       uuid not null references public.conversations (id) on delete cascade,
  message_id            uuid not null,
  request_id            text not null,
  subject_id            uuid references public.consultation_subjects (id) on delete set null,
  question_scope        text not null,
  used_evidence_refs    jsonb not null default '[]'::jsonb,
  used_assessment_refs  jsonb not null default '[]'::jsonb,
  engine_usage          jsonb not null default '[]'::jsonb,
  cross_analysis_ref    text,
  response_ref          text,
  versions              jsonb not null default '{}'::jsonb,
  schema_version        text not null,
  created_at            timestamptz not null default now()
);
create index if not exists ci_runs_conversation_idx on public.consultation_intelligence_runs (conversation_id);
create index if not exists ci_runs_subject_idx on public.consultation_intelligence_runs (subject_id);
alter table public.consultation_intelligence_runs enable row level security;

-- Owner (and admin) may READ own runs. There is NO client INSERT/UPDATE/DELETE
-- policy: runs are produced by the server-side engine→assessment pipeline via the
-- service role (which bypasses RLS). A client write path here would let a user
-- fabricate runs/assessments that isValidAssessmentItem rejects but the DB accepts,
-- polluting the provenance dataset — so it is intentionally omitted (fail-closed).
drop policy if exists ci_runs_select_own on public.consultation_intelligence_runs;
create policy ci_runs_select_own on public.consultation_intelligence_runs for select
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()) or public.is_admin());
-- (removed) ci_runs_insert_own — server/service-role only writes runs.
drop policy if exists ci_runs_insert_own on public.consultation_intelligence_runs;

-- ---- 2. Assessment items -----------------------------------------------------
create table if not exists public.assessment_items (
  id                       uuid primary key default gen_random_uuid(),
  run_id                   uuid not null references public.consultation_intelligence_runs (id) on delete cascade,
  axis_key                 text not null,
  level                    text not null,
  direction                text not null,
  confidence               text not null,
  agreement                text not null,
  applicability            text not null,
  timing                   jsonb,
  warnings                 jsonb not null default '[]'::jsonb,
  supporting_evidence_refs jsonb not null default '[]'::jsonb,
  counter_evidence_refs    jsonb not null default '[]'::jsonb,
  engine_contributions     jsonb not null default '[]'::jsonb,
  schema_version           text not null,
  ruleset_version          text not null,
  created_at               timestamptz not null default now()
);
create index if not exists assessment_items_run_idx on public.assessment_items (run_id);
alter table public.assessment_items enable row level security;

-- Read-only for owner/admin. No client write path: assessment items are produced by
-- the server-side pipeline (service role). A DB CHECK cannot enforce §44 (it can't
-- know whether a ruleset is "connected"), so the fail-closed guard stays in
-- isValidAssessmentItem and the client simply cannot write these rows.
drop policy if exists assessment_items_select_own on public.assessment_items;
create policy assessment_items_select_own on public.assessment_items for select
  using (public.ci_owns_run(run_id) or public.is_admin());
-- (removed) assessment_items_insert_own — server/service-role only.
drop policy if exists assessment_items_insert_own on public.assessment_items;

-- ---- 3. Quality reviews (ADMIN-ONLY internal review) -------------------------
create table if not exists public.consultation_quality_reviews (
  id                 uuid primary key default gen_random_uuid(),
  run_id             uuid not null references public.consultation_intelligence_runs (id) on delete cascade,
  source             text not null check (source in ('auto_evaluator','admin_review')),
  dimensions         jsonb not null default '{}'::jsonb,
  overall            text not null,
  review_status      text not null check (review_status in ('pending','in_review','reviewed')),
  reviewer           text,
  notes_ref          text,
  evaluator_version  text not null,
  schema_version     text not null,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now()
);
create index if not exists ci_quality_run_idx on public.consultation_quality_reviews (run_id);
alter table public.consultation_quality_reviews enable row level security;
-- Admin-only for every action (SELECT/INSERT/UPDATE). Non-admins see nothing.
drop policy if exists ci_quality_admin_all on public.consultation_quality_reviews;
create policy ci_quality_admin_all on public.consultation_quality_reviews for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- 4. User feedback (owner writes; never ground truth) ---------------------
create table if not exists public.user_feedback (
  id                 uuid primary key default gen_random_uuid(),
  run_id             uuid not null references public.consultation_intelligence_runs (id) on delete cascade,
  verdict            text not null check (verdict in ('helpful','not_helpful')),
  -- categorical only (matches feedback.ts FeedbackReason) — never free-text, so no
  -- user-authored PII can land here even via a direct insert (§23/§51).
  reason             text check (reason in ('too_vague','too_long','too_short',
                       'felt_inaccurate','hard_to_understand','not_relevant','other')),
  schema_version     text not null,
  created_at         timestamptz not null default now()
);
create index if not exists user_feedback_run_idx on public.user_feedback (run_id);
alter table public.user_feedback enable row level security;

drop policy if exists user_feedback_select_own on public.user_feedback;
create policy user_feedback_select_own on public.user_feedback for select
  using (public.ci_owns_run(run_id) or public.is_admin());
drop policy if exists user_feedback_insert_own on public.user_feedback;
create policy user_feedback_insert_own on public.user_feedback for insert
  with check (public.ci_owns_run(run_id));

-- ---- 5. Consultation outcomes (provenance-safe; §30 enforced) ----------------
create table if not exists public.consultation_outcomes (
  id                     uuid primary key default gen_random_uuid(),
  run_id                 uuid not null references public.consultation_intelligence_runs (id) on delete cascade,
  related_assessment_ref text,
  outcome_type           text not null,
  occurred_at_period     text,
  source                 text not null check (source in ('user_report','admin_observed','system_observed','external_verified')),
  verification_status    text not null check (verification_status in ('unverified','partially_verified','verified','disputed')),
  confidence             text not null,
  notes_ref              text,
  schema_version         text not null,
  created_at             timestamptz not null default now()
);
create index if not exists ci_outcomes_run_idx on public.consultation_outcomes (run_id);
alter table public.consultation_outcomes enable row level security;

drop policy if exists ci_outcomes_select_own on public.consultation_outcomes;
create policy ci_outcomes_select_own on public.consultation_outcomes for select
  using (public.ci_owns_run(run_id) or public.is_admin());
-- Owner may record ONLY an unverified user_report for their own run (§30). Any
-- 'verified' / higher-provenance outcome is admin-only.
drop policy if exists ci_outcomes_insert_own on public.consultation_outcomes;
create policy ci_outcomes_insert_own on public.consultation_outcomes for insert
  with check (
    public.ci_owns_run(run_id)
    and source = 'user_report'
    and verification_status = 'unverified'
  );
-- Admin may APPEND outcomes (e.g. an admin_observed/external_verified record that
-- supersedes an earlier user_report). Append-only: NO update/delete policy, so
-- history is immutable (§9/§36) — an admin "verifies" by inserting a new
-- higher-provenance outcome, never by overwriting the past one. (SELECT is covered
-- by ci_outcomes_select_own above via is_admin().)
drop policy if exists ci_outcomes_admin_all on public.consultation_outcomes;
drop policy if exists ci_outcomes_insert_admin on public.consultation_outcomes;
create policy ci_outcomes_insert_admin on public.consultation_outcomes for insert
  with check (public.is_admin());

-- ---- 6. Admin Inspector RPCs (SECURITY DEFINER, is_admin()-gated, PII-minimal) --
-- Back src/features/admin/services/adminIntelligenceService.ts. Return ONLY refs,
-- categorical levels, statuses, counts, timestamps — never name/email/birth/
-- question/answer text (§51). Non-admins get an empty set (fail-closed).

create or replace function public.admin_list_intelligence_runs(
  p_search text default null, p_limit int default 50, p_offset int default 0)
returns table (
  run_id uuid, conversation_ref uuid, question_scope text, created_at timestamptz,
  assessment_count bigint, quality_status text, feedback_verdict text, outcome_count bigint)
language sql stable security definer set search_path = public as $$
  select r.id, r.conversation_id, r.question_scope, r.created_at,
    (select count(*) from public.assessment_items ai where ai.run_id = r.id),
    (select q.overall from public.consultation_quality_reviews q
       where q.run_id = r.id order by q.created_at desc limit 1),
    (select f.verdict from public.user_feedback f
       where f.run_id = r.id order by f.created_at desc limit 1),
    (select count(*) from public.consultation_outcomes o where o.run_id = r.id)
  from public.consultation_intelligence_runs r
  where public.is_admin()
    and (p_search is null or r.request_id ilike '%'||p_search||'%'
         or r.conversation_id::text ilike '%'||p_search||'%')
  order by r.created_at desc
  limit greatest(p_limit, 0) offset greatest(p_offset, 0);
$$;

create or replace function public.admin_get_intelligence_run(p_run_id uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not public.is_admin() then null else (
    select jsonb_build_object(
      'run_id', r.id, 'conversation_ref', r.conversation_id,
      'question_scope', r.question_scope, 'created_at', r.created_at,
      'schema_version', r.schema_version,
      'assessments', coalesce((select jsonb_agg(jsonb_build_object(
          'axis_key', ai.axis_key, 'level', ai.level, 'confidence', ai.confidence,
          'ruleset_version', ai.ruleset_version,
          'supporting_evidence_count', jsonb_array_length(ai.supporting_evidence_refs),
          'counter_evidence_count', jsonb_array_length(ai.counter_evidence_refs))
        order by ai.created_at) from public.assessment_items ai where ai.run_id = r.id), '[]'::jsonb),
      'quality_status', (select q.overall from public.consultation_quality_reviews q
          where q.run_id = r.id order by q.created_at desc limit 1),
      'feedback_verdict', (select f.verdict from public.user_feedback f
          where f.run_id = r.id order by f.created_at desc limit 1),
      'outcomes', coalesce((select jsonb_agg(jsonb_build_object(
          'outcome_type', o.outcome_type, 'source', o.source,
          'verification_status', o.verification_status,
          'occurred_at_period', o.occurred_at_period)
        order by o.created_at) from public.consultation_outcomes o where o.run_id = r.id), '[]'::jsonb))
    from public.consultation_intelligence_runs r where r.id = p_run_id) end;
$$;

-- ---- 7. Harden SECURITY DEFINER execute surface --------------------------------
-- Postgres grants EXECUTE to PUBLIC by default. Revoke it and grant only to
-- authenticated — each function already self-gates (admin RPCs via is_admin(),
-- ci_owns_run via auth.uid()), so this just shrinks the definer attack surface.
revoke execute on function public.ci_owns_run(uuid) from public;
grant  execute on function public.ci_owns_run(uuid) to authenticated;
revoke execute on function public.admin_list_intelligence_runs(text, int, int) from public;
grant  execute on function public.admin_list_intelligence_runs(text, int, int) to authenticated;
revoke execute on function public.admin_get_intelligence_run(uuid) from public;
grant  execute on function public.admin_get_intelligence_run(uuid) to authenticated;

-- =============================================================================
-- Post-apply check:
--   select tablename, rowsecurity from pg_tables where schemaname='public'
--    and tablename in ('consultation_intelligence_runs','assessment_items',
--    'consultation_quality_reviews','user_feedback','consultation_outcomes');
--   → all rowsecurity = true.
-- =============================================================================
