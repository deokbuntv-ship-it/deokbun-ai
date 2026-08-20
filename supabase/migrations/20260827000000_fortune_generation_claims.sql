-- CLOSURE A — server-owned paid-work safety. OWNER_APPLY: NOT pushed.
-- Replaces the held client-owned claim design before its first deployment.

alter table public.daily_fortunes
  add column if not exists tier text not null default 'FREE',
  add column if not exists semantic_version text not null default 'LEGACY';
alter table public.monthly_fortunes
  add column if not exists tier text not null default 'FREE',
  add column if not exists semantic_version text not null default 'LEGACY';

drop index if exists public.daily_fortunes_owner_date_uniq;
create unique index if not exists daily_fortunes_canonical_uniq
  on public.daily_fortunes (user_id, fortune_date, subject_id, tier, semantic_version);
drop index if exists public.monthly_fortunes_owner_month_uniq;
create unique index if not exists monthly_fortunes_canonical_uniq
  on public.monthly_fortunes (user_id, fortune_year, fortune_month, subject_id, tier, semantic_version);

-- Canonical fortune writes are server-only. Authenticated consumers retain owner-scoped reads.
drop policy if exists daily_fortunes_all_own on public.daily_fortunes;
drop policy if exists daily_fortunes_select_own on public.daily_fortunes;
create policy daily_fortunes_select_own on public.daily_fortunes
  for select using (user_id = auth.uid());
drop policy if exists monthly_fortunes_all_own on public.monthly_fortunes;
drop policy if exists monthly_fortunes_select_own on public.monthly_fortunes;
create policy monthly_fortunes_select_own on public.monthly_fortunes
  for select using (user_id = auth.uid());

-- DB-clock lease over the complete canonical identity. There are deliberately no client RLS policies.
create table if not exists public.fortune_generation_leases (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('today', 'monthly')),
  period_key text not null check (length(period_key) between 7 and 10),
  subject_id uuid not null references public.consultation_subjects(id) on delete cascade,
  tier text not null check (tier in ('FREE', 'PLUS')),
  semantic_version text not null check (length(semantic_version) between 1 and 128),
  lease_token uuid not null,
  acquired_at timestamptz not null,
  expires_at timestamptz not null,
  primary key (user_id, kind, period_key, subject_id, tier, semantic_version),
  check (expires_at > acquired_at)
);
create index if not exists fortune_generation_leases_expiry_idx
  on public.fortune_generation_leases (expires_at);
alter table public.fortune_generation_leases enable row level security;
revoke all on table public.fortune_generation_leases from public, anon, authenticated;
grant select, insert, update, delete on table public.fortune_generation_leases to service_role;

create or replace function public.acquire_fortune_generation_lease(
  p_user_id uuid, p_kind text, p_period_key text, p_subject_id uuid,
  p_tier text, p_semantic_version text, p_lease_seconds integer default 300
)
returns table (outcome text, lease_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expiry timestamptz;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_kind not in ('today', 'monthly') or p_tier not in ('FREE', 'PLUS')
     or p_period_key is null or length(p_period_key) not between 7 and 10
     or p_semantic_version is null or length(p_semantic_version) not between 1 and 128 then
    raise exception 'invalid fortune lease identity' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.consultation_subjects s
    where s.id = p_subject_id and s.user_id = p_user_id and s.is_self
  ) then
    raise exception 'canonical self required' using errcode = '42501';
  end if;

  -- Re-check canonical persistence in the same trusted DB transaction. This prevents a transient REST
  -- cache miss (or a completion/read race) from opening a fresh paid lease for an existing result.
  if p_kind = 'today' and exists (
    select 1 from public.daily_fortunes f
    where f.user_id = p_user_id and f.subject_id = p_subject_id
      and f.fortune_date::text = p_period_key and f.tier = p_tier
      and f.semantic_version = p_semantic_version
  ) then
    return query select 'COMPLETED'::text, null::uuid, null::timestamptz;
    return;
  elsif p_kind = 'monthly' and exists (
    select 1 from public.monthly_fortunes f
    where f.user_id = p_user_id and f.subject_id = p_subject_id
      and concat(f.fortune_year::text, '-', lpad(f.fortune_month::text, 2, '0')) = p_period_key
      and f.tier = p_tier and f.semantic_version = p_semantic_version
  ) then
    return query select 'COMPLETED'::text, null::uuid, null::timestamptz;
    return;
  end if;

  v_expiry := v_now + greatest(30, least(coalesce(p_lease_seconds, 300), 600)) * interval '1 second';
  insert into public.fortune_generation_leases as l
    (user_id, kind, period_key, subject_id, tier, semantic_version,
     lease_token, acquired_at, expires_at)
  values
    (p_user_id, p_kind, p_period_key, p_subject_id, p_tier, p_semantic_version,
     v_token, v_now, v_expiry)
  on conflict (user_id, kind, period_key, subject_id, tier, semantic_version)
  do update set lease_token = excluded.lease_token, acquired_at = excluded.acquired_at,
    expires_at = excluded.expires_at
  where l.expires_at <= v_now
  returning l.lease_token, l.expires_at into v_token, v_expiry;

  if found then
    return query select 'ACQUIRED'::text, v_token, v_expiry;
  else
    return query select 'BUSY'::text, null::uuid, l.expires_at
    from public.fortune_generation_leases l
    where l.user_id = p_user_id and l.kind = p_kind and l.period_key = p_period_key
      and l.subject_id = p_subject_id and l.tier = p_tier
      and l.semantic_version = p_semantic_version;
  end if;
