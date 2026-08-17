-- ============================================================================
-- DeokbunAI — App-owned user profile table  (fixes production PGRST205)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- This sprint does not deploy or apply it.
--
-- ROOT CAUSE of PGRST205 ("Could not find the table 'public.profiles' in the schema
-- cache"): src/features/profile/services/profileService.ts queries `public.profiles`
-- (const TABLE = 'profiles') for ensureProfile/loadProfile/updateDisplayName, but that
-- relation had NO migration — its schema existed only in the docs/CONSUMER_CORE_SCHEMA.sql
-- reference file, so it was never created on the remote DB. This migration creates it.
--
-- This is the app's USER-ACCOUNT profile (1:1 with auth.users; id = auth.uid()). It is a
-- DIFFERENT relation from consumer_birth_profiles (birth-subject data for the server trust
-- boundary) and is intentionally NOT merged with it.
--
-- Schema is copied verbatim from docs/CONSUMER_CORE_SCHEMA.sql (the canonical definition)
-- and matches the profileService contract exactly: { id, display_name }, owner-only RLS
-- (id = auth.uid()), updated_at managed by a trigger. Stores ONLY id + display_name —
-- never email, avatar, tokens, or raw auth metadata (privacy minimization).
-- ============================================================================

-- Shared updated_at trigger fn (idempotent; also created by the consumer_birth_profiles
-- migration — create-or-replace makes order/duplication safe).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row per auth user. Stores only a display name.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS: a user reads/writes ONLY their own row (id = auth.uid()). No DELETE policy —
-- profileService never deletes (upsert / select / update only).
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
