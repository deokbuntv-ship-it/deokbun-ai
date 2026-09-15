-- PRODUCT-EVENTS ABUSE RATE LIMIT (launch-readiness §32-45). Additive, idempotent. OWNER_APPLY — NOT pushed.
--
-- CONTEXT: the expensive LLM path (consultation + summary) is already rate-limited server-side in the chat
-- edge (checkBurstRateLimit, ~20 req/60s, before any paid call). The remaining unprotected write path is the
-- analytics stream: product_events is a client→DB insert guarded only by RLS (insert-own). A malicious client
-- could cheaply spam impression/click rows. This adds a SERVER-SIDE per-user ceiling so analytics writes cannot
-- be used to run up DB cost — enforcement lives in the DB, not in a disabled UI button (§34).
--
-- DESIGN: a BEFORE INSERT trigger counts the caller's own rows in a rolling 60s window and rejects once a
-- generous ceiling is crossed. The cap (300/min ≈ 5/sec) is far above real usage — one Home view emits well
-- under 10 events — so legitimate users are never affected, while a runaway/automated client is stopped. The
-- client's trackProductEvent already swallows insert errors silently (§40), so a rejected event is a no-op for
-- UX; the point is purely to cap cost. SECURITY DEFINER is required because users have NO select policy on
-- product_events (write-only table) and so cannot count their own rows under RLS.

create index if not exists product_events_user_created_idx
  on public.product_events (user_id, created_at desc);

create or replace function public.enforce_product_events_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
  cap constant integer := 300; -- per rolling 60s per user; generous ceiling (real usage is <10 / Home view)
begin
  -- No authenticated user id → nothing to attribute; RLS already blocks anon inserts, so let it fall through
  -- to the normal policy check rather than counting a null bucket.
  if new.user_id is null then
    return new;
  end if;
  select count(*)
    into recent
  from public.product_events
  where user_id = new.user_id
    and created_at > now() - interval '60 seconds';
  if recent >= cap then
    -- Aborts just this insert; the client swallows it (analytics is non-blocking).
    raise exception 'product_events rate limit exceeded' using errcode = '53400';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_product_events_rate_limit on public.product_events;
create trigger trg_product_events_rate_limit
  before insert on public.product_events
  for each row execute function public.enforce_product_events_rate_limit();

comment on function public.enforce_product_events_rate_limit() is
  'Per-user rolling-60s ceiling (300) on product_events inserts — abuse protection for the analytics write path. SECURITY DEFINER to count under the write-only table RLS. Client swallows the rejection (non-blocking).';
