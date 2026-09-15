-- =============================================================================
-- DeokbunAI — PRODUCTION 승격 사전점검  (READ-ONLY — 언제 실행해도 안전합니다)
-- =============================================================================
-- 무엇을 하는 파일인가
--   production 에 마이그레이션 57개를 밀어 넣기 **전에**, 지금 production 에 무엇이 있고
--   무엇이 없는지를 한 번에 찍어 봅니다. **읽기만 합니다** — 만들지도, 지우지도, 쓰지도 않습니다.
--   시스템 카탈로그(pg_class / pg_proc / pg_policies / pg_trigger / information_schema)만 봅니다.
--
-- 왜 필요한가
--   2026-09-04 실측에서 `DATABASE_RUNBOOK` §C 의 기록이 **사실과 달랐습니다**(§C 는 광고 스키마가
--   "아무것도 남기지 않았다" 고 적었는데 실제로는 대부분 들어가 있었습니다). 기록을 믿고 승격하면
--   무엇이 실행될지 알 수 없습니다. 이 파일은 **기록이 아니라 DB 에게 직접 묻습니다.**
--
-- 어떻게 쓰나
--   1) Supabase 대시보드 → SQL Editor → New query
--   2) 이 파일 전체를 붙여넣고 Run
--   3) 결과 표를 **그대로 복사**해서 개발자에게 전달
--   결과가 한 표로 나오도록 만들어 두었습니다(에디터는 마지막 결과만 보여 줍니다).
--
-- ⚠ 이 파일은 판단하지 않습니다. 사실만 찍습니다. 무엇이 문제인지는 결과를 보고 정합니다.
-- =============================================================================

-- ⚠⚠ 2026-09-05 추가 — **결과에 환경을 함께 찍습니다.**
--   이 파일의 이전 실행이 **staging 에서 돌아갔는데 production 결과로 읽혔습니다.**
--   표만 보면 어느 프로젝트인지 알 수 없었고, 그 위에 세운 승격 계획이 통째로 무효가 됐습니다.
--   그래서 결과의 **맨 첫 줄이 언제나 환경**입니다. 이제 출처 없는 표가 나올 수 없습니다.
--   ⚠ `current_database()` 는 두 환경 다 `postgres` 라 그것만으로는 못 가릅니다 —
--     **`host` 값이 실질적인 구분자**입니다. 붙여 넣을 때 대시보드 URL 의 ref 도 함께 적으십시오.

