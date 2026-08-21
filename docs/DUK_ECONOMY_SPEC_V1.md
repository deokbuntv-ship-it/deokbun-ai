# DUK ECONOMY SPEC V1 (덕 경제 명세)

> **Status:** SPEC ONLY (Sprint F §N/§O). No backend, no pricing finalization, no IAP product creation.
> Every number below is a **POLICY VALUE** — tunable after the LLM cost benchmark (§K/§M) lands. This document
> defines the *contract*; the ledger model is [DUK_LEDGER_DATA_MODEL.md](DUK_LEDGER_DATA_MODEL.md), the billing
> state machine is [SESSION_BILLING_STATE_MACHINE.md](SESSION_BILLING_STATE_MACHINE.md), the catalog is
> [PRODUCT_CATALOG_SPEC.md](PRODUCT_CATALOG_SPEC.md).

## 1. What a Duk (덕) is

A **Duk** is the internal prepaid unit a user spends to run a paid consultation product. It decouples the KRW
price of an IAP pack from the per-product price, so the two can be tuned independently (a benchmark-driven
per-product price change does not require a new store product). Duk is **not** money, is **non-transferable**,
has **no cash-out**, and its balance is authoritative on the server (never the client).

## 2. Duk classes (three buckets)

| Class | Origin | Refundable to cash | Expiry (POLICY) |
|---|---|---|---|
| `PLUS_DUK` | granted by an active PLUS subscription | no | end of the subscription period (does not roll over) |
| `REWARD_DUK` | WELCOME, CANDLE, BIRTHDAY, EVENT, ADMIN_ADJUSTMENT | no | POLICY (V1 hypothesis: 없음/장기; see §7) |
| `PAID_DUK` | PURCHASE (IAP) | yes, subject to refund policy | POLICY (V1 hypothesis: 5년 — 전자상거래법 상한 근처) |

**Spend priority (fixed):** `PLUS_DUK → REWARD_DUK → PAID_DUK`. Rationale: burn the most-perishable,
least-cash-backed unit first, and preserve the user's cash-backed `PAID_DUK` as long as possible (fairer on
refund, and it keeps the paid balance meaningful). This priority is a hard rule, not a policy value.

## 3. Grants (V1 hypothesis — POLICY VALUES)

| Grant | Amount | Cadence / rule |
|---|---|---|
| `WELCOME` | **10 DUK** | once per account, at signup |
| `CANDLE` (촛불 켜기) | **+1 DUK** | signup day: immediately available once. Thereafter **+1 / 24h** |
| `BIRTHDAY` | POLICY (hyp. small) | once per birthday (deterministic; Feb 29 handled per existing retention rule) |
| `EVENT` | POLICY | admin/campaign, bounded |

`CANDLE` D1–D7 **acceleration is DEFAULT OFF**. It exists only as a configurable policy lever (e.g. a
retention experiment could grant +N on days 1–7); it must never be silently on.

## 4. Product prices (V1 hypothesis — POLICY VALUES)

| Product | Price (DUK) | LLM path today | Model target (§J) |
|---|---|---|---|
| GENERAL CONSULTATION (일반 상담 세션) | **5 DUK** | live (gpt-5-mini) | Mini |
| COMPATIBILITY (궁합) | **12 DUK** | live (gpt-5-mini) | Terra |
| PREMIUM REPORT (프리미엄 리포트) | **50 DUK** | **not built** (deterministic composer only; LLM narrative = owner-gated seam) | Terra |

Prices are **hypotheses to be re-calibrated** after §K/§M gives real token cost per workload/model. A product
price must cover its expected LLM cost with margin *and* stay legible to the user (small integers).

## 5. Session model (a "session" = one paid consultation product instance)

- A GENERAL / COMPATIBILITY purchase opens a **session**: **max 5 successful turns**, **TTL = 24h**.
- The **first successful turn commits the full session price** (5 / 12). Turns 2–5 are included — no further
  Duk is charged inside the session.
- A **failed** turn is **not** counted toward the 5 and is **not** charged (see the billing state machine §R).
- TTL expiry or the user leaving forfeits any unused turns — **no refund** (they bought a session, not N turns).

`max 5 turns` and `TTL 24h` are POLICY VALUES.

## 6. Initial compatibility gap (§O — deliberate, documented)

The first-day arithmetic is intentional and must be preserved:

```
signup            → +10 (WELCOME)          balance 10
signup-day candle → +1  (CANDLE immediate) balance 11
                  → COMPATIBILITY needs 12 → SHORT by 1
D1 candle         → +1  (CANDLE / 24h)     balance 12 → compatibility now affordable
```

- **No separate free compatibility trial** is granted. The gap is a feature, not a bug: it gives the compatibility
  product a real first-purchase moment while keeping a returning user one day away from affording it for free.
- **The shortfall can exceed 1** if the user spends a general consultation (−5) first. That is expected. Home /
  onboarding must therefore **make compatibility *visible and understood*, without forcing or nagging it**.
- V1 does **not** redesign Home/onboarding UI for this. Sprint F only defines the **analytics contract** that
  measures the gap (see `compatibility_insufficient_duk` in [ANALYTICS_CONTRACT.md](ANALYTICS_CONTRACT.md),
  which carries `duk_balance_at_entry`, `duk_shortfall`, per-bucket balances, `prior_consultation_count`,
  `days_since_signup`). The Home compatibility awareness surface is a later, data-informed UI decision.

## 7. Expiry, debt, and edge cases

- **Debt:** a refund of already-spent `PAID_DUK` must never drive the balance negative. It creates a separate
  **`duk_debt`** obligation. See [DUK_DEBT_MODEL.md](DUK_DEBT_MODEL.md) (§Q). Debt never blocks CANDLE / BIRTHDAY
  / EVENT / REWARD grants or spending of REWARD/PLUS Duk; it is only offset against *future* `PAID_DUK`.
- **Expiry order:** when expiring, expire in the same priority as spend (most-perishable first) so a user's
  cash-backed balance is the last to lapse.
- **Service termination:** on shutdown, `PAID_DUK` unwind follows the refund/terms policy
  ([POLICY_TERMS_REQUIREMENT_MAP.md](POLICY_TERMS_REQUIREMENT_MAP.md)); REWARD/PLUS Duk carry no cash obligation.

## 8. Invariants (must hold in code + DB)

1. Balance is server-authoritative; the client never computes or writes a balance.
2. The ledger is **append-only**; balance is a **derived projection**, never a directly-mutated field (§P).
3. Spend priority `PLUS → REWARD → PAID` is enforced atomically with the reserve.
4. No negative balance — ever. Shortfalls block the purchase; refunds create debt.
5. A product price is charged **once per session**, on the **first successful turn**, idempotently.
6. Every Duk mutation carries a `reason` from the fixed enum (§P) and, for spend, the `session`/`request` id.

## 9. Owner decisions before implementation

- Confirm/adjust every POLICY VALUE (grants, prices, TTL, turn cap, expiry windows) **after** the benchmark.
- Decide `REWARD_DUK` / `PAID_DUK` expiry windows (legal + accounting input).
- Approve the spend-priority and no-free-trial stance (§2, §6).
