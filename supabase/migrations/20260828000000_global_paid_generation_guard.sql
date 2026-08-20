-- DeokbunAI V1 global paid-generation guard.
-- Paid-generation UNITS are deliberately used instead of fake monetary/token precision.
-- OWNER_APPLY_REQUIRED: local migration only; do not apply remotely from this sprint.

create table if not exists public.global_generation_guard (
  guard_key text primary key check (guard_key = 'global'),
  generation_enabled boolean not null default true,
  hourly_limit integer not null check (hourly_limit > 0),
  daily_limit integer not null check (daily_limit > 0),
  warning_thresholds integer[] not null default array[50, 80, 95],
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid,
  check (warning_thresholds = array[50, 80, 95])
);

insert into public.global_generation_guard
  (guard_key, generation_enabled, hourly_limit, daily_limit, warning_thresholds)
values ('global', true, 100, 1000, array[50, 80, 95])
on conflict (guard_key) do nothing;

create table if not exists public.global_paid_generation_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  workload text not null check (workload in (
    'chat', 'today_fortune', 'monthly_fortune', 'compatibility', 'summary',
    'content_generation', 'famous_suggestion', 'image_generation', 'video_generation'
  )),
  units integer not null default 1 check (units > 0 and units <= 100),
  created_at timestamptz not null default clock_timestamp()
);

create index if not exists global_paid_generation_created_idx
  on public.global_paid_generation_reservations (created_at desc);
create index if not exists global_paid_generation_workload_created_idx
  on public.global_paid_generation_reservations (workload, created_at desc);

alter table public.global_generation_guard enable row level security;
alter table public.global_paid_generation_reservations enable row level security;
revoke all on table public.global_generation_guard from public, anon, authenticated;
revoke all on table public.global_paid_generation_reservations from public, anon, authenticated;
grant select, insert, update on table public.global_generation_guard to service_role;
grant select, insert, delete on table public.global_paid_generation_reservations to service_role;