with
-- ── 기대 목록: 마이그레이션 57개가 만드는 것 (자동 추출, 2026-09-04) ────────────────
expected_tables(name) as (values
    ('account_deletions'),
    ('ad_tracking_events'),
    ('admin_audit_log'),
    ('admin_users'),
    ('advertisements'),
    ('ai_usage_logs'),
    ('candle_state'),
    ('consultation_decisions'),
    ('consultation_drafts'),
    ('consultation_feedback'),
    ('consultation_reports'),
    ('consultation_sessions'),
    ('consultation_subjects'),
    ('consumer_birth_profiles'),
    ('content_assets'),
    ('content_items'),
    ('content_publications'),
    ('content_versions'),
    ('conversation_messages'),
    ('conversations'),
    ('daily_fortunes'),
    ('duk_debt'),
    ('duk_ledger'),
    ('duk_reserve'),
    ('economy_policy'),
    ('email_campaigns'),
    ('email_deliveries'),
    ('event_campaigns'),
    ('event_claims'),
    ('famous_ai_suggestions'),
    ('famous_profiles'),
    ('famous_snapshots'),
    ('fortune_generation_leases'),
    ('global_generation_guard'),
    ('global_paid_generation_reservations'),
    ('global_reservation_requests'),
    ('in_app_notifications'),
    ('life_events'),
    ('monthly_fortunes'),
    ('notification_deliveries'),
    ('notification_preferences'),
    ('paid_request_idempotency'),
    ('paid_work_reservations'),
    ('plus_entitlements'),
    ('popular_consultation_questions'),
    ('product_catalog'),
    ('product_events'),
    ('profiles'),
    ('provider_connections'),
    ('purchase_revocations'),
    ('push_devices'),
    ('report_shares'),
    ('scheduler_runs'),
    ('site_deploy_requests'),
    ('support_inquiries'),
    ('user_acquisition_attribution'),
    ('verified_purchases')
),
expected_fns(name) as (values
    ('account_deletion_preview'),
    ('acquire_fortune_generation_lease'),
    ('acquire_paid_request'),
    ('ad_on_birth_info'),
    ('ad_on_chat_success'),
    ('ad_reconcile_attribution'),
    ('admin_ad_performance'),
    ('admin_adjust_duk'),
    ('admin_answer_inquiry'),
    ('admin_build_email_recipients'),
    ('admin_cancel_email_campaign'),
    ('admin_create_email_campaign'),
    ('admin_daily_activity'),
    ('admin_dashboard_overview'),
    ('admin_economy_overview'),
    ('admin_famous_duplicate_report'),
    ('admin_get_consultation'),
    ('admin_get_consultation_audit'),
    ('admin_get_email_campaign'),
    ('admin_get_user'),
    ('admin_latest_deploy_request'),
    ('admin_list_ai_usage'),
    ('admin_list_audit_log'),
    ('admin_list_consultations'),
    ('admin_list_duk_ledger'),
    ('admin_list_email_campaigns'),
    ('admin_list_inquiries'),
    ('admin_list_scheduled_publications'),
    ('admin_list_users'),
    ('admin_notification_delivery_overview'),
    ('admin_popular_question_metrics'),
    ('admin_retention_overview'),
    ('admin_retry_failed_email_deliveries'),
    ('admin_retry_failed_push_deliveries'),
    ('admin_schedule_email_campaign'),
    ('admin_user_wallet'),
    ('ads_set_updated_at'),
    ('analytics_from_ledger'),
    ('analytics_from_reserve'),
    ('analytics_from_session'),
    ('claim_pending_email_deliveries'),
    ('claim_pending_push_deliveries'),
    ('commit_session_reservation'),
    ('complete_consultation_request_with_decision'),
    ('complete_consultation_with_billing'),
    ('complete_monthly_fortune_generation'),
    ('complete_paid_request'),
    ('complete_today_fortune_generation'),
    ('content_assets_touch'),
    ('content_items_touch'),
    ('content_items_touch_insert'),
    ('content_publications_touch'),
    ('content_publications_touch_insert'),
    ('enforce_product_events_rate_limit'),
    ('famous_duplicate_candidates'),
    ('famous_name_key'),
    ('famous_profiles_chart_staleness'),
    ('famous_profiles_touch'),
    ('famous_profiles_touch_insert'),
    ('get_global_generation_guard'),
    ('get_shared_report'),
    ('get_shared_report_preview'),
    ('grant_duk'),
    ('grant_welcome_on_consent'),
    ('is_admin'),
    ('light_candle'),
    ('provider_connections_touch'),
    ('public_get_content'),
    ('public_get_famous'),
    ('public_list_content'),
    ('public_list_famous'),
    ('purge_account_data'),
    ('recompute_email_campaign'),
    ('record_email_delivery_result'),
    ('record_notification_delivery_result'),
    ('record_product_event'),
    ('record_revocation'),
    ('record_verified_purchase'),
    ('release_fortune_generation_lease'),
    ('release_paid_request'),
    ('release_session_reservation'),
    ('reserve_global_paid_generation'),
    ('reserve_global_paid_generation_idem'),
    ('reserve_paid_work'),
    ('reserve_session_duk'),
    ('run_birthday_notifications'),
    ('run_email_campaign'),
    ('session_reason'),
    ('set_global_generation_guard'),
    ('set_updated_at'),
    ('spend_duk'),
    ('support_inquiries_touch'),
    ('sync_marketing_consent')
),

-- ── 1. 마이그레이션 이력 자체가 있는가 ────────────────────────────────────────
r1(sort, section, item, result) as (
  select '1010', '1_migration_history', 'supabase_migrations.schema_migrations 존재',
         (to_regclass('supabase_migrations.schema_migrations') is not null)::text
  union all
  -- ⚠ 개수와 최신 version 은 여기서 읽지 않습니다. 그 테이블이 **없을 수 있고**, 없는 테이블을
  --    직접 select 하면 이 쿼리 전체가 에러로 죽습니다(to_regclass 와 달리 NULL 이 안 나옵니다).
  --    위 줄이 true 로 나오면 파일 맨 아래 [보고 2] 를 따로 실행해 주세요.
  select '1020', '1_migration_history', '개수·최신 version', '→ 위가 true 면 파일 맨 아래 [보고 2] 실행'
),

-- ── 2. 전제 (다른 것들이 기대는 바닥) ────────────────────────────────────────
r2(sort, section, item, result) as (
  select '2010', '2_prereq', 'public.is_admin()',       (to_regprocedure('public.is_admin()')       is not null)::text
  union all select '2020', '2_prereq', 'public.set_updated_at()', (to_regprocedure('public.set_updated_at()') is not null)::text
  union all select '2030', '2_prereq', 'auth.users',            (to_regclass('auth.users')            is not null)::text
  union all select '2040', '2_prereq', 'storage.buckets',       (to_regclass('storage.buckets')       is not null)::text
),

-- ── 3. 테이블: 기대 57개 중 없는 것만 ─────────────────────────────────────────
r3(sort, section, item, result) as (
  select '3010', '3_tables', '기대 테이블 총 개수', (select count(*)::text from expected_tables)
  union all
  select '3020', '3_tables', '그중 이미 있는 것',
         (select count(*)::text from expected_tables e where to_regclass('public.' || e.name) is not null)
  union all
  select '3030', '3_tables', '⚠ 없는 것 (이번에 새로 생깁니다)',
         coalesce((select string_agg(e.name, ', ' order by e.name)
                   from expected_tables e where to_regclass('public.' || e.name) is null), '(없음 — 전부 있습니다)')
),

