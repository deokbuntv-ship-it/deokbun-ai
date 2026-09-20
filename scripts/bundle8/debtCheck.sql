-- F-01 확인 — 환불 빚(duk_debt) 이 지금 있는가 · 이미 잘못 "해결" 처리된 빚이 있는가. 읽기만 한다.
-- staging 에서 문법 검증 뒤 오너가 production SQL Editor 에서 그대로 붙여 넣는다.
--
-- wrongly_forgiven: 같은 순간(±5초) 해결 처리된 빚 합계가 그때 실제로 상계한 덕(DEBT_OFFSET)보다 큰 경우의 차액 합.
--   0 이면 과거에 이 버그로 탕감된 빚은 없다.
select
  (select count(*) from public.duk_debt where not resolved) as open_rows,
  (select coalesce(sum(amount), 0) from public.duk_debt where not resolved) as open_amount,
  (select count(*) from public.duk_debt where resolved) as resolved_rows,
  (select count(distinct user_id) from public.duk_debt) as debt_users,
  (select count(*) from public.duk_ledger where reason = 'DEBT_OFFSET') as offset_rows,
  (select count(*) from public.purchase_revocations) as revocations,
  (select count(*) from public.verified_purchases) as purchases,
  (select coalesce(sum(greatest(r.resolved_debt - r.offset_paid, 0)), 0) from (
     select d.user_id, d.resolved_at, sum(d.amount) as resolved_debt,
       coalesce((select -sum(l.delta) from public.duk_ledger l
                 where l.user_id = d.user_id and l.reason = 'DEBT_OFFSET'
                   and abs(extract(epoch from (l.created_at - d.resolved_at))) < 5), 0) as offset_paid
     from public.duk_debt d where d.resolved
     group by d.user_id, d.resolved_at
   ) r) as wrongly_forgiven;
