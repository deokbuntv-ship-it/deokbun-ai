-- =============================================================================
-- DeokbunAI — Famous / SEO Management (ADMIN-05)
-- =============================================================================
-- PROPOSAL ONLY. Apply manually in the Supabase SQL Editor AFTER ADMIN-01
-- (admin_users + is_admin) is applied.
--
-- Creates the Famous content-source domain: famous_profiles (identity + birth
-- input + SEO + calculation-state seam) and famous_snapshots (immutable ENGINE
-- calculation snapshots — the APP never computes; snapshots are populated later
-- through an explicit ENGINE seam). Admin-only via public.is_admin() RLS on ALL
-- commands; no service_role in the client. Public read (SEO frontend) is DEFERRED.
--
-- Verified assumptions: relies only on public.is_admin() (ADMIN-01) and auth.users
-- (for created_by default). No public.profiles dependency. gen_random_uuid() is
-- available on Supabase (pgcrypto).
-- =============================================================================

begin;

-- 1) famous_profiles -----------------------------------------------------------
create table if not exists public.famous_profiles (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  category            text,
  occupation          text,
  short_description   text,
  bio                 text,
  birth_info          jsonb,                 -- BirthInfoDraft shape (no calc)
  birth_source        text not null default 'unknown',
  birth_source_note   text,
  status              text not null default 'draft',   -- draft|published|archived
  is_public           boolean not null default false,
  seo_title           text,
  seo_description     text,
  canonical_url       text,
  index_policy        text not null default 'noindex', -- index|noindex
  calculation_state   text not null default 'not_calculated',
  current_snapshot_id uuid,                  -- FK added after snapshots table
  created_by          uuid references auth.users (id) default auth.uid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  published_at        timestamptz
);

create index if not exists famous_profiles_status_idx
  on public.famous_profiles (status);
create index if not exists famous_profiles_updated_at_idx
  on public.famous_profiles (updated_at desc);

-- 2) famous_snapshots (immutable ENGINE calculation snapshots; seam only) ------
create table if not exists public.famous_snapshots (
  id                uuid primary key default gen_random_uuid(),
  famous_id         uuid not null references public.famous_profiles (id) on delete cascade,
  birth_fingerprint text,
  engine_version    text,
  rule_set_version  text,
  result            jsonb,   -- opaque ENGINE output; APP does not interpret/compute
  created_by        uuid references auth.users (id) default auth.uid(),
  created_at        timestamptz not null default now()
);

create index if not exists famous_snapshots_famous_id_idx
  on public.famous_snapshots (famous_id, created_at desc);

alter table public.famous_profiles
  drop constraint if exists famous_profiles_current_snapshot_fk;
alter table public.famous_profiles
  add constraint famous_profiles_current_snapshot_fk
  foreign key (current_snapshot_id)
  references public.famous_snapshots (id) on delete set null;

-- 3) timestamp / publish maintenance ------------------------------------------
create or replace function public.famous_profiles_touch()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  if new.status = 'published'
     and old.status is distinct from 'published'
     and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists famous_profiles_touch_trg on public.famous_profiles;
create trigger famous_profiles_touch_trg
  before update on public.famous_profiles
  for each row execute function public.famous_profiles_touch();

create or replace function public.famous_profiles_touch_insert()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists famous_profiles_touch_insert_trg on public.famous_profiles;
create trigger famous_profiles_touch_insert_trg
  before insert on public.famous_profiles
  for each row execute function public.famous_profiles_touch_insert();

-- 4) RLS: admin-only (all commands). Public read deferred to the SEO frontend. --
alter table public.famous_profiles enable row level security;
drop policy if exists "famous_profiles admin all" on public.famous_profiles;
create policy "famous_profiles admin all" on public.famous_profiles
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.famous_snapshots enable row level security;
drop policy if exists "famous_snapshots admin all" on public.famous_snapshots;
create policy "famous_snapshots admin all" on public.famous_snapshots
  for all using (public.is_admin()) with check (public.is_admin());

commit;

-- =============================================================================
-- After applying: reload /admin/famous as an admin. Non-admins are denied by RLS
-- (fail-closed). Calculation snapshots remain empty until the ENGINE seam is wired
-- in a later sprint (calculation_state stays 'not_calculated').
-- =============================================================================