-- ── 4. 함수: 기대 93개 중 없는 것 + ⚠ 같은 이름 여러 시그니처(과적재) ──────────
r4(sort, section, item, result) as (
  select '4010', '4_functions', '기대 함수 총 개수', (select count(*)::text from expected_fns)
  union all
  select '4020', '4_functions', '그중 이미 있는 것 (이름 기준)',
         (select count(*)::text from expected_fns e
          where exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                        where n.nspname = 'public' and p.proname = e.name))
  union all
  select '4030', '4_functions', '⚠ 없는 것',
         coalesce((select string_agg(e.name, ', ' order by e.name) from expected_fns e
                   where not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                                     where n.nspname = 'public' and p.proname = e.name)),
                  '(없음 — 전부 있습니다)')
  union all
  -- ⚠⚠ 가장 위험한 항목. 같은 이름에 시그니처가 둘 이상이면 마이그레이션의 per-signature drop 이
  --     한쪽만 지우고 다른 쪽이 살아남습니다. 그러면 앱이 어느 쪽을 부를지 알 수 없습니다.
  select '4040', '4_functions', '⚠⚠ 같은 이름에 시그니처가 2개 이상인 함수',
         coalesce((select string_agg(x.proname || '(' || x.cnt || ')', ', ' order by x.proname)
                   from (select p.proname, count(*) as cnt
                         from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                         where n.nspname = 'public' and p.proname in (select name from expected_fns)
                         group by p.proname having count(*) > 1) x), '(없음 — 과적재 없습니다)')
  union all
  select '4050', '4_functions', '광고 — rev2 가 실제로 만드는 것 (rev1 이름 아님)',
         concat('ads_set_updated_at=', (to_regprocedure('public.ads_set_updated_at()') is not null)::text,
                ' / ad_reconcile_attribution=', (to_regprocedure('public.ad_reconcile_attribution()') is not null)::text,
                ' / ad_on_chat_success=', (to_regprocedure('public.ad_on_chat_success()') is not null)::text,
                ' / ad_on_birth_info=', (to_regprocedure('public.ad_on_birth_info()') is not null)::text)
),

-- ── 5. 정책: 개수가 아니라 **이름**을 본다 ───────────────────────────────────
r5(sort, section, item, result) as (
  select '5' || lpad((row_number() over (order by tablename))::text, 3, '0'), '5_policies',
         tablename::text, string_agg(policyname::text || '[' || cmd || ']', ', ' order by policyname)
  from pg_policies where schemaname = 'public'
  group by tablename
),

-- ── 6. RLS 가 꺼진 public 테이블 (있으면 안 됩니다) ──────────────────────────
r6(sort, section, item, result) as (
  select '6010', '6_rls', '⚠ RLS 꺼진 테이블',
         coalesce((select string_agg(c.relname, ', ' order by c.relname)
                   from pg_class c join pg_namespace n on n.oid = c.relnamespace
                   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
                     and c.relname in (select name from expected_tables)), '(없음 — 전부 켜져 있습니다)')
),

-- ── 7. 트리거 (public 스키마) ────────────────────────────────────────────────
r7(sort, section, item, result) as (
  select '7' || lpad((row_number() over (order by c.relname, t.tgname))::text, 3, '0'), '7_triggers',
         c.relname::text, t.tgname::text
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal
),

-- ── 8. 컬럼 모양 — 드리프트가 가장 잘 나는 테이블만 ─────────────────────────
--     마이그레이션의 create table if not exists 는 **이미 있는 테이블을 고치지 않습니다.**
--     production 의 컬럼이 다르면 뒤따르는 인덱스·정책·함수가 그 지점에서 실패합니다.
r8(sort, section, item, result) as (
  select '8' || lpad((row_number() over (order by table_name))::text, 3, '0'), '8_columns',
         table_name::text, string_agg(column_name::text, ',' order by ordinal_position)
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('ai_usage_logs','consultation_subjects','conversations','profiles',
                       'advertisements','ad_tracking_events','user_acquisition_attribution',
                       'content_items','famous_profiles')
  group by table_name
),

r0(sort, section, item, result) as (
  select '0000', '0_environment', '⚠ 어느 프로젝트인가',
         'db=' || current_database()
         || ' · host=' || coalesce(inet_server_addr()::text, '(local)')
         || ' · user=' || current_user
         || '  ← 이 값이 production 인지 확인하고 결과를 전달하십시오'
)

select section, item, result from (
  select * from r0 union all
  select * from r1 union all select * from r2 union all select * from r3 union all
  select * from r4 union all select * from r5 union all select * from r6 union all
  select * from r7 union all select * from r8
) all_rows
order by sort;

-- =============================================================================
-- [보고 2] — 위 결과에서 'supabase_migrations.schema_migrations 존재' 가 **true** 일 때만
--           실행하세요. false 면 그 테이블이 없다는 뜻이고, 아래를 실행하면 에러가 납니다
--           (에러가 나도 DB 는 아무 변화가 없습니다 — 읽기 쿼리라서요).
-- =============================================================================
-- select count(*) as 기록된_마이그레이션_개수,
--        min(version) as 가장_오래된,
--        max(version) as 가장_최근
-- from supabase_migrations.schema_migrations;
--
-- select version, name from supabase_migrations.schema_migrations order by version;
