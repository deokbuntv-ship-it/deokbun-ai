# SESSION BILLING STATE MACHINE (§R)

> **Status:** DESIGN ONLY (Sprint F). Models the exact billing contract for a paid consultation session on top
> of the **existing** paid-request + global-spend machinery (`acquire_paid_request` / `complete_paid_request`
> / `reserve_paid_work` / global guard). No Duk charge code is written this sprint. See
> [DUK_ECONOMY_SPEC_V1.md](DUK_ECONOMY_SPEC_V1.md), [DUK_LEDGER_DATA_MODEL.md](DUK_LEDGER_DATA_MODEL.md).

## 1. The ordered contract (one turn)

```
SAFETY  →  ENTITLEMENT / BALANCE  →  RESERVE  →  LLM  →  VALIDATOR  →  PERSIST  →  COMMIT
```

Each stage is a hard gate; a stage's failure stops the pipeline with the semantics in §3. The ordering is
non-negotiable and mirrors the already-shipped consultation order (crisis stop precedes all paid/global work —
see `evaluateConsultationSafetyStop` running before `acquirePaidRequest`).

| Stage | What it does | On failure |
|---|---|---|
| SAFETY | crisis hard-stop (self-harm / death / medical) | return safe response; **0 charged**, no reserve, no LLM |
| ENTITLEMENT / BALANCE | is this the session's first turn? does the user have ≥ price Duk? | first-turn: `INSUFFICIENT_DUK` (0 charged); later turns: entitlement = the open session |
| RESERVE | atomic paid-request reserve + global-spend reserve (existing) | `RATE_LIMITED` / `GLOBAL_LIMIT` / `GENERATION_DISABLED`; **0 charged** |
| LLM | one provider call | `LLM_FAILED` → release reserve; **0 charged** (see §3) |
| VALIDATOR | grounding + certainty/mitigation guard | reject → safe fallback; first turn is **not** a success (see §3) |
| PERSIST | atomic decision write + paid completion (existing RPC) | rollback → `503`; reserve reconciled; **0 charged** |
| COMMIT | on the **first successful turn**, charge the session price once (idempotent) | charge failure is fail-closed; the answer is still delivered, charge retried by reconciliation |

## 2. Session lifecycle

- A session opens when a paid product (GENERAL=5 / COMPATIBILITY=12 Duk) is started.
- **First successful turn** = the transition that commits the full session price. Turns 2–5 are entitlement-only
  (no new charge).
- Session = **max 5 successful turns**, **TTL 24h** (POLICY). A turn increments the counter **only on success**.

```
        first turn success
 OPEN ─────────────────────────▶ ACTIVE (price committed, successCount=1)
   │                                  │  success (successCount<5)
   │ first turn fail                  ├──────────────▶ ACTIVE (successCount++)
   │ (0 charged, session still OPEN)  │  successCount==5  ▶ COMPLETE
   └───────────────┐                  │  TTL expired      ▶ EXPIRED (no refund)
                   ▼                   │  user leaves       ▶ ABANDONED (no refund)
             (retry / abandon)         └── fail (no refund, successCount unchanged)
```

## 3. Failure semantics (exact)

- **First turn fails** (LLM/validator/persist): reserve released, **0 Duk charged**, session stays OPEN so the
  user can retry the same question idempotently. The session price is committed **only** when a first turn
  actually succeeds.
- **Later turn fails**: **no refund**, and the failed turn is **not** counted toward the 5. The user simply
  retries within the same paid session.
- **TTL expiry**: remaining turns are forfeited, **no refund**.
- **User voluntarily ends**: **no refund**.
- These match the "you bought a *session*, not N guaranteed turns" model, while never charging for a turn that
  produced no answer.

## 4. Idempotency + reserve safety (reuse existing machinery)

- Every request carries an **idempotency key** (`request_id`). The existing `paid_request_idempotency` +
  `acquire_paid_request` / `complete_paid_request` already provide: single-flight reserve, replay-read of a
  completed request (delivery-loss retry returns the persisted answer with no new LLM), and lease release.
- The **Duk first-turn charge** is made idempotent by the ledger's `unique(session_id, reason)` index (§P): a
  retried first turn cannot double-charge.
- **Reserve TTL + reconciliation**: reserves have a TTL; a crashed turn's reserve is reconciled (released) by
  the existing lease machinery. The Duk commit is separated from the reserve so a lost response never both
  charges and fails to deliver — reconciliation either completes the delivery (replay-read) or leaves 0 charged.

## 5. Where the Duk charge slots into today's code

The atomic completion RPC `complete_consultation_request_with_decision` already runs
`complete_paid_request` + decision insert in one transaction. The Duk first-turn commit should be added **inside
that same RPC/transaction** (new `spend_duk` call, guarded by "first successful turn of this session"), so that
"answer persisted" and "session charged" are atomic — no delivered-uncharged and no charged-undelivered state.
This is the single, minimal integration point; it is **not** implemented this sprint.

## 6. Open owner decisions

- Confirm price-commit-on-first-success (vs charge-on-open). Recommended: **first success** (never charge for a
  session that produced no answer).
- Confirm 5-turn cap + 24h TTL values.
- Confirm no-refund-on-later-failure / TTL-expiry / voluntary-exit.