end;
$$;

create or replace function public.release_fortune_generation_lease(
  p_user_id uuid, p_kind text, p_period_key text, p_subject_id uuid,
  p_tier text, p_semantic_version text, p_lease_token uuid
)
returns boolean language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_deleted integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  delete from public.fortune_generation_leases l
  where l.user_id = p_user_id and l.kind = p_kind and l.period_key = p_period_key
    and l.subject_id = p_subject_id and l.tier = p_tier
    and l.semantic_version = p_semantic_version and l.lease_token = p_lease_token;
  get diagnostics v_deleted = row_count;
  return v_deleted = 1;
end;
$$;

-- Only the current, unexpired token can persist and complete a Today generation.
create or replace function public.complete_today_fortune_generation(
  p_user_id uuid, p_period_key text, p_subject_id uuid, p_tier text,
  p_semantic_version text, p_lease_token uuid, p_overall_tone text,
  p_result_json jsonb, p_evidence_version text, p_policy_version text, p_model text
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_row public.daily_fortunes%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  perform 1 from public.fortune_generation_leases l
  where l.user_id = p_user_id and l.kind = 'today' and l.period_key = p_period_key
    and l.subject_id = p_subject_id and l.tier = p_tier
    and l.semantic_version = p_semantic_version and l.lease_token = p_lease_token
    and l.expires_at > clock_timestamp() for update;
  if not found then return null; end if;

  insert into public.daily_fortunes
    (user_id, subject_id, fortune_date, timezone, overall_tone, result_json,
     evidence_version, policy_version, model, tier, semantic_version)
  values
    (p_user_id, p_subject_id, p_period_key::date, 'Asia/Seoul', p_overall_tone, p_result_json,
     p_evidence_version, p_policy_version, p_model, p_tier, p_semantic_version)
  on conflict (user_id, fortune_date, subject_id, tier, semantic_version) do nothing;
  select * into v_row from public.daily_fortunes f
  where f.user_id = p_user_id and f.fortune_date = p_period_key::date
    and f.subject_id = p_subject_id and f.tier = p_tier
    and f.semantic_version = p_semantic_version;
  if not found then return null; end if;

  delete from public.fortune_generation_leases l
  where l.user_id = p_user_id and l.kind = 'today' and l.period_key = p_period_key
    and l.subject_id = p_subject_id and l.tier = p_tier
    and l.semantic_version = p_semantic_version and l.lease_token = p_lease_token;
  return to_jsonb(v_row);
end;
$$;

-- Monthly completion is the same atomic token-check → persist → release lifecycle.
create or replace function public.complete_monthly_fortune_generation(
  p_user_id uuid, p_period_key text, p_subject_id uuid, p_tier text,
  p_semantic_version text, p_lease_token uuid, p_overall_tier text,
  p_result_json jsonb, p_evidence_version text, p_plan_version text,
  p_policy_version text, p_model text
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_year integer;
  v_month integer;
  v_row public.monthly_fortunes%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_period_key !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid monthly period' using errcode = '22023';
  end if;
  v_year := split_part(p_period_key, '-', 1)::integer;
  v_month := split_part(p_period_key, '-', 2)::integer;
  perform 1 from public.fortune_generation_leases l
  where l.user_id = p_user_id and l.kind = 'monthly' and l.period_key = p_period_key
    and l.subject_id = p_subject_id and l.tier = p_tier
    and l.semantic_version = p_semantic_version and l.lease_token = p_lease_token
    and l.expires_at > clock_timestamp() for update;
  if not found then return null; end if;

  insert into public.monthly_fortunes
    (user_id, subject_id, fortune_year, fortune_month, timezone, overall_tier, result_json,
     evidence_version, plan_version, policy_version, model, tier, semantic_version)
  values
    (p_user_id, p_subject_id, v_year, v_month, 'Asia/Seoul', p_overall_tier, p_result_json,
     p_evidence_version, p_plan_version, p_policy_version, p_model, p_tier, p_semantic_version)
  on conflict (user_id, fortune_year, fortune_month, subject_id, tier, semantic_version) do nothing;
  select * into v_row from public.monthly_fortunes f
  where f.user_id = p_user_id and f.fortune_year = v_year and f.fortune_month = v_month
    and f.subject_id = p_subject_id and f.tier = p_tier
    and f.semantic_version = p_semantic_version;
  if not found then return null; end if;

  delete from public.fortune_generation_leases l
  where l.user_id = p_user_id and l.kind = 'monthly' and l.period_key = p_period_key
    and l.subject_id = p_subject_id and l.tier = p_tier
    and l.semantic_version = p_semantic_version and l.lease_token = p_lease_token;
  return to_jsonb(v_row);
end;
$$;

-- Atomic rolling window: a per-user transaction advisory lock serializes parallel reservations.
create table if not exists public.paid_work_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workload text not null check (workload in ('chat', 'today_fortune', 'monthly_fortune')),
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists paid_work_reservations_user_window_idx
  on public.paid_work_reservations (user_id, created_at desc);
alter table public.paid_work_reservations enable row level security;
revoke all on table public.paid_work_reservations from public, anon, authenticated;
grant select, insert, delete on table public.paid_work_reservations to service_role;

create or replace function public.reserve_paid_work(
  p_user_id uuid, p_workload text, p_window_ms integer default 60000,
  p_max_requests integer default 20
)
returns table (allowed boolean, retry_after_ms integer, reservation_id uuid)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_ms integer := greatest(1000, least(coalesce(p_window_ms, 60000), 300000));
  v_max integer := greatest(1, least(coalesce(p_max_requests, 20), 100));
  v_count integer;
  v_oldest timestamptz;
  v_id uuid;
  v_retry integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_workload not in ('chat', 'today_fortune', 'monthly_fortune') then
    raise exception 'invalid paid workload' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  delete from public.paid_work_reservations r
    where r.user_id = p_user_id and r.created_at < v_now - interval '10 minutes';
  select count(*), min(r.created_at) into v_count, v_oldest
  from public.paid_work_reservations r
  where r.user_id = p_user_id
    and r.created_at >= v_now - v_window_ms * interval '1 millisecond';
  if v_count >= v_max then
    v_retry := greatest(1, ceil(extract(epoch from
      ((v_oldest + v_window_ms * interval '1 millisecond') - v_now)) * 1000)::integer);
    return query select false, v_retry, null::uuid;
    return;
  end if;
  insert into public.paid_work_reservations (user_id, workload, created_at)
    values (p_user_id, p_workload, v_now) returning id into v_id;
  return query select true, 0, v_id;
end;
$$;

-- Response-loss idempotency for consultation, compatibility and summary.
create table if not exists public.paid_request_idempotency (
  user_id uuid not null references auth.users(id) on delete cascade,
  workload text not null check (workload in ('chat', 'compatibility', 'summary')),
  request_id text not null check (length(request_id) between 8 and 96),
  status text not null check (status in ('PROCESSING', 'COMPLETED')),
  lease_token uuid not null,
  response_json jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  expires_at timestamptz not null,
  primary key (user_id, workload, request_id),
  check ((status = 'COMPLETED') = (response_json is not null))
);
create index if not exists paid_request_idempotency_expiry_idx
  on public.paid_request_idempotency (expires_at);
alter table public.paid_request_idempotency enable row level security;
revoke all on table public.paid_request_idempotency from public, anon, authenticated;
grant select, insert, update, delete on table public.paid_request_idempotency to service_role;

create or replace function public.acquire_paid_request(
  p_user_id uuid, p_workload text, p_request_id text, p_lease_seconds integer default 300
)
returns table (outcome text, lease_token uuid, response_json jsonb, expires_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_row public.paid_request_idempotency%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_workload not in ('chat', 'compatibility', 'summary')
     or p_request_id is null or length(p_request_id) not between 8 and 96 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(
    p_user_id::text || ':' || p_workload || ':' || p_request_id, 0));
  select * into v_row from public.paid_request_idempotency i
  where i.user_id = p_user_id and i.workload = p_workload and i.request_id = p_request_id
  for update;

  if found and v_row.status = 'COMPLETED' and v_row.expires_at > v_now then
    return query select 'COMPLETED'::text, null::uuid, v_row.response_json, v_row.expires_at;
    return;
  end if;
  if found and v_row.status = 'PROCESSING' and v_row.expires_at > v_now then
    return query select 'PROCESSING'::text, null::uuid, null::jsonb, v_row.expires_at;
    return;
  end if;

  insert into public.paid_request_idempotency as i
    (user_id, workload, request_id, status, lease_token, response_json,
     created_at, updated_at, expires_at)
  values
    (p_user_id, p_workload, p_request_id, 'PROCESSING', v_token, null,
     v_now, v_now, v_now + greatest(30, least(coalesce(p_lease_seconds, 300), 600)) * interval '1 second')
  on conflict (user_id, workload, request_id) do update set
    status = 'PROCESSING', lease_token = excluded.lease_token, response_json = null,
    updated_at = excluded.updated_at, expires_at = excluded.expires_at;
  return query select 'ACQUIRED'::text, v_token, null::jsonb,
    v_now + greatest(30, least(coalesce(p_lease_seconds, 300), 600)) * interval '1 second';
end;
$$;

create or replace function public.complete_paid_request(
  p_user_id uuid, p_workload text, p_request_id text,
  p_lease_token uuid, p_response_json jsonb
)
returns boolean language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_updated integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  update public.paid_request_idempotency i set
    status = 'COMPLETED', response_json = p_response_json,
    updated_at = clock_timestamp(), expires_at = clock_timestamp() + interval '24 hours'
  where i.user_id = p_user_id and i.workload = p_workload and i.request_id = p_request_id
    and i.status = 'PROCESSING' and i.lease_token = p_lease_token
    and i.expires_at > clock_timestamp();
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.release_paid_request(
  p_user_id uuid, p_workload text, p_request_id text, p_lease_token uuid
)
returns boolean language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_deleted integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  delete from public.paid_request_idempotency i
  where i.user_id = p_user_id and i.workload = p_workload and i.request_id = p_request_id
    and i.status = 'PROCESSING' and i.lease_token = p_lease_token;
  get diagnostics v_deleted = row_count;
  return v_deleted = 1;
end;
$$;

revoke all on function public.acquire_fortune_generation_lease(uuid,text,text,uuid,text,text,integer) from public, anon, authenticated;
revoke all on function public.release_fortune_generation_lease(uuid,text,text,uuid,text,text,uuid) from public, anon, authenticated;
revoke all on function public.complete_today_fortune_generation(uuid,text,uuid,text,text,uuid,text,jsonb,text,text,text) from public, anon, authenticated;
revoke all on function public.complete_monthly_fortune_generation(uuid,text,uuid,text,text,uuid,text,jsonb,text,text,text,text) from public, anon, authenticated;
revoke all on function public.reserve_paid_work(uuid,text,integer,integer) from public, anon, authenticated;
revoke all on function public.acquire_paid_request(uuid,text,text,integer) from public, anon, authenticated;
revoke all on function public.complete_paid_request(uuid,text,text,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.release_paid_request(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.acquire_fortune_generation_lease(uuid,text,text,uuid,text,text,integer) to service_role;
grant execute on function public.release_fortune_generation_lease(uuid,text,text,uuid,text,text,uuid) to service_role;
grant execute on function public.complete_today_fortune_generation(uuid,text,uuid,text,text,uuid,text,jsonb,text,text,text) to service_role;
grant execute on function public.complete_monthly_fortune_generation(uuid,text,uuid,text,text,uuid,text,jsonb,text,text,text,text) to service_role;
grant execute on function public.reserve_paid_work(uuid,text,integer,integer) to service_role;
grant execute on function public.acquire_paid_request(uuid,text,text,integer) to service_role;
grant execute on function public.complete_paid_request(uuid,text,text,uuid,jsonb) to service_role;
grant execute on function public.release_paid_request(uuid,text,text,uuid) to service_role;
