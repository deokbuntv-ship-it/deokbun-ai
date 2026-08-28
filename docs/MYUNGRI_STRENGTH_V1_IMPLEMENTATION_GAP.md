# MYUNGRI_STRENGTH_V1.4 — Implementation Gap Register + DOCTRINE↔FACT MATRIX

> # ⛔ SUPERSEDED_BY_V2_RESET — STATUS CLAIMS VOID
>
> **Historical record. Its gap classifications no longer describe the project.**
>
> This register's headline claim — **`P0_DOCTRINE_GAPS = NONE`** — is **VOID**. It was true only of V1.4's
> deliberately narrowed scope, and that scope is itself now withdrawn: the independent audit found the
> narrowed doctrine `NOT_READY` and the resulting product scope `NOT_PROFESSIONALLY_MEANINGFUL`. A gap
> register that reports "no doctrine gaps" for a doctrine that produces no usable verdict is measuring the
> wrong thing.
>
> Likewise void: every `DOCTRINE_CONTRACT_READY` status, section D's build order, and the
> `P0_INFERENCE_GAPS` list — they describe implementing V1.4, which is forbidden.
>
> **Still accurate:** section A's verified state of the working tree (which facts exist, which do not), and
> section F's quarantine of the legacy classifier.
>
> **Read instead:** `MYUNGRI_STRENGTH_FACT_FOUNDATION_V1_FREEZE.md` (frozen scope) ·
> `MYUNGRI_STRENGTH_V1_CLOSURE.md` (what is withdrawn) ·
> `MYUNGRI_STRENGTH_V2_RESEARCH_PLAN.md` §18 (the real gate sequence).

---

> **Supersedes V1.3 of this file.** The fact foundation is now **independently FROZEN**
> (`FACT_FOUNDATION_CLASSIFICATION = A`) — no fact-layer code, test, fact id, root linkage, ten-god mapping,
> relation-participant logic, or type firewall may be modified. This register therefore tracks **doctrine
> and inference only**.
>
> **V1.4's headline change:** `P0_DOCTRINE_GAPS` is empty **by narrowing, not by answering.** V1.3 claimed
> five confirmable special patterns and a three-way strength family; each rested on something the sources do
> not supply. Those claims are withdrawn (§B.1), and the underlying questions are recorded as a research
> backlog in **B.6** — which does not block implementation.
>
> **Bucket vocabulary (exactly five, no others):**
>
> | Bucket | Means |
> |---|---|
> | `P0_FACT_GAP` | A deterministic function reading known chart data does not exist. **Empty — layer frozen.** |
> | `P0_INFERENCE_GAP` | The rule is adopted; the code implementing it does not exist. **Expected and intended.** |
> | `P0_DOCTRINE_GAP` | No adopted rule exists to implement, **and V1 claims one anyway**. Empty in V1.4 |
> | `P1_REFINEMENT` | Real but non-blocking |
> | `P2_LATER` | Out of scope for STRENGTH; may block a later phase |
>
> **Classification discipline:** an unbuilt implementation of an adopted rule is an **INFERENCE** gap. A rule
> whose only executable form needs an invented cutoff is a **DOCTRINE** gap **only if V1 still claims it** —
> if V1 withdraws the claim, the scope is bounded and the question moves to B.6.

---

## A. Verified state of the world (re-read from the working tree, 2026-08-28)

### A.1 CLOSED since V1.1 — remove from any open-gap list

