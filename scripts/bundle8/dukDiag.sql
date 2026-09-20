-- 🔴 덕 경제 진단 — 읽기 전용 1건 (2026-09-17). production 에 객체가 **없어도 오류 없이** 돌도록 카탈로그만 본다.
-- 행 수는 이미 존재가 확인된 표(profiles · duk_ledger · global_generation_guard)에서만 센다.
select
  -- ① 가입 지급: 트리거 · 함수 · 색인 · 이력 · 제약
  (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname = 'profiles' and t.tgname = 'profiles_grant_welcome' and not t.tgisinternal) as welcome_trigger,
  (select t.tgenabled::text from pg_trigger t where t.tgname = 'profiles_grant_welcome' limit 1)                        as welcome_trigger_state,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'grant_welcome_on_consent')                                                as welcome_function,
  (select count(*) from pg_indexes where schemaname = 'public' and indexname = 'duk_ledger_welcome_uniq')                  as welcome_index,
  (select count(*) from supabase_migrations.schema_migrations where version = '20260838000000')                          as welcome_migration_recorded,
  (select count(*) from supabase_migrations.schema_migrations where version between '20260831000000' and '20260843000000') as duk_migrations_recorded_of_13,
  (select pg_get_constraintdef(oid) like '%WELCOME%' from pg_constraint where conname = 'duk_ledger_reason_check' limit 1) as reason_check_allows_welcome,
  (select min(terms_accepted_at) from public.profiles where terms_version is not null)                                   as first_consent_at,
  (select max(terms_accepted_at) from public.profiles where terms_version is not null)                                   as last_consent_at,
  -- ② 상담 차감: RPC 존재 · 세션 기록 (DUK_BILLING_ENABLED 는 Edge 시크릿이라 SQL 로는 못 본다 — 흔적으로 본다)
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname in ('reserve_session_duk', 'complete_consultation_with_billing', 'release_session_reservation')) as billing_functions_of_3,
  (to_regclass('public.consultation_sessions') is not null)                                                              as sessions_table,
  (select n_live_tup from pg_stat_user_tables where schemaname = 'public' and relname = 'consultation_sessions')        as sessions_rows_approx,
  (select n_live_tup from pg_stat_user_tables where schemaname = 'public' and relname = 'paid_request_idempotency')     as paid_requests_rows_approx,
  -- ③ 차감이 꺼져 있을 때 남는 유일한 둑: 전역 생성 한도
  (select generation_enabled from public.global_generation_guard where guard_key = 'global')                             as guard_enabled,
  (select hourly_limit from public.global_generation_guard where guard_key = 'global')                                   as guard_hourly_limit,
  (select daily_limit from public.global_generation_guard where guard_key = 'global')                                    as guard_daily_limit;
