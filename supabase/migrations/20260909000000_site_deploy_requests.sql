-- ============================================================================
-- DeokbunAI — site rebuild requests (publish → static site regeneration)
--
-- WHY. `web.output: "static"` means the public site is a set of pre-rendered HTML files. Publishing
-- a 유명인 changes the DATABASE instantly (the public RPC filters on status, so a human browsing the
-- SPA sees it at once) but the FILE a crawler downloads is whatever the last build produced. Without
-- a rebuild the page is invisible to search forever — which is the whole point of the feature.
--
-- The owner's requirement is "press publish and nothing else". So publishing has to trigger the
-- rebuild. The trigger is a Vercel Deploy Hook: a secret URL that starts a build. The URL is held as
-- an EDGE secret and called by `supabase/functions/site-deploy` — never by the client.
--
-- THIS TABLE IS THE LOG AND THE COOLDOWN AND THE STATUS DISPLAY, all three:
--   * LOG      — an append-only record of every rebuild request, who asked and why.
--   * COOLDOWN — a Vercel build takes minutes. Publishing five people in a row must not queue five
--                builds. The Edge refuses a new request when one was made inside the cooldown and
--                reports it as "already queued" rather than as a failure — the pending build will
--                pick up every row committed before it starts.
--   * STATUS   — the admin screen reads the newest row to answer the only question the owner
--                actually has: "did it go, and how long ago?"
--
-- ⚠ NO Vercel API token. Reading real build state would need a second secret and another owner
-- setup step. The honest cheap answer is "requested N minutes ago, builds take 2-5 minutes, here is
-- the dashboard link" — see docs/FAMOUS_SEO_SURVEY.md §S8.
--
-- 3 RULES: one domain, ordered inside · per-signature drop then create or replace · no unguarded
-- insert. This file seeds nothing.
--
-- Depends on: public.is_admin() and auth.users (묶음 1 / 20260904000000).
-- ============================================================================

create table if not exists public.site_deploy_requests (
  id              uuid primary key default gen_random_uuid(),
  -- What made us want a rebuild. Free-form-but-small; the Edge sets it.
  reason          text not null,
  -- 'requested' — the hook returned OK. 'skipped' — no hook configured, or inside the cooldown.
  -- 'failed'    — the hook was called and did not return OK.
  status          text not null check (status in ('requested', 'skipped', 'failed')),
  -- Provider HTTP status when we actually called out; null when we skipped.
  provider_status integer,
  detail          text,
  requested_by    uuid references auth.users (id),
  created_at      timestamptz not null default now()
);

create index if not exists site_deploy_requests_created_idx
  on public.site_deploy_requests (created_at desc);

alter table public.site_deploy_requests enable row level security;

-- Admins read. NOBODY writes from the client — the Edge writes with the service role, so there is
-- deliberately no insert/update/delete policy. A missing policy is a denial under RLS.
drop policy if exists "site_deploy_requests admin read" on public.site_deploy_requests;
create policy "site_deploy_requests admin read" on public.site_deploy_requests
  for select using (public.is_admin());

-- Newest request, for the admin status line. SECURITY DEFINER + explicit admin check so the shape
-- stays stable even if the table's policies change later.
drop function if exists public.admin_latest_deploy_request();
create or replace function public.admin_latest_deploy_request()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare res jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'status', d.status,
    'reason', d.reason,
    'providerStatus', d.provider_status,
    'detail', d.detail,
    'createdAt', d.created_at
  ) into res
  from public.site_deploy_requests d
  order by d.created_at desc
  limit 1;
  return res;  -- null when nothing has ever been requested
end;
$$;

revoke all on function public.admin_latest_deploy_request() from public, anon;
grant execute on function public.admin_latest_deploy_request() to authenticated;
