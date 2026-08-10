-- =============================================================================
-- DeokbunAI — Publication Tracking (CONTENT-07 foundation / §23)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER CONTENT_01_SETUP.sql.
--
-- Canonical record of per-channel publication attempts. One content_items row
-- (the canonical content) can have many content_publications (one per channel /
-- attempt). Web publishing is represented by content_items.status='published'
-- itself; this table tracks EXTERNAL channels (naver_blog / instagram / youtube /
-- video) and the scheduling/automation state machine (CONTENT-07).
--
-- State machine: draft → scheduled → queued → processing → published
--                                              ↘ failed        ↘ cancelled
-- idempotency_key prevents duplicate external publishes (automated flows).
--
-- Admin-only via public.is_admin() RLS on ALL commands; no service_role client.
-- =============================================================================

begin;

create table if not exists public.content_publications (
  id              uuid primary key default gen_random_uuid(),
  content_id      uuid not null references public.content_items (id) on delete cascade,
  channel         text not null,                    -- web|naver_blog|instagram|youtube|video
  status          text not null default 'draft',    -- draft|scheduled|queued|processing|published|failed|cancelled
  scheduled_at    timestamptz,
  timezone        text,
  published_at    timestamptz,
  external_id     text,
  external_url    text,
  attempt_count   int  not null default 0,
  last_error      text,
  provider        text,                             -- manual|naver|meta|... (how it was/will be published)
  idempotency_key text,
  metadata        jsonb not null default '{}'::jsonb,
  created_by      uuid references auth.users (id) default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists content_publications_content_idx
  on public.content_publications (content_id, updated_at desc);
create index if not exists content_publications_status_idx
  on public.content_publications (status);
create index if not exists content_publications_scheduled_idx
  on public.content_publications (scheduled_at)
  where status in ('scheduled', 'queued');
-- Idempotency: at most one publication per idempotency_key (automated publishing).
create unique index if not exists content_publications_idem_key
  on public.content_publications (idempotency_key)
  where idempotency_key is not null;

-- updated_at + published_at maintenance ---------------------------------------
create or replace function public.content_publications_touch()
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

drop trigger if exists content_publications_touch_trg on public.content_publications;
create trigger content_publications_touch_trg
  before update on public.content_publications
  for each row execute function public.content_publications_touch();

create or replace function public.content_publications_touch_insert()
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

drop trigger if exists content_publications_touch_insert_trg on public.content_publications;
create trigger content_publications_touch_insert_trg
  before insert on public.content_publications
  for each row execute function public.content_publications_touch_insert();

alter table public.content_publications enable row level security;
drop policy if exists "content_publications admin all" on public.content_publications;
create policy "content_publications admin all" on public.content_publications
  for all using (public.is_admin()) with check (public.is_admin());

commit;

-- =============================================================================
-- After applying: the admin content detail page can record external publications
-- (e.g. Naver Blog manual publish → status=published + external_url). Automated
-- channels (Instagram, scheduled publishing) reuse this table with provider set
-- and idempotency_key to prevent double-publishing.
-- =============================================================================