| V1.1 gap | Verified closure | What actually shipped |
|---|---|---|
| **P0-6** standalone same-element (득지) rooting fact | `services/sameElementRooting.ts` → `calculateSameElementRooting` | Every hidden stem of every natal branch with `element` / `yinYang` / `hiddenRole` (본기·중기·여기) and three existence booleans vs. the Day Master: `sameElementAsDayMaster`, `sameStemAsDayMaster`, `samePolarityAsDayMaster`, plus the pre-filtered `sameElementRoots` convenience subset. Stable `factId` per stem. Declares `EXISTENCE_FACT_ONLY_NO_ROOT_STRENGTH_NO_ROOT_RANK_NO_SURVIVABILITY_NO_FUNCTIONAL_EFFECTIVENESS`. |
| **P0-2** special-pattern prerequisite FACTS | `services/specialPatternPrerequisites.ts` → `calculateSpecialPatternPrerequisites` | Raw `visibleElementCounts` / `hiddenElementCounts`, `sameElementRootPositions`, and `roleCategoryPresence` (비겁/인성/식상/재성/관성 with visible+hidden counts and positions). Deliberately drops the SUPPORT/DRAIN side tag. Declares `RAW_COUNTS_AND_POSITIONS_ONLY_NO_DOMINANCE_RATIO_NO_THRESHOLD_NO_PATTERN_VERDICT`. |
| **P1-2** generalized seasonal-phase utility | `services/generalSeasonalPhase.ts` → `generalSeasonalPhase(target, reference)` and `generalSeasonalPhaseForMonthBranch` | 旺相휴수사 for **any** element against any reference element, independently re-derived from the frozen `calculateTenGod` rather than reaching into the frozen `calculateMonthCommand`. |
| **P0-1, linkage half only** root ↔ relation FACT linkage | `services/relationParticipants.ts` → `calculateRelationParticipants` | For every relation `natalRelations.ts` detects: participant pillars, participant stems/branches, and `candidateAffectedRootFactIds`. **Corrected in this batch** to report **only Day-Master same-element roots** (`hiddenStems.filter(h => h.sameElementAsDayMaster)`), not every co-located hidden stem — the earlier behaviour would have handed a reasoner a false premise about what a clash could be touching. Fact ids are semantic (no detector array index). |
| *(new, not in V1.1 at all)* raw TenGod coverage | `services/tenGodFacts.ts` → `calculateTenGodFacts` | Raw `TenGod` for every visible (non-DAY) and every hidden stem, with `position` / `branch` / `hiddenRole`. One layer more primitive than the 5-role grouping: **no** SUPPORT/DRAIN side tag anywhere. |
| *(new, not in V1.1 at all)* aggregate fact contract | `services/strengthFactBundle.ts` → `buildMyungriStrengthFactBundle` | Composes month command + same-element rooting + ten-god facts + natal relations + relation participants + special-pattern prerequisites into one fail-closed bundle (any sub-provider `UNAVAILABLE` ⇒ whole bundle `UNAVAILABLE`, never partial). Carries a `future: { rootFunction, relationEffect, specialPatternVerdict, climate, strength, yongshin }` block typed `undefined`-only, so no inference field can be smuggled in. |

Exported from `src/features/myungri/index.ts` under the banner *"MYUNGRI_STRENGTH_V1 deterministic FACT
foundation … FACTS ONLY, no strength/special-pattern/transformation/Yongshin judgment anywhere below."*

The FACT/INFERENCE boundary is enforced at **two** independent levels (see
`MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md` §9.5):

1. **Compile-time** — `contracts/factLayerTypeFirewall.ts`, ordinary type-checked source (NOT a test file,
   because `tsconfig.json` excludes `**/*.test.ts` and `tsconfig.jest.json` sets `isolatedModules: true`,
   so assertions living in a test are never semantically checked by anything). It asserts
   `AssertNever<Extract<keyof T, ForbiddenFactKey>>` for every exported fact type, so adding a forbidden
   field **fails the build** with TS2344. Mutation-verified against two different providers, not assumed.
   The same module pins `ALL_SUPPORTED_RELATION_KINDS` exhaustive over the frozen relation-kind unions.
2. **Runtime** — `__tests__/detectionEffectFirewall.test.ts` sweeps serialized output for any forbidden key
   or verdict string, across varied bundles and all 600 corpus fixtures.

### A.2 STILL OPEN — verified absent, not merely unfinished

