-- =============================================================================
-- DeokbunAI — AI Usage list: add request_type filter (R3-2 / §15)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER ADMIN_04_SETUP.sql.
--
-- Adds an optional p_request_type filter to admin_list_ai_usage. Backward
-- compatible: the parameter has a DEFAULT, so existing 2-arg calls (p_limit,
-- p_offset) still resolve to this function and return all types.
--
-- Re-runnable. is_admin()-gated, SECURITY DEFINER, pinned search_path.
-- =============================================================================

begin;

-- Replace the 2-arg signature with a 3-arg (defaulted) one.
drop function if exists public.admin_list_ai_usage(int, int);

create or replace function public.admin_list_ai_usage(
  p_limit        int  default 50,
  p_offset       int  default 0,
  p_request_type text default null
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
  where p_request_type is null or l.request_type = p_request_type
  order by l.created_at desc, l.id desc
  limit greatest(1, least(coalesce(p_limit, 50), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_ai_usage(int, int, text) from public;
grant execute on function public.admin_list_ai_usage(int, int, text) to authenticated;

commit;

-- =============================================================================
-- After applying: /admin/ai-usage 유형 필터(전체/상담/콘텐츠/Famous)가 동작합니다.
-- 미적용 시 전체 목록은 그대로 동작하고, 특정 유형 필터만 일시적으로 오류가 납니다.
-- =============================================================================
