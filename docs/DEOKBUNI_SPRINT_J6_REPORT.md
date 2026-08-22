# DEOKBUNI SPRINT J6 — FINANCIAL INTEGRITY + RETENTION WORKERS REPORT

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` · Additive, staging-only. Nothing pushed. Frozen core + product/billing semantics untouched.

## A. Financial integrity — DEBT_OFFSET (PRIORITY-0)
**Confirmed bug:** `record_verified_purchase` (`20260834_iap.sql:100`) offsets outstanding `duk_debt` from a new PAID purchase by writing `duk_ledger.reason='DEBT_OFFSET'`, but that value was **not** in the `duk_ledger` reason CHECK → a paying user *with prior debt* would have their entire purchase transaction fail.

**Fix (`20260843000000_duk_ledger_debt_offset_reason.sql`, applied to staging):** widens ONLY the reason CHECK to add `'DEBT_OFFSET'` (drop-if-exists + re-add, non-destructive). No change to spend order, refund/revocation policy, reward/plus behavior, debt visibility, or IAP authority.

**Staging proof (BEGIN/ROLLBACK, nothing persisted)** — scenarios A–H:
- prior debt 15 + new PAID purchase 20 → `{granted:20, debt_offset:15}`, DEBT_OFFSET ledger row `-15`, debt→0, residual 5 (B/C/D)
- repeat same purchase txn → `already:true`, **no duplicate offset** (H)
- revocation exceeding PAID → creates debt (A); repeat revocation → `already:true` (G)
- REWARD grant with debt → debt unchanged, reward usable (E); PLUS grant with debt → debt unchanged (F)
- **no negative visible balance**

Debt policy preserved: refund/revocation may create `duk_debt`; a future PAID grant offsets it (DEBT_OFFSET); REWARD stays usable and never offsets; PLUS never auto-offsets.

## B. Retention execution workers
- **Pure worker orchestrators (unit-tested):** `pushWorker.processPushDeliveries` + `emailWorker.processEmailDeliveries` — DI over provider + recorder. Guarantees: business truth never corrupted by a provider; a NOT_CONFIGURED provider leaves deliveries PENDING and **never** marks SENT; already-terminal rows skipped (idempotent); provider throw/error isolated + bounded retry; invalid token disables the device.
- **DB seam (`20260844000000_retention_workers.sql`, applied to staging):** `claim_pending_push_deliveries` / `claim_pending_email_deliveries` (service-role feeds); a **concurrency guard** added to `record_notification_delivery_result` (transition out of PENDING exactly once — matches the email one); `admin_retry_failed_push_deliveries` (audited) + `admin_retry_failed_email_deliveries` enhanced (attempt reset + audit).
- **Edge worker seams (`supabase/functions/*`, fail-closed, NOT deployed):** `run-scheduled-notifications`, `run-email-campaigns`, `retry-notification-deliveries`, `retry-email-deliveries`. CRON_SECRET-authenticated (§6.5 — 401 without the secret; not consumer actions); providers default NOT_CONFIGURED (§6.7/§6.8 — Expo push behind `PUSH_PROVIDER=expo`, email behind `EMAIL_PROVIDER`; neither fakes SENT). Config blocks added to `config.toml`; scheduling template in `docs/RETENTION_WORKERS_RUNBOOK.md` (§6.9 — NOT activated).
- **Admin visibility/retry (§6.10/§6.11):** reused `admin_notification_delivery_overview` + email consoles; added audited push retry; both retry paths never re-send SENT.

**Staging proof (BEGIN/ROLLBACK):** claim feed returns the PENDING push delivery with token+message; `record` PENDING-guard → `record_first:true, record_second_noop:false` (concurrency-safe); admin push retry FAILED→PENDING + 1 audit row.

## Gates
tsc **0** · jest **189 suites / 1833 tests** (+debtOffsetReason, pushWorker, emailWorker) · web export **PASS** · frozen diff **0** · economy **0/11** · notification **0/6** · email **0/4**.

## Verdicts
- DEBT_OFFSET_FINANCIAL_INTEGRITY = **PASS**
- RETENTION_WORKERS = **PASS** (provider-independent; DB seam + pure workers + Edge seams)
- SCHEDULER_IDEMPOTENCY = **PASS** (dedup + PENDING-guard proven; concurrency-safe truth)
- PUSH_PROVIDER_LIVE = **EXTERNAL_BLOCKED** · EMAIL_PROVIDER_LIVE = **EXTERNAL_BLOCKED**
- FROZEN_CONSULTATION_CORE = YES · PRODUCTION_MUTATIONS = 0

## Owner action (deferred, non-blocking)
1. Set `CRON_SECRET` (staging/prod) to enable the workers; schedule via `pg_cron`/scheduled functions per the runbook. 2. Set `PUSH_PROVIDER=expo` (+ native FCM/APNs) and `EMAIL_PROVIDER`+credentials to activate real delivery. 3. Apply migrations 20260843/44 to production at promotion.
