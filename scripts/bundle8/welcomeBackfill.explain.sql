-- 소급 지급문 **문법·객체 검증 전용** — EXPLAIN 이라 실행하지 않는다(쓰기 0).
-- 실제 지급문은 트리거(grant_welcome_on_consent)와 똑같은 방식: 원장에 REWARD · WELCOME 한 줄.
-- 멱등: duk_ledger_welcome_uniq(사용자당 WELCOME 1행) 때문에 두 번 돌려도 한 번만 들어간다.
explain
insert into public.duk_ledger (user_id, bucket, delta, reason)
select p.id, 'REWARD', (select welcome_reward from public.economy_policy where is_active limit 1), 'WELCOME'
from public.profiles p
where p.terms_version is not null
  and (select welcome_reward from public.economy_policy where is_active limit 1) > 0
on conflict do nothing;
