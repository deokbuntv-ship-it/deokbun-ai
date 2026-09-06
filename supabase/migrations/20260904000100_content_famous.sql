-- ============================================================================
-- DeokbunAI — CONTENT & FAMOUS DOMAIN (승격 묶음 2 / 5)
--
-- Consolidates NINE out-of-band artifacts into ONE idempotent migration, IN THIS ORDER:
--   docs/admin/ADMIN_05_SETUP.sql            famous_profiles, famous_snapshots
--   docs/admin/CONTENT_01_SETUP.sql          content_items, content_versions
--   docs/admin/PUBLICATION_SETUP.sql         content_publications
--   docs/admin/CONTENT_ASSETS_SETUP.sql      content_assets + content_items.hero_image_url
--   docs/admin/CONTENT_05_07_SETUP.sql       provider_connections
--   docs/admin/FAMOUS_AI_SETUP.sql           famous_ai_suggestions
--   docs/PUBLIC_SETUP.sql                    slug/category/published_at + public read RPCs
--   docs/admin/PUBLIC_UPDATE_search_alt.sql  content_items.hero_alt + search
--   docs/admin/SCHEDULER_SETUP.sql           admin_list_scheduled_publications
--   docs/admin/VIDEO_SETUP.sql               content_items.video_url
--
-- ⚠ THE ORDERING HAZARD THIS FILE EXISTS TO KILL (PROJECT_STATE §7.10)
--   `public_list_content` was defined THREE times across three files with TWO different
--   signatures. CONTENT_ASSETS drops the 3-arg form and re-creates it with a bare
--   `create function`; PUBLIC_UPDATE_search_alt drops BOTH and creates the 4-arg form. Run
--   them out of order and the database ends up with BOTH overloads, at which point PostgREST
--   cannot resolve `rpc('public_list_content', …)` and the /content page dies with PGRST203.
--   Here the intermediate definitions are simply NOT WRITTEN. Only the FINAL shape of each
--   function is created, after dropping every historical signature. There is no order to get
--   wrong because there is only one definition.
--
--   Same treatment for `public_get_content`: PUBLIC_SETUP → CONTENT_ASSETS → VIDEO_SETUP each
--   redefined it. Only VIDEO_SETUP's final body (hero_alt + video_url) survives here.
--   Same for `content_items_touch`: CONTENT_01's version had no published_at stamping and
--   PUBLIC_SETUP replaced it. Only the replacement is written.
--
-- SCHEDULER_SETUP is included here rather than in its own bundle because rule 1 is
-- "one file = one domain", and `admin_list_scheduled_publications` reads content_publications
-- and content_items — it has no meaning outside this domain.
--
-- 3 RULES: one domain, ordered inside · per-signature drop then create or replace · no
-- unguarded insert. This file seeds nothing.
--
-- Depends on: public.is_admin() and auth.users (묶음 1 / 20260904000000).
-- ============================================================================

-- ── 1. famous_profiles + famous_snapshots (ADMIN_05) ────────────────────────────────────────
create table if not exists public.famous_profiles (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  category            text,
  occupation          text,
  short_description   text,
  bio                 text,
  birth_info          jsonb,                            -- BirthInfoDraft shape. The APP NEVER computes from it.
  birth_source        text not null default 'unknown',  -- confirmed|reported|estimated|unknown
  birth_source_note   text,
  status              text not null default 'draft',    -- draft|published|archived
  is_public           boolean not null default false,
  seo_title           text,
  seo_description     text,
  canonical_url       text,
  index_policy        text not null default 'noindex',  -- index|noindex
  calculation_state   text not null default 'not_calculated',
  current_snapshot_id uuid,                             -- FK added after the snapshots table exists
  created_by          uuid references auth.users (id) default auth.uid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  published_at        timestamptz
);

create index if not exists famous_profiles_status_idx     on public.famous_profiles (status);
create index if not exists famous_profiles_updated_at_idx on public.famous_profiles (updated_at desc);

-- IMMUTABLE engine snapshots. The ENGINE FIREWALL lives here: human-edited text is in
-- famous_profiles, computed output is in this table, and nothing merges them.
create table if not exists public.famous_snapshots (
  id                uuid primary key default gen_random_uuid(),
  famous_id         uuid not null references public.famous_profiles (id) on delete cascade,
  birth_fingerprint text,
  engine_version    text,
  rule_set_version  text,
  result            jsonb,   -- opaque ENGINE output; the app does not interpret or recompute
  created_by        uuid references auth.users (id) default auth.uid(),
  created_at        timestamptz not null default now()
);

create index if not exists famous_snapshots_famous_id_idx
  on public.famous_snapshots (famous_id, created_at desc);

