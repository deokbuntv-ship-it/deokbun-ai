-- ============================================================================
-- DeokbunAI — Server Trust Boundary: consumer birth profiles  (Server-Trust §3/§4/§25)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Review, then apply via the Supabase
-- migration flow in a controlled environment. This sprint does not deploy or apply it.
--
-- Purpose: give the SERVER a trusted, RLS-protected source of a user's saved birth
-- subjects, so the Edge can resolve `subjectProfileId → trusted birth` and bind facts to
-- an authenticated owner (instead of only recomputing from client-sent input). Until this
-- is applied, the Edge recomputes from the request's birth INPUT (still server-owned facts).
--
-- Security invariants enforced here:
--   • Row ownership by auth.uid(); RLS ON with FORCE.
--   • A user can read/write ONLY their own rows — a profile id alone is INSUFFICIENT
--     without ownership (cross-user reads are impossible, §25).
--   • No anon/public access. service_role bypasses RLS by design (Edge admin path) and
--     MUST additionally verify owner_user_id in code before trusting a row.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.consumer_birth_profiles (
  id                    uuid primary key default gen_random_uuid(),
  owner_user_id         uuid not null references auth.users (id) on delete cascade,
  subject_label         text,
  display_name          text not null,
  gender                text check (gender in ('male', 'female')),
  calendar_type         text check (calendar_type in ('solar', 'lunar')),
  lunar_month_type      text check (lunar_month_type in ('regular', 'leap')),
  birth_year            integer not null,
  birth_month           integer not null check (birth_month between 1 and 12),
  birth_day             integer not null check (birth_day between 1 and 31),
  birth_time_accuracy   text check (birth_time_accuracy in ('exact', 'approximate', 'unknown')),
  birth_hour            integer check (birth_hour between 0 and 23),
  birth_minute          integer check (birth_minute between 0 and 59),
  approximate_time_period text check (approximate_time_period in ('dawn','morning','afternoon','evening','night')),
  birth_place           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists consumer_birth_profiles_owner_idx
  on public.consumer_birth_profiles (owner_user_id);

-- RLS: owner-only. FORCE so even the table owner role is subject to the policies.
alter table public.consumer_birth_profiles enable row level security;
alter table public.consumer_birth_profiles force row level security;

-- SELECT: only your own rows (a shared/guessed id returns zero rows for another user).
drop policy if exists consumer_birth_profiles_select_own on public.consumer_birth_profiles;
create policy consumer_birth_profiles_select_own
  on public.consumer_birth_profiles for select
  using (owner_user_id = auth.uid());

-- INSERT: may only create rows you own (cannot plant a row under another user).
drop policy if exists consumer_birth_profiles_insert_own on public.consumer_birth_profiles;
create policy consumer_birth_profiles_insert_own
  on public.consumer_birth_profiles for insert
  with check (owner_user_id = auth.uid());

-- UPDATE: only your own rows, and cannot reassign ownership away.
drop policy if exists consumer_birth_profiles_update_own on public.consumer_birth_profiles;
create policy consumer_birth_profiles_update_own
  on public.consumer_birth_profiles for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- DELETE: only your own rows.
drop policy if exists consumer_birth_profiles_delete_own on public.consumer_birth_profiles;
create policy consumer_birth_profiles_delete_own
  on public.consumer_birth_profiles for delete
  using (owner_user_id = auth.uid());

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists consumer_birth_profiles_set_updated_at on public.consumer_birth_profiles;
create trigger consumer_birth_profiles_set_updated_at
  before update on public.consumer_birth_profiles
  for each row execute function public.set_updated_at();
