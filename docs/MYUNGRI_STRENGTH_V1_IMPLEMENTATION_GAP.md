# MYUNGRI_STRENGTH_V1.3 — Implementation Gap Register + DOCTRINE↔FACT MATRIX

> **Supersedes V1.1 of this file in full.** V1.1 listed six P0 gaps; **three of them are closed in code**
> and V1.1 never noticed, while **three "DOCTRINE GAP CLOSED" claims in V1.1 are false** and are reopened
> here. Every closure and every non-closure below was re-verified against the working tree on 2026-08-28 by
> reading `src/features/myungri/services/**` and `src/features/myungri/index.ts` directly — not from any
> prior document's summary.
>
> **Bucket vocabulary (fixed by the governing brief — exactly five, no others):**
>
> | Bucket | Means |
> |---|---|
> | `P0_FACT_GAP` | A deterministic function reading already-known chart data does not exist. No doctrine needed. |
> | `P0_INFERENCE_GAP` | The rule is **already specified and adopted**; the code implementing it does not exist. |
> | `P0_DOCTRINE_GAP` | There is **no adopted, sourced, threshold-free rule** to implement. Research or an owner decision, not code. |
> | `P1_REFINEMENT` | Real but non-blocking: precision, convenience, or a join over facts that already stand alone. |
> | `P2_LATER` | Out of scope for STRENGTH; may become blocking for a later phase (named explicitly). |
>
> **Classification discipline enforced here (V1.1 violated it in both directions):** an unbuilt implementation
> of an already-adopted rule is an **INFERENCE** gap, never a doctrine gap. Conversely, a rule whose only
> executable form requires a count, a magnitude comparison, or a private cut on an ordered scale is a
> **DOCTRINE** gap and stays one — writing prose about it in the canonical doctrine does not close it.

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

### B.1 `P0_DOCTRINE_GAP` — no adopted, sourced, threshold-free rule exists to implement

> **STATUS CHANGE IN V1.3.** This section listed ten doctrine gaps. **Eight are now CLOSED** by the V1.3
> canonical doctrine revision. The two that remain are genuine and are stated below without softening.
>
> The unlock was not new research — it was correcting an **over-strict rule of our own making**. V1.2 treated
> every quantitative concept as forbidden scoring, which made 徐樂吾's own 黨眾/助寡 axis unusable and
> cascaded into D-1, D-2 and D-3. Canonical doctrine §3.5 now separates *transparent numerousness* (allowed,
> because the selected source reasons that way, and the occurrence list is emitted for inspection) from
> *hidden scoring* (forbidden: weights, percentages, opaque cutoffs, count-as-sole-authority).

| Former gap | Status | Closed by |
|---|---|---|
| **D-1** faction (勢) axis not executable | **CLOSED** | §3.5 + §7.3.3 — 黨眾/助寡 retained as a transparent comparison over an emitted occurrence list; guarded by §12.1 so it is never the sole authority |
| **D-2** seven-band boundary contracts | **CLOSED** | §12.1's total 18-cell table, §12.2 intensity, §12.3 pure renderer, §12.4 boundaries as cell identity |
| **D-3** special-pattern gate | **CLOSED** | §10.1 rebuilt from verbatim-verified sources; "dominant force" deleted; §10.6 reachability now honest (5 of 6 reach CONFIRMED) |
| **D-4** cross-pattern composition | **CLOSED** | §10.7 — total mapping, with structural exclusivity *proved* rather than asserted, and `AMBIGUOUS_MULTI_CANDIDATE` where no source ranks |
| **D-5** 沖 outcome / orphaned WEAKENED | **CLOSED** | §8.9 status table + conservative policy; §8.10 deletes `DESTROYED` and `WEAKENED`, leaving three states each with exactly one named consumer |
| **D-8** 지장간 scope convention | **CLOSED** (as a disclosure) | §10.1 從强 scopes 絕無一毫 to visible + 본기, labelled `DEOKBUNI_OPERATIONALIZATION`; 從兒's 提綱 scope defaults to 본기 with 중기/여기 → `CANDIDATE_UNCONFIRMED` |
| **D-9** two canonical documents contradicting | **CLOSED** | `MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md` fully reconciled, with a citation-layer column, per-rule fields, and an explicit orphan cross-check |
| **D-10** no Korean named lineage | **CLOSED as a gap, by scope decision** | V1.3 adopts 任鐵樵 as the selected lineage and says so (§2.5). The absence of a *named Korean authority* is now a deliberate, recorded scope decision rather than an unexplained hole. Adding one remains optional future work, not a blocker |

