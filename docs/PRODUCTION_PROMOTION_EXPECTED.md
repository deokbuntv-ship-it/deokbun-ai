# 사전점검 기대 목록 — §5 정책 · §7 트리거 · §8 컬럼

> 2026-09-05 · `supabase/migrations` 59개에서 기계 추출 · **읽기 전용 문서**
>
> ⚠⚠ **2026-09-05 정정.** 아래 "2026-09-04 실측 · 불일치 0건" 은 **staging 을 잰 값**이었습니다.
> 진짜 production 은 **테이블 33/24 · 함수 38/55 · 미적용 37개** 입니다.
> **이 문서의 기대 목록 자체는 그대로 유효합니다** — 마이그레이션에서 뽑은 것이라 환경과 무관합니다.
> 바뀐 것은 **언제 쓰느냐**입니다: 승격 **전** 대조가 아니라 **승격 후 사후 검증**(단계 ⑧)에 씁니다.
> 승격 전 production 은 아직 이 목록의 절반도 갖고 있지 않은 것이 **정상**입니다.

## 왜 이 파일이 있나

`PRODUCTION_PROMOTION_PREFLIGHT.sql` 은 §3(테이블)·§4(함수)에는 기대 목록을 **질의 안에 싣고**
자동으로 대조합니다. 그런데 **§5·§7·§8 은 production 의 현재 값을 찍기만 합니다** — 비교 대상이
없습니다. 그 비교 대상을 마이그레이션에서 뽑아 여기 둡니다.

| | 기대 | ~~2026-09-04~~ (staging 이었음) | production 실측 (2026-09-05) |
|---|---:|---|---|
| 정책 | **61** | ~~61 ✅~~ | 미측정 · ⚠ **옛 이름 12개가 따로 남아 있음** |
| 트리거 | **39** | ~~39 ✅~~ | 미측정 |
| 컬럼 보유 테이블 | **57** | ~~표본 9개 일치~~ | ⚠ **13개는 레포 밖에서 만들어짐** — 계획서 §1-2 |

⚠ **승격 전 production 과 이 표를 대조하지 마십시오.** 지금은 어긋나는 것이 정상입니다.
대조는 단계 ⑧(사후 검증)에서 합니다.

## 읽을 때의 규칙 세 가지

1. **production 에 더 있는 것은 대체로 정상입니다.** 이 목록은 마이그레이션이 만드는 것만 담습니다.
   레포 밖에서 만든 객체(예: `ai_usage_logs` 의 RLS)는 여기 없지만 production 에는 있을 수 있습니다.
2. **production 에 없는 것이 문제입니다.** 승격으로 생길 것인지 아닌지를 구분해야 합니다.
   정책·트리거는 전부 `drop if exists` → `create` 쌍이라 **밀면 반드시 생깁니다**
   (64/64 · 39/39 전부 같은 파일 안에서 선행 drop 확인).
   **컬럼은 다릅니다** — `create table if not exists` 는 이미 있는 테이블을 고치지 않습니다.
   여기 있는데 production 에 없는 컬럼은 **밀어도 안 생깁니다.** 별도 `add column` 이 필요합니다.
3. ⚠ **`storage.objects` 정책 4개는 사전점검 결과에 안 나옵니다** — 질의가 `schemaname = 'public'`
   으로 거릅니다. 아래 표에는 있습니다. 없다고 오해하지 마십시오.

## ⚠ 이 목록을 만들면서 도구가 두 번 틀렸습니다

둘 다 **없는 고장을 보고**했습니다(production 은 맞았습니다). 같은 실수를 반복하지 않도록 적어 둡니다.

| 증상 | 원인 |
|---|---|
| 정책 3건이 "production 에 없음" | 나중 마이그레이션이 **drop 만 하고 재생성하지 않은** 정책. `create` 만 세고 `drop` 을 시간순으로 재생하지 않았다 (64 → 실제 **61**) |
| 컬럼 21건이 "마이그레이션에 없음" | ① 줄 끝 `-- 주석` 을 안 지워 **쉼표 분할 뒤 다음 컬럼이 통째로 탈락** ② `add column a, add column b` 에서 첫 번째만 매칭 |
| 정책 14건 누락 | 이름에 **공백**이 든 형태(`"admin_users self read"`)를 `\w+` 로 잡으려 했다 |

**불일치가 나오면 대상을 의심하기 전에 도구를 먼저 의심합니다.**

## 이 목록의 한계

이름만 담습니다. 정책의 `using`/`with check` 본문, 트리거의 호출 함수·타이밍·이벤트,
컬럼의 타입·기본값·not null 은 담지 않습니다 — 사전점검도 그것들을 읽지 않기 때문입니다.
**이름이 다 맞아도 정의가 낡았을 수 있습니다.** 그것을 맞추는 유일한 방법이 승격(push)입니다.

