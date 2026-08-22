# OWNER ACTIVATION 02 — STAGING DATABASE REPORT

> Staging-only mutation, isolated worktree. **Migration apply STOPPED on a failure** (reproducibility gap).
> No repair/skip/reset/manual-SQL performed. Production `olvkpaldrwvtexxpoaag` never touched.

## 1. Local Starting HEAD
`8ead1da` → local cleanup commit `38025a9` (env-name normalization). Worktree created from `38025a9`.

## 2. Local Cleanup Changes
- §1B env-name normalization (committed `38025a9`): `APPLE_BUNDLE_ID → APPLE_IAP_BUNDLE_ID` (apple-notifications-v2,
  adapters doc, owner setup); `GOOGLE_PLAY_SERVICE_ACCOUNT → GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (google-rtdn,
  adapters doc, owner setup). tsc 0, 70 duk tests pass, frozen ZERO.
- §1A config.toml `[functions.*]` blocks for verify-purchase (verify_jwt=true) / apple-notifications-v2
  (verify_jwt=false) / google-rtdn (verify_jwt=false) added to the WORKING TREE of main (owner-dirty, left
  uncommitted — needed for Activation 03 Edge deploy, not for this DB phase).

## 3. Config Auth Settings
verify-purchase = JWT on; apple-notifications-v2 / google-rtdn = JWT off (stores post no Supabase JWT; each
verifies the store signature/OIDC + re-fetches authoritative state internally — no unauthenticated mutation path).

## 4. Canonical Env Names
Apple bundle id = **`APPLE_IAP_BUNDLE_ID`**; Google service account = **`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`**.

## 5. Activation Worktree Path
`C:\Development\DeokbunAI-staging-activation` (detached HEAD `38025a9`; only tracked files, no `.env`/owner-dirty).

## 6. Main Repo Link Target
`olvkpaldrwvtexxpoaag` (production) — **unchanged** before, during, and after. `config.toml project_id` in main
still production.

## 7. Staging Worktree Link Target
`aephpsiurgkvqcswyeie` (staging). Link succeeded token-based (no password prompt). Worktree config.toml
`project_id` also set to staging (worktree-local, belt-and-suspenders).

## 8. Migration Dry Run
`db push --dry-run` (no --include-seed) → **PASS**: 30 migrations `20260817000000 … 20260836000000`, in order,
seeds [], roles []. Matches the audited local chain exactly (no unexpected / missing / reordered).

## 9. Applied Migration Count
**4 of 30 applied**, then STOPPED on the 5th failing.
Applied: `20260817000000`, `20260817000100`, `20260817000200`, `20260817000300` (consumer-core: consumer_birth_
profiles, profiles, consultation_drafts, conversations/messages/subjects).

## 10. Migration History After Apply
`migration list` (staging): the 4 above show remote-applied; `20260818000000` onward (26 migrations, incl. the
entire monetization chain) remain PENDING (`remote=""`). No divergence artifacts, no half-recorded migration.

## 11–15. (Not reached)
Schema/RPC/RLS/analytics/economy-diagnostics verification NOT performed — the DB build did not complete.

## 16–17. Billing / Global Idempotency Flags
Untouched — `DUK_BILLING_ENABLED` / `GLOBAL_REQ_IDEMPOTENCY_ENABLED` not set (OFF). No secrets set. No Edge
deployed (Activation 02 is DB-first; §14).

## 18. BLOCKER — reproducibility gap (migration chain is NOT self-contained)
`db push` failed at **`20260818000000_ai_usage_logs_telemetry.sql`**:
`ERROR: relation "public.ai_usage_logs" does not exist (SQLSTATE 42P01)` — the migration `ALTER`s
`ai_usage_logs`, but **no migration creates it** (it is created out-of-band by `docs/admin/ADMIN_04_SETUP.sql`).
Production has it (built incrementally with out-of-band SQL); a fresh staging DB built from migrations alone
does not.

**Scoped gap (read-only analysis):** two out-of-band dependencies the migration chain assumes exist —
1. **`public.ai_usage_logs`** (table) — ALTERed by `20260818000000`; source `docs/admin/ADMIN_04_SETUP.sql`.
2. **`is_admin()`** (function; needs `admin_users`) — referenced by `20260824000000`, `20260826000000`,
   `20260828000000`; source `docs/admin/ADMIN_SETUP.sql`. (Would fail after #1 is resolved.)
The **monetization chain `20260829000000–20260836000000` is free of out-of-band admin deps** (self-contained).
`admin_users` / `content_items` / `famous_profiles` are not referenced by any migration.

## 19. HIGH
The migration set cannot build a from-scratch DB until the two out-of-band base objects are supplied. This also
means production's schema is not fully reproducible from `supabase/migrations/` alone (a pre-existing repo
condition surfaced by the fresh staging build).

## 20. MEDIUM
Staging is left partially migrated (4 consumer-core migrations, empty tables, no data). Safe/consistent, but the
DB is incomplete until the gap is resolved and the push resumed (or the empty DB is reset + rebuilt clean).

## 21. Owner Action Required
Choose how to make staging complete (I will not fix blind — it must match production):
- **Option A (mirrors production build, lower-risk):** apply the out-of-band base scripts to staging first —
  `docs/admin/ADMIN_SETUP.sql` (admin_users + is_admin) then `docs/admin/ADMIN_04_SETUP.sql` (ai_usage_logs) —
  then resume `db push` from the worktree. (Manual SQL on staging, or authorize me to apply exactly these two
  read-reviewed scripts to staging.)
- **Option B (self-contained, cleanest long-term):** authorize me to author early "genesis" migrations from
  those docs scripts so the chain builds from scratch, then **reset the empty staging DB** (`db reset` — needs
  explicit approval, forbidden by default) and clean `db push`. This makes production+staging reproducible from
  migrations, but I must reproduce the out-of-band schema exactly.

Either way, then the DB build completes and Activation 02 verification (RLS/RPC/diagnostics) resumes; billing
stays OFF; Edge deploy remains Activation 03.

---

STAGING_DATABASE_ACTIVATION_BLOCKED — immediate owner decision: choose Option A (apply the 2 out-of-band base
scripts to staging, then resume push) or Option B (authorize genesis migrations + a staging `db reset`).

OWNER_ACTIVATION_02_COMPLETE
