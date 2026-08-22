# DUK IMPLEMENTATION CONTRACT (§O–§S)

> **Status:** CONTRACT HARDENING (Sprint F.1). Makes every identity + concurrency + reserve + refund invariant
> EXPLICIT so the wallet can be built correctly. No production wallet is built and no migration is applied this
> sprint. Companion: [DUK_ECONOMY_SPEC_V1.md](DUK_ECONOMY_SPEC_V1.md),
> [DUK_LEDGER_DATA_MODEL.md](DUK_LEDGER_DATA_MODEL.md), [SESSION_BILLING_STATE_MACHINE.md](SESSION_BILLING_STATE_MACHINE.md).
> A ready, additive migration draft accompanies it: `supabase/migrations/20260831000000_duk_economy_foundation.sql`
> (OWNER_APPLY — inert until the wallet code ships).

## §O — required identities (exact)

| Identity | Meaning | Cardinality rule |
|---|---|---|
| `user_id` | account | owns all balances |
| `session_id` | one paid consultation product instance | **one session charge** per session |
| `request_id` | one turn attempt (idempotency key) | **at most one provider completion** per request_id |
| `charge_id` | the single session-price debit | one per session (created on first successful turn) |
| `external_purchase_id` | store transaction (IAP) | **at most one PAID_DUK grant** per purchase |
| `external_revocation_id` | store refund/chargeback | **at most one reversal/debt effect** per revocation |

Relationships:
- one `session_id` → many `request_id` (first turn + follow-ups) → **exactly one** `charge_id`.
- one `request_id` → at most one provider execution completion (the paid-request idempotency already enforces
  this; see [RUNTIME_LEASE_GLOBAL_IDEMPOTENCY.md](RUNTIME_LEASE_GLOBAL_IDEMPOTENCY.md)).
- one `external_purchase_id` → at most one grant; one `external_revocation_id` → at most one reversal.

## §P — wallet concurrency contract

The spend path must **never** be "client reads 3 balances → client picks a bucket → client writes a deduction."
It is a single server transaction / RPC (`spend_duk`, service-role, `security definer`):

1. Assert service role.
2. **Idempotency:** if a debit for `(session_id, reason)` (or `(charge_id)`) already exists, return it — no
   double charge.
3. **Lock** the user's ledger/account rows (`select … for update` on a per-user account row, or
   `pg_advisory_xact_lock(hashtext(user_id))`), so concurrent spends serialize.
4. Read non-expired balances per bucket.
5. If `PLUS + REWARD + PAID < amount` → raise `insufficient_duk` (caller maps to a shortfall; never a negative
   row).
6. Allocate in the **fixed order `PLUS_DUK → REWARD_DUK → PAID_DUK`**, writing one immutable debit row per
   bucket touched.
7. Enforce **non-negative** per-bucket balances (the allocation math guarantees it; a DB assertion backs it).
8. Enforce **request/charge uniqueness** (unique indexes on `(session_id, reason)` and `charge_id`).

Steps 2–8 are one transaction. Balances are a **derived projection** of the append-only ledger, never a
directly-mutated field.

## §Q — session charge contract

- **First turn** of a session → **reserve** the session charge (RESERVED, see §R), then run the turn.
- First turn **accepted + persisted** → **commit exactly once** (`charge_id`, idempotent). GENERAL = 5, COMPAT
  = 12 (POLICY).
- **Turns 2–5** → entitlement only, **no second charge**.
- **Failed** follow-up → **no refund**, and the failed turn is **not** counted toward the 5.
- **TTL expiry** (24h) → remaining turns expire, **no refund**.
- **User quits** → **no refund**.
- **Retry** (same `request_id`) → **no duplicate charge** (idempotent commit keyed by `session_id`/`charge_id`).

This slots into the existing atomic completion RPC (`complete_consultation_request_with_decision`): the Duk
commit is added to that same transaction so "answer persisted" and "session charged" are atomic — never
charged-and-undelivered, never delivered-and-uncharged.

## §R — reserve TTL state machine

```
                 commit (first turn accepted+persisted)
  RESERVED ───────────────────────────────────────────▶ COMMITTED   (terminal; never auto-released)
     │  release (first turn failed / not started)
     ├───────────────────────────────────────────────▶ RELEASED     (terminal)
     │  TTL elapsed with no commit
     └───────────────────────────────────────────────▶ EXPIRED      (terminal; reconciled)
```

- Each reserve has exactly **one** terminal transition.
- **COMMITTED is never auto-released by TTL.** The expiry reconciler must use a **fencing token / version /
  CAS**: it may only move a reserve `RESERVED → EXPIRED` if the version still matches, so a late worker cannot
  commit an already-expired reserve, and the reconciler cannot expire an already-committed one.
- Prevents: reserve expires → funds reused → late worker commits the old reserve.

## §S — debt / refund contract

- `duk_debt` is an **obligation ledger**, never a negative balance.
- Debt **does not block**: CANDLE, BIRTHDAY, EVENT rewards, or spending REWARD_DUK / PLUS_DUK — the free /
  subscription economy is unaffected.
- Debt is offset **only** when **new PAID_DUK** is granted (the next purchase claws back the debt before the
  Duk becomes usable). It **never** auto-consumes REWARD_DUK or PLUS_DUK.
- **Replay safety:**
  - `external_purchase_id` **unique** → the same purchase receipt processed twice grants Duk **once**.
  - `external_revocation_id` **unique** → the same refund webhook delivered twice creates **one** reversal.
- Refund **abuse** (buy → spend → refund loops) is a **separate risk policy** (per-account caps / velocity /
  holdbacks) — not solved by the debt model; owner decision.

## Readiness gate

`DUK_IMPLEMENTATION_READY` requires all of §O–§S to be explicit (this document) AND the additive migration draft
present. It does **not** require the wallet to be built or the migration applied — those are the next build step
under this locked contract.
