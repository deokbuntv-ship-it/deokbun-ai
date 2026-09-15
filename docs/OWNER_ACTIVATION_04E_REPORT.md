# OWNER ACTIVATION 04E — ANALYTICS CLOSURE REPORT

> Client-side analytics wiring. **No migration / secret / deploy** this activation — pure client TS + tests.
> Staging & production mutations = 0. Analytics is best-effort and never an accounting authority.

## 1. Target Isolation
`MAIN_REPO_TARGET = olvkpaldrwvtexxpoaag` (HEAD `baa1a96`, unchanged) · `ACTIVATION_WORKTREE_TARGET = aephpsiurgkvqcswyeie`
· `REMOTE_MUTATION_TARGET = aephpsiurgkvqcswyeie`. **Production mutations = 0; staging mutations = 0** (no DB/Edge change).

## 2. Event Authority Classification
- **CLIENT_INTENT:** consultation_started, compatibility_started/viewed.
- **CLIENT_OBSERVED_SERVER_OUTCOME:** consultation_completed, candle_lit, compatibility_completed, compatibility_insufficient_duk, session_turn_completed.
- **SERVER_AUTHORITATIVE_OUTCOME:** welcome_duk_granted, duk_reserved/committed/released/spent/exhausted, session_started.

## 3. Analytics Architecture
Central `src/services/productEvents.ts` → `trackProductEvent(name,{surface,consultationMode,properties})` → server-validated
`record_product_event` RPC (name regex `^[a-z][a-z0-9_]{2,79}$`; property allowlist re-applied server-side). Client mirrors
the allowlist (`ALLOWED_PROPS`). NON-BLOCKING (all failures swallowed). All new wiring uses `void trackProductEvent(...).catch(()=>{})`.

## 4. Welcome Event
`welcome_duk_granted` — **DEFERRED_SAFE.** The grant is server-authoritative and already verified (04D/04D-B). Emitting a
client event would require either a heuristic ("wallet shows 10") or a server-side outbox; per §6 (emit only on authoritative
evidence) it is deferred to the server-analytics seam. `WELCOME_ANALYTICS = PARTIAL`.

## 5. Candle Event — WIRED
`candle_lit` emitted in `dukWalletService.lightCandle()` **only when the server RPC returns `granted:true`** (never on
cooldown/error), props `{amount, bucket:'REWARD', reason:'CANDLE'}`. Non-blocking. Jest: emitted-on-grant, not-on-cooldown,
not-on-error, rejection-non-blocking, no-PII. `CANDLE_ANALYTICS = PASS`.

## 6. Consultation Events — WIRED
In `createServerConsultationService.sendMessage`: `consultation_started` after validation+auth (a real request begins);
`consultation_completed` **only on a successful accepted server response**, props `{product, outcome:'success', engine_version?}`.
Neither on empty/invalid input; completed never on failure/AUTH_REQUIRED. Non-blocking. Jest covers all cases. `CONSULTATION_ANALYTICS = PASS`.

## 7. Session Events
`session_started` / `session_turn_completed` — **DEFERRED_SAFE.** These are server *billing-session* outcomes; the chat response
exposes no session metadata, so the client cannot authoritatively observe a session start/turn (only a consultation completion,
already captured by §6). Emitting them accurately needs the server-analytics seam. `SESSION_ANALYTICS = DEFERRED_SAFE`.
`REPLAY_ANALYTICS_DEDUP_LIMITATION`: the client response carries no replay marker, so a replayed request is indistinguishable
from a fresh one at the client — a client heuristic was intentionally not invented.

## 8. Compatibility Events
Existing funnel is wired (`compatibility_started/result_viewed/new_conversation_started/conversation_resumed/report_created/
followup_clicked`). `compatibility_insufficient_duk` — **NOT_IMPLEMENTED this pass.** The compatibility service (and the solo
service) collapse the Edge 402 into `REQUEST_FAILED`; the transport/service result contract does not surface `INSUFFICIENT_DUK`
with `{required,available,shortfall}`. Wiring it correctly is a **UX + contract change** (surface INSUFFICIENT_DUK → show a
top-up prompt), not a one-line analytics call, and it needs app testing — deliberately deferred rather than shipped untested.
`COMPATIBILITY_ANALYTICS = PARTIAL`.

## 9. Duk Outcome Events
`duk_reserved/committed/released/spent/exhausted` — **DEFERRED_SAFE / SERVER_ANALYTICS_SEAM_REQUIRED.** These are financial
outcomes the client cannot authoritatively observe (the chat response carries no billing metadata). They must be emitted by a
**server-side non-blocking outbox** that is DECOUPLED from the atomic billing transaction — putting `record_product_event`
inside `complete_consultation_with_billing` would make billing depend on analytics (forbidden, §11). Deferring is safe:
financial accounting is already correct + verified (04C). `DUK_OUTCOME_ANALYTICS = DEFERRED_SAFE`.

## 10. Privacy Validation
`ANALYTICS_NO_PII = PASS` — client + server allowlists structurally drop any non-allowlisted key; new events use only
categorical/numeric props (amount/bucket/reason/product/outcome/engine_version). Jest asserts no prompt/answer/name/email keys.

## 11. Failure Isolation
`ANALYTICS_FAILURE_NON_BLOCKING = PASS` — every wired call is `void trackProductEvent(...).catch(()=>{})`; jest proves a
rejected analytics promise leaves candle `granted:true` and consultation `success:true` unchanged.

