-- =============================================================================
-- DeokbunAI — Public content: hero alt text + search (R4-A)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER CONTENT_ASSETS_SETUP.sql.
--
-- Adds content_items.hero_alt (image accessibility/SEO alt text) and a published-
-- only title/summary search to public_list_content. Backward compatible: the new
-- p_search parameter is defaulted, so existing calls (p_category/p_limit/p_offset)
-- still resolve. Re-runnable. Still published-only; no draft/admin leak.
-- =============================================================================

begin;

alter table public.content_items add column if not exists hero_alt text;

-- Recreate list RPC with p_search + hero_alt (drop needed: return shape changes).
drop function if exists public.public_list_content(text, int, int);
drop function if exists public.public_list_content(text, text, int, int);
create function public.public_list_content(
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
grant execute on function public.public_list_content(text, text, int, int)
  to anon, authenticated;

-- Add hero_alt to the detail RPC (jsonb return; CREATE OR REPLACE is safe).
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
-- After applying: /content?검색, image alt text on public hero images. The
-- sitemap generator's public_list_content call (p_category/p_limit/p_offset) still
-- resolves via defaults.
-- =============================================================================
