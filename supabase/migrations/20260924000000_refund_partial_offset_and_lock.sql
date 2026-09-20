-- 환불 처리의 구멍 **둘**을 같은 함수 파일에서 막는다 (F-01 · GAP-01) — 2026-09-21
--
-- ── F-01 — 일부만 갚아도 빚이 통째로 사라졌다 ────────────────────────────────────────────────────
--   `record_verified_purchase` 는 상계액을 `least(빚, 구매덕)` 으로 **맞게** 정해 놓고, 빚 행은
--   `where user_id = … and not resolved` 로 **전부** `resolved = true` 로 바꿨다(20260834:96-98).
--   빚 30 · 구매 20 이면 원장에서 20 만 빠지는데 빚 30 이 사라진다 → 10덕이 공중에 뜬다.
--
-- ── GAP-01 — 동시 환불로 PAID 가 음수가 됐다 ────────────────────────────────────────────────────
--   `record_revocation` 은 PAID 잔액을 **잠금 없이** 읽고 되돌릴 액수를 정했다(20260834:120-127).
--   환불 두 건이 동시에 오면 둘 다 같은 잔액을 보고 각각 되돌려 합계가 잔액을 넘는다.
--   멱등 열쇠는 환불 번호라서 **서로 다른 환불 두 건**은 막지 못한다. 주석의 "Never negative PAID" 는
--   의도였을 뿐 코드가 지키지 못했다.
--
-- ── 고치는 방법 ────────────────────────────────────────────────────────────────────────────────
--   ① `duk_debt.amount` 의 뜻을 **"남은 빚"** 으로 바꾸고, 원래 금액은 새 칸 `original_amount` 에 둔다.
--      이렇게 하면 "안 갚은 빚 합계" 를 읽는 곳들(관리자 경제 화면 · 계정 삭제 스냅샷 · 앱 지갑)이
--      **한 줄도 바뀌지 않고** 계속 맞는 값을 본다 — 이미 `sum(amount) where not resolved` 로 묻고 있다.
--   ② 상계는 **오래된 빚부터** 채우고, 다 갚은 행만 `resolved = true`, 부분만 갚은 행은 잔액을 남긴다.
--   ③ 두 함수 맨 앞에서 **사용자별 잠금**(`pg_advisory_xact_lock`)을 잡는다. 한 사용자의 덕 변경은
--      한 번에 하나만 돈다 → 동시 환불도, 동시 구매의 이중 상계도 같은 잠금 하나로 막힌다.
--   ④ 보조 장치로 트리거를 둔다 — REVERSAL · DEBT_OFFSET 이 PAID 를 음수로 만들면 거절한다.
--      ⚠ 트리거는 **동시성을 막지 못한다**(각 트랜잭션은 서로의 아직 끝나지 않은 행을 못 본다).
--      진짜 방어는 ③ 이고, 트리거는 우리 쪽 계산 실수를 잡는 그물이다. DB 제약(CHECK)으로는 합계
--      조건을 표현할 수 없고, 잔액 행을 따로 두는 설계 변경은 V1 에서 하지 않는다(CTO 판정 2026-09-18).

-- ── ① 남은 빚 / 원래 금액 ──────────────────────────────────────────────────────────────────────
alter table public.duk_debt add column if not exists original_amount integer;
update public.duk_debt set original_amount = amount where original_amount is null;
alter table public.duk_debt alter column original_amount set not null;

-- 다 갚은 행은 남은 빚이 0 이다(원래 금액은 original_amount 에 남는다).
update public.duk_debt set amount = 0 where resolved and amount <> 0;

-- `amount > 0` → `amount >= 0` (0 은 "다 갚음"). 원래 금액을 넘을 수는 없다.
alter table public.duk_debt drop constraint if exists duk_debt_amount_check;
alter table public.duk_debt drop constraint if exists duk_debt_amount_nonneg;
alter table public.duk_debt add constraint duk_debt_amount_nonneg check (amount >= 0);
alter table public.duk_debt drop constraint if exists duk_debt_amount_within_original;
alter table public.duk_debt add constraint duk_debt_amount_within_original check (amount <= original_amount);

comment on column public.duk_debt.amount is
  '남은 빚 (2026-09-21부터). 상계할 때마다 줄고 0 이 되면 resolved = true. 원래 금액은 original_amount.';
comment on column public.duk_debt.original_amount is
  '환불로 처음 생긴 빚 금액. 변하지 않는다 (기록용).';

-- ── ④ 보조 그물: PAID 를 음수로 만드는 되돌리기/상계는 거절한다 ───────────────────────────────────
create or replace function public.duk_paid_never_negative()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_paid integer;
begin
  -- 우리가 쓰는 두 사유만 본다. 다른 흐름(만료 등)으로 생기는 상태까지 막으면 멀쩡한 요청이 깨진다.
  if new.bucket <> 'PAID' or new.reason not in ('REVERSAL', 'DEBT_OFFSET') then
    return null;
  end if;
  select coalesce(sum(delta), 0) into v_paid
  from public.duk_ledger
  where user_id = new.user_id and bucket = 'PAID' and (expires_at is null or expires_at > now());
  if v_paid < 0 then
    raise exception 'PAID balance would go negative (user=%, after=%, reason=%)', new.user_id, v_paid, new.reason
      using errcode = 'P0001';
  end if;
  return null;
end;
$$;

drop trigger if exists duk_ledger_paid_never_negative on public.duk_ledger;
create trigger duk_ledger_paid_never_negative
  after insert on public.duk_ledger
  for each row execute function public.duk_paid_never_negative();

