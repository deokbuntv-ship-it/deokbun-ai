# MYUNGRI_STRENGTH_V1.2 — Implementation Gap Register + DOCTRINE↔FACT MATRIX

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

> These are the real blockers. V1.1 declared three of them CLOSED; the consolidated doctrine review
> (globalRules RULE-G1…G8; clusters d/e/f/g) reopens them. **Nothing below is closed by writing more prose.**

**D-1. The faction (勢) axis is NOT EXECUTABLE — this is the central blocker for the whole strength verdict.**
徐樂吾, 子平真詮評註 ch.6: 「大致得時為旺，失時為衰；黨眾為強，助寡為弱」 (NAMED_COMMENTARY). The axis is defined
**by numerousness** — 黨眾 / 助寡. Counting is forbidden as a decision rule (RULE-G6 extends the ban to any cut
on an ordered non-numeric scale). Therefore **no executable form of 強/弱 exists that does not depart from its
own stated authority.** Any substitute (e.g. "an INTACT-rooted member on each side") is a SOURCE_CLASS_D
departure that must be labelled as such, and its INDETERMINATE rate measured on real charts *before* adoption —
an eight-character chart almost always has a rooted member on both sides, so the substitute plausibly returns a
near-constant value, which would relocate the judgment rather than remove it. **Consequence, stated plainly:**
with one axis of the 2×2 undecidable, the reachable state set for an ordinary chart is `旺 + INDETERMINATE` or
`衰 + INDETERMINATE`, and neither cell has a defined projection to WEAK/BALANCED/STRONG. **The engine currently
cannot answer the question it exists to answer.** *(Not a fact gap: every fact the axis would read already
exists. Not an inference gap: there is no adopted rule to implement.)*

**D-2. Seven-band boundary contracts — V1.1's "DOCTRINE GAP CLOSED" is WITHDRAWN.**
§12.2's per-boundary contracts run on `WEAK/MODERATE/STRONG` "effective force" and on "decisive tilt". Both are
unsourced magnitude scales and are deleted, not defined (cluster d, E-D1/E-D2). §12.0's own retention condition
("each adjacent boundary can be defined without hidden scoring") is **not satisfied** — four of six boundaries
ran on the deleted ordinal. The seven bands are therefore **DISPLAY_ONLY with no canonical authority**, and no
downstream consumer may branch on 극신약/중화신약/중화신강/극신강. What remains open is the projection rule from
the internal 2×2 to the three canonical outcomes — and it cannot be written while D-1 stands.

**D-3. Special-pattern (從/專旺) gate — V1.1's "DOCTRINE GAP CLOSED" is WITHDRAWN.**
Three independent reasons, any one sufficient: (i) §10.1's "dominant force" / "near-total force" is the *same*
undefined magnitude as "decisive tilt" and gates every 從 pattern's CONFIRMED verdict (E-D3 — the largest
remaining hidden threshold in the doctrine); (ii) every gate's REQUIRED conditions route through §8
functional-integrity grading, i.e. through **F-1 below, which this register argues is arguably unbuildable**
(RULE-G8: nothing may be stamped executable while that is conditional); (iii) RULE-G5 conditions the sources
state but never quantify (食傷多也, 滿局, 重重, 疊疊, 根深, 不雜, 黨眾) are **DEFERRED, never invented into a
number and never deleted** — each caps its pattern at `CANDIDATE_UNCONFIRMED`. Net effect for 從兒, the one
pattern with a fully written contract: its reachable states are `{NOT_QUALIFIED, CANDIDATE_UNCONFIRMED,
DOCTRINE_CONFLICT}` — **CONFIRMED is unreachable for every chart.** That is the outcome, and it must be stated
as the outcome rather than discovered by a reader.

**D-4. Cross-pattern composition rule — MISSING ENTIRELY.**
專旺 and 從旺 are to be evaluated as independent predicates over the same facts, and §10.3 emits one gate
output. Nothing anywhere says what ships when 從强 returns CANDIDATE and 專旺 returns CONFIRMED on the same
chart. Six independent evaluators × a four-state output requires a composition function; there is none, sourced
or otherwise.