**D-6. 사령 sub-period table — STILL OPEN, deliberately.**
Multiple named editions disagree; no edition is selected; inventing a default is forbidden. Its V1.1
mitigation is still hollow: `BOUNDARY_SENSITIVE` needs a **distance window**, which is itself an undetermined
numeric cut. Split honestly: the flag as a *non-authoritative annotation* with the window disclosed is
`P1_REFINEMENT` (F-4); the flag as a *trigger* for `INSUFFICIENT_STRUCTURAL_EVIDENCE` is an owner disclosure
decision and stays here. **Does not block the ordinary strength engine** — §12.1 reads the phase, not the
sub-period.

**D-7. `INSUFFICIENT_STRUCTURAL_EVIDENCE` granularity — STILL OPEN.**
Canonical doctrine §13 narrows the trigger to §4.2's boundary-sensitivity case. V1.3 now produces **three**
distinct kinds of unknown — boundary sensitivity, a faction tie (`FACTION_EVEN`), and an `UNRESOLVED`
relation. Whether one state may carry all three, or whether they must be distinguished so a caller can tell
*which* thing is unknown, is **not decided**. V1.3 does not silently merge them: §23.2 records this as an
open inference-design question. **Does not block implementation** — the triggers themselves are explicit;
only the state's granularity is undecided.

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

**F-1. Root/support **FUNCTIONAL-INTEGRITY** grading input set.** The *linkage* half is CLOSED
(`relationParticipants.ts`, A.1). What remains missing on the fact side is thin: branch-class membership
(四生/四庫/四敗) as a first-class fact, and mediation status (which detected 合 covers which detected 沖).
**Read the warning:** this is listed as a fact gap only for those two mechanical items. The *grading* that would
consume them is **D-5**, and per RULE-G8 nothing downstream may be stamped executable while it is conditional.
V1.1 filed the whole of P0-1 as a fact gap; that was the misclassification that let the doctrine gap hide.

**F-2. Visible-stem ↔ root joiner.** No single fact answers "which specific revealed hidden stems are on the
support side." Both halves exist independently (`calculateRootingTransparency` for same-stem transparency,
`calculateTenGodFacts` for raw ten-god identity per hidden stem). **Note:** V1.1 filed this as P1 convenience.
It is retained at P1 (see F-5) — it is listed here only to record that it was checked and is not blocking.

**F-3. 조후 climate fact producer.** Does not exist (A.2). See `P2_LATER`.

**F-4. `BOUNDARY_SENSITIVE` annotation.** Does not exist (A.2). Buildable in minutes from the already-frozen
절입 instant — but only as a **disclosed** annotation; the window is D-6. See `P1_REFINEMENT`.

### B.4 `P1_REFINEMENT`

**F-5.** Visible-stem/root-function joiner (F-2) — convenience over two already-clean facts; both are
independently sufficient without it.

**F-6.** `BOUNDARY_SENSITIVE` as a **non-authoritative annotation only**, window explicitly disclosed as
SOURCE_CLASS_D engineering with the alternative windows named. Zero state effect. Promoting it to a decision
trigger is D-6, not this item.

**F-7.** 사령 day-count precision, *once* an edition is selected (D-6). Affects root qi-tier precision near
boundaries only; does not gate anything that runs today.

**F-8.** Source-matrix reconciliation tooling (a citation-layer column, a per-quotation witness ledger of
`{quotation, witness count, witness type, RULE-G2 status}`). The *content* correction is D-9; the mechanism to
keep it from drifting again is refinement.

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

