-- 프리미엄 리포트는 **한 번 구매**다 — 24시간 안에 다시 만들면 무료였던 것을 막는다 (2026-09-21)
--
-- 무엇이 틀렸나 (staging 실측 2026-09-02 · 2026-09-18 재확인)
--   첫 구매 3건은 100 → 50 으로 차감됐는데, 그 뒤 24시간 안의 성공 17건은 **전부 50 → 50** 이었다.
--   까닭이 두 겹이다:
--     ① `reserve_session_duk` 는 같은 상품의 살아 있는 세션을 찾으면 `ACTIVE_SESSION · price 0` 으로 통과시킨다.
--        상담·궁합은 그것이 맞다(한 세션에 5턴). 그러나 프리미엄은 턴이 없는 **단발 구매**다.
--     ② Edge 의 프리미엄 완료 경로가 세션을 넘기지 않아 `successful_turn_count` 가 늘지 않는다 →
--        5턴 한도조차 걸리지 않아 24시간 동안 몇 번이든 무료로 다시 만들 수 있었다(모델 원가는 그대로 나간다).
--   문서도 "Premium 은 단발 구매" 라고 적고 있다(`docs/KNOWN_RISKS.md:623`). 의도가 아니라 결함이다.
--
-- 고치는 방법 — **재사용 분기에서 `premium_report` 만 뺀다.** 나머지는 20260846 판과 한 글자도 다르지 않다.
--   같은 요청 번호로 다시 부르는 **멱등 재시도**는 위쪽 분기가 그대로 처리한다(두 번 청구하지 않는다).
--   그래서 화면이 다시 눌러 생기는 재시도는 그대로 무료이고, **새 리포트를 만들 때마다 50덕**이 청구된다.
--
-- ⚠ 잠긴 테스트(`economyContractV1.test.ts`)는 20260846 **파일 본문**을 읽는다. 그 파일은 건드리지 않았다.

create or replace function public.reserve_session_duk(
  p_user_id uuid, p_product_type text, p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_cfg record;
  v_price integer;
  v_ttl integer;
  v_limit integer;
  v_existing_session record;
  v_existing_res record;
  v_plus integer; v_reward integer; v_paid integer;
  v_need integer; v_take integer;
  v_ap integer := 0; v_ar integer := 0; v_apd integer := 0;
  v_session_id uuid; v_reservation_id uuid; v_charge_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_product_type not in ('general','compatibility','premium_report') then raise exception 'bad product' using errcode = '22023'; end if;

  select * into v_cfg from public.economy_policy where is_active limit 1;
  if not found then raise exception 'no active economy policy' using errcode = '55000'; end if;
  v_price := case p_product_type
    when 'general' then v_cfg.general_session_cost
    when 'compatibility' then v_cfg.compatibility_session_cost
    else v_cfg.premium_report_cost end;
  v_ttl := v_cfg.session_ttl_seconds; v_limit := v_cfg.session_turn_limit;

  -- Serialize per-user so two concurrent first-turn starts cannot both create a session + reserve.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- §22 idempotency, TIGHTENED (BUG-2 fix): a same-request_id replay means "don't re-charge" only when the
  -- reservation is still live or actually committed. A RELEASED reservation whose session was marked
  -- ABANDONED means the original attempt delivered nothing — exclude it and fall through to reserving
  -- fresh (a genuine new charge) rather than returning a free ACTIVE_SESSION.
  select r.* into v_existing_res from public.duk_reserve r
    join public.consultation_sessions s on s.session_id = r.session_id
    where r.user_id = p_user_id and r.request_id = p_request_id and s.status <> 'ABANDONED'
    order by (r.status = 'RESERVED') desc limit 1;
  if found then
    if v_existing_res.status = 'RESERVED' then
      return jsonb_build_object('kind','RESERVED','reservation_id',v_existing_res.reservation_id,
        'session_id',v_existing_res.session_id,'charge_id',v_existing_res.charge_id,'version',v_existing_res.version,'price',v_existing_res.amount);
    end if;
    return jsonb_build_object('kind','ACTIVE_SESSION','session_id',v_existing_res.session_id,'price',0);
  end if;

  -- §9/§18 resume a valid ACTIVE/OPEN session for THIS product (no new charge) — cross-product isolation via
  -- product_type. Unchanged: already excludes ABANDONED (not in this IN-list).
  select * into v_existing_session from public.consultation_sessions
    where user_id = p_user_id and product_type = p_product_type
      and p_product_type <> 'premium_report'   -- 2026-09-21: 프리미엄은 한 번 구매다 (아래 머리말)
      and status in ('OPEN','ACTIVE') and expires_at > now() and successful_turn_count < turn_limit
    order by created_at desc limit 1;
  if found then
    return jsonb_build_object('kind','ACTIVE_SESSION','session_id',v_existing_session.session_id,'price',0);
  end if;

  -- Spendable per bucket (raw balance minus active reserves).
  select coalesce(max(case when bucket='PLUS' then spendable end),0),
         coalesce(max(case when bucket='REWARD' then spendable end),0),
         coalesce(max(case when bucket='PAID' then spendable end),0)
    into v_plus, v_reward, v_paid
  from public.duk_spendable where user_id = p_user_id;

  if v_plus + v_reward + v_paid < v_price then
    return jsonb_build_object('kind','INSUFFICIENT','balance',v_plus+v_reward+v_paid,'required',v_price,'shortfall',v_price-(v_plus+v_reward+v_paid));
  end if;

  -- Fixed allocation PLUS→REWARD→PAID (captured at reserve time, §11).
  v_need := v_price;
  v_take := least(v_need, greatest(v_plus,0));   v_ap := v_take;  v_need := v_need - v_take;
  v_take := least(v_need, greatest(v_reward,0));  v_ar := v_take;  v_need := v_need - v_take;
  v_take := least(v_need, greatest(v_paid,0));    v_apd := v_take; v_need := v_need - v_take;
  if v_need <> 0 then raise exception 'allocation_mismatch' using errcode = 'P0001'; end if;

  v_session_id := gen_random_uuid();
  v_reservation_id := gen_random_uuid();
  v_charge_id := gen_random_uuid();
  insert into public.consultation_sessions (session_id, user_id, product_type, charge_id, status,
      turn_limit, price_duk, economy_policy_version, expires_at)
    values (v_session_id, p_user_id, p_product_type, v_charge_id, 'OPEN', v_limit, v_price,
      v_cfg.policy_version, now() + (v_ttl || ' seconds')::interval);
  insert into public.duk_reserve (session_id, user_id, amount, status, version, charge_id, expires_at,
      reservation_id, request_id, product_type, alloc_plus, alloc_reward, alloc_paid)
    values (v_session_id, p_user_id, v_price, 'RESERVED', 0, v_charge_id,
      now() + (v_cfg.reserve_ttl_seconds || ' seconds')::interval, v_reservation_id, p_request_id, p_product_type, v_ap, v_ar, v_apd);

  return jsonb_build_object('kind','RESERVED','reservation_id',v_reservation_id,'session_id',v_session_id,
    'charge_id',v_charge_id,'version',0,'price',v_price);
end;
$$;
