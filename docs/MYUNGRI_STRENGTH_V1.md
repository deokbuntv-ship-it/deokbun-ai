# MYUNGRI STRENGTH V1 — 신강/신약 판정 + 대운/세운 영향

Deterministic day-master strength for 덕분이 V1. Algorithm version `deokbunai.myungri-strength.v1`. Consumes only FROZEN primitives; the LLM never computes strength. Supersedes the "strength deferred" note in `MYUNGRI_V1_FREEZE.md` / `MYUNGRI_CORE_INTEGRATION_PLAN.md` (the `STRENGTH_THRESHOLD_OWNER_REVIEW` block is now resolved via a rule-state system, NOT numeric weights).

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

## 4. Connection (§30-32)
`consultationGrounding.ts` computes `buildCurrentStrengthContext` (active daewoon cycle + current 세운) and threads it through `SajuEvidenceBundle` → `toSajuEvidence` renders one section **"일간 강약(엔진 판정) · 현재 운 영향"** → `renderGroundingContext` → prompt. The LLM verbalizes the DIRECTION in plain language; it never sees a mandate to compute strength.

## 5. FROZEN-CHANGE record (§50) — `structuredConsultation.ts` prompt
- **WHY**: let the LLM use the engine's strength verdict (plain language) instead of pretending strength doesn't exist.
- **OLD**: line 61 absolutely banned 신강/신약/용신/격국 terms; no strength ever referenced.
- **NEW**: still bans writing the technical tokens + self-calculating, but adds: if 근거 provides "일간 강약(엔진 판정)", verbalize its direction in everyday language; if 미판정, don't mention strength; keep 원국 vs 현재 운 separate.
- **REGRESSION RISK**: low — `FORBIDDEN_THEORY` regex is UNCHANGED, so the LLM still cannot write 신강/신약 tokens (a literal echo is still nulled); the engine term lives only in the machine grounding/evidence panel.
- **TEST**: `plainLanguageInstruction.test.ts` + the grounding wiring tests below.

## 6. BEFORE / AFTER (§45)
**UNCHANGED** (byte-for-byte identical outputs): 원국 4 pillars, 오행 구성(count), 십신, 지장간, 통근/투간, 월령/왕상휴수사, 대운, 세운/월운, 시간축 관계, M-18 input-set, Ziwei/Qimen, Duk/billing/economy, all DB.
**NEW**: `NatalStrengthProfile` (7-level verdict), `CurrentStrengthContext` (daewoon/sewoon influence + combined), the one new grounding evidence section, the expanded prompt instruction, and the corrected provenance disclaimer (`용신/격국/12운성/12신살 미계산` — 강약 now engine-judged).

## 7. Tests
`natalStrength.test.ts` (7 labels, caps, conflict, 시주 미상, fail-closed, determinism, immutability), `currentStrength.test.ts` (natal label immutable across daewoon/sewoon change; influence changes independently; combined direction), `consultationGrounding.test.ts` (verdict section reaches prompt through the REAL engine; deterministic; 시주 미상 still classified).

## 8. Scoped follow-ups (not blocking)
- **SHARED_CORE_DEPTH_FOLLOWUP** — 오늘/월별 surfacing. The shared functions are ready and today/monthly already hold `natal`; wiring deferred because natal strength is day-invariant (marginal in a daily/monthly product) and touches their server-owned plan contract + shared bundle. Recipe: add a plain-language `constitutionHint` to `DailyPlan`/`MonthlyPlan`, one prompt line, bump plan/prompt versions. May want product sign-off on whether daily fortunes reference birth constitution.
- **DAEWOON_PRECISION_FOLLOWUP_REQUIRED** — `consultationGrounding.ts:175-183` selects the active 대운 by year-granularity age, not exact 절입 datetime (§28). Isolated boundary-only precision fix; deferred to avoid destabilizing the frozen daewoon selection.
- **COMPATIBILITY** — `evaluateNatalStrength(natal)` already works per-person (궁합 can call it per subject). Compat SCORING is intentionally NOT changed (§35); its own evidence still declares 강약 미계산, which stays honest until compat is wired.