-- drop-then-add makes the constraint idempotent (there is no `add constraint if not exists`).
alter table public.famous_profiles
  drop constraint if exists famous_profiles_current_snapshot_fk;
alter table public.famous_profiles
  add constraint famous_profiles_current_snapshot_fk
  foreign key (current_snapshot_id)
  references public.famous_snapshots (id) on delete set null;

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

alter table public.famous_profiles enable row level security;
drop policy if exists "famous_profiles admin all" on public.famous_profiles;
create policy "famous_profiles admin all" on public.famous_profiles
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.famous_snapshots enable row level security;
drop policy if exists "famous_snapshots admin all" on public.famous_snapshots;
create policy "famous_snapshots admin all" on public.famous_snapshots
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 2. content_items + content_versions (CONTENT_01) ────────────────────────────────────────
-- Columns added later by PUBLIC_SETUP / CONTENT_ASSETS / PUBLIC_UPDATE / VIDEO are declared
-- inline here so a fresh environment gets the final shape in one statement; the `alter … add
-- column if not exists` block below converges an environment that already has the old shape.
create table if not exists public.content_items (
  id             uuid primary key default gen_random_uuid(),
  title          text not null default '',
  channel        text not null default 'generic',   -- generic|naver_blog|instagram|youtube|video
  source_type    text not null default 'operator',  -- operator|famous|topic
  famous_id      uuid references public.famous_profiles (id) on delete set null,
  status         text not null default 'draft',     -- draft|generating|ready|publish_pending|published|failed|cancelled
  body           text,
  summary        text,
  tags           jsonb not null default '[]'::jsonb,
  slug           text,
  category       text,
  hero_image_url text,
  hero_alt       text,
  video_url      text,
  published_at   timestamptz,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Convergence for an environment created by the older CONTENT_01 shape.
alter table public.content_items
  add column if not exists slug           text,
  add column if not exists category       text,
  add column if not exists hero_image_url text,
  add column if not exists hero_alt       text,
  add column if not exists video_url      text,
  add column if not exists published_at   timestamptz;

create index if not exists content_items_status_idx     on public.content_items (status);
create index if not exists content_items_channel_idx    on public.content_items (channel);
create index if not exists content_items_updated_at_idx on public.content_items (updated_at desc);
create unique index if not exists content_items_slug_key
  on public.content_items (slug) where slug is not null;
create index if not exists content_items_published_idx  on public.content_items (status, published_at desc);
create index if not exists content_items_category_idx   on public.content_items (category);

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

-- FINAL body only: CONTENT_01's version did not stamp published_at; PUBLIC_SETUP's does.
create or replace function public.content_items_touch()
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

drop trigger if exists content_items_touch_trg on public.content_items;
create trigger content_items_touch_trg
  before update on public.content_items
  for each row execute function public.content_items_touch();

create or replace function public.content_items_touch_insert()
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

drop trigger if exists content_items_touch_insert_trg on public.content_items;
create trigger content_items_touch_insert_trg
  before insert on public.content_items
  for each row execute function public.content_items_touch_insert();

alter table public.content_items enable row level security;
drop policy if exists "content_items admin all" on public.content_items;
create policy "content_items admin all" on public.content_items
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.content_versions enable row level security;
drop policy if exists "content_versions admin all" on public.content_versions;
create policy "content_versions admin all" on public.content_versions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 3. content_publications (PUBLICATION) ───────────────────────────────────────────────────
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
  provider        text,
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
-- At most one publication per idempotency_key — the guard against double external publishing.
create unique index if not exists content_publications_idem_key
  on public.content_publications (idempotency_key)
  where idempotency_key is not null;

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

-- ── 4. content_assets (CONTENT_ASSETS) ──────────────────────────────────────────────────────
create table if not exists public.content_assets (
  id               uuid primary key default gen_random_uuid(),
  content_id       uuid references public.content_items (id) on delete cascade,
  kind             text not null,                    -- image|video
  status           text not null default 'pending',  -- pending|processing|completed|failed|cancelled
  provider         text,                             -- manual|<future provider>
  provider_job_id  text,
  prompt           text,
  model            text,
  aspect_ratio     text,
  duration_seconds int,
  width            int,
  height           int,
  storage_path     text,                             -- Supabase Storage key (generated assets)
  external_url     text,                             -- manual/attached or provider-returned URL
  error_code       text,
  last_error       text,
  metadata         jsonb not null default '{}'::jsonb,
  created_by       uuid references auth.users (id) default auth.uid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists content_assets_content_idx on public.content_assets (content_id, updated_at desc);
create index if not exists content_assets_status_idx  on public.content_assets (kind, status);

create or replace function public.content_assets_touch()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists content_assets_touch_trg on public.content_assets;
create trigger content_assets_touch_trg
  before update on public.content_assets
  for each row execute function public.content_assets_touch();

alter table public.content_assets enable row level security;
drop policy if exists "content_assets admin all" on public.content_assets;
create policy "content_assets admin all" on public.content_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 5. provider_connections (CONTENT_05_07) ─────────────────────────────────────────────────
-- STATUS ONLY. OAuth access tokens must NEVER be stored here — they live in Edge secrets or a
-- service-role-only table with no client policy. Do not add a token column.
create table if not exists public.provider_connections (
  id                    uuid primary key default gen_random_uuid(),
  channel               text not null unique,                   -- instagram|youtube|...
  status                text not null default 'not_connected',  -- not_connected|connected|expired|error
  external_account_id   text,
  external_account_name text,
  connected_at          timestamptz,
  metadata              jsonb not null default '{}'::jsonb,
  updated_at            timestamptz not null default now()
);

create or replace function public.provider_connections_touch()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists provider_connections_touch_trg on public.provider_connections;
create trigger provider_connections_touch_trg
  before update on public.provider_connections
  for each row execute function public.provider_connections_touch();

alter table public.provider_connections enable row level security;
drop policy if exists "provider_connections admin all" on public.provider_connections;
create policy "provider_connections admin all" on public.provider_connections
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 6. famous_ai_suggestions (FAMOUS_AI) ────────────────────────────────────────────────────
-- Provenance for AI-generated suggestions. Optional to the famous-suggest Edge (it writes
-- best-effort); applying this turns on suggestion history/audit.
create table if not exists public.famous_ai_suggestions (
  id             uuid primary key default gen_random_uuid(),
  famous_id      uuid references public.famous_profiles (id) on delete cascade,
  suggestion     jsonb not null,
  provider       text,
  model          text,
  workload       text,
  prompt_version text,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now()
);

create index if not exists famous_ai_suggestions_famous_idx
  on public.famous_ai_suggestions (famous_id, created_at desc);

alter table public.famous_ai_suggestions enable row level security;
drop policy if exists "famous_ai_suggestions admin all" on public.famous_ai_suggestions;
create policy "famous_ai_suggestions admin all" on public.famous_ai_suggestions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 7. PUBLIC read RPCs — FINAL SIGNATURES ONLY ─────────────────────────────────────────────
-- Column-level control is why these are SECURITY DEFINER RPCs and not a broad SELECT policy:
-- they return ONLY published rows and ONLY public-safe columns — no draft, no created_by, no
-- admin state, no provenance, no raw ENGINE snapshot, no raw birth_info.

-- public_list_content: every historical signature is dropped first (RULE 2). The 3-arg form
-- from PUBLIC_SETUP/CONTENT_ASSETS is intentionally never created.
drop function if exists public.public_list_content(text, int, int);
drop function if exists public.public_list_content(text, text, int, int);
create or replace function public.public_list_content(
  p_category text default null,
  p_search   text default null,
  p_limit    int  default 20,
  p_offset   int  default 0
)
returns table (
  slug           text,
  title          text,
  summary        text,
  channel        text,
  category       text,
  tags           jsonb,
  hero_image_url text,
  hero_alt       text,
  published_at   timestamptz,
  famous_slug    text,
  famous_name    text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    c.slug, c.title, c.summary, c.channel, c.category, c.tags, c.hero_image_url,
    c.hero_alt, c.published_at, f.slug, f.name
  from public.content_items c
  left join public.famous_profiles f
    on f.id = c.famous_id and f.status = 'published' and f.is_public = true
  where c.status = 'published'
    and c.slug is not null
    and (p_category is null or c.category = p_category)
    and (
      p_search is null or p_search = ''
      or c.title ilike '%' || p_search || '%'
      or c.summary ilike '%' || p_search || '%'
    )
  order by c.published_at desc nulls last, c.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.public_list_content(text, text, int, int) from public;
grant execute on function public.public_list_content(text, text, int, int) to anon, authenticated;

-- public_get_content: FINAL body (VIDEO_SETUP) — includes hero_alt and video_url.
drop function if exists public.public_get_content(text);
create or replace function public.public_get_content(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_cat text;
  res jsonb;
begin
  select id, category into v_id, v_cat
  from public.content_items
  where slug = p_slug and status = 'published' and slug is not null;

  if v_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'slug', c.slug,
    'title', c.title,
    'summary', c.summary,
    'body', c.body,
    'channel', c.channel,
    'category', c.category,
    'tags', c.tags,
    'hero_image_url', c.hero_image_url,
    'hero_alt', c.hero_alt,
    'video_url', c.video_url,
    'published_at', c.published_at,
    'updated_at', c.updated_at,
    'seo_title', c.title,
    'seo_description', c.summary,
    'famous', case when f.id is not null then jsonb_build_object(
        'slug', f.slug, 'name', f.name, 'occupation', f.occupation
      ) else null end,
    'related', coalesce((
      select jsonb_agg(jsonb_build_object(
               'slug', r.slug, 'title', r.title,
               'summary', r.summary, 'category', r.category))
      from (
        select r2.slug, r2.title, r2.summary, r2.category, r2.published_at
        from public.content_items r2
        where r2.status = 'published' and r2.slug is not null
          and r2.id <> v_id
          and (v_cat is null or r2.category = v_cat)
        order by r2.published_at desc nulls last
        limit 4
      ) r
    ), '[]'::jsonb)
  ) into res
  from public.content_items c
  left join public.famous_profiles f
    on f.id = c.famous_id and f.status = 'published' and f.is_public = true
  where c.id = v_id;

  return res;
end;
$$;

revoke all on function public.public_get_content(text) from public;
grant execute on function public.public_get_content(text) to anon, authenticated;

drop function if exists public.public_list_famous(int, int);
create or replace function public.public_list_famous(
  p_limit  int default 20,
  p_offset int default 0
)
returns table (
  slug              text,
  name              text,
  category          text,
  occupation        text,
  short_description text,
  published_at      timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select f.slug, f.name, f.category, f.occupation, f.short_description, f.published_at
  from public.famous_profiles f
  where f.status = 'published' and f.is_public = true and f.slug is not null
  order by f.published_at desc nulls last, f.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.public_list_famous(int, int) from public;
grant execute on function public.public_list_famous(int, int) to anon, authenticated;

-- Deliberately excludes raw birth_info. `birth_source` is exposed only as a low-sensitivity
-- provenance label (confirmed/reported/estimated/unknown), never the birth data itself.
drop function if exists public.public_get_famous(text);
create or replace function public.public_get_famous(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  res jsonb;
begin
  select id into v_id
  from public.famous_profiles
  where slug = p_slug and status = 'published' and is_public = true
    and slug is not null;

  if v_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'slug', f.slug,
    'name', f.name,
    'category', f.category,
    'occupation', f.occupation,
    'short_description', f.short_description,
    'bio', f.bio,
    'birth_source', f.birth_source,
    'seo_title', coalesce(f.seo_title, f.name),
    'seo_description', coalesce(f.seo_description, f.short_description),
    'canonical_url', f.canonical_url,
    'index_policy', f.index_policy,
    'published_at', f.published_at,
    'related', coalesce((
      select jsonb_agg(jsonb_build_object(
               'slug', c.slug, 'title', c.title,
               'summary', c.summary, 'category', c.category))
      from (
        select c2.slug, c2.title, c2.summary, c2.category, c2.published_at
        from public.content_items c2
        where c2.status = 'published' and c2.slug is not null
          and c2.famous_id = v_id
        order by c2.published_at desc nulls last
        limit 8
      ) c
    ), '[]'::jsonb)
  ) into res
  from public.famous_profiles f
  where f.id = v_id;

  return res;
end;
$$;

revoke all on function public.public_get_famous(text) from public;
grant execute on function public.public_get_famous(text) to anon, authenticated;

-- ── 8. admin_list_scheduled_publications (SCHEDULER) ────────────────────────────────────────
-- VISIBILITY ONLY — it executes nothing and publishes nothing. The future executor's claim
-- query stays disabled until the owner authorizes automatic external publishing.
drop function if exists public.admin_list_scheduled_publications(int);
create or replace function public.admin_list_scheduled_publications(
  p_limit int default 100
)
returns table (
  id            uuid,
  content_id    uuid,
  content_title text,
  channel       text,
  status        text,
  scheduled_at  timestamptz,
  published_at  timestamptz,
  provider      text,
  external_url  text,
  attempt_count int,
  last_error    text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    p.id, p.content_id, c.title, p.channel, p.status, p.scheduled_at,
    p.published_at, p.provider, p.external_url, p.attempt_count, p.last_error
  from public.content_publications p
  left join public.content_items c on c.id = p.content_id
  order by
    case when p.status in ('scheduled', 'queued', 'processing') then 0 else 1 end,
    p.scheduled_at asc nulls last,
    p.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 300));
end;
$$;

revoke all on function public.admin_list_scheduled_publications(int) from public;
grant execute on function public.admin_list_scheduled_publications(int) to authenticated;
