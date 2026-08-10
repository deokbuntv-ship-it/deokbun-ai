-- =============================================================================
-- DeokbunAI — Content Assets (image/video) foundation (CONTENT-03 / CONTENT-06)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER CONTENT_01_SETUP.sql and
-- PUBLIC_SETUP.sql.
--
-- Provider-neutral media asset model. Assets can be:
--   - MANUAL: operator attaches an already-hosted external image/video URL (works
--     today, no provider needed), or
--   - GENERATED: produced by a future image/video provider (PROVIDER_NOT_CONFIGURED
--     until the owner selects one — OWNER DECISION). No fake/generated media here.
--
-- Also adds content_items.hero_image_url (representative image) and extends the
-- public read RPCs to expose it (published-only, still no draft/admin leak).
--
-- Additive/idempotent. Admin-only RLS on content_assets.
-- =============================================================================

begin;

-- 1) hero image on content -----------------------------------------------------
alter table public.content_items add column if not exists hero_image_url text;

-- 2) content_assets ------------------------------------------------------------
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
  storage_path     text,                             -- Supabase Storage key (future generated assets)
  external_url     text,                             -- manual/attached or provider-returned URL
  error_code       text,
  last_error       text,
  metadata         jsonb not null default '{}'::jsonb,
  created_by       uuid references auth.users (id) default auth.uid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists content_assets_content_idx
  on public.content_assets (content_id, updated_at desc);
create index if not exists content_assets_status_idx
  on public.content_assets (kind, status);

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

-- 3) Public read RPCs: add hero_image_url (drop+recreate; re-runnable) ----------
drop function if exists public.public_list_content(text, int, int);
create function public.public_list_content(
  p_category text default null,
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
    c.published_at, f.slug, f.name
  from public.content_items c
  left join public.famous_profiles f
    on f.id = c.famous_id and f.status = 'published' and f.is_public = true
  where c.status = 'published'
    and c.slug is not null
    and (p_category is null or c.category = p_category)
  order by c.published_at desc nulls last, c.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;
revoke all on function public.public_list_content(text, int, int) from public;
grant execute on function public.public_list_content(text, int, int)
  to anon, authenticated;

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

commit;

-- =============================================================================
-- OPTIONAL (OWNER ACTION) — Supabase Storage for FUTURE generated media.
-- Not required for manual URL attach. Uncomment to create a public-read bucket
-- (published hero images are public) with admin-only writes:
--
--   insert into storage.buckets (id, name, public)
--   values ('content-media', 'content-media', true)
--   on conflict (id) do nothing;
--
--   create policy "content-media admin write" on storage.objects
--     for insert to authenticated
--     with check (bucket_id = 'content-media' and public.is_admin());
--   create policy "content-media admin update" on storage.objects
--     for update to authenticated
--     using (bucket_id = 'content-media' and public.is_admin());
--   create policy "content-media public read" on storage.objects
--     for select using (bucket_id = 'content-media');
-- =============================================================================
