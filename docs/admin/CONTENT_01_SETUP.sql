-- =============================================================================
-- DeokbunAI — Content Studio Foundation (CONTENT-01)
-- =============================================================================
-- PROPOSAL ONLY. Apply manually in the Supabase SQL Editor AFTER ADMIN-01
-- (is_admin) and ADMIN-05 (famous_profiles) are applied.
--
-- Canonical content model: content_items (one reusable content record per
-- channel target) + content_versions (immutable generation/edit history — the
-- seam CONTENT-02 AI text generation writes to). Admin-only via public.is_admin()
-- RLS on ALL commands; no service_role in the client. No fake content.
--
-- Verified deps: public.is_admin() (ADMIN-01), public.famous_profiles (ADMIN-05).
-- =============================================================================

begin;

-- 1) content_items -------------------------------------------------------------
create table if not exists public.content_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default '',
  channel      text not null default 'generic',   -- generic|naver_blog|instagram|youtube|video
  source_type  text not null default 'operator',  -- operator|famous|topic
  famous_id    uuid references public.famous_profiles (id) on delete set null,
  status       text not null default 'draft',      -- draft|generating|ready|publish_pending|published|failed|cancelled
  body         text,
  summary      text,
  tags         jsonb not null default '[]'::jsonb,
  created_by   uuid references auth.users (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists content_items_status_idx on public.content_items (status);
create index if not exists content_items_channel_idx on public.content_items (channel);
create index if not exists content_items_updated_at_idx
  on public.content_items (updated_at desc);

-- 2) content_versions (immutable generation/edit history; CONTENT-02 seam) -----
create table if not exists public.content_versions (
  id             uuid primary key default gen_random_uuid(),
  content_id     uuid not null references public.content_items (id) on delete cascade,
  version        int not null default 1,
  title          text,
  body           text,
  summary        text,
  source         text not null default 'manual',   -- manual|ai
  provider       text,
  model          text,
  prompt_version text,
  input_ref      jsonb,
  token_usage    jsonb,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now()
);

create index if not exists content_versions_content_id_idx
  on public.content_versions (content_id, created_at desc);

-- 3) updated_at maintenance ----------------------------------------------------
create or replace function public.content_items_touch()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists content_items_touch_trg on public.content_items;
create trigger content_items_touch_trg
  before update on public.content_items
  for each row execute function public.content_items_touch();

-- 4) RLS: admin-only (all commands). ------------------------------------------
alter table public.content_items enable row level security;
drop policy if exists "content_items admin all" on public.content_items;
create policy "content_items admin all" on public.content_items
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.content_versions enable row level security;
drop policy if exists "content_versions admin all" on public.content_versions;
create policy "content_versions admin all" on public.content_versions
  for all using (public.is_admin()) with check (public.is_admin());

commit;

-- =============================================================================
-- After applying: reload /admin/content as an admin. Non-admins are denied by RLS
-- (fail-closed). AI generation writes content_versions in CONTENT-02.
-- =============================================================================
