-- 조사 전용 읽기 (staging). 쓰지 않는다.
-- latency_ms = Edge 핸들러 진입부터 기록 시점까지 (index.ts:816 startedAt → Date.now()).
--   즉 인증·과금 RPC·엔진·모델 호출·검증·저장이 **전부 포함**되고, 콜드 스타트와 클라이언트↔Edge 왕복은 빠진다.
select
  request_type,
  count(*)                                             as n,
  round((avg(latency_ms))::numeric / 1000.0, 1)                   as avg_sec,
  round(((percentile_cont(0.5)  within group (order by latency_ms))::numeric) / 1000.0, 1) as p50_sec,
  round(((percentile_cont(0.9)  within group (order by latency_ms))::numeric) / 1000.0, 1) as p90_sec,
  round((max(latency_ms))::numeric / 1000.0, 1)                   as max_sec,
  round((avg(input_tokens))::numeric)                             as avg_in,
  round((avg(output_tokens))::numeric)                            as avg_out,
  round((avg(reasoning_tokens))::numeric)                         as avg_reasoning,
  min(created_at)::date                                as first_day,
  max(created_at)::date                                as last_day
from public.ai_usage_logs
where status = 'ok' and latency_ms is not null
group by request_type
order by n desc;
