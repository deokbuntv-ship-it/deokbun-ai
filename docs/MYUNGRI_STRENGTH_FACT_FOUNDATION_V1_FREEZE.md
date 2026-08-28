# MYUNGRI_STRENGTH_FACT_FOUNDATION_V1 — FREEZE

> **This is the authoritative status document for the deterministic fact foundation.**
> Where any other Myungri Strength document disagrees with this one about what is frozen or what is
> implemented, **this document wins.**

Frozen at commit lineage `e365f84` → `4d98ec1` → `ed903aa` (fact-layer work), audited at
`f122aff`, sealed at `7f660da`.

---

## A. STATUS

| Component | Status |
|---|---|
| **MYUNGRI_STRENGTH_FACT_FOUNDATION_V1** | **FROZEN** — independently audited `A. FACT_FOUNDATION_FROZEN` |
| **MYUNGRI_STRENGTH_CLASSIFIER_V1** | **WITHDRAWN / NOT IMPLEMENTED** — see `MYUNGRI_STRENGTH_V1_CLOSURE.md` |
| **MYUNGRI_STRENGTH_CLASSIFIER_V2** | **NEXT DESIGN TARGET** — see `MYUNGRI_STRENGTH_V2_RESEARCH_PLAN.md` |

**There is no Strength classifier in this repository.** There never was one that passed audit. The fact
foundation is real, complete, and frozen; everything downstream of it is research.

### Frozen means frozen

The following must not be modified — not refactored, renamed, optimized, or "improved":

```
src/features/myungri/services/sameElementRooting.ts
src/features/myungri/services/tenGodFacts.ts
src/features/myungri/services/generalSeasonalPhase.ts
src/features/myungri/services/relationParticipants.ts
src/features/myungri/services/specialPatternPrerequisites.ts
src/features/myungri/services/strengthFactBundle.ts
src/features/myungri/services/monthCommand.ts
src/features/myungri/rules/pillarRelations.ts
src/features/myungri/services/natalRelations.ts
src/features/myungri/contracts/factLayerTypeFirewall.ts
src/features/myungri/__tests__/**  (fact-foundation tests + the 600-fixture corpus)
```

Also frozen as contracts: **fact ID semantics**, **root linkage semantics**, **TenGod mapping**,
**relation detection**, **provenance fields**.

A change here invalidates the independent audit. If one is genuinely required (actual repository
corruption), it is a new audited sprint, not a patch.

---

## B. WHAT IS A FROZEN FACT

Every item below is deterministic, reproducible, and carries a stable citable `factId` plus a
`ruleVersion`. All are exported from `src/features/myungri/index.ts`.

| Fact | Provider |
|---|---|
| Day Master identity (stem · element · yin-yang) | `sameElementRooting.ts` |
| Visible stems (년간·월간·시간; 일간 excluded as its own ten-god) | `tenGodFacts.ts` |
| Hidden stems, every branch, every tier | `sameElementRooting.ts`, `tenGodFacts.ts` |
| Hidden-stem roles (본기 / 중기 / 여기) | both of the above |
| Same-element roots (통근 existence) + same-stem / same-polarity predicates | `sameElementRooting.ts` |
| TenGod identity — all 10 values, visible and hidden, **100/100 mapping verified** | `tenGodFacts.ts` |
| Month command: 月建, month element, season, 旺相休囚死 phase, IN/OUT_OF_COMMAND | `monthCommand.ts` |
| Generic seasonal phase — any element vs any reference element (5×5) | `generalSeasonalPhase.ts` |
| Relation **detection** — all 12 kinds (합·충·형·파·해·삼합·방합·자형·삼형·반합) | `pillarRelations.ts`, `natalRelations.ts` |
| Relation **participants** — exact pillars, stems, branches | `relationParticipants.ts` |
| Root ↔ relation linkage — **Day-Master same-element roots only** | `relationParticipants.ts` |
| Raw element / role-category counts and positions | `specialPatternPrerequisites.ts` |
| Composed, fail-closed bundle of all of the above | `strengthFactBundle.ts` |