## C. DOCTRINE↔FACT MATRIX

> `FACT SUPPORT` names the **exact provider**, or `NONE`. `FUTURE INFERENCE REQUIRED` is what the next reasoner
> batch must build. `DEFERRED` names what is deliberately not being built and under which rule. `STATUS` is one
> of `FACT_EXISTS` · `FACT_MISSING` · `DOCTRINE_CONTRACT_READY` · `INFERENCE_MISSING` · `DOCTRINE_MISSING` · `NOT_EXECUTABLE`.

| DOCTRINE REQUIREMENT | FACT SUPPORT (exact provider, or NONE) | FUTURE INFERENCE REQUIRED | DEFERRED | STATUS |
|---|---|---|---|---|
| **Month command (월령/득령)** | `services/monthCommand.ts` → `calculateMonthCommand`: `monthBranch`, `monthElement`, `season`, `sajuMonthOrdinal`, `dayMasterSeasonalPhase` (旺相휴수사), `commandStatus` | None for the raw phase. The 旺相 vs 휴수사 **cut** into IN/OUT_OF_COMMAND is a **disclosed repo policy** (`DEUKRYEONG_MAPS_WANG_AND_XIANG_TO_IN_COMMAND`), not a classical fact — a future reasoner must consume it as policy and name the three rejected rivals (臨官/帝旺 only; 長生~帝旺; 월지가 인성/비겁) | 사령 sub-period precision (D-6); 當令 as a separate predicate (it is 왕상휴수, not stem-element identity) | `FACT_EXISTS` (cut = `DEOKBUNI_POLICY`, must stay disclosed per RULE-G6) |
| **Seasonal phase, general (any element)** | `services/generalSeasonalPhase.ts` → `generalSeasonalPhase` / `generalSeasonalPhaseForMonthBranch` | Consumers: an opposition candidate's own vitality; a root's own vitality independent of the DM | Any *comparison* of two phases as a magnitude (`VITALITY_ASYMMETRY`, 旺者沖衰 direction) — NOT_EXECUTABLE, degenerates precisely when the month branch is a clash participant | `FACT_EXISTS` |
| **Same-element roots (통근 existence)** | `services/sameElementRooting.ts` → `calculateSameElementRooting`: every hidden stem + `sameElementAsDayMaster` / `sameStemAsDayMaster` / `samePolarityAsDayMaster` + `sameElementRoots` | `ROOT_EXISTS` / `CAN_BEAR` predicate (**I-1**) — pure existence over these booleans | `ROOT_TIER` HEAVY/LIGHT — NOT_EXECUTABLE (no 12운성 table in repo, 陰干逆行 unresolved, mixes two partitions, non-total). 「干多不如根重」 is a *bounded* comparative, not a general licence | `FACT_EXISTS` / `INFERENCE_MISSING` |
| **Hidden-stem roles (지장간 본기·중기·여기)** | `sameElementRooting.ts` (`hiddenRole` per stem) and `tenGodFacts.ts` (`hiddenRole` + `tenGod`) | Which tier confers ten-god identity for a given test — **unanswered by every source** | 지장간 SCOPE convention (**D-8**) — OWNER DECISION, no invented 본기-only default | `FACT_EXISTS` / `DOCTRINE_MISSING` |
| **Visible stems** | `services/tenGodFacts.ts` → `visibleStems` (년간·월간·시간; 일간 excluded — a stem has no ten-god to itself); `services/rootingTransparency.ts` for same-stem transparency both directions | Support-side membership joiner (**F-2/F-5**) | 透干 as a *weight* ("strengthens toward CONFIRMED") — that is a score with the number omitted; disclosure flag only, zero state effect | `FACT_EXISTS` |
| **TenGod (십신)** | `services/tenGodFacts.ts` → raw `TenGod` per visible + hidden stem, **no** role grouping, **no** SUPPORT/DRAIN tag. 5-role grouping available separately via `specialPatternPrerequisites.ts` (`roleCategoryPresence`) and, in the older layer, `dayMasterStrengthInputs.ts` (which *does* carry a side tag — treat as legacy) | A reasoner's own role/side categorization, applied explicitly rather than inherited | Any tallying of sides as a decision rule (that is the counting D-1 forbids) | `FACT_EXISTS` |
| **Relation topology (detection)** | `rules/pillarRelations.ts` + `services/natalRelations.ts` → all 12 relation kinds (합·충·형·파·해·삼합·방합) at detection level | None — detection is complete | — | `FACT_EXISTS` |
| **Root ↔ relation linkage** | `services/relationParticipants.ts` → `calculateRelationParticipants`: participant pillars/stems/branches + `candidateAffectedRootFactIds` (**Day-Master same-element roots only**, semantic fact ids) | Consume the linkage inside an integrity grader — blocked on the row below | Distance/adjacency as a severity input — DELETED: no source ties pillar distance to 沖 severity (the sourceable distance rule belongs to STEM combination, 隔位太遠, and was transplanted) | `FACT_EXISTS` |
| **Relation OUTCOME (합화 / 국 성립 / 沖 severity)** | `NONE` for outcome; relation kind + participants exist as facts | Per canonical doctrine §8.9's per-mechanism `V1_STATUS` table. **The V1 contract is deliberately thin:** detection + formation evidence only; every transformation and severity outcome is `UNRESOLVED` | 六合 化 and 沖 severity → `UNRESOLVED`; 형/害/破 → `DEFERRED`; 三合-vs-方合 relative force → permanent defer | **`DOCTRINE_CONTRACT_READY` (conservative)** — the contract is closed by §8.9; what is unbuilt is the code |
| **Root integrity (does a root survive?)** | Linkage exists (`relationParticipants.ts`); grading does not | Emit one of three states per canonical doctrine §8.10: `ROOT_PRESENT_UNMODIFIED` · `ROOT_EFFECT_UNRESOLVED` · `NO_ROOT`. Each has exactly one named consumer in §7.3.2/§12.1 | `DESTROYED` — **deleted**, no source supplies categorical destruction. `WEAKENED` — **deleted**, computable but no consumer | **`DOCTRINE_CONTRACT_READY`** — reduced from four states to three; `INFERENCE_MISSING` |
| **Special-pattern PREREQUISITES** | `services/specialPatternPrerequisites.ts` → `visibleElementCounts`, `hiddenElementCounts`, `sameElementRootPositions`, `roleCategoryPresence` (raw counts + positions, never a ratio) | None — the facts are complete for their layer | Any dominance **ratio** or count threshold over them | `FACT_EXISTS` |
| **Special-pattern QUALIFICATION (從/專旺 gate)** | Prerequisites + `sameElementRooting` + `tenGodFacts` + `relationParticipants` | Six independent evaluators + the §10.7 composition function. Contracts are in canonical doctrine §10.1; reachability in §10.6 | 從氣/從勢 → `DEFERRED_FROM_V1`. 食傷多也/滿局 → DEFERRED, which caps 從兒 at `CANDIDATE_ONLY_IN_V1` | **`DOCTRINE_CONTRACT_READY`** — 5 of 6 patterns `CAN_REACH_CONFIRMED`; 從兒 `CANDIDATE_ONLY_IN_V1`; `INFERENCE_MISSING` |
| **Ordinary strength synthesis (신강/신약)** | All required facts exist: `monthCommand` (seasonal axis), `sameElementRooting` (root axis), `tenGodFacts` + `specialPatternPrerequisites` (faction occurrences) | The §12.1 total 18-cell decision table over `ROOT_STATE` x `SEASONAL_STATE` x `FACTION_STATE`, then §12.2 intensity, then §12.3's pure renderer | 得令/得地/得勢 as a *triple* — REJECT (not attested; its supporting citation failed verification). The three underlying facts are adopted **separately** | **`DOCTRINE_CONTRACT_READY`** — the faction axis is executable as transparent numerousness (§3.5); `INFERENCE_MISSING` |
| **Uncertainty** | `NONE` as a producer | An emitter for the explicit triggers: §12.1 cells #3/#5, rows 13-18, `FACTION_EVEN`, `UNRESOLVED` relations, `DOCTRINE_CONFLICT` | Whether ONE state may carry three distinct unknowns, or whether they must be distinguished — **D-7, still open** | `DOCTRINE_CONTRACT_READY` for the triggers; **`DOCTRINE_MISSING` for granularity (D-7)** |
| **Seven-band rendering** | `NONE`. `STRENGTH_LABEL_KO` exists only inside the rejected `services/natalStrength.ts` | A 7-row pure mapping from Stage 2 (canonical doctrine §12.3). Reads no facts; cannot change a verdict | Nothing — the bands are now a closed renderer, not an open question. Their authority equals Stage 2's, no more | **`DOCTRINE_CONTRACT_READY`**; `INFERENCE_MISSING` |
| **Climate (조후)** | `NONE`. Only a nullable `extremeSeason` input type, hardcoded `null` at its single call site | Month-branch season + DM element + counts → hot/cold/dry/wet facts, then a narrowly-scoped `EXTREME_CLIMATE_FUNCTIONALITY` modifier that never becomes a direct band input | Per-element/per-month operational thresholds — no per-cell 궁통보감 table adopted. RULE-G4: 조후 favorability may never enter a STRENGTH verdict | `FACT_MISSING` + `DOCTRINE_MISSING`; P2 for strength, **P0 for Yongshin** |

