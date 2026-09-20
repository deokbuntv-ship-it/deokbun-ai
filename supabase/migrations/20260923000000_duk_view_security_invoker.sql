-- 잔액 뷰가 **로그인 없이** 전원 읽히던 것을 막는다 (2026-09-18 · 전수 조사 · CTO 순서 ①)
--
-- 무엇이 틀렸나
--   `duk_balance` · `duk_spendable` 는 postgres 소유의 **보통 뷰**다. 보통 뷰는 호출한 사람이 아니라
--   **뷰 소유자의 권한**으로 밑의 표를 읽고, 소유자는 RLS 를 지나친다. 게다가 두 뷰에 anon · authenticated
--   SELECT 권한이 있어서, 앱·웹에 들어 있는 공개 키만 있으면 **모든 사용자의 잔액**이 읽혔다.
--   staging 실측(2026-09-18): 로그인 없이 `duk_balance` 57행 · 57명, `duk_spendable` 57행 · 57명.
--   같은 요청으로 원장 표(`duk_ledger`)는 0행이었다 — 표의 RLS 는 제대로 있었고, **뷰가 그것을 지나쳤다.**
--   production 조회(오너, 2026-09-18): 두 뷰 모두 `anon_can_read = true` — 같은 상태였다.
--
-- 고치는 방법
--   두 뷰를 **호출한 사람의 권한으로**(security_invoker) 돌린다. 그러면 원장의 **이미 있는** 정책
--   `duk_ledger_select_own (user_id = auth.uid())` 이 그대로 적용된다 — 새 정책을 만들지 않는다.
--   로그인 안 한 요청은 읽을 것이 없고, 로그인한 사람은 자기 행만 본다.
--   앱 지갑(`dukWalletService.ts`)은 원래 자기 uid 로 걸러 읽으므로 화면은 그대로다.
--   서버 경로도 그대로다: RPC 는 SECURITY DEFINER(소유자 권한), Edge 는 service_role 이라 RLS 밖이다.
--
-- ⚠ `security_invoker` 는 PostgreSQL 15+ 기능이다(Supabase 는 15 이상).

alter view public.duk_balance set (security_invoker = true);
alter view public.duk_spendable set (security_invoker = true);

-- 로그인하지 않은 요청에는 두 뷰를 아예 주지 않는다.
-- (invoker 로 바꾸면 어차피 0행이지만, 권한도 함께 닫아 두 겹으로 막는다.)
revoke select on table public.duk_balance from anon;
revoke select on table public.duk_spendable from anon;

-- 관리자 RPC — **데이터가 새지는 않았다.** 배포본 전수 확인(2026-09-18) 결과 `admin_*` 함수는 전부 본문에서
-- `is_admin()` 을 보고 거절한다. 다만 **로그인 없이 호출할 수 있는 상태**였다(SECURITY DEFINER + anon 실행 권한).
-- 권한도 닫는다. `authenticated` 는 그대로 둔다 — 관리자 화면이 그 권한으로 부르고, 함수가 다시 is_admin() 을 본다.
-- 공개용 함수(`public_*` · `get_shared_report_preview`)는 anon 이 계속 부를 수 있어야 하므로 건드리지 않는다.
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.proname like 'admin\_%' or p.proname = 'famous_duplicate_candidates')
      and has_function_privilege('anon', p.oid, 'execute')
  loop
    execute format('revoke execute on function %s from anon', r.sig);
  end loop;
end $$;