**Semantic fact IDs.** Relation fact ids are built from relation kind plus canonically-ordered
participants, with each participant's value looked up *by position from the chart*. They contain no
detector array index, so the same semantic relation keeps the same id under any detector output ordering.

---

## C. WHAT IS EXPLICITLY **NOT** A FACT

None of the following exists in the fact layer, and none may be added to it:

- root **strength**, root **rank**, root **survivability**
- root **destruction** / **weakening** / **mediation**
- relation **effect**, relation **transformation**, 合化 / 局 formation outcome
- special-pattern **confirmation** (從旺 · 從强 · 從財 · 從官殺 · 從兒 · 專旺 · 從勢 · 從氣)
- **WEAK / BALANCED / STRONG**
- **CAN_BEAR / CANNOT_BEAR** — withdrawn in the V2 reset, see `MYUNGRI_STRENGTH_V1_CLOSURE.md` §C
- the seven bands (극신약 · 신약 · 중화신약 · 중화 · 중화신강 · 신강 · 극신강)
- Yongshin · Heesin · Gisin
- 조후 / climate facts (no producer exists)

### Enforced at two independent levels

1. **Compile-time** — `contracts/factLayerTypeFirewall.ts` is ordinary type-checked source (deliberately
   *not* a test file, because `tsconfig.json` excludes `**/*.test.ts` and `tsconfig.jest.json` sets
   `isolatedModules: true`, so assertions inside a test are never semantically checked by anything). It
   asserts `AssertNever<Extract<keyof T, ForbiddenFactKey>>` for every exported fact type. Adding a
   forbidden field **fails the build** with TS2344 — mutation-verified against three different providers,
   not assumed.
2. **Runtime** — `__tests__/detectionEffectFirewall.test.ts` sweeps serialized output for forbidden keys
   and verdict strings across varied bundles and all 600 corpus fixtures.

---

## D. INDEPENDENT AUDIT STATUS

| Scope | Result | Audited at |
|---|---|---|
| **Fact foundation** | **`A. FACT_FOUNDATION_FROZEN`** | `f122aff`, reconfirmed at `7f660da` |
| Doctrine | `C. NARROWED_DOCTRINE_NOT_READY` | `7f660da` |
| Doctrine ↔ fact alignment | `C. DOCTRINE_FACT_ALIGNMENT_NOT_READY` | `7f660da` |
| Product scope | `C. NOT_PROFESSIONALLY_MEANINGFUL` | `7f660da` |

**Read the scope of the A grade precisely.** It certifies that the deterministic facts are correct,
complete for their layer, order-independent, provenance-carrying, and firewalled against inference. It
certifies **nothing** about doctrine, about any verdict, or about professional usefulness — those were
graded C in the same audit.

`STRENGTH_V1_4_REASONER_IMPLEMENTATION_ALLOWED = NO`.

---

## E. LEGACY CODE STILL PRESENT

`services/natalStrength.ts` (`evaluateNatalStrength`, the rejected `RULE_TABLE` + root-count bucketing +
seven-band labels) and `services/currentStrength.ts` remain in the repository.

```
LEGACY_PRESENT             = YES
LEGACY_CANONICAL_AUTHORITY = NO
V2_DEPENDS_ON_LEGACY       = NO
```

Quarantined: do not reactivate, do not route new logic through it, do not copy its scoring, and do not
delete or refactor it in a docs sprint. Its presence is not evidence of a working classifier.

---

## F. WHAT A FUTURE CONSUMER MAY DO WITH THIS

**May:** read any frozen fact, cite it by `factId`, show it to a user as a *fact* ("일지 지장간에 甲이
있습니다"), and build a V2 judgment layer that consumes the bundle.

**May not:** infer a strength verdict from any fact or combination of facts without a V2 contract that has
passed the gates in `MYUNGRI_STRENGTH_V2_RESEARCH_PLAN.md`; present a fact as a judgment; or reintroduce
any item from §C under a new name.