| V1.1 claim | Verified reality |
|---|---|
| 사령 day-count table | **Absent.** `grep -ri "siling\|사령\|司令"` over `src/` returns only two *comments* (`strengthFactBundle.ts:40`, `__tests__/generalSeasonalPhase.test.ts:1`) saying it is not computed. No table, no producer, no consumer. |
| `BOUNDARY_SENSITIVE` flag | **Absent from code entirely.** The identifier occurs **only** in `docs/` (canonical doctrine §4.2/§13/cases 23,24,40, M9; source matrix MC-03; and V1.1 of this file). Zero occurrences under `src/`. V1.1 downgraded 사령 from P0 to P1 **on the strength of a flag that does not exist** and whose distance window the source matrix itself declares SOURCE_CLASS_D and undetermined. |
| 조후 / climate fact producer | **Absent.** `extremeSeason` exists only as a *nullable input type field* (`divination/myungriNatal.ts:50`, `divination/myungriStrength.ts:256`) and is hardcoded `null` at its one real call site (`chat/services/consultationGrounding.ts:450`, comment: *"조후 is not asserted without a canonical extreme-season rule"*). No producer. |
| Every INFERENCE layer | **Absent.** No root-integrity grader, no relation-outcome grader, no special-pattern gate, no strength synthesizer, no band renderer. The only strength *verdict* code in the repo (`services/natalStrength.ts`, `services/currentStrength.ts`) is the rejected RULE_TABLE lineage — disabled, unwired, and still tainted. |
| 12운성 | **Absent, and affirmatively forbidden.** Appears in `src/` only inside a `FORBIDDEN_THEORY` regex and provenance strings saying it is not computed. Any doctrine text that assumes "12운성 tables the repo already computes" is factually wrong. |

---

## B. Gap register

### B.1 `P0_DOCTRINE_GAP` — no adopted, sourced rule exists to implement

> **V1.4 STATUS: EMPTY.** Not because every question was answered, but because **V1 authority was narrowed
> to what the sources actually support.** Where V1.3 claimed a contract that rested on an undocumented scope
> choice or an unsourced quantifier, V1.4 withdraws the claim rather than keeping an unsafe rule. A
> withdrawn claim is not a doctrine gap — it is a bounded scope.
>
> The questions themselves are recorded in **B.6 (`OPEN_SOURCE_QUESTIONS`)**, which is a research backlog,
> not a blocker. None of them prevents the reasoner from being implemented against the V1.4 contracts.

| Former gap | V1.4 status | Where it went |
|---|---|---|
| D-1 faction axis not executable | **RESOLVED BY NARROWING** | The equal-weight comparison is deleted as any verdict authority; the correct 黨眾/助寡 reading is deferred with a specified contract (§7.3.5). The ordinary family is `DEFERRED_V1` — an explicit, implementable scope, not a gap |
| D-2 seven-band contracts | **RESOLVED BY NARROWING** | `NOT_CANONICAL_UNTIL_CALIBRATION` (§12.3). The renderer's purity contract is preserved for the future batch |
| D-3 special-pattern gate | **RESOLVED BY NARROWING** | All six patterns `CANDIDATE_ONLY_V1` (§10.6). The gate's job is candidate detection plus ambiguity reporting, both fully specified |
| D-4 cross-pattern composition | **CLOSED** | §10.7, rebuilt in V1.4 without the invalid `NO_ROOT` exclusivity proof |
| D-5 沖 outcome / orphaned WEAKENED | **CLOSED** | §8.9 conservative policy; §8.10's three states, each with one named consumer. All stale four-state language reconciled |
| **D-6** 사령 sub-period table | **RECLASSIFIED → `P1_REFINEMENT`** | See B.4/F-7. `D6_BLOCKS_REASONER = NO` — §12 reads the month phase, never the sub-period, and V1.4 removed the boundary-window trigger that was its only path into a decision |
| **D-7** uncertainty granularity | **RECLASSIFIED → `NON_BLOCKING_OPEN_QUESTION`** | See B.6. `D7_BLOCKS_REASONER = NO` — §13's triggers are individually boolean and separately emitted; whether they *also* need a merged summary state is a presentation choice, not a prerequisite |
| D-8 지장간 scope convention | **CLOSED** — and V1.4 removes the contradiction | V1.3 marked it closed in B.1 while B.3/matrix still listed it as an open owner decision. It is closed **in the only sense that matters now**: no V1 contract depends on resolving it, because the patterns whose confirmation would have needed it do not confirm. The underlying source question moves to B.6 |
| D-9 documents contradicting | **CLOSED** | Source matrix re-reconciled in V1.4, with a bidirectional cross-check and a no-contradictory-status check |
| D-10 no Korean named lineage | **CLOSED by scope decision** | 任鐵樵 is the selected lineage and is named as such (§2.5) |

