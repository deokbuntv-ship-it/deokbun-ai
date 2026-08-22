# OWNER ACTIVATION 04 — STAGING DUK BILLING REPORT

> Staging `aephpsiurgkvqcswyeie` only. Production `olvkpaldrwvtexxpoaag` never contacted. **Production mutations = 0.**
> **A billing-breaking bug was found during pre-billing DB-integration checks → billing was NOT enabled.**
> All DB-integration tests below ran inside `BEGIN … ROLLBACK` (incl. the proposed fix), so **staging state is
> unchanged**: test-user wallet still 0 rows, `session_reason()` still the buggy version, flags untouched.

## ⛔ HEADLINE — BILLING ACTIVATION BLOCKER (confirmed empirically)
`public.session_reason(p_product)` (migration `20260833000000`, line 155-158) returns **`GENERAL_SESSION` /
`COMPATIBILITY_SESSION`**, but `public.duk_ledger.reason` CHECK (`20260831000000`, line 18-20) only permits the
session-spend reasons **`CONSULTATION` / `COMPATIBILITY` / `PREMIUM_REPORT`**. `commit_session_reservation()`
inserts a debit whose `reason = session_reason(product_type)`; for general/compatibility this violates
`duk_ledger_reason_check`. **With `DUK_BILLING_ENABLED=true`, every general and compatibility consultation would
fail at the atomic Duk commit** → `complete_consultation_with_billing` rolls back → chat Edge 503, no answer, no
charge. Only `premium_report` (reason `PREMIUM_REPORT`, already valid) would commit.

Empirical proof (staging, rolled back): `commit_session_reservation` for a `general` reserve →
`ERROR 23514: new row for relation "duk_ledger" violates check constraint "duk_ledger_reason_check"`,
`DETAIL: … REWARD, -5, GENERAL_SESSION …`.

Fix (verified, rolled back — see §14) and corrective migration written: **`supabase/migrations/20260837000000_fix_session_reason_reason_values.sql`** (uncommitted, NOT applied) — `session_reason` returns `CONSULTATION`/`COMPATIBILITY`/`PREMIUM_REPORT`. Repo-wide grep confirms `session_reason()` is the **only** consumer of the old strings, so the fix is isolated.

