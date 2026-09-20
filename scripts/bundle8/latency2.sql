-- 읽기 전용. 표가 비었는지, 값이 어떻게 들어 있는지부터 본다.
select
  count(*)                                    as rows_total,
  count(latency_ms)                           as with_latency,
  count(*) filter (where status = 'ok')       as status_ok,
  min(created_at)::date                       as first_day,
  max(created_at)::date                       as last_day
from public.ai_usage_logs;
