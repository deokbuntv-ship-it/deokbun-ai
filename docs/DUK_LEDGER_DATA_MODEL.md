# DUK LEDGER DATA MODEL (§P) + DEBT MODEL (§Q)

> **Status:** DESIGN ONLY (Sprint F). No table is created, no migration is applied. The DDL below is the
> canonical proposal; promote it to a `supabase/migrations/*.sql` file (OWNER_APPLY, never remote-applied by
> this track) when the Duk economy is greenlit. Aligns with [DUK_ECONOMY_SPEC_V1.md](DUK_ECONOMY_SPEC_V1.md).

## 1. Principles

1. **Append-only ledger.** Every Duk change is one immutable row. Balances are **derived** by summing signed
   deltas per bucket — never a directly-mutated `balance` column. This gives a full audit trail, makes refunds
   / reversals first-class, and removes the "lost update" race a mutable balance invites.
2. **Bucketed.** Each row belongs to exactly one class: `PLUS`, `REWARD`, `PAID` (mirrors the three Duk classes).
3. **Signed deltas.** Grants are `+`, spends are `−`. The sum per (user, bucket) is that bucket's balance; it
   must never be negative (enforced by the spend RPC, not by a DB check on the projection).
4. **Server-authoritative.** Only a service-role RPC writes ledger rows. RLS grants the owner READ of their own
   rows and **no** write policy (same trust-boundary pattern as `consultation_decisions`).
5. **Reasoned.** Every row carries a `reason` from a fixed enum and, for spends, the originating `session_id` /
   `request_id` for idempotency.

## 2. Reason enum (fixed)

`WELCOME`, `CANDLE`, `BIRTHDAY`, `EVENT`, `PURCHASE`, `PLUS_GRANT`, `CONSULTATION`, `COMPATIBILITY`,
`PREMIUM_REPORT`, `REFUND`, `REVERSAL`, `ADMIN_ADJUSTMENT`.

- Credits (`+`): WELCOME, CANDLE, BIRTHDAY, EVENT, PURCHASE, PLUS_GRANT, (REFUND/REVERSAL when they restore Duk).
- Debits (`−`): CONSULTATION, COMPATIBILITY, PREMIUM_REPORT, (REVERSAL when it claws back a grant), ADMIN_ADJUSTMENT (either sign).

## 3. Proposed DDL (design — not applied)

```sql
-- ledger: append-only signed deltas, one bucket per row.
create table public.duk_ledger (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  bucket       text not null check (bucket in ('PLUS','REWARD','PAID')),
  delta        integer not null check (delta <> 0),
  reason       text not null check (reason in (
                 'WELCOME','CANDLE','BIRTHDAY','EVENT','PURCHASE','PLUS_GRANT',
                 'CONSULTATION','COMPATIBILITY','PREMIUM_REPORT','REFUND','REVERSAL','ADMIN_ADJUSTMENT')),
  -- idempotency + provenance
  session_id   uuid,                 -- set for CONSULTATION/COMPATIBILITY/PREMIUM_REPORT spends
  request_id   text,                 -- the paid request id (idempotency for the first-turn charge)
  purchase_id  text,                 -- store transaction id for PURCHASE/REFUND
  expires_at   timestamptz,          -- per-row expiry (bucket-dependent policy); null = no expiry
  created_at   timestamptz not null default now(),
  metadata     jsonb                 -- bounded, non-PII (e.g. { "pack": "FIRST" })
);
create index duk_ledger_user_bucket_idx on public.duk_ledger (user_id, bucket);
create index duk_ledger_user_created_idx on public.duk_ledger (user_id, created_at desc);
-- one charge per (session, reason, BUCKET): the first-turn commit cannot double-charge on retry.
-- ⚠ 2026-09-06 (H7): `bucket` was MISSING from this key. A price that spans two buckets writes one debit
-- PER BUCKET (that is the design — balances are grouped by bucket), so two rows collided on the same key and
-- the whole commit rolled back. Every paid product failed whenever REWARD remained but the price exceeded it
-- — i.e. the default state of a user who has purchased Duk. Superseded by migration
-- 20260908000000_duk_ledger_bucket_unique.sql; see docs/PAID_PATH_MATRIX.md §3.
create unique index duk_ledger_session_reason_bucket_uniq
  on public.duk_ledger (session_id, reason, bucket) where session_id is not null;
-- one grant per (user, reason, request) for idempotent grants (e.g. one WELCOME).
create unique index duk_ledger_grant_uniq on public.duk_ledger (user_id, reason, request_id)
  where request_id is not null;

-- balance projection (derived; never mutated directly).
create view public.duk_balance as
  select user_id, bucket, sum(delta) as balance
  from public.duk_ledger
  where expires_at is null or expires_at > now()
  group by user_id, bucket;

alter table public.duk_ledger enable row level security;
create policy duk_ledger_select_own on public.duk_ledger for select using (user_id = auth.uid());
-- NO insert/update/delete policy: service-role RPC is the only writer.
```

## 4. Spend RPC contract (design)

`spend_duk(p_user_id, p_amount, p_reason, p_session_id, p_request_id)` — service-role, `security definer`:

1. Assert service role.
2. Idempotency: if a row already exists for `(session_id, reason)` (or `(user_id, reason, request_id)`), return
   it — **no double charge**.
3. Read non-expired balances per bucket.
4. If `PLUS + REWARD + PAID < p_amount` → raise `insufficient_duk` (the caller maps to a shortfall, never a
   negative row).
5. Deduct across buckets in priority `PLUS → REWARD → PAID`, writing one debit row **per bucket touched** (so
   the provenance of each spent unit is preserved).
6. Return the new balances.

Steps 2–6 run in one transaction. The billing state machine (§R) calls this exactly once, on the first
successful turn.

## 5. Debt model (§Q)

A refund of already-spent `PAID_DUK` (e.g. a store-initiated refund of a pack whose Duk is gone) must **not**
create a negative ledger balance. Instead:

```sql
create table public.duk_debt (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  amount       integer not null check (amount > 0),   -- outstanding PAID_DUK obligation
  origin       text not null,                          -- e.g. 'REFUND'
  purchase_id  text,
  resolved     boolean not null default false,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index duk_debt_user_open_idx on public.duk_debt (user_id) where not resolved;
alter table public.duk_debt enable row level security;
create policy duk_debt_select_own on public.duk_debt for select using (user_id = auth.uid());
```

**Debt rules:**

- Debt is offset **only against future `PAID_DUK`** (the next PURCHASE credits, then debt claws back from it
  before the Duk is usable). It is **never** offset against `REWARD_DUK` or `PLUS_DUK`.
- While debt is open, the user can **still** receive and spend `CANDLE`, `BIRTHDAY`, `EVENT`, and any
  `REWARD_DUK` / `PLUS_DUK` normally — debt never freezes the free/subscription economy.
- Debt is an obligation ledger, not a balance; it can never make a bucket balance negative.
- **Refund abuse** (repeated buy → spend → refund) is a **separate risk concern**, tracked in
  [POLICY_TERMS_REQUIREMENT_MAP.md](POLICY_TERMS_REQUIREMENT_MAP.md) and analytics, not solved by the debt model
  itself. Candidate mitigations (owner decision): per-account refund caps, velocity checks, holdback on new PAID
  Duk while abuse-flagged — none implemented in V1.

## 6. What Sprint F does NOT do

- No table creation, no migration application.
- No balance UI, no purchase flow, no store integration.
- No pricing finalization (§DUK_ECONOMY_SPEC_V1 numbers are hypotheses).
