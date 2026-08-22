# DeokbunAI V1 — Production Promotion Runbook (Sprint J7)

**PREPARED, NOT EXECUTED.** Production `olvkpaldrwvtexxpoaag` has NOT been touched by any autonomous batch. This is the exact ordered runbook for the owner to promote the staging-validated state to production. Do not run any step until the owner decides to launch.

## 0. Preconditions
- All batch commits reviewed (`8ac95aa` … `<J7 head>`), tests green, staging validated.
- Provider decisions made (push/email) or accepted as post-launch. Store (05B) explicitly in/out.
- A maintenance/rollback window agreed.

## 1. Backup / preflight
1. `npm run release-preflight` (see scripts/release-preflight.mjs) → must exit 0.
2. Snapshot production DB (Supabase dashboard → Database → Backups) BEFORE any migration.
3. Confirm `git log` on the release commit; confirm frozen-engine diff = 0.

## 2. Migration ordering (production)
Apply the batch migrations to prod **in order**, each dry-run first:
```
20260840 retention_scheduler → 20260841 monthly_email_ops → 20260842 admin_economy_ops
→ 20260843 duk_ledger_debt_offset_reason → 20260844 retention_workers
```
- Link prod: `supabase link --project-ref olvkpaldrwvtexxpoaag` (separate checkout).
- `supabase db push --dry-run` → confirm ONLY these are pending → `supabase db push`.
- Also ensure the earlier staging-applied migrations (…20260839) are present in prod (they may already be); reconcile via `migration list` — **no repair/reset**; investigate any divergence before proceeding.

## 3. Edge deployment
Deploy the Edge functions changed/added: `chat` (if changed), the 4 retention workers (`run-scheduled-notifications`, `run-email-campaigns`, `retry-notification-deliveries`, `retry-email-deliveries`), and any IAP seams. `supabase functions deploy <name> --project-ref olvkpaldrwvtexxpoaag`.

## 4. Secrets (names only — set real values in the dashboard/CLI, never in the repo)
- Required: `OPENAI_API_KEY`, `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (platform), OAuth (Naver/Kakao/Google) configs.
- Retention: `CRON_SECRET` (required to enable workers); `PUSH_PROVIDER=expo` + FCM/APNs; `EMAIL_PROVIDER` + credentials.
- Store (if 05B): `APPLE_*` / `GOOGLE_PLAY_*`.

## 5. Flags
- `DUK_BILLING_ENABLED` — decide on/off for launch (validated on staging).
- `GLOBAL_REQ_IDEMPOTENCY_ENABLED` — on.
- Global spend guard (`set_global_generation_guard`) — set limits; keep fail-closed.

## 6. Scheduling
Enable cron only after secrets are set (see RETENTION_WORKERS_RUNBOOK.md). Start with retries paused; enable after a manual worker smoke.

## 7. Smoke tests (prod, minimal, owner-run)
- Auth login (each provider) → onboarding → SELF birth → Welcome 10덕 (verify server grant).
- One general consultation (verify 5덕 charge once, answer, AI disclosure).
- Economy diagnostics = 0 (read-only). Notification/email diagnostics = 0.
- Admin console loads for an admin_users member.

## 8. Monitoring / analytics
- Confirm `ai_usage_logs` receiving rows; `product_events` receiving categorical events (no PII).
- Watch error boundary / logs (PII-safe) for the first hours.

## 9. Rollback / disable path
- Kill switch: `set_global_generation_guard(false, …)` stops paid LLM generation immediately.
- Billing: flip `DUK_BILLING_ENABLED=false`.
- Workers: unschedule cron / unset `CRON_SECRET`.
- DB: migrations are additive; a bad function can be reverted via a forward `create or replace` migration (NOT `db reset`). Restore from the §1 backup only as a last resort.

## 10. Post-promotion
- Re-run economy/notification/email diagnostics (0 expected).
- Confirm `PRODUCTION_MUTATIONS` are only the intended ones.
- Schedule the Codex final Red Team (reserved) after store-sandbox billing/refund E2E, if 05B is in scope.
