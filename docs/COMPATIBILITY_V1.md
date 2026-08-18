# Compatibility (궁합) V1 — Architecture & Tier Model

Deterministic pairwise 궁합 built on the FROZEN Myungri engine, reusing the solo consultation
trust boundary, Decision Engine, validator, report, mailbox, and secure sharing. Users are not
buying engine complexity — they are buying **clarity about the relationship**: what fits, what
clashes, and how to carry the relationship forward.

## Pipeline

```
본인 self subject (is_self)  +  대상자 target subject
        │  (client sends BOTH birth INPUTs, consultationMode='compatibility')
        ▼
Edge chat → buildCompatibilityConsultation (server, trusted)
        │
        ├─ executeSajuFromBirthInput(self)   ─┐   FROZEN engine ×2 (recomputed server-side)
        ├─ executeSajuFromBirthInput(target) ─┘
        ▼
buildCompatibilityEvidence(self, target)              ← DETERMINISTIC pairwise layer (no LLM)
   computePairwiseRelations  → cross-chart 합·충·형·파·해 · 삼합/방합 · 십신 · 오행 보완
   deriveCompatibilityAssessment → transparent tally → per-dimension + overall TIER
        ▼
compatibility ConsultationGrounding (myungri slot = pairwise evidence; +asker 세운/월운·Qimen when temporal)
        ▼
deriveAnswerPlan(question, grounding, mode='compatibility')   ← SAME Decision Engine, pairwise directive
        ▼
buildCompatibilityPrompt (SYSTEM_CONSTITUTION + pairwise block + STRUCTURED_OUTPUT_INSTRUCTION + directive)
        ▼
ONE LLM call → classifyConsultationOutput (SAME validator) → StructuredConsultationViewModel
        ▼
client: CompatibilityTierCard (deterministic tier) + StructuredConsultationResult (reused) + follow-ups + feedback
        ▼
deterministic 궁합 report (report_type='compatibility') → 운세우편함 궁합 → secure share (reused)
```

Zero frozen-calc changes. Solo `buildServerConsultation` untouched (a separate orchestrator).

## The three dimensions (owner §18 — 3 defensible, not 6 fabricated)

Only dimensions the frozen engine's discrete facts actually support:

| Dimension | Backed by |
|---|---|
| **정서·유대 (BOND)** | 일간 `stemRelation` (천간합/충) · 일지 `branchRelations` (육합/반합/충/형/파/해) · 교차 육합 · union 삼합/방합 |
| **갈등·마찰 (FRICTION)** | total clash load: 천간충 + 지지 충/형/자형/파/해 (all cross pairs) + union 삼형 |
| **오행 보완 (ELEMENT)** | each person's `fiveElementDistribution.direct.counts`; who supplies whom's missing element; shared gaps |

Ziwei is **individual-only** (夫妻宮 exists but there is no synastry) → never a pair score. Qimen is
**question-time only** → out of natal pairwise (used only for "지금 연락할까?" style timing follow-ups
via the asker's grounding). See `src/features/compatibility/engine/`.

## Tier model (owner §19/§20/§21 — honest, no fabricated %)

The facts are **discrete named relations + integer element counts**, so a 0–100 score would imply
precision the engines never computed. We ship a **transparent tally → TIER** instead (a fake 87 is
worse than an honest grounded tier). Deterministic, bounded, reproducible, versioned, ZERO LLM.

- Per-axis integer tally (documented in `compatibilityTiers.ts`):
  - BOND = `2·(일간합) + 2·(일지육합) + 1·(일지반합) + 1·(교차육합≤2) + 1·(union삼합/방합≤1) − 2·(일간충) − 2·(일지충) − 1·(일지형/파/해≤2)`
  - FRICTION = count of all clashes/punishments/destructions/harms + union 삼형
  - ELEMENT = complementCount (each fills the other's missing element) vs sharedMissing gaps
- Overall = summed axis points (BOND/FRICTION weighted ±2 as the primary classical signals, ELEMENT ±1
  as supporting), mapped by documented thresholds → **매우 잘 맞는 편 / 잘 맞는 편 / 보완이 필요한 편 /
  갈등 관리가 중요한 편**. Unknown 시주 → `reducedPrecision` (never a fabricated 시주).
- A day-branch clash legitimately affects BOTH bond and friction — a doctrinally correct cross-axis
  effect (why the couple axis is weighted), not a within-axis double count.

`COMPATIBILITY_ENGINE_VERSION = compatibility-engine@1.0.0`,
`COMPATIBILITY_TIER_MODEL_VERSION = compatibility-tier@1.0.0`.

## Persistence & pair identity (owner §10/§68 — avoid unnecessary tables)

The **pair is DERIVED**, not stored: owner `is_self` subject + the target `consultation_subjects`
row. No `compatibility_pairs` table. Migration `20260819000000` adds two additive, idempotent
columns: `consultation_reports.report_type` (discriminator) and `conversations.consultation_mode`
(reserved for future pair-chat reload). RLS inherited (owner-only). The 궁합 report is a standard
`consultation_reports` row (`report_type='compatibility'`, `conversation_id` null in V1), so the
whole report / share / DTO / PremiumReportView stack works unchanged.

## Safety (owner §60/§61/§62)

The compatibility answer-plan directive forbids relationship fatalism (헤어져야 한다 / 결혼하면
실패한다 / 나쁜 사람) and mind-reading certainty (상대가 나를 사랑한다), and down-converts event
claims to suitability. The solo validator + 간지-hanja hygiene remain the final boundary. Sharing
uses the bounded 6-field DTO — **no birth date/time/place or target profile can reach a recipient**.

## V2 궁합소개팅 data separation (owner §63/§64/§65) — NOT built

Private consultation data and any future public dating/matching profile are kept **separate by
construction**:

- `consultation_subjects` = PRIVATE birth/calculation data (owner-only RLS). It is **not** a user
  account, **not** searchable, **not** a dating profile, and there is **no auto-conversion**.
- A future `dating_profile` / `matching_profile` (nickname, photos, region, age band, preferences,
  self-intro, …) would be a **separate, explicitly opt-in** table ("인연찾기에 참여하시겠어요?").
  V1 collects **none** of those fields and creates **no** dating table.
- No pre-enablement, no implied consent. The only seam is the mode axis (`ConsultationMode` /
  `consultationMode='solo'|'compatibility'`), which is calculation-side and carries no dating data.

## Owner actions (this sprint did NOT deploy / db push / push)

1. Apply migration `supabase/migrations/20260819000000_compatibility.sql` (report_type +
   consultation_mode). Command: `supabase db push` (or the dashboard migration flow).
2. Redeploy the `chat` Edge Function — the regenerated serverBundle carries
   `buildCompatibilityConsultation` + `compatibility-engine@1.0.0`. Command:
   `supabase functions deploy chat`.
3. Client reload/redeploy to pick up the new 궁합 routes + home entry.

## Deferred (honest scope)

- Pair-chat **reload** from DB (V1 keeps the pair chat in-memory; the report IS persisted). The
  `conversations.consultation_mode` column is in place for this.
- Report-detail **eyebrow** still reads "개인 상담 보고서" for a 궁합 report (the report TITLE is the
  clear pair title); vary by `report_type` later.
- Richer shared DTO (per-dimension tiers to recipients) — V1 shares the bounded 6-field payload.
