-- =============================================================================
-- DeokbunAI — Public video seam (VIDEO_STANDARD)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER CONTENT_ASSETS_SETUP.sql
-- and PUBLIC_UPDATE_search_alt.sql. Idempotent / re-runnable.
--
-- Video generation itself reuses content_assets (kind='video', status machine,
-- provider_job_id, storage_path) + the content-media bucket (no MIME restriction →
-- supports video). This migration only adds the PUBLIC applied-video seam:
-- content_items.video_url (the operator-applied video for a content item) and
-- exposes it via public_get_content. Public shows video only when the operator
-- applies one (autoplay OFF is a client concern).
-- =============================================================================

begin;

alter table public.content_items add column if not exists video_url text;

-- Add video_url to the detail RPC (jsonb return; CREATE OR REPLACE is safe).
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

commit;

-- =============================================================================
-- After applying + deploying video-generate/video-status + setting GEMINI_API_KEY:
-- generate a video from /admin/content/[id], apply it, and it appears on the public
-- content detail page (autoplay off).
-- =============================================================================
