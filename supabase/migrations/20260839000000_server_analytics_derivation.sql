-- ============================================================================
-- SERVER ANALYTICS DERIVATION (Owner Activation 04F). Emits the SERVER-AUTHORITATIVE product_events that the
-- client cannot observe, DERIVED FROM COMMITTED BUSINESS TRUTH (duk_ledger / duk_reserve / consultation_sessions).
--
-- SAFETY (§3/§4/§6): analytics is NEVER financial authority and NEVER blocks billing. Each trigger is:
--   • AFTER the business write (the financial row is already committed to its statement),
--   • wrapped in a BEGIN…EXCEPTION WHEN OTHERS THEN NULL block (a savepoint) — any analytics failure is
--     swallowed and can only roll back its own product_events insert, never the ledger/reserve/session row,
--   • SECURITY DEFINER so it may insert under product_events FORCE RLS (mirrors record_product_event).
--
-- IDEMPOTENCY (§17): analytics inherits financial idempotency for free — one immutable business-truth row →
--   one event. Replays/follow-ups create no new ledger debit / reserve / turn increment, so no duplicate event.
--   Analytics rows are NEVER used to enforce financial idempotency.
--
-- PRIVACY (§18): only categorical/numeric allowlisted property keys (amount/bucket/reason/product/turn_count).
--   The source tables contain no prompt/answer/birth/name/email — no PII can appear.
--
-- ADDITIVE. No engine/decision/price/spend-order/welcome/candle/debt change. OWNER_APPLY_REQUIRED.
-- ============================================================================

-- (1) duk_ledger-derived: welcome grant + session-price commit/spend.
create or replace function public.analytics_from_ledger() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  begin
    if NEW.reason = 'WELCOME' then
      insert into public.product_events (user_id, event_name, surface, properties)
        values (NEW.user_id, 'welcome_duk_granted', 'server',
          jsonb_build_object('amount', NEW.delta, 'bucket', NEW.bucket, 'reason', NEW.reason));
    elsif NEW.delta < 0 and NEW.reason in ('CONSULTATION','COMPATIBILITY','PREMIUM_REPORT') then
      insert into public.product_events (user_id, event_name, surface, consultation_mode, properties)
        values (NEW.user_id, 'duk_committed', 'server',
          case NEW.reason when 'COMPATIBILITY' then 'compatibility' else 'solo' end,
          jsonb_build_object('amount', -NEW.delta, 'bucket', NEW.bucket, 'reason', NEW.reason,
            'product', case NEW.reason when 'CONSULTATION' then 'general' when 'COMPATIBILITY' then 'compatibility' else 'premium_report' end));
      insert into public.product_events (user_id, event_name, surface, consultation_mode, properties)
        values (NEW.user_id, 'duk_spent', 'server',
          case NEW.reason when 'COMPATIBILITY' then 'compatibility' else 'solo' end,
          jsonb_build_object('amount', -NEW.delta, 'bucket', NEW.bucket,
            'product', case NEW.reason when 'CONSULTATION' then 'general' when 'COMPATIBILITY' then 'compatibility' else 'premium_report' end));
    end if;
  exception when others then null; -- best-effort; never roll back the ledger row
  end;
  return null;
end $$;
drop trigger if exists duk_ledger_analytics on public.duk_ledger;
create trigger duk_ledger_analytics after insert on public.duk_ledger
  for each row execute function public.analytics_from_ledger();

-- (2) duk_reserve-derived: real reservation + release.
create or replace function public.analytics_from_reserve() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  begin
    if tg_op = 'INSERT' and NEW.status = 'RESERVED' then
      insert into public.product_events (user_id, event_name, surface, properties)
        values (NEW.user_id, 'duk_reserved', 'server',
          jsonb_build_object('amount', NEW.amount, 'product', NEW.product_type));
    elsif tg_op = 'UPDATE' and NEW.status = 'RELEASED' and OLD.status is distinct from 'RELEASED' then
      insert into public.product_events (user_id, event_name, surface, properties)
        values (NEW.user_id, 'duk_released', 'server',
          jsonb_build_object('amount', NEW.amount, 'product', NEW.product_type));
    end if;
  exception when others then null;
  end;
  return null;
end $$;
drop trigger if exists duk_reserve_analytics on public.duk_reserve;
create trigger duk_reserve_analytics after insert or update on public.duk_reserve
  for each row execute function public.analytics_from_reserve();

-- (3) consultation_sessions-derived: session start + each newly completed turn.
create or replace function public.analytics_from_session() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  begin
    if tg_op = 'INSERT' then
      insert into public.product_events (user_id, event_name, surface, consultation_mode, properties)
        values (NEW.user_id, 'session_started', 'server',
          case NEW.product_type when 'compatibility' then 'compatibility' else 'solo' end,
          jsonb_build_object('product', NEW.product_type));
    elsif tg_op = 'UPDATE' and NEW.successful_turn_count > OLD.successful_turn_count then
      insert into public.product_events (user_id, event_name, surface, consultation_mode, properties)
        values (NEW.user_id, 'session_turn_completed', 'server',
          case NEW.product_type when 'compatibility' then 'compatibility' else 'solo' end,
          jsonb_build_object('product', NEW.product_type, 'turn_count', NEW.successful_turn_count));
    end if;
  exception when others then null;
  end;
  return null;
end $$;
drop trigger if exists consultation_sessions_analytics on public.consultation_sessions;
create trigger consultation_sessions_analytics after insert or update on public.consultation_sessions
  for each row execute function public.analytics_from_session();