create or replace function public.reserve_global_paid_generation(
  p_user_id uuid,
  p_workload text,
  p_units integer default 1
)
returns table (
  allowed boolean,
  reason text,
  retry_after_ms integer,
  reservation_id uuid,
  hourly_used integer,
  daily_used integer,
  hourly_limit integer,
  daily_limit integer,
  utilization_percent integer,
  warning_level text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_config public.global_generation_guard%rowtype;
  v_hourly_used integer;
  v_daily_used integer;
  v_hourly_oldest timestamptz;
  v_daily_oldest timestamptz;
  v_retry integer := 0;
  v_id uuid;
  v_percent integer;
  v_warning text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_user_id is null or p_units is null or p_units < 1 or p_units > 100 then
    raise exception 'invalid global paid-generation reservation' using errcode = '22023';
  end if;
  if p_workload not in (
    'chat', 'today_fortune', 'monthly_fortune', 'compatibility', 'summary',
    'content_generation', 'famous_suggestion', 'image_generation', 'video_generation'
  ) then
    raise exception 'invalid paid-generation workload' using errcode = '22023';
  end if;

  -- One global transaction lock makes check+insert atomic across every user/workload.
  perform pg_advisory_xact_lock(hashtextextended('deokbunai:global-paid-generation', 0));
  select * into v_config
  from public.global_generation_guard g
  where g.guard_key = 'global'
  for update;
  if not found then
    raise exception 'global generation guard missing' using errcode = '55000';
  end if;

  delete from public.global_paid_generation_reservations r
  where r.created_at < v_now - interval '8 days';

  select coalesce(sum(r.units), 0)::integer, min(r.created_at)
    into v_hourly_used, v_hourly_oldest
  from public.global_paid_generation_reservations r
  where r.created_at >= v_now - interval '1 hour';

  select coalesce(sum(r.units), 0)::integer, min(r.created_at)
    into v_daily_used, v_daily_oldest
  from public.global_paid_generation_reservations r
  where r.created_at >= v_now - interval '24 hours';

  v_percent := greatest(
    ceil(100.0 * v_hourly_used / v_config.hourly_limit)::integer,
    ceil(100.0 * v_daily_used / v_config.daily_limit)::integer
  );
  v_warning := case
    when v_percent >= 95 then 'CRITICAL_95'
    when v_percent >= 80 then 'WARNING_80'
    when v_percent >= 50 then 'WATCH_50'
    else 'NORMAL'
  end;

  if not v_config.generation_enabled then
    return query select false, 'GENERATION_DISABLED'::text, 0, null::uuid,
      v_hourly_used, v_daily_used, v_config.hourly_limit, v_config.daily_limit,
      v_percent, v_warning;
    return;
  end if;

  if v_hourly_used + p_units > v_config.hourly_limit then
    if v_hourly_oldest is not null then
      v_retry := greatest(1, ceil(extract(epoch from
        ((v_hourly_oldest + interval '1 hour') - v_now)) * 1000)::integer);
    end if;
    return query select false, 'HOURLY_LIMIT_REACHED'::text, v_retry, null::uuid,
      v_hourly_used, v_daily_used, v_config.hourly_limit, v_config.daily_limit,
      greatest(v_percent, 100), 'CRITICAL_95'::text;
    return;
  end if;

  if v_daily_used + p_units > v_config.daily_limit then
    if v_daily_oldest is not null then
      v_retry := greatest(1, ceil(extract(epoch from
        ((v_daily_oldest + interval '24 hours') - v_now)) * 1000)::integer);
    end if;
    return query select false, 'DAILY_LIMIT_REACHED'::text, v_retry, null::uuid,
      v_hourly_used, v_daily_used, v_config.hourly_limit, v_config.daily_limit,
      greatest(v_percent, 100), 'CRITICAL_95'::text;
    return;
  end if;

  insert into public.global_paid_generation_reservations
    (user_id, workload, units, created_at)
  values (p_user_id, p_workload, p_units, v_now)
  returning id into v_id;

  v_hourly_used := v_hourly_used + p_units;
  v_daily_used := v_daily_used + p_units;
  v_percent := greatest(
    ceil(100.0 * v_hourly_used / v_config.hourly_limit)::integer,
    ceil(100.0 * v_daily_used / v_config.daily_limit)::integer
  );
  v_warning := case
    when v_percent >= 95 then 'CRITICAL_95'
    when v_percent >= 80 then 'WARNING_80'
    when v_percent >= 50 then 'WATCH_50'
    else 'NORMAL'
  end;
  return query select true, 'ALLOWED'::text, 0, v_id,
    v_hourly_used, v_daily_used, v_config.hourly_limit, v_config.daily_limit,
    v_percent, v_warning;
end;
$$;

create or replace function public.get_global_generation_guard()
returns table (
  generation_enabled boolean,
  hourly_limit integer,
  daily_limit integer,
  hourly_used integer,
  daily_used integer,
  utilization_percent integer,
  warning_level text,
  updated_at timestamptz,
  updated_by uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_config public.global_generation_guard%rowtype;
  v_hourly integer;
  v_daily integer;
  v_percent integer;
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  select * into strict v_config from public.global_generation_guard where guard_key = 'global';
  select coalesce(sum(units), 0)::integer into v_hourly
    from public.global_paid_generation_reservations where created_at >= clock_timestamp() - interval '1 hour';
  select coalesce(sum(units), 0)::integer into v_daily
    from public.global_paid_generation_reservations where created_at >= clock_timestamp() - interval '24 hours';
  v_percent := greatest(
    ceil(100.0 * v_hourly / v_config.hourly_limit)::integer,
    ceil(100.0 * v_daily / v_config.daily_limit)::integer
  );
  return query select v_config.generation_enabled, v_config.hourly_limit, v_config.daily_limit,
    v_hourly, v_daily, v_percent,
    case when v_percent >= 95 then 'CRITICAL_95' when v_percent >= 80 then 'WARNING_80'
      when v_percent >= 50 then 'WATCH_50' else 'NORMAL' end,
    v_config.updated_at, v_config.updated_by;
end;
$$;

create or replace function public.set_global_generation_guard(
  p_generation_enabled boolean,
  p_hourly_limit integer,
  p_daily_limit integer
)
returns public.global_generation_guard
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.global_generation_guard%rowtype;
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;
  if p_generation_enabled is null or p_hourly_limit < 1 or p_daily_limit < 1 then
    raise exception 'invalid global generation guard configuration' using errcode = '22023';
  end if;
  update public.global_generation_guard set
    generation_enabled = p_generation_enabled,
    hourly_limit = p_hourly_limit,
    daily_limit = p_daily_limit,
    updated_at = clock_timestamp(),
    updated_by = auth.uid()
  where guard_key = 'global'
  returning * into strict v_row;
  return v_row;
end;
$$;

revoke all on function public.reserve_global_paid_generation(uuid,text,integer) from public, anon, authenticated;
revoke all on function public.get_global_generation_guard() from public, anon, authenticated;
revoke all on function public.set_global_generation_guard(boolean,integer,integer) from public, anon, authenticated;
grant execute on function public.reserve_global_paid_generation(uuid,text,integer) to service_role;
grant execute on function public.get_global_generation_guard() to authenticated, service_role;
grant execute on function public.set_global_generation_guard(boolean,integer,integer) to authenticated, service_role;

comment on table public.global_generation_guard is
  'Backend truth for the global paid-generation kill switch and rolling unit ceilings.';
comment on table public.global_paid_generation_reservations is
  'Conservative paid-generation unit ledger. Authorized attempts remain counted after provider failure/timeout.';
comment on function public.reserve_global_paid_generation(uuid,text,integer) is
  'Service-role-only atomic global kill-switch/hourly/daily guard using the DB clock and one global advisory lock.';
