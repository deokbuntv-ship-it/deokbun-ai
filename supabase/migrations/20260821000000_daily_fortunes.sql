-- 오늘의 운세 — the canonical DAILY fortune record (Today Fortune V1, §22–§24). ONE row per user per
-- fortune_date (Korea civil date). Additive + idempotent. Owner-only RLS (auth.uid()), mirroring
-- consultation_reports. OWNER_APPLY: NOT pushed by the sprint.
--
-- result_json holds ONLY the composed user-facing daily digest (headline/overall/highlights/cautions/action/
-- prompts) — never raw birth data, evidence, or a prompt. The SERVER (edge) owns fortune_date; the unique
-- index is the primary duplicate-cost guard (a second generation for the same day cannot create a 2nd row).

create table if not exists public.daily_fortunes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.consultation_subjects(id) on delete set null,
  fortune_date date not null,
  timezone text not null default 'Asia/Seoul',
  overall_tone text not null,
  result_json jsonb not null,
  evidence_version text,
  policy_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ONE canonical fortune per user per day (§23 — the duplicate-cost guard).
create unique index if not exists daily_fortunes_owner_date_uniq
  on public.daily_fortunes (user_id, fortune_date);
-- Newest-first listing for the Home preview + 운세우편함 archive.
create index if not exists daily_fortunes_owner_recent
  on public.daily_fortunes (user_id, fortune_date desc);

-- updated_at trigger (reuses the shared set_updated_at() used by consultation_reports / consultation_subjects).
drop trigger if exists set_daily_fortunes_updated_at on public.daily_fortunes;
create trigger set_daily_fortunes_updated_at
  before update on public.daily_fortunes
  for each row execute function public.set_updated_at();

-- RLS: owner-only for every operation. Anonymous has no access; User A can never read User B (§24/§69).
alter table public.daily_fortunes enable row level security;
drop policy if exists daily_fortunes_all_own on public.daily_fortunes;
create policy daily_fortunes_all_own on public.daily_fortunes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.daily_fortunes is 'Canonical per-user per-day 오늘의 운세 record. One LLM generation per (user, fortune_date); reads are cache hits (0 LLM).';
