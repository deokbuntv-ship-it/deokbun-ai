# RUNTIME LEASE & GLOBAL RESERVATION IDEMPOTENCY (§M / §N)

> **Status:** REVIEW + MINIMAL-FIX DESIGN (Sprint F.1). No breaking change shipped — a proper §N fix needs an
> RPC signature change that would fail against the currently-deployed RPC until a migration lands, so it is
> specified here for the owner to apply as a coupled migration+deploy. §M needs no code change.

## §M — paid request lease / fencing

### What exists (verified)
- `acquire_paid_request(user_id, workload, request_id, lease_seconds=300)` — per-request idempotency:
  returns `COMPLETED` (replay), `PROCESSING` (409), or `ACQUIRED` (new `lease_token`).
- **Completion is fenced by `lease_token`**: `complete_paid_request` and the atomic
  `complete_consultation_request_with_decision` both take `p_lease_token`; only the current lease owner can
  complete or release. A stale worker's old token cannot complete over a newer lease.
- **Lease TTL (300s) > platform max runtime.** Supabase Edge functions are killed at the platform wall-clock
  limit (well under 300s), so the "worker still processing when its lease expires and another worker reacquires
  the same request" window does **not** open in practice: the original worker is dead long before 300s.

### Invariant (document)
> **Only the current lease owner (matching `lease_token`) can complete or release a paid request, and the lease
> TTL (300s) exceeds the platform's maximum function runtime.** Therefore a request is never concurrently owned
> by two live workers, and a late/stale worker cannot complete over a new lease.

### Residual (narrow, accepted)
If a worker is killed **after** the provider (OpenAI) call was billed but **before** `complete_paid_request`
commits, the generation is not marked `COMPLETED`. A retry with the **same** `request_id`:
- within 300s → `PROCESSING` (409): no duplicate spend, client retries later;
- after 300s → reacquires and generates again → one extra provider call.

This is the standard at-least-once boundary of any lease system and is bounded (one extra call, only in the
kill-mid-flight window). **Option chosen: OPTION 1** (lease TTL > runtime + fencing token), which the system
already satisfies — no code change. An explicit provider-side `AbortController` timeout (< platform limit) is an
optional future belt-and-suspanders; it is not required for the invariant.

## §N — global reservation request identity

### What exists (verified)
- Order in `acquirePaidRequest`: `acquire_paid_request` (per-request idempotency) → `reservePaidWorkAtomic`
  (per-user) → `reserveGlobalPaidGeneration` (global budget, `+1` unit).
- `reserve_global_paid_generation(user_id, workload, units)` — **carries NO request_id.**

### Why the common retry is already safe
Because the global reserve runs **only** on the `ACQUIRED` branch (a fresh lease), a same-`request_id` retry that
finds the request `PROCESSING` (within lease) or `COMPLETED` (after commit) returns **before** the global reserve
— so a response-loss retry after a *committed* generation does **not** re-consume a global slot.

### The gap
The narrow kill-mid-flight case (§M residual): first attempt consumed a global unit but never completed; a
retry after lease expiry (or after a failed release) reserves a **second** global unit for the **same** logical
request. Global budget is thus over-counted by the retry in that window.

### Minimal fix (owner-applied migration + coupled deploy — NOT shipped here)
Make the global reservation idempotent per `request_id`, backward-compatibly:

1. **Migration (OWNER_APPLY):** extend `reserve_global_paid_generation` with `p_request_id text default null`.
   When non-null, dedupe on `(user_id, workload, request_id)` via a unique key on the global-usage rows: a repeat
   `request_id` returns the **existing** reservation instead of consuming a new unit. `default null` keeps the
   current (deployed) Edge working unchanged — applying the migration alone is safe.
2. **Edge (coupled deploy):** `reserveGlobalPaidGeneration(admin, userId, workload, requestId)` passes
   `p_request_id: requestId`. This must deploy **with or after** the migration (never before — an old RPC would
   reject the new param).

Not shipped now because step 2 against the *current* deployed RPC would fail (unknown param) and break paid
generation. It is a two-step owner action, specified here so it can be done safely.

### Invariant (target)
> **A single logical request (one `request_id`) consumes at most one global budget unit, even across
> response-loss retries** — enforced by request-id dedup in `reserve_global_paid_generation`.

## Owner actions
- §M: none (invariant already holds; document it).
- §N: apply the backward-compatible `p_request_id` migration, then deploy the Edge that passes `request_id` to
  the global reserve. Do them together (migration first).
