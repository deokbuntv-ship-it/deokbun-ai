-- POPULAR CONSULTATION QUESTIONS (Home IA / consultation-conversion sprint). Additive, idempotent. OWNER_APPLY
-- — NOT pushed by the sprint. One small config table that turns the hard-coded Home "지금 많이 물어보는 질문"
-- list into an owner-managed, analytics-backed conversion surface.
--
-- DEPENDENCY: the admin-write policy and the metrics RPC reference public.is_admin() (owner-applied via
-- docs/admin/ADMIN_SETUP.sql — the same authority the client admin gate uses). Apply that first. Reuses the
-- shared public.set_updated_at() trigger.
--
-- DESIGN: display_order is AUTHORITATIVE (owner-set) — there is NO auto-ranking / personalization. analytics_key
-- is a STABLE slug and the funnel correlation key, so editing a question's wording never forks its metrics.
-- Deactivate over delete (is_active=false) to preserve analytics history.

create table if not exists public.popular_consultation_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  analytics_key text not null unique,
  category text not null default 'GENERAL'
    check (category in ('MONEY','CAREER','BUSINESS','RELATIONSHIP','LOVE','CHANGE','WELLBEING','GENERAL')),
  is_active boolean not null default true,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists popular_questions_active_order
  on public.popular_consultation_questions (is_active, display_order);

drop trigger if exists set_popular_questions_updated_at on public.popular_consultation_questions;
create trigger set_popular_questions_updated_at
  before update on public.popular_consultation_questions
  for each row execute function public.set_updated_at();

-- ---- RLS: everyone reads ACTIVE rows; only an admin writes ---------------------------------------------
alter table public.popular_consultation_questions enable row level security;

-- Consumer read: any caller (anon + authenticated) may read active questions only. Inactive rows are visible
-- ONLY through the admin policy below.
drop policy if exists popular_questions_read_active on public.popular_consultation_questions;
create policy popular_questions_read_active on public.popular_consultation_questions
  for select using (is_active = true);

-- Admin full access (select all incl. inactive, insert, update, delete). Permissive policies OR together, so a
-- non-admin still sees active rows via the read policy while an admin additionally sees/edits everything.
drop policy if exists popular_questions_admin_all on public.popular_consultation_questions;
create policy popular_questions_admin_all on public.popular_consultation_questions
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.popular_consultation_questions to anon, authenticated;
grant insert, update, delete on public.popular_consultation_questions to authenticated;

-- ---- SEED (idempotent) — mirrors src/features/popular-questions/defaults.ts (same key/text/category/order) --
insert into public.popular_consultation_questions (question_text, analytics_key, category, display_order) values
  ('올해 재물운의 흐름은 어떻게 흐를까요?', 'money_flow_year', 'MONEY', 10),
  ('지금 이직이나 커리어 변화를 준비해도 될까요?', 'career_move_timing', 'CAREER', 20),
  ('올해 나에게 찾아올 가장 큰 변화는 무엇일까요?', 'biggest_change_year', 'CHANGE', 30),
  ('새로운 인연을 만날 수 있을까요?', 'new_relationship', 'LOVE', 40),
  ('요즘 건강과 컨디션은 어떻게 관리하면 좋을까요?', 'wellbeing_care', 'WELLBEING', 50)
on conflict (analytics_key) do nothing;

-- ---- METRICS: server-side funnel aggregate (SECURITY DEFINER, admin-guarded) --------------------------
-- product_events is write-only to users (its RLS blocks reads); this SECURITY DEFINER function reads it to
-- aggregate the popular-question funnel by analytics_key, but ONLY for an admin caller. Returns raw counts —
-- the client computes the ratios (zero-denominator → "—"), never NaN. `window_days` null → all-time.
create or replace function public.admin_popular_question_metrics(window_days integer default null)
returns table (
  analytics_key text,
  impressions bigint,
  clicks bigint,
  starts bigint,
  successes bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
  select
    (pe.properties->>'question_key')::text as analytics_key,
    count(*) filter (where pe.event_name = 'popular_question_impression') as impressions,
    count(*) filter (where pe.event_name = 'popular_question_click') as clicks,
    count(*) filter (where pe.event_name = 'popular_question_consultation_start') as starts,
    count(*) filter (where pe.event_name = 'popular_question_first_answer_success') as successes
  from public.product_events pe
  where pe.event_name in (
      'popular_question_impression',
      'popular_question_click',
      'popular_question_consultation_start',
      'popular_question_first_answer_success'
    )
    and pe.properties ? 'question_key'
    and (window_days is null or pe.created_at >= now() - make_interval(days => window_days))
  group by pe.properties->>'question_key';
end;
$$;

revoke all on function public.admin_popular_question_metrics(integer) from public, anon;
grant execute on function public.admin_popular_question_metrics(integer) to authenticated;

comment on table public.popular_consultation_questions is 'Owner-managed popular consultation questions for Home. display_order authoritative (no auto-ranking); analytics_key is the stable funnel key; deactivate over delete.';
comment on function public.admin_popular_question_metrics(integer) is 'Admin-only (is_admin) server-side funnel aggregate for popular questions, grouped by analytics_key. Raw counts; client computes rates.';
