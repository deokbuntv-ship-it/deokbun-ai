-- =============================================================================
-- DeokbunAI — CONSUMER CORE SCHEMA (profiles, consultation_subjects,
-- conversations, conversation_messages) + Row-Level Security
-- =============================================================================
--
-- WHY THIS FILE EXISTS
--   These four tables are used everywhere by the consumer app and by the admin
--   RPCs (admin_list_users / admin_get_user / admin_list_consultations /
--   admin_get_consultation), but — unlike the admin/content tables — their DDL
--   and RLS were applied out-of-band and were NOT in the repo. That made the
--   backend non-reproducible and the consumer-table RLS unverifiable from source.
--   This file closes that gap. It is DERIVED FROM THE APP CODE (the exact
--   column names/types come from the services below), not from a live dump.
--
--   Source of truth for columns:
--     profiles                → src/features/profile/services/profileService.ts
--     consultation_subjects   → src/features/consultation/services/consultationSubjectService.ts
--     conversations           → src/features/chat/services/conversationService.ts
--     conversation_messages   → src/features/chat/services/conversationService.ts
--
-- OWNER ACTION (⚠️ DO NOT blindly apply to production):
--   The live tables already exist. This script is written to be IDEMPOTENT and
--   NON-DESTRUCTIVE (CREATE ... IF NOT EXISTS; it never DROPs a table/column and
--   never deletes data). BEFORE running it against the live DB, RECONCILE it with
--   the current schema (compare column names/types/constraints). The RLS section
--   re-creates policies by name — review that the intended owner-only model below
--   matches (or safely supersedes) whatever policies are live. Apply in the
--   Supabase SQL editor, same as the other docs/*.sql setup files.
--
-- SECURITY MODEL (constitution 제19조 / privacy): every row is owner-scoped to
--   auth.uid(). conversation_messages has NO user_id — ownership is enforced via
--   a join to its parent conversation. Admin reads go through SECURITY DEFINER
--   RPCs gated by is_admin(); they do not need extra table policies here.
-- =============================================================================

-- ---- shared: updated_at trigger ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---- profiles ------------------------------------------------------------------
-- One row per auth user. Stores only a display name (no email/avatar/tokens).
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---- consultation_subjects -----------------------------------------------------
-- Saved "analysis subjects" (본인/배우자/자녀/…). birth_info is a JSONB snapshot of
-- the app BirthInfoDraft. At most one is_self=true per user.
create table if not exists public.consultation_subjects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null,
  relationship text,
  is_self      boolean not null default false,
  birth_info   jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists consultation_subjects_user_id_idx
  on public.consultation_subjects (user_id);
-- one primary (self) subject per user
create unique index if not exists consultation_subjects_one_self_per_user
  on public.consultation_subjects (user_id) where (is_self);

-- ---- conversations -------------------------------------------------------------
-- One consultation thread, tied to a subject. summary/last_summarized_message_id
-- back the conversation-memory layer. subject_snapshot freezes the subject at
-- creation time so past meaning is immutable.
create table if not exists public.conversations (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id                  uuid references public.consultation_subjects (id) on delete set null,
  subject_snapshot            jsonb,
  summary                     text,
  last_summarized_message_id  uuid,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists conversations_user_id_idx on public.conversations (user_id);
create index if not exists conversations_subject_id_idx on public.conversations (subject_id);

-- ---- conversation_messages -----------------------------------------------------
-- Append-only messages. NO user_id (ownership via the parent conversation).
-- (conversation_id, client_message_id) is unique for idempotent upserts.
-- Never stores prompt text, memory summary, keys, or JWTs.
create table if not exists public.conversation_messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.conversations (id) on delete cascade,
  role              text not null check (role in ('user', 'assistant', 'system')),
  content           text not null,
  client_message_id text not null,
  created_at        timestamptz not null default now(),
  -- Monotonic ordering column the app read path depends on: conversationService
  -- reads `.order('seq')` and admin_get_consultation (ADMIN_03) returns m.seq. It
  -- exists on the LIVE table but was missing from this reproducibility artifact.
  -- `create table if not exists` is a no-op on the live DB, so this only fixes a
  -- from-scratch rebuild. OWNER/DEV: confirm the exact live definition via
  -- `\d public.conversation_messages` before relying on this file for a rebuild.
  seq               bigint generated always as identity
);
create unique index if not exists conversation_messages_conv_client_uniq
  on public.conversation_messages (conversation_id, client_message_id);
create index if not exists conversation_messages_conversation_id_idx
  on public.conversation_messages (conversation_id);

-- ---- updated_at triggers -------------------------------------------------------
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists consultation_subjects_set_updated_at on public.consultation_subjects;
create trigger consultation_subjects_set_updated_at before update on public.consultation_subjects
  for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW-LEVEL SECURITY  (owner-only; review before applying — see header)
-- =============================================================================
alter table public.profiles                enable row level security;
alter table public.consultation_subjects   enable row level security;
alter table public.conversations           enable row level security;
alter table public.conversation_messages   enable row level security;

-- profiles: user reads/writes only their own row
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- consultation_subjects: owner-scoped CRUD
drop policy if exists subjects_all_own on public.consultation_subjects;
create policy subjects_all_own on public.consultation_subjects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- conversations: owner-scoped CRUD; a written subject_id must belong to the user
drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own on public.conversations
  for select using (user_id = auth.uid());
drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own on public.conversations
  for insert with check (
    user_id = auth.uid()
    and (
      subject_id is null
      or exists (
        select 1 from public.consultation_subjects s
        where s.id = subject_id and s.user_id = auth.uid()
      )
    )
  );
drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own on public.conversations
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- conversation_messages: ownership via the parent conversation (no user_id here).
-- Append-only for users: select + insert only (no update/delete policies).
drop policy if exists messages_select_via_conversation on public.conversation_messages;
create policy messages_select_via_conversation on public.conversation_messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );
drop policy if exists messages_insert_via_conversation on public.conversation_messages;
create policy messages_insert_via_conversation on public.conversation_messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- =============================================================================
-- END. This file is documentation + reproducibility scaffolding; the account
-- owner applies/reconciles it. It does not run automatically anywhere.
-- =============================================================================