---

## D. What the next reasoner batch must build, in order

**Everything below is code against a contract that now exists.** No item requires new doctrinal research.

1. **The three §7.3 state producers**, in this order, because each is independently useful and testable:
   `SEASONAL_STATE` (reads `monthCommand.dayMasterSeasonalPhase`), `ROOT_STATE` (reads
   `sameElementRooting.sameElementRoots` plus §8.10's three-state reduction), then `FACTION_STATE` (reads
   `tenGodFacts` + `specialPatternPrerequisites`, emitting the **occurrence list**, not just a count).
2. **The §12.1 Stage-1 table.** It is a lookup over the three states above — 18 cells, all assigned. Implement
   it as data, not as branching logic, so an auditor can diff the table against the doctrine directly.
3. **§12.2 intensity and §12.3's renderer.** The renderer must be a pure function with no fact access, so that
   "the renderer invented a judgment" is structurally impossible rather than merely discouraged.
4. **The uncertainty emitter**, wired to the explicit triggers (cells #3/#5, rows 13–18, `FACTION_EVEN`,
   `UNRESOLVED` relations, `DOCTRINE_CONFLICT`). **First** make the D-7 granularity decision — one state or
   three — because retrofitting that distinction later would silently change past outputs.
5. **The six special-pattern evaluators + §10.7 composition.** Contracts are in §10.1; reachability in §10.6.
   Implement 從兒's cap (`CANDIDATE_ONLY_IN_V1`) as a structural property, not a runtime special case.
