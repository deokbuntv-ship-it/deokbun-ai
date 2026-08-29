-- ============================================================================
-- DeokbunAI — FIX: released reservation still blocked a fresh retry (found live on staging)
--
-- Pairs with 20260846000000. Live rolled-back verification on staging (2026-08-29) proved
-- 20260846000000 alone is incomplete: `duk_reserve_request_uniq` is a PLAIN unique index on
-- (user_id, request_id) with no status awareness, so once a request_id's reservation is
-- released+abandoned, `reserve_session_duk`'s fresh-reservation INSERT for the same
-- (user_id, request_id) — the exact retry path 20260846000000 was written to allow — hits a
-- 23505 unique-violation instead of succeeding. Live error observed:
--   duplicate key value violates unique constraint "duk_reserve_request_uniq"
--
-- Fix: make the index PARTIAL — unique only among 'RESERVED' and 'COMMITTED' rows (the two
-- states that must never collide: a live hold, or an already-paid completion). A 'RELEASED' row
-- is inert history and no longer needs to reserve its (user_id, request_id) slot, so a retry can
-- insert a brand-new row for the same key. Still fail-closed: two simultaneous RESERVED rows for
-- the same key remain impossible, and a COMMITTED row still blocks a duplicate real charge.
-- ============================================================================

drop index if exists public.duk_reserve_request_uniq;

create unique index duk_reserve_request_uniq on public.duk_reserve (user_id, request_id)
  where request_id is not null and status in ('RESERVED', 'COMMITTED');
