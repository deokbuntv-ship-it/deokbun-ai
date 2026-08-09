-- =============================================================================
-- DeokbunAI — AI Usage Logging & Operations Dashboard (ADMIN-04)
-- =============================================================================
-- PROPOSAL ONLY. Apply manually in the Supabase SQL Editor AFTER ADMIN-01
-- (admin_users + is_admin) is applied.
--
-- Adds: (1) ai_usage_logs table written by the chat Edge Function via
-- service_role (server-side); (2) SECURITY DEFINER RPCs for the ops dashboard
-- and the AI usage list, gated by public.is_admin().
--
-- RAW USAGE ONLY — no price/cost table is hardcoded anywhere. RLS is enabled with
-- NO client policies (client cannot read/insert); the Edge Function uses the
-- service_role key (bypasses RLS); admins read only via the RPCs.
--
-- REQUIRES a matching Edge Function redeploy (supabase/functions/chat) so usage
-- rows are actually written. Deploy is a separate USER ACTION.
-- =============================================================================

begin;

-- 1) ai_usage_logs -------------------------------------------------------------
create table if not exists public.ai_usage_logs (
  id              bigint generated always as identity primary key,
  user_id         uuid references auth.users (id) on delete set null,
  conversation_id uuid,
  model           text,
  request_type    text not null default 'chat',
  input_tokens    int,
  output_tokens   int,
  total_tokens    int,
  latency_ms      int,
  status          text not null, -- 'success' | 'error'
  error_code      text,
  created_at      timestamptz not null default now()
);

create index if not exists ai_usage_logs_created_at_idx
  on public.ai_usage_logs (created_at desc);

-- RLS enabled, NO policies → no anon/authenticated client access. Only the Edge
-- Function (service_role, bypasses RLS) inserts; admins read via the RPCs below.
alter table public.ai_usage_logs enable row level security;

-- 2) admin_dashboard_overview: service + AI aggregate counts. ------------------
create or replace function public.admin_dashboard_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'user_count', (select count(*) from auth.users),
    'subject_count', (select count(*) from public.consultation_subjects),
    'conversation_count', (select count(*) from public.conversations),
    'conversation_today',
      (select count(*) from public.conversations
        where created_at >= date_trunc('day', now())),
    'ai_request_count', (select count(*) from public.ai_usage_logs),
    'ai_success_count',
      (select count(*) from public.ai_usage_logs where status = 'success'),
    'ai_error_count',
      (select count(*) from public.ai_usage_logs where status = 'error'),
    'ai_input_tokens',
      (select coalesce(sum(input_tokens), 0) from public.ai_usage_logs),
    'ai_output_tokens',
      (select coalesce(sum(output_tokens), 0) from public.ai_usage_logs),
    'ai_today_request_count',
      (select count(*) from public.ai_usage_logs
        where created_at >= date_trunc('day', now()))
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_overview() from public;
grant execute on function public.admin_dashboard_overview() to authenticated;

-- 3) admin_list_ai_usage: recent AI usage rows (no message content). -----------
create or replace function public.admin_list_ai_usage(
  p_limit  int default 50,
  p_offset int default 0
)
returns table (
  id            bigint,
  created_at    timestamptz,
  user_id       uuid,
  model         text,
  request_type  text,
  status        text,
  error_code    text,
  input_tokens  int,
  output_tokens int,
  total_tokens  int,
  latency_ms    int
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    l.id, l.created_at, l.user_id, l.model, l.request_type, l.status,
    l.error_code, l.input_tokens, l.output_tokens, l.total_tokens, l.latency_ms
  from public.ai_usage_logs l
  order by l.created_at desc, l.id desc
  limit greatest(1, least(coalesce(p_limit, 50), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_ai_usage(int, int) from public;
grant execute on function public.admin_list_ai_usage(int, int) to authenticated;

commit;

-- =============================================================================
-- After applying: (a) redeploy supabase/functions/chat so usage rows are written;
-- (b) reload /admin (dashboard) and /admin/ai-usage as an admin.
--   - Before any chat traffic, AI counts are a real 0 (not fake).
--   - Non-admins calling these RPCs get "not authorized" (fail-closed).
-- =============================================================================
