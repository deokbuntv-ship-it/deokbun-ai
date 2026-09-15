# PRODUCT CATALOG SPEC (§U)

> **Status:** HYPOTHESIS ONLY (Sprint F). No Apple/Google product is created. Prices are POLICY VALUES to be
> confirmed after the §K/§M benchmark. Only a **naming-convention proposal** is given for store product ids —
> real ids are an owner action.

## 1. Duk packs (consumable IAP) — hypothesis

| Pack | Duk | Price (KRW) | Constraint | KRW / Duk |
|---|---|---|---|---|
| FIRST | 20 | 2,900 | **once per account lifetime** | 145 |
| BASE | 50 | 9,900 | repeatable | 198 |
| LARGE | 120 | 19,900 | repeatable | 166 |

- FIRST is a loss-leader first-purchase pack (best KRW/Duk) gated to once per account (server-enforced via the
  ledger's idempotent `PURCHASE` provenance + a lifetime flag).
- LARGE is priced slightly better per Duk than BASE to reward larger single purchases — **but** PLUS (§2) must
  remain the economical choice for heavy repeat users, so LARGE's per-Duk price is deliberately *not* aggressive.

## 2. PLUS (auto-renewing subscription) — hypothesis

| Field | Value |
|---|---|
| Price | **TBD** (owner + benchmark) |
| Monthly Duk grant (`PLUS_DUK`) | **TBD** |
| Constraint | must be **more economical than repeatedly buying LARGE** for a heavy user |

Design rule: `monthly_price / monthly_PLUS_Duk` must be **below** `LARGE.price / LARGE.duk` (166 KRW/Duk in the
hypothesis). Otherwise a heavy user rationally buys LARGE packs and never subscribes. Set PLUS Duk + price
together against benchmarked heavy-user consumption (e.g. N compatibility + M consultations / month).

## 3. Store product id naming convention (PROPOSAL — not created)

Real product ids are created by the owner in App Store Connect / Play Console. Proposed convention:

```
consumable   duk pack:   duk.pack.first_20      duk.pack.base_50      duk.pack.large_120
subscription plus:        plus.monthly
```

- Lowercase, dot-separated, `<domain>.<type>.<name>_<size>`.
- Encode the Duk size in the id so a mis-mapped product is obvious in logs.
- One id per platform, mapped server-side to `{ duk, krw, lifetime_once }` in a server catalog table (owner
  data, not client) so a price change never requires a client release.

## 4. Server catalog (design)

A `product_catalog` table (owner-managed, service-role write, public read of active rows) maps each store product
id → `{ duk_amount, price_krw, kind: 'consumable'|'subscription', lifetime_once: bool, active: bool }`. The IAP
receipt-validation Edge credits `PAID_DUK` via `spend_duk`'s credit counterpart, keyed by the store transaction
id (idempotent). **Not built this sprint** — this is the U↔P integration seam.

## 5. Owner actions

- Finalize all prices + PLUS terms **after** the benchmark.
- Create the real store products (Apple/Google) with the confirmed ids.
- Decide FIRST-pack lifetime-once enforcement + refund posture (ties to §Q debt + §V terms).