-- ── ② + ③ 구매 시 상계 ─────────────────────────────────────────────────────────────────────────
create or replace function public.record_verified_purchase(
  p_user_id uuid, p_provider text, p_external_transaction_id text, p_internal_key text, p_grant_duk integer
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_offset integer := 0;
  v_budget integer;
  v_pay integer;
  v_paid integer;
  v_existing record;
  r record;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;

  -- ⚠ 사용자별 잠금 — 같은 사용자의 덕 변경(구매 · 환불)을 한 줄로 세운다. 잠금 없이 두면 동시 구매가
  --   같은 빚을 보고 **두 번 상계**한다(F-01 과 짝이 되는 GAP-01 의 같은 뿌리).
  perform pg_advisory_xact_lock(hashtext('duk:' || p_user_id::text));

  -- 멱등: 같은 거래 번호는 한 번만 지급한다.
  select * into v_existing from public.verified_purchases where external_transaction_id = p_external_transaction_id;
  if found then return jsonb_build_object('granted', 0, 'already', true); end if;

  -- 첫 충전 평생 1회(§37) — 유니크 부분 인덱스도 막지만 깔끔한 오류를 위해 먼저 본다.
  if p_internal_key = 'DUK_FIRST_20' and exists (
    select 1 from public.verified_purchases where user_id = p_user_id and internal_product_key = 'DUK_FIRST_20'
  ) then
    raise exception 'first pack already granted' using errcode = 'P0001';
  end if;

  insert into public.verified_purchases (user_id, provider, external_transaction_id, internal_product_key, granted_duk)
    values (p_user_id, p_provider, p_external_transaction_id, p_internal_key, p_grant_duk);

  perform public.grant_duk(p_user_id, p_grant_duk, 'PAID', 'PURCHASE', p_external_transaction_id, null);

  -- 갚을 수 있는 만큼만 잡는다: 이번 구매 덕과 **지금 실제로 있는 PAID 잔액** 중 작은 쪽.
  -- (지급 뒤에 읽는다. 잔액을 넘겨 갚으면 PAID 가 음수가 된다.)
  select coalesce(sum(delta), 0) into v_paid
  from public.duk_ledger
  where user_id = p_user_id and bucket = 'PAID' and (expires_at is null or expires_at > now());
  v_budget := least(p_grant_duk, greatest(v_paid, 0));

  -- 오래된 빚부터 채운다. 다 갚은 행만 해결 표시, 부분만 갚은 행은 잔액을 남긴다.
  for r in
    select id, amount from public.duk_debt
    where user_id = p_user_id and not resolved and amount > 0
    order by created_at, id
    for update
  loop
    exit when v_budget <= 0;
    v_pay := least(r.amount, v_budget);
    update public.duk_debt
      set amount = amount - v_pay,
          resolved = (amount - v_pay) = 0,
          resolved_at = case when (amount - v_pay) = 0 then now() else resolved_at end
    where id = r.id;
    v_budget := v_budget - v_pay;
    v_offset := v_offset + v_pay;
  end loop;

  if v_offset > 0 then
    insert into public.duk_ledger (user_id, bucket, delta, reason, purchase_id)
      values (p_user_id, 'PAID', -v_offset, 'DEBT_OFFSET', p_external_transaction_id);
  end if;

  return jsonb_build_object('granted', p_grant_duk, 'debt_offset', v_offset, 'already', false);
end;
$$;

-- ── ③ 환불 ────────────────────────────────────────────────────────────────────────────────────
create or replace function public.record_revocation(
  p_user_id uuid, p_external_revocation_id text, p_external_transaction_id text, p_amount integer
)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_paid integer; v_reverse integer; v_debt integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;

  -- ⚠ 사용자별 잠금 — 환불 두 건이 **같은 잔액**을 보고 각각 되돌리던 것을 막는다(GAP-01).
  --   멱등(같은 환불 번호)과는 다른 문제다: 서로 다른 환불 번호 두 개가 동시에 오는 경우다.
  perform pg_advisory_xact_lock(hashtext('duk:' || p_user_id::text));

  if exists (select 1 from public.purchase_revocations where external_revocation_id = p_external_revocation_id) then
    return jsonb_build_object('already', true);
  end if;

  select coalesce(sum(delta), 0) into v_paid from public.duk_ledger
    where user_id = p_user_id and bucket = 'PAID' and (expires_at is null or expires_at > now());
  v_reverse := least(greatest(v_paid, 0), p_amount);   -- 잔액이 감당하는 만큼만 되돌린다
  v_debt := p_amount - v_reverse;                      -- 나머지는 빚으로 남는다 (§29)

  if v_reverse > 0 then
    insert into public.duk_ledger (user_id, bucket, delta, reason, purchase_id)
      values (p_user_id, 'PAID', -v_reverse, 'REVERSAL', p_external_transaction_id);
  end if;
  if v_debt > 0 then
    insert into public.duk_debt (user_id, amount, original_amount, origin, revocation_id)
      values (p_user_id, v_debt, v_debt, 'REFUND', p_external_revocation_id);
  end if;
  insert into public.purchase_revocations (user_id, external_revocation_id, external_transaction_id, amount, reversed_duk, debt_created)
    values (p_user_id, p_external_revocation_id, p_external_transaction_id, p_amount, v_reverse, v_debt);
  return jsonb_build_object('already', false, 'reversed', v_reverse, 'debt', v_debt);
end;
$$;

revoke all on function public.record_verified_purchase(uuid,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.record_revocation(uuid,text,text,integer) from public, anon, authenticated;
grant execute on function public.record_verified_purchase(uuid,text,text,text,integer) to service_role;
grant execute on function public.record_revocation(uuid,text,text,integer) to service_role;
revoke all on function public.duk_paid_never_negative() from public, anon, authenticated;