### B.6 `OPEN_SOURCE_QUESTIONS` — research backlog, **not** blockers

Each would *widen* V1 authority if answered. None blocks implementing V1.4 as written.

| # | Question | What it would unlock |
|---|---|---|
| Q-1 | A sourced decision procedure for 黨眾/助寡 as factional abundance **with functional backing** | The ordinary family (WEAK/BALANCED/STRONG), and with it Stage 2 and canonical seven-band status |
| Q-2 | A sourced scope for 四柱皆比劫 (從旺) | 從旺 → `CONFIRMABLE_V1` |
| Q-3 | A sourced scope for 絕無一毫 (從强), and a sourced reading of 重重/疊疊 | 從强 → `CONFIRMABLE_V1` |
| Q-4 | A sourced scope for 不雜\<controller\> (專旺), and an operational reading of 遇旺逢生 | 專旺 → `CONFIRMABLE_V1`. **Closest of the four** — three of four premises are already clean |
| Q-5 | A located entry contract for 從財/從官殺 not built on the withdrawn 何其獨旺 reading | those two → `CONFIRMABLE_V1` |
| Q-6 | A sourced quantifier for 食傷多也 (從兒) | 從兒 → `CONFIRMABLE_V1` |
| Q-7 | Whether 從兒's 印 disqualifier is bare-presence or rootedness-scoped | removes a standing `DOCTRINE_CONFLICT` |
| Q-8 | An exact 사령 sub-period edition (D-6) | root qi-tier precision near 節氣 boundaries |
| Q-9 | Whether one uncertainty state should carry several kinds of unknown (D-7) | a presentation simplification |

**None of Q-1…Q-9 is a code task.** All are source questions, and V1.4 is implementable without any of them.

### B.2 `P0_INFERENCE_GAP` — the rule IS adopted; the code does not exist

> Nothing here is blocked on research. Each is blocked only on someone writing it — **except** where noted that
> it is transitively blocked on a B.1 item, in which case it must not be started.

**I-1. Root-existence / CAN_BEAR predicate.** ADOPTED: 任鐵樵 「日干不論月令休囚，只要四柱有根，便能受財官食神而
當傷官七殺」 (NAMED_COMMENTARY), over the frozen 지장간 containment test. Reads
`calculateSameElementRooting(natal).sameElementRoots` — **executable today, threshold-free, pure existence.**
This is the sourced replacement for §12.2's 극신약 REQUIRED CONDITION (which wrongly demanded a `DESTROYED`
determination the enum no longer contains). A root that exists but is CONTESTED forces BORDERLINE, never 극신약.
**Not written.**

**I-2. The 得時不旺/失時不弱 guard.** ADOPTED, ORIGINAL_TEXT, 子平真詮 ch.6 「論十干得時不旺失時不弱」. As an
executable *negative* rule: no verdict may be projected from the seasonal axis alone, in either direction. Reads
`calculateMonthCommand(natal).dayMasterSeasonalPhase`. **Not written** — and it is the one guard that would have
prevented the rejected `natalStrength.ts` RULE_TABLE from existing.

**I-3. 沖 pair-class classification.** ADOPTED to the extent D-5 permits: classify each detected 沖 into
四生 / 四庫 / 四敗 and route 四庫·四敗 to INDETERMINATE. Reads `calculateNatalRelations` +
`calculateRelationParticipants`. **Not written.** Do not implement the 四生 → WEAKENED arm until D-5(b) is
re-reasoned.

**I-4. Evidence-payload emission for DOCTRINE_CONFLICT.** ADOPTED: where two named lineages disagree, emit both
poles by name, never average and never default (DC-01, DC-04…DC-17). Reads whatever facts the specific conflict
turns on. **Not written** — there is no conflict-carrying evidence type at all.

**I-5. Fail-closed availability propagation into any future reasoner.** ADOPTED and already modelled by
`buildMyungriStrengthFactBundle`'s `AVAILABLE | UNAVAILABLE` discipline; a reasoner consuming it must inherit it
rather than partially degrade. **Not written** (no reasoner exists).

### B.3 `P0_FACT_GAP` — a deterministic function over known chart data is missing

> **NONE. The fact foundation is FROZEN** by independent audit (`FACT_FOUNDATION_CLASSIFICATION = A`).
> No fact-layer code, test, fact id, root linkage, ten-god mapping, relation-participant logic, or type
> firewall may be modified.