---
## §5 정책 (기대)

| 테이블 | 정책[명령] |
|---|---|
| admin_users | admin_users self read[SELECT] |
| advertisements | advertisements_admin_all[ALL] |
| candle_state | candle_state_select_own[SELECT] |
| consultation_decisions | consultation_decisions_select_own[SELECT] |
| consultation_drafts | drafts_delete_own[DELETE], drafts_insert_own[INSERT], drafts_select_own[SELECT], drafts_update_own[UPDATE] |
| consultation_feedback | consultation_feedback_insert_own[INSERT], consultation_feedback_select_own[SELECT], consultation_feedback_update_own[UPDATE] |
| consultation_reports | reports_all_own[ALL] |
| consultation_sessions | consultation_sessions_select_own[SELECT] |
| consultation_subjects | subjects_all_own[ALL] |
| consumer_birth_profiles | consumer_birth_profiles_delete_own[DELETE], consumer_birth_profiles_insert_own[INSERT], consumer_birth_profiles_select_own[SELECT], consumer_birth_profiles_update_own[UPDATE] |
| content_assets | content_assets admin all[ALL] |
| content_items | content_items admin all[ALL] |
| content_publications | content_publications admin all[ALL] |
| content_versions | content_versions admin all[ALL] |
| conversation_messages | messages_insert_via_conversation[INSERT], messages_select_via_conversation[SELECT] |
| conversations | conversations_insert_own[INSERT], conversations_select_own[SELECT], conversations_update_own[UPDATE] |
| daily_fortunes | daily_fortunes_select_own[SELECT] |
| duk_debt | duk_debt_select_own[SELECT] |
| duk_ledger | duk_ledger_select_own[SELECT] |
| duk_reserve | duk_reserve_select_own[SELECT] |
| economy_policy | economy_policy_read_active[SELECT] |
| event_campaigns | event_campaigns_read_active[SELECT] |
| event_claims | event_claims_select_own[SELECT] |
| famous_ai_suggestions | famous_ai_suggestions admin all[ALL] |
| famous_profiles | famous_profiles admin all[ALL] |
| famous_snapshots | famous_snapshots admin all[ALL] |
| in_app_notifications | in_app_notifications_all_own[ALL] |
| life_events | life_events_all_own[ALL] |
| monthly_fortunes | monthly_fortunes_select_own[SELECT] |
| notification_preferences | notification_preferences_all_own[ALL] |
| plus_entitlements | plus_entitlements_select_own[SELECT] |
| popular_consultation_questions | popular_questions_admin_all[ALL], popular_questions_read_active[SELECT] |
| product_catalog | product_catalog_read_active[SELECT] |
| profiles | profiles_insert_own[INSERT], profiles_select_own[SELECT], profiles_update_own[UPDATE] |
| provider_connections | provider_connections admin all[ALL] |
| purchase_revocations | purchase_revocations_select_own[SELECT] |
| push_devices | push_devices_all_own[ALL] |
| report_shares | report_shares_owner_all[ALL] |
| site_deploy_requests | site_deploy_requests admin read[SELECT] |
| storage.objects | content-media admin delete[DELETE], content-media admin update[UPDATE], content-media admin write[INSERT], content-media public read[SELECT] |
| support_inquiries | support_inquiries_insert_own[INSERT], support_inquiries_select_own[SELECT] |
| user_acquisition_attribution | attribution_select_own[SELECT] |
| verified_purchases | verified_purchases_select_own[SELECT] |

## §7 트리거 (기대)

| 테이블 | 트리거 |
|---|---|
| advertisements | trg_advertisements_updated_at |
| ai_usage_logs | trg_ad_on_chat_success |
| consultation_drafts | consultation_drafts_set_updated_at |
| consultation_feedback | consultation_feedback_set_updated_at |
| consultation_reports | consultation_reports_set_updated_at |
| consultation_sessions | consultation_sessions_analytics |
| consultation_subjects | consultation_subjects_set_updated_at, trg_ad_on_birth_info |
| consumer_birth_profiles | consumer_birth_profiles_set_updated_at |
| content_assets | content_assets_touch_trg |
| content_items | content_items_touch_insert_trg, content_items_touch_trg |
| content_publications | content_publications_touch_insert_trg, content_publications_touch_trg |
| conversations | conversations_set_updated_at |
| daily_fortunes | set_daily_fortunes_updated_at |
| duk_ledger | duk_ledger_analytics |
| duk_reserve | duk_reserve_analytics |
| email_campaigns | email_campaigns_set_updated |
| email_deliveries | email_deliveries_set_updated |
| famous_profiles | famous_profiles_touch_insert_trg, famous_profiles_touch_trg, famous_profiles_z_staleness_trg |
| life_events | set_life_events_updated_at |
| monthly_fortunes | set_monthly_fortunes_updated_at |
| notification_deliveries | notification_deliveries_set_updated |
| notification_preferences | set_notification_preferences_updated_at |
| popular_consultation_questions | set_popular_questions_updated_at |
| product_events | trg_product_events_rate_limit |
| profiles | profiles_grant_welcome, profiles_set_updated_at, profiles_sync_marketing |
| provider_connections | provider_connections_touch_trg |
| push_devices | set_push_devices_updated_at |
| report_shares | report_shares_set_updated_at |
| scheduler_runs | scheduler_runs_set_updated |
| support_inquiries | support_inquiries_touch_trg |
| user_acquisition_attribution | trg_ad_reconcile_attribution, trg_attribution_updated_at |