## 1. Target Isolation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (HEAD `baa1a96`, unchanged) · `ACTIVATION_WORKTREE_TARGET =
aephpsiurgkvqcswyeie` · `REMOTE_MUTATION_TARGET = aephpsiurgkvqcswyeie` · **PRODUCTION MUTATIONS = 0.**

## 2. Grounded WHY Prior / ## 3. Grounded WHY Follow-Up
**NOT_TESTED this activation.** The grounded-WHY path needs an owner-run authenticated harness (my shell has no
TTY). Because the solo DB-integration pre-checks surfaced a hard billing blocker before any owner round-trip, and
billing cannot be enabled regardless, grounded-WHY is deferred to the re-run. It is billing-independent, and 03C
already proved the WHY mechanism is code-correct and fail-closed; a harness is ready on request.

## 4. Stored Evidence Proof
Deferred with §2/§3 (see 03C §5 for the code + DB evidence that grounded decisions carry `evidenceSnapshot`).

## 5. Initial Wallet State
Test user `0aa9e358…`: `duk_balance` 0 (no PLUS/REWARD/PAID rows), `duk_reserve` 0, `duk_debt` 0, `duk_ledger` 0
rows, `consultation_sessions` 0. Clean slate (billing had never run).

## 6. Welcome Runtime Status
**WELCOME_RUNTIME_IMPLEMENTED = NO.** No `grant_duk` call is wired into signup/onboarding runtime (repo grep: the
only "welcome" reference is a comment in `candle.ts`; `grant_duk` has no runtime caller). The 10-Duk welcome is a
policy value (`economy_policy.welcome_reward = 10`) with no automatic grant. → Product integration gap (MEDIUM).
Controlled test balance therefore uses a server-authoritative `grant_duk(..., 'ADMIN_ADJUSTMENT')` (§8).

## 7. Candle Runtime Status
`light_candle()` verified: `auth.uid()` authority (raises if null), server clock `now()`, atomic conditional
claim (insert-or-update `candle_state` only when eligible → concurrent clicks grant once), `candle_reward = 1`,
`candle_cooldown_seconds = 86400` (24h), idempotent via the cooldown claim, ledger `REWARD +1 CANDLE`. ACL: callable
by `authenticated`. **RUNTIME OK.**

## 8. Controlled Test Grants
No PERSISTED grants were made (activation blocked before billing). All grants used in DB-integration tests were
`grant_duk(<test user>, N, 'REWARD', 'ADMIN_ADJUSTMENT')` inside `BEGIN … ROLLBACK` (server-authoritative,
ledger-appended, never a direct balance UPDATE) — and rolled back (wallet still 0). `'ADMIN_ADJUSTMENT'` is a
constraint-valid reason (`duk_ledger_reason_check`).

## 9. Billing Flag Activation
**NOT PERFORMED.** `DUK_BILLING_ENABLED` remains **OFF**. Per §14 (enable only after all pre-checks PASS) and the
§4 blocker discipline, billing was not enabled because the commit path is broken (headline bug).

## 10. Insufficient-Duk Test
**PASS (DB-integration, rolled back).** With spendable = 5 (REWARD), `reserve_session_duk(compatibility)` →
`INSUFFICIENT required=12 available=5 shortfall=7`. No session created, no reserve, no ledger effect. (Edge-level
`INSUFFICIENT_DUK` response deferred to the re-run — same reserve RPC underlies it.)

## 11. General 5-Duk Charge
**FAIL on current staging (blocker).** `reserve_session_duk(general)` → RESERVED price 5; `commit_session_
reservation` → **constraint violation** (`GENERAL_SESSION`). With the §14 fix applied (rolled back): commit → true,
ledger debit **`REWARD -5 CONSULTATION`**, session ACTIVE, exactly one charge. Charge mechanics are correct **once
`session_reason` is fixed**; broken as currently deployed.

## 12. General Follow-Up
**NOT_TESTED via Edge (blocked).** DB-integration shows a second same-product `reserve_session_duk` **resumes** the
OPEN/ACTIVE session (`kind=ACTIVE_SESSION`, price 0) — i.e. no second charge — which is the follow-up mechanism.

## 13. General Replay
**NOT_TESTED via Edge (blocked).** Idempotency substrate proven: 03C showed `paid_request_idempotency` replays a
completed request with no second LLM/decision/global-reservation; `reserve_session_duk` returns the existing
reservation for a repeated `request_id` (code + resume test).

## 14. General Accounting Proof (fix verified, rolled back)
With `session_reason` corrected, on the test user in one `BEGIN … ROLLBACK`: grant 10 REWARD → reserve general
(hold 5, spendable 5) → **commit → REWARD −5 CONSULTATION** → **idempotent commit → still 1 debit row** → final
balance REWARD 5. Release path: reserve → **release wrong version = false (fencing)** → release correct = true
(spendable restored) → release again = false (terminal). Commit fencing: **commit wrong version = false**, correct
= true. **SESSION PRICE COMMITTED EXACTLY ONCE.**

## 15. Compatibility 12-Duk Charge
**FAIL on current staging (blocker; `COMPATIBILITY_SESSION` invalid).** With the fix (rolled back): reserve compat
→ RESERVED price 12 → commit → ledger **`REWARD -12 COMPATIBILITY`**, exactly one charge.

## 16. Compatibility Follow-Up / ## 17. Compatibility Replay
**NOT_TESTED via Edge (blocked).** Same resume/idempotency substrate as §12/§13.

## 18. Compatibility Accounting Proof
See §15: 12 Duk committed exactly once with the fix; `product_type=compatibility`, reason `COMPATIBILITY`, version
fencing enforced. (Edge `model_id=gpt-5.6-terra` for compat already confirmed live in 03C.)

## 19. Safety While Billing ON
**PASS (architectural + 03C).** The crisis short-circuit (`index.ts:1079`) precedes all reserve/paid/global work;
03C showed `global_reservation_requests` for a safety request = 0 and no `ai_usage` row. Enabling billing does not
change this ordering → Duk reserve/commit/charge = 0 on safety.

## 20. Concurrent Spend
**DB_INTEGRATION_ONLY.** `reserve_session_duk` takes a per-user `pg_advisory_xact_lock` and computes spendable =
balance − active reserves (`duk_spendable`), so concurrent first-turns serialize and the second sees the first's
hold. Demonstrated sequentially (compat INSUFFICIENT once 5 is held). True multi-connection concurrency not run
(single db-query connection).

## 21. Reserve Release
**PASS (DB-integration, §14):** release restores spendable; wrong-version release is a no-op (fencing);
double-release is terminal-safe. Live Edge fault-injection not available → verification level = DB integration.

## 22. Fencing
**PASS (DB-integration, §14):** stale-version `commit`/`release` rejected (`… and version = p_version`); expired
reserve cannot commit; committed reserve is idempotent. No 24h wait needed.

## 23. Candle First Claim / ## 24. Candle Duplicate/Concurrency
**PASS (DB-integration, rolled back):** first `light_candle()` → `granted=true, reward=1, next_available_at set`;
immediate second → `granted=false` (cooldown). Concurrency safety = the atomic conditional claim (code-verified).

## 25. Mini Token/Latency Cost / ## 26. Terra Token/Latency Cost
**No NEW billing-ON LLM calls were made** (billing blocked). Best available live samples are 03C (billing-OFF, same
models/pipeline): Mini general $0.00770 ≈ ₩10.39 @1350 (N=1); Terra compat TERRA_COST_UNPRICED (no verified
gpt-5.6-terra price; N=1 tokens 4679→795, 9982 ms). Fresh billing-ON samples in the re-run.

## 27. Benchmark Recommendation
**BENCHMARK_READY_NOT_RUN.** Do not run the 1/3/5 suite until billing is fixed + smoke-validated; running it now
would spend provider tokens on a broken commit path.

## 28. Analytics Events
NOT_VERIFIED this activation (no billing-ON flow produced `duk_committed`/`duk_reserved`/`session_*` events).
`product_events` is RPC-validated (03A/03C); event emission on the billing path to be verified in the re-run.

## 29. Economy Diagnostics
**PASS — 0 anomalies** (pre- and post-activation; nothing persisted).

## 30. Final Wallet State
Test user wallet **unchanged: 0** (all grants/reserves/commits rolled back). Immutable-ledger integrity preserved
(no test rows to delete; §39 respected — none created).

## 31. Final Feature Flags
`DUK_BILLING_ENABLED = OFF` (unchanged) · `GLOBAL_REQ_IDEMPOTENCY_ENABLED = ON` (unchanged) · Apple absent ·
Google absent.

## 32. Production Mutation Count
**0.** Main linked to production, HEAD `baa1a96` unchanged. Only staging was read/tested (all writes rolled back).

## 33. BLOCKER
- **session_reason() ↔ duk_ledger_reason_check mismatch** (headline). Blocks general + compatibility Duk commits.
  Fix: apply `20260837000000_fix_session_reason_reason_values.sql`.

## 34. HIGH
- **Grounded-WHY positive path** still not live-proven (carried from 03C). Run in the re-run.
- **No billing-ON end-to-end proof through the chat Edge** yet — the real reserve→LLM→validate→persist→commit
  charge was never exercised through the deployed function (only the wallet RPCs in DB-integration). Must be run
  after the fix.

## 35. MEDIUM
- **WELCOME_RUNTIME_IMPLEMENTED = NO** — 10-Duk welcome is policy-only, not granted at signup runtime (integration
  gap; new users would start at 0 Duk).
- Terra unpriced in the cost model (carried).

## 36. OWNER ACTION REQUIRED
1. Review + apply `supabase/migrations/20260837000000_fix_session_reason_reason_values.sql` to **staging** (then,
   after validation, production).
2. Authorize a re-run of Activation 04: I set the controlled balance (grant_duk), enable `DUK_BILLING_ENABLED` on
   staging, and you run the billing-ON harness (general 5-Duk, compat 12-Duk, follow-ups, replays, safety,
   insufficient) + the grounded-WHY harness. I verify all accounting + collect Mini/Terra billing-ON cost samples.
3. Decide on the WELCOME runtime grant (product integration) separately.

## 37. Recommended Activation 05
Store sandbox (Apple/Google credentials + product mapping + sandbox purchase/restore/refund → real debt path).
Only after Activation 04 billing smoke passes on the fixed code.

---

### Exact verdicts
```
GROUNDED_WHY_POSITIVE_PATH          = NOT_TESTED (deferred to re-run; needs owner harness)
GENERAL_5_DUK_CHARGE                = FAIL (session_reason bug; fix verified in DB-integration)
GENERAL_FOLLOWUP_NO_SECOND_CHARGE   = NOT_TESTED (blocked; resume-no-charge shown in DB-integration)
GENERAL_REPLAY_EXACT_ONCE           = NOT_TESTED (blocked; idempotency substrate proven 03C)
COMPATIBILITY_12_DUK_CHARGE         = FAIL (session_reason bug; fix verified in DB-integration)
COMPATIBILITY_REPLAY_EXACT_ONCE     = NOT_TESTED (blocked)
SAFETY_ZERO_DUK                     = PASS (short-circuits before paid work; 03C + architecture)
CONCURRENT_DOUBLE_SPEND_PROTECTION  = DB_INTEGRATION_ONLY
CANDLE_ONE_PER_COOLDOWN             = PASS (DB_INTEGRATION)
ECONOMY_DIAGNOSTICS                 = PASS
FROZEN_CONSULTATION_CORE            = YES (no engine change; fix is billing infra, uncommitted, not applied)
PRODUCTION_MUTATIONS                = 0
```

**STAGING_DUK_BILLING_BLOCKED** — a schema/function mismatch (`session_reason` → invalid `duk_ledger` reason)
breaks the general/compatibility Duk commit. The one-line fix is written and verified (rolled back); billing was
not enabled. Apply the corrective migration and re-run.

OWNER_ACTIVATION_04_COMPLETE