6. **F-1's two mechanical facts** (branch class 四生/四庫/四敗, mediation status) — cheap, and they make any
   future revisit of §8.9's `UNRESOLVED` verdicts concrete rather than abstract.

**What must NOT be built:** any 沖 severity grader, any transformation outcome, any root damage state beyond
§8.10's three, any 형/害/破 effect. §8.9's conservative policy is a contract, not a placeholder awaiting a
better idea.

**Certification obligation.** Every predicate must be run against at least one real chart before being marked
executable — the failure mode this project has actually hit twice is a predicate that is *provably vacuous* or
*provably unreachable* and was never evaluated on a single chart. Specifically required:

- Assert every one of §12.1's 18 cells is reachable by some constructed chart, or document why not.
- Assert 從兒 never returns `CONFIRMED` (its documented cap), and that the other five patterns each can.
- Assert no code path assigns a non-`ROOT_PRESENT_UNMODIFIED` root state from inputs that are only
  `{relation-exists, relation-kind}` — that is the §8.9 hard contract, expressed as a test.
- Rewrite canonical doctrine §18's metamorphic plan (M1/M2/M7/M8), which still references deleted constructs.

---

## E. Explicitly NOT gaps — safe to build on immediately

`calculateMonthCommand` · `calculateSameElementRooting` · `calculateTenGodFacts` · `calculateNatalRelations` +
`rules/pillarRelations` · `calculateRelationParticipants` · `calculateSpecialPatternPrerequisites` ·
`generalSeasonalPhase` · `calculateRootingTransparency` · `buildMyungriStrengthFactBundle` · full
대운/세운/월운 pillar + ten-god + relation facts (`calculateTimeAxis`, `calculateSewoon`, `calculateWolwoon`,
`daewoonTenGods`, `luckForInstant`, `temporalContext`) · raw five-element distribution.