**D-5. 沖 outcome — doctrine closed for at most ONE of six pairs, and that one has no consumer.**
`DESTROYED` is deleted from the enum (three ORIGINAL_TEXT refutations of a categorical damage state: 庫宜開;
衰神沖旺旺神發 with 原注 「子衰午旺，沖則午發而為福」; 敗地逢沖仔細推). Shipped enum is
`INTACT | WEAKENED | INDETERMINATE`, with `UPROOTED(拔)` reserved-and-unreachable under branch-type-first
ordering — **the one classically-licensed total-loss outcome cannot be expressed by the shipped model.**
Of the six 六沖 pairs: 子午/卯酉 → mandatory INDETERMINATE (the only criterion offered routes through 用神, which
is downstream of strength ⇒ circular); 辰戌/丑未 → INDETERMINATE (庫宜開 is a **favorability** claim; RULE-G4
forbids it entering a strength verdict); 寅申/巳亥 → WEAKENED via the single bounded classical entry 兩敗俱傷,
applied **symmetrically to both branches**. **Two unresolved items keep even that one open:** (a) `WEAKENED`
has **no consumer** — nothing states what it does to any verdict, so the one computable outcome is inert; and
(b) BLOCKING — the restored full sentence 「地支逢沖，猶天干之相剋也…各支中所藏互相沖剋，須視其強弱喜忌而論之」
conditions clash evaluation on 喜忌, i.e. on 용신 — the *same* circularity used to defer 子午卯酉, which may
extend the DEFER to **all** clashes. That must be re-reasoned before any clash contract is adopted.

**D-6. 사령 sub-period table — deliberately open, and its V1.1 mitigation is hollow.**
Multiple named editions disagree; no edition is selected; inventing a default is forbidden. Separately, the
mitigation V1.1 leaned on is itself threshold-bearing: `BOUNDARY_SENSITIVE` requires a **distance window**, i.e.
a numeric cut, and MC-03 declares that window SOURCE_CLASS_D and undetermined. **The honest split:** the flag as
a *non-authoritative annotation* with the window disclosed is `P1_REFINEMENT` (F-4); the flag as a *trigger for
`INSUFFICIENT_STRUCTURAL_EVIDENCE`* is a decision rule on a numeric threshold and is therefore an **owner
disclosure decision, not an inherited fact** — it stays here.

**D-7. `INSUFFICIENT_STRUCTURAL_EVIDENCE` has been silently re-widened.**
Canonical doctrine §13 narrows the trigger to §4.2's boundary-sensitivity case specifically. The consolidated
review reuses the same state for **faction indeterminacy** (D-1) and for **every clash INDETERMINATE** (D-5).
That is a large widening presented as housekeeping. No adopted rule says one state may serve all three sources
of uncertainty, and merging them destroys the caller's ability to tell *which* thing is unknown.

**D-8. 지장간 SCOPE convention — OWNER DECISION, unaddressed by sources and unfixed by the repo.**
For 提綱 食傷 presence, 財 existence, and 財 tier, no source states whether the test reads 본기 only, 본기+중기, or
all tiers, and the repo has no convention. A 본기-only default must not be invented, and must never be labelled
inherited. Blocked behind D-6 for the month branch specifically.

**D-9. The two canonical documents are in open contradiction.**
`MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md` still asserts, at minimum: `F-충-FUNC` listing `DESTROYED` (deleted by
D-5); rule `E1` as `BINDING` (its ordinal deleted by D-2); `G-從兒` carrying the "biased toward
CANDIDATE_UNCONFIRMED" thumb-on-the-scale (deleted); `F-삼합방합-TRANS` claiming "DISPUTED: none on the
distinction itself" (the distinction is MODERN_SYSTEMATIZATION); `G-從旺`/`G-從强` carrying "DISPUTED: none
material" where three-way conflicts now exist (DC-06, DC-07, DC-08). It also has **no column** for the new
citation-layer vocabulary (`ORIGINAL_TEXT | 原注 | NAMED_COMMENTARY | NAMED_SCHOOL | MODERN_SYSTEMATIZATION |
UNSOURCED`), which makes RULE-G1 and the single-witness cap RULE-G2 unenforceable and therefore decorative.
**No implementation may begin against a doctrine record in this state.** This is listed as a doctrine gap
because it is the doctrine *record* that is unexecutable, not because new research is required.

