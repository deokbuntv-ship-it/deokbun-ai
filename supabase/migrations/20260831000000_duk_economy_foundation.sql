-- ============================================================================
-- DeokbunAI — DUK ECONOMY FOUNDATION (Sprint F.1 §P draft)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. DRAFT: validate in STAGING before production. Purely ADDITIVE
-- (creates new tables / views / functions; touches nothing existing). The tables are INERT until the wallet
-- code ships. RLS grants owners READ of their own rows and NO write policy — the service-role RPCs are the ONLY
-- writers. Implements the concurrency-critical invariants of docs/DUK_IMPLEMENTATION_CONTRACT.md (§O–§S).
--
-- Stores NO PII: only signed Duk deltas, bucket, reason, and idempotency identities.
-- ============================================================================

-- ── append-only ledger (balance is a DERIVED projection, never a mutated field) ─────────────────────────────
create table if not exists public.duk_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  bucket        text not null check (bucket in ('PLUS','REWARD','PAID')),
  delta         integer not null check (delta <> 0),
  reason        text not null check (reason in (
                  'WELCOME','CANDLE','BIRTHDAY','EVENT','PURCHASE','PLUS_GRANT',
                  'CONSULTATION','COMPATIBILITY','PREMIUM_REPORT','REFUND','REVERSAL','ADMIN_ADJUSTMENT')),
  session_id    uuid,          -- set for session spends (CONSULTATION/COMPATIBILITY/PREMIUM_REPORT)
  request_id    text,          -- the paid request id (idempotency of the first-turn charge)
  charge_id     uuid,          -- the single session-price debit id
  purchase_id   text,          -- external store transaction id (PURCHASE / REFUND provenance)
  expires_at    timestamptz,   -- per-row expiry (bucket policy); null = no expiry
  created_at    timestamptz not null default now(),
  metadata      jsonb
);
create index if not exists duk_ledger_user_bucket_idx on public.duk_ledger (user_id, bucket);
create index if not exists duk_ledger_user_created_idx on public.duk_ledger (user_id, created_at desc);
-- one session-price debit per (session_id, reason): the first-turn commit cannot double-charge on retry.
create unique index if not exists duk_ledger_session_reason_uniq
  on public.duk_ledger (session_id, reason) where session_id is not null;
-- one grant per external purchase: the same receipt processed twice grants Duk once (§S).
create unique index if not exists duk_ledger_purchase_uniq
  on public.duk_ledger (purchase_id, reason) where purchase_id is not null;

-- derived, non-expired balance per bucket.
create or replace view public.duk_balance as
  select user_id, bucket, sum(delta)::integer as balance
  from public.duk_ledger
  where expires_at is null or expires_at > now()
  group by user_id, bucket;

-- ── debt (obligation ledger; never a negative balance) ──────────────────────────────────────────────────────
create table if not exists public.duk_debt (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  amount         integer not null check (amount > 0),
  origin         text not null,
  revocation_id  text,          -- external revocation id; unique → one reversal per refund webhook (§S)
  resolved       boolean not null default false,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);
create unique index if not exists duk_debt_revocation_uniq on public.duk_debt (revocation_id) where revocation_id is not null;
create index if not exists duk_debt_user_open_idx on public.duk_debt (user_id) where not resolved;

