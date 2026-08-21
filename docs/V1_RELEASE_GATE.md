# V1 RELEASE GATE (§Y)

> **Status:** GATE DEFINITION (Sprint F). Tracks the nine gates that must close before V1 ships. Status is as of
> the Sprint F freeze candidate. "Done" = code complete + tested locally; owner/deploy items are marked.

| Gate | Scope | Status | Blocking items |
|---|---|---|---|
| **G1 Consultation Core** | authority pipeline, safety, follow-ups, atomic persistence, auth boundary | **FREEZE CANDIDATE** | none (owner: apply migrations, redeploy Edge) |
| **G2 LLM Cost Benchmark** | real token/cost per workload + model (Mini/Terra) | **HARNESS READY / NOT EXECUTED** | no local API key (server-only secret); owner runs benchmark |
| **G3 Duk Economy Backend** | ledger, buckets, spend priority, debt, session billing | **SPEC ONLY** | build ledger + spend RPC + session charge (design done) |
| **G4 IAP** | Duk packs + PLUS, receipt validation, store products | **SPEC ONLY** | create store products; build receipt-validation Edge |
| **G5 Global Spend Guard** | daily/monthly budget, thresholds, kill switch, per-model | **PARTIAL (live)** | add monthly window + per-model attribution; verify cached-read exemption |
| **G6 Policy / Terms** | 8 documents matching code | **REQUIREMENT MAP DONE** | owner/counsel drafts Korean text |
| **G7 Analytics** | Duk + acquisition funnel events | **CONTRACT DONE** | implement `trackEconomyEvent` emitters |
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

## 3. Ship criteria

V1 ships when G1 (frozen), G2 (benchmarked → prices set), G3+G4 (Duk + IAP live), G5 (monthly + per-model),
G6 (policies published), G7 (events emitting), G8 (device E2E passed), and at least a **minimal** G9
(channel-level attribution) are closed. G3/G4 are the critical path after the benchmark.
