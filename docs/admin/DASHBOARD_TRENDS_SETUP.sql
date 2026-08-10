-- =============================================================================
-- DeokbunAI — Admin dashboard daily trends RPC (UI/UX Phase 2, §42-47)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER ADMIN_04_SETUP.sql.
-- Re-runnable.
--
-- Server-side daily aggregation for the admin dashboard trend charts. REAL data
-- only (auth.users / conversations / ai_usage_logs). Buckets by Asia/Seoul day.
-- is_admin()-gated, SECURITY DEFINER, pinned search_path. Efficient (GROUP BY +
-- generate_series join — no per-day correlated subqueries, no raw event dump).
-- =============================================================================

begin;

create or replace function public.admin_daily_activity(p_days int default 30)
returns table (
  day           date,
  new_users     bigint,
  consultations bigint,
  ai_requests   bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_days  int  := greatest(1, least(coalesce(p_days, 30), 90));
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_start date := v_today - (v_days - 1);
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  with days as (
    select generate_series(v_start, v_today, interval '1 day')::date as day
  ),
  u as (
    select (created_at at time zone 'Asia/Seoul')::date d, count(*) c
    from auth.users
    where (created_at at time zone 'Asia/Seoul')::date >= v_start
    group by 1
  ),
  cv as (
    select (created_at at time zone 'Asia/Seoul')::date d, count(*) c
    from public.conversations
    where (created_at at time zone 'Asia/Seoul')::date >= v_start
    group by 1
  ),
  ai as (
    select (created_at at time zone 'Asia/Seoul')::date d, count(*) c
    from public.ai_usage_logs
    where (created_at at time zone 'Asia/Seoul')::date >= v_start
    group by 1
  )
  select days.day,
         coalesce(u.c, 0)  as new_users,
         coalesce(cv.c, 0) as consultations,
         coalesce(ai.c, 0) as ai_requests
  from days
  left join u  on u.d  = days.day
  left join cv on cv.d = days.day
  left join ai on ai.d = days.day
  order by days.day;
end;
$$;

revoke all on function public.admin_daily_activity(int) from public;
grant execute on function public.admin_daily_activity(int) to authenticated;

commit;

-- =============================================================================
-- After applying: /admin dashboard shows real 최근 30일 추이 charts. Before applying,
-- the charts show an empty/unavailable state (never a fake zero series).
-- =============================================================================
