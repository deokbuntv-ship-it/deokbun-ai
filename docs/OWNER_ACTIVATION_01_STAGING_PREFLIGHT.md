# SUPABASE STAGING READ-ONLY PREFLIGHT REPORT (Owner Activation 01)

> READ-ONLY. No remote mutation, no migration apply, no deploy, no secret change. The single existing Supabase
> project is the LIVE/production project and the repo is linked to it; **no dedicated staging project exists**,
> so no remote migration/schema/secret inspection was run against it (that is deliberately withheld).

## 1. Actual HEAD
`3dfb151` (expected `3dfb151` ✅). Branch `admin/master-operations-content`, ahead of origin, **not pushed**.
Working tree clean except owner-dirty `supabase/config.toml` (M) + `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` (??).
Frozen consultation core untouched.

## 2. Supabase CLI
Not on PATH as `supabase`, but available via **`npx supabase` = v2.115.0**. Use `npx supabase …` for CLI ops.
(No SUPABASE_CLI_MISSING.)

## 3. Authentication
**Authenticated** — `npx supabase projects list` returned data (no login prompt). No token displayed.

## 4. Project Inventory
Exactly **ONE** project:
- ref `olvkpaldrwvtexxpoaag` · name "deokbuntv-ship-it's Project" · region ap-northeast-1 · Postgres 17 ·
  status ACTIVE_HEALTHY · **linked = true**.
This ref is the LIVE project (project history: content-generate deploy + deokbunai.com Naver login used this
ref) → treat as **PRODUCTION**.

## 5. Staging Project
**STAGING_PROJECT_NOT_FOUND.** There is no dedicated staging project. Production must NOT be used as staging.

## 6. Current Link Target
`supabase/.temp/project-ref` = `olvkpaldrwvtexxpoaag` (production). `config.toml project_id = olvkpaldrwvtexxpoaag`
(owner-dirty, not modified). **The repo is currently linked to PRODUCTION** — a hard stop for any migration/
deploy until a staging target exists.

## 7. Exact Migration Inventory (monetization chain)
| File | Purpose | Depends on | Key objects | RLS/grants | Rollback note |
|---|---|---|---|---|---|
| `20260829000000_consultation_decisions.sql` | server decision store | conversations | consultation_decisions + complete_consultation_request_with_decision | read-own, no client write; RPC service-role | additive; drop table (no financial data) |
| `20260830000000_product_events_server_validation.sql` | analytics RPC | product_events | record_product_event | RPC granted authenticated | additive; keeps insert policy (revoke = 20260835) |
| `20260831000000_duk_economy_foundation.sql` | ledger core | auth.users | duk_ledger, duk_debt, duk_reserve, duk_balance, spend_duk, grant_duk | read-own, no client write | additive; **ledger is immutable — never destructive rollback** |
| `20260832000000_duk_economy_runtime.sql` | economy runtime | 20260831 | economy_policy, consultation_sessions, candle_state, event_campaigns/claims, plus_entitlements, light_candle | read-own; light_candle=authenticated | additive |
| `20260833000000_duk_session_runtime.sql` | session billing | 20260829/31/32 | duk_spendable, reserve/commit/release RPCs, complete_consultation_with_billing; ALTER duk_reserve | service-role RPCs | additive (ALTER add-column-if-not-exists) |
| `20260834000000_iap.sql` | IAP accounting | 20260831 | product_catalog, verified_purchases, purchase_revocations, record_verified_purchase, record_revocation | read-own; RPCs service-role | additive |
| `20260835000000_product_events_revoke_direct_insert.sql` | analytics final state | 20260830 + RPC client live | drops product_events_insert_own policy | — | **apply LAST**; rollback = re-create policy |
| `20260836000000_global_reservation_request_id.sql` | global req idempotency | 20260828 guard | global_reservation_requests, reserve_global_paid_generation_idem | service-role RPC | additive |

## 8. Dependency Graph
`20260829 → 20260830 → 20260831 → 20260832 → 20260833` ; `20260831 → 20260834` ; `20260828(existing) → 20260836` ;
`20260830 + RPC-first client deployed → 20260835 (LAST)`. Apply order = filename timestamp order.

## 9. Local Migration Preflight
`node scripts/staging/migration-preflight.mjs` → **PASS**. Chain 829–836 complete + ordered; no conflicting
function redefinitions in the monetization set. (Pre-existing create-or-replace of `set_updated_at` /
`get_shared_report` across older migrations — benign, intended.)

