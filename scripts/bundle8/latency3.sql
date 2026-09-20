-- 읽기 전용. staging Edge 의 실제 소요시간 분포.
-- latency_ms = Edge 핸들러 진입 → 기록 시점 (index.ts:816). 콜드 스타트와 클라이언트↔Edge 왕복은 빠진다.
select
  request_type,
  status,
  count(*)                                                                                   as n,
  round(((percentile_cont(0.5) within group (order by latency_ms))::numeric) / 1000.0, 1)    as p50_sec,
  round(((percentile_cont(0.9) within group (order by latency_ms))::numeric) / 1000.0, 1)    as p90_sec,
  round(((percentile_cont(0.99) within group (order by latency_ms))::numeric) / 1000.0, 1)   as p99_sec,
  round((max(latency_ms))::numeric / 1000.0, 1)                                              as max_sec,
  round((avg(output_tokens))::numeric)                                                       as avg_out,
  round((avg(reasoning_tokens))::numeric)                                                    as avg_reasoning
from public.ai_usage_logs
where latency_ms is not null
group by request_type, status
order by n desc
limit 12;
