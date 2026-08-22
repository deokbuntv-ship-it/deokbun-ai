-- ============================================================================
-- DeokbunAI — DUK ECONOMY RUNTIME tables (Sprint G §AI/§W/§AE/§AF/§AH)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Additive; validate in STAGING first. Complements
-- 20260831000000_duk_economy_foundation.sql (ledger/debt/reserve/spend_duk/grant_duk). Adds the server-owned
-- economy policy, session state, candle rewards, event campaigns, and PLUS entitlement. RLS: owners READ their
-- own rows; economy_policy is publicly READable (active rows) so the client can render costs; NO client write
-- policy anywhere — service-role RPCs are the only writers. Stores NO PII.
-- ============================================================================

-- ── economy policy (server-owned, versioned; NOT changed by an app update) ─────────────────────────────────
create table if not exists public.economy_policy (
  policy_version            text primary key,
  welcome_reward            integer not null default 10,
  candle_reward             integer not null default 1,
  candle_cooldown_seconds   integer not null default 86400,
  birthday_reward           integer not null default 5,
  general_session_cost      integer not null default 5,
  compatibility_session_cost integer not null default 12,
  premium_report_cost       integer not null default 50,
  session_turn_limit        integer not null default 5,
  session_ttl_seconds       integer not null default 86400,
  reserve_ttl_seconds       integer not null default 300,
  new_user_bonus_days       integer not null default 0,   -- D1-D7 acceleration OFF
  new_user_candle_bonus     integer not null default 0,
  plus_monthly_duk          integer,                       -- TBD (null)
  plus_duk_expiry_seconds   integer,                       -- TBD (null)
  compatibility_model_mode  text not null default 'FULL_TERRA' check (compatibility_model_mode in ('FULL_TERRA','SMART_HYBRID')),
  effective_at              timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  is_active                 boolean not null default true
);
-- Seed the V1 LOCKED policy (Sprint G §N). Idempotent.
insert into public.economy_policy (policy_version) values ('economy@1.0.0')
  on conflict (policy_version) do nothing;
create unique index if not exists economy_policy_one_active on public.economy_policy (is_active) where is_active;

-- ── consultation sessions (one paid product instance; §W) ───────────────────────────────────────────────────
create table if not exists public.consultation_sessions (
  session_id             uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  product_type           text not null check (product_type in ('general','compatibility','premium_report')),
  charge_id              uuid,
  status                 text not null default 'OPEN' check (status in ('OPEN','ACTIVE','COMPLETE','EXPIRED','ABANDONED')),
  successful_turn_count  integer not null default 0,
  turn_limit             integer not null default 5,
  price_duk              integer not null,
  routing_policy_version text,
  economy_policy_version text not null,
  created_at             timestamptz not null default now(),
  expires_at             timestamptz not null,
  updated_at             timestamptz not null default now()
);
create index if not exists consultation_sessions_user_idx on public.consultation_sessions (user_id, created_at desc);

-- ── candle claims (server time only; atomic cooldown; §AF) ──────────────────────────────────────────────────
create table if not exists public.candle_state (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  last_lit_at   timestamptz,
  updated_at    timestamptz not null default now()
);

-- ── event campaigns (configurable; NO default distribution; §AH) ────────────────────────────────────────────
create table if not exists public.event_campaigns (
  campaign_id      text primary key,
  reward_amount    integer not null check (reward_amount > 0),
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  per_user_limit   integer not null default 1 check (per_user_limit >= 1),
  eligibility      text not null default 'ALL',
  is_active        boolean not null default false,   -- OFF by default; no uncontrolled distribution
  created_at       timestamptz not null default now()
);
create table if not exists public.event_claims (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  text not null references public.event_campaigns (campaign_id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now()
);
create unique index if not exists event_claims_uniq on public.event_claims (campaign_id, user_id);

-- ── PLUS entitlement foundation (§AE — not monetized yet) ───────────────────────────────────────────────────
create table if not exists public.plus_entitlements (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  is_plus       boolean not null default false,
  started_at    timestamptz,
  expires_at    timestamptz,
  source        text,                 -- store subscription id (server-verified), null for none
  updated_at    timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────────────────────────────────────
alter table public.economy_policy         enable row level security;
alter table public.consultation_sessions  enable row level security;
alter table public.candle_state           enable row level security;
alter table public.event_campaigns        enable row level security;
alter table public.event_claims           enable row level security;
alter table public.plus_entitlements      enable row level security;

-- economy_policy: public READ of the active row (client renders costs); no client write.
drop policy if exists economy_policy_read_active on public.economy_policy;
create policy economy_policy_read_active on public.economy_policy for select using (is_active);
-- owner-scoped READ for the rest; NO client write anywhere (service-role RPCs only).
drop policy if exists consultation_sessions_select_own on public.consultation_sessions;
create policy consultation_sessions_select_own on public.consultation_sessions for select using (user_id = auth.uid());
drop policy if exists candle_state_select_own on public.candle_state;
create policy candle_state_select_own on public.candle_state for select using (user_id = auth.uid());
drop policy if exists event_campaigns_read_active on public.event_campaigns;
create policy event_campaigns_read_active on public.event_campaigns for select using (is_active);
drop policy if exists event_claims_select_own on public.event_claims;
create policy event_claims_select_own on public.event_claims for select using (user_id = auth.uid());
drop policy if exists plus_entitlements_select_own on public.plus_entitlements;
create policy plus_entitlements_select_own on public.plus_entitlements for select using (user_id = auth.uid());

-- ── light_candle RPC — atomic cooldown grant (§AF). Candle is a FREE reward (no cost/LLM), so it is a direct
-- AUTHENTICATED RPC keyed by auth.uid() (a user can only light THEIR OWN candle; a passed id is impossible).
-- SECURITY DEFINER writes the reward ledger row directly (bypasses RLS); idempotent under concurrency via the
-- single-row conditional cooldown claim. Server time only.
create or replace function public.light_candle()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_cfg record;
  v_last timestamptz;
  v_reward integer;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select candle_reward, candle_cooldown_seconds into v_cfg
    from public.economy_policy where is_active limit 1;
  if not found then raise exception 'no active economy policy' using errcode = '55000'; end if;
  v_reward := v_cfg.candle_reward;

  -- Atomic conditional claim: insert-or-update last_lit_at ONLY when eligible. Concurrent clicks race on this
  -- single row; exactly one satisfies the cooldown predicate and updates → exactly one grant.
  insert into public.candle_state (user_id, last_lit_at) values (v_user, now())
  on conflict (user_id) do update set last_lit_at = now(), updated_at = now()
    where public.candle_state.last_lit_at is null
       or public.candle_state.last_lit_at + (v_cfg.candle_cooldown_seconds || ' seconds')::interval <= now()
  returning last_lit_at into v_last;

  if v_last is null then
    -- not eligible (cooldown active): no grant.
    select last_lit_at into v_last from public.candle_state where user_id = v_user;
    return jsonb_build_object('granted', false, 'next_available_at',
      v_last + (v_cfg.candle_cooldown_seconds || ' seconds')::interval, 'reward_amount', v_reward);
  end if;

  -- Direct reward ledger row (SECURITY DEFINER bypasses RLS). Idempotency is the cooldown claim above.
  insert into public.duk_ledger (user_id, bucket, delta, reason)
    values (v_user, 'REWARD', v_reward, 'CANDLE');
  return jsonb_build_object('granted', true, 'next_available_at',
    now() + (v_cfg.candle_cooldown_seconds || ' seconds')::interval, 'reward_amount', v_reward);
end;
$$;
revoke all on function public.light_candle() from public, anon;
grant execute on function public.light_candle() to authenticated;
