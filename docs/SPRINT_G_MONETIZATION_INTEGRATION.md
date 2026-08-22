# SPRINT G — MONETIZATION INTEGRATION & CONTRACTS

> Consolidates the integration seams + UI/policy contracts from Sprint G that are design/owner-gated (no UI
> redesign, no deploy). The buildable code (model router, wallet core, session billing, candle, wallet service,
> billing-adapter interface, migrations) shipped in this sprint's commits.

## §AW — consultation integration boundary (Duk gate around the FROZEN core)

```
AUTH → SAFETY (crisis hard-stop) → OWNERSHIP → SESSION ENTITLEMENT → DUK BALANCE → DUK RESERVE
      → PAID/GLOBAL ADMISSION → LLM → VALIDATOR → PERSIST → SESSION CHARGE COMMIT
```

- The frozen consultation decision core is **unchanged**. Monetization is admission (before) + commit (after).
- General consultation = 5-Duk session; compatibility = 12-Duk session; safety hard-stop = **0 Duk**.
- The Duk reserve + commit slot into the **existing** atomic completion RPC
  (`complete_consultation_request_with_decision`) so "answer persisted" and "session charged" are one
  transaction (never charged-and-undelivered). Wiring the `spend_duk`/reserve calls into the Edge is the next
  build step (EDGE_RUNTIME_NOT_EXECUTED this sprint); the invariant model + RPCs are ready
  (`src/features/duk/*`, migrations `20260831`/`20260832`).

## §AE — PLUS foundation

`plus_entitlements` table (is_plus / started_at / expires_at / source). PLUS **never** changes the model
(a PLUS user's general question is still Mini) and **never** changes deterministic answer quality. Candidate
persistent benefits (multi-profile, long-term memory, full history, alerts, report storage) are entitlement
gates, not answer-quality gates. PLUS price + monthly Duk = **TBD** (owner + benchmark). Not monetized this sprint.

## §AK — analytics privacy (RELEASE_BLOCKED until remote apply)

The server-validated `record_product_event` RPC (migration `20260830000000`) + the RPC-first client shipped in
F.1. **RELEASE BLOCKER:** the direct-insert policy (`product_events_insert_own`) must be revoked (migration
`20260830000000` STEP 2) after the RPC-using client is deployed to all users — until then a modified client can
still direct-insert. Mark G7 RELEASE_BLOCKED on this revoke.

## §AN — onboarding IA contract (no redesign this sprint)

The user must be able to **notice Compatibility before spending all 10 Welcome Duk** — without being forced.
Track the first post-onboarding action via `first_action_after_onboarding` (`COMPATIBILITY` / `GENERAL_CONSULTATION`
/ `TODAY` / `OTHER`) and `home_compatibility_impression`, so a low compatibility-conversion can be attributed to
IA-failure vs click-failure vs Duk-gap-failure (see §AM). The actual Home surface change is a later UI sprint;
this fixes the analytics contract that measures it.

## §AO — user wallet UI contract (data hooks, not final visuals)

Hooks (`src/features/duk/dukWalletService`): `getWalletState()` → 보유 덕 (combined spendable), per-bucket +
debt; `getCandleAvailability(now)` → 초 켜기 / 덕을 쌓는 시간 (can_light + next_available_at); `lightCandle()`.
Surfaces to prepare: 보유 덕, 초 켜기, 덕 부족 (shortfall), 덕 충전 (paywall), 세션 잔여 (turn count / TTL).
UI may show ONE combined Duk number; accounting internals (buckets/debt) stay separate/server-authoritative.

## §AP — payment failure UX contract

States (never expose internal DB/provider errors; never claim a charge that did not commit):
`INSUFFICIENT_DUK`, `RESERVATION_FAILED`, `FIRST_TURN_FAILED` (0 charged), `SESSION_EXPIRED`, `PURCHASE_PENDING`,
`PURCHASE_FAILED`, `PURCHASE_RESTORED`, `REFUND_PROCESSED`. First-turn failure explicitly reports "0 charged".

## §AR — terms/policy mapping delta

Update [POLICY_TERMS_REQUIREMENT_MAP.md](POLICY_TERMS_REQUIREMENT_MAP.md) to the implemented behavior:
REWARD/PAID/PLUS buckets; spend order PLUS→REWARD→PAID; per-bucket expiry; 5-Duk general / 12-Duk compatibility
session charge on first success; 24h/5-turn session; failed-turn no-refund; refund/revocation idempotency;
`duk_debt` offset-only-vs-future-PAID; outage (no charge); termination; PLUS auto-renew. Do not finalize Korean
legal text (owner/counsel).

## §AS — minor purchase (RELEASE BLOCKER, not a legal invention)

Minor use/payment policy must be verified against Korean requirements + current Apple/Google rules **before**
public IAP launch. The implementation stays compatible with a future minor-purchase gate (age check +
guardian-consent seam at the billing adapter). No rule invented here.

## §AU — migrations review

Unapplied additive drafts, no duplicate schema, all OWNER_APPLY (validate in staging; no remote apply):
- `20260829000000_consultation_decisions.sql` (E.1) — server decision store.
- `20260830000000_product_events_server_validation.sql` (F.1) — analytics RPC (+ STEP 2 revoke).
- `20260831000000_duk_economy_foundation.sql` (F.1) — ledger/debt/reserve/spend_duk/grant_duk.
- `20260832000000_duk_economy_runtime.sql` (G) — economy_policy/sessions/candle/events/plus + light_candle.
No overlap; each adds distinct objects. Timestamps ordered.

## §AT — V1.1 reunion report

Roadmap only (see [V1_1_REUNION_REPORT_BOUNDARY.md](V1_1_REUNION_REPORT_BOUNDARY.md)). NOT implemented. Terra
candidate; separate premium product; not a renamed compatibility.
