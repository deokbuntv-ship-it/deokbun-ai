# V1 RELEASE GATE (§Y)

> **Status:** GATE DEFINITION (updated Sprint F.1). Tracks the nine gates that must close before V1 ships, plus
> the F.1 sub-gates (§3). "Done" = code complete + tested locally; owner/deploy items are marked.

| Gate | Scope | Status | Blocking items |
|---|---|---|---|
| **G1 Consultation Core** | authority pipeline, safety, follow-ups, atomic persistence, auth boundary | **FINAL FREEZE APPROVED** (F.1) | none (owner: apply migrations, redeploy Edge) |
| **G2 LLM Cost Benchmark** | real token/cost per workload + model (Mini/Terra) | **HARNESS FINALIZED / LIVE BLOCKED_EXTERNAL** (G) | official pricing + FX + caching analysis wired; no local key → owner runs live |
| **G3 Duk Economy Backend** | ledger, buckets, spend priority, debt, session billing | **BACKEND CORE + MIGRATIONS + WALLET SERVICE** (G) | Edge wiring of spend/reserve into billing order + apply migrations (LIVE_DB_UNVERIFIED) |
| **G4 IAP** | Duk packs + PLUS, receipt validation, store products | **SPEC ONLY** | create store products; build receipt-validation Edge |
| **G5 Global Spend Guard** | daily/monthly budget, thresholds, kill switch, per-model | **PARTIAL (live) + MODEL ROUTER (G)** | per-model attribution now feasible (router stamps modelId); add monthly window; §N request-id fix |
| **G6 Policy / Terms** | 8 documents matching code | **REQUIREMENT MAP DONE** | owner/counsel drafts Korean text |
| **G7 Analytics** | Duk + acquisition funnel events | **CONTRACT DONE + SERVER ENFORCEMENT DRAFTED** (F.1) | apply record_product_event migration + STEP 2 revoke; implement emitters |
| **G8 Device E2E** | real iOS/Android login → consult → pay flow | **NOT STARTED** | owner device QA (needs bundle ids + store setup) |
| **G9 Acquisition Attribution** | shortform → install → signup → Duk → compatibility → first purchase, by creative/channel/campaign | **NOT STARTED** | attribution approach (see §2) |

## 1. Gate detail

- **G1** — see [CONSULTATION_CORE_FREEZE.md](CONSULTATION_CORE_FREEZE.md). Owner actions: apply pending
  migrations, redeploy the `chat` Edge.
- **G2** — see [LLM_COST_BENCHMARK.md](LLM_COST_BENCHMARK.md). Harness + fixtures ready; live run needs a safely
  provisioned key + owner go (spends money).
- **G3/G4** — see [DUK_ECONOMY_SPEC_V1.md](DUK_ECONOMY_SPEC_V1.md), [DUK_LEDGER_DATA_MODEL.md](DUK_LEDGER_DATA_MODEL.md),
  [SESSION_BILLING_STATE_MACHINE.md](SESSION_BILLING_STATE_MACHINE.md), [PRODUCT_CATALOG_SPEC.md](PRODUCT_CATALOG_SPEC.md).
- **G5** — see [GLOBAL_SPEND_GUARD_SPEC.md](GLOBAL_SPEND_GUARD_SPEC.md).
- **G6** — see [POLICY_TERMS_REQUIREMENT_MAP.md](POLICY_TERMS_REQUIREMENT_MAP.md), [AI_DISCLAIMER_CONTRACT.md](AI_DISCLAIMER_CONTRACT.md).
- **G7** — see [ANALYTICS_CONTRACT.md](ANALYTICS_CONTRACT.md).

## 2. G9 — acquisition attribution (design constraints)

Target chain, attributable by **creative_id / channel / campaign**:

```
Shortform → tracked link → Store → Install → Signup → DUK → Compatibility → First Purchase
```

- **Do NOT add Firebase Dynamic Links** as a new dependency (deprecated; explicitly excluded).
- **Do NOT finalize an attribution vendor** this sprint.
- Design seam: a tracked link carries `creative_id/channel/campaign`; the values survive Store install via a
  deferred-deep-link / campaign-parameter mechanism (vendor TBD) and are recorded at **signup** into a
  non-PII acquisition record, then joined to the existing funnel events (§T) by the stable `analytics_key`.
- The existing ad-tracking work (admin CRUD + tracking URL + CAC/CPA, see memory `deokbunai-ads-tracking`) is
  the server-side home for campaign metadata; G9 connects install→signup attribution to it.

## 3. Sprint F.1 sub-gates (adversarial / integrity)

| Sub-gate | Belongs to | Status | Evidence |
|---|---|---|---|
| Comparison implicit-winner adversarial corpus | G1 | **DONE** | `implicitWinnerCorpus.test.ts` (32 unsafe + 11 safe + card-level) |
| Safety-before-spend for EVERY LLM workload | G1 | **DONE** | consultation (E.1) + compatibility (same path) + **summary** (F.1 §G/H); `summarySafetyBeforeSpend.test.ts` |
| Analytics DB-side PII enforcement | G7 | **DRAFTED** (RPC + client) | migration `20260830000000`; `productEventsPrivacy.test.ts`; owner applies + STEP 2 revoke |
| Wallet double-spend concurrency | G3 | **CONTRACT + RPC DRAFT** | `spend_duk` advisory-lock + fixed allocation; `DUK_IMPLEMENTATION_CONTRACT.md` §P |
| Session charge idempotency | G3 | **CONTRACT + RPC DRAFT** | unique `(session_id, reason)` / `charge_id`; §Q |
| Reserve TTL / fencing | G3 | **CONTRACT + TABLE DRAFT** | `duk_reserve` version fencing; §R (commit RPC = build step) |
| Refund / revocation replay | G3 | **CONTRACT + RPC DRAFT** | unique `purchase_id` / `revocation_id`; `grant_duk` idempotent; §S |
| Compatibility auth (live) + single-flight | G1 | **DONE** | `compatibilityConcurrencyAuth.test.ts` |
| Paid lease / global request idempotency | G1/G5 | **INVARIANT DOC + FIX SPEC** | `RUNTIME_LEASE_GLOBAL_IDEMPOTENCY.md` (§M holds; §N minimal fix specified) |
| Actual migration / RLS / RPC verification | G3/G7 | **OWNER** | apply drafts in staging; verify RLS no-write + RPC service-role-only |
| Deployed Edge bundle parity | G1 | **OWNER** | redeploy `chat` Edge with the regenerated bundle |
| IAP store-server authority | G4 | **SPEC** | receipt validation Edge credits PAID_DUK via `grant_duk` (idempotent) |

**Note:** unimplemented IAP (G4) is a **V1 RELEASE BLOCKER**, but it is **not** a Consultation-Core (G1) blocker.

## 4. Ship criteria

V1 ships when G1 (frozen), G2 (benchmarked → prices set), G3+G4 (Duk + IAP live), G5 (monthly + per-model),
G6 (policies published), G7 (events emitting), G8 (device E2E passed), and at least a **minimal** G9
(channel-level attribution) are closed. G3/G4 are the critical path after the benchmark.
