-- =============================================================================
-- DeokbunAI — Scheduled publications admin visibility RPC (CONTENT-07 §11-12)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER PUBLICATION_SETUP.sql.
-- Re-runnable.
--
-- Read-only admin RPC to SEE the publication pipeline (scheduled/queued/processing
-- first, then the rest) across all content. This is VISIBILITY only — it does NOT
-- execute or publish anything. The future executor's own due-job query (service_role,
-- optimistic-lock claim) is documented in docs/SCHEDULER_DESIGN.md and stays
-- disabled until the owner authorizes automatic external publishing.
--
-- is_admin()-gated, SECURITY DEFINER, pinned search_path, granted to authenticated.
-- =============================================================================

begin;

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
grant execute on function public.admin_list_scheduled_publications(int)
  to authenticated;

commit;

-- =============================================================================
-- After applying: /admin/publications shows the publication pipeline (read-only).
-- =============================================================================