**D-10. No Korean named lineage anywhere.**
Every Korean quotation in the corpus was unattributed and has been deleted (correctly). None has been replaced
with a **named** Korean authority. DC-02 consequently collapses to a single modern-Chinese pole in a product
built for Korean users. Recorded as an open doctrine gap, not as a settled position.

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
> of `FACT_EXISTS` · `FACT_MISSING` · `INFERENCE_MISSING` · `DOCTRINE_MISSING` · `NOT_EXECUTABLE`.

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
| **Relation OUTCOME (합화 / 국 성립 / 沖 severity)** | `NONE` for outcome. Inputs partially present: relation kind + participants exist; **branch-class (四生/四庫/四敗) and mediation status are missing facts (F-1)** | Stage 1 `APPLIED \| NOT_APPLIED` (解法 layer) → Stage 2 `INTACT \| WEAKENED \| INDETERMINATE`; hard invariant: **no transition out of INTACT may be reachable from detection alone** | 半합 as a formation standard or 沖 mediator; 方合 as a mediator; 三合-vs-方合 relative force (**permanent** defer, no classical ranking); 六合 화 (neither pole cited); 化 requires 辰 (DC-15); 化 season form (DC-16); 甲己 blocker identity (DC-17, three-way); 형/害/破 (F-10) | `DOCTRINE_MISSING` (D-5) over `FACT_MISSING` (F-1) |
| **Root integrity (does a root survive?)** | `NONE`. Linkage exists; grading does not | The Stage-1/Stage-2 grader above, then a **consumer** for `WEAKENED` — which does not exist even on paper | `DESTROYED` — **deleted from the enum**, three ORIGINAL_TEXT refutations. `UPROOTED(拔)` — reserved, cited, and **unreachable** under branch-type-first ordering; state the consequence, do not paper over it. 拔 → 통근-loss mapping is an unsourced inference step | `NOT_EXECUTABLE` (RULE-G8) |
| **Special-pattern PREREQUISITES** | `services/specialPatternPrerequisites.ts` → `visibleElementCounts`, `hiddenElementCounts`, `sameElementRootPositions`, `roleCategoryPresence` (raw counts + positions, never a ratio) | None — the facts are complete for their layer | Any dominance **ratio** or count threshold over them | `FACT_EXISTS` |
| **Special-pattern QUALIFICATION (從/專旺 gate)** | Prerequisites above + `sameElementRooting` + `tenGodFacts` + `relationParticipants` | The gate itself — **do not build.** Blocked on D-3 (undefined "dominant force"), on root integrity (RULE-G8), and on the missing cross-pattern composition rule (D-4) | 食傷多也 · 滿局 · 重重 · 疊疊 · 根深 · 不雜 · 四柱皆比劫 · 財根深 · 根淺力薄 · 月令無用 (needs 격국/用神, deferred) · 假從/假化 entry conditions · luck-behaviour confirmation (**permanent**) — each DEFERRED per RULE-G5, each capping its pattern at `CANDIDATE_UNCONFIRMED`, none deleted, none quantified | `NOT_EXECUTABLE`; `CONFIRMED` unreachable for 從兒 today |
| **Ordinary strength synthesis (신강/신약)** | All facts above are present and sufficient **for the seasonal axis**; the faction axis reads facts that also already exist | The projection from 徐樂吾's internal 2×2 `{旺\|衰} × {強\|弱\|INDETERMINATE}` to `WEAK \| BALANCED \| STRONG`. The two MIXED cells (旺而弱, 衰而強) stay **distinct internally** and both project to BALANCED — never averaged, never ordered, never folded | **The faction axis itself (D-1)** — NOT_EXECUTABLE because its own authority defines it by counting. `得令/得地/得勢` as a triple — DO NOT ADOPT (not an attested classical triple; the citation offered for it was fabricated); adopt the three underlying facts separately, each under its own source. Any fourth factor (得位/得時) — REJECT | `NOT_EXECUTABLE` — one axis of a two-axis model is undecidable |
| **Uncertainty** | `NONE` as a producer. §13 defines `INSUFFICIENT_STRUCTURAL_EVIDENCE`; nothing emits it | An emitter, **and first** a decision on whether one state may carry three different unknowns (boundary sensitivity, faction indeterminacy, clash indeterminacy) — **D-7** | Silent re-widening of the existing state, which is what has happened so far | `DOCTRINE_MISSING` |
| **Seven-band rendering** | `NONE`. `STRENGTH_LABEL_KO` exists only inside the rejected `services/natalStrength.ts` | A renderer over the three canonical outcomes **only** | 극신약 / 중화신약 / 중화신강 / 극신강 — **DISPLAY_ONLY, no canonical authority, no consumer may branch on them** (D-2). Five outcomes is not defensible; seven definitely is not | `DOCTRINE_MISSING` |
| **Climate (조후)** | `NONE`. Only a nullable `extremeSeason` input type, hardcoded `null` at its single call site | Month-branch season + DM element + counts → hot/cold/dry/wet facts, then a narrowly-scoped `EXTREME_CLIMATE_FUNCTIONALITY` modifier that never becomes a direct band input | Per-element/per-month operational thresholds — no per-cell 궁통보감 table adopted. RULE-G4: 조후 favorability may never enter a STRENGTH verdict | `FACT_MISSING` + `DOCTRINE_MISSING`; P2 for strength, **P0 for Yongshin** |