**V1.4 removes stale F-1.** V1.3 listed "branch-class (四生/四庫/四敗) membership and mediation status" as a
residual P0 fact gap. Both existed only to feed a 沖 severity grader — and §8.9 does not grade 沖 severity in
V1. A fact whose only consumer is a contract V1 does not have is not a gap; it is speculative work. If a
future batch adopts a severity contract, it may re-open the request then, against a real consumer.

**F-2 (visible-stem ↔ root joiner)** is likewise not a gap: both halves exist independently
(`rootingTransparency.ts`, `tenGodFacts.ts`), and the SUPPORT/DRAIN **side tag** the joiner would add is
deliberately absent — that framing is doctrine-dependent and the fact layer refuses directional framing.
Retained at P1 as convenience only (F-5).

**Still genuinely absent, and correctly not P0:** the `BOUNDARY_SENSITIVE` annotation (F-4 → P1) and the
조후 climate producer (F-3 → P2).

### B.3.1 COUNT POLICY — one consistent statement (brief §44)

V1.3's register said in one place that side tallies are forbidden and in another that transparent
inventories are allowed. Both were half-true and together they read as a contradiction. The single correct
statement, matching canonical doctrine §3.5 and §23.3:

| Construct | Status |
|---|---|
| **Raw fact inventory / count**, emitted as an inspectable list | **ALLOWED** — diagnostic evidence |
| **Equal-weight tally used as a verdict** (support count vs opposition count ⇒ family) | **FORBIDDEN** |
| **Weighted score** of any kind | **FORBIDDEN** |
| **Source-backed functional numerousness** (黨眾/助寡 with rooting and context) | **FUTURE INFERENCE CONTRACT** (§7.3.5) — informed by raw counts, never equal to them |

The distinction that matters: counting is fine as *evidence*, forbidden as *authority*. V1.3 allowed a
transparent comparison to help decide a family, which crossed that line while looking like it had not.

### B.4 `P1_REFINEMENT`

**F-5.** Visible-stem/root-function joiner (F-2) — convenience over two already-clean facts; both are
independently sufficient without it.

**F-6.** `BOUNDARY_SENSITIVE` as a **non-authoritative annotation only**, its window explicitly disclosed as
Deokbuni engineering with the alternative windows named. **Zero state effect** — V1.4 removed the boundary
window as a decision trigger entirely (§13), so this can only ever be an annotation.

**F-7. 사령 day-count precision (formerly D-6) — `P1_REFINEMENT`, `D6_BLOCKS_REASONER = NO`.**
Multiple named editions disagree and none is selected; inventing a default remains forbidden. It affects root
qi-tier precision near 節氣 boundaries only. It gates **nothing** that V1.4 runs: §12 reads the month phase,
never the sub-period, and the boundary-proximity trigger that was its only path into a decision is deleted.
V1.3 filed this at P0 largely on the strength of a mitigation flag (`BOUNDARY_SENSITIVE`) that does not exist
in code — a circular justification, now removed.

**F-8.** Source-matrix reconciliation tooling (a per-quotation witness ledger of `{quotation, witness count,
witness type}`). The content corrections are done in V1.3/V1.4; the mechanism to keep the file from drifting
again is refinement.

### B.5 `P2_LATER`

