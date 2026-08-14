-- =============================================================================
-- DeokbunAI — Advertisement migration DIAGNOSTIC  (READ-ONLY — safe to run anytime)
-- =============================================================================
-- Run this in the Supabase SQL editor. It only SELECTs from system catalogs
-- (to_regclass/to_regprocedure/pg_policies/pg_trigger/information_schema) — it
-- creates NOTHING, drops NOTHING, writes NOTHING. It answers:
--   • which prerequisites REALLY exist in production,
--   • how much of ADVERTISEMENTS_SETUP.sql's first (failed) run actually applied,
--   • whether the `advertisements` table (if created) is protected by RLS.
-- to_regclass/to_regprocedure return NULL (not an error) when the object is
-- absent, so this whole report runs even if nothing was applied.
-- =============================================================================

-- ===== REPORT 1 — one consolidated result set =====
with checks(sort, category, item, result) as (
  values
  -- 1) Prerequisites (what the migration assumed vs what production actually has)
  ('11','1_prereq','public.is_admin()',              (to_regprocedure('public.is_admin()')            is not null)::text),
  ('12','1_prereq','public.set_updated_at()',        (to_regprocedure('public.set_updated_at()')      is not null)::text),
  ('13','1_prereq','public.profiles (table)',        (to_regclass('public.profiles')                  is not null)::text),
  ('14','1_prereq','public.ai_usage_logs (table)',   (to_regclass('public.ai_usage_logs')             is not null)::text),
  ('15','1_prereq','public.consultation_subjects',   (to_regclass('public.consultation_subjects')     is not null)::text),
  ('16','1_prereq','public.conversations (table)',   (to_regclass('public.conversations')             is not null)::text),
  ('17','1_prereq','auth.users (table)',             (to_regclass('auth.users')                       is not null)::text),

  -- 2) Ad tables — did the first (failed) run leave any of these behind? (§8)
  ('21','2_ad_tables','public.advertisements',                 (to_regclass('public.advertisements')                 is not null)::text),
  ('22','2_ad_tables','public.ad_tracking_events',             (to_regclass('public.ad_tracking_events')             is not null)::text),
  ('23','2_ad_tables','public.user_acquisition_attribution',   (to_regclass('public.user_acquisition_attribution')   is not null)::text),

  -- 3) RLS state — CRITICAL: if advertisements exists but RLS is OFF, it is
  --    unprotected (the enable-RLS statement runs AFTER the statement that failed).
  ('31','3_rls','advertisements RLS enabled',
     coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.advertisements'))::text,'table_absent')),
  ('32','3_rls','ad_tracking_events RLS enabled',
     coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.ad_tracking_events'))::text,'table_absent')),
  ('33','3_rls','user_acquisition_attribution RLS enabled',
     coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.user_acquisition_attribution'))::text,'table_absent')),

  -- 4) Ad policies present?
  ('41','4_policies','advertisements policy count',
     (select count(*)::text from pg_policies where schemaname='public' and tablename='advertisements')),
  ('42','4_policies','attribution policy count',
     (select count(*)::text from pg_policies where schemaname='public' and tablename='user_acquisition_attribution')),

  -- 5) Ad functions present?
  ('51','5_ad_fns','ad_on_signup',            (to_regprocedure('public.ad_on_signup()')            is not null)::text),
  ('52','5_ad_fns','ad_on_chat_success',      (to_regprocedure('public.ad_on_chat_success()')      is not null)::text),
  ('53','5_ad_fns','ad_on_birth_info',        (to_regprocedure('public.ad_on_birth_info()')        is not null)::text),
  ('54','5_ad_fns','ad_backfill_attribution', (to_regprocedure('public.ad_backfill_attribution()') is not null)::text),
  ('55','5_ad_fns','admin_ad_performance',
     (to_regprocedure('public.admin_ad_performance(timestamptz,timestamptz)') is not null)::text),

  -- 6) Ad triggers present?
  ('61','6_ad_triggers','trg_advertisements_updated_at',
     (exists(select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relname='advertisements' and t.tgname='trg_advertisements_updated_at'))::text),
  ('62','6_ad_triggers','trg_ad_on_signup (on profiles)',
     (exists(select 1 from pg_trigger where tgname='trg_ad_on_signup'))::text),
  ('63','6_ad_triggers','trg_ad_on_chat_success',
     (exists(select 1 from pg_trigger where tgname='trg_ad_on_chat_success'))::text),

  -- 7) ai_usage_logs columns the first_consultation trigger needs (must all exist)
  ('71','7_ai_usage_cols','status',
     (exists(select 1 from information_schema.columns where table_schema='public' and table_name='ai_usage_logs' and column_name='status'))::text),
  ('72','7_ai_usage_cols','request_type',
     (exists(select 1 from information_schema.columns where table_schema='public' and table_name='ai_usage_logs' and column_name='request_type'))::text),
  ('73','7_ai_usage_cols','user_id',
     (exists(select 1 from information_schema.columns where table_schema='public' and table_name='ai_usage_logs' and column_name='user_id'))::text),

  -- 8) consultation_subjects columns the birth_info trigger needs
  ('81','8_subj_cols','consultation_subjects.user_id',
     (exists(select 1 from information_schema.columns where table_schema='public' and table_name='consultation_subjects' and column_name='user_id'))::text)
)
select category, item, result from checks order by sort;

-- ===== REPORT 2 — run ONLY if REPORT 1 shows advertisements = true =====
-- Confirms the table is empty (safe: no data to lose). Do not run if absent.
--   select count(*) as advertisements_rows from public.advertisements;

-- ===== REPORT 3 — optional: exact advertisements column shape (if it exists) =====
--   select column_name, data_type, is_nullable
--   from information_schema.columns
--   where table_schema='public' and table_name='advertisements'
--   order by ordinal_position;