---

## D. What the next reasoner batch must build, in order

1. **Nothing in code, first.** Reconcile the source matrix against the corrected doctrine (D-9) and add the
   citation-layer column + per-quotation witness ledger. Until that lands, RULE-G1/G2 are unenforceable and any
   implementation is built on a record that contradicts itself.
2. **Resolve D-1 explicitly, in writing, as an owner decision** — either (a) accept that the strength verdict is
   `INDETERMINATE` for ordinary charts and ship only what I-1/I-2 support, or (b) adopt a named SOURCE_CLASS_D
   substitute for 黨眾, disclose it as a departure from 徐樂吾, and **measure its INDETERMINATE rate on a real
   chart sample before adoption**. There is no third option that is honest.
3. **I-2 then I-1** — the two guards/predicates that are genuinely adopted, genuinely threshold-free, and
   genuinely executable against providers that exist today.
4. **F-1's two mechanical facts** (branch class, mediation status) — cheap, and they make D-5's remaining
   question concrete instead of abstract.
5. **Re-reason D-5(b)** (「須視其強弱喜忌而論之」) before writing any clash-outcome code. If the DEFER extends to
   all clashes, item 4 becomes annotation-only and nothing downstream changes — which is a *finding*, not a
   failure.
6. **Do not start** the special-pattern gate, the band renderer, or any strength synthesizer.

**Certification obligation (RULE-G7, which the prior round exempted itself from):** every predicate above must be
run against at least one real chart before being marked executable. Two predicates in the prior round were
provably vacuous and one provably unreachable; **none had been evaluated on a single chart.** The metamorphic
plan in canonical doctrine §18 (M1/M2/M7/M8) still references deleted constructs and must be rewritten, not
patched. One certification test is already known to be unsatisfiable as written ("assert the same clash pair
yields different outcomes under different month branches" — branch-class membership is month-independent and
gates first); substitute: assert at least two distinct outcomes across the six pairs, and assert that no code
path assigns a non-INTACT state from a predicate whose only inputs are `{pair-exists, pair-identity}`.

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

## G. Honest bottom line

Three of V1.1's six P0 gaps are **closed in code** and the fact foundation is in genuinely good shape — better
than any document currently claims. Three of V1.1's "DOCTRINE GAP CLOSED" declarations are **false** and are
withdrawn here. After every correction, the state of the engine is:

- **No 從 pattern reaches CONFIRMED.**
- **No strength band reaches WEAK or STRONG** — the faction axis is undecidable from its own authority.
- **Two of three clash classes are INDETERMINATE**, and the one computable damage state feeds nothing.

The question this register cannot answer, and which the owner must: whether the correct next move is to work
these gaps, or to conclude that **a full 신강/신약 verdict is not buildable from the available doctrine under the
no-threshold constraint and should be withdrawn rather than remediated** — shipping instead only the small,
genuinely sourced, genuinely executable set (root existence / CAN_BEAR, the 得時不旺 guard, and honest
INDETERMINATE) as the whole of what the engine claims. That is a smaller engine than V1 promised. It is also the
only one the sources actually support.
