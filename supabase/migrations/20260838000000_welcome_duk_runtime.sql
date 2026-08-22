-- ============================================================================
-- WELCOME 10-Duk RUNTIME (Owner Activation 04D). Closes the V1 HIGH: new users received 0 Duk at signup.
--
-- CONTRACT: a new eligible consumer (terms accepted) receives EXACTLY ONE +welcome_reward REWARD grant,
-- reason 'WELCOME', server-authoritative + idempotent. Amount comes from economy_policy.welcome_reward (10) —
-- NO client authority over amount/bucket/reason, NO direct balance UPDATE, immutable ledger only.
--
-- ADDITIVE + idempotent. Does NOT touch engines, decision/evidence/WHY semantics, model routing, prices
-- (general 5 / compat 12 / premium 50), candle, debt, or spend order. Uses the existing ledger substrate.
--
-- OWNER_APPLY_REQUIRED. Note: this fires only on NEW consent events; existing profiles with terms already set
-- are NOT retroactively granted (a backfill, if ever wanted, is a separate owner decision).
-- ============================================================================

-- (1) Idempotency substrate: at most one WELCOME ledger row per user. Partial unique index — WELCOME rows carry
-- session_id/purchase_id = null, so the existing session_reason_uniq / purchase_uniq partial indexes do not apply.
create unique index if not exists duk_ledger_welcome_uniq
  on public.duk_ledger (user_id) where (reason = 'WELCOME');

-- (2) Server-authoritative grant, fired at the onboarding CONSENT point (terms accepted). SECURITY DEFINER so it
-- appends to the RLS-protected, service-role-write ledger. Idempotent: the partial unique index + ON CONFLICT DO
-- NOTHING mean retries / re-onboarding / app reinstall / concurrent onboarding / later login all grant at most once.
create or replace function public.grant_welcome_on_consent() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_reward integer;
begin
  if new.terms_version is null then return new; end if;            -- not consented yet → not eligible
  select welcome_reward into v_reward from public.economy_policy where is_active limit 1;
  if v_reward is null or v_reward <= 0 then return new; end if;    -- policy disabled → no grant
  insert into public.duk_ledger (user_id, bucket, delta, reason)
    values (new.id, 'REWARD', v_reward, 'WELCOME')
    on conflict do nothing;                                        -- <= 1 WELCOME per user (partial unique index)
  return new;
end $$;

drop trigger if exists profiles_grant_welcome on public.profiles;
create trigger profiles_grant_welcome
  after insert or update of terms_version on public.profiles
  for each row when (new.terms_version is not null)
  execute function public.grant_welcome_on_consent();
