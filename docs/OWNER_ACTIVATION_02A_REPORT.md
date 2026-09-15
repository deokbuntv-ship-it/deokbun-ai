# OWNER ACTIVATION 02A REPORT

> Option A — staging baseline bootstrap + resumed migrations. **Staging only.** Production
> `olvkpaldrwvtexxpoaag` never touched. No `db reset`, no `migration repair`, no genesis migrations, no seed
> data, no Edge deploy.

## 1. Main / Staging Target Confirmation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (production, unchanged throughout). `ACTIVATION_WORKTREE_TARGET =
aephpsiurgkvqcswyeie` (staging). All mutation ran from the isolated worktree `C:\Development\DeokbunAI-staging-activation`.

## 2. ADMIN_SETUP Audit (`docs/admin/ADMIN_SETUP.sql`)
`admin_users` table (REQUIRED_BASE) + RLS + self-read policy (SAFE_SUPPORTING) + `is_admin()` SECURITY DEFINER
function (REQUIRED_BASE) + grants (SAFE_SUPPORTING). The "grant admin" INSERT is inside a comment → **not
executed**. 0 seed, 0 destructive.

## 3. ADMIN_04_SETUP Audit (`docs/admin/ADMIN_04_SETUP.sql`)
`ai_usage_logs` table (REQUIRED_BASE, the object `20260818000000` ALTERs) + index + RLS (no client policy) +
`admin_dashboard_overview()` / `admin_list_ai_usage()` SECURITY DEFINER RPCs (SAFE_SUPPORTING, is_admin-gated;
depend on consultation_subjects/conversations which the applied consumer migrations provide). `begin/commit`
wrapper. 0 seed, 0 destructive.

## 4. Minimum Baseline Applied
`tmp/staging-admin-baseline.sql` (worktree-only, NOT a migration, NOT committed) = exact concatenation of the two
files. Applied via `supabase db query --linked --project-ref aephpsiurgkvqcswyeie`. Created: 2 tables
(admin_users, ai_usage_logs), 3 functions (is_admin, admin_dashboard_overview, admin_list_ai_usage), 1 policy,
1 index.

## 5. Seed Rows Applied
**0** (admin_users row count verified = 0 post-apply).

## 6. Destructive Statements Applied
**0** (only `create … if not exists` / `create or replace` / `alter … enable rls` / `create policy` / grants;
the sole `drop` is `drop policy if exists`, idempotent policy management — no data loss).

## 7. Base Objects Verified
`admin_users` (0 rows), `ai_usage_logs` (12 base columns, pre-telemetry), `is_admin()` + 2 admin RPCs — all
present.

## 8. Migration Dry Run
`db push --dry-run` → 26 pending, `20260818000000 … 20260836000000`, in order, seeds [], roles []. The 4
consumer-core migrations remained applied. No unexpected/missing/reordered.

## 9. Migration Push Result
`db push --yes` → **all 26 applied successfully**, no errors. `20260818000000_ai_usage_logs_telemetry` (the prior
failure) and all downstream (incl. `is_admin`-dependent `20260824/26/28` and the full monetization chain
`20260829–20260836`) applied cleanly.

## 10. Final Migration History
`schema_migrations` = **30 recorded**; `db push --dry-run` → **"Remote database is up to date"** (0 pending, no
divergence).

## 11. Schema Objects
14/14 verified present: consultation_decisions, duk_ledger, duk_debt, duk_reserve, economy_policy,
consultation_sessions, candle_state, product_catalog, verified_purchases, purchase_revocations, product_events,
ai_usage_logs, admin_users, global_reservation_requests. `economy_policy` has 1 active row (`economy@1.0.0`).

## 12. RPCs
13/13 verified present: is_admin, complete_consultation_request_with_decision, spend_duk, grant_duk,
reserve_session_duk, commit_session_reservation, release_session_reservation, complete_consultation_with_billing,
light_candle, record_product_event, record_verified_purchase, record_revocation, reserve_global_paid_generation_idem.

## 13. RLS / Grants
- `product_events` INSERT/ALL policies = **0** → client direct arbitrary INSERT **DENIED** (20260835 revoke
  confirmed live); `record_product_event` RPC present (validated path).
- Duk/decision/purchase tables (duk_ledger/debt/reserve, consultation_decisions, verified_purchases,
  purchase_revocations) client write policies = **0** → client direct mutation **DENIED** (service-role RPCs only).
- RLS enabled on all sensitive tables = **true**.

## 14. Economy Diagnostics
All invariants **0 / PASS** on pristine staging: negative balance 0, duplicate purchase 0, duplicate revocation
0, multiple charge 0, stale reserve 0, negative ledger supply none. No artificial records inserted.

## 15. Billing Flag
`DUK_BILLING_ENABLED` = **OFF** (unset; staging secrets empty).

## 16. Global Idempotency Flag
`GLOBAL_REQ_IDEMPOTENCY_ENABLED` = **OFF** (unset). No Apple/Google secrets. No Edge deployed.

## 17. Reproducibility Debt Note
Created `docs/MIGRATION_REPRODUCIBILITY_DEBT.md` — records the out-of-band history (ai_usage_logs, is_admin/
admin_users) + future cleanup options. Not addressed now (per §15).

## 18. Production Mutation Count
**0.** Every mutation targeted staging via the worktree (`db query --linked --project-ref aephpsiurgkvqcswyeie`,
`db push` from the staging-linked worktree). Main repo stayed linked to production; main config.toml unchanged.

## 19. BLOCKER
None. The Activation-02 blocker (missing ai_usage_logs) is resolved.

## 20. HIGH
None new. (The reproducibility debt is documented as a future, non-blocking cleanup.)

## 21. MEDIUM
- Staging Edge secrets are empty — before Activation 03 (Edge deploy + smoke): set OPENAI_API_KEY,
  LLM_MODEL_TERRA (+ optional LLM_MODEL_MINI/COMPATIBILITY_MODEL_MODE). Billing flags stay OFF.
- config.toml `[functions.*]` blocks for the 3 new functions are in the main WORKING TREE (uncommitted,
  owner-dirty) — needed for Activation 03 deploy.

## 22. Owner Action Required
None to complete the DB phase. To proceed to **Activation 03** (Edge deploy): decide when to set staging secrets
+ deploy chat/verify-purchase/apple-notifications-v2/google-rtdn with billing flags OFF, then smoke-test the
legacy consultation path. (Do not deploy automatically.)

---

Required expectations: **SEED ROWS APPLIED = 0 · DESTRUCTIVE STATEMENTS APPLIED = 0 · PRODUCTION MUTATIONS = 0.**

STAGING_DATABASE_ACTIVATED_SUCCESSFULLY

OWNER_ACTIVATION_02A_COMPLETE
