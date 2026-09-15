-- ============================================================================
-- DeokbunAI — Consultation draft persistence table  (repo/DB drift reconciliation)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- This sprint does not deploy or apply it.
--
-- CONTEXT — this is NOT the fix for the reported `loadDraft` error. That error was
-- `DB_ERROR pgCode PGRST303`, which is a PostgREST JWT-group failure ("JWT claims
-- validation or parsing failed", HTTP 401) — an AUTH-layer rejection that happens
-- BEFORE the table is ever evaluated, and it is fixed in application code
-- (src/features/analysis/errors.ts now maps PGRST301/302/303 -> AUTH_REQUIRED).
--
-- This migration exists because the investigation found a separate latent issue:
-- src/features/consultation/services/consultationDraftService.ts reads/writes
-- `public.consultation_drafts` (const TABLE = 'consultation_drafts'), but that
-- relation had NO migration — it "was applied out-of-band and is not otherwise in
-- the repo" (see docs/DRAFT_RLS_SETUP.sql). If the remote DB is ever rebuilt from
-- migrations, the missing table would surface as PGRST205, exactly like the earlier
-- public.profiles gap. This migration brings the out-of-band table under version
-- control. It is fully idempotent, so applying it against a DB where the table was
-- already created out-of-band is a safe no-op.
--
-- Schema copied verbatim from docs/DRAFT_RLS_SETUP.sql (the canonical artifact for
-- this table, itself derived from the service): one row per user (PK = user_id),
-- upsert on conflict user_id; stores ONLY subject + birth_info (JSONB) — never
-- messages, AI responses, prompts, memory summaries, or any secret. `updated_at` is
-- managed entirely by the database (default + trigger). This is a DIFFERENT relation
-- from public.profiles (user account) and consumer_birth_profiles (birth-subject data
-- for the server trust boundary) and is intentionally NOT merged with either.
-- No test/seed data.
-- ============================================================================

-- Shared updated_at trigger fn (idempotent; also created by the profiles /
-- consumer_birth_profiles migrations — create-or-replace makes order/duplication safe).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row per auth user (PK = user_id). `default auth.uid()` lets the row bind to the
-- caller even if the client omits user_id; the client currently sends it explicitly,
-- and RLS below is what actually forbids writing another user's row.
create table if not exists public.consultation_drafts (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  subject     jsonb,
  birth_info  jsonb,
  updated_at  timestamptz not null default now()
);

drop trigger if exists consultation_drafts_set_updated_at on public.consultation_drafts;
create trigger consultation_drafts_set_updated_at before update on public.consultation_drafts
  for each row execute function public.set_updated_at();

-- RLS: a user reads/writes ONLY their own row (user_id = auth.uid()). The WITH CHECK
-- on insert/update rejects a spoofed client-supplied user_id even though the service
-- sends user_id explicitly. Delete policy included for defense-in-depth (the service
-- currently clears via upsert, never a hard delete).
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