## 10. Remote Migration History
**NOT RUN.** `supabase migration list` is gated on being linked to STAGING; the repo is linked to PRODUCTION and
no staging exists. Deferred until a staging project is linked.

## 11. Schema / RPC Current State
**NOT INSPECTED** (no staging; production probing withheld). Expected objects to verify post-apply on staging:
tables consultation_decisions, duk_ledger, duk_debt, duk_reserve, economy_policy, consultation_sessions,
candle_state, product_catalog, verified_purchases, purchase_revocations, product_events; RPCs
complete_consultation_request_with_decision, spend_duk, grant_duk, reserve_session_duk,
commit_session_reservation, release_session_reservation, complete_consultation_with_billing, light_candle,
record_product_event, record_verified_purchase, record_revocation, reserve_global_paid_generation_idem.

## 12. Collision Risks
Assessed statically (local): all monetization migrations are additive (create-if-not-exists / add-column-if-not-
exists / create-or-replace). **Cannot classify SAFE/REVIEW/BLOCKING against staging** until staging schema is
inspectable. On a fresh staging DB → all SAFE. On a DB where some objects pre-exist → REVIEW at apply time.

## 13. Analytics Permission State
**NOT INSPECTED** (no staging). Target end-state (after 20260830 + 20260835): direct arbitrary INSERT into
product_events = DENIED; validated `record_product_event` = ALLOWED.

## 14. Edge Function Inventory
Local functions: `chat`, `verify-purchase`, `apple-notifications-v2`, `google-rtdn` (release-relevant) + existing
`_shared`, `ad-track`, `content-generate`, `famous-suggest`, `media-generate`, `naver-auth`, `video-generate`,
`video-status`. Remote deploy state NOT inspected (no staging). Deploy required (staging): chat (regenerated
bundle), verify-purchase, apple-notifications-v2, google-rtdn.

## 15. Edge Config
`config.toml` sets `verify_jwt = true` for chat/content-generate/famous-suggest/media-generate/video-generate/
video-status; `false` for naver-auth/ad-track. **GAP:** the 3 new functions have **no `[functions.*]` block**:
- `verify-purchase` → should be `verify_jwt = true` (authenticated user).
- `apple-notifications-v2` → must be `verify_jwt = false` (Apple posts no Supabase JWT; the function verifies the
  JWS signature itself).
- `google-rtdn` → must be `verify_jwt = false` (Pub/Sub posts an OIDC token; the function authenticates the push
  + refetches authoritative state).
config.toml is owner-dirty → the **owner** adds these blocks. (Both webhook functions currently return 503
NOT_CONFIGURED and mutate nothing, so no unauthenticated mutation path is exposed today.)

## 16. Secret Names Present / Missing
**NOT INSPECTED** (`supabase secrets list` withheld — production only). Required names from code:
- Model/LLM: `OPENAI_API_KEY`, `LLM_MODEL`, `LLM_MODEL_MINI`, `LLM_MODEL_TERRA`, `COMPATIBILITY_MODEL_MODE`
  (+ per-workload token/effort tuners).
- Flags: `DUK_BILLING_ENABLED`, `GLOBAL_REQ_IDEMPOTENCY_ENABLED`.
- Apple: `APPLE_IAP_ISSUER_ID`, `APPLE_IAP_KEY_ID`, `APPLE_IAP_PRIVATE_KEY`, **bundle-id name inconsistent** —
  verify-purchase reads `APPLE_IAP_BUNDLE_ID` but apple-notifications-v2 reads `APPLE_BUNDLE_ID` (REVIEW: pick one).
- Google: `GOOGLE_PLAY_PACKAGE_NAME`, **service-account name inconsistent** — verify-purchase reads
  `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` but google-rtdn/adapters read `GOOGLE_PLAY_SERVICE_ACCOUNT` (REVIEW: pick one).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase.

## 17. Feature Flag State
**NOT INSPECTED** (no staging). Desired initial staging state: `DUK_BILLING_ENABLED` = OFF (absent),
`GLOBAL_REQ_IDEMPOTENCY_ENABLED` = OFF until 20260836 applied. No TEST-ONLY cohort mode is implemented (flags are
boolean OFF/ON) — staging validation should use dedicated staging test accounts, not a production cohort.