-- ── session-charge reserve (state machine with version fencing, §R) ─────────────────────────────────────────
create table if not exists public.duk_reserve (
  session_id   uuid primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  amount       integer not null check (amount > 0),
  status       text not null default 'RESERVED' check (status in ('RESERVED','COMMITTED','RELEASED','EXPIRED')),
  version      integer not null default 0,   -- fencing/CAS: a transition must match the current version
  charge_id    uuid,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists duk_reserve_user_idx on public.duk_reserve (user_id);

alter table public.duk_ledger  enable row level security;
alter table public.duk_debt    enable row level security;
alter table public.duk_reserve enable row level security;
drop policy if exists duk_ledger_select_own  on public.duk_ledger;
drop policy if exists duk_debt_select_own     on public.duk_debt;
drop policy if exists duk_reserve_select_own  on public.duk_reserve;
create policy duk_ledger_select_own  on public.duk_ledger  for select using (user_id = auth.uid());
create policy duk_debt_select_own     on public.duk_debt     for select using (user_id = auth.uid());
create policy duk_reserve_select_own  on public.duk_reserve  for select using (user_id = auth.uid());
-- NO insert/update/delete policy on any of the three: service-role RPCs are the only writers.

-- ── spend_duk — locked, fixed-order allocation, idempotent (§P/§Q) ──────────────────────────────────────────
create or replace function public.spend_duk(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_session_id uuid,
  p_request_id text,
  p_charge_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing uuid;
  v_plus integer; v_reward integer; v_paid integer;
  v_remaining integer := p_amount;
  v_take integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'invalid amount' using errcode = '22023'; end if;

  -- Idempotency: the same session-price debit is written at most once (retry-safe).
  select charge_id into v_existing from public.duk_ledger
    where session_id = p_session_id and reason = p_reason limit 1;
  if v_existing is not null then return v_existing; end if;

  -- Serialize concurrent spends for this user (no read-modify-write race).
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select coalesce(sum(delta) filter (where bucket = 'PLUS'), 0),
         coalesce(sum(delta) filter (where bucket = 'REWARD'), 0),
         coalesce(sum(delta) filter (where bucket = 'PAID'), 0)
    into v_plus, v_reward, v_paid
  from public.duk_ledger
  where user_id = p_user_id and (expires_at is null or expires_at > now());

  if v_plus + v_reward + v_paid < p_amount then
    raise exception 'insufficient_duk' using errcode = 'P0001';
  end if;

  -- Fixed allocation order: PLUS → REWARD → PAID (one immutable debit row per bucket touched).
  v_take := least(v_remaining, v_plus);
  if v_take > 0 then
    insert into public.duk_ledger (user_id, bucket, delta, reason, session_id, request_id, charge_id)
      values (p_user_id, 'PLUS', -v_take, p_reason, p_session_id, p_request_id, p_charge_id);
    v_remaining := v_remaining - v_take;
  end if;
  v_take := least(v_remaining, v_reward);
  if v_take > 0 then
    insert into public.duk_ledger (user_id, bucket, delta, reason, session_id, request_id, charge_id)
      values (p_user_id, 'REWARD', -v_take, p_reason, p_session_id, p_request_id, p_charge_id);
    v_remaining := v_remaining - v_take;
  end if;
  v_take := least(v_remaining, v_paid);
  if v_take > 0 then
    insert into public.duk_ledger (user_id, bucket, delta, reason, session_id, request_id, charge_id)
      values (p_user_id, 'PAID', -v_take, p_reason, p_session_id, p_request_id, p_charge_id);
    v_remaining := v_remaining - v_take;
  end if;

  if v_remaining <> 0 then raise exception 'allocation_mismatch' using errcode = 'P0001'; end if;
  return p_charge_id;
end;
$$;

-- ── grant_duk — idempotent credit (purchases / rewards), §S replay-safe ─────────────────────────────────────
create or replace function public.grant_duk(
  p_user_id uuid,
  p_amount integer,
  p_bucket text,
  p_reason text,
  p_purchase_id text default null,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'invalid amount' using errcode = '22023'; end if;
  if p_bucket not in ('PLUS','REWARD','PAID') then raise exception 'invalid bucket' using errcode = '22023'; end if;
  -- Idempotent by external purchase id: the same receipt grants once (§S).
  if p_purchase_id is not null then
    select id into v_id from public.duk_ledger where purchase_id = p_purchase_id and reason = p_reason limit 1;
    if v_id is not null then return v_id; end if;
  end if;
  insert into public.duk_ledger (user_id, bucket, delta, reason, purchase_id, expires_at)
    values (p_user_id, p_bucket, p_amount, p_reason, p_purchase_id, p_expires_at)
    returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.spend_duk(uuid,integer,text,uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.grant_duk(uuid,integer,text,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.spend_duk(uuid,integer,text,uuid,text,uuid) to service_role;
grant execute on function public.grant_duk(uuid,integer,text,text,text,timestamptz) to service_role;

-- NOTE: the reserve state machine (RESERVED→COMMITTED/RELEASED/EXPIRED with version fencing, §R) and the
-- integration of spend_duk into complete_consultation_request_with_decision (§Q, commit-on-first-success) are
-- the WALLET BUILD step — not wired here. The duk_reserve table shape above is provided so that build starts
-- from the correct schema. Applying this migration alone creates inert tables/functions with no behavior change.
