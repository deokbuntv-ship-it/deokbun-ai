-- ════════════════════════════════════════════════════════════════════════════
-- 모델 단가 + 환율 — **코드가 아니라 데이터로.** (파일만. 적용은 오너 판단)
-- ════════════════════════════════════════════════════════════════════════════
--
-- 왜 필요한가
--   원가 계산기(`operationalContracts.computeCost`)와 검증된 단가 상수는 이미 있고 단위 테스트도
--   있다. 그런데 그 단가가 **코드 안에** 있어서, OpenAI 요금제가 바뀌면 배포를 해야 숫자가 맞는다.
--   배포 전까지는 화면이 조용히 틀린 금액을 보여 준다 — 그것이 `adminOpsService` 가
--   "no cost/price hardcoding" 을 규칙으로 둔 이유다.
--
--   이 마이그레이션은 그 규칙을 지키면서 금액을 보이게 한다: **값은 표에, 계산은 코드에.**
--   요금제가 바뀌면 오너가 관리자 화면에서 숫자만 고친다.
--
-- ⚠ 왜 환율이 따로인가
--   환율은 모델별 값이 아니다. 그리고 관리자 원가 경로가 지금까지 원(₩)을 한 번도 안 보여 준
--   이유가 정확히 "검증된 환율 출처가 없어서" 였다(`modelPricing.ts` 주석). 환율을 **오너가 넣는
--   값**으로 만들면 그 공백이 닫힌다. 자동 조회는 하지 않는다 — 외부 API 의존이 하나 더 생기고,
--   틀린 환율이 조용히 들어오는 쪽이 비어 있는 것보다 나쁘다.
--
-- ⚠ 단가가 없는 모델
--   행이 없으면 **0원이 아니라 "가격 미확인"** 이다. 코드가 이미 그렇게 되어 있다
--   (`computeCost` 가 null 을 돌려주고 UI 가 `UNPRICED_LABEL` 을 쓴다). 이 표는 그 동작을 바꾸지
--   않는다 — 비어 있으면 지금과 똑같이 "가격 미확인" 이 보인다. **"돈을 안 썼다" 와 "얼마인지
--   모른다" 를 섞지 않는다.**
--
-- ⚠ 과거 로그를 그때 단가로 계산하는가 — **지금은 아니다**
--   `effective_from` 을 남겨 문을 열어 두되, 화면은 **활성 행 하나**로만 계산한다. 로그마다
--   그 시점의 단가를 찾아 붙이려면 행별 시간 조인이 필요하고, 사용자 0명·로그 800행 상태에서
--   그 정밀도는 값어치가 없다. 요금제가 실제로 바뀌는 날 그때 하면 된다. 화면은 "지금 단가 기준"
--   이라고 밝힌다.
--
-- 멱등성 3원칙
--   1. `create table if not exists` — 이미 있으면 no-op
--   2. `drop policy if exists` → `create policy` — 재적용해도 42710 이 없다
--   3. 시드 없음 — **단가를 여기에 박지 않는다.** 그것이 이 작업의 전제다.
--      초기값은 오너가 화면에서 넣는다(`OWNER_TODO` Z14 에 출처와 함께 적어 두었다).
-- ════════════════════════════════════════════════════════════════════════════

-- ── 모델별 단가 ───────────────────────────────────────────────────────────────
create table if not exists public.model_pricing (
  model                text primary key,
  -- 100만 토큰당 단가. OpenAI 요금표가 그 단위로 적혀 있어 옮겨 적기 쉬운 쪽을 골랐다.
  input_per_1m         numeric(12,6) not null check (input_per_1m >= 0),
  cached_input_per_1m  numeric(12,6) check (cached_input_per_1m is null or cached_input_per_1m >= 0),
  output_per_1m        numeric(12,6) not null check (output_per_1m >= 0),
  currency             text not null default 'USD' check (currency in ('USD')),
  effective_from       date not null default current_date,
  note                 text,
  updated_at           timestamptz not null default now(),
  updated_by           uuid
);

alter table public.model_pricing enable row level security;
revoke all on table public.model_pricing from public, anon, authenticated;
grant select, insert, update, delete on table public.model_pricing to service_role;

drop policy if exists model_pricing_admin_all on public.model_pricing;
create policy model_pricing_admin_all on public.model_pricing
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 환율 (USD→KRW) ───────────────────────────────────────────────────────────
-- 단일 행 설계. `economy_policy` 처럼 활성 행 하나를 읽는 패턴을 따른다.
-- ⚠ 'DUK_KRW' 는 환율이 아니라 **덕 1개의 원화 가치**다. 모양이 같아 표를 하나만 쓴다
--   (아래 "덕 단가를 위해 pair 를 넓힌다" 참조 — 먼저 적용한 판을 위해 CHECK 를 갈아 끼운다).
create table if not exists public.fx_rate (
  pair            text primary key check (pair in ('USD_KRW', 'DUK_KRW')),
  rate            numeric(12,4) not null check (rate > 0),
  effective_from  date not null default current_date,
  note            text,
  updated_at      timestamptz not null default now(),
  updated_by      uuid
);

alter table public.fx_rate enable row level security;
revoke all on table public.fx_rate from public, anon, authenticated;
grant select, insert, update, delete on table public.fx_rate to service_role;

drop policy if exists fx_rate_admin_all on public.fx_rate;
create policy fx_rate_admin_all on public.fx_rate
  for all using (public.is_admin()) with check (public.is_admin());

