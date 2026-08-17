-- =============================================================================
-- DeokbunAI — consultation_drafts table + ownership RLS  (ARTIFACT — owner-apply)
-- =============================================================================
-- Resolves Security Audit finding M1: consultationDraftService.ts upserts a
-- CLIENT-SUPPLIED `user_id`. That is only safe if RLS forbids writing another
-- user's row. This artifact encodes that guard. Derived from the service
-- (src/features/consultation/services/consultationDraftService.ts): one row per
-- user (PK = user_id), upsert on conflict user_id; stores only subject +
-- birth_info (JSONB), never messages/prompts/secrets.
--
-- ⚠️ SUPERSEDED AS THE CANONICAL SOURCE — this table is now version-controlled as
-- supabase/migrations/20260817000200_consultation_drafts.sql (same idempotent schema
-- + RLS). This file is kept for the audit trail / rationale. Apply via the migration,
-- not this artifact. It was originally applied out-of-band; the migration reconciles
-- that drift and is a safe no-op where the table already exists.
-- Idempotent + non-destructive.
--
-- RECOMMENDED FIX = Strategy 1 (RLS WITH CHECK). It closes the hole WITHOUT any
-- app code change and works with the existing client-supplied-user_id upsert.
-- =============================================================================

create table if not exists public.consultation_drafts (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  subject     jsonb,
  birth_info  jsonb,
  updated_at  timestamptz not null default now()
);

drop trigger if exists consultation_drafts_set_updated_at on public.consultation_drafts;
create trigger consultation_drafts_set_updated_at before update on public.consultation_drafts
  for each row execute function public.set_updated_at();  -- from CONSUMER_CORE_SCHEMA.sql

-- ---- Strategy 1 (RECOMMENDED): owner-only RLS with WITH CHECK -----------------
-- Even if a client sends a spoofed user_id in the upsert payload, INSERT/UPDATE
-- are rejected unless user_id = auth.uid(). No app code change required.
alter table public.consultation_drafts enable row level security;

drop policy if exists drafts_select_own on public.consultation_drafts;
create policy drafts_select_own on public.consultation_drafts
  for select using (user_id = auth.uid());

drop policy if exists drafts_insert_own on public.consultation_drafts;
create policy drafts_insert_own on public.consultation_drafts
  for insert with check (user_id = auth.uid());

drop policy if exists drafts_update_own on public.consultation_drafts;
create policy drafts_update_own on public.consultation_drafts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists drafts_delete_own on public.consultation_drafts;
create policy drafts_delete_own on public.consultation_drafts
  for delete using (user_id = auth.uid());

-- ---- Strategy 2 (OPTIONAL defense-in-depth): stop trusting the client --------
-- With the `default auth.uid()` above already in place, the client no longer
-- NEEDS to send user_id. To adopt, change the service upserts to omit user_id:
--     .upsert({ subject, birth_info }, { onConflict: 'user_id' })
-- Postgres fills user_id from the default and matches the per-user row. Strategy 1
-- must still be applied — the default alone does not stop a spoofed explicit value.
-- =============================================================================