## 12. Tests
New: `src/features/duk/__tests__/candleAnalytics.test.ts`, `src/features/chat/__tests__/consultationAnalytics.test.ts` — 11
tests (grant/cooldown/error/started/completed/failure/auth/non-blocking/privacy). Regression: duk + chat service suites
**17 suites / 141 tests pass**.

## 13. Client Live Test
**NOT run** — no RN/Expo app runtime available here; the direct-Edge harness bypasses the client emitter. Verification level =
**service-layer (jest) CODE_VERIFIED**, not real-device. Per §15, `CLIENT_ANALYTICS_LIVE = PARTIAL` (I do not claim PASS
without exercising the real client emitter in-app).

## 14. product_events DB Proof (classification)
| event | status |
|---|---|
| candle_lit | CODE_VERIFIED_ONLY (wired+tested; LIVE-capable in app) |
| consultation_started / consultation_completed | CODE_VERIFIED_ONLY |
| compatibility_started / compatibility_result_viewed / … | CODE_VERIFIED_ONLY (pre-existing wiring) |
| compatibility_insufficient_duk | NOT_IMPLEMENTED (needs INSUFFICIENT_DUK contract surfacing) |
| welcome_duk_granted | DEFERRED_SAFE (server outbox) |
| session_started / session_turn_completed | DEFERRED_SAFE (server outbox) |
| duk_reserved/committed/released/spent/exhausted | DEFERRED_SAFE (server outbox; must not be in the billing txn) |

(No live `product_events` rows produced — no app run this activation.)

## 15. Economy Diagnostics
All 11 invariants = **0 anomalies (PASS)**. No economy change (prices 5/12/50, spend order, welcome 10, candle 1/24h, debt,
idempotency, fencing all untouched).

## 16. Frozen Core
`tsc --noEmit` = 0 · duk + chat service suites **141/141** · **frozen engine diff ZERO** (myungri/saju/ziwei/qimen) ·
consultation semantic diff ZERO (only fire-and-forget, `.catch`-guarded analytics added; no logic change).

## 17. Final Flags
`DUK_BILLING_ENABLED = ON` · `GLOBAL_REQ_IDEMPOTENCY_ENABLED = ON` · Apple/Google absent (unchanged).

## 18. Production Mutation Count
**0.** Also staging mutations = 0 (pure client TS + tests; no migration/secret/deploy). Changes uncommitted in main.

## 19. BLOCKER
None (billing correctness intact; analytics never gates billing).

## 20. HIGH
- **CLIENT_ANALYTICS_LIVE not real-app verified** — the wired client events (candle/consultation) + pre-existing funnels are
  code-verified but need a real client run against staging to confirm `product_events` delivery (owner action).
- **Duk/welcome/session server-authoritative events not emitted** — require a server-side non-blocking analytics outbox
  (decoupled from the billing txn). This is the substantive remaining analytics work.
- **compatibility_insufficient_duk NOT_IMPLEMENTED** — needs the transport/service to surface `INSUFFICIENT_DUK` (also a UX win).

## 21. MEDIUM
- Terra unpriced in the cost model (carried).
- Replay-dedup for session/consultation completed events is not client-detectable (documented).

## 22. Owner Action Required
1. Run the updated client app against staging and exercise onboarding/candle/one consultation → confirm `product_events`
   receives `candle_lit` + `consultation_started/completed` (moves them CODE_VERIFIED → LIVE_VERIFIED).
2. Authorize the server-analytics outbox for duk_*/welcome/session (decoupled, non-blocking) + the `INSUFFICIENT_DUK`
   contract surfacing for compatibility_insufficient_duk.

## 23. Ready For Store Sandbox?
**No — STORE_SANDBOX_BLOCKED.** The client consultation/candle analytics are now wired + tested (major progress), but the gate
is not fully closed: real-app live verification is pending, and the server-authoritative Duk/welcome/session events + the
compat-insufficient event remain (DEFERRED_SAFE / NOT_IMPLEMENTED). Billing remains validated + ON; production untouched.

---

### Exact verdicts
```
WELCOME_ANALYTICS               = PARTIAL (grant verified; welcome_duk_granted DEFERRED_SAFE)
CANDLE_ANALYTICS                = PASS
CONSULTATION_ANALYTICS          = PASS
SESSION_ANALYTICS               = DEFERRED_SAFE
COMPATIBILITY_ANALYTICS         = PARTIAL (funnel wired; insufficient_duk NOT_IMPLEMENTED)
DUK_OUTCOME_ANALYTICS           = DEFERRED_SAFE (SERVER_ANALYTICS_SEAM_REQUIRED)
ANALYTICS_NO_PII                = PASS
ANALYTICS_FAILURE_NON_BLOCKING  = PASS
CLIENT_ANALYTICS_LIVE           = PARTIAL (service-layer/jest verified; real-device pending)
ECONOMY_DIAGNOSTICS             = PASS
FROZEN_CONSULTATION_CORE        = YES
PRODUCTION_MUTATIONS            = 0
```

**STORE_SANDBOX_BLOCKED** — candle + consultation client analytics are wired, tested, non-blocking, and PII-safe, but full
analytics closure requires a real-app live verification plus a server-side outbox for the Duk/welcome/session outcome events
(and the compat-insufficient contract surfacing). All deferrals are explicitly safe (billing accounting is authoritative and
unaffected).

OWNER_ACTIVATION_04E_COMPLETE
