# DEOKBUNI SPRINT J3 — RETENTION INFRASTRUCTURE REPORT
## Birthday + Push + Scheduler

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` · Additive, staging-only. Nothing pushed. Frozen core untouched.

## Audit (J3.1)
Strong foundation already existed (REUSED, not duplicated): 4 retention tables (`notification_preferences`, `life_events`, `push_devices`, `in_app_notifications` — the last with a `unique(user_id, dedup_key)` idempotency key), the in-app notification center + bell/badge, the deep-link allowlist, `birthday.ts` (KST + Feb29→Feb28), the `PushProvider` interface + `pushDeviceService`, and the read-only admin retention overview. **Gaps closed by J3:** scheduler substrate, birthday notification job, delivery history/retry, push registration seam, marketing-consent unification.

## Migration `20260840000000_retention_scheduler.sql` (additive, applied to STAGING only)
- **`scheduler_runs`** — one row per `(job_type, occurrence_key)`; exactly-once run tracking + audit.
- **`notification_deliveries`** — per `(user, channel, dedup_key)` delivery outcome + history (PENDING/SENT/FAILED/SKIPPED_*); no push token stored.
- **`run_birthday_notifications(as_of)`** — the daily job: finds SELF subjects matching the KST civil date (Feb29→Feb28 in non-leap years), gated by `notification_preferences.birthday`, creates exactly one `in_app_notification` per user per year (`dedup_key='birthday:<year>'`), records an inapp delivery (SENT) + a push delivery intent (PENDING/SKIPPED_*). Idempotent (advisory lock + unique constraints); tolerates provider failure (notification truth never depends on push).
- **`record_notification_delivery_result(...)`** — the push worker records outcomes; disables the device on invalid token (rotation-safe).
- **`admin_notification_delivery_overview()`** — `is_admin()`-gated, counts + recent runs, **no tokens/bodies**.
- **`sync_marketing_consent`** trigger — mirrors `profiles.marketing_opt_in` (the consent record of truth) into `notification_preferences.marketing` so they never diverge.
- All base tables RLS-enabled with **no client policy**; run/record are service-role only; overview is `is_admin`-gated.

## Client / domain (TS)
- `notificationTypes.ts` — normalized `NotificationType` (BIRTHDAY/MONTHLY_FORTUNE_READY/LIFE_EVENT/TURNING_POINT/SYSTEM + separate MARKETING) → stored category + deep link + consent key.
- `push/pushDelivery.ts` — pure classification + **bounded** retry (transient retries to a cap; invalid token → disable, never retry; not_configured stays PENDING; permanent fails).
- `push/testPushProvider.ts` — deterministic test adapter.
- `push/pushRegistration.ts` — DI client seam (`registerForPush`/`unregisterOnLogout`); lazy (not at startup); real token acquirer is EXTERNAL_BLOCKED, degrades to `unavailable`.
- Wired the defined-but-unused `birthday_message_opened` analytics event on the Home birthday card.

## Consent (J3.6)
Three distinct concepts kept separate: OS push permission (device), service notification preference (`notification_preferences` service flags), and marketing consent (`profiles.marketing_opt_in`, now mirrored). A service notification never rides marketing consent and vice-versa.

## Staging proof (J3.19) — persisted test data on staging `aephpsiurgkvqcswyeie`
Two SELF subjects born May 12 → `run_birthday_notifications('2026-05-12')`:
- Run 1: `eligible=2, notifications_created=2, inapp_deliveries=2, push skipped_no_token=2` (no devices registered).
- Run 2: `idempotent_skip=true`.
- After two runs: **exactly 2** birthday notifications (not 4), 2 inapp + 2 push deliveries, 1 scheduler run COMPLETED (attempt_count 1). → **BIRTHDAY_EXACTLY_ONCE proven.**
- `admin_notification_delivery_overview()` called without an admin identity → raised `not authorized` (**fail-closed**).

## Gates
tsc **0** · jest **182 suites / 1804 tests** · web export **PASS** · frozen diff **0** · economy diagnostics **0/11** · notification diagnostics **0/6**.

## Verdicts
- J3_RETENTION_INFRA = **PASS**
- BIRTHDAY_EXACTLY_ONCE = **PASS**
- BIRTHDAY_SCHEDULER = **PASS** (substrate + job proven; the daily cron TRIGGER that invokes it is owner/EXTERNAL — pg_cron enable or a scheduled Edge function)
- PUSH_PROVIDER_ABSTRACTION = **PASS**
- PUSH_PROVIDER_LIVE = **EXTERNAL_BLOCKED** (needs `expo-notifications` native dep + FCM/APNs credentials)
- FROZEN_CONSULTATION_CORE = YES · PRODUCTION_MUTATIONS = 0

## Owner action (deferred, non-blocking)
1. Schedule the daily invocation of `run_birthday_notifications()` (enable `pg_cron` on staging/prod, or deploy a scheduled Edge function). 2. Add `expo-notifications` + FCM/APNs credentials to enable real push (then wire the real `TokenAcquirer` + a push-send worker that consumes PENDING deliveries via `record_notification_delivery_result`).
