-- =============================================================================
-- DeokbunAI — Advertisement & Acquisition Tracking schema  (ARTIFACT — owner-apply)
-- =============================================================================
-- Backs src/features/ads/** (Advertisement admin CRUD, tracking events, first-touch
-- attribution, funnel + CAC/CPA analytics). Sprint 3B.
--
-- ⚠️ ARTIFACT ONLY — NOT auto-applied. Additive + idempotent + non-destructive
--   (create if not exists; drop policy if exists + recreate). NO DROP TABLE /
--   TRUNCATE / DELETE. Owner applies in the Supabase SQL editor after review.
--
-- ⚠️ HOLD: the app's admin CRUD (advertisements) works as soon as THIS file's
--   `advertisements` table + policies exist. The tracking pipeline (ad_tracking_events,
--   attribution, triggers, admin_ad_performance) additionally requires the
--   `ad-track` Edge Function (supabase/functions/ad-track) to be deployed. Until then
--   the app's performance screen shows a truthful "집계 준비 중" state (fail-closed).
--
-- RLS model:
--   * advertisements     — ADMIN-ONLY CRUD, gated by public.is_admin(). No anon/user access.
--   * ad_tracking_events — append-only telemetry. RLS enabled, NO client policies:
--                          the ONLY writer is the `ad-track` Edge Function via the
--                          service role (bypasses RLS). Admins read via the RPC below.
--                          → an anonymous ad_click is NOT an anon-insert RLS policy
--                            (that would let anyone forge/spam rows); it is a validated,
--                            rate-limited service-role insert in the edge function.
--   * user_acquisition_attribution — one row per acquired user, first-touch. RLS enabled;
--                          the owner may read their own row; writes are server-side only
--                          (edge / trigger via service role). No client insert policy.
--   * server-trusted conversions — signup / first_consultation / birth_info_completed are
--                          recorded by AFTER INSERT triggers on profiles / ai_usage_logs /
--                          consultation_subjects (NOT by client assertions, §50), each
--                          idempotent via a unique index (one row per user per milestone).
--   * PII-minimal (§45/§52): no name/email/birth/free-text-question columns; visitor_id is
--                          an anonymous random id; raw IP / full user-agent are NOT stored.
-- Requires: public.is_admin() (docs/admin/ADMIN_SETUP.sql); public.profiles,
--   public.ai_usage_logs, public.consultation_subjects; public.set_updated_at()
--   (docs/CONSUMER_CORE_SCHEMA.sql).
-- =============================================================================

-- ---- 1. advertisements (admin-managed primary entity) -----------------------
create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  public_tracking_code text unique,                 -- assigned on publish (§7/§9)
  ad_type text not null default 'other'
    check (ad_type in ('youtube_shorts','youtube_video','instagram_reels','instagram_post','other')),
  publisher_nickname text not null,                 -- operator free text (§5)
  ad_check_url text,                                -- posted content URL — distinct from tracking (§39)
  start_date date,
  contract_type text not null default 'other'
    check (contract_type in ('experience_group','self_produced','review_agency','direct_contract','other')),
  cost_krw bigint check (cost_krw is null or cost_krw >= 0),  -- null = 미입력 (§35)
  notes text,
  status text not null default 'draft'
    check (status in ('draft','active','ended','disabled')),  -- prefer status change over delete (§6)
  schema_version text not null default 'ads@1.0.0',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_advertisements_updated_at on public.advertisements;
create trigger trg_advertisements_updated_at before update on public.advertisements
  for each row execute function public.set_updated_at();

alter table public.advertisements enable row level security;
drop policy if exists advertisements_admin_all on public.advertisements;
create policy advertisements_admin_all on public.advertisements for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- 2. ad_tracking_events (append-only telemetry) --------------------------
-- event_type: ad_click (anonymous, visitor_id) | birth_info_completed | signup |
--   first_consultation (user_id). D1/D7/D30 are DERIVED at read time (not stored events).
create table if not exists public.ad_tracking_events (
  id bigint generated always as identity primary key,
  event_type text not null
    check (event_type in ('ad_click','birth_info_completed','signup','first_consultation')),
  tracking_code text,           -- present for ad_click; resolves to advertisements.public_tracking_code
  ad_id uuid references public.advertisements(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,   -- present for funnel milestones
  visitor_id text,              -- anonymous session id for ad_click (§18); never PII
  created_at timestamptz not null default now()
);
create index if not exists ad_tracking_events_ad_idx on public.ad_tracking_events (ad_id, event_type);
create index if not exists ad_tracking_events_user_idx on public.ad_tracking_events (user_id, event_type);
-- Idempotency (§26): one row per user per one-time milestone.
create unique index if not exists ad_tracking_events_once_uniq
  on public.ad_tracking_events (user_id, event_type)
  where event_type in ('birth_info_completed','signup','first_consultation') and user_id is not null;

alter table public.ad_tracking_events enable row level security;
-- NO client policies. Only the service role (edge function) writes; admins read via RPC.

-- ---- 3. user_acquisition_attribution (first-touch, one per user) ------------
create table if not exists public.user_acquisition_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_ad_id uuid references public.advertisements(id) on delete set null,
  first_tracking_code text,
  first_visitor_id text,
  first_touch_at timestamptz,
  latest_ad_id uuid references public.advertisements(id) on delete set null,   -- optional (§20)
  latest_touch_at timestamptz,
  signup_at timestamptz,
  first_consultation_at timestamptz,
  schema_version text not null default 'ads@1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_attribution_updated_at on public.user_acquisition_attribution;
create trigger trg_attribution_updated_at before update on public.user_acquisition_attribution
  for each row execute function public.set_updated_at();

alter table public.user_acquisition_attribution enable row level security;
drop policy if exists attribution_select_own on public.user_acquisition_attribution;
create policy attribution_select_own on public.user_acquisition_attribution for select
  using (user_id = auth.uid() or public.is_admin());
-- writes are server-side only (edge / triggers via service role) — no client insert/update policy.

-- ---- 4. Server-trusted conversion triggers (§50) ----------------------------
-- SIGNUP: a profiles row is inserted exactly once per new user (client ensureProfile).
create or replace function public.ad_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.ad_tracking_events (event_type, user_id)
  values ('signup', new.id)
  on conflict do nothing;
  update public.user_acquisition_attribution
    set signup_at = coalesce(signup_at, now())
    where user_id = new.id;
  return new;
end $$;
drop trigger if exists trg_ad_on_signup on public.profiles;
create trigger trg_ad_on_signup after insert on public.profiles
  for each row execute function public.ad_on_signup();

-- FIRST_CONSULTATION: first successful chat usage per user (server-authoritative).
create or replace function public.ad_on_chat_success()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'success' and new.request_type = 'chat' and new.user_id is not null then
    insert into public.ad_tracking_events (event_type, user_id)
    values ('first_consultation', new.user_id)
    on conflict do nothing;   -- unique index → only the FIRST success records the milestone
    if found then
      update public.user_acquisition_attribution
        set first_consultation_at = coalesce(first_consultation_at, now())
        where user_id = new.user_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_ad_on_chat_success on public.ai_usage_logs;
create trigger trg_ad_on_chat_success after insert on public.ai_usage_logs
  for each row execute function public.ad_on_chat_success();

-- BIRTH_INFO_COMPLETED: a committed consultation_subjects insert (real save, §23).
create or replace function public.ad_on_birth_info()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null then
    insert into public.ad_tracking_events (event_type, user_id)
    values ('birth_info_completed', new.user_id)
    on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_ad_on_birth_info on public.consultation_subjects;
create trigger trg_ad_on_birth_info after insert on public.consultation_subjects
  for each row execute function public.ad_on_birth_info();

-- ---- 5. Admin performance RPC (is_admin()-gated, aggregate only) -------------
-- Returns per-ad counts. Retention (D1/D7/D30) = user had a successful chat usage at
-- >= signup + N days (rolling-return survival window; see
-- docs/ADVERTISEMENT_ACQUISITION_TRACKING.md). Aggregate only — no user PII (§45).
create or replace function public.admin_ad_performance(p_from timestamptz default null, p_to timestamptz default null)
returns table (
  ad_id uuid, clicks bigint, unique_visitors bigint, birth_info bigint,
  signups bigint, first_consultations bigint, d1 bigint, d7 bigint, d30 bigint
)
language sql stable security definer set search_path = public as $$
  with a as (
    select id from public.advertisements
  ),
  clk as (
    select e.ad_id, count(*) as clicks, count(distinct e.visitor_id) as uniq
    from public.ad_tracking_events e
    where e.event_type = 'ad_click'
      and (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
    group by e.ad_id
  ),
  att as (   -- users attributed to each ad, with their signup + activity
    select ua.first_ad_id as ad_id, ua.user_id, ua.signup_at, ua.first_consultation_at
    from public.user_acquisition_attribution ua
    where ua.first_ad_id is not null
  ),
  act as (   -- retention: latest-N activity flags per attributed user
    select att.ad_id, att.user_id,
      bool_or(l.created_at >= att.signup_at + interval '1 day')  as r1,
      bool_or(l.created_at >= att.signup_at + interval '7 day')  as r7,
      bool_or(l.created_at >= att.signup_at + interval '30 day') as r30
    from att
    left join public.ai_usage_logs l
      on l.user_id = att.user_id and l.status = 'success' and l.request_type = 'chat'
    where att.signup_at is not null
    group by att.ad_id, att.user_id
  )
  select
    a.id as ad_id,
    coalesce(clk.clicks, 0) as clicks,
    coalesce(clk.uniq, 0) as unique_visitors,
    coalesce((select count(*) from att where att.ad_id = a.id and exists (
      select 1 from public.ad_tracking_events e
      where e.user_id = att.user_id and e.event_type = 'birth_info_completed')), 0) as birth_info,
    coalesce((select count(*) from att where att.ad_id = a.id and att.signup_at is not null), 0) as signups,
    coalesce((select count(*) from att where att.ad_id = a.id and att.first_consultation_at is not null), 0) as first_consultations,
    coalesce((select count(*) from act where act.ad_id = a.id and act.r1), 0) as d1,
    coalesce((select count(*) from act where act.ad_id = a.id and act.r7), 0) as d7,
    coalesce((select count(*) from act where act.ad_id = a.id and act.r30), 0) as d30
  from a
  left join clk on clk.ad_id = a.id;
$$;
revoke all on function public.admin_ad_performance(timestamptz, timestamptz) from public;
grant execute on function public.admin_ad_performance(timestamptz, timestamptz) to authenticated;

-- Guard: the RPC body itself must refuse non-admins. Wrap the grant with an is_admin gate.
create or replace function public.admin_ad_performance(p_from timestamptz, p_to timestamptz)
returns table (
  ad_id uuid, clicks bigint, unique_visitors bigint, birth_info bigint,
  signups bigint, first_consultations bigint, d1 bigint, d7 bigint, d30 bigint
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
    with a as (select id from public.advertisements),
    clk as (
      select e.ad_id, count(*) as clicks, count(distinct e.visitor_id) as uniq
      from public.ad_tracking_events e
      where e.event_type = 'ad_click'
        and (p_from is null or e.created_at >= p_from)
        and (p_to is null or e.created_at <= p_to)
      group by e.ad_id),
    att as (
      select ua.first_ad_id as ad_id, ua.user_id, ua.signup_at, ua.first_consultation_at
      from public.user_acquisition_attribution ua where ua.first_ad_id is not null),
    act as (
      select att.ad_id, att.user_id,
        bool_or(l.created_at >= att.signup_at + interval '1 day')  as r1,
        bool_or(l.created_at >= att.signup_at + interval '7 day')  as r7,
        bool_or(l.created_at >= att.signup_at + interval '30 day') as r30
      from att
      left join public.ai_usage_logs l
        on l.user_id = att.user_id and l.status = 'success' and l.request_type = 'chat'
      where att.signup_at is not null
      group by att.ad_id, att.user_id)
    select a.id,
      coalesce(clk.clicks,0), coalesce(clk.uniq,0),
      coalesce((select count(*) from att where att.ad_id=a.id and exists(
        select 1 from public.ad_tracking_events e where e.user_id=att.user_id and e.event_type='birth_info_completed')),0),
      coalesce((select count(*) from att where att.ad_id=a.id and att.signup_at is not null),0),
      coalesce((select count(*) from att where att.ad_id=a.id and att.first_consultation_at is not null),0),
      coalesce((select count(*) from act where act.ad_id=a.id and act.r1),0),
      coalesce((select count(*) from act where act.ad_id=a.id and act.r7),0),
      coalesce((select count(*) from act where act.ad_id=a.id and act.r30),0)
    from a left join clk on clk.ad_id=a.id;
end $$;
revoke all on function public.admin_ad_performance(timestamptz, timestamptz) from public;
grant execute on function public.admin_ad_performance(timestamptz, timestamptz) to authenticated;

-- ---- 6. Post-apply verification (read-only) ---------------------------------
-- select tablename, rowsecurity from pg_tables
--   where schemaname='public' and tablename in
--   ('advertisements','ad_tracking_events','user_acquisition_attribution');
-- Expect rowsecurity = true for all three.
