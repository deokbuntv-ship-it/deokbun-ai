# POLICY / TERMS REQUIREMENT MAP (§V)

> **Status:** REQUIREMENT MAP ONLY (Sprint F). This does **not** write legal language. It maps each user-facing
> policy document to the **code features it must match**, so the owner (or counsel) can draft accurate Korean
> text and so drift between product behavior and policy is caught. Legal wording is an owner/counsel action.

## 1. Required documents → feature dependencies

| Document | Must accurately describe (feature) | Source of truth |
|---|---|---|
| 서비스 이용약관 | account, consultation session model, 5-turn/24h TTL, AI nature, prohibited use, service changes/termination | [SESSION_BILLING_STATE_MACHINE.md](SESSION_BILLING_STATE_MACHINE.md), [AI_DISCLAIMER_CONTRACT.md](AI_DISCLAIMER_CONTRACT.md) |
| 개인정보처리방침 | birth data handling, auth providers (Kakao/Google/Naver/Apple), retention, analytics (no-PII), third parties (Supabase/OpenAI) | code: auth, `product_events` (no PII), Edge (OpenAI) |
| 유료서비스 / 덕 이용정책 | **Duk**: reward/paid/plus buckets, expiry, spend priority, refund, duk_debt, session pricing, outage handling, service end | [DUK_ECONOMY_SPEC_V1.md](DUK_ECONOMY_SPEC_V1.md), [DUK_LEDGER_DATA_MODEL.md](DUK_LEDGER_DATA_MODEL.md) |
| 청약철회 / 환불 | consumable Duk refundability, first-turn-commit charge point, no-refund-on-later-fail / TTL / voluntary-exit, duk_debt | §R, §Q |
| PLUS 구독 / 자동결제 / 해지 | auto-renew terms, PLUS_Duk grant + period-end expiry, cancellation, store-managed billing | [PRODUCT_CATALOG_SPEC.md](PRODUCT_CATALOG_SPEC.md) §2 |
| AI 생성 콘텐츠 고지 | AI-generated, may be inaccurate, not professional advice, safety scope | [AI_DISCLAIMER_CONTRACT.md](AI_DISCLAIMER_CONTRACT.md) |
| 미성년자 이용 및 결제 | age gate, guardian consent for IAP, refund handling for minors | owner decision (age policy not yet in code) |
| 마케팅 수신 동의 / 철회 | opt-in/out for marketing push/email, separate from transactional | code: retention notification prefs (`retention` feature) |

## 2. The Duk policy MUST state (and match code exactly)

The 덕 이용정책 must enumerate, consistent with [DUK_ECONOMY_SPEC_V1.md](DUK_ECONOMY_SPEC_V1.md):

1. **보상덕 (REWARD_DUK)** — how earned (WELCOME/CANDLE/BIRTHDAY/EVENT), non-refundable, expiry window.
2. **구매덕 (PAID_DUK)** — purchased, refundable per policy, expiry window (hyp. 5년).
3. **PLUS덕 (PLUS_DUK)** — subscription grant, expires at period end, no rollover.
4. **유효기간 (expiry)** — per bucket; expiry order = most-perishable first.
5. **차감순서 (spend priority)** — `PLUS → REWARD → PAID` (fixed).
6. **환불 (refund)** — what is refundable (unused PAID_DUK), what is not (spent Duk, REWARD/PLUS), and the
   first-turn charge commit point.
7. **duk_debt** — a refund of already-spent PAID_DUK creates an obligation offset only against future PAID_DUK;
   never touches REWARD/PLUS; never blocks free grants.
8. **장애 (outage)** — a failed/undelivered turn is not charged; global-guard exhaustion blocks new paid work
   without charging.
9. **서비스 종료 (termination)** — unwind of PAID_DUK per refund policy; REWARD/PLUS carry no cash obligation.

Each numbered item has a code counterpart; if the code changes, this map flags the policy line to update.

## 3. Refund-abuse (risk, separate from terms)

Refund abuse (buy → spend → refund loops) is a **risk concern**, not a terms clause. Candidate controls
(per-account refund caps, velocity checks, holdbacks) are listed in [DUK_LEDGER_DATA_MODEL.md](DUK_LEDGER_DATA_MODEL.md)
§5. The terms should reserve the right to limit abusive refund behavior; the mechanism is an owner decision.

## 4. Owner actions

- Draft each document in Korean (owner/counsel); do **not** auto-generate legal text.
- Verify each 덕 이용정책 clause against the shipped code before launch (this map is the checklist).
- Decide the minor-use + IAP age-gate policy (not yet represented in code).
