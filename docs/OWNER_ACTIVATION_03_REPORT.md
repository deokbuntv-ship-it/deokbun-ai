# OWNER ACTIVATION 03 REPORT — Staging Edge Deploy / Billing-OFF Smoke / Global Request Idempotency

> **Staging `aephpsiurgkvqcswyeie` ONLY.** Production `olvkpaldrwvtexxpoaag` never mutated.
> No Duk billing enabled. No real Apple/Google credentials configured. No production deploy. No git push.

## 1. Target Isolation (printed before any mutation)
- `MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (production) — unchanged before/during/after; `config.toml project_id` still production.
- `ACTIVATION_WORKTREE_TARGET = aephpsiurgkvqcswyeie` (staging) — isolated worktree `C:\Development\DeokbunAI-staging-activation`.
- `REMOTE_MUTATION_TARGET = aephpsiurgkvqcswyeie` (staging). Every deploy/secret/query below ran from the staging-linked worktree via explicit `--project-ref aephpsiurgkvqcswyeie`.

## 2. Deployment Config (worktree-local; NOT committed to main)
Appended `[functions.*]` blocks to the **worktree** `config.toml` only (main's owner-dirty config untouched):
`verify-purchase` verify_jwt=true · `apple-notifications-v2` verify_jwt=false · `google-rtdn` verify_jwt=false.
(Webhooks post without a Supabase JWT and verify the store signature internally.)

## 3. Canonical Env Names (§4)
`APPLE_IAP_BUNDLE_ID`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (normalized in `38025a9`) — confirmed the only spellings in `functions/` + `src/`.

## 4. Feature Flags — Cryptographic Proof (§8, §23, §28)
CLI `secrets list` returns SHA-256 **digests** (never plaintext). Verified by computing the digests locally:
| Flag | Staging digest | = sha256(...) | State |
|---|---|---|---|
| `DUK_BILLING_ENABLED` | `fcbcf165…f8aa` | `sha256("false")` | **OFF** ✅ (required) |
| `GLOBAL_REQ_IDEMPOTENCY_ENABLED` | `b5bea41b…e12b` | `sha256("true")` | **ON** ✅ (enabled this activation, §23) |

## 5. Secrets Present / Absent (§5, §6)
Present on staging: the platform-injected `SUPABASE_*` set + the two flags above. **Absent (confirmed):**
`OPENAI_API_KEY`, `LLM_MODEL_MINI/TERRA`, all `APPLE_IAP_*`, all `GOOGLE_PLAY_*`. This is consistent with the fail-closed smoke results below and is the cause of the §15–§18 blocker.

## 6. Build / Syntax (§10)
Chat `serverBundle.mjs` regenerated (deterministic, `node --check` OK); all 4 function `index.ts` pass esbuild TS transform; frozen engine paths unchanged (worktree = `38025a9`).

## 7. Edge Deploy (§11–§14) — 4/4 ACTIVE
| Function | Status | verify_jwt | ezbr_sha256 (prefix) |
|---|---|---|---|
| chat | ACTIVE | true | `b1c40f6a…` |
| verify-purchase | ACTIVE | true | `7141064c…` |
| apple-notifications-v2 | ACTIVE | false | `cb935097…` |
| google-rtdn | ACTIVE | false | `50c57eb6…` |

Only these 4 were deployed by name — unrelated functions (content/video/media/famous) were **not** touched.

## 8. Fail-Closed / Auth Smoke (§13, §14, §19)
| Test | Request | Result | Meaning |
|---|---|---|---|
| §13 Apple | `POST apple-notifications-v2 {signedPayload:"ZZZ.ZZZ.ZZZ"}` | **HTTP 503 `{"error":"NOT_CONFIGURED"}`** | fail-closed; **0 grants** (no APPLE_* config) |
| §14 Google | `POST google-rtdn {message:{data:…}}` | **HTTP 503 `{"error":"NOT_CONFIGURED"}`** | fail-closed; **0 grants** (no GOOGLE_PLAY_* config) |
| §19 Auth | `POST chat` (no user JWT) | **HTTP 401 `UNAUTHORIZED_NO_AUTH_HEADER`** | rejected before any LLM call; **0 spend** |

## 9. Global Request Idempotency (§22, §24)
**§22 introspection** — `reserve_global_paid_generation_idem(p_user_id uuid, p_workload text, p_request_id text, p_units integer)` → TABLE(allowed, reason, retry_after_ms, reservation_id, hourly/daily used+limit, utilization_percent, warning_level); `security_definer=true`; ACL = `postgres`, `service_role` **only** (anon/authenticated/public have no execute); runtime service-role guard + `IDEMPOTENT_REPLAY` path both present.

**§24 functional** (as service_role; entire test wrapped in `BEGIN … ROLLBACK` → 0 residue):
| Step | request_id | allowed | reason | reservation_id | reservation count |
|---|---|---|---|---|---|
| baseline | — | — | — | — | 0 |
| CALL1 | R1 | true | `ALLOWED` | `6b1f50c9…` | 1 (new slot) |
| CALL2 | R1 (repeat) | true | **`IDEMPOTENT_REPLAY`** | **`6b1f50c9…` (same)** | **1 (NO new slot)** |
| CALL3 | R2 (new) | true | `ALLOWED` | `23939440…` (different) | 2 (new slot) |

**§22 negative role** — same RPC called with role claim `authenticated` → **`ERROR 42501: service role required`**, rejected at the guard before any effect.

Conclusion: one logical `request_id` consumes at most one global budget slot across retries; distinct request_ids get distinct slots; only service_role can invoke. **Idempotency verified end-to-end.**

## 10. Economy Diagnostics (§26) — all 0
All 11 read-only invariants returned **0 anomalies** (negative balance, dup purchase/revocation, double charge, reserve terminal conflict, expired-still-reserved, charged-no-debit, orphan purchase, open-refund-debt, first-pack-multi-grant, ledger-supply-negative). The idempotency test left **0 residue** (rolled back).

## 11. Benchmark (§29) — dry run
`node scripts/benchmark/run-benchmark.mjs` → `BENCHMARK_HARNESS_READY`; `LIVE_BENCHMARK_BLOCKED_EXTERNAL`; `ECONOMY_RECOMMENDATION: INSUFFICIENT_DATA` (a live run needs the same test-JWT + OpenAI-backed Edge). No network, no spend.

## 12. Main-Repo Safety (§30, §31)
- Main `config.toml project_id = olvkpaldrwvtexxpoaag` (production) — unchanged.
- Main HEAD `baa1a96` (Activation 02A) — **no new commits** this activation.
- Main working tree: only `M supabase/config.toml` (owner's `ad-track` WIP **+** the 3 function blocks appended in Activation 02A, still uncommitted) and an untracked owner doc — **left intact, not mine to commit**.
- **DEPLOY_CONFIG_COMMIT_PENDING**: the 3 `[functions.*]` blocks for verify-purchase/apple-notifications-v2/google-rtdn live in main's working tree uncommitted (folded under the owner's ad-track hunk). Owner should commit them (separately from ad-track WIP) before a production Edge deploy. Staging deploy did **not** need this — it used the worktree config.

## 13. Production Mutation Count
**0.** Every mutation targeted staging via the worktree. Main stayed linked to production throughout.

## 14. BLOCKER (§6) — authenticated LLM consultation smoke (§15–§18) not run
The authenticated consultation smoke (real LLM answer, safety-before-spend, compatibility Terra routing, WHY stored-evidence follow-up with billing OFF) requires **two owner-provided inputs that are intentionally absent locally**:
1. **Staging `OPENAI_API_KEY`** — absent in shell + `.env`. Per §6, the production secret value was **not** retrieved/copied.
2. **A staging test-user JWT** (authenticated, non-admin) — no staging test user exists; needed for `chat` (verify_jwt=true) and for `--live` benchmark.

Owner action (verbatim, §6):
> **Staging OpenAI API key is required. Enter/set the key locally for the staging Supabase project. Do not paste the secret into ChatGPT or Claude.**

Then also create/seed one staging test user and provide its access token, after which §15–§18 (and the live benchmark) can complete.

## 15. Verdict
- **DONE:** 4/4 Edge functions deployed + ACTIVE with correct verify_jwt; Apple/Google seams fail-closed (0 grants); auth guard rejects unauthenticated chat before spend; global request idempotency verified (introspection + functional replay + negative role) and enabled; economy diagnostics all 0; benchmark harness ready; billing OFF proven cryptographically; 0 production mutation.
- **BLOCKED:** authenticated LLM consultation smoke (§15–§18) — pending owner staging OpenAI key + a staging test user.

**STAGING_EDGE_ACTIVATION_BLOCKED** — scoped solely to the authenticated LLM consultation smoke (owner OpenAI key + staging test user). Deploy, fail-closed store seams, auth gate, and global request idempotency are all complete and verified on staging.

OWNER_ACTIVATION_03_COMPLETE
