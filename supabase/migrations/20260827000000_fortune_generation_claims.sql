-- FORTUNE GENERATION CLAIMS (cost hardening §A5). Additive, idempotent. OWNER_APPLY — NOT pushed.
--
-- WHY: canonical unique(user_id, fortune_date/month) dedups ROWS but not paid LLM CALLS. Two concurrent
-- first-loads both cache-miss, both call the LLM, then the second insert conflicts — the DB ends with one
-- row but two generations were already billed. This tiny table lets exactly ONE concurrent request win a
-- generation claim (atomic via the composite PK); the losers wait for the winner's persisted result instead
-- of calling the LLM. The client claim path is FAIL-OPEN (a claim outage degrades to generating), so this can
-- only prevent duplicate spend, never block a legitimate first generation.
--
-- claim_key = the client's date guess ('YYYY-MM-DD' for today, 'YYYY-MM' for monthly) — both concurrent
-- client requests derive the SAME guess, so they collide on the PK and one wins. A stale claim (winner
-- slow/crashed) is reclaimed by the loser after a bounded wait (client deletes it, then generates). Owner-only
-- RLS; no PII (no birth/question/result — just a per-user date key).

create table if not exists public.fortune_generation_claims (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('today','monthly')),
  claim_key  text not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, kind, claim_key)
);

alter table public.fortune_generation_claims enable row level security;
drop policy if exists fortune_generation_claims_all_own on public.fortune_generation_claims;
create policy fortune_generation_claims_all_own on public.fortune_generation_claims
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

comment on table public.fortune_generation_claims is 'Per-user atomic claim so only ONE concurrent first-load generates a today/monthly fortune (prevents duplicate LLM spend). Owner-only RLS; claim_key is a date guess, no PII. Stale claims are reclaimed client-side after a bounded wait.';
