-- ============================================================================
-- DeokbunAI — IAP SERVER AUTHORITY (Sprint H §31-§39)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. DRAFT, LIVE_DB_UNVERIFIED (validate in staging). Additive. The
-- CLIENT never authorizes a grant: a store product id is resolved SERVER-side to an internal key, purchases are
-- deduped by the provider's external transaction id, the first pack is lifetime-once, and grants/revocations
-- are idempotent. Service-role RPCs only. No live store products created; provider verification is a separate
-- Edge seam (verify-purchase) that stays NOT_CONFIGURED until the owner supplies credentials.
-- ============================================================================

-- Server product mapping: (provider, store_product_id) → internal key + grant. Owner-managed.
create table if not exists public.product_catalog (
  id                  uuid primary key default gen_random_uuid(),
  provider            text not null check (provider in ('APPLE','GOOGLE')),
  store_product_id    text not null,
  internal_product_key text not null check (internal_product_key in ('DUK_FIRST_20','DUK_BASE_50','DUK_LARGE_120','PLUS_MONTHLY')),
  grant_type          text not null check (grant_type in ('DUK','SUBSCRIPTION')),
  grant_amount        integer,          -- Duk for consumables; null for subscription
  lifetime_once       boolean not null default false,
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);
create unique index if not exists product_catalog_provider_store_uniq on public.product_catalog (provider, store_product_id);

-- Verified purchases: external transaction id is UNIQUE → a duplicate receipt grants once (§38).
create table if not exists public.verified_purchases (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users (id) on delete cascade,
  provider                text not null,
  external_transaction_id text not null,
  internal_product_key    text not null,
  granted_duk             integer not null default 0,
  created_at              timestamptz not null default now()
);
create unique index if not exists verified_purchases_external_uniq on public.verified_purchases (external_transaction_id);
create index if not exists verified_purchases_user_idx on public.verified_purchases (user_id, created_at desc);
-- First-pack lifetime: at most one DUK_FIRST_20 grant per user, ever (§37).
create unique index if not exists verified_purchases_first_pack_once on public.verified_purchases (user_id)
  where internal_product_key = 'DUK_FIRST_20';

-- Revocations: external revocation id is UNIQUE → a duplicate refund webhook reverses once (§39).
create table if not exists public.purchase_revocations (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  external_revocation_id text not null,
  external_transaction_id text,
  amount                 integer not null check (amount > 0),
  reversed_duk           integer not null default 0,
  debt_created           integer not null default 0,
  created_at             timestamptz not null default now()
);
create unique index if not exists purchase_revocations_external_uniq on public.purchase_revocations (external_revocation_id);

alter table public.product_catalog       enable row level security;
alter table public.verified_purchases    enable row level security;
alter table public.purchase_revocations  enable row level security;
drop policy if exists product_catalog_read_active on public.product_catalog;
create policy product_catalog_read_active on public.product_catalog for select using (active);  -- client may see active mapping
drop policy if exists verified_purchases_select_own on public.verified_purchases;
create policy verified_purchases_select_own on public.verified_purchases for select using (user_id = auth.uid());
drop policy if exists purchase_revocations_select_own on public.purchase_revocations;
create policy purchase_revocations_select_own on public.purchase_revocations for select using (user_id = auth.uid());
-- No client write policy anywhere: service-role RPCs are the only writers.

-- record_verified_purchase — idempotent grant (§38) + first-pack lifetime (§37) + debt offset (§29/§AA).
create or replace function public.record_verified_purchase(
  p_user_id uuid, p_provider text, p_external_transaction_id text, p_internal_key text, p_grant_duk integer
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_debt integer; v_offset integer; v_spendable integer; v_existing record;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;

  -- Idempotency: a duplicate external transaction id grants once.
  select * into v_existing from public.verified_purchases where external_transaction_id = p_external_transaction_id;
  if found then return jsonb_build_object('granted', 0, 'already', true); end if;

  -- First-pack lifetime (§37): the unique partial index also enforces this; check for a clean error.
  if p_internal_key = 'DUK_FIRST_20' and exists (
    select 1 from public.verified_purchases where user_id = p_user_id and internal_product_key = 'DUK_FIRST_20'
  ) then
    raise exception 'first pack already granted' using errcode = 'P0001';
  end if;

  insert into public.verified_purchases (user_id, provider, external_transaction_id, internal_product_key, granted_duk)
    values (p_user_id, p_provider, p_external_transaction_id, p_internal_key, p_grant_duk);

  -- Grant PAID Duk (idempotent by purchase id), then offset outstanding debt from the new PAID balance first.
  perform public.grant_duk(p_user_id, p_grant_duk, 'PAID', 'PURCHASE', p_external_transaction_id, null);
  select coalesce(sum(amount),0) into v_debt from public.duk_debt where user_id = p_user_id and not resolved;
  v_offset := least(coalesce(v_debt,0), p_grant_duk);
  if v_offset > 0 then
    -- Reduce debt and record the offset as a ledger debit (DEBT_OFFSET) against the just-granted PAID Duk.
    update public.duk_debt set resolved = true, resolved_at = now()
      where user_id = p_user_id and not resolved
        and id in (select id from public.duk_debt where user_id = p_user_id and not resolved order by created_at limit 1000);
    insert into public.duk_ledger (user_id, bucket, delta, reason, purchase_id)
      values (p_user_id, 'PAID', -v_offset, 'DEBT_OFFSET', p_external_transaction_id);
  end if;
  return jsonb_build_object('granted', p_grant_duk, 'debt_offset', v_offset, 'already', false);
end;
$$;

-- record_revocation — idempotent reversal → PAID reversal if traceable, else duk_debt (§39). Never negative PAID.
create or replace function public.record_revocation(
  p_user_id uuid, p_external_revocation_id text, p_external_transaction_id text, p_amount integer
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_paid integer; v_reverse integer; v_debt integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if exists (select 1 from public.purchase_revocations where external_revocation_id = p_external_revocation_id) then
    return jsonb_build_object('already', true);
  end if;

  select coalesce(sum(delta),0) into v_paid from public.duk_ledger
    where user_id = p_user_id and bucket = 'PAID' and (expires_at is null or expires_at > now());
  v_reverse := least(greatest(v_paid,0), p_amount);   -- reverse what PAID balance can cover
  v_debt := p_amount - v_reverse;                     -- the rest becomes debt (§29)

  if v_reverse > 0 then
    insert into public.duk_ledger (user_id, bucket, delta, reason, purchase_id)
      values (p_user_id, 'PAID', -v_reverse, 'REVERSAL', p_external_transaction_id);
  end if;
  if v_debt > 0 then
    insert into public.duk_debt (user_id, amount, origin, revocation_id)
      values (p_user_id, v_debt, 'REFUND', p_external_revocation_id);
  end if;
  insert into public.purchase_revocations (user_id, external_revocation_id, external_transaction_id, amount, reversed_duk, debt_created)
    values (p_user_id, p_external_revocation_id, p_external_transaction_id, p_amount, v_reverse, v_debt);
  return jsonb_build_object('already', false, 'reversed', v_reverse, 'debt', v_debt);
end;
$$;

revoke all on function public.record_verified_purchase(uuid,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.record_revocation(uuid,text,text,integer) from public, anon, authenticated;
grant execute on function public.record_verified_purchase(uuid,text,text,text,integer) to service_role;
grant execute on function public.record_revocation(uuid,text,text,integer) to service_role;