## §8 컬럼 (기대)

| 테이블 | 컬럼 |
|---|---|
| account_deletions | id,user_ref,deleted_at,requested_via,duk_balance_plus,duk_balance_reward,duk_balance_paid,unresolved_debt,purchase_record,revocation_record |
| ad_tracking_events | id,event_type,tracking_code,ad_id,user_id,visitor_id,created_at |
| admin_audit_log | id,admin_user_id,action,target_user_id,amount,bucket,reason_note,metadata,created_at |
| admin_users | user_id,role,created_at,created_by |
| advertisements | id,public_tracking_code,ad_type,publisher_nickname,ad_check_url,start_date,contract_type,cost_krw,notes,status,schema_version,published_at,created_at,updated_at |
| ai_usage_logs | cached_input_tokens,reasoning_tokens,max_output_tokens,complexity,reasoning_effort,id,user_id,conversation_id,model,request_type,input_tokens,output_tokens,total_tokens,latency_ms,status,error_code,created_at,request_id,gate_firings |
| candle_state | user_id,last_lit_at,updated_at |
| consultation_decisions | id,conversation_id,user_id,workload,request_id,decision_meta,answer_plan_version,decision_policy_version,engine_version,model_id,created_at |
| consultation_drafts | user_id,subject,birth_info,updated_at |
| consultation_feedback | id,user_id,conversation_id,message_id,consultation_mode,verdict,reason_code,policy_version,engine_version,created_at,updated_at |
| consultation_reports | id,user_id,conversation_id,title,report_payload,status,report_version,model,created_at,updated_at,report_type |
| consultation_sessions | session_id,user_id,product_type,charge_id,status,successful_turn_count,turn_limit,price_duk,routing_policy_version,economy_policy_version,created_at,expires_at,updated_at |
| consultation_subjects | id,user_id,display_name,relationship,is_self,birth_info,created_at,updated_at |
| consumer_birth_profiles | id,owner_user_id,subject_label,display_name,gender,calendar_type,lunar_month_type,birth_year,birth_month,birth_day,birth_time_accuracy,birth_hour,birth_minute,approximate_time_period,birth_place,created_at,updated_at |
| content_assets | id,content_id,kind,status,provider,provider_job_id,prompt,model,aspect_ratio,duration_seconds,width,height,storage_path,external_url,error_code,last_error,metadata,created_by,created_at,updated_at |
| content_items | id,title,channel,source_type,famous_id,status,body,summary,tags,slug,category,hero_image_url,hero_alt,video_url,published_at,created_by,created_at,updated_at |
| content_publications | id,content_id,channel,status,scheduled_at,timezone,published_at,external_id,external_url,attempt_count,last_error,provider,idempotency_key,metadata,created_by,created_at,updated_at |
| content_versions | id,content_id,version,title,body,summary,source,provider,model,prompt_version,input_ref,token_usage,created_by,created_at |
| conversation_messages | id,conversation_id,role,content,client_message_id,created_at,seq,structured_result,follow_ups |
| conversations | id,user_id,subject_id,subject_snapshot,summary,last_summarized_message_id,created_at,updated_at,consultation_mode,compatibility_meta |
| daily_fortunes | id,user_id,subject_id,fortune_date,timezone,overall_tone,result_json,evidence_version,policy_version,model,created_at,updated_at,tier,semantic_version |
| duk_debt | id,user_id,amount,origin,revocation_id,resolved,created_at,resolved_at |
| duk_ledger | id,user_id,bucket,delta,reason,session_id,request_id,charge_id,purchase_id,expires_at,created_at,metadata |
| duk_reserve | session_id,user_id,amount,status,version,charge_id,expires_at,created_at,updated_at,reservation_id,request_id,product_type,alloc_plus,alloc_reward,alloc_paid |
| economy_policy | policy_version,welcome_reward,candle_reward,candle_cooldown_seconds,birthday_reward,general_session_cost,compatibility_session_cost,premium_report_cost,session_turn_limit,session_ttl_seconds,reserve_ttl_seconds,new_user_bonus_days,new_user_candle_bonus,plus_monthly_duk,plus_duk_expiry_seconds,compatibility_model_mode,effective_at,updated_at,is_active |
| email_campaigns | id,campaign_type,target_year,target_month,audience,template_version,subject,status,scheduled_at,created_by,total_count,sent_count,failed_count,skipped_count,created_at,updated_at,completed_at |
| email_deliveries | id,campaign_id,user_id,email,monthly_fortune_id,status,attempt_count,last_error_category,sent_at,created_at,updated_at |
| event_campaigns | campaign_id,reward_amount,starts_at,ends_at,per_user_limit,eligibility,is_active,created_at |
| event_claims | id,campaign_id,user_id,created_at |
| famous_ai_suggestions | id,famous_id,suggestion,provider,model,workload,prompt_version,created_by,created_at |
| famous_profiles | id,slug,name,category,occupation,short_description,bio,birth_info,birth_source,birth_source_note,status,is_public,seo_title,seo_description,canonical_url,index_policy,calculation_state,current_snapshot_id,created_by,created_at,updated_at,published_at |
| famous_snapshots | id,famous_id,birth_fingerprint,engine_version,rule_set_version,result,created_by,created_at |
| fortune_generation_leases | user_id,kind,period_key,subject_id,tier,semantic_version,lease_token,acquired_at,expires_at |
| global_generation_guard | guard_key,generation_enabled,hourly_limit,daily_limit,warning_thresholds,80,updated_at,updated_by |
| global_paid_generation_reservations | id,user_id,workload,units,created_at |
| global_reservation_requests | user_id,workload,request_id,reservation_id,created_at |
| in_app_notifications | id,user_id,category,title,body,deep_link_target,deep_link_id,dedup_key,read_at,created_at |
| life_events | id,user_id,subject_id,title,event_type,event_date,event_time,timezone,status,source,reminder_enabled,created_at,updated_at |
| monthly_fortunes | id,user_id,subject_id,fortune_year,fortune_month,timezone,overall_tier,result_json,evidence_version,plan_version,policy_version,model,created_at,updated_at,tier,semantic_version |
| notification_deliveries | id,notification_id,user_id,channel,status,attempt_count,last_error_category,dedup_key,created_at,updated_at,sent_at |
| notification_preferences | user_id,monthly_fortune,birthday,important_schedule,service_notice,marketing,created_at,updated_at |
| paid_request_idempotency | user_id,workload,request_id,status,lease_token,response_json,created_at,updated_at,expires_at |
| paid_work_reservations | id,user_id,workload,created_at |
| plus_entitlements | user_id,is_plus,started_at,expires_at,source,updated_at |
| popular_consultation_questions | id,question_text,analytics_key,category,is_active,display_order,created_at,updated_at |
| product_catalog | id,provider,store_product_id,internal_product_key,grant_type,grant_amount,lifetime_once,active,created_at |
| product_events | id,user_id,event_name,surface,consultation_mode,properties,created_at |
| profiles | id,display_name,created_at,updated_at,terms_version,terms_accepted_at,marketing_opt_in,marketing_opt_in_at |
| provider_connections | id,channel,status,external_account_id,external_account_name,connected_at,metadata,updated_at |
| purchase_revocations | id,user_id,external_revocation_id,external_transaction_id,amount,reversed_duk,debt_created,created_at |
| push_devices | id,user_id,device_id,platform,provider,push_token,enabled,last_seen_at,created_at,updated_at |
| report_shares | id,report_id,owner_user_id,token_hash,channel,status,opened_count,last_opened_at,expires_at,created_at,updated_at,revoked_at |
| scheduler_runs | id,job_type,occurrence_key,status,attempt_count,last_error_category,result,created_at,updated_at,completed_at |
| site_deploy_requests | id,reason,status,provider_status,detail,requested_by,created_at |
| support_inquiries | id,user_id,category,message,contact_email,app_version,platform,status,answer,answered_at,answered_by,created_at,updated_at |
| user_acquisition_attribution | user_id,first_ad_id,first_tracking_code,first_visitor_id,first_touch_at,latest_ad_id,latest_touch_at,signup_at,first_consultation_at,schema_version,created_at,updated_at |
| verified_purchases | id,user_id,provider,external_transaction_id,internal_product_key,granted_duk,created_at |
