-- =============================================================================
-- DeokbunAI — Public Content / Famous Web Surface (PUBLIC-01)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER CONTENT_01_SETUP.sql and
-- ADMIN_05_SETUP.sql are applied.
--
-- Makes PUBLISHED content and PUBLISHED+public famous readable by anonymous
-- visitors WITHOUT loosening the admin-only RLS. Public read goes exclusively
-- through curated SECURITY DEFINER RPCs that:
--   - return ONLY published rows (status='published'; famous also is_public=true),
--   - project ONLY public-safe columns (NO draft, NO created_by, NO admin state,
--     NO provenance, NO raw ENGINE snapshot, NO raw birth_info),
--   - are granted to anon + authenticated (revoked from PUBLIC first).
-- Column-level control is why RPCs are used instead of a broad SELECT policy.
--
-- Additive only: adds slug/category/published_at to content_items (no data loss).
-- =============================================================================

begin;

-- 1) content_items: additive public columns --------------------------------------
alter table public.content_items add column if not exists slug text;
alter table public.content_items add column if not exists category text;
alter table public.content_items add column if not exists published_at timestamptz;

create unique index if not exists content_items_slug_key
  on public.content_items (slug) where slug is not null;
create index if not exists content_items_published_idx
  on public.content_items (status, published_at desc);
create index if not exists content_items_category_idx
  on public.content_items (category);

-- 2) published_at maintenance (mirror famous_profiles) ---------------------------
-- Replace the CONTENT-01 touch fn to ALSO stamp published_at on first publish.
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

-- 3) PUBLIC: list published content (optional category filter) --------------------
create or replace function public.public_list_content(
  p_category text default null,
  p_limit    int  default 20,
  p_offset   int  default 0
)
returns table (
  slug         text,
  title        text,
  summary      text,
  channel      text,
  category     text,
  tags         jsonb,
  published_at timestamptz,
  famous_slug  text,
  famous_name  text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    c.slug, c.title, c.summary, c.channel, c.category, c.tags, c.published_at,
    f.slug, f.name
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

-- 4) PUBLIC: single published content by slug (+ related) -------------------------
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
    'published_at', c.published_at,
    'updated_at', c.updated_at,
    -- content has no dedicated SEO columns; derive from title/summary.
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

-- 5) PUBLIC: list published+public famous ----------------------------------------
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
  select f.slug, f.name, f.category, f.occupation, f.short_description,
         f.published_at
  from public.famous_profiles f
  where f.status = 'published' and f.is_public = true and f.slug is not null
  order by f.published_at desc nulls last, f.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.public_list_famous(int, int) from public;
grant execute on function public.public_list_famous(int, int)
  to anon, authenticated;

-- 6) PUBLIC: single published famous by slug (+ related content) ------------------
-- Deliberately excludes raw birth_info (privacy). Exposes birth_source only as a
-- low-sensitivity provenance label, plus SEO fields.
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

commit;

-- =============================================================================
-- After applying: /content and /famous (and /content/{slug}, /famous/{slug})
-- return published data to anyone. Drafts / admin metadata / provenance / raw
-- birth info are never exposed. Admins publish content via /admin/content (set a
-- slug + category, status=발행). Non-published items stay invisible (fail-closed).
-- =============================================================================
