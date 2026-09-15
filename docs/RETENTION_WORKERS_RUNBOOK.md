# Retention Workers Runbook (Sprint J6)

Provider-independent execution layer for retention/email delivery. **Nothing here is activated in production by this batch** — this is the config/runbook for the owner to enable later. All workers are FAIL-CLOSED (no `CRON_SECRET` → 401; no provider → NOT_CONFIGURED, never a fabricated SENT).

## Workers (Edge functions, `supabase/functions/*`, `verify_jwt=false`)
| Function | Does | Cadence |
|---|---|---|
| `run-scheduled-notifications` | `run_birthday_notifications()` (business truth) → send PENDING push → record | daily |
| `run-email-campaigns` | execute due SCHEDULED campaigns → send PENDING email → record | configured runs |
| `retry-notification-deliveries` | re-attempt PENDING push (bounded) | e.g. hourly |
| `retry-email-deliveries` | re-attempt PENDING email (bounded) | e.g. hourly |

Architecture: **scheduler trigger → worker → business truth (DB RPC) → provider adapter**. The notification/campaign TRUTH is created by the DB job and never depends on provider success; the provider send is isolated per delivery and recorded via the concurrency-safe `record_*_delivery_result` (PENDING→terminal exactly once).

## Auth (J6.5) — fail closed
Each worker requires the `x-cron-secret` request header to equal the `CRON_SECRET` secret. Without `CRON_SECRET` set, every call returns 401. These are **not** consumer actions — normal authenticated users cannot invoke them (no user JWT path; the DB claim RPCs are `service_role`-only, and `record_*` guards on PENDING). Do **not** commit any secret.

```bash
# owner, staging (names only — set the real value in your shell, never in the repo)
supabase secrets set CRON_SECRET=<random-64-hex> --project-ref aephpsiurgkvqcswyeie
```

## Providers (J6.7/J6.8) — default NOT_CONFIGURED (EXTERNAL_BLOCKED)
- **Push:** activate the Expo adapter with `PUSH_PROVIDER=expo`. The `ExponentPushToken` is the per-device credential; without the flag the worker leaves deliveries PENDING (never SENT). FCM/APNs credentials belong to the native build (a separate owner step).
- **Email:** set `EMAIL_PROVIDER=<vendor>` + that vendor's credential and attach the adapter in `run-email-campaigns`/`retry-email-deliveries` `sendEmail`. Until then: NOT_CONFIGURED (never SENT). No vendor is hard-wired.

## Scheduling (J6.9) — template, NOT activated
Option A — Postgres `pg_cron` + `pg_net` (staging/prod DB), calls the Edge function with the secret header:
```sql
-- OWNER, per environment. Requires the pg_cron + pg_net extensions enabled on the project.
select cron.schedule('birthday-daily', '0 0 * * *', $$
  select net.http_post(
    url := 'https://<project-ref>.functions.supabase.co/run-scheduled-notifications',
    headers := jsonb_build_object('x-cron-secret', current_setting('app.cron_secret', true)),
    body := '{}'::jsonb);
$$);
select cron.schedule('email-campaigns',        '*/15 * * * *', $$ ... run-email-campaigns ... $$);
select cron.schedule('retry-notifications',    '30 * * * *',   $$ ... retry-notification-deliveries ... $$);
select cron.schedule('retry-emails',           '45 * * * *',   $$ ... retry-email-deliveries ... $$);
```
Option B — a platform scheduled-function trigger (if enabled) hitting the same endpoints with the `x-cron-secret` header.

Do **not** run production cron in this batch. Staging cron may be enabled by the owner once `CRON_SECRET` is set (no external account needed for the Expo push flag; email still needs a vendor).

## Admin visibility + retry (J6.10 / J6.11)
- Delivery/scheduler visibility: `admin_notification_delivery_overview()` (counts by channel:status + recent `scheduler_runs`) and the email campaign consoles (`admin_list_email_campaigns` / `admin_get_email_campaign`).
- Retry (is_admin, audited): `admin_retry_failed_push_deliveries(dedup_key?)` and `admin_retry_failed_email_deliveries(campaign_id)` reset FAILED→PENDING (attempt budget reset), never touching SENT, and write an `admin_audit_log` row.

## Idempotency / concurrency (J6.6)
- Notifications: exactly one per user per occurrence (`in_app_notifications` unique `(user_id, dedup_key)` + the birthday job's advisory lock).
- Deliveries: `record_*_delivery_result` transitions a row out of PENDING **once** (guard) → repeated/concurrent worker runs never double-record or re-mark a SENT delivery.
- Single-send-under-concurrency (avoiding two workers double-*sending* the same PENDING row to the provider) is a future refinement (a claim that marks rows CLAIMED); not needed while providers are EXTERNAL_BLOCKED.
