# MYUNGRI STRENGTH V1 — 신강/신약 CANDIDATE (NOT approved for runtime)

> **STATUS: CANDIDATE — OWNER REVIEW PENDING.**
> **NOT APPROVED FOR RUNTIME. NOT APPROVED FOR CONSUMER EXPOSURE.**
>
> The `MYUNGRI_STRENGTH_SEMANTIC_AUDIT` found this classifier's verdict rules (RULE_TABLE, extreme caps,
> factor priority, same-element rooting, count-dominance) to be **NEW_HEURISTIC / CONFLICTS_WITH_FREEZE** —
> new logic introduced this sprint, **not grounded in any repository Source of Truth**, and it crossed
> `MYUNGRI_V1_FREEZE.md` (strength verdict = "Do NOT implement here"; prompt wiring = "do NOT start yet").
> Per the audit verdict **KEEP_INFRA_BUT_DISABLE_VERDICT**, the runtime verdict + consultation exposure are
> **DISABLED** (grounding section removed, prompt instruction reverted, disclaimer restored). The classifier
> code + tests remain as an **unwired candidate**. The `MYUNGRI_V1_FREEZE.md` DEFERRED meaning stands: the
> strength verdict is **not adopted** until the Owner validates the RULE_TABLE against expert-approved golden
> charts. Tests here prove **code consistency only, not myungri-canonical validity**.

Algorithm version `deokbunai.myungri-strength.v1` (candidate). Consumes only FROZEN primitives; the LLM never computes strength.

## 1. Two separate layers (§5/§6 — never merged)
- **원국 강약 (NatalStrengthProfile)** — the IMMUTABLE birth baseline. Function `evaluateNatalStrength(natal)`.
- **현재 운 영향 (CurrentStrengthContext)** — a SEPARATE 대운/세운 influence direction laid on top. Function `buildCurrentStrengthContext({natal, daewoon?, sewoon?})`. A supportive 세운 NEVER rewrites the natal label — it only says "지금은 지원이 들어온다".

## 2. NOT a numeric model (§7)
No score, no 40/30/15, no 0.7/0.5/0.3, no threshold 1.2. The verdict is an explicit **hierarchical RULE TABLE over factor STATES**, priority **월령 > 통근 > 구성** (`src/features/myungri/services/natalStrength.ts`, `RULE_TABLE`).

### Factor states (each read from a frozen result)
| Factor | Source (frozen) | States |
|---|---|---|
| 월령/득령 (top) | `calculateMonthCommand` `commandStatus` | SUPPORT(득령·旺相) / DRAIN(실령·休囚死) |
| 통근/득지 | M-18 `calculateDayMasterStrengthInputs` — same-element(비겁) 지장간, counted by DISTINCT root branch | NONE / SINGLE / MULTIPLE |
| 천간 구성 | M-18 `visibleSideCounts` — 아군(비겁+인성) vs 타군(식상+재성+관성) | SUPPORT_DOMINANT / MIXED / DRAIN_DOMINANT |

The ten-god→아군/타군 map is the FIXED classical definition (not a weighting). 지장간 여기/중기/정기 get NO numeric weight — a branch either roots or it doesn't (§12).

### 7 labels + the two structural caps
`극신약 · 신약 · 중화신약 · 중화 · 중화신강 · 신강 · 극신강`. The table encodes a classical principle symmetrically: a **rootless** day master can never be (극)신강 (caps at 중화신강); a **multi-rooted** one can never be (극)신약 (bottoms at 중화신약). Full 18-cell table is in the source (auditable), e.g.:
- 득령 + 복수통근 + 아군우세 → **극신강**
- 실령 + 무근 + 타군우세 → **극신약**
- 실령 + 복수통근 + 아군우세 → **중화신강** (mirror of 득령/무근/타군우세 → 중화신약)

