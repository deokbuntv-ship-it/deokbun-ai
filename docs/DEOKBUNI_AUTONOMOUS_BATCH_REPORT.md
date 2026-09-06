# DEOKBUNI AUTONOMOUS BATCH REPORT
### J2 freeze → J3 retention infra → J4 monthly email ops → J5 admin economy/LLM

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` (base `baa1a96`) · **Nothing pushed.** Production `olvkpaldrwvtexxpoaag` never touched. All migrations additive + staging-only (`aephpsiurgkvqcswyeie`). Frozen engines/decision/prices intact. Owner WIP `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` never touched. No Codex.

## A. Git / Freeze
| Commit | Sprint |
|---|---|
| `8ac95aa` | 04E–05A backend (pre-req the J1 UI builds on) |
| `c88d026` | J1 consumer duk surface |
| `14ef8c1` | **J2 — consumer trust & first-use UX** |
| `e338161` | **J3 — retention scheduler + push infra** |
| `f1cfd48` | **J4 — monthly fortune email operations** |
| `a32491a` | **J5 — economy + LLM admin operations** |

Working tree clean except the deliberately-excluded `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md`.

## B. Sprint J3 — Retention infrastructure
- **Audit:** strong foundation already existed (4 retention tables incl. `push_devices` + `in_app_notifications` dedup, notification center, bell, deep-links, `birthday.ts`, `PushProvider`, admin overview). Reused, not duplicated.
- **Birthday:** `run_birthday_notifications(as_of)` creates exactly one notification per user per year (`dedup_key='birthday:<year>'`, Feb29→Feb28), records inapp + push deliveries, tolerates push failure.
- **Scheduler:** `scheduler_runs` substrate (exactly-once per occurrence, advisory-lock + unique-constraint idempotent).
- **Push:** provider abstraction + deterministic test adapter + pure delivery classification & bounded retry + DI client registration seam (lazy). Real provider EXTERNAL_BLOCKED.
- **Delivery history/retry:** `notification_deliveries` (PENDING/SENT/FAILED/SKIPPED_*), invalid-token disable.
- **Consent:** OS-permission vs service-preference vs marketing kept distinct; `sync_marketing_consent` trigger unifies `profiles.marketing_opt_in` → `notification_preferences.marketing`.
- **Admin:** `admin_notification_delivery_overview` (is_admin, no tokens).
- **Staging proof:** 2 May-12 SELF users → 2 birthday notifications exactly once across two runs (2nd `idempotent_skip`); admin overview fail-closed.
- **EXTERNAL_BLOCKED:** real push provider (expo-notifications + FCM/APNs); daily cron TRIGGER (pg_cron / scheduled edge).

## C. Sprint J4 — Monthly fortune email operations
- **Generation:** consumes the authoritative `monthly_fortunes` digest (no recompute, no LLM); `renderMonthlyEmail` carries the AI disclosure.
- **Provider abstraction:** interface + noop default + test adapter; email validity; delivery classification + bounded retry.
- **Admin operations:** `email_campaigns` + `email_deliveries` + RPCs create/build/schedule/**run**/record/cancel/retry/list/get. `run_email_campaign` is the single domain path for send-now + scheduled; `record` only PENDING→terminal (idempotent); cancel spares SENT; retry never re-sends SENT. Console rebuilt at `/admin/fortune-mail`.
- **Consent:** monthly email classified as a SERVICE notification (`notification_preferences.monthly_fortune`), not marketing — legal finality NOT claimed.
- **Staging proof (rolled back):** build→send (idempotent)→retry→cancel all correct; tables clean after.
- **EXTERNAL_BLOCKED:** real email provider (Resend/SendGrid/SES) + a send-worker.

## D. Sprint J5 — Economy + LLM admin operations
- **Duk admin:** `admin_economy_overview` / `admin_user_wallet` / `admin_list_duk_ledger` (read the append-only ledger, never analytics). Console `/admin/economy` (overview, wallet inspector, audited adjustment, audit log).
- **Admin adjustment:** `admin_adjust_duk` — audited, append-only `ADMIN_ADJUSTMENT` ledger row + `admin_audit_log` entry, debit-floor guard, no history edit/delete.
- **LLM usage/cost:** verified pricing repo (gpt-5-mini/nano, USD); **gpt-5.6-terra UNPRICED → "가격 미확인"**, never fabricated, no KRW without explicit FX; model-cost breakdown wired into `/admin/ai-usage`.
- **Spend guard:** audited only — healthy, fail-closed, unchanged.
- **Consultation inspector:** surfaces `consultation_decisions` scalars (versions/polarity/domain); **no chain-of-thought** (guard-tested).
- **Staging proof (rolled back):** fail-closed gate on all admin RPCs + adjustment ledger/audit mechanics + debit-floor guard. (A `sum(delta)`→`balance` bug in `admin_adjust_duk` was found and fixed in source + staging.)

## E. Quality (final gates @ `a32491a`)
- **TypeScript:** `tsc --noEmit` = **0 errors**
- **Jest:** **186 suites / 1818 tests PASS** (batch added retention, email, pricing, audit-guard, disclosure/error suites)
- **Builds:** `expo export --platform web` = **PASS** (new routes `/ai-notice`, `/admin/economy`, rebuilt `/admin/fortune-mail`)
- **Frozen core:** engines (myungri/qimen/ziwei) + consultation server/prompts/polarity + duk economy cores diff = **0**; Duk prices **unchanged** (display mirror = frozen 5/12/50/10/1)
- **Economy diagnostics:** **0/11** · **Notification diagnostics:** **0/6**

## F. Updated V1 Completion
Denominator = a **public production launch** (real providers + store + legal-final + real-device QA + red team = 100%). Estimated from current code:
```
BACKEND     = ~92%   (all core + retention/email/economy backends done + staging-proven; pending: provider workers, cron trigger, DEBT_OFFSET fix)
CLIENT_UI   = ~90%   (consumer + admin surfaces complete; pending: real push token acquisition, production-like analytics check, device QA)
OPS_ADMIN   = ~88%   (economy/email/usage-cost/inspector consoles live; pending: a few system-settings toggles, windowed cost, admin-JWT live smoke)
RETENTION   = ~78%   (substrate + birthday job proven; pending: real push delivery, daily cron trigger, monthly/life-event notification jobs)
RELEASE     = ~45%   (legal drafts, bundle ids, error boundary done; gated by store 05B, EAS/native build, prod promotion, red team, legal review)
OVERALL_V1  = ~82%
```

## G. Remaining BLOCKER
None.

## H. Remaining HIGH
1. **`DEBT_OFFSET` not in the `duk_ledger` reason CHECK** — the frozen IAP `record_revocation` (`20260834_iap.sql:100`) emits `reason='DEBT_OFFSET'`, which the CHECK rejects → refund→debt-offset would fail. Latent (05B store deferred). NOT patched (frozen financial constraint — owner decision). Fix = additive migration widening the CHECK.

## I. Remaining MEDIUM
1. Home silently swallows section fetch errors (never blank; no error affordance).
2. No post-onboarding consent re-management screen (marketing opt-in only set at onboarding).
3. Admin operator screens still show some raw terms (errorCode/"Edge Function"/UUIDs) — operator-facing, out of consumer scope.
4. Monthly/life-event notification-creation jobs not yet wired (only the birthday job exists; `createIfAbsent` is ready).
5. Server-side windowed LLM cost aggregation (today/7d/30d) — only per-page breakdown today.

## J. EXTERNAL_BLOCKED
Real push provider (expo-notifications + FCM/APNs) · real email provider (Resend/SendGrid/SES) + send-worker · daily scheduler cron trigger (pg_cron / scheduled edge) · production-like client-analytics live check.

## K. DEFERRED
Activation 05B store provisioning (Apple/Google seller, real products, sandbox purchase→refund→debt) — deferred to preserve 예비창업자 eligibility · Codex final Red Team (reserved for post-store-sandbox) · EAS/native packaging · production promotion · legal review of drafts + monthly-email consent classification.

## L. OWNER ACTION REQUIRED
1. **DEBT_OFFSET CHECK fix** — WHEN: before enabling store refunds (05B). WHY: frozen IAP would fail the ledger constraint. ACTION: apply an additive migration widening `duk_ledger_reason_check` to include `'DEBT_OFFSET'`.
2. **Apply the batch migrations to production** (when promoting) — WHEN: at production promotion. WHY: 20260840/41/42 are staging-only. ACTION: `db push` against prod after review (currently applied to staging only).
3. **Push provider** — WHEN: to enable real push. WHY: EXTERNAL_BLOCKED. ACTION: add `expo-notifications` + FCM/APNs credentials (Supabase secrets), inject the real `TokenAcquirer` + provider, deploy a worker consuming PENDING push deliveries.
4. **Email provider** — WHEN: to send real monthly emails. WHY: EXTERNAL_BLOCKED. ACTION: configure a provider (credentials), inject into `getEmailProvider()`, deploy a send-worker; then legal-review the consent classification.
5. **Scheduler trigger** — WHEN: to auto-fire birthday/monthly jobs. WHY: substrate exists, no daily trigger. ACTION: enable `pg_cron` (or a scheduled edge function) to invoke `run_birthday_notifications()` / `run_email_campaign()`.
6. **Admin-JWT live smoke** — WHEN: before relying on admin consoles in prod. WHY: authorized-read paths are code-verified + gate-proven, not live-run (no admin JWT here). ACTION: sign in as an `admin_users` member and exercise `/admin/economy` + `/admin/fortune-mail`.

*(No secret values were requested or handled; no secrets are in any file.)*

## M. Recommended Next Sprint
**J6 — Provider activation & scheduling** (owner-gated): wire the real push + email providers + send-workers, enable the daily scheduler trigger, add monthly/life-event notification jobs, and apply the DEBT_OFFSET fix — then a production-like analytics live check. (Store 05B + Codex red team remain deferred.)

---

### Exact verdicts
```
J2_LOCAL_FREEZE            = PASS   (14ef8c1)
J3_RETENTION_INFRA         = PASS   (e338161)
BIRTHDAY_EXACTLY_ONCE      = PASS
BIRTHDAY_SCHEDULER         = PASS   (substrate+job proven; daily cron trigger = owner/EXTERNAL)
PUSH_PROVIDER_ABSTRACTION  = PASS
PUSH_PROVIDER_LIVE         = EXTERNAL_BLOCKED
J4_MONTHLY_EMAIL           = PASS   (f1cfd48)
EMAIL_PROVIDER_LIVE        = EXTERNAL_BLOCKED
J5_ADMIN_ECONOMY           = PASS   (a32491a)
J5_LLM_OPERATIONS          = PASS
FROZEN_CONSULTATION_CORE   = YES
CLIENT_CAN_GRANT_DUK_DIRECTLY = NO
ECONOMY_DIAGNOSTICS        = PASS   (0/11)
PRODUCTION_MUTATIONS       = 0
NOTHING_PUSHED             = YES
```

**AUTONOMOUS_BATCH_COMPLETE**

DEOKBUNI_AUTONOMOUS_BATCH_COMPLETE
