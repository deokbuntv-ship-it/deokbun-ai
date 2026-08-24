# MYUNGRI CORE INTEGRATION PLAN

Companion to `MYUNGRI_CORE_AUDIT_REPORT.md`. Encodes what is SAFE to build now (facts-only primitives, §8) vs what must stay Owner Review (contested theory, §10/§32).

## Guiding rule (§8 + §32)
> Implement every **verifiable raw primitive**; leave only the **final arbitrary score / threshold** for Owner Review. Invent **no** weighting, no strength score, no 용신 formula, no 합충 priority.

The audit shows the primitive layer was ~90% already present + frozen + wired. This plan fills the **one** missing primitive and precisely scopes the rest as Owner decisions / follow-ups.

---

## A. Implemented this sprint (SAFE, facts-only)

### M-18 · 일간 기준 십신 역할 구성 (day-master ten-god role composition)
`src/features/myungri/services/dayMasterStrengthInputs.ts` — `calculateDayMasterStrengthInputs(natal)`.

- Tallies the natal 십신 by their **fixed classical role** relative to the 일간:
  `PARALLEL 비겁 · RESOURCE 인성` = **SUPPORT(아군)**; `OUTPUT 식상 · WEALTH 재성 · OFFICER 관성` = **DRAIN(타군)**.
- 100% frozen rules (`calculateTenGod` / `getHiddenStems`) — **no new calculation, no weighting, no verdict**.
- 일간 자신은 제외(억부 관례), 일지 지장간은 포함. 지장간은 **별도** tally (여기/중기/정기 equivalence deliberately NOT imposed).
- Returns `strengthVerdict: 'OWNER_REVIEW_REQUIRED'`, `seryeokScore: null` + a disclaimer naming what is excluded.
- Fail-closed (invalid natal / frozen-rule failure → `UNAVAILABLE`); graceful on 시주 미상 (§27).
- Exported from the myungri barrel. **Not wired** into any prompt/grounding (the freeze defers evidence prompt-wiring; wiring 아군/타군 tallies could also tempt the `FORBIDDEN_THEORY` validator). It is a ready primitive for the future Owner-approved classifier.
- Tests: `src/features/myungri/__tests__/dayMasterStrengthInputs.test.ts` (mapping correctness vs frozen engine, no-verdict invariants, determinism, 시주 미상, fail-closed).

**Why this and nothing more:** every *other* strength input (오행분포, 월령/왕상휴수사, 통근/투간) already exists and is already in the prompt (§21 — no duplication). M-18 is the only aggregate that was missing.

---

## B. Owner Review (blocked — do NOT invent, §10/§32)

1. **`STRENGTH_THRESHOLD_OWNER_REVIEW_REQUIRED`** — the 세력 weighting formula (how much each of: 월령 phase, 통근, 투간, position, 지장간 role weighs) **and** the 신강/신약 boundary values. No adopted standard exists in the repo. When the Owner supplies/approves one, a `calculateDayMasterStrength(inputs)` classifier consuming M-18 + monthCommand + rooting can be written; the 7 grade labels (태강/신강/중화신강/중화/중화신약/신약/태약) are just the classifier's output enum and should ship **with** the approved thresholds, not before.
2. **`THEORY_DECISION_REQUIRED — 지장간 weighting`** — whether 여기/중기/정기 contribute to 세력 and at what ratio. M-18 keeps them as a separate tally precisely so this stays open.

---

## C. Follow-ups (safe, deferred for scope/precision — not blockers)

1. **SHARED_CORE_DEPTH** — decide if 오늘/월별 should consume the fuller myungri evidence (오행분포·대운). Currently intentional: 월별 defers 대운 by design and both feed a pre-derived tier. Touching this changes their DB/plan contract → own sprint.
2. **CURRENT_DAEWOON_PRECISION** — `consultationGrounding.ts:175-183` selects the active 대운 by year-granularity age, not exact 절입 datetime. Tighten to compare "now" against each cycle's boundary datetime. Small, isolated, facts-only; do when touching grounding next.

---

## D. Invariants honored
Natal immutable · deterministic reproducibility · no-LLM in the core · evidence preserved · birth-time-unknown graceful · **zero** change to any existing computed output (M-18 is additive and unwired, so no frozen behavior moves).