### Confidence / conflicts / fail-closed
- `confidence` HIGH/MEDIUM/LOW = agreement of the three primary directions with the verdict side (NOT a probability). 시주 미상 caps HIGH→MEDIUM + warns (never auto-UNKNOWN, §19).
- `conflicts[]` records where the primaries disagree (the "상충 조정" trace, §18).
- Invalid/failed input → `status: 'REVIEW_REQUIRED'` (never delegated to the LLM, §20).
- **특수격(종격)**: `specialPatternPolicy: 'NORMAL_CLASSIFIER_V1'` — V1 does NOT detect special patterns; the extreme labels carry a WARNING that SPECIAL_PATTERN_REVIEW may apply, but the normal label stands (no detector, §21).

## 3. Current luck influence (§24-27)
`luckInfluence(label, PillarTenGodProfile)` → SUPPORTIVE / DRAINING / MIXED / NEUTRAL from the pillar's 천간십신 + 지지 정기십신 side (reuses `tenGodSide`). `combinedDirection` = MORE_SUPPORTED / MORE_DRAINED / MIXED / STABLE from the daewoon+sewoon directions.

## 4. Connection (§30-32) — DISABLED (reverted by remediation)
The consultation wiring was **removed**. `consultationGrounding.ts`, `sajuEvidenceAdapter.ts`, and
`structuredConsultation.ts` are back to their pre-arc (`6e924ab`) state: no `buildCurrentStrengthContext`
call, no "일간 강약" grounding section, no strength prompt instruction. The candidate functions
(`evaluateNatalStrength`, `buildCurrentStrengthContext`) remain exported from the myungri barrel but are
consumed only by their own tests — nothing in the runtime/consumer path uses them. Re-enabling requires owner
approval of the RULE_TABLE + an explicit reopening of the freeze's deferred scope.

## 5. Prompt — REVERTED
The `structuredConsultation.ts` line-61 expansion was reverted to the original single-line token ban.
`FORBIDDEN_THEORY` is unchanged (it always was): the LLM cannot write or self-assert 신강/신약/용신/격국.
The plain-language-first Reading instruction was never touched.

## 6. BEFORE / AFTER (§45) — post-remediation
**RUNTIME UNCHANGED vs `6e924ab`** (byte-for-byte): 원국 4 pillars, 오행 구성(count), 십신, 지장간, 통근/투간, 월령/왕상휴수사, 대운, 세운/월운, 시간축 관계, M-18 input-set, consultation grounding/prompt/disclaimer, Ziwei/Qimen, Duk/billing/economy, all DB. The strength verdict is **NOT exposed** anywhere at runtime.
**ADDED (candidate, unwired)**: `NatalStrengthProfile` + `evaluateNatalStrength`, `CurrentStrengthContext` + `buildCurrentStrengthContext`, `tenGodSide` — exported, tested, but consumed by nothing in the runtime path.

## 7. Tests
`natalStrength.test.ts` + `currentStrength.test.ts` = **candidate consistency** tests (behavior of the unwired candidate, NOT canonical validity). `consultationGrounding.test.ts` now asserts the OPPOSITE of exposure: NO 강약 section in grounding, NO strength verdict in the prompt context, the frozen `강약 미계산` disclaimer restored, and the non-strength facts (오행/통근/투간/월령/대운) unchanged.

## 8. Scoped follow-ups (not blocking)
- **SHARED_CORE_DEPTH_FOLLOWUP** — 오늘/월별 surfacing. The shared functions are ready and today/monthly already hold `natal`; wiring deferred because natal strength is day-invariant (marginal in a daily/monthly product) and touches their server-owned plan contract + shared bundle. Recipe: add a plain-language `constitutionHint` to `DailyPlan`/`MonthlyPlan`, one prompt line, bump plan/prompt versions. May want product sign-off on whether daily fortunes reference birth constitution.
- **DAEWOON_PRECISION_FOLLOWUP_REQUIRED** — `consultationGrounding.ts:175-183` selects the active 대운 by year-granularity age, not exact 절입 datetime (§28). Isolated boundary-only precision fix; deferred to avoid destabilizing the frozen daewoon selection.
- **COMPATIBILITY** — `evaluateNatalStrength(natal)` already works per-person (궁합 can call it per subject). Compat SCORING is intentionally NOT changed (§35); its own evidence still declares 강약 미계산, which stays honest until compat is wired.
