-- 가입 무상 덕 확인 — 읽기 전용 1건 (다음 묶음 6-3 · 6-5 의 전제).
-- 지급 트리거(grant_welcome_on_consent)는 economy_policy 의 활성 행 welcome_reward 값을 그대로 쓴다.
-- 활성 행이 없거나 값이 0 이하면 **아무에게도 지급하지 않는다**(조용히 0덕). 그래서 설정과 실제 지급을 같이 본다.
select
  (select count(*) from public.economy_policy where is_active)                as active_policy_rows,
  (select welcome_reward from public.economy_policy where is_active limit 1)  as welcome_reward_setting,
  (select count(*) from public.duk_ledger where reason = 'WELCOME')           as welcome_grants,
  (select min(delta) from public.duk_ledger where reason = 'WELCOME')         as min_granted,
  (select max(delta) from public.duk_ledger where reason = 'WELCOME')         as max_granted,
  (select count(*) from public.profiles where terms_version is not null)      as consented_profiles;
