-- =============================================================================
-- DeokbunAI — Advertisement & Acquisition Tracking schema  (ARTIFACT — owner-apply)
-- =============================================================================
-- Backs src/features/ads/** (Advertisement admin CRUD, tracking events, first-touch
-- attribution, funnel + CAC/CPA analytics). Sprint 3B (rev 2 — production-schema-aligned).
--
-- ⚠️ ARTIFACT ONLY — NOT auto-applied. Additive + idempotent + non-destructive
--   (create if not exists; create or replace; drop policy/trigger if exists + recreate).
--   NO DROP TABLE / TRUNCATE / DELETE. Safe to re-run. Owner applies in the Supabase SQL
--   editor after review.
--
-- ⚠️ HOLD: admin CRUD (advertisements) works as soon as THIS file is applied. The tracking
--   pipeline (events/attribution/triggers/RPC) also needs the `ad-track` Edge Function
--   (supabase/functions/ad-track) deployed. Until then the app's performance screen shows a
--   truthful "집계 준비 중" state (fail-closed).
--
-- PRODUCTION SCHEMA ALIGNMENT (verified live 2026-08-14 via docs/ADVERTISEMENTS_DIAGNOSTIC.sql):
--   Present in prod: public.is_admin(), auth.users, public.ai_usage_logs
--     (status/request_type/user_id), public.consultation_subjects (user_id).
--   NOT present in prod: public.profiles, public.set_updated_at().
--   → This file therefore (a) defines its OWN ads_set_updated_at() — no shared-fn dependency;
--     (b) does NOT create or depend on public.profiles; (c) records the SIGNUP milestone from
--     the attribution-row insert (created only by the JWT-verified `ad-track` edge), NOT from
--     a profiles/auth.users trigger. No auth-schema trigger is created.
--
-- RLS model:
--   * advertisements     — ADMIN-ONLY CRUD, gated by public.is_admin(). No anon/user access.
--   * ad_tracking_events — append-only telemetry. RLS enabled, NO client policies: the ONLY
--     writer is the `ad-track` Edge Function (service role) + the SECURITY DEFINER triggers
--     below. Admins read via the RPC. Anonymous ad_click is a validated, rate-limited,
--     service-role insert in the edge — NOT an anon-insert RLS policy.
--   * user_acquisition_attribution — one row per acquired user, first-touch. RLS enabled;
--     owner may read their own row; writes are server-side only (edge). No client write policy.
--   * SERVER-TRUSTED conversions (§50): a client can NEVER assert a conversion.
--       - signup            = the attribution INSERT (edge, JWT-verified user) fires
--                             ad_reconcile_attribution → records the signup event + signup_at.
--       - first_consultation= trigger on the FIRST successful chat ai_usage_logs row per user.
--       - birth_info        = trigger on a committed consultation_subjects INSERT.
--     Each is idempotent via a unique index; the reconcile trigger + the two forward triggers
--     together make the anchors reliable regardless of write order (no race).
--   * PII-minimal (§45/§52): no name/email/birth/question columns; visitor_id is an anon
--     random id; raw IP / full user-agent are NOT stored.
-- Requires (ALL already applied in prod): public.is_admin() (docs/admin/ADMIN_SETUP.sql);
--   public.ai_usage_logs; public.consultation_subjects. (No profiles / set_updated_at dep.)
-- =============================================================================

-- ---- 0. Self-contained updated_at trigger fn (ads-scoped; does NOT touch the shared one) --
create or replace function public.ads_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

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
  for each row execute function public.ads_set_updated_at();

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
-- NO client policies. Only the service role (edge) + SECURITY DEFINER triggers write; admins read via RPC.

-- ---- 3. user_acquisition_attribution (first-touch, one per user) ------------
create table if not exists public.user_acquisition_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_ad_id uuid references public.advertisements(id) on delete set null,
  first_tracking_code text,
  first_visitor_id text,
  first_touch_at timestamptz,
  latest_ad_id uuid references public.advertisements(id) on delete set null,   -- optional (§20)
  latest_touch_at timestamptz,
  signup_at timestamptz,                 -- set by ad_reconcile_attribution at row insert (= first auth)
  first_consultation_at timestamptz,
  schema_version text not null default 'ads@1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_attribution_updated_at on public.user_acquisition_attribution;
create trigger trg_attribution_updated_at before update on public.user_acquisition_attribution
  for each row execute function public.ads_set_updated_at();

alter table public.user_acquisition_attribution enable row level security;
drop policy if exists attribution_select_own on public.user_acquisition_attribution;
create policy attribution_select_own on public.user_acquisition_attribution for select
  using (user_id = auth.uid() or public.is_admin());
-- writes are server-side only (edge, service role) — no client insert/update policy.

-- ---- 4. Conversion recording (server-trusted, §50) --------------------------
-- The attribution row is the ANCHOR. It is created ONLY by the JWT-verified ad-track edge
-- (so a client can never forge it). Its INSERT fires this reconcile, which:
--   (a) records SIGNUP *only for a genuinely NEW account*, and
--   (b) adopts any activity that already happened BEFORE attribution landed (birth /
--       first-consultation), so the forward triggers below + this together are race-free.
--
-- NEW-ACCOUNT RULE (mirrors src/features/ads/signupEligibility.ts — keep in sync):
--   FAIL-CLOSED + EVIDENCE-BACKED. A signup requires ALL of: (1) a JWT-verified account,
--   (2) a SERVER-recorded ad_click for this attribution's visitor, and (3)
--   auth.users.created_at >= that ad_click.created_at (account born at/after the click →
--   new). A pre-existing user (created before the click) gets attribution but NO signup.
--   MISSING account created_at → NO signup. MISSING server-recorded click → NO signup — we
--   do NOT infer a signup from attribution time, any time window, client timestamps, or a
--   client "isNewUser" flag (§14). We prefer an undercount from missing telemetry over
--   contaminating CAC/conversion with an inferred acquisition.
create or replace function public.ad_reconcile_attribution()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_created timestamptz;   -- auth.users.created_at (JWT-verified account)
  v_click   timestamptz;   -- server-recorded first ad_click time for this visitor
  v_is_new  boolean;
begin
  select u.created_at into v_created from auth.users u where u.id = new.user_id;
  if new.first_visitor_id is not null then
    select min(e.created_at) into v_click
      from public.ad_tracking_events e
      where e.event_type = 'ad_click' and e.visitor_id = new.first_visitor_id;
  end if;

  -- first_touch_at reflects the real (server-recorded) ad-click time when we have it.
  if v_click is not null then
    update public.user_acquisition_attribution
      set first_touch_at = v_click where user_id = new.user_id;
  end if;

  -- SIGNUP requires trusted click evidence AND account-born-at/after-click. No click → NO signup.
  v_is_new := v_created is not null and v_click is not null and v_created >= v_click;

  -- (a) SIGNUP — new accounts only (§1/§2/§5/§6). Existing users: attribution kept, no signup.
  if v_is_new then
    insert into public.ad_tracking_events (event_type, user_id)
    values ('signup', new.user_id)
    on conflict do nothing;
    update public.user_acquisition_attribution
      set signup_at = coalesce(signup_at, v_created)   -- anchor retention on account creation
      where user_id = new.user_id;
  end if;

  -- Downstream funnel milestones are recorded ONLY for the newly-acquired cohort (v_is_new),
  -- so a pre-existing user who clicked an ad never contaminates birth/first-consult/CPA either
  -- (owner directive — existing users must not contaminate acquisition cohorts).
  if v_is_new then
    -- (b1) birth info already completed before attribution landed?
    if exists (select 1 from public.consultation_subjects s where s.user_id = new.user_id) then
      insert into public.ad_tracking_events (event_type, user_id)
      values ('birth_info_completed', new.user_id)
      on conflict do nothing;
    end if;

    -- (b2) a successful consultation already happened before attribution landed?
    if exists (
      select 1 from public.ai_usage_logs l
      where l.user_id = new.user_id and l.status = 'success' and l.request_type = 'chat'
    ) then
      insert into public.ad_tracking_events (event_type, user_id)
      values ('first_consultation', new.user_id)
      on conflict do nothing;
      update public.user_acquisition_attribution
        set first_consultation_at = coalesce(first_consultation_at, (
          select min(l.created_at) from public.ai_usage_logs l
          where l.user_id = new.user_id and l.status = 'success' and l.request_type = 'chat'))
        where user_id = new.user_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_ad_reconcile_attribution on public.user_acquisition_attribution;
create trigger trg_ad_reconcile_attribution after insert on public.user_acquisition_attribution
  for each row execute function public.ad_reconcile_attribution();

-- FIRST_CONSULTATION (normal case): first successful chat usage per acquired user.
-- Guarded by attribution existence so ONLY ad-attributed users generate funnel events
-- (privacy-minimal, §52); the reconcile above covers the rare before-attribution case.
create or replace function public.ad_on_chat_success()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Only the newly-acquired cohort (attribution row WITH a recorded signup) contributes to the
  -- funnel — a pre-existing user who clicked an ad never counts (signup_at is null for them).
  if new.status = 'success' and new.request_type = 'chat' and new.user_id is not null
     and exists (select 1 from public.user_acquisition_attribution ua
                 where ua.user_id = new.user_id and ua.signup_at is not null) then
    insert into public.ad_tracking_events (event_type, user_id)
    values ('first_consultation', new.user_id)
    on conflict do nothing;                     -- unique index → only the FIRST success counts
    if found then
      update public.user_acquisition_attribution
        set first_consultation_at = coalesce(first_consultation_at, new.created_at)
        where user_id = new.user_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_ad_on_chat_success on public.ai_usage_logs;
create trigger trg_ad_on_chat_success after insert on public.ai_usage_logs
  for each row execute function public.ad_on_chat_success();

-- BIRTH_INFO_COMPLETED (normal case): a committed consultation_subjects insert (real save, §23).
create or replace function public.ad_on_birth_info()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Newly-acquired cohort only (attribution WITH a recorded signup) — see ad_on_chat_success.
  if new.user_id is not null
     and exists (select 1 from public.user_acquisition_attribution ua
                 where ua.user_id = new.user_id and ua.signup_at is not null) then
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
-- SINGLE definition — plpgsql, is_admin()-gated in the body (a non-admin gets an exception,
-- never rows), so no unguarded variant of this function can exist (§14).
create or replace function public.admin_ad_performance(
  p_from timestamptz default null, p_to timestamptz default null
)
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
      -- unique_visitors is NULL when no click carried a reliable visitor id (§18 — never a
      -- fabricated 0/"고유 방문자"); nullif turns the all-NULL-id case into NULL.
      select e.ad_id, count(*) as clicks, nullif(count(distinct e.visitor_id), 0) as uniq
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
      coalesce(clk.clicks,0), clk.uniq,   -- unique_visitors may be NULL (hidden) — never coalesced to 0
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
-- Expect rowsecurity = true for all three. Then re-run docs/ADVERTISEMENTS_DIAGNOSTIC.sql —
-- every ad_* object should now report present.
