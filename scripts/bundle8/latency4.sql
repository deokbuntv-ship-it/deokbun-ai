-- 읽기 전용. 느린 상담은 **토큰이 많아서** 느린가, 아니면 그냥 모델이 늦게 주는가?
-- 느린 것이 토큰 때문이면 답을 짧게 해서 고칠 수 있고, 아니면 제공자 변동이라 우리가 못 고친다.
with c as (
  select latency_ms, output_tokens, reasoning_tokens, input_tokens,
         ntile(10) over (order by latency_ms) as decile
  from public.ai_usage_logs
  where request_type = 'chat' and status = 'success' and latency_ms is not null and output_tokens is not null
)
select
  decile,
  count(*)                                        as n,
  round((min(latency_ms))::numeric / 1000.0, 1)   as min_sec,
  round((max(latency_ms))::numeric / 1000.0, 1)   as max_sec,
  round((avg(output_tokens))::numeric)            as avg_out,
  round((avg(reasoning_tokens))::numeric)         as avg_reasoning,
  round((avg(input_tokens))::numeric)             as avg_in,
  -- 1초에 몇 토큰을 뽑았나. 토큰이 많아 느린 것이면 이 값이 구간마다 비슷하고,
  -- 제공자가 늦게 준 것이면 느린 구간에서 뚝 떨어진다.
  round((avg(output_tokens) / nullif(avg(latency_ms) / 1000.0, 0))::numeric, 1) as tokens_per_sec
from c
group by decile
order by decile;
