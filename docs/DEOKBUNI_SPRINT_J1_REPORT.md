# DEOKBUNI V1 — SPRINT J1 REPORT
## Duk Consumer Surface / Store-Independent Economy UX

**Date:** 2026-08-22
**Branch:** `admin/master-operations-content`
**Scope:** Client/UI only. No new migrations, no Edge changes, no store provisioning.
**Verdict:** `DEOKBUNI_SPRINT_J1_COMPLETE`

---

## 0. What this sprint delivered

A complete, **store-independent** consumer surface for the 덕(Duk) economy: users can now *see* their balance,
*earn* the free daily 덕 (candle), *understand* what 덕 costs, and hit an *actionable* paywall instead of a
dead-end error — all while purchase (store top-up) remains deferred to Activation 05B. The 덕 label is used
everywhere; internal buckets (PLUS/REWARD/PAID) are never shown. No 6th tab was added.

The client remains a **pure consumer of server truth**: every balance, price, shortfall, and session count comes
from the server. The client has *no* code path that grants, spends, commits, or reserves 덕. The only
balance-changing call it can make is the authenticated, atomic, self-scoped `light_candle`.

---

## 1. Files

### New (pure logic — unit-tested, no RN imports)
- `src/features/duk/pricing.ts` — display-only single source: `DUK_PRICES {general:5, compatibility:12, premium_report:50}`, `WELCOME_DUK=10`, `CANDLE_DUK=1`, `dukLabel(n)="${n}덕"`, `TOPUP_PACKS`.
- `src/features/duk/consumerDukView.ts` — pure presenters over server-authoritative state: `walletStateOf`, `walletHeadline`, `candleInitialState`, `candleCopy`, `sessionTurnCopy`, `insufficientView`.
- `src/features/duk/walletStore.ts` — pure single-flight wallet store factory (error preserves prior state).
- `src/features/duk/useWallet.ts` — RN hook (`useSyncExternalStore`) over a **module-singleton** store, so Home / Wallet / chat share ONE balance; plus `refreshWallet()` for fire-and-forget invalidation.

### New (screens)
- `src/app/wallet.tsx` — 덕 wallet: balance (server), candle earn loop, how-덕-works, 덕 충전 entry.
- `src/app/duk-topup.tsx` — store-gated shell: conceptual packs shown, **no buy control, no store call** (05B seam).

### New (tests)
- `src/features/duk/__tests__/consumerDukView.test.ts` — view-models (insufficient 4/5 + 11/12, session display, zero balance, server-trust).
- `src/features/duk/__tests__/walletStore.test.ts` — store (single-flight, error-preserves-state).
- `src/features/duk/__tests__/clientGrantGuard.test.ts` — **structural guard**: scans the real client tree; fails CI if any privileged RPC (`grant_duk`/`spend_duk`/`commit_session_reservation`/`reserve_session_duk`/…) is called from the client, or if the top-up shell gains a purchase path / buy control.

### Modified (UI wiring only — no consultation semantics changed)
- `src/app/(tabs)/index.tsx` — **§3** Home 덕 balance chip (shared wallet; states loading/loaded/zero/error; tap → `/wallet`; refreshes on tab focus).
- `src/app/(tabs)/my.tsx` — MY 덕 row → `/wallet`.
- `src/app/(tabs)/compatibility.tsx` — **§11** entry price “궁합 상담에는 12덕이 필요해요” before start.
- `src/app/chat.tsx` — **§8** live-session remaining-turn hint (`getSessionStatus` → `sessionTurnCopy`, shown only for an active paid session); **§9** actionable INSUFFICIENT_DUK card (server snapshot → `insufficientView`, routes to earn/top-up); **§14** `refreshWallet()`+session refresh after a charged turn.
- `src/app/compatibility-chat.tsx` — **§10** actionable INSUFFICIENT_DUK paywall (was a generic error).
- `src/app/_layout.tsx` — registered `wallet` + `duk-topup` routes.

---

## 2. Verdicts (as requested)