-- ── updated_at 자동 갱신 ─────────────────────────────────────────────────────
drop trigger if exists model_pricing_set_updated_at on public.model_pricing;
create trigger model_pricing_set_updated_at
  before update on public.model_pricing
  for each row execute function public.set_updated_at();

drop trigger if exists fx_rate_set_updated_at on public.fx_rate;
create trigger fx_rate_set_updated_at
  before update on public.fx_rate
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- 2026-09-07 추가 — 실측이 설계를 바꾼 세 가지
-- ════════════════════════════════════════════════════════════════════════════
--
-- ⚠ ① 추론 토큰 단가 칸을 **만들지 않는다.**
--   staging 803건 실측: `reasoning_tokens > output_tokens` 인 행 **0건**,
--   `total_tokens ≠ input + output` 인 행 **0건**(783건 검사). 추론은 출력에 **포함**돼 있고
--   출력의 29.3% 를 차지한다. 단가 칸을 따로 만들어 곱하면 그 29.3% 를 **두 번 센다.**
--   코드 주석(`llmCostModel.ts` "gpt-5-mini bills reasoning as output")이 사실이었다.
--
-- ⚠ ② 덕 단가를 `fx_rate` 에 넣는다 — 표를 새로 만들지 않는다.
--   "단위 하나가 얼마인가" 라는 모양이 환율과 똑같다. 마진을 보려면 이것이 있어야 하는데,
--   **코드에 박을 수 없다**: `TOPUP_PACKS.priceKrwHint` 는 코드가 스스로 "display hypothesis,
--   not a charge" 라고 적어 둔 가설이고 팩마다 ₩145/₩198/₩166 로 다르다. 가설을 곱해
--   "마진 99%" 를 찍으면 그것이 곧 지어낸 숫자다. **오너가 넣는 값**으로 만든다.
--   ⚠ 5/12/50덕(상담 가격)은 건드리지 않는다. 이것은 "덕 1개가 몇 원인가" 이고 **보고용**이다.
--
-- ⚠ ③ `admin_list_ai_usage` 가 캐시·추론 컬럼을 안 준다.
--   그래서 화면이 캐시된 입력을 일반 단가로 계산해 **+6.2% 과대**(803건 실측, 적중률 38.8%).
--   기존 RPC 의 반환 모양을 바꾸면 drop 후 재생성이라 위험하다. **집계 전용 RPC 를 새로 더한다** —
--   덧셈만 하는 함수라 되돌리기 쉽고, 대시보드 "오늘 AI 비용" 과 "저장 전 미리보기" 가
--   같은 것을 필요로 해서 셋을 하나로 덮는다.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 덕 단가를 위해 pair 를 넓힌다 ─────────────────────────────────────────────
-- ⚠ `create table if not exists` 는 **이미 있는 표를 고치지 않는다**(production 승격에서 배운 것).
--   이 파일을 먼저 적용한 판이 있으면 CHECK 가 옛것이라 'DUK_KRW' 가 거부된다.
--   인라인 CHECK 라 이름을 모르므로 카탈로그에서 찾아 지운 뒤 **이름 있는 것**으로 다시 건다.
--   (자기 자신도 지우고 다시 걸므로 몇 번 돌려도 같다.)
do $$
declare c text;
begin
  if to_regclass('public.fx_rate') is null then return; end if;
  for c in
    select con.conname
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_namespace ns on ns.oid = rel.relnamespace
     where ns.nspname = 'public' and rel.relname = 'fx_rate' and con.contype = 'c'
       and pg_get_constraintdef(con.oid) ilike '%pair%'
  loop
    execute format('alter table public.fx_rate drop constraint %I', c);
  end loop;
  alter table public.fx_rate
    add constraint fx_rate_pair_allowed check (pair in ('USD_KRW', 'DUK_KRW'));
end $$;

-- ── 창(window) 단위 원가 집계 ────────────────────────────────────────────────
-- 왜 새 함수인가: `admin_list_ai_usage` 는 **행 목록**이라 (a) 한 페이지 50건만 보이고
--   (b) 캐시·추론 컬럼이 반환에 없다. 금액을 보려면 창 전체의 **합**이 필요하다.
--   반환 모양을 바꾸는 대신 더한다 — 기존 화면이 그대로 돈다.
-- ⚠ 금액을 여기서 계산하지 않는다. 단가는 표에, 곱셈은 코드에 있다(이 트랙의 전제).
--   이 함수는 **토큰만** 돌려준다.
create or replace function public.admin_ai_cost_window(p_hours int default 24)
returns table (
  model               text,
  requests            bigint,
  input_tokens        bigint,
  cached_input_tokens bigint,
  output_tokens       bigint,
  reasoning_tokens    bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    coalesce(l.model, 'unknown')::text,
    count(*)::bigint,
    coalesce(sum(l.input_tokens), 0)::bigint,
    coalesce(sum(l.cached_input_tokens), 0)::bigint,
    coalesce(sum(l.output_tokens), 0)::bigint,
    coalesce(sum(l.reasoning_tokens), 0)::bigint
  from public.ai_usage_logs l
  -- 1시간~7일. 상한을 두는 이유는 관리자 화면 하나가 전체 스캔을 부르지 않게 하는 것이다.
  where l.created_at >= now() - make_interval(hours => greatest(1, least(coalesce(p_hours, 24), 168)))
  group by 1
  order by 2 desc;
end;
$$;

revoke all on function public.admin_ai_cost_window(int) from public, anon;
grant execute on function public.admin_ai_cost_window(int) to authenticated;
