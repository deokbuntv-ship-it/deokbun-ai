-- 만료된 덕 예약이 잔액을 계속 붙잡던 것을 푼다 (F-05 · CTO 필수) — 2026-09-21
--
-- 무엇이 틀렸나
--   `duk_spendable` 은 `status = 'RESERVED'` 인 예약을 **만료 여부와 상관없이** 잔액에서 뺐다.
--   확정(commit)은 만료된 예약을 거절하므로(20260833:173) 그 예약은 **영원히 확정도 해제도 되지 않고**
--   잔액만 잡고 있었다. 코드 주석은 "TTL 로 정리된다" 고 적었지만 정리하는 장치가 **없었다**
--   (`chat/index.ts:727`). staging 실측 2026-09-18: 만료된 채 잠긴 예약 1건 · 5덕.
--   사용자는 답도 못 받고 덕도 못 쓰는 상태가 된다.
--
-- 고치는 방법 (둘 다 한다 — CTO)
--   ① 뷰에서 **아직 살아 있는 예약만** 뺀다. 만료된 예약은 잔액을 잡지 못한다.
--      (이중 지출 위험 없음: 만료된 예약은 확정 자체가 거절된다.)
--   ② 만료된 예약을 `EXPIRED` 로 정리하는 함수를 둔다. Edge 가 예약 직전에 그 사용자 것만 훑는다 —
--      크론 없이도 스스로 정리된다.
--   ③ 서버 예외 때 예약을 되돌리는 것은 Edge 쪽에서 함께 고쳤다(`heldDukReservation`).

create or replace view public.duk_spendable as
  with led as (
    select user_id, bucket, sum(delta)::integer as balance
    from public.duk_ledger
    where expires_at is null or expires_at > now()
    group by user_id, bucket
  ), held as (
    select user_id,
           coalesce(sum(alloc_plus), 0) as h_plus,
           coalesce(sum(alloc_reward), 0) as h_reward,
           coalesce(sum(alloc_paid), 0) as h_paid
    from public.duk_reserve
    where status = 'RESERVED'
      and expires_at > now()   -- ⚠ 2026-09-21: 만료된 예약은 잔액을 잡지 않는다
    group by user_id
  )
  select l.user_id, l.bucket,
         l.balance - case l.bucket
           when 'PLUS' then coalesce(h.h_plus, 0)
           when 'REWARD' then coalesce(h.h_reward, 0)
           when 'PAID' then coalesce(h.h_paid, 0)
           else 0 end as spendable
  from led l
  left join held h on h.user_id = l.user_id;

-- ⚠ 뷰를 다시 만들면 권한 · 옵션이 초기화될 수 있다. 2026-09-20 에 막아 둔 것을 **다시 건다**
--   (로그인 없이 전원 잔액이 읽히던 문제 — `20260923000000_duk_view_security_invoker.sql`).
alter view public.duk_spendable set (security_invoker = true);
revoke select on table public.duk_spendable from anon;

create or replace function public.release_expired_reservations(p_user_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_count integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  update public.duk_reserve
     set status = 'EXPIRED', updated_at = now()
   where status = 'RESERVED'
     and expires_at <= now()
     and (p_user_id is null or user_id = p_user_id);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.release_expired_reservations(uuid) from public, anon, authenticated;
grant execute on function public.release_expired_reservations(uuid) to service_role;

comment on function public.release_expired_reservations(uuid) is
  '만료된 덕 예약을 EXPIRED 로 정리한다. Edge 가 예약 직전에 그 사용자 것만 부른다 (2026-09-21).';

-- 지금 남아 있는 만료 예약도 한 번 정리한다 (staging 에 1건 있었다).
update public.duk_reserve
   set status = 'EXPIRED', updated_at = now()
 where status = 'RESERVED' and expires_at <= now();