## 18. Mini / Terra Config State
Code policy confirmed: general → `gpt-5-mini` (default), compatibility → `gpt-5.6-terra` via the server router;
env-pinnable `LLM_MODEL_MINI` / `LLM_MODEL_TERRA`. **Terra id must be set** (`LLM_MODEL_TERRA`) on staging.
No live API call made. Benchmark blocker: `LIVE_BENCHMARK_BLOCKED_EXTERNAL` (needs staging Edge + test token).

## 19. Economy Diagnostics
`scripts/staging/economy_diagnostics.sql` verified **read-only (SELECT-only)** — 11 invariant queries (negative
balance, duplicate purchase/revocation, multiple charge, invalid reserve, session mismatch, orphan purchase,
debt inconsistency, ledger supply). Run post-apply on staging; every query should return ZERO rows.

## 20. E2E Harness Dry Run
`node scripts/staging/economy-e2e.mjs` → **STAGING_HARNESS_READY / LIVE_STAGING_NOT_EXECUTED**. Plan covers
Welcome, candle, general 5-Duk, follow-ups, compatibility 12-Duk, insufficient, concurrent, retry/idempotency,
cross-owner, reserve fencing, refund/revocation/debt. No gaps for the required cases.

## 21. Proposed Migration Apply Sequence (DO NOT EXECUTE)
On a **dedicated staging project** only:
A. `npx supabase link --project-ref <STAGING_REF>` (confirm it is NOT olvkpaldrwvtexxpoaag).
B. `npx supabase migration list` (inspect divergence; do NOT repair automatically).
C. `node scripts/staging/migration-preflight.mjs` (read-only).
D. Backup consideration: staging is a fresh DB → additive apply is low-risk; snapshot if it already holds data.
E. `npx supabase db push` (applies 829→836 in order).
F. `npx supabase migration list` (verify all applied).
G. Run `scripts/staging/economy_diagnostics.sql` → all ZERO.
H. Verify RLS (read-own, no client write) + RPC grants (service-role; light_candle/record_product_event=authenticated).
Apply `20260835` (analytics revoke) only after the RPC-first client is deployed everywhere.

## 22. Proposed Edge Deploy Sequence (DO NOT EXECUTE)
On staging, after §21: owner adds the 3 `[functions.*]` config blocks (§15), then
`npx supabase functions deploy chat`, `verify-purchase`, `apple-notifications-v2`, `google-rtdn`.

## 23. Proposed Feature-Flag Activation Sequence (DO NOT EXECUTE)
P0 flags OFF → P1 migrations applied → P2 diagnostics clean → P3 Edge deployed → P4 legacy consultation smoke
(billing OFF) → P5 `GLOBAL_REQ_IDEMPOTENCY_ENABLED=true` → P6 (no TEST-ONLY mode; use staging test accounts) →
P7 `DUK_BILLING_ENABLED=true` on staging → P8 `economy-e2e --live` → confirm → keep staging ON.

## 24. Rollback Plan
Prefer non-destructive: set `DUK_BILLING_ENABLED=false` (billing path inert instantly) / redeploy the prior Edge
bundle / leave `verify-purchase` NOT_CONFIGURED / re-create the analytics insert policy if 20260835 must revert.
**Never** delete or mutate ledger/accounting history — it is immutable. Additive tables can be dropped only on a
staging DB with no real financial rows.

## 25. BLOCKERS
1. **STAGING_PROJECT_NOT_FOUND** — the only project is production and the repo is linked to it. No safe staging
   target for migration/deploy.
2. (Deploy-time, not now) config.toml lacks `[functions.*]` blocks for the 3 new functions (owner edit).
3. (Config REVIEW) Apple bundle-id + Google service-account env-name inconsistencies (§16) — pick one name each.

## 26. OWNER ACTION REQUIRED NOW
**Create (or designate) a dedicated STAGING Supabase project distinct from production `olvkpaldrwvtexxpoaag`**
(a separate project, or enable Supabase Branching for a preview DB), then tell me its ref so I can link to it and
run the read-only remote inventory (migration list, schema/RPC, secrets names, flags) safely. Do NOT link the
repo to production for activation.

---

STAGING_PREFLIGHT_BLOCKED — immediate owner action: provision a dedicated staging project (ref) separate from
production `olvkpaldrwvtexxpoaag`.

OWNER_ACTIVATION_01_PREFLIGHT_COMPLETE
