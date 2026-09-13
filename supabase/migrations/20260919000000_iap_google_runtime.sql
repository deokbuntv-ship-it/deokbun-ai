-- ════════════════════════════════════════════════════════════════════════════
-- 안드로이드 결제 런타임 — 승인 재시도와 테스트 구매 구분
-- ════════════════════════════════════════════════════════════════════════════
--
-- 왜 필요한가 (결제 안전 원칙 4·7)
--   원칙 4: "지급 후 소비가 실패하면 재시도한다. **3일 안에 승인·소비되지 않으면 구글이
--            자동 환불하므로**, 재시도와 감시 경로가 있어야 한다."
--            → 재시도하려면 **구매 토큰과 상품 id 를 갖고 있어야** 한다. 지금은 없다.
--   원칙 7: "테스트 구매(라이선스 테스터)와 실구매를 구분해 기록한다."
--            → 지금은 구분이 없다. 매출 집계에 테스트 구매가 섞인다.
--
-- ⚠ `verified_purchases` 의 기존 칸·인덱스·RPC 는 **하나도 바꾸지 않는다.**
--   `external_transaction_id` 유니크(중복 지급 차단)와 첫 팩 부분 유니크(평생 1회)가
--   이 시스템의 자물쇠이고, 여기서 건드릴 이유가 없다. 칸만 더한다.
--
-- ⚠ 새 칸은 전부 **서버만 쓴다.** `verified_purchases` 에는 사용자 INSERT/UPDATE 정책이
--   없다(2026-09-11 실측: A 토큰으로 INSERT → 42501). 그 상태를 유지한다.
--
-- 멱등성 3원칙: add column if not exists · drop 후 create · 시드 insert 없음.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.verified_purchases
  add column if not exists is_test          boolean not null default false,
  -- 승인·소비 재시도에 필요하다. ⚠ 구매 토큰은 **영수증이지 비밀이 아니다** — 그래도
  -- 사용자에게 내보내지 않는다(이 표는 select_own 정책이 있으므로 아래에서 칸을 가린다).
  add column if not exists purchase_token   text,
  add column if not exists store_product_id text,
  add column if not exists acknowledged     boolean not null default false,
  add column if not exists consumed         boolean not null default false,
  add column if not exists last_retry_at    timestamptz,
  add column if not exists retry_count      int not null default 0;

comment on column public.verified_purchases.is_test is
  '라이선스 테스터·프로모·리워드 구매. 실구매와 구분해 집계하려면 이 칸을 걸러야 한다.';
comment on column public.verified_purchases.acknowledged is
  '구글에 승인(acknowledge)이 끝났는가. ⚠ 3일 안에 승인되지 않으면 구글이 자동 환불한다.';

-- 승인이 안 끝난 구매를 빨리 찾는다 (크론이 3일 창을 훑는다).
create index if not exists verified_purchases_unacked_idx
  on public.verified_purchases (created_at)
  where acknowledged = false;

-- ── 서버가 런타임 사실을 적는다 ─────────────────────────────────────────────
create or replace function public.record_purchase_runtime(
  p_external_transaction_id text,
  p_purchase_token text,
  p_store_product_id text,
  p_is_test boolean,
  p_acknowledged boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  update public.verified_purchases
     set purchase_token   = coalesce(p_purchase_token, purchase_token),
         store_product_id = coalesce(p_store_product_id, store_product_id),
         is_test          = coalesce(p_is_test, is_test),
         acknowledged     = acknowledged or coalesce(p_acknowledged, false)
   where external_transaction_id = p_external_transaction_id;
end;
$$;

revoke all on function public.record_purchase_runtime(text, text, text, boolean, boolean) from public, anon, authenticated;
grant execute on function public.record_purchase_runtime(text, text, text, boolean, boolean) to service_role;

-- ── 크론이 볼 목록: 승인 안 된 구매 (3일 창) ────────────────────────────────
create or replace function public.iap_pending_acknowledgements(p_limit int default 50)
returns table (external_transaction_id text, purchase_token text, store_product_id text, created_at timestamptz, retry_count int)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  return query
    select v.external_transaction_id, v.purchase_token, v.store_product_id, v.created_at, v.retry_count
      from public.verified_purchases v
     where v.acknowledged = false
       and v.provider = 'GOOGLE'
       and v.purchase_token is not null
       -- ⚠ 3일이 지나면 구글이 이미 환불했다. 그 뒤로는 승인해도 소용이 없고,
       --   환불은 RTDN 이 `record_revocation` 으로 처리한다.
       and v.created_at > now() - interval '3 days'
       -- 같은 행을 초당 여러 번 두드리지 않는다.
       and (v.last_retry_at is null or v.last_retry_at < now() - interval '10 minutes')
     order by v.created_at
     limit greatest(1, least(coalesce(p_limit, 50), 200));
end;
$$;

revoke all on function public.iap_pending_acknowledgements(int) from public, anon, authenticated;
grant execute on function public.iap_pending_acknowledgements(int) to service_role;

create or replace function public.record_acknowledge_attempt(
  p_external_transaction_id text, p_succeeded boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  update public.verified_purchases
     set acknowledged  = acknowledged or coalesce(p_succeeded, false),
         last_retry_at = now(),
         retry_count   = retry_count + 1
   where external_transaction_id = p_external_transaction_id;
end;
$$;

revoke all on function public.record_acknowledge_attempt(text, boolean) from public, anon, authenticated;
grant execute on function public.record_acknowledge_attempt(text, boolean) to service_role;

-- ── RTDN 이 환불을 찾을 때 쓰는 역인덱스 ────────────────────────────────────
-- 구글은 환불 통지에서 **구매 토큰**을 준다. 우리 원장은 orderId 로 적혀 있을 수 있으므로
-- 토큰으로도 찾을 수 있어야 한다.
create index if not exists verified_purchases_token_idx
  on public.verified_purchases (purchase_token)
  where purchase_token is not null;

create or replace function public.find_purchase_by_token(p_purchase_token text)
returns table (external_transaction_id text, user_id uuid, granted_duk int)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  return query
    select v.external_transaction_id, v.user_id, v.granted_duk
      from public.verified_purchases v
     where v.purchase_token = p_purchase_token
        or v.external_transaction_id = p_purchase_token
     limit 1;
end;
$$;

revoke all on function public.find_purchase_by_token(text) from public, anon, authenticated;
grant execute on function public.find_purchase_by_token(text) to service_role;

notify pgrst, 'reload schema';
