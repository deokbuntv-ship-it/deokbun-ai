-- ============================================================================
-- DeokbunAI — Product analytics FOUNDATION (generic product_events)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Additive + idempotent. NO db push this sprint.
--
-- PURPOSE (§33/§34) — a GENERIC, privacy-safe product-events seam V1 can emit and a future V2 can
-- learn from. This is NOT dating/matching: it captures anonymous-ish usage signals only. The client
-- analytics service applies a PROPERTY ALLOWLIST before insert, so `properties` can never carry PII.
--
-- FORBIDDEN in this table (§38): name, birth date/time/place, raw question, raw answer, email, phone,
-- raw report, raw pair evidence. Allowed properties are a small allowlist (relationship_type,
-- question_domain, compatibility_tier, policy_version, engine_version, followup_category, source,
-- channel) enforced client-side.
--
-- RLS (§59) — WRITE-ONLY for users: a user may INSERT only their own rows; there is NO select/update/
-- delete policy for users (the table is analytics, read by the owner via the service role only). anon
-- is denied. user_id is set by the DB default auth.uid().
-- ============================================================================

create table if not exists public.product_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid default auth.uid() references auth.users (id) on delete set null,
  event_name        text not null,
  surface           text,
  consultation_mode text,                          -- 'solo' | 'compatibility' | null
  properties        jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists product_events_user_idx on public.product_events (user_id);
create index if not exists product_events_name_idx on public.product_events (event_name);
create index if not exists product_events_created_idx on public.product_events (created_at);

-- ---- RLS: write-only for users (INSERT own; no SELECT/UPDATE/DELETE policy) --------------
alter table public.product_events enable row level security;
alter table public.product_events force row level security;

drop policy if exists product_events_insert_own on public.product_events;
create policy product_events_insert_own on public.product_events
  for insert with check (user_id = auth.uid());
