-- ============================================================================
-- DeokbunAI — Consumer core: consultation_subjects + conversations +
-- conversation_messages  (repo/DB reproducibility reconciliation)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- This sprint does not deploy or apply it.
--
-- CONTEXT — these three tables back the LIVE consumer consultation path
-- (consultationSubjectService, conversationService, useConversationPersistence) but
-- had NO version-controlled migration; their DDL lived only in the code-derived
-- reference docs/CONSUMER_CORE_SCHEMA.sql. A read-only production probe (runbook §B2,
-- 2026-08-14) confirmed all three EXIST live with RLS on — so this migration is a
-- SAFE, IDEMPOTENT NO-OP against production (create-if-not-exists / drop-policy-if-
-- exists). It exists purely to make a from-migrations rebuild reproducible (else the
-- tables would surface as PGRST205), completing the set after profiles
-- (20260817000100), consumer_birth_profiles (20260817000000), and consultation_drafts
-- (20260817000200). `profiles` is intentionally NOT re-created here (already migrated).
--
-- Schema copied verbatim from docs/CONSUMER_CORE_SCHEMA.sql (derived from app code).
-- Owner-scoped RLS (auth.uid()); conversation_messages ownership is via the parent
-- conversation (no user_id column). No test/seed data. Never stores prompt text,
-- memory summary, keys, or JWTs.
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

-- ---- consultation_subjects -----------------------------------------------------
-- Saved analysis subjects (본인/배우자/자녀/…). birth_info = JSONB BirthInfoDraft
-- snapshot. At most one is_self=true per user.
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
create unique index if not exists consultation_subjects_one_self_per_user
  on public.consultation_subjects (user_id) where (is_self);

-- ---- conversations -------------------------------------------------------------
-- One consultation thread, tied to a subject. subject_snapshot freezes the subject
-- at creation time. summary/last_summarized_message_id back the memory layer.
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
-- Append-only messages. NO user_id (ownership via parent conversation).
-- (conversation_id, client_message_id) unique for idempotent upserts. `seq` is the
-- monotonic order column the read path (.order('seq')) + admin RPC depend on.
create table if not exists public.conversation_messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.conversations (id) on delete cascade,
  role              text not null check (role in ('user', 'assistant', 'system')),
  content           text not null,
  client_message_id text not null,
  created_at        timestamptz not null default now(),
  seq               bigint generated always as identity
);
create unique index if not exists conversation_messages_conv_client_uniq
  on public.conversation_messages (conversation_id, client_message_id);
create index if not exists conversation_messages_conversation_id_idx
  on public.conversation_messages (conversation_id);

-- ---- updated_at triggers -------------------------------------------------------
drop trigger if exists consultation_subjects_set_updated_at on public.consultation_subjects;
create trigger consultation_subjects_set_updated_at before update on public.consultation_subjects
  for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW-LEVEL SECURITY (owner-only; auth.uid()). Idempotent (drop-if-exists + create).
-- ============================================================================
alter table public.consultation_subjects   enable row level security;
alter table public.conversations           enable row level security;
alter table public.conversation_messages   enable row level security;

-- consultation_subjects: owner-scoped CRUD
drop policy if exists subjects_all_own on public.consultation_subjects;
create policy subjects_all_own on public.consultation_subjects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- conversations: owner-scoped; a written subject_id must belong to the user
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

-- conversation_messages: ownership via the parent conversation (append-only:
-- select + insert only, no update/delete policies).
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