| Verdict | Result | Evidence |
|---|---|---|
| **HOME_DUK_BALANCE** | ✅ CODE_VERIFIED | Home chip renders `walletHeadline` over shared `useWallet`; tap → `/wallet`; tsc 0; web export `(tabs)/index` OK. |
| **WALLET_UI** | ✅ CODE_VERIFIED | `wallet.tsx`: server balance + candle + how-덕-works + 덕 충전; `wallet.html` exported. |
| **CANDLE_UX** | ✅ CODE_VERIFIED | `candleInitialState`/`candleCopy` (eligible/claiming/granted +1덕/cooldown); `lightCandle` server-atomic; refreshes wallet on grant. |
| **GENERAL_SESSION_UX** | ✅ CODE_VERIFIED | `getSessionStatus('general')` (read-only, owner-RLS) → `sessionTurnCopy`; shown **only** when `active` (never misleading when billing off). |
| **GENERAL_INSUFFICIENT_UX** | ✅ CODE_VERIFIED | chat consumes `insufficientDuk{balance,required,shortfall}` → `insufficientView('general',…)` card + 덕 받으러 가기 / 덕 충전. |
| **COMPATIBILITY_PRICE_UX** | ✅ CODE_VERIFIED | `DUK_PRICES.compatibility` (12덕) shown before start. |
| **COMPATIBILITY_INSUFFICIENT_UX** | ✅ CODE_VERIFIED | compat-chat consumes server snapshot → `insufficientView('compatibility',…)` paywall (replaced generic error). |
| **TOPUP_SHELL** | ✅ CODE_VERIFIED | packs display-only; **no buy control, no `functions.invoke`, no IAP import**; asserted by `clientGrantGuard.test.ts`. |
| **CLIENT_CAN_GRANT_DUK_DIRECTLY** | ✅ **NO** | grep of `src/`: 0 privileged RPCs; only `light_candle` in `dukWalletService`; locked by structural test. |
| **ANALYTICS_NO_PII** | ✅ PRESERVED | No analytics removed; insufficient/candle events carry product/amount/balance/shortfall only — no user text, no PII. |
| **ECONOMY_DIAGNOSTICS** | ✅ **0 / 0** | 11 read-only invariants on staging → `TOTAL_ANOMALIES = 0`. |
| **FROZEN_CONSULTATION_CORE** | ✅ **YES** | `git diff` of `myungri`/`qimen`/`ziwei` = 0 lines, 0 untracked; no decision/prompt/answer-plan file in the diff. |
| **PRODUCTION_MUTATIONS** | ✅ **0** | No `db push`/write/secret this sprint; the single DB command was a read-only SELECT against **staging** (`aephpsiurgkvqcswyeie`). Production (`olvkpaldrwvtexxpoaag`) never touched. |

---

## 3. Build gates (§23)

| Gate | Result |
|---|---|
| `tsc --noEmit` | **0 errors** |
| `jest` (full) | **175 suites / 1753 tests PASS** |
| `jest` (duk only) | **12 suites / 116 tests PASS** |
| `expo export --platform web` | **PASS** (`dist/`, exit 0; `wallet.html` + `duk-topup.html` present) |
| Economy diagnostics (staging, read-only) | **0 anomalies** |
| Frozen engine diff | **0 lines** |

---

## 4. Design invariants held

- **Server is the only money authority.** Client shows server numbers; it never computes shortfall or grants 덕. `insufficientView` echoes the server snapshot verbatim (a test proves it trusts even an “inconsistent” server shortfall — no client recompute).
- **One shared balance.** `useWallet` wraps a module-singleton store, so a candle grant (Wallet) or a charged turn (chat) invalidates the same balance the Home chip reads. `refreshWallet()` is the single fire-and-forget seam.
- **No misleading session copy.** The remaining-turn hint renders only for a server-confirmed active session; with billing off / no session it is silent.
- **Store deferral is structural, not cosmetic.** The top-up shell has no buy control and no store call, and a CI test fails if that changes.

---

## 5. Honest limitations

- **UI verdicts are CODE_VERIFIED, not live-rendered.** The interactive app is behind the OAuth / native-dev-build gate and cannot be launched in this environment. Correctness is established by `tsc` (0), pure-logic `jest` (view-models + store + structural guard), and a successful static web export (all routes emitted) — not by an on-device screenshot.
- **Session UX is dormant in a billing-off build.** `getSessionStatus` reads `consultation_sessions`; where `DUK_BILLING_ENABLED` is false (no sessions created) the hint stays hidden by design. It was exercised live on staging in Activation 04.
- **`insufficientView` primaryAction (CANDLE vs TOMORROW) is not evaluated inside chat.** To avoid duplicating candle-eligibility logic across screens, both paywalls route to `/wallet` (where the candle + balance + top-up live) rather than computing candle eligibility inline. The view-model still supports the distinction (used/tested) for a future inline variant.

---

## 6. Not done (by instruction)

- **J2 not started** (per spec: “Do NOT start J2 automatically.”).
- **Store provisioning (05B)** remains deferred to preserve 예비창업자 eligibility (no business registration / paid seller / real product IDs / real purchases).

---

`DEOKBUNI_SPRINT_J1_COMPLETE`
