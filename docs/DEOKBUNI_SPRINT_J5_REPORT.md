# DEOKBUNI SPRINT J5 — ADMIN ECONOMY + LLM OPERATIONS REPORT

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` · Additive, staging-only. Nothing pushed. Frozen core + product/billing semantics untouched.

## Objective
Close admin/operations gaps: (A) Duk economy administration, (B) LLM cost/usage visibility, (C) consultation decision-audit inspector, (D) safe operational controls. No product semantics changed.

## Migration `20260842000000_admin_economy_ops.sql` (applied to STAGING only)
All is_admin()-gated SECURITY DEFINER RPCs reading the append-only ledger/business tables (never analytics):
- **`admin_audit_log`** table — immutable record of privileged admin actions (append-only, RLS-locked).
- **`admin_economy_overview(from,to)`** — grants/spends by reason, bucket balances, totals, debt (open/resolved), purchases, revocations.
- **`admin_user_wallet(user)`** — spendable, buckets, active reserves, sessions, debt, recent ledger.
- **`admin_list_duk_ledger(user,reason,limit)`** — filtered ledger rows.
- **`admin_adjust_duk(user,amount,bucket,note)`** — the ONE audited adjustment path: appends an `ADMIN_ADJUSTMENT` ledger row (immutable, positive=credit/negative=debit) + an `admin_audit_log` entry; a debit can never drive a bucket below zero. No table UPDATE, no history rewrite.
- **`admin_list_audit_log(limit)`** + **`admin_get_consultation_audit(conversation)`** (versions + polarity/domain metadata; **no** prompt/question/answer/chain-of-thought).

## A. Duk economy admin
New console `src/app/admin/economy/index.tsx` (sidebar "덕 경제" → `/admin/economy`): overview KPIs (grants/spends by reason, bucket balances, debt, purchases, revocations), user wallet lookup, **audited manual adjustment** form (credit/debit + required note + immutable-ledger caption + double-submit guard), and the audit-log table. Service `adminEconomyService` — thin, fail-clean RPC wrappers; no direct table mutation; the client can neither edit nor delete history.

## B. LLM cost / usage
`modelPricing.ts` — a verified pricing repository (gpt-5-mini / gpt-5-nano, USD, from the confirmed OpenAI constants). **gpt-5.6-terra is intentionally absent** → `computeCost` returns null → the ai-usage screen shows **"가격 미확인"**, never a fabricated cost. Wired a **모델별 비용** breakdown into `/admin/ai-usage` (per-model requests/tokens/USD cost for priced models; unpriced label otherwise), scoped + labeled to the loaded logs (all-time windowed cost still needs server aggregation). **No KRW** derived (no explicit FX source). The existing global spend-guard / kill-switch (`system-settings`) was audited only — healthy, fail-closed, left unchanged.

## C. Consultation decision-audit inspector
`/admin/consultations/[conversationId]` now surfaces the server-owned `consultation_decisions` scalars (workload, answer-plan / decision-policy / engine versions, model id, polarity, domain) via `adminConsultationsService.getConsultationAudit`. **No chain-of-thought / prompt / question / answer text** — stored or shown (guard-tested); the screen states this explicitly.

## Staging proof (J5.11) — auto-rolled-back (nothing persisted)
- **Objects**: all 5 functions + `admin_audit_log` exist.
- **Fail-closed**: `admin_economy_overview` / `admin_adjust_duk` / `admin_user_wallet` all raise "not authorized" for a non-admin caller.
- **Adjustment mechanics**: a REWARD credit moved the balance 0→7, appended exactly one ledger row + one audit row; the debit-floor guard correctly blocks an over-debit. All rolled back.

## Gates
tsc **0** · jest **186 suites / 1818 tests** (+ modelPricing, adminAuditNoCot) · web export **PASS** (`/admin/economy`) · frozen diff **0** (engines/consult-core/duk-prices/economy-cores) · economy diagnostics **0/11**.

## Verdicts
- J5_ADMIN_ECONOMY = **PASS**
- J5_LLM_OPERATIONS = **PASS** (verified-only cost; Terra UNPRICED; spend-guard audited healthy)
- FROZEN_CONSULTATION_CORE = YES · CLIENT_CAN_GRANT_DUK_DIRECTLY = NO (adjustment is is_admin server RPC only) · PRODUCTION_MUTATIONS = 0

## HIGH finding for the owner (NOT patched — frozen financial constraint)
The frozen IAP function `record_revocation` (`supabase/migrations/20260834000000_iap.sql:100`) writes `duk_ledger.reason = 'DEBT_OFFSET'`, but `'DEBT_OFFSET'` is **not** in the `duk_ledger` reason CHECK — so a refund→debt-offset would fail the constraint. This is latent (05B/store is deferred, so refunds aren't live). I did **not** modify the frozen financial constraint autonomously. **Owner fix:** an additive migration widening the CHECK to include `'DEBT_OFFSET'` (`alter table … drop constraint duk_ledger_reason_check, add constraint … check (reason in (… , 'DEBT_OFFSET'))`).

## Owner action (deferred, non-blocking)
1. Apply the DEBT_OFFSET CHECK fix (above) before enabling store refunds (05B). 2. Full live admin verification of the economy console / adjustment / inspector requires an admin JWT (owner smoke) — the authorized path is code-verified + gate-proven + mechanics-proven here. 3. Server-side windowed LLM cost aggregation (today/7d/30d) if all-time cost totals are wanted beyond the per-page breakdown.
