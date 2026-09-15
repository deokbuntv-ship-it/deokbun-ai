-- ============================================================================
-- DeokbunAI — ADMIN DASHBOARD TRENDS (승격 묶음 4 / 5)
--
-- Consolidates docs/admin/DASHBOARD_TRENDS_SETUP.sql: `admin_daily_activity`, the server-side
-- daily aggregation behind the /admin 최근 30일 추이 charts.
--
-- REAL DATA ONLY. Until this exists the charts render an unavailable state — never a fake zero
-- series. That is the intended pre-apply behaviour, which is why this was safe to leave
-- unapplied for so long.
--
-- Buckets by Asia/Seoul day and joins against a generate_series spine, so a day with no
-- activity comes back as 0 rather than being missing — no per-day correlated subqueries and no
-- raw event dump.
--
-- 3 RULES: one domain · single signature dropped before create · no insert.
--
-- Depends on: public.is_admin() (묶음 1), auth.users, public.conversations,
-- public.ai_usage_logs (20260902000000).
-- ============================================================================

drop function if exists public.admin_daily_activity(int);
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
