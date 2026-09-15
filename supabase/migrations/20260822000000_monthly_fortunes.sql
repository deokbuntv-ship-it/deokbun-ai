-- 이번 달 운세 — the canonical MONTHLY fortune record (Monthly Fortune V1, §39–§43). ONE row per user per
-- (fortune_year, fortune_month) — a Korea CIVIL month. Additive + idempotent. Owner-only RLS (auth.uid()),
-- mirroring daily_fortunes / consultation_reports. OWNER_APPLY: NOT pushed by the sprint.
--
-- result_json holds ONLY the composed user-facing monthly digest (headline/verdict/overall/opportunities/
-- cautions/actions/followUps + server-owned tier/mode/domainSignals) — never raw birth data, evidence, or a
-- prompt. The SERVER (edge) owns the target month; the unique index is the primary duplicate-cost guard (a
-- second generation for the same month cannot create a 2nd row). Forward-compatible: result_json is jsonb, so
-- a future Monthly V1.1 may add optional fields without a schema change (§43).

create table if not exists public.monthly_fortunes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.consultation_subjects(id) on delete set null,
  fortune_year int not null,
  fortune_month int not null check (fortune_month between 1 and 12),
  timezone text not null default 'Asia/Seoul',
  overall_tier text not null,
  result_json jsonb not null,
  evidence_version text,
  plan_version text,
  policy_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ONE canonical fortune per user per month (§40 — the duplicate-cost guard).
create unique index if not exists monthly_fortunes_owner_month_uniq
  on public.monthly_fortunes (user_id, fortune_year, fortune_month);
-- Newest-first listing for the Home preview + 운세우편함 archive.
create index if not exists monthly_fortunes_owner_recent
  on public.monthly_fortunes (user_id, fortune_year desc, fortune_month desc);

-- updated_at trigger (reuses the shared set_updated_at() used by daily_fortunes / consultation_reports).
drop trigger if exists set_monthly_fortunes_updated_at on public.monthly_fortunes;
create trigger set_monthly_fortunes_updated_at
  before update on public.monthly_fortunes
  for each row execute function public.set_updated_at();

-- RLS: owner-only for every operation. Anonymous has no access; User A can never read User B (§41/§99).
alter table public.monthly_fortunes enable row level security;
drop policy if exists monthly_fortunes_all_own on public.monthly_fortunes;
create policy monthly_fortunes_all_own on public.monthly_fortunes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.monthly_fortunes is 'Canonical per-user per-month 이번 달 운세 record. One LLM generation per (user, fortune_year, fortune_month); reads are cache hits (0 LLM).';