**F-9. 조후 (climate) fact producer + operational rule.** Dual status, recorded explicitly rather than merged:
**P2 for STRENGTH** (§9's separation means strength reasoning does not need it to run correctly), but
**effectively P0 before any Yongshin work begins** (§21's dependencies are unimplementable without it). Both the
producer (missing entirely) and the per-element/per-month operational rule (deliberately not adopted — no
per-cell 궁통보감 table is taken, to avoid fabricating precision) are open.

**F-10. 형 / 害(穿) / 破 runtime authority.** DEFER unchanged, and for a *good* reason worth restating: for 刑/害
the strongest available source is itself a **refusal to state a rule** (支神只以沖為重，刑與穿兮動不動), which is a
reason to keep deferring, not to un-defer. 破 is absent even from the base text's own enumeration. Do not invent
an effect to complete the mechanism table.

**F-11. Luck-behaviour (대운) confirmation of a natal pattern.** DEFERRED **permanently**, not pending research:
consulting 대운 at the natal gate inverts fact→verdict ordering by construction.

---

## C. DOCTRINE↔FACT MATRIX (V1.4)

> `FACT SUPPORT` names the exact provider, or `NONE`. `STATUS` is one of `FACT_EXISTS` · `FACT_MISSING` ·
> `DOCTRINE_CONTRACT_READY` · `INFERENCE_MISSING` · `DEFERRED_V1`.

| DOCTRINE REQUIREMENT | DETERMINISTIC_FACT_READY | DOCTRINE_CONTRACT_READY | FUTURE_INFERENCE_REQUIRED | DEFERRED | SEVERITY |
|---|---|---|---|---|---|
| Month command (월령/득령) | **YES** — `monthCommand.ts` | YES — §7.3.1; the 旺相 cut is disclosed `DEOKBUNI_POLICY` | none | 사령 sub-period precision (P1) | — |
| Seasonal phase, any element | **YES** — `generalSeasonalPhase.ts` | YES | consumers only | phase-vs-phase magnitude comparison | — |
| Same-element roots (통근) | **YES** — `sameElementRooting.ts` | YES — §7.3.2 | `ROOT_STATE` producer | root tier as a discriminator | — |
| Hidden-stem roles | **YES** | YES — carried as evidence | none | 지장간 scope for pattern tests (Q-2…Q-4) | — |
| Visible stems | **YES** — `tenGodFacts.ts` | YES | none | SUPPORT/DRAIN side tag (deliberate) | — |
| TenGod (십신) | **YES** — 100/100 verified | YES | a reasoner's own role/side framing, applied explicitly | any tally as authority | — |
| Relation topology (detection) | **YES** — all 12 kinds | YES | none | — | — |
| Root ↔ relation linkage | **YES** — `relationParticipants.ts`, DM same-element roots only | YES | consumed by the `ROOT_STATE` producer | — | — |
| **Numerousness facts** | **YES** — derivable from `tenGodFacts` + `specialPatternPrerequisites` | YES — §7.3.3, **diagnostic only** | inventory emitter | using it as verdict authority — **prohibited** | — |
| Relation outcome | facts YES; outcome `NONE` | YES — §8.9, everything but detection is `UNRESOLVED` | `UNRESOLVED` emitter | all transformation/severity outcomes | — |
| Root integrity | linkage YES | YES — §8.10, three states, one consumer each | root-state resolver | `DESTROYED` / `WEAKENED` / `MEDIATED` (deleted) | — |
| Special-pattern prerequisites | **YES** — `specialPatternPrerequisites.ts` | YES | none | any ratio/threshold over them | — |
| Special-pattern qualification | facts YES | YES — §10.1/§10.6, **candidate-only** | candidate evaluators + §10.7 composition | all six `CONFIRMED` verdicts; 從氣/從勢 entirely | — |
| **Bearing capacity** | **YES** | **YES — §7.3.4**, the one canonical ordinary output | `BEARING_CAPACITY` resolver | — | — |
| Ordinary strength family | facts YES | **`DEFERRED_V1`** — §12.1 | the faction functional-context inference (Q-1) | WEAK/BALANCED/STRONG | — |
| Uncertainty | n/a | YES — §13, boolean triggers | trigger emitter | merged-granularity question (Q-9) | — |
| Seven-band rendering | n/a | **`DEFERRED_V1`** — §12.3 `NOT_CANONICAL_UNTIL_CALIBRATION` | renderer, once a family exists | canonical band status | — |
| Climate (조후) | **NO** — no producer | NO | producer + modifier | per-cell 궁통보감 table | P2 strength / P0 Yongshin |

---

## D. What the next reasoner batch must build, in order

**Every item is code against a contract that exists.** No item requires new doctrinal research.

1. **`ROOT_STATE` producer** (§7.3.2 + §8.10's three states) and **`BEARING_CAPACITY`** (§7.3.4). This is
   the entire canonical ordinary output of V1, and it is small.
2. **`SEASONAL_STATE` producer** (§7.3.1) — trivial over `monthCommand`, consumed as evidence.
3. **`NUMEROUSNESS_RAW_FACT` inventory emitter** (§7.3.3). Emit the **list**. Wire it to nothing that
   decides. A code review that finds it feeding a comparison has found a regression.
4. **`UNRESOLVED` relation emitter** (§8.9) — in V1 this fires for essentially every detected relation, which
   is the intended behaviour, not a bug.
5. **Six special-pattern candidate evaluators + §10.7 composition** (§10.1, §10.6). Each must emit its named
   open question alongside the candidacy. **No evaluator may return `CONFIRMED`** — implement that as a
   structural impossibility, not a runtime check that could later be relaxed.
6. **Uncertainty emitter** (§13) — boolean triggers only.
7. *(optional)* a product display layer, which must carry uncertainty metadata and must not persist any band
   as canonical (§12.3).

**What must NOT be built:** any 沖 severity grader · any transformation outcome · any root damage state
beyond §8.10's three · any 형/害/破 effect · any faction comparison that decides anything · any
WEAK/BALANCED/STRONG resolver · any seven-band verdict.

**Certification obligations:**

- Assert `BEARING_CAPACITY` is reachable in all three states.
- Assert **no** special-pattern evaluator can return `CONFIRMED`, for any constructed chart.
- Assert a **rooted 從兒 candidate** composes correctly with a strong-DM candidate (case 56) — this is the
  regression guard for the withdrawn `NO_ROOT` exclusivity proof.
- Assert no code path lets a supporting-vs-opposing count change any emitted state (case 60).
- Assert adding a mediating combination to a clashed root branch changes nothing (M7).
- Rewrite §18's metamorphic plan where it still references withdrawn constructs.

---

## E. Explicitly NOT gaps — safe to build on immediately

`calculateMonthCommand` · `calculateSameElementRooting` · `calculateTenGodFacts` · `calculateNatalRelations` +
`rules/pillarRelations` · `calculateRelationParticipants` · `calculateSpecialPatternPrerequisites` ·
`generalSeasonalPhase` · `calculateRootingTransparency` · `buildMyungriStrengthFactBundle` · full
대운/세운/월운 facts · raw five-element distribution. **All frozen — read, do not modify.**

## F. Explicitly tainted — must NOT be reused as-is

- `services/natalStrength.ts` — the rejected verdict path (`RULE_TABLE`, root-count bucketing, dominance
  comparison, agreement-count confidence). **`LEGACY_PRESENT = YES`, `CANONICAL_AUTHORITY = NO`.** It still
  exists in the repository and is quarantined: do not reactivate it, route new logic through it, copy its
  scoring, or delete/refactor it. Its existence is not evidence of V1 reasoner work.
- `services/currentStrength.ts` — calls `evaluateNatalStrength()`. Same standing.
- `divination/myungriStrength.ts` — its `confidence` field is a count-threshold heuristic.
- `services/dayMasterStrengthInputs.ts` — not tainted as a fact source, but it carries a SUPPORT/DRAIN side
  tag the newer fact layer deliberately dropped. Prefer `tenGodFacts.ts`.

## G. Honest bottom line (V1.4)

**The fact foundation is frozen and complete.** `P0_FACT_GAPS = NONE`, independently confirmed.

**`P0_DOCTRINE_GAPS = NONE` — by narrowing, not by answering.** This is the honest framing and it should be
read carefully. V1.3 claimed five confirmable special patterns and a three-way strength family. Every one of
those claims rested on something the sources do not supply: an undocumented 지장간 scope, an unsourced
multiplicity cutoff, a clause transplanted from a different pattern, or an equal-weight occurrence tally
standing in for factional abundance. V1.4 withdraws the claims. What remains is smaller and true.

**What V1 actually produces:** a `BEARING_CAPACITY` verdict (sourced, executable, three states), a
special-pattern **candidate** set with each candidate's blocking question named, a full structural evidence
inventory, and explicit boolean uncertainty states. It does **not** produce a strength band, a seven-band
label, or a confirmed pattern.

**The nine open source questions (B.6) are a research backlog, not blockers.** Answering Q-4 alone would make
專旺 confirmable — three of its four premises are already clean. Answering Q-1 would restore the ordinary
family and, with it, the seven bands.

**The next batch is an INFERENCE batch**: unwritten code against contracts that now exist.