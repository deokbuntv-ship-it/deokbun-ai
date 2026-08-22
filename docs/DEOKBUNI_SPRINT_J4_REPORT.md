# DEOKBUNI SPRINT J4 — MONTHLY FORTUNE EMAIL OPERATIONS REPORT

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` · Additive, staging-only. Nothing pushed. Frozen core untouched.

## Objective
Provider-independent monthly-fortune email operations: generate (from the existing engine's output), preview, build audience, schedule, send-now, cancel, retry, delivery history, consent enforcement, version/audit tracking. Real email provider is EXTERNAL.

## Migration `20260841000000_monthly_email_ops.sql` (applied to STAGING only)
- **`email_campaigns`** (the job): DRAFT/SCHEDULED/PROCESSING/SENT/PARTIAL/FAILED/CANCELLED + target year/month, template_version, subject, created_by, counts, scheduled_at.
- **`email_deliveries`** (per recipient): PENDING/SENT/FAILED/SKIPPED_NO_CONSENT/SKIPPED_INVALID_EMAIL/SKIPPED_NO_FORTUNE/CANCELLED + attempt/error/sent_at + `monthly_fortune_id` (the consumed digest); `unique(campaign_id, user_id)` idempotency. `email` stored operationally, admin-only.
- **RPCs** (is_admin OR service_role; RLS-locked tables): `admin_create_email_campaign`, `admin_build_email_recipients` (resolves eligibility → PENDING/SKIPPED_* per consent + valid email + has-fortune), `admin_schedule_email_campaign`, `run_email_campaign` (same domain path for send-now + scheduled; idempotent), `record_email_delivery_result` (only PENDING→terminal; recomputes campaign status), `admin_cancel_email_campaign` (unsent→CANCELLED, sent untouched), `admin_retry_failed_email_deliveries` (FAILED→PENDING, never re-sends SENT), `admin_list/get_email_campaign` (no per-recipient emails in list).

## Domain (TS, pure, provider-independent)
- `email/emailProvider.ts` — `EmailProvider` interface + `noopEmailProvider` (default) + `createTestEmailProvider` (deterministic).
- `email/emailValidation.ts` — email syntax validity (mirrors the SQL check).
- `email/emailDelivery.ts` — classification + bounded retry (invalid→skip, transient→retry to cap, not_configured→PENDING, permanent→FAILED).
- `email/emailContent.ts` — `renderMonthlyEmail(record)` consumes the authoritative `MonthlyFortuneRecord` digest (NO recompute, NO LLM), carries the AI disclosure, excludes birth/prompt/evidence.

## Consent (J4.6) — implemented classification
A monthly-fortune email is treated as a **SERVICE notification** gated by `notification_preferences.monthly_fortune` (default true), NOT marketing. Users without that preference are recorded `SKIPPED_NO_CONSENT`. This is the implemented classification; **legal finality is NOT claimed** (LEGAL_REVIEW_REQUIRED before public send).

## Admin UI
`src/app/admin/fortune-mail/index.tsx` rewritten as the campaign console (existing sidebar route "운세우편 관리"): create form (year/month/subject → create + build, shows 대상/제외 counts), synthetic no-send preview (`renderMonthlyEmail`), campaigns table (status + counts), per-campaign actions (schedule / send-now / cancel / retry) + delivery-status breakdown. Loading/empty/error/retry states; all action buttons disable while in flight (double-submit safety). is_admin-gated by the admin layout; no PII in lists; no raw backend terms.

## Staging proof (J4.15) — full lifecycle, auto-rolled-back (nothing persisted)
Synthetic monthly fortune for a real staging user → `admin_create_email_campaign` → `run_email_campaign`:
- `pending_after_build = 1` (recipient resolved from the digest + consent + valid email).
- `record_email_delivery_result(SENT)` → `record_first=true`; re-record → `record_idempotent=false`; campaign `status=SENT, sent_count=1`.
- FAILED → `admin_retry_failed_email_deliveries` → `retry_count=1`, delivery back to `PENDING` (no re-send of SENT).
- 2nd campaign → build → `admin_cancel_email_campaign` → `cancel_count=1`, `status=CANCELLED`.
- Final rollback left `email_campaigns`/`email_deliveries`/`monthly_fortunes` at 0 rows. No real email sent (provider is noop/EXTERNAL); no real user emailed.

## Gates
tsc **0** · jest **184 suites / 1813 tests** · web export **PASS** · frozen diff **0** (engines/consult-core/duk-prices/monthly-engine) · economy diagnostics **0/11**.

## Verdicts
- J4_MONTHLY_EMAIL = **PASS**
- EMAIL_PROVIDER_LIVE = **EXTERNAL_BLOCKED** (no Resend/SendGrid/SES credentials; the noop provider is the default; a real provider + a send-worker that consumes PENDING deliveries via `record_email_delivery_result` is the owner step)
- FROZEN_CONSULTATION_CORE = YES · PRODUCTION_MUTATIONS = 0

## Owner action (deferred, non-blocking)
1. Choose + configure an email provider (credentials), inject it into `getEmailProvider()`, and deploy a send-worker that reads PENDING `email_deliveries`, renders via `renderMonthlyEmail`, sends, and calls `record_email_delivery_result`. 2. Schedule campaign execution via the J3 scheduler substrate. 3. Legal review of the monthly-email consent classification before any public send.
