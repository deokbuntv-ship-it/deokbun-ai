-- 짧은 답 지켜보기 (지시서 PART 1-4 · CTO 기준 2026-09-17) — 읽기만 한다. staging · production 어디서나 같은 문장.
--
-- ⚠ CTO 기준: **재생성 비율(regen_pct)이 10% 를 넘으면 검사 기준이 너무 빡빡한 것** → 조정한다.
--   재생성된 답은 기다림이 길다(staging 첫 실측: 재생성 1건 43.7초 · 평소 21~26초).
--   무엇을 풀지는 failure_counts 가 말한다 — 영어 키는 4중 검사(rewriteGuard), 한글 키는 답 검사(consultationAnswerGuard).
--
-- 한 줄로 나온다. 기록에 답 글은 없다(결과 · 까닭 · 시도 횟수 · 검사별 횟수 · 글자 수만).
with s as (
  select
    (gate_firings->'shortAnswer'->>'attempts')::int as attempts,
    gate_firings->'shortAnswer'->>'delivered' as delivered,
    coalesce(gate_firings->'shortAnswer'->>'reason', '-') as reason,
    latency_ms,
    coalesce(gate_firings->'shortAnswer'->'rewriteFailures', '{}'::jsonb)
      || coalesce(gate_firings->'shortAnswer'->'answerFailures', '{}'::jsonb) as failures
  from public.ai_usage_logs
  where request_type = 'chat'
    and status = 'success'
    and created_at > now() - interval '7 days'
    and gate_firings ? 'shortAnswer'
)
select
  count(*) as short_answers,
  count(*) filter (where attempts >= 1) as model_called,
  count(*) filter (where attempts = 2) as regenerated,
  round(100.0 * count(*) filter (where attempts = 2) / nullif(count(*) filter (where attempts >= 1), 0), 1) as regen_pct,
  count(*) filter (where delivered = 'REWRITE') as delivered_rewrite,
  count(*) filter (where delivered = 'SOURCE' and reason = 'CHECK_FAILED') as source_after_regen,
  count(*) filter (where reason = 'SOURCE_CHECK_FAILED') as source_precheck,
  count(*) filter (where reason = 'NO_REWRITER') as switch_off,
  count(*) filter (where reason = 'LLM_UNAVAILABLE') as rewrite_unavailable,
  round((percentile_cont(0.5) within group (order by latency_ms) filter (where attempts = 1) / 1000.0)::numeric, 1) as p50_sec_first_try,
  round((percentile_cont(0.5) within group (order by latency_ms) filter (where attempts = 2) / 1000.0)::numeric, 1) as p50_sec_regenerated,
  round((percentile_cont(0.9) within group (order by latency_ms) filter (where attempts = 2) / 1000.0)::numeric, 1) as p90_sec_regenerated,
  (select jsonb_object_agg(k, n) from (
     select key as k, sum(value::int) as n from s, jsonb_each_text(s.failures) group by key
   ) f) as failure_counts
from s;