## F. Explicitly tainted — must NOT be reused as-is

- `services/natalStrength.ts` — the entire verdict path (RULE_TABLE, root-count bucketing, dominance comparison,
  agreement-count confidence). Every one of those four mechanisms is a form of counting or magnitude comparison
  now prohibited outright.
- `services/currentStrength.ts` — `buildCurrentStrengthContext()` internally calls `evaluateNatalStrength()`.
- `divination/myungriStrength.ts` — useful as structural precedent for evidence presentation only; its
  `confidence` field is still a count-threshold heuristic.
- `services/dayMasterStrengthInputs.ts` — **not** tainted as a fact source, but it carries a SUPPORT/DRAIN side
  tag that the newer fact layer deliberately dropped. Prefer `tenGodFacts.ts` and apply role/side framing
  explicitly, so no directional assumption is inherited silently.

## G. Honest bottom line (V1.3)

**The fact foundation is complete and frozen.** `P0_FACT_GAP` is empty. Every deterministic fact the doctrine
asks for exists, is exported, and is protected by a compile-time type firewall plus a runtime sweep.

**Eight of the ten doctrine gaps are closed.** The unlock was not new research — it was correcting an
over-strict rule we had imposed on ourselves. V1.2 treated *any* counting concept as forbidden scoring, which
made the selected commentator's own axis (徐樂吾's 黨眾為強，助寡為弱) unusable and cascaded into three
separate "unclosable" verdicts. Canonical doctrine §3.5 now separates **transparent numerousness** — allowed,
because the source reasons that way and the occurrence list is emitted for inspection — from **hidden
scoring**, which stays forbidden.

State of the engine after V1.3:

- **Five of six special patterns can reach `CONFIRMED`.** 從兒 is `CANDIDATE_ONLY_IN_V1`, because its
  central quantifier (食傷多也) is stated by the source and never quantified, and we declined to invent it.
- **All seven bands are reachable**, via a total 18-cell decision table, a Stage-2 intensity contract, and a
  pure Stage-3 renderer. No cell is unassigned; no boundary rests on a magnitude term.
- **Relation outcomes are deliberately thin**: detection and formation evidence only, everything else
  `UNRESOLVED`, under an explicitly-labelled conservative policy. This is a software safety choice, not a
  claim that the classics say "no effect."
- **Root integrity is three states, not four** — `DESTROYED` deleted (no source supplies categorical
  destruction) and `WEAKENED` deleted (computable, but nothing consumed it).

**Two doctrine gaps remain open, and neither blocks implementation:** D-6 (the 사령 sub-period table, and the
undetermined distance window its mitigation needs) and D-7 (whether one uncertainty state may carry three
distinct kinds of unknown). Both are recorded rather than papered over.

**The withdraw-vs-remediate question posed by V1.2 is answered: remediate.** V1.2 asked whether a full
신강/신약 verdict was buildable at all. It is — but only at the granularity the sources actually support, with
two numeric operationalizations printed in the open (§10.1 從强's 重重/疊疊 and 絕無一毫 scope) rather than
hidden, and with one pattern honestly capped below `CONFIRMED`. That is a smaller, more disclosed engine than
V1 promised. It is the one the sources support.

**The next batch is an INFERENCE batch.** Every remaining P0 item is unwritten code against a contract that
now exists — not an unanswered doctrinal question.