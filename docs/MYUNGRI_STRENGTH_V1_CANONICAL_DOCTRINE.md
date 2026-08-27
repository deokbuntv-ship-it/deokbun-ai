# MYUNGRI_STRENGTH_V1.3 — Canonical Doctrine Specification (Final Doctrine Closure)

> **STATUS: DOCTRINE PHASE ONLY.** No runtime strength code is implemented or approved by this document.
> No Yongshin logic is implemented or approved. The frozen deterministic reasoning kernel and the frozen
> Myungri calculation layer are **untouched** by this document.

Base commit: `abc8b281d48a59e21906590bccdd0ef880943cdd` (V1.1); V1.2 remediation on
`4d98ec1bd938d16be5295cd708981d40b9a251be`; V1.3 final closure on
`ed903aa35c5a264c6c1e4a87d9b95132412a21e9`. Companion documents:
`MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md`, `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`,
`MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md`.

> ## V1.3 STATUS NOTICE — READ BEFORE USING THIS DOCUMENT
>
> A second independent audit classified V1.1 as `DOCTRINE_NOT_READY` on four findings (D1–D4). V1.2 closed
> D1. **V1.3 closes D2, D3 and D4**, and reconciles the source matrix (D9).
>
> **The correction that unblocked D3.** V1.2 declared the ordinary strength verdict inexecutable, on the
> reasoning that its governing source axis — 徐樂吾's 「黨眾為強，助寡為弱」 — is defined by *numerousness*,
> which V1.2 read as forbidden scoring. That reading was **too strict**. The prohibition is on **opaque
> arithmetic** (weights, percentages, hidden cutoffs, count-as-sole-authority), not on a source-backed
> qualitative comparison the selected commentator himself reasons with. §3.5 now draws that line explicitly,
> and §7.3 rebuilds the strength axes on it. A count may be a **transparent fact**; it may not be a
> **hidden score**.
>
> **What is now closed:**
> - **D1 — 從兒.** Rewritten from its ORIGINAL_TEXT verse (§10.1).
> - **D2 — 從旺/從强/專旺.** Source-by-source reconciliation table at §10.1.1; all three rebuilt from
>   verbatim-verified 任鐵樵 text; 從氣/從勢 disclosed rather than silently omitted.
> - **D3 — ordinary strength.** §7.3's undefined WEAK/MODERATE/STRONG ordinal is **deleted** and replaced by
>   a finite structural state model; §12 gives a **total 18-cell decision table**, a Stage-2 intensity
>   contract, and a pure Stage-3 renderer. "Decisive tilt" is deleted from the document.
> - **D4 — relations/roots.** §8.9 gives a per-mechanism V1 status table and a conservative
>   detection-never-implies-effect policy; §8.10 reduces root integrity from four states to three, each with
>   exactly one named consumer.
>
> **What remains, honestly:** the residual open items are **inference gaps** — the runtime reasoner is
> deliberately unimplemented — plus the named `DOCTRINE_CONFLICT` routes this document preserves on purpose.
> See `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`.
>
> `STRENGTH_REASONER_IMPLEMENTATION_ALLOWED` remains **NO** until this revision passes independent re-audit.
> The contracts here are written to be *implementable next*, not to authorize implementation now.

**This is a structural revision of V1, not a defense of it.** An independent audit classified V1 as
`MYUNGRI_STRENGTH_V1_DOCTRINE_NOT_READY` and found seven doctrine blockers: an over-broad universal
special-structure disqualifier; seven-band boundaries not operationally reconstructable without hidden
scoring; two structural caps that directly contradict claims made elsewhere in the same document; the exact
司令 day-count gap over-promoted to P0 blocker status; a climate-separation rule stated too absolutely; a
relation/transformation model that conflated *detection* with *effect*; and a source hierarchy that merged
original classical text, later commentary lineages, and modern school convention into single confidence
tiers. All seven are addressed below, not papered over with caveats. §0 records exactly what changed and why.

---

## 0. V1.1 Independent Audit Remediation

| Audit finding | What changed |
|---|---|
| 1. Special-structure gate overstates universal rules | SG-0 ("any rooted opposition breaks all 從格") **removed as a hard rule**. Replaced by a functional-integrity test applied to the *candidate disqualifying element itself* (§10.0), using the same B/E/F machinery already built for the ordinary model, not a separate short-circuit. Each pattern (從旺/從强/從財/從官殺/從兒/專旺) now has its own explicitly sourced, independently-stated disqualifier set — the "從弱 family" is no longer treated as one homogeneous category (§10.2–10.4). |
| 2. Seven-band boundaries not reconstructable | Every boundary rewritten as a DECISION CONTRACT (superseded by V1.3's §12.1-§12.4) (required conditions / counterevidence / uncertainty conditions / special-pattern interaction / insufficiency examples) — no boundary is defined by an undefined term like "clearly dominant" without a structural predicate. |
| 3. Structural caps contradict band definitions | Both caps **removed**. §6.2 already held that floating (rootless) support is "not zero" — an absolute cap forbidding a rootless DM from *ever* reaching a strong band contradicted that claim. Replaced with DISQUALIFYING/LIMITING EVIDENCE (§12.5) that participates in the ordinary A–H reasoning, not a bolt-on ceiling/floor. |
| 4. Exact 司令 over-promoted to P0 | Downgraded to P1 (§4.2, §20, `IMPLEMENTATION_GAP.md`). V1.1 states explicitly that month-command/seasonal-structure reasoning does not require the exact day-count sub-period table; it requires *retaining explicit boundary uncertainty* near 節氣 changeovers, which is achievable without the table (see `OPTIONAL_SILING_POLICY`, §10 of the brief / §4.2 here). |
| 5. Climate separation too absolute | §9 rewritten: `CLIMATE_DOMAIN` (downstream, never strength-authoritative) is kept, but the prior "climate can never affect functionality" absolute is removed. `EXTREME_CLIMATE_FUNCTIONALITY` is introduced as a narrowly-sourced modifier on a *specific element's effective manifestation*, never on the seven-band label directly, and only where doctrine actually supports it — unresolved specifics are marked `DEFERRED`, not asserted zero. |
| 6. Relation/transformation rules insufficiently conditioned | §8 rewritten in full: every mechanism (天干合/六合/三合/方合/沖/刑/害/破) is now split into DETECTION / FORMATION-VALIDITY / TRANSFORMATION / FUNCTIONAL EFFECT / STRENGTH EFFECT as five separate questions. Detection is never treated as equal to transformation. |
| 7. Source hierarchy mixed provenance | Rebuilt as five explicit classes (§2): SOURCE_CLASS_A (original text) / B (historical commentary/interpretive lineage, e.g. 任鐵樵, 徐樂吾, named individually) / C (school-specific operational doctrine) / D (Deokbuni software operationalization) / E (unsupported/deferred/non-authoritative). Every adopted rule in this document and in `MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md` now carries `TEXT_LAYER` / `SCHOOL` / `CANONICAL_SCOPE` / `RUNTIME_AUTHORITY` / `CONFLICTS`. |

Additional corrections found during this revision pass (not separately requested but required by §21/§22's
self-test): **Case 27 of §17 asserted 官殺 directly controls (克) 印 — this is a five-phase-cycle error.**
官殺 *generates* 印 (官殺生印: e.g. for DM=甲/Wood, 官殺=庚/辛-Metal, 印=壬/癸-Water, and 金生水 is standard
generation). It is **財** that controls 印 (財克印: 財=戊/己-Earth for a 甲 DM, and 土克水 is standard
control). Case 27 is rewritten (§17) and the underlying rule (§6.5) is now stated with the correct element,
named explicitly rather than left implicit. A grep of both companion documents for the same error found no
further occurrences.

---

## 0.2 Second-Audit Remediation record (D1–D4) — D1 closed in V1.2, D2–D4 closed in V1.3

| Audit finding | Status | What changed |
|---|---|---|
| **D1. 從兒 doctrine materially wrong / overconstrained** | **CLOSED** | §10.1's 從兒格 entry rewritten from its own governing ORIGINAL_TEXT verse (滴天髓 順局). Three V1.1 errors corrected: (a) the **"DM exhaustively rootless" precondition is DELETED** — 「從兒不管身強弱」 states Day-Master strength is expressly *not* the governing question; (b) the **比劫 disqualifier is DELETED in all directions** — 任鐵樵: 「不論身強弱者，四柱雖有比劫仍去生助食傷也」 (比劫 may remain precisely because they feed 食傷). These two were the same error stated twice, since a branch rooting a 比/劫 necessarily roots the DM's own element under §5.1; (c) the condition 任鐵樵 marks **必要 was missing entirely** — 月令 must carry 食傷 (「必要食傷在提綱也」), now added. The 財-outlet condition is **retained and upgraded** from a weakly-sourced "extra" to ORIGINAL_TEXT (「只要吾兒又得兒」 + 任鐵樵 「必要局中有財」). The pattern's SOURCE grade is corrected from `SOURCE_CLASS_C` "thinnest-grounded of the four" to ORIGINAL_TEXT + NAMED_COMMENTARY — it is in fact the **best**-sourced pattern in the cluster. The unsourced "zero borderline flags" strictness bar is deleted. |
| **D2. 從旺/從强 need source-by-source reconciliation** | **CLOSED (V1.3)** | §10.1.1 supplies the predicate×source reconciliation table. 從旺 and 從强 rebuilt from verbatim-verified 任鐵樵 (從象 第四十七); the 從旺-vs-從强 distinction is confirmed **source-level**, drawn by 任鐵樵 himself on three explicit axes (印 weight · 日主當令 mandatory or not · composition), not a later systematizer's tidy-up. 專旺 rebuilt from 形象第十一, with V1.1's blanket 삼합/방합 clause **corrected for 稼穡** (四庫皆全 — neither a 三合 nor a 方合). 從氣/從勢 disclosed as co-equal members of the same 任鐵樵 passage that V1.1 silently dropped. 淵海子平 and 三命通會 rows are marked NOT RETRIEVED rather than inferred, and V1.1's unverified 徐樂吾 attribution for 從旺/從强 is **withdrawn**. |
| **D3. Seven-band boundaries not executable** | **CLOSED (V1.3)** | The blocker was V1.2's own over-strict reading of the no-scoring rule, not the sources. §3.5 separates transparent numerousness from hidden scoring, which restores 徐樂吾's 黨眾/助寡 axis as usable. §7.3 deletes the undefined WEAK/MODERATE/STRONG ordinal and replaces it with four enumerated structural dimensions over existing deterministic facts; §12.1 gives a **total 18-cell decision table**; §12.2 an intensity contract; §12.3 a pure renderer; §12.4 restates every adjacent boundary as cell identity. **"decisive tilt" is deleted from the document.** 子平真詮 ch.6 得時不旺失時不弱 is enforced structurally — no single dimension can reach an extreme cell alone. |
| **D4. Relation/root-damage predicates not operational** | **CLOSED (V1.3), conservatively** | §8.9 gives a per-mechanism DETECTION / FORMATION / TRANSFORMATION / FUNCTIONAL / STRENGTH status table with an explicit V1_STATUS, plus the binding DEOKBUNI_CONSERVATIVE_OPERATIONAL_POLICY: detection alone never changes root or stem function; unsupported outcomes emit RELATION_EFFECT_STATUS = UNRESOLVED and propagate uncertainty. §8.10 reduces root integrity from four states to **three**, deleting DESTROYED (no source supplies categorical destruction) and WEAKENED (computable but **no consumer** — a state nothing reads is decoration, not a contract). Every retained state has exactly one named consumer. |

> **Numbering note.** `D1`–`D4` above are the **second audit's findings**. The gap register in
> `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md` uses its own `D-1`…`D-10` identifiers for individual
> **doctrine gaps**, which do not map one-to-one onto these findings (finding D3 alone produces gap
> entries D-1 and D-2 there). Cite the document alongside the identifier.

**Method note.** This revision deliberately declines to fabricate the missing pieces. Where a source states
a condition but never quantifies it (食傷多也, 滿局, 重重, 疊疊, 根深, 不雜, 黨眾), the condition is
**DEFERRED and caps the affected pattern at `CANDIDATE_UNCONFIRMED`** — it is neither deleted (which would
silently loosen the gate) nor converted into an invented count (which would fabricate precision). A
consequence of that discipline, disclosed rather than hidden: **several patterns currently have no
reachable `CONFIRMED` state.** See §10.6.

---

## 1. Executive doctrine decision

The V1 candidate (this document's own immediate predecessor) over-committed in three ways an independent
audit correctly identified: it converted a real but conditional classical heuristic (rooted opposition
threatens a follow-pattern) into an unconditional universal rule; it defined two "structural caps" that,
read against the document's own floating-support doctrine, contradicted each other; and it blended distinct
provenance tiers (原典 text, named historical commentators, modern pedagogical school packaging, and this
project's own engineering translation) into a coarser A/B/C/D scale that let a Level-B school opinion read as
though it had the same standing as a Level-A cross-school principle.

**This revision's core correction:** doctrinal authority is now tracked per SOURCE_CLASS (§2), and every rule
that constrains runtime behavior states which class it belongs to, which named lineage it comes from if not
the base text itself, and what its RUNTIME_AUTHORITY actually is (binding / conditional / advisory /
non-authoritative). Hard universal disqualifiers are used only where the sourced material genuinely supports
a universal claim (there are very few of these); everywhere else, doctrine is expressed as **graded,
structurally-participating evidence** consumed by the same A–H reasoning sequence, never as a bolt-on rule
that bypasses it. This is the direct fix for audit findings 1 and 3, and is applied consistently to every
other section that had the same latent pattern (climate, 형/害/破, rooting hierarchy).

The four-axis definition of strength from V1 is retained, because it was not the part the audit found
defective — it is the machinery *around* it (the special-structure gate, the caps, the boundary definitions,
the relation-effect model, the source-tier system) that required rebuilding:

```
AXIS A — CATEGORY GATE — now graded evidence within the SAME reasoning sequence, not a
   separate universal short-circuit (§10)
AXIS B — SEASONAL VITALITY (§4)
AXIS C — ROOTEDNESS WITH INTEGRITY (§5) — contextual dimensions, not a rigid ranking (§5.6)
AXIS D — VISIBLE-STEM SUPPORT WITH FUNCTION (§6)
  ↓
FINAL STRENGTH VERDICT = qualitative synthesis under DISQUALIFYING/LIMITING EVIDENCE, never a
score, a vote, or an absolute cap (§12.5)
  ↓
억부 APPLICATION — downstream, out of scope (unchanged from V1)
```

---

## 2. Source hierarchy

### 2.1 Five explicit provenance classes

| Class | Definition | Runtime authority |
|---|---|---|
| **SOURCE_CLASS_A** | Original / base classical text proposition — the base text's own stated content, not a later gloss on it (e.g. 子平真詮's own 格局-first method; 滴天髓's own 氣勢 language; the base 五行旺相休囚死 cycle attested across pre-Ziping cosmology). | May be runtime-binding once operationalized (Class D translation), provided the translation is disclosed as such. |
| **SOURCE_CLASS_B** | Historical commentary or later interpretive lineage on a Class-A text — named individually, never merged with the base text or with each other. Concretely tracked in this document: **任鐵樵's commentary on 滴天髓** (滴天髓闡微), and **徐樂吾's** commentary/systematization lineage (spanning several texts, including his own 滴天髓補注 material and his annotated edition of 子平真詮). | May be runtime-binding for the *specific claim the named commentator makes*, but must be labeled with the commentator's name — never presented as though it were 劉基/沈孝瞻/the base text speaking. Where 任鐵樵 and 徐樂吾 diverge, both are named and neither is silently preferred. |
| **SOURCE_CLASS_C** | School-specific operational doctrine — a teaching convention associated with a named modern pedagogical grouping (格局派/億扶派/調候派) that is not directly traceable to one classical passage, or is a specific *procedural* choice a school makes when the base texts leave room for more than one procedure. The three-school taxonomy itself is Class C (a modern teaching packaging of real primary material, not the classical authors' own self-description). | Runtime-binding **only** with the specific school named and the rejected alternative recorded — never presented as settled cross-school consensus. |
| **SOURCE_CLASS_D** | Deokbuni software operationalization — a disclosed engineering translation of a Class A/B/C principle into a checkable structural predicate, an ordinal scale, or a pipeline-ordering rule. Not classical citation. | Runtime-binding as an implementation detail, but must remain revisable without being mistaken for doctrine itself, and must never smuggle in a numeric weight/threshold that Class A/B/C did not license (§21). |
| **SOURCE_CLASS_E** | Unsupported / deferred / not runtime-authoritative — a claim this document could not confidently trace to a named text or commentator, a claim where classical/commentarial grounding is comparatively thin (형/害/破's qi-strength effect is the primary example, §8.8), or a claim intentionally left open pending further research (化氣格 entry conditions, exact 사령 day-count tables). | **Must NOT become runtime authority.** May be retained as an advisory/documentation-only annotation, explicitly labeled non-authoritative, or left `DEFER`red outright. |

### 2.2 Per-rule provenance fields (used throughout §4–§10 and in the source matrix)

Every rule below states:

- **TEXT_LAYER** — which SOURCE_CLASS, and if B or C, which named commentator/school specifically.
- **SCHOOL** — 格局派 / 億扶派 / 調候派 / cross-school, or "not school-specific" for Class A/D structural rules.
- **CANONICAL_SCOPE** — what the source text/commentator actually claims, narrowly stated.
- **RUNTIME_AUTHORITY** — `BINDING` (Class A, or Class D translation of unanimous Class A) / `CONDITIONAL`
  (Class B/C, named lineage, used only when that lineage's reading is explicitly the one adopted) /
  `ADVISORY` (surfaced but never decisive) / `NON_AUTHORITATIVE` (Class E).
- **CONFLICTS** — named disagreement with another class/lineage/school, or "none material."

This replaces V1's coarser A/B/C/D LEVEL tags (which conflated e.g. "任鐵樵's reading of 滴천수" and "a modern
億扶派 textbook convention" into the same "Level B" bucket). Full per-rule table in
`MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md`.

---

### 2.5 DEOKBUNI V1 SOURCE POLICY — new in V1.3 (final doctrine closure)

V1.1 and V1.2 tried to make every historical lineage agree, and where they would not, the documents either
averaged them or recorded an unresolvable conflict. Neither produces an implementable contract. V1.3 adopts
an explicit selection policy instead. **Deokbuni selects; it does not adjudicate the tradition.**

| Rule | Policy |
|---|---|
| **A. Base text governs where it speaks** | Where a classical text states a direct proposition, that proposition is preserved as-is and cited at `ORIGINAL_TEXT`. |
| **B. Named commentary fills software gaps** | Where the base text is too terse to implement, a **named** historical commentator may supply the operational content — cited at `NAMED_COMMENTARY` with the commentator named in the rule itself, never merged into the base text's authority. |
| **C. Disagreement is selected, not averaged** | Where named sources conflict, the doctrine picks exactly one of: `SELECTED_LINEAGE` (Deokbuni adopts one named reading for the V1 contract, and says so), `SCHOOL_DEPENDENT`, `DOCTRINE_CONFLICT` (runtime must surface both poles), or `DEFERRED`. **Averaging two lineages into a compromise rule is prohibited.** |
| **D. Modern operationalization is labelled** | Anything Deokbuni decides for itself — a scope choice, a tie-break, a rendering — is `DEOKBUNI_OPERATIONALIZATION`. It may carry runtime authority. It may **never** be presented as, or footnoted to, a classical quotation. |
| **E. No authority from false attribution** | No rule gains runtime authority from a citation that could not be verified. Unverifiable ⇒ `SOURCE_NOT_VERIFIABLE`, and the rule drops to `ADVISORY` or `DEFERRED`. |

**Selection statement required.** Every rule adopted under B or C must contain the sentence form
*"Deokbuni V1 adopts <named source>'s reading for this contract"* — never *"classical Myungri defines it
this way."* Where this document says a pattern is defined a certain way, it means **the selected lineage**
defines it that way.

### 3.5 TRANSPARENT NUMEROUSNESS vs HIDDEN SCORING — new in V1.3

V1.2 over-corrected. It treated *any* counting concept as forbidden scoring, and consequently declared the
strength axis inexecutable because its own governing source (徐樂吾: 「黨眾為強，助寡為弱」) is stated in
terms of numerousness. That was wrong: the prohibition is on **opaque arithmetic**, not on a source-backed
qualitative comparison. V1.3 draws the line explicitly, and this distinction is load-bearing throughout §7.3
and §12.

**ALLOWED**

| Construct | Why |
|---|---|
| `NUMEROUSNESS_FACT` — a transparent, enumerable **list** of the relevant occurrences (not merely a number) | The evidence is inspectable and replayable; a reader can see exactly which stems/branches were counted |
| `SOURCE_BACKED_QUALITATIVE_COMPARISON` — "the supporting faction is more numerous than the opposing faction" | The selected source itself reasons this way (黨眾/助寡, 重重/疊疊, 多/寡). Retaining it is fidelity, not invention |
| Finite categorical states with enumerated entry conditions | Inspectable; no arithmetic |
| An explicit decision **graph/table** whose every cell is written out | A lookup table with all cells stated is not a hidden rule |
| Explicit uncertainty exits | Honest non-resolution |

**FORBIDDEN**

| Construct | Why |
|---|---|
| Weighted additive scores (`season +30, root +20, support +15`) | Opaque; the weights are invented |
| Arbitrary percentages or ratios ("60% ⇒ dominant") | Invented cutoff |
| Hidden numeric cutoffs of any kind | Unreviewable |
| **Count comparison as the SOLE authority** for a verdict | 子平真詮 ch.6 「論十干得時不旺失時不弱」 forbids single-axis projection; a count alone is exactly that |
| Score bands presented as classical doctrine | Violates §2.5 rule D |

**The boundary case, stated precisely.** A numeric cutoff *may* be adopted — but only as
`DEOKBUNI_OPERATIONALIZATION`, only where the source states a quantitative concept it never quantifies
(重重, 疊疊, 皆, 全, 絕無一毫), and only with the chosen cutoff written into the doctrine in the open. Example:
任鐵樵's 從强 requires 印綬**重重** and 比劫**疊疊**; the doctrine may operationalize 重重/疊疊 as "two or
more occurrences", provided it is labelled `DEOKBUNI_OPERATIONALIZATION` and never attributed to 任鐵樵.
What is prohibited is inventing such a cutoff *silently*, or claiming the source supplied it.

## 3. Definition of strength (unchanged from V1 — not an audit finding)

Five related-but-distinct concepts must not be collapsed into one:

| # | Concept | What it measures | Why it is not "strength" alone |
|---|---|---|---|
| 1 | Raw element count | How many stems/branches nominally share the DM's element | A hidden stem can be a dead residual trace; a visible stem can be rootless and floating (浮). |
| 2 | Seasonal vitality (旺相休囚死) | Where the DM's element sits in the month's cycle | Ambient climate, not whether the DM has taken root in it. |
| 3 | Rootedness with integrity (通根) | Presence AND survival of a root | Two separate checks, both required. |
| 4 | Visible-stem support with function (透干) | Whether support stems appear AND are themselves rooted/proximate | Presence alone is insufficient. |
| 5 | Capacity to bear the structure (억부 관점) | Downstream — can the DM sustain its 격局's load, once strength is already known | Circular if folded backward into the strength axes. |

```
AXIS A — CATEGORY GATE (§10 — now graded evidence, not a universal short-circuit)
AXIS B — SEASONAL VITALITY (§4)
AXIS C — ROOTEDNESS WITH INTEGRITY (§5)
AXIS D — VISIBLE-STEM SUPPORT WITH FUNCTION (§6)
  ↓ explanatory chaining, never vote-counting or score summation ↓
FINAL STRENGTH VERDICT, subject to DISQUALIFYING/LIMITING EVIDENCE (§12.5)
  ↓
억부 APPLICATION (downstream, out of scope)
```

TEXT_LAYER: the four-axis structure is a SOURCE_CLASS_D operationalization of SOURCE_CLASS_A material (子平真詮's
격局-first method; 滴천수's 氣勢 holism). SCHOOL: not school-specific — the anti-additive principle is
cross-school. RUNTIME_AUTHORITY: BINDING as pipeline architecture. CONFLICTS: none on the architecture itself;
per-axis conflicts are recorded within §4–§10.

**Rejected explicitly** (unchanged from V1, restated): simple element count = strength; month command alone
= final strength; fixed root/stem points; support-votes-vs-opposition-votes; a small fixed lookup table as
final authority; confidence as a raw agreement-count.

---

## 4. Month-command (月令/월령) doctrine

### 4.1 Evidentiary primacy, not sole determination

월지 is examined first and weighted most heavily. **TEXT_LAYER:** SOURCE_CLASS_A (子平真詮's own organizing
method — 提綱). **SCHOOL:** 格局派 for the procedural framing; the underlying *evidentiary* primacy of the
month branch is cross-school. **CANONICAL_SCOPE:** primacy, not exclusivity. **RUNTIME_AUTHORITY:** BINDING.
**CONFLICTS:** none.

### 4.2 司令 (day-count command) — downgraded, P1 not P0

**V1.1 correction (audit finding 4):** the exact day-count 司令 calculator is **downgraded from P0 to P1**
(see `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`). This section states explicitly why, and what V1.1 does
instead.

- Multiple historical tables for the day-count sub-periods (餘氣/中氣/正氣 splits per branch) exist, and they
  are **not uniform** — 淵海子平-descended tables and 徐樂吾-lineage tables differ. **TEXT_LAYER:**
  SOURCE_CLASS_E for any *specific* numeric table (none is adopted here). **SCHOOL:** the choice of which
  table to use is itself a school/edition policy, not a neutral technical fact.
- **Canonical V1.1 strength reasoning must not depend on an unchosen exact day-count table.** Where a
  precise sub-period split would matter (a birth within a few days of a 節氣 boundary), V1.1 retains explicit
  boundary uncertainty (via the `INSUFFICIENT_STRUCTURAL_EVIDENCE` state, §13) **instead of** either (a)
  blocking all reasoning on an unbuilt calculator, or (b) silently using the month branch's nominal primary
  element as if precision were unnecessary.
- **For 격국 (structure) selection specifically** (not the DM's own strength reading), 子평真詮 does teach
  preferring the 사령 hidden stem if transparent. **TEXT_LAYER:** SOURCE_CLASS_A/C (격국派 procedural
  application of a Class-A text). **RUNTIME_AUTHORITY:** CONDITIONAL — this project is not implementing 격국
  selection in V1.1's scope, so this rule is recorded for completeness and DEFERRED, not adopted or rejected.
- **For the DM's own 旺相休囚死 label**, coarser practice (the month branch's primary/dominant seasonal
  element) is sufficient in the ordinary case. **TEXT_LAYER:** SOURCE_CLASS_A (near-universal textbook
  content descending from 淵海子평/三命통회-era material). **RUNTIME_AUTHORITY:** BINDING as the *default*, with
  the boundary-birth caveat below able to downgrade confidence but never silently override it with a
  fabricated precise reading.

**`OPTIONAL_SILING_POLICY` (for later refinement, not built in V1.1):**

```
IF birth instant is within a to-be-determined window of the preceding/following 節氣 boundary:
  → tag the chart BOUNDARY_SENSITIVE (a FACT-adjacent flag, computable today from the already-frozen
    절입 instant, without needing the day-count sub-period table itself — only the DISTANCE to the
    boundary, not which qi-tier governs, is needed for this flag)
  → the month-command reading (§4.3) proceeds using the nominal primary element as normal
  → but the uncertainty state (§13) is required to consider INSUFFICIENT_STRUCTURAL_EVIDENCE for
    that chart, rather than defaulting to STRENGTH_CONFIDENT
  → when a specific, edition-cited day-count table is later adopted, BOUNDARY_SENSITIVE charts are
    the ones a re-evaluation pass should prioritize
```

This directly closes audit finding 4: V1.1 can run its full reasoning sequence today, on every chart,
without the exact 司令 table — it simply may report lower confidence on boundary-sensitive charts, honestly,
rather than either blocking on an unbuilt P0 dependency or asserting false precision.

### 4.3 The 旺相休囚死 five-state cycle

Unchanged from V1 — not an audit finding. **TEXT_LAYER:** SOURCE_CLASS_A. **SCHOOL:** cross-school, no
genuine dispute. **RUNTIME_AUTHORITY:** BINDING.

| Relation of D to S | State | Gloss |
|---|---|---|
| D = S | 旺 (wang) | DM element IS the season |
| S generates D | 相 (xiang) | DM is season's "child" |
| D generates S | 休 (xiu) | DM is season's "parent," spent |
| D controls S | 囚 (qiu) | DM nominally controls, exhausted |
| S controls D | 死 (si) | DM directly overcome |

Per season: 春(寅卯)→木旺火相水休金囚土死 · 夏(巳午)→火旺土相木休水囚金死 · 秋(申酉)→金旺水相土休火囚木死 ·
冬(亥子)→水旺木相金休土囚火死 · 辰戌丑未→土旺金相火休木囚水死 (subject to §4.2's boundary-sensitivity flag).

This is a **five-way, not binary** classification — 相/休/囚/死 are distinct degrees, never collapsed to one
"weak" bucket.

### 4.4 Why month command cannot be sole authority

**"득령 = 신강" and "실령 = 신약" remain REJECTED as sufficient rules** — both survive only as a
heavily-weighted default that must be tested against Axis C/D evidence (§5–§6) and against the
special-structure evidence stream (§10, now integrated rather than a separate gate — see §11 for the fixed
gate order). Concrete conditions unchanged in substance from V1, restated with provenance tags:

**득령 does not imply strength when:** (1) the only root is in the month branch and that branch is itself
clashed/redirected by combination — TEXT_LAYER: SOURCE_CLASS_D application of §5's Class-A rooting-integrity
principle to the month branch specifically. (2) DM's element is present only via 餘氣 (the §4.2 boundary
case) — SOURCE_CLASS_A (existence of 餘氣 carryover) / SOURCE_CLASS_E (exact thresholds). (3) Overwhelming
functional opposition elsewhere outweighs bare seasonal command — SOURCE_CLASS_B/C, general 億扶派-descended
teaching, exact classical wording not confidently pinned (marked SOURCE_GAP). (4) Special-structure evidence
(§10) — no longer a separate "override," now simply another input to the same reasoning.

**실령 does not imply weakness when:** (1) strong, intact root elsewhere compensates — SOURCE_CLASS_B (滴천수
lineage). (2) numerous rooted, transparent support stems supply sufficient force — SOURCE_CLASS_B. (3)
Special-structure evidence (§10). (4) the month branch's controlling force is itself neutralized by clash/
combination — SOURCE_CLASS_D application of §5 to the month branch.

---

## 5. Rooting (通根/통근) doctrine

### 5.1 Root existence vs. functional strength (unchanged — not an audit finding)

| Fact | Determines |
|---|---|
| Branch's 지장간 contains the element in question (same-stem or same-element/diff-polarity) | **EXISTENCE ONLY** |
| Which qi-tier supplies it, and 司令 status (§4.2 — boundary-sensitivity-flagged, not exact-table-dependent) | Root QUALITY tier |
| Seasonal vitality of the root's own element | Root VITALITY |
| Structural/contextual position (§5.6 — revised) | Root AUTHORITY/closeness |
| Clash exposure and outcome (§8) | Root SURVIVAL |
| Combination exposure and outcome (§8) | Root SURVIVAL |
| Reinforcement vs. scattering | Root CONFIGURATION, not a sum |

A root's **existence** is fixed per-chart. Its **functional strength** is a composite evaluable only relative
to a specific moment, never a static per-branch point value.

### 5.2 Hidden-stem qi tiers

本氣/正氣 (main) > 中氣 (secondary) > 餘氣/初氣 (residual). **TEXT_LAYER:** SOURCE_CLASS_A for the three-tier
concept (三命通會 has the fullest tabulation; 淵海子平 an earlier/coarser version — both named, not merged).
**RUNTIME_AUTHORITY:** BINDING for the tier concept; SOURCE_CLASS_E (SOURCE_GAP) for exact day-count values —
unchanged from V1, and consistent with §4.2's P1 downgrade.

### 5.3 Seasonal vitality of the root itself

**TEXT_LAYER:** SOURCE_CLASS_B (滴천수, as generally read — via 任鐵樵's commentary tradition specifically for
the dynamic-modifier framing) for the principle; SOURCE_CLASS_D for any VITAL/MODERATE/DORMANT tiering.
**RUNTIME_AUTHORITY:** CONDITIONAL (principle) / advisory-engineering (tiering).

### 5.4 Root survival under 沖 — now cross-referenced to §8, not restated

See §8.4 (沖) for the full DETECTION/FORMATION/TRANSFORMATION/FUNCTIONAL/STRENGTH layering. Grading remains
INTACT / WEAKENED / DESTROYED / MEDIATED, never a uniform binary flag.

### 5.5 Root survival under 合 — now cross-referenced to §8, not restated

See §8.1–8.2 (天干合/六합) and §8.3 (三합/방합) for the full layering.

### 5.6 Positional and contextual weight — REVISED (audit finding 5 of the brief's own numbering is climate;
this is the rooting-hierarchy fix requested in brief §5)

**V1.1 correction:** V1 stated a rigid `월지 > 일지 > 시지 > 년지` ranking as near-canonical. This is
**removed as a fixed hierarchy.** No single adopted source/school justifies that exact ordinal ranking as a
general-purpose rule applicable to every judgment this doctrine makes — 월지's primacy specifically (as *the*
seasonal-command branch, §4.1) is well-founded, but extending that same primacy into a blanket ranking of
*all four* pillar positions for *every* rooting judgment overstates what 子평真詮's own organizing premise
(which is about 월지 specifically, for 격국 purposes) actually establishes.

Root authority/closeness is instead evaluated along **explicit contextual dimensions**, each separately
tagged by provenance, none silently combined into one fixed ranking:

| Dimension | TEXT_LAYER | SCHOOL | RUNTIME_AUTHORITY |
|---|---|---|---|
| **Seasonal vitality of the root branch's own element** (§5.3) | SOURCE_CLASS_B | cross-school | CONDITIONAL |
| **Hidden-stem layer** (본기/중기/여기, §5.2) | SOURCE_CLASS_A (concept) / E (exact day-counts) | cross-school | BINDING (concept) |
| **Whether the root is the 월지 itself** (carrying 월지's own seasonal-command authority, §4.1 — not a general position ranking, specifically the seasonal-command fact) | SOURCE_CLASS_A | cross-school | BINDING (for THIS specific reason, not a general "월지 always ranks highest" claim) |
| **Direct structural connection to the Day Master** (the DAY branch specifically, 坐下, sitting immediately beneath the DM in the four-pillar layout) | SOURCE_CLASS_B (滴천수-descended, general 億扶派 pedagogy) | 億扶派-emphasized, broadly absorbed | CONDITIONAL |
| **Relation interference** (is the root branch itself clashed/combined — §8) | SOURCE_CLASS_D application of §8 | cross-school | BINDING (as a survival check, not a ranking) |
| **Whether the root remains usable at evaluation time** (post-§8 integrity check, and — for a temporal-layer question, out of this document's natal-only scope — post-대운/세운 overlay) | SOURCE_CLASS_D | not school-specific | BINDING |

**Explicitly removed:** the claim that 시지 generally outranks 년지, or that any fixed column ordering applies
across all four positions as a general rule. Where a specific judgment genuinely depends on relative pillar
position beyond the two BINDING facts above (월지's seasonal-command authority; 일지's direct DM-adjacency),
this document marks that judgment `SCHOOL_DEPENDENT` and does not resolve it, per the brief's own preference
for `DEFER`/`SCHOOL_DEPENDENT` over invented precision.

**Positional weight and qi-tier remain independent dimensions** — a 餘氣-tier root carrying 월지's
seasonal-command authority is not automatically weaker than a 본기-tier root in a structurally
unremarkable position; both dimensions are tracked, never collapsed into one score.

### 5.7 Compounding — multiple roots do not sum (unchanged — not an audit finding)

**TEXT_LAYER:** SOURCE_CLASS_A (anti-additive holistic reading, 滴천수/子평真詮). **RUNTIME_AUTHORITY:**
BINDING for the no-summation principle; SOURCE_CLASS_D for any specific REINFORCING/SCATTERED tagging scheme.

### 5.8 Twelve-stage vitality cycle (十二運星) — adjacent, not identical, axis (unchanged)

**TEXT_LAYER:** SOURCE_CLASS_C (this is genuinely a separate classical lens, but its integration/priority
relative to 지장간-rooting is a school-level modeling choice). The 陰干逆行-vs-순행 question remains
**SCHOOL_DEPENDENT / unresolved**, explicitly not decided here — flagged `NON_AUTHORITATIVE` for either
specific resolution until an integration-level decision is made.

---

## 6. Visible-stem support (透干) doctrine

Sections 6.1–6.4 and 6.6 are unchanged in substance from V1 (not audit findings); provenance tags added.
**Section 6.5 is corrected** (audit finding via §18/Case 27 of the brief).

### 6.1 Rooted vs. floating support is not equal force

**TEXT_LAYER:** SOURCE_CLASS_B (滴천수 rooting-as-substantiality theme). **RUNTIME_AUTHORITY:** BINDING
(direction of effect); the exact degree is not quantified (avoids audit finding 21's hidden-threshold risk).

### 6.2 Floating support is not zero; proximity matters

**TEXT_LAYER:** SOURCE_CLASS_C/D (a widespread convention, not rigorously codified with 월지-primacy-level
rigor in the base texts). **RUNTIME_AUTHORITY:** CONDITIONAL. **This is the exact clause that made V1's Cap 1
self-contradictory (§0, §12.5) — retained here unchanged, with the caps now removed instead of the doctrine
weakened.**

### 6.3 干合 (stem combination) can neutralize support

Cross-referenced to §8.1 for the full layering; not restated here.

### 6.4 爭合/妒合 (contested combination)

**TEXT_LAYER:** SOURCE_CLASS_C (子평 commentary tradition, broadly acknowledged, under-formalized).
**RUNTIME_AUTHORITY:** CONDITIONAL — gates §8.1's neutralization outcome, does not resolve to a clean tag.

### 6.5 Direct 克 (overcoming) by an adjacent stem — CORRECTED

**V1.1 correction:** the underlying research draft for this rule (and V1's own adversarial Case 27, §17)
named 관살(官殺)/편관/정관 as the element that suppresses a 인성 stem by direct 克. **This is a five-phase-cycle
error.** The correct generation/control relationships, worked from the standard cycle
(木生火生土生金生水生木 / 木克土克水克火克金克木), are:

- **官殺 GENERATES 印, it does not control it** (官殺生印). Worked example: DM = 甲 (Wood). 官殺 = 庚/辛
  (Metal, since 金克木). 印 = 壬/癸 (Water, since 水生木). 金生水 is standard generation — so 官殺(Metal)
  generates 印(Water). A rooted, functional 官殺 near a 인성 stem, if anything, *reinforces* that 인성's own
  generative chain rather than suppressing it (subject to §7.2's own caveat that a generating relationship is
  not automatically a magnitude bonus either — it is a structural fact to weigh, not a score).
- **財 controls 印** (財克印). Worked example, same DM: 財 = 戊/己 (Earth, since 木克土). 印 = 壬/癸ater
  (Water). 土克水 is standard control — so 財(Earth) controls/suppresses 印(Water).

The corrected rule: a support stem (particularly 인성) can be functionally suppressed if directly overcome by
an **adjacent 財 stem** in the controlling relationship, independent of any combination mechanism, graded more
strongly by adjacency (unchanged reasoning from V1, only the controlling element corrected). **TEXT_LAYER:**
SOURCE_CLASS_C (general 子평 이론, 오행 상극 applied at stem-adjacency level — no single named canonical
passage). **RUNTIME_AUTHORITY:** CONDITIONAL. **CONFLICTS:** none material once corrected.

### 6.6 Stem-level vs. branch-level facts are separate objects

**TEXT_LAYER:** SOURCE_CLASS_D (engineering discipline, motivated by how 淵海子평/三命통회 always keep 干 and
支 rule sets formally separate — SOURCE_CLASS_A observation about text structure). **RUNTIME_AUTHORITY:**
BINDING (engineering interface requirement).

---

## 7. Drain/control doctrine

Unchanged in substance from V1 — not a numbered audit finding, but provenance tags added for consistency, and
§7.1's disposition-vs-magnitude warning is retained verbatim since it is exactly the kind of conflation the
audit is generally guarding against elsewhere.

### 7.1 Three mechanistically distinct opposing forces

| Force | Ten Gods | Cycle relation | Character |
|---|---|---|---|
| 食傷 (Output) | 食神, 傷官 | DM generates it | Outflow/leak |
| 財 (Wealth) | 偏財, 正財 | DM overcomes it | Expenditure-through-control |
| 官殺 (Officer/Killing) | 正官, 七殺 | It overcomes DM | Direct restraint |

**TEXT_LAYER:** SOURCE_CLASS_A (生剋制化 framework, commonly read through 任鐵樵's commentary — named
explicitly). **Disposition distinctions** (正官 tolerable vs 七殺 unchecked; 食神 protective vs 傷官
aggressive): **TEXT_LAYER:** SOURCE_CLASS_A (子평真詮). **SCHOOL:** 格局派. **RUNTIME_AUTHORITY:** these
modulate a qualitative severity flag, **never** the base magnitude of drain — **conflating a 格局派 disposition
scale with an 億扶派 magnitude scale is explicitly guarded against**, per the same discipline this whole
revision applies elsewhere.

### 7.2 財 as a bridging force (財生官殺)

**TEXT_LAYER:** SOURCE_CLASS_A (生剋 cycle logic). **RUNTIME_AUTHORITY:** CONDITIONAL (structural-awareness
requirement, not a quantified rule).

### 7.3 Presence vs. effective force — **REPLACED IN V1.3 by the STRUCTURAL STATE MODEL (audit finding D3)**

**What was wrong.** V1.1/V1.2's §7.3 asserted the principle "presence ≠ effective force" and stopped there —
it never defined the WEAK/MODERATE/STRONG ordinal that §12.2's six band contracts then used as their *sole*
decision authority. A developer reaching §12.2 had to invent the ordinal. That was the whole of finding D3.

V1.3 deletes the undefined ordinal and replaces it with a **finite structural state model**: four independent
dimensions, each with enumerated states, each state entered by a condition over deterministic facts that
already exist in `src/features/myungri/`. No magnitude scale, no score, no "effective force" ordinal survives.

**TEXT_LAYER:** the principle (presence ≠ function) is SOURCE_CLASS_B (滴天髓 病藥 framing). The four-dimension
decomposition is `DEOKBUNI_OPERATIONALIZATION` (§2.5 rule D) built on 徐樂吾's own two-axis statement plus
任鐵樵's root clause; it is not claimed as a classical taxonomy. **RUNTIME_AUTHORITY:** BINDING as the future
inference contract. **This section specifies a FUTURE contract; no runtime code implements it.**

#### 7.3.0 The two governing source statements

1. **徐樂吾, 子平真詮評註 ch.6** (NAMED_COMMENTARY): 「大致得時為旺，失時為衰；黨眾為強，助寡為弱」
   — two independent axes: a **seasonal** axis (得時/失時) and a **faction-numerousness** axis (黨眾/助寡).
   *Deokbuni V1 adopts 徐樂吾's two-axis decomposition as the organizing structure for ordinary strength.*
2. **子平真詮 ch.6 「論十干得時不旺失時不弱」** (ORIGINAL_TEXT, verified): 得令 alone does not establish 旺,
   and 失令 alone does not establish 弱. **This is a binding NEGATIVE constraint**: no Stage-1 verdict may be
   projected from the seasonal axis alone, in either direction. It is the single rule that would have
   prevented the rejected `natalStrength.ts` RULE_TABLE from being written.

A third statement supplies an independent existence gate:

3. **任鐵樵** (NAMED_COMMENTARY): 「日干不論月令休囚，只要四柱有根，便能受財官食神而當傷官七殺」
   — a Day Master with **any** root can bear opposition regardless of seasonal disadvantage. This is an
   EXISTENCE test, not a magnitude test, and it is executable today.

#### 7.3.1 `SEASONAL_STATE` — from 月令

| State | Entry condition (deterministic) | Source |
|---|---|---|
| `SEASON_SUPPORTIVE` | `monthCommand.dayMasterSeasonalPhase ∈ {旺, 相}` | 徐樂吾 得時為旺; the 旺相/休囚死 cut is `DEOKBUNI_OPERATIONALIZATION` already disclosed in `monthCommand.ts` as `DEUKRYEONG_MAPS_WANG_AND_XIANG_TO_IN_COMMAND` |
| `SEASON_OPPOSING` | `dayMasterSeasonalPhase ∈ {休, 囚, 死}` | 徐樂吾 失時為衰 |

The 5-state phase is **retained in the evidence payload** and is display-authoritative; only the binary cut
feeds the decision graph. Rejected alternative cuts, named per §2.5: 臨官/帝旺-only; 長生~帝旺; 월지가 인성/비겁.

#### 7.3.2 `ROOT_STATE` — from 通根 existence

| State | Entry condition (deterministic) | Source |
|---|---|---|
| `NO_ROOT` | `sameElementRooting.sameElementRoots` is empty | 任鐵樵 只要四柱有根 (negated) |
| `ROOT_PRESENT` | at least one same-element root exists, and no root's branch participates in a relation whose outcome is UNRESOLVED (§8.9) | 任鐵樵 只要四柱有根 |
| `ROOT_PRESENT_RELATION_UNRESOLVED` | at least one root exists, but at least one root's branch participates in a detected relation whose functional outcome is `UNRESOLVED` per §8.9 | `DEOKBUNI_CONSERVATIVE_OPERATIONAL_POLICY` (§8.9) |

**Deliberately NOT defined:** `STRONG_ROOT`, `WEAK_ROOT`, `DESTROYED_ROOT`. No located source supplies
executable conditions for a graded root magnitude (§8.10). Root tier (본기/중기/여기) is carried as evidence
and is **not** a state discriminator in V1.

#### 7.3.3 `SUPPORT_STATE` and `OPPOSITION_STATE` — the 勢 axis, via transparent numerousness

Per §3.5, numerousness is retained because the selected source reasons with it. The **factions** are the
fixed classical Ten-God grouping (`DEOKBUNI_OPERATIONALIZATION` of an undisputed taxonomy):

- **SUPPORTING faction** = 比肩 · 劫財 · 正印 · 偏印 (비겁 + 인성)
- **OPPOSING faction** = 食神 · 傷官 · 正財 · 偏財 · 正官 · 七殺 (식상 + 재성 + 관살)

**`NUMEROUSNESS_FACT` (transparent, enumerable — the LIST is emitted, not merely a count).** One occurrence
per: each visible non-DAY stem, and each hidden stem of each of the four branches. Every occurrence carries
its pillar position, stem, and (for hidden stems) its qi tier, so the comparison is fully inspectable.
This enumeration is `DEOKBUNI_OPERATIONALIZATION` — 徐樂吾 does not state what counts as a 黨 member.

| `FACTION_STATE` | Entry condition | Source |
|---|---|---|
| `SUPPORT_NUMEROUS` | supporting occurrences **>** opposing occurrences | 徐樂吾 黨眾為強 |
| `FACTION_EVEN` | supporting occurrences **=** opposing occurrences | not stated by any source ⇒ uncertainty exit |
| `SUPPORT_SCARCE` | supporting occurrences **<** opposing occurrences | 徐樂吾 助寡為弱 |

`OPPOSITION_CHANNELS` is carried **alongside** and never summed into the above: the three opposing channels
(`OUTPUT_CHANNEL` 식상 · `WEALTH_CHANNEL` 재성 · `CONTROL_CHANNEL` 관살) are recorded separately, per §7.1's
requirement that they stay mechanistically distinct. They inform §12's counterevidence clauses; they are
**not** collapsed into a single negative quantity.

> **Guard (§3.5).** The faction comparison is **never the sole authority** for a Stage-1 verdict — §12.1's
> decision graph requires agreement across dimensions, and 子平真詮's 得時不旺失時不弱 independently forbids
> single-axis projection. A bare count that outvoted the other dimensions would be exactly the "count voting
> as sole authority" §3.5 prohibits.

#### 7.3.4 What this replaces

`WEAK / MODERATE / STRONG effective force` is **deleted from the doctrine**. Every §12.2 contract that
referenced it is rewritten in §12 against the states above. Any future text reintroducing a magnitude ordinal
for "effective force" is a regression against finding D3.

### 7.4 Strength and favorability are different axes

**TEXT_LAYER:** SOURCE_CLASS_D (structural/logical separation, motivated by SOURCE_CLASS_A material).
**RUNTIME_AUTHORITY:** BINDING.

---

## 8. Relation/transformation doctrine — REWRITTEN (audit finding 6)

**V1.1 correction:** V1's combination/clash treatment answered "does this mechanism affect strength" as a
single question per mechanism. This conflated *detecting* a relation with the relation actually *forming/
completing*, with it *transforming* an element's identity, with it *functionally* impairing a stem/branch,
and with it having a *strength-axis* effect specifically (as opposed to a 격局/favorability effect, or no
effect at all). These are five separate questions. Answering "yes" to detection must never be read as
answering "yes" to any of the other four.

For each of the eight mechanisms:

### 8.1 天干合 (stem combination — 甲己/乙庚/丙辛/丁壬/戊癸)

- **DETECTION:** deterministic — two stems adjacent (or at least present) form one of the five named pairs.
  Already available as a frozen fact (`pillarRelations.ts`). SOURCE_CLASS_A.
- **FORMATION/VALIDITY:** requires adjacency (proximity matters — a pair separated by an intervening pillar
  is weaker/contested) and absence of contest (§6.4's 爭合/妒合 — a stem claimed by two suitors may not bind
  cleanly). SOURCE_CLASS_B/C. **DOCTRINAL_INFERENCE required — not deterministic from detection alone.**
- **TRANSFORMATION (合化):** requires ALL of: (1) seasonal support for the transformed element (SOURCE_CLASS_A/B),
  (2) proximity (SOURCE_CLASS_B), (3) absence of a breaking/competing force (SOURCE_CLASS_A/B), (4) — some
  lineages — unopposed persistence after transformation (SOURCE_CLASS_C, school-variable), (5) DM-involvement
  caution: when the DM itself is one of the combining stems, **this is explicitly SCHOOL_DEPENDENT and
  contested across lineages** — some commentary lines treat DM-combination as routine 合화 candidacy, others
  read it conservatively as binding-without-transforming, closer to a distinct 從化/從格 question (§10).
  **V1.1 does not resolve this dispute; a runtime default (if one is chosen) must be recorded as a disclosed
  SOURCE_CLASS_D engineering choice, never presented as settled.**
- **FUNCTIONAL EFFECT:** absent transformation, the stem is "tied up"/distracted — reduced but not erased
  supportive/opposing function (합而不화). SOURCE_CLASS_A/B.
- **STRENGTH EFFECT:** FUNCTIONAL by default (availability discount); escalates to STRUCTURAL (re-derivable
  element identity) only if TRANSFORMATION's full precondition set is independently satisfied. **合 detected
  ≠ 化 achieved — this equation is explicitly rejected** (audit's own named FAIL condition).

### 8.2 六合 (branch six-combination — 子丑/寅亥/卯戌/辰酉/巳申/午未)

Same five-question structure as §8.1, applied to branches. **DETECTION:** deterministic (frozen fact).
**FORMATION/VALIDITY:** adjacency-sensitive, same as §8.1. **TRANSFORMATION:** subject to the same 化氣
precondition set as §8.1 (the classical 化氣 conditions apply to stem-pairs specifically in most treatments;
whether a pure branch 六合 independently transforms, versus merely binding, is itself less uniformly
codified than the stem case — flagged SOURCE_CLASS_C, school-variable). **FUNCTIONAL EFFECT:** binding/
diversion, not automatic erasure. **STRENGTH EFFECT:** FUNCTIONAL by default; **六合 detected ≠ automatic 化**
(explicitly named FAIL condition in the audit, directly addressed).

### 8.3 三合 / 方合 (trio harmony)

- **DETECTION:** deterministic — full trio (三合: 申子辰/亥卯未/寅午戌/巳酉丑; 方合: 寅卯辰/巳午未/申酉戌/亥子丑)
  or partial (半합, 2-of-3 for 三合 specifically) present. SOURCE_CLASS_A.
- **FORMATION/VALIDITY:** a full trio is doctrinally stronger/more secure than a 半합; whether the 半합
  includes the trio's 帝旺/center branch matters (center-inclusive half-combinations read stronger).
  SOURCE_CLASS_A/B. **Whether 방합 doctrinally outranks 三합 in force is a real, commonly-taught point but
  genuinely disputed by some commentators — SOURCE_CLASS_C, explicitly flagged SCHOOL_DEPENDENT, not
  resolved.**
- **TRANSFORMATION:** when a FULL trio (三合 or 방합) forms and its FORMATION/VALIDITY conditions hold (not
  broken by a competing 沖 on a member branch, §8.4), the concentrated element is read as structurally
  present — this is the one case where a completed relation is closer to automatically STRUCTURAL, because
  the classical doctrine for a *completed* 局/bureau is less conditional than 合화's DM-involvement dispute.
  **A completed 半합 (partial trio) does NOT receive this same automatic treatment** — it remains a graded,
  weaker signal, not a structural transformation. SOURCE_CLASS_A/B.
- **FUNCTIONAL EFFECT:** a completed bureau/directional set concentrates the participating branches' qi;
  downstream rooting/vitality evaluation for elements touching those branches must be re-run against the
  concentrated element, not the original independent branches (this is a sequencing rule, §11).
- **STRENGTH EFFECT:** STRUCTURAL for a completed full set (with the FORMATION/VALIDITY conditions holding);
  FUNCTIONAL-only (a mere reinforcement discount, not a re-derivation) for a partial 半합 lacking the center
  branch. **三合/方合 detected ≠ automatically transformed** — a partial or contested set does not receive
  the full-transformation treatment (explicitly named FAIL condition, directly addressed).

### 8.4 沖 (clash — 子午/丑未/寅申/卯酉/辰戌/巳亥)

- **DETECTION:** deterministic — two branches in direct opposition. SOURCE_CLASS_A.
- **FORMATION/VALIDITY:** N/A as a separate question for 沖 specifically (unlike 合, a clash does not need to
  "form" beyond detection — but its *severity* is conditional, see below).
- **TRANSFORMATION:** N/A — 沖 does not transform an element's identity; it damages a branch's capacity to
  function, it does not convert it into a different element.
- **FUNCTIONAL EFFECT:** conditional, not automatic, on: each branch's own seasonal vitality; each branch's
  own reinforcement elsewhere (additional same/generating branches, or participation in a completed §8.3
  bureau); pillar distance (adjacent pillars clash more forcefully than distant ones — SOURCE_CLASS_C,
  no numeric decay curve sourceable, ordinal only); and whether a third branch mediates via **貪合忘沖**
  ("greedy for the combination, forgets the clash" — a named SOURCE_CLASS_A/B principle). Graded INTACT /
  WEAKENED / DESTROYED / MEDIATED — **never a uniform binary flag.**
- **STRENGTH EFFECT:** FUNCTIONAL — impairs a root/support/opposition candidate's capacity to act, does not
  by itself restructure what element occupies the position. **沖 detected ≠ root destroyed** (explicitly
  named FAIL condition, directly addressed — this was already V1's stated position but is restated here for
  completeness of the five-question framework, since V1 did not apply this framework as explicitly).

### 8.5 刑 (punishment — 寅巳申/丑戌未/子卯/自刑)

**V1.1 correction (audit finding on §8, and brief §8's own instruction not to state an absolute
zero-effect rule):** V1 stated "형 has no structural authority" as though this were a settled Level-A
universal classical position. **This overstated the case.** The corrected position:

- **DETECTION:** deterministic — the named branch groupings present (full trio, or the doubled self-형
  branch). SOURCE_CLASS_A (the groupings themselves are a real, attested classical taxonomy).
- **FORMATION/VALIDITY/TRANSFORMATION:** not established with confidence in the sources reviewed —
  SOURCE_CLASS_E, SOURCE_GAP.
- **FUNCTIONAL/STRENGTH EFFECT:** genuinely and substantially **SCHOOL_DEPENDENT.** 형's canonical grounding
  is comparatively thin relative to 合/沖/會 in the structural cores of 子평真詮/滴천수; its systematic
  elaboration is more prominent in later/popularized compendia. Some lineages give 형 real functional weight
  (particularly in event/medical/legal-prediction contexts, arguably outside strength calculus entirely);
  others discard it from structural (qi-strength) analysis altogether. **V1.1's runtime policy:**
  `RUNTIME_STRENGTH_AUTHORITY = DEFER` — not because the classical tradition universally says 형 has zero
  effect (it does not universally say that), but as a **conservative product policy** given the current
  state of sourcing: the disagreement is real and substantial enough that encoding either "형 matters" or
  "형 never matters" as runtime-binding would assert more certainty than this research supports. This is
  recorded as a product decision, explicitly distinguished from a doctrinal claim.

### 8.6 害 (harm — 子未/丑午/寅巳/卯辰/申亥/酉戌)

Same corrected treatment as §8.5. **DETECTION:** deterministic, SOURCE_CLASS_A (real, attested pairing list).
**FUNCTIONAL/STRENGTH EFFECT:** thinner grounding than 형 even — traditionally regarded as among the weakest
of the classical branch relationships, largely symbolic/interpersonal in classical characterization.
`RUNTIME_STRENGTH_AUTHORITY = DEFER`, same conservative-product-policy framing as §8.5 — not asserted as a
Level-A universal zero-effect claim.

### 8.7 破 (break)

Same corrected treatment. **DETECTION:** the canonical pair list itself is contested across derivations
(SOURCE_GAP — some derivations overlap awkwardly with 六合 pairs under different logic) — SOURCE_CLASS_E for
any *specific* pair list. **FUNCTIONAL/STRENGTH EFFECT:** `RUNTIME_STRENGTH_AUTHORITY = DEFER`, weakest and
least uniformly attested of the eight mechanisms; many teaching lineages omit 破 from practical use entirely.

### 8.8 Summary policy for 형/害/破

All three: `RUNTIME_STRENGTH_AUTHORITY = DEFER` (conservative product policy, not a universal classical
zero-effect claim). May be retained as advisory/documentation-only annotations if kept at all (e.g. for
future event-symbolism features unrelated to strength), never feeding the A–H reasoning sequence's strength
determination. This directly satisfies brief §8's instruction: absolute exclusion is removed; the
distinction between "insufficient evidence to make this runtime-authoritative" and "classical tradition says
zero effect" is now explicit.

### 8.9 RELATION OUTCOME CONTRACT — new in V1.3 (closes D4, conservatively)

**The V1 status of every mechanism, stated per layer.** `V1_STATUS` governs what a future reasoner may do
with the mechanism; `DETECTION_AVAILABLE` is already true everywhere (it is a frozen deterministic fact).

| Mechanism | DETECTION | FORMATION rule | TRANSFORMATION rule | FUNCTIONAL EFFECT rule | STRENGTH EFFECT rule | V1_STATUS |
|---|---|---|---|---|---|---|
| 天干合 | ✅ frozen fact | partial (adjacency, 爭合/妒합) | 5-precondition set, DM-involvement disputed | ❌ none adopted | ❌ none adopted | `SUPPORTED_WITH_CONDITIONS` (detection + formation evidence only) |
| 六合 | ✅ | thinner than stem 合 | ❌ neither pole cited | ❌ | ❌ | `UNRESOLVED` |
| 三合 | ✅ | full-trio vs 半합 distinction | ❌ not adopted | ❌ | ❌ | `SUPPORTED_WITH_CONDITIONS` (formation only) |
| 方合 | ✅ | full-set standard | ❌ not adopted | ❌ | ❌ | `SUPPORTED_WITH_CONDITIONS` (formation only) |
| 沖 | ✅ | n/a | n/a | contextual only, no decision procedure | ❌ | `UNRESOLVED` |
| 刑 | ✅ | — | — | — | — | `DEFERRED` |
| 害 | ✅ | — | — | — | — | `DEFERRED` |
| 破 | ✅ | — | — | — | — | `DEFERRED` |

**`DEOKBUNI_CONSERVATIVE_OPERATIONAL_POLICY` (binding, and labelled as Deokbuni's own):**

> **Detection alone NEVER changes root or stem function.** Where a relation's functional outcome is not
> canonically supported, the engine must **not** weaken a root, destroy a root, transform an element, or
> alter a strength reading. It emits `RELATION_EFFECT_STATUS = UNRESOLVED` and propagates an uncertainty
> marker to the consumer (§7.3.2's `ROOT_PRESENT_RELATION_UNRESOLVED`, §12.1 row 13–18).

This is a **software safety policy, not a doctrinal claim that classical Myungri says "no effect."** The
sources plainly do describe effects; what they do not supply is a decision procedure a second implementer
would reproduce. Under-claiming is recoverable; over-claiming silently corrupts every downstream verdict.

**Hard contracts (each stated so it cannot be quietly relaxed):**

- 沖 detected **≠** root destroyed. There is no rule in this document by which detecting a clash reduces a
  root's status. Any future edit adding one must first supply the decision procedure.
- 三合 detected **≠** 三合局 formed-and-transformed.
- 方合 detected **≠** 方局 formed-and-transformed.
- 六合 detected **≠** 化 succeeded.
- 天干合 detected **≠** 合化 succeeded.

**Deferring transformation does not block the strength engine.** §12's Stage-1 table reads `ROOT_STATE`,
`SEASONAL_STATE`, `FACTION_STATE` — none of which requires a transformation verdict. An unresolved relation
touching a root routes to `ROOT_PRESENT_RELATION_UNRESOLVED`, which caps the result at BALANCED and flags
uncertainty. The engine therefore runs today, with honest uncertainty, rather than blocking on an advanced
doctrine that is not ready.

### 8.10 ROOT INTEGRITY STATE MODEL — new in V1.3, deliberately reduced

V1.1 carried `INTACT / WEAKENED / DESTROYED / MEDIATED`. **V1.3 reduces this to three states**, because the
four-state model failed on its own terms: `DESTROYED` had no source supplying categorical destruction (the
sources treat 沖 severity contextually throughout), and `WEAKENED` had **no consumer** — nothing in the
document said what a weakened root changes, so the one computable state was inert.

| State | Entry condition | Consumer |
|---|---|---|
| `ROOT_PRESENT_UNMODIFIED` | a same-element root exists and its branch participates in no detected relation | §7.3.2 `ROOT_PRESENT` → §12.1 normally |
| `ROOT_EFFECT_UNRESOLVED` | a root exists and its branch participates in a detected relation whose outcome is `UNRESOLVED` per §8.9 | §7.3.2 `ROOT_PRESENT_RELATION_UNRESOLVED` → §12.1 rows 13–18: caps at BALANCED, flags uncertainty |
| `NO_ROOT` | no same-element root anywhere | §7.3.2 `NO_ROOT` → §12.1 rows 1–6; also the 從財/從官殺/從兒 entry premise |

**Removed, with reasons:** `DESTROYED` — no source supplies categorical destruction; retaining it would
license exactly the 沖⇒destroyed inference §8.9 forbids. `WEAKENED` — computable in principle but no
consumer exists, and a state nothing reads is not a contract, it is decoration. `MEDIATED` (貪合忘沖) —
genuinely attested as a *concept*, but no decision procedure for when mediation succeeds was located;
folded into `ROOT_EFFECT_UNRESOLVED` rather than given false precision.

**Every retained state has exactly one named consumer.** That is the test a future edit must pass before
adding a fourth.

---

## 9. Climate (調候) vs. structural-strength separation — REVISED (audit finding 5)

**Governing statement, revised:** 調候 and 身强弱 are two independent analytical **domains**; climate must
never be computed as, added to, subtracted from, or merged into the strength *verdict* (the seven-band label
or special-structure category). **This part of V1's rule is retained unchanged and remains BINDING.**

**What changes:** V1 additionally asserted "climate can never affect strength functionality" as an absolute.
**This overstated the case and is removed.** The corrected model distinguishes two things V1 had merged:

- **`CLIMATE_DOMAIN`** — the separate downstream judgment domain (조후 needs, remedy selection) that feeds
  Yongshin, never the strength verdict. Unchanged, still absolute: climate facts never directly assign WEAK/
  STRONG or a seven-band label. **TEXT_LAYER:** SOURCE_CLASS_A/B (窮통보감/調候派 organizing method; 滴천수's
  病藥 framing keeping climate logically downstream). **RUNTIME_AUTHORITY:** BINDING (the separation itself).

- **`EXTREME_CLIMATE_FUNCTIONALITY`** — a narrowly-sourced modifier on a **specific element's effective
  manifestation/vitality**, distinguished from the strength verdict itself. This is the corrected addition:
  where classical doctrine actually documents that an element's *function* (not its abstract nominal
  presence) is climate-constrained — e.g. Water in peak-summer months functionally stressed by evaporative/
  thermal pressure even when nominally rooted; Water in peak-winter months abundant yet "frozen," not
  properly nourishing Wood without Fire to thaw it; Wood in dry-土 months needing Water to remain viable
  regardless of nominal root count — this is real, sourced content (SOURCE_CLASS_B, 窮통보감/적천수 commentary
  tradition, illustrative recurring cases rather than one quotable passage) about **how a root/support fact
  already established elsewhere in this doctrine (§5, §7.3) manifests**, not a new independent strength
  input.

**How `EXTREME_CLIMATE_FUNCTIONALITY` is allowed to participate, precisely:** it may inform the SAME
functional-force grading already used for root/support/opposition candidates (§5.3's "seasonal vitality of
the root's own element" and §7.3's "effective force gate" already ask "is this element's function
constrained by season" — climate-extremity is a *specific, sourced instance* of that same question, not a
separate channel). It does **not** get its own additive slot in the strength synthesis, and it never assigns
a band directly. Where the exact operational threshold for "how extreme is extreme enough to matter" is
unresolved (which is most of the specifics — no numeric table is sourceable, per §9's original caveat),
that threshold is marked `DEFERRED`, not asserted as zero and not fabricated as a specific cutoff.

**`CLIMATE_VS_STRENGTH_CONFLICT` surfacing** (unchanged from V1): where 조후 and 격局/억부 would recommend
opposite elements, this is a legitimate, sourced disagreement (§21 of canonical V1, retained) requiring
explicit downstream reconciliation, never silent averaging.

This directly satisfies brief §9: the absolute "zero possible functionality effect" claim is removed; climate
still cannot assign a strength label; the new middle ground (a functionality modifier on already-established
facts, sourced and scoped, with unresolved specifics honestly deferred) is added.

---

## 10. Special-structure gate — REWRITTEN (audit findings 1, 3, and gate-order finding)

### 10.0 The universal disqualifier is removed; the correct mechanism is functional-integrity, not existence

**V1 stated:** "any single genuinely ROOTED opposing element is sufficient to break (破格) the pattern,"
treated as a near-universal SG-0 rule applied identically across every 從-pattern. **The audit correctly
found this insufficiently supported as a universal classical rule**, and its interaction with the caps (§0,
§12.5) produced an internal contradiction.

**What the sources actually support, worked through carefully:** the disqualifying-root idea is real and
commonly taught (a follow-pattern requires the DM to have *no* genuine alternative but to submit to the
dominant force — a functioning competitor root reintroduces that alternative). But V1's SG-0 tested only
whether the opposing element **exists with a root**, never whether that root itself passes the **same
functional-integrity test** (§5.1's existence-vs-function distinction, §8's clash/combination survival
grading) this document applies to *every other* root judgment in the system. A "rooted" opposing element
that is itself seasonally dead, isolated, and destroyed by a clash from the dominant faction is not, on this
document's own stated principles (§5.1, §8.4), functioning — treating its mere existence as an absolute,
short-circuiting disqualifier is exactly the kind of existence-vs-function collapse this whole doctrine exists
to prevent (§0's remediation entry #1, #3).

**Corrected mechanism:** a candidate disqualifying element for a given pattern is evaluated through the
**same B/E/F machinery** already built for the ordinary model (§11's reasoning sequence, not a separate rule):
does it have a root (§5), is that root functionally intact after clash/combination (§8), is its own seasonal
vitality live or dead (§5.3)? A **functionally intact, rooted** opposing element remains **very strong,
usually decisive** counterevidence against CONFIRMED status — this document does not weaken that conclusion,
it corrects how it is reached. A **nominally rooted but functionally neutralized** opposing element does not
automatically disqualify; it becomes evidence feeding the `CANDIDATE_UNCONFIRMED` vs `CONFIRMED` boundary
(§10.5), graded, not a hard veto. This is DISQUALIFYING/LIMITING EVIDENCE (matching §11/§12.5's general
replacement of hard caps), not a bolt-on universal short circuit — and it directly fixes the gate-order
contradiction the audit also flagged (§11 below): the gate no longer needs its own separate fact-gathering
pass, because it consumes the SAME finalized (post-F) B/C/D/E facts the ordinary model already computed.

**眞從 vs 假從 remains a real spectrum** (SOURCE_CLASS_C — commonly-taught distinction, not tied to one
precisely citable passage): 眞從 = a candidate disqualifying element is confirmed functionally absent/
neutralized across the whole exhaustive scan; 假從 = a disqualifying element retains marginal, contested, or
partially-neutralized standing. This spectrum is the doctrinal basis for the three-state (now four-state,
see below) output, not a binary.

**"Dominant force" is DELETED from this document (V1.3).** V1.1/V1.2 defined it here, by elimination, as a
shared abstraction that every §10.1 pattern's MINIMUM POSITIVE CONDITIONS then invoked. Two problems, both
fatal: (a) the phrase is the *same* unsourced magnitude construct as the "decisive tilt" deleted from §12 —
removing it from the band contracts while leaving it in the special-structure gate merely **relocated** the
hidden threshold; and (b) no source states a shared "dominant force" premise across these patterns in the
first place — each source names its **own** concrete condition.

**Replacement.** Each pattern in §10.1 now states its own source-backed condition directly, and no pattern
refers to a shared dominance abstraction:

| Pattern | What replaced "dominant force" | Source |
|---|---|---|
| 從旺 | 四柱皆比劫 · 無官殺之制 · 有印綬之生 | 任鐵樵 從象 |
| 從强 | 印綬重重 · 比劫疊疊 · 日主又當令 · 絕無一毫財星官殺之氣 | 任鐵樵 從象 |
| 專旺 | 或方或局全 (稼穡: 四庫皆全) · 不雜\<controller\> | 任鐵樵 形象第十一 |
| 從財 / 從官殺 | the relevant opposition channel is the **uniquely occupied** one | 任鐵樵 從勢 「視其財官食傷之中，何其獨旺」 |
| 從兒 | 月令 carries 食傷 · ∃財 · (食傷多也 — DEFERRED, unquantified) | 滴天髓 順局 + 任鐵樵 |

The elimination-style functional-integrity reasoning that motivated the old definition survives where it
belongs — in §10.0's disqualifier mechanism — but it is no longer dressed up as a magnitude term, and no
pattern's *positive* conditions depend on it.

### 10.1 Per-pattern rebuild — no homogeneous "從弱 family"

**V1.1 correction:** V1 treated 從財格/從官殺格/從兒格 as one "從弱 family" sharing entry/disqualifier
conditions with only per-subtype additions layered on top. **The audit found this treats a shared category as
though a specific school explicitly organizes it that way; no single adopted source is cited establishing
that shared-scaffold structure as such.** Each pattern below is now specified independently, with its own
SOURCE LINEAGE, and shared language between patterns is stated only where the *same* source material
genuinely supports the same claim for each — not assumed by category membership.

#### 從旺格 — **REWRITTEN IN V1.3 (audit finding D2)**

> **Deokbuni V1 adopts 任鐵樵's reading for this contract.** The 滴天髓 verse layer does not define 從旺;
> 任鐵樵 does, in 六親論·從象 (chapter 第四十七). The V1.1 entry attributed the pattern to a "滴天髓 commentary
> tradition … later systematized (徐樂吾-lineage naming conventions)" — the 徐樂吾 half of that attribution was
> never verified and is withdrawn (§2.5 rule E).

- **SOURCE (verified verbatim):** NAMED_COMMENTARY — 任鐵樵《滴天髓闡微》六親論·從象:
  「從旺者，四柱皆比劫，無官殺之制，有印綬之生，旺之極者，從其旺神也。」
- **REQUIRED PREMISES** (each clause of the source, mapped to a deterministic fact):
  1. `四柱皆比劫` — the chart's occurrences are 比劫 throughout. `NUMEROUSNESS_FACT` per §7.3.3, read as
     **zero 官殺 occurrences and zero 財 occurrences** (see DISQUALIFIERS — 皆 leaves no room for them).
  2. `無官殺之制` — no 官殺 exercising control. Existence test over `tenGodFacts`.
  3. `有印綬之生` — **印綬 IS PRESENT and generating. This is a POSITIVE REQUIREMENT, not a disqualifier.**
     V1.1 did not carry this clause at all; a chart with no 印 anywhere does not satisfy 任鐵樵's 從旺.
- **DISQUALIFIERS:** any 官殺 occurrence; any 財 occurrence. Both follow from 四柱皆比劫 read together with
  從强's parallel 絕無一毫財星官殺之氣 — **presence, not functional presence** (see the PRESENCE-vs-FUNCTION
  conflict below).
- **RESIDUAL_OPPOSITION_POLICY:** **V1.1's leniency is WITHDRAWN.** V1.1 said a 餘氣-tier, seasonally-dead,
  clash-damaged disqualifier "does not by itself disqualify." 任鐵樵's own wording for the sibling pattern is
  絕無一毫…之氣 — *not one hair of the qi* — which is **stricter** than "no functionally-intact root", and a
  餘氣-tier root is still 氣 on the plain reading. Deokbuni V1 follows the source: presence disqualifies.
- **ROOT_POLICY:** no branch-configuration (三合/方合) requirement. That belongs to 專旺 only — do not let
  專旺's completed-set machinery leak here.
- **SEASON_POLICY:** 任鐵樵 states none for 從旺 (contrast 從强, which requires 日主又當令). V1.1's
  "월령 seasonally aligned … or neutral-to-favorable" is **unsourced and is deleted.**
- **OUTPUT/WEALTH/OFFICER policies:** 財 and 食傷 appear in the source only in the following 行運 (luck-cycle)
  clauses, which are **not** entry conditions (§2.5 rule A — do not promote luck commentary to a gate).
- **TRUE_FALSE_FOLLOWING (眞從/假從):** **NOT APPLICABLE.** 眞從/假從 is ORIGINAL_TEXT (滴天髓
  「真從之象有幾人，假從亦可發其身」) whose own gloss frames it entirely within the **weak-DM** follow family
  (「日主弱矣，財官強矣，不能不從，中有所助者，便假」). Extending it to the strong-DM patterns is UNSOURCED;
  V1.1's blanket "眞假從 POLICY: as §10.0" is withdrawn for 從旺/從强/專旺.
- **RUNTIME_AUTHORITY:** CONDITIONAL (future inference; not implemented).
- **CONFLICTS:** 子平真詮 does not use this vocabulary — a real, named school gap, recorded, not smoothed.
- **REACHABILITY:** `CAN_REACH_CONFIRMED` — every premise is an existence/absence test over deterministic
  facts, with no unquantified term.

#### 從强格 — **REWRITTEN IN V1.3 (audit finding D2)**

> **Deokbuni V1 adopts 任鐵樵's reading.** The 從旺-vs-從强 distinction is **real and source-level**: both are
> defined in adjacent sentences of the same 任氏曰 block, on three explicit axes. V1.1's claim that "some
> lineages treat 從强 as the broader category … others use the two terms interchangeably" describes the
> *modern reception* layer, not the source, and is demoted to a note.

- **SOURCE (verified verbatim):** NAMED_COMMENTARY — 任鐵樵《滴天髓闡微》六親論·從象:
  「從強者，四柱印綬重重，比劫疊疊，日主又當令。絕無一毫財星官殺之氣，謂二人同心，強之極矣，可順而不可逆也。」
- **REQUIRED PREMISES:**
  1. `印綬重重` — 印 occurrences are repeated. **Unquantified in the source.**
     `DEOKBUNI_OPERATIONALIZATION` (§3.5): read as **two or more 印綬 occurrences**. This cutoff is Deokbuni's,
     is stated here in the open, and is **not** attributed to 任鐵樵.
  2. `比劫疊疊` — same treatment: **two or more 比劫 occurrences**, same disclosure.
  3. `日主又當令` — **MANDATORY**, unlike 從旺. `SEASONAL_STATE = SEASON_SUPPORTIVE` (§7.3.1).
  4. `絕無一毫財星官殺之氣` — not one hair of 財 or 官殺 qi.
- **DISQUALIFIERS:** any 財 or 官殺 **occurrence**. **SCOPE — a real trap, flagged by adversarial review:**
  read naively across *every* 지장간 tier this predicate self-destructs, because the very branches that
  constitute the pattern carry hidden 財 (e.g. 亥 and 寅 both hold 戊). Deokbuni V1 therefore scopes
  絕無一毫 to **visible stems plus 본기 (main-qi) hidden stems**, labelled `DEOKBUNI_OPERATIONALIZATION`, with
  the residual 중기/여기 occurrence emitted as evidence and capping the result at `CANDIDATE_UNCONFIRMED`
  rather than disqualifying. Without this scope the pattern is unreachable by construction.
- **THE 從旺 / 從强 BOUNDARY (three source-level axes, not a matter of taste):**

  | Axis | 從旺 | 從强 |
  |---|---|---|
  | 印's role | present and generating (有印綬之生) | present **and repeated** (印綬重重) |
  | 日主當令 | not stated | **mandatory** (日主又當令) |
  | Composition | 四柱皆比劫 | 印綬 + 比劫 together (二人同心) |

- **RESIDUAL_OPPOSITION_POLICY / ROOT_POLICY / TRUE_FALSE_FOLLOWING:** as 從旺 above.
- **RUNTIME_AUTHORITY:** CONDITIONAL. **REACHABILITY:** `CAN_REACH_CONFIRMED`, given the two disclosed
  operationalizations (重重/疊疊 cutoff; 絕無一毫 scope). Without them it would be `CANDIDATE_ONLY`.
- **CONFLICTS:** modern/Korean reception conflates 從强 with 전왕격; that conflation is recorded and rejected.

#### 從氣格 / 從勢格 — **NEWLY DISCLOSED IN V1.3 (they were silently omitted)**

任鐵樵's 從象 passage enumerates **four** members, not two: 從旺, 從強, 從氣, 從勢. V1.1 and V1.2 cited the
passage for the first two and silently dropped the others. That is a selection Deokbuni is entitled to make,
but not to make invisibly.

- **從氣者** — 「不論財官、印綬、食傷之類，如氣勢在木火，要行木火運…」 (NAMED_COMMENTARY, 任鐵樵).
- **從勢者** — 「日主無根，四柱財官食傷並旺…視其財官食傷之中，何其獨旺…」 (NAMED_COMMENTARY, 任鐵樵).
  **Correction to an earlier internal reading:** the fragment 「不分強弱」 attributed to this passage in
  research notes could **not** be verified and is not used. The retrieved text says 視其…何其獨旺 — 從勢
  identifies a *uniquely prosperous* force; it does **not** cover the "no force dominant" case.
- **V1 STATUS: `DEFERRED_FROM_V1`.** Not because they are unsourced — they are as well-sourced as 從旺/從强 —
  but because Deokbuni has not selected entry contracts for them. Recorded so that a future reader does not
  mistake their absence for a claim that the enumeration is two-fold.
#### 從財格 — **REVISED IN V1.3 (E-D3: "dominant force" removed)**

> **Deokbuni V1 adopts 滴天髓's 假從 gloss as the governing frame for the weak-DM follow family:**
> 「日主弱矣，財官強矣，不能不從，中有所助者，便假」 (ORIGINAL_TEXT gloss, verified). This is the one place
> 眞從/假從 genuinely applies — unlike 從旺/從强/專旺, where V1.1 over-extended it.

- **SOURCE LINEAGE:** ORIGINAL_TEXT for the 眞/假 frame (滴天髓 假從 verse and gloss); the per-pattern entry
  conditions are `SELECTED_LINEAGE` from the 從象 family. `SOURCE_NOT_VERIFIABLE` for any claim that a single
  named text enumerates 從財's conditions as a closed list — none was located, and none is asserted.
- **MINIMUM POSITIVE CONDITIONS:**
  1. `ROOT_STATE = NO_ROOT` (§7.3.2) — the DM has no same-element root anywhere. Existence test, exhaustive.
  2. **`OPPOSITION_CHANNELS.WEALTH_CHANNEL` is occupied, and it is the *uniquely* occupied channel** among
     식상/재성/관살. **This replaces "dominant force"** (deleted per E-D3 as unsourced magnitude language).
     The uniqueness test is 任鐵樵's own 從勢 wording 「視其財官食傷之中，何其獨旺」 — *which one is uniquely
     prosperous* — applied here as a structural uniqueness test, not a magnitude comparison.
     Where two or more channels are occupied, this is not 從財; see the 財+官殺 conflict below.
- **DISQUALIFYING CONDITIONS:** any 比劫 or 印星 occurrence (presence reading, consistent with the selected
  lineage's 絕無一毫 standard for the sibling patterns). A 比劫/印 occurrence reintroduces the alternative the
  pattern's own premise (不能不從 — *cannot but follow*) denies.
- **THE 財+官殺 BOTH-PRESENT CASE:** genuinely disputed — one reading takes it as a continuous 財生官 flow that
  still qualifies; another treats two simultaneously-occupied channels as structurally competing.
  **Unresolved by design → `DOCTRINE_CONFLICT`.** Note that under the uniqueness test above this
  configuration fails the positive condition anyway; the conflict is recorded because the two readings
  disagree about whether it *should*.
- **假從 POLICY:** a residual 比劫/印 occurrence that is present but contested → `CANDIDATE_UNCONFIRMED`
  (假從 territory), never silent qualification. This is the gloss's own 中有所助者，便假.
- **RUNTIME_AUTHORITY:** CONDITIONAL. **REACHABILITY:** `CAN_REACH_CONFIRMED`.

#### 從官殺格 (從殺格) — **REVISED IN V1.3 (E-D3: "dominant force" removed)**

- **SOURCE LINEAGE:** as 從財 — the 眞/假 frame is ORIGINAL_TEXT; the entry conditions are `SELECTED_LINEAGE`.
- **MINIMUM POSITIVE CONDITIONS:**
  1. `ROOT_STATE = NO_ROOT` (§7.3.2), exhaustive.
  2. **`CONTROL_CHANNEL` is the uniquely occupied opposition channel** (何其獨旺 applied as above).
     "Dominant force is 官殺" is deleted as unsourced magnitude language.
- **DISQUALIFYING CONDITIONS:** any 比劫 or 印星 occurrence (as 從財); **additionally any 食傷 occurrence** —
  食傷剋官殺, so an occupied OUTPUT_CHANNEL means the chart is not helplessly submitting, contradicting the
  pattern's own premise. **V1.1 evaluated this "for functional integrity, not mere presence"; V1.3 uses the
  presence reading**, for consistency with the selected lineage and because the functional-integrity grading
  it relied on is itself unbuilt and arguably unsourceable (§8.9, §8.10).
- **假從 POLICY / AMBIGUOUS CASE POLICY:** as 從財.
- **SCHOOL CONFLICT:** none located beyond the family-level disputes already named.
- **RUNTIME_AUTHORITY:** CONDITIONAL. **REACHABILITY:** `CAN_REACH_CONFIRMED`.

#### 從兒格 (Follow-Child/Output) — **REWRITTEN IN V1.2 (audit finding D1: the V1.1 entry was materially wrong)**

> **What was wrong.** V1.1 required "DM exhaustively rootless" and disqualified on rooted 比劫. Both are
> refuted by the pattern's own governing verse. V1.1 also graded 從兒 as `SOURCE_CLASS_C`, "the
> thinnest-grounded of the four" — the opposite of the truth: 從兒 is the **only** pattern in this cluster
> with an explicit ORIGINAL_TEXT verse *and* a named commentary gloss of its mechanism. And V1.1 **omitted
> the one condition 任鐵樵 states as 必要** (月令 must carry 食傷). Net: the entry was strict where the
> sources are permissive, permissive where they are strict, and mis-ranked its own evidence.

- **SOURCE LINEAGE:** ORIGINAL_TEXT — 滴天髓, 順局 chapter (六親論), whose verse reads
  「一出門來只見兒，吾兒成氣構門閭；從兒不管身強弱，只要吾兒又得兒。」 Mechanism gloss: NAMED_COMMENTARY,
  任鐵樵 滴天髓闡微. The 原注 to 順局 additionally distinguishes this pattern **in kind** from the 從象 family
  (「此與成象、從象、傷官不同」), framing it as 流通/生育之意 — continuous forward generation — rather than
  submission. *(Verse and the 不管身強弱 line independently re-verified during this remediation, not carried
  on a single research pass's label. The 原注's traditional attribution to 劉基 is contested modern
  scholarship; its presence in the received text is not.)*

- **GOVERNING AXIS — NOT strength.** 「從兒不管身強弱」 states that Day-Master strength/weakness is **not the
  governing question** for this pattern. The gate therefore **MUST NOT** read any Day-Master strength
  verdict, and **MUST NOT** contain a rootlessness precondition. 從兒 is a **FLOW** test
  (DM → 食傷 → 財), not a submission test, and shares **no** preconditions with 從財/從官殺.

- **MINIMUM POSITIVE CONDITIONS:**
  1. **月令 carries 食傷** — month-branch ten-god relation to the DM ∈ {食神, 傷官}.
     NAMED_COMMENTARY, 任鐵樵: 「構門閭者，月建逢食傷也，月為門戶，必要食傷在提綱也」 (必要 = strictly required).
     **SCOPE UNSETTLED (DEFERRED, owner decision):** the sources do not say whether 본기-only or any 지장간
     satisfies this. Default = 본기, matching the repo's existing month-god convention; 食傷 present only in
     중기/여기 → `CANDIDATE_UNCONFIRMED`, never silently resolved either way.
  2. **∃ at least one 財星** in the natal chart — visible stem OR any 지장간.
     ORIGINAL_TEXT 「只要吾兒又得兒」, glossed by 任鐵樵 「吾兒又得兒者，必要局中有財，以成生育之意也」.
     Pure existence predicate: no count, no threshold. Absent → `NOT_QUALIFIED` (dead-end 食傷).
     **NOTE:** 任鐵樵's separate 「又要運行財地」 is a **luck-quality** statement, not a second entry
     condition, and must never be folded into the gate.
  3. **食傷 multiplicity** (食傷多也 / 滿局) — **REQUIRED BY THE SOURCES BUT NEVER QUANTIFIED.** Per the
     no-invented-thresholds discipline (§21) this is **DEFERRED, not deleted**: it caps the pattern at
     `CANDIDATE_UNCONFIRMED`. It must not be replaced by a count, a ratio, or a structural substitute.

- **DISQUALIFYING CONDITIONS:** a **functionally-intact rooted 印星** → `NOT_QUALIFIED`.
  Mechanism is 印剋食傷 — it severs the 生育 flow — **not** the 從財-style "the DM regains an alternative"
  rationale. 任鐵樵: 「如見印綬，是我之父，父能生我，我自有為，焉能容子？子必遭殃，無生育之意，其禍立至，是以
  從兒格最忌印運，次忌官運。」
  **DISCLOSED SCOPE NUANCE:** 任鐵樵's concluding formulation is 忌印**運** (luck periods). The
  natal-presence reading rests on the preceding 「如見印綬…其禍立至」 clause, which is strong but is a
  severity statement rather than an explicit entry-gate clause. This is recorded, not smoothed over.

- **CAPS AT `CANDIDATE_UNCONFIRMED` (not disqualifying):**
  - a functionally-intact rooted 官殺 — a **Deokbuni operationalization** of 任鐵樵's ordinal 最忌/次忌
    ranking (印 worst, 官 next). Disclosed as DEOKBUNI_POLICY: placing a cut on an ordinal rank is itself a
    policy choice, not a sourced rule. The modern-Chinese lineage instead reads 官殺旺透干有根 → 破格, so
    this override is recorded as `DOCTRINE_CONFLICT`, **not** as "none material".
  - a 財 that exists but is 沖/合-damaged.

- **REMOVED IN V1.2 (each with its reason):**
  - **DM rootlessness as a precondition** — refuted by 從兒不管身強弱.
  - **比劫 as a disqualifier, in all directions** — 任鐵樵: 「不論身強弱者，四柱雖有比劫仍去生助食傷也」:
    比劫 may remain precisely because they feed 食傷 rather than opposing the flow. 比劫 presence/rootedness
    contributes **zero** evidence to this gate in either direction. *(Note this was the same defect stated
    twice: a branch rooting a 比/劫 necessarily roots the DM's own element, per §5.1's root-existence
    definition — so the 比劫 disqualifier and the rootlessness precondition were one error, duplicated.)*
  - **透干 as a state-changing factor** — unsourced.
  - **The "unusually strict zero-borderline-flags" bar** — an unsourced thumb on the scale; it also
    depended on §4.2's `BOUNDARY_SENSITIVE` window, which the source matrix itself declares undetermined.

- **SCHOOL CONFLICT (named, unresolved):** strict modern-Chinese systematization holds that **bare presence**
  of 印 breaks the pattern (「命局中如見到印星就大破格」); a common Korean reading holds that 官殺/印星 present
  but **rootless** still permits 從兒. Neither is a classical citation. Routed to `DOCTRINE_CONFLICT`.

- **SOFTWARE STATUS:** four-state.
- **REACHABILITY (mandatory disclosure, §10.6):** with condition 3 (食傷 multiplicity) permanently
  unquantifiable and every condition routing through §8's still-CONDITIONAL functional-integrity grading,
  the **reachable** state set for 從兒 is `{NOT_QUALIFIED, CANDIDATE_UNCONFIRMED, DOCTRINE_CONFLICT}`.
  **`CONFIRMED` is currently unreachable for every chart.** This is stated as an outcome, not left for a
  reader to discover. It is the honest consequence of refusing to invent the missing quantifier.

#### 專旺格 (曲直/炎上/稼穡/從革/潤下) — **REWRITTEN IN V1.3 (audit finding D2)**

> **Naming, stated honestly first.** The label **專旺格 has no located classical attestation.** It is
> `MODERN_SYSTEMATIZATION`. Its classical ancestor is **獨象**, which is verse-level:
> 滴天髓 形象 「獨象喜行化地，而化神要昌」 (ORIGINAL_TEXT). The five sub-patterns are individually named and
> defined by 任鐵樵, and 三命通會 does group the five as one section — so the *grouping* is attested even
> though the *label* 專旺格 is not. Deokbuni V1 keeps the label as a convenience and marks it as its own.

> **專旺 ≠ 從旺.** Same commentator, different chapters, different criteria: 獨象 is defined in
> 通神論·形象第十一 by a **completed branch configuration** of the DM's own element plus non-admixture of its
> controller; 從旺 is defined in 六親論·從象 by 比劫 composition plus absence of 官殺 plus presence of 印 —
> with **no branch-configuration requirement at all**. They overlap in extension; they are not one structure.
> A further corroboration that they differ: 獨象's classical luck prescription runs *toward* 食傷
> (化神), whereas 從强 explicitly dislikes 食傷運.

- **SOURCE (verified verbatim):** NAMED_COMMENTARY — 任鐵樵《滴天髓闡微》形象第十一:
  「木日，或方或局全，不雜金為曲直」/「火日，或方或局全，不雜水為炎上」/「土日，四庫皆全，不雜木為稼穡」/
  「金日，或方或局全，不雜火為從革」/「水日，或方或局全，不雜土為潤下」.
  *(Layer correction applied: 「權在一人，曲直炎上之類是也」 is 任氏 commentary, not 原註. The 劉基-authorship
  caveat V1.2 attached to it was scaffolding around a misattribution and is removed. The verse
  「獨象喜行化地，而化神要昌」 remains correctly ORIGINAL_TEXT.)*

- **REQUIRED PREMISES, per sub-pattern — V1.1's blanket clause was WRONG for 稼穡:**

  | Sub-pattern | DM element | Required branch configuration (source wording) |
  |---|---|---|
  | 曲直 | 木 | `或方或局全` — the directional set **or** the trine, **complete** |
  | 炎上 | 火 | `或方或局全` |
  | **稼穡** | 土 | **`四庫皆全`** — all four of 辰戌丑未. **This is neither a 三合 nor a 方合.** |
  | 從革 | 金 | `或方或局全` |
  | 潤下 | 水 | `或方或局全` |

  V1.1 required "a completed 삼합 or 방합 across three or more branch positions" **for all five**, which is
  structurally unsatisfiable for 稼穡 — no 三合 or 方合 consists of 辰戌丑未. V1.1 did name 稼穡=辰戌丑未
  in its season clause, so the defect was an **internal contradiction** between its positive-conditions
  clause and its season clause, not unawareness. Corrected here.

- **DISQUALIFIERS — scoped narrowly, per the source:** **only the controlling (剋我) element** breaks the
  pattern — 不雜金 for 曲直, 不雜水 for 炎上, 不雜木 for 稼穡, 不雜火 for 從革, 不雜土 for 潤下. Every located
  source names only the controller. **財 and 食傷 are NOT breakers** and V1.1's extension of the disqualifier
  beyond the controller is withdrawn.

- **PRESENCE vs FUNCTIONAL PRESENCE — a genuine inter-text conflict, now resolved by selection (§2.5 rule C):**

  | Position | Sources | Wording |
  |---|---|---|
  | **Presence** breaks the pattern | 淵海子平 曲直格; 任鐵樵 從象/形象 | 「見庚辛即官殺，非此格也」 · 「絕無一毫財星官殺之氣」 · 「不雜金」 |
  | **Degree/root-depth** decides | 子平真詮 論雜格 (ORIGINAL_TEXT) | 「大約要干頭無官無煞，方成外格。如有官煞，則自有官煞為用，無勞外格矣。若透財尚可取格，然財根深，或財透兩位，則亦以財為重，不取外格也」 |

  **Deokbuni V1 adopts the PRESENCE reading for the controlling element** (任鐵樵/淵海子平), because 任鐵樵 is
  the selected lineage for this whole cluster and his wording is unambiguous. **Deokbuni V1 additionally
  adopts 子平真詮's 財 rule as a separate, narrower clause**, since it concerns 財 (which the controller rule
  does not cover) and is ORIGINAL_TEXT: a transparent 財 does not break the pattern, but 財根深 or 財透兩位
  does. This is a selection, not a synthesis — both poles are recorded and neither is averaged.
  `DOCTRINE_CONFLICT` is emitted when the two readings would diverge on the same chart.

- **SEASON_POLICY — a live, named conflict, NOT silently resolved:**
  - **Requires it:** 子平真詮 論雜格 「有取五行一方秀氣者，取甲乙全亥卯未、寅卯辰，**又生春月**之類」.
  - **Does not state it:** 任鐵樵 形象第十一 (only 或方或局全 + 不雜X); 淵海子平 曲直格.
  - **Deokbuni V1:** season is **required for 稼穡 only** — and there it is *entailed* rather than imposed,
    since 辰戌丑未 all being present forces the month branch into a 季月. For the other four, season is
    recorded as evidence and its absence caps at `CANDIDATE_UNCONFIRMED`; it does not disqualify.
    **Correction to a tempting shortcut:** "the month branch is a member of the set" is NOT the same test as
    生春月, and a 亥卯未 chart with 월지=亥 separates them. The season test reads
    `monthCommand.season`, never set membership.
  - **Note on 三合 equality:** 「或方或局」 implies the two are interchangeable for 任鐵樵, but 三命通會 states
    「甲乙日得亥卯未局，柱中須有亥字帶印為入格，若無亥有卯，止是木之本氣」 — requiring 亥 specifically and not
    offering 寅卯辰 as an equal alternative. Recorded as `SCHOOL_DEPENDENT`; Deokbuni V1 follows 任鐵樵's
    equality and emits the divergence as evidence.

- **AMBIGUOUS CASE POLICY:** a partial (2-of-3) set is a clean `NOT_QUALIFIED` for 專旺 — not an ambiguous
  case. The chart may still read STRONG on the ordinary axis via §12 independently. A `BOUNDARY_SENSITIVE`
  month is genuinely ambiguous → `CANDIDATE_UNCONFIRMED`.
- **TRUE_FALSE_FOLLOWING:** **NOT APPLICABLE** — 眞從/假從's own gloss scopes it to the weak-DM family
  (see 從旺 above). The analogous 專旺 spectrum is "complete set" vs "partial/contested set", which is the
  formation question, not a 眞/假 question.
- **PRECONDITION INHERITED FROM THE SELECTED SOURCE (new in V1.3):** 子平真詮 論雜格 opens
  「雜格者，月令無用，取外格而用之，其格甚多，故謂之雜」 — in that method the 外格 family is consulted **only
  when the month branch yields no ordinary 用神**. Deokbuni V1 does **not** adopt this ordering, because
  用神 selection (격국) is out of V1 scope and adopting it would make the gate depend on a deferred module.
  Recorded as a named divergence from 子平真詮, per §2.5 rule C, rather than left unstated.
- **RUNTIME_AUTHORITY:** CONDITIONAL. **REACHABILITY:** `CAN_REACH_CONFIRMED` — every premise is an
  existence/configuration test over deterministic facts.

### 10.1.1 從旺 / 從强 / 專旺 — SOURCE-BY-SOURCE RECONCILIATION (closes D2)

Cell values: a sourced position, `SILENT` (source does not address it), or `NOT RETRIEVED` (could not be
accessed — recorded honestly rather than inferred).

| Predicate | 滴天髓 verse | 任鐵樵 闡微 | 子平真詮 | 淵海子平 | 三命通會 | 徐樂吾 |
|---|---|---|---|---|---|---|
| 從旺 defined | SILENT | **從象: 四柱皆比劫／無官殺之制／有印綬之生** | SILENT (no such vocabulary) | NOT RETRIEVED | NOT RETRIEVED | NOT RETRIEVED |
| 從强 defined | SILENT | **從象: 印綬重重／比劫疊疊／日主又當令／絕無一毫財星官殺之氣** | SILENT | NOT RETRIEVED | NOT RETRIEVED | NOT RETRIEVED |
| 從旺 vs 從强 distinct | SILENT | **YES — adjacent sentences, three explicit axes** | SILENT | NOT RETRIEVED | NOT RETRIEVED | NOT RETRIEVED |
| 專旺 as a label | SILENT (has 獨象) | SILENT (has 獨象/形象) | SILENT (has 雜格) | SILENT | groups the five as one section | NOT RETRIEVED |
| 專旺 branch configuration | 獨象 (no explicit set rule) | **或方或局全; 稼穡=四庫皆全** | 全亥卯未、寅卯辰 | 寅卯辰 or 亥卯未 木局 | 亥卯未 **must include 亥** | NOT RETRIEVED |
| 專旺 breaker | SILENT | **不雜<controller> only** | 干頭無官無煞; 財根深 breaks | 見庚辛即官殺，非此格也 | NOT RETRIEVED | NOT RETRIEVED |
| Season required | SILENT | **SILENT** | **又生春月 — required** | SILENT | 戊己生逢季月 (稼穡) | NOT RETRIEVED |
| Presence vs degree | SILENT | **presence** (絕無一毫／不雜) | **degree** (財根深／財透兩位) | **presence** | NOT RETRIEVED | NOT RETRIEVED |
| Residual/餘氣 root tolerated | SILENT | **NO — 絕無一毫…之氣** | partially (透財尚可取格) | SILENT | NOT RETRIEVED | NOT RETRIEVED |
| 眞從/假從 scope | **真從之象有幾人，假從亦可發其身** — weak-DM family | gloss: 日主弱矣，財官強矣 | SILENT | SILENT | NOT RETRIEVED | NOT RETRIEVED |
| 外格 precondition | SILENT | SILENT | **月令無用，取外格而用之** | SILENT | NOT RETRIEVED | NOT RETRIEVED |

**Honest coverage statement.** 淵海子平's and 三命通會's own 從旺/從强 material was **not retrieved** in this
pass; the cells are marked `NOT RETRIEVED`, not inferred, not filled from secondary summaries. 徐樂吾 was not
verified for any 從-pattern predicate — V1.1's attribution of 從旺/從强 partly to a "徐樂吾-lineage" is
therefore **withdrawn** (§2.5 rule E). 徐樂吾 is retained in this document **only** for the §7.3 two-axis
statement, which was independently verified.

**Enumeration finding.** 任鐵樵's 從象 passage enumerates **four** members — 從旺 / 從強 / 從氣 / 從勢. Deokbuni
V1 adopts the first two and defers the latter two (see 從氣格/從勢格 above). The enumeration is stable within
this source; what is *not* stable is the 專旺 label, which no source supplies.

**Deokbuni V1 selection statement.** For this entire cluster, *Deokbuni V1 adopts 任鐵樵's readings as the
selected lineage*, supplemented by 子平真詮's 財 clause where 任鐵樵 is silent. This is a selection under §2.5
rule C. It is not a claim that classical Myungri universally defines these patterns this way.
### 10.2 Categories explicitly considered and excluded (unchanged from V1)

- **化氣格** — NOT included; thin/disputed completion-criteria grounding, SOURCE_CLASS_E. Recommend a
  dedicated follow-up research pass.
- **兩神成象格** — NOT included; thin classical grounding, inconsistent entry criteria across sources.
  SOURCE_CLASS_E.
- **從印格** (as a separately-named pattern) — NOT included; collapses into 從强 in mainstream treatment (印
  generates the DM rather than opposing it, so it doesn't create the "must give up resistance" premise).

### 10.3 Gate output — four states, deliberately asymmetric

`NOT_QUALIFIED` / `SPECIAL_PATTERN_CANDIDATE_UNCONFIRMED` / `SPECIAL_PATTERN_CONFIRMED` /
`DOCTRINE_CONFLICT` (new in V1.1 — see §10.0/§10.1's per-pattern `AMBIGUOUS CASE POLICY` entries; this state
did not exist in V1's three-state gate and is required by the brief's own §3 instruction).

`CONFIRMED` requires every relevant sub-condition, evaluated through §10.0's corrected functional-integrity
mechanism, to independently hold with zero unresolved disqualifiers. Any single genuine ambiguity caps the
result at `CANDIDATE_UNCONFIRMED`. A genuine cross-school disagreement on how to read the *same* finalized
evidence (not merely an internal-to-the-chart ambiguity) routes to `DOCTRINE_CONFLICT` instead, per §13. Both
`NOT_QUALIFIED` and `CANDIDATE_UNCONFIRMED` route to the ordinary structural-strength model unmodified (§11).
`DOCTRINE_CONFLICT` at the gate stage is surfaced explicitly, never silently defaulted to either the ordinary
model or a special-pattern verdict.

### 10.6 REACHABILITY DISCLOSURE — mandatory (V1.2), **satisfied in V1.3**

A four-state output whose `CONFIRMED` state no real chart can ever reach is a **three-state output wearing a
four-state label**. V1.1 shipped exactly that for 從兒 without noticing. Every pattern entry in §10.1
therefore carries an explicit **REACHABILITY** field, and any future edit to a pattern's conditions must
re-derive it.

**What changed in V1.3.** V1.2 reported that *no* pattern could reach `CONFIRMED`. That was true under V1.2's
over-strict reading of the no-scoring rule, which treated every quantitative concept — including the sources'
own 重重/疊疊/皆/全 — as forbidden. §3.5 corrects that: a source-stated but unquantified concept may be
operationalized **in the open**, as `DEOKBUNI_OPERATIONALIZATION`, with the chosen reading printed in this
document. With that correction, five of six patterns become reachable.

| Pattern | V1 status | Reachable states | What decides it |
|---|---|---|---|
| 從旺格 | `CAN_REACH_CONFIRMED` | all four | Every premise is an existence/absence test (四柱皆比劫 · 無官殺 · 有印綬). Nothing unquantified remains |
| 從强格 | `CAN_REACH_CONFIRMED` | all four | Reachable **only because** 重重/疊疊 is operationalized as "two or more" (§3.5) and 絕無一毫 is scoped to visible + 본기 (§10.1). Both disclosures are load-bearing; remove either and this reverts to `CANDIDATE_ONLY_IN_V1` |
| 從財格 | `CAN_REACH_CONFIRMED` | all four | "dominant force" replaced by the structural uniqueness test (何其獨旺) |
| 從官殺格 | `CAN_REACH_CONFIRMED` | all four | as 從財, plus the 食傷 presence disqualifier |
| 專旺격 | `CAN_REACH_CONFIRMED` | all four | Configuration tests (或方或局全 / 四庫皆全) are deterministic |
| 從兒격 | **`CANDIDATE_ONLY_IN_V1`** | `NOT_QUALIFIED` · `CANDIDATE_UNCONFIRMED` · `DOCTRINE_CONFLICT` | 食傷多也/滿局 is required by the source and **not** operationalized here. Unlike 從强's 重重, no bounded reading suggested itself that did not amount to inventing the pattern's central criterion, so per §3.5 it stays DEFERRED and caps the gate |
| 從氣격 / 從勢격 | **`DEFERRED_FROM_V1`** | — | Sourced, but no Deokbuni entry contract selected |

**The `CONFIRMED` enum is therefore no longer fake** — it is reachable for five patterns. 從兒's cap is a
substantive doctrinal position (its central quantifier is unresolved), not an artefact of over-strictness,
and it is recorded as `CANDIDATE_ONLY_IN_V1` rather than left as a hidden dead end.

**Residual dependency, disclosed.** Where a pattern's disqualifier evaluation would route through §8's
functional-integrity grading, V1.3 uses the **presence** reading instead (§10.1), precisely so the gate does
not depend on the unbuilt and arguably unsourceable severity grading. That is a deliberate narrowing: it
makes the gate stricter and buildable, rather than permissive and blocked.

### 10.7 CROSS-PATTERN COMPOSITION — new in V1.3

Six evaluators run independently over the same facts and each returns one of four states. §10.3 emits one
gate output. The composition function was missing entirely; it is defined here as a **total** mapping.

**Step 1 — structural exclusivity (proved, not asserted).** The patterns partition by the `ROOT_STATE` and
channel premises they require, so most pairs cannot co-occur:

- 從旺 / 從强 / 專旺 all require the DM's own element to be present and unopposed. 從財 / 從官殺 / 從兒 all
  require `ROOT_STATE = NO_ROOT`. **No chart satisfies both groups** — a chart cannot simultaneously have
  四柱皆比劫 and no same-element root. The strong-DM and weak-DM groups are therefore mutually exclusive by
  construction.
- Within the weak-DM group, 從財 / 從官殺 / 從兒 each require their own channel to be the **uniquely**
  occupied one (何其獨旺). Uniqueness is exclusive by definition, so at most one can hold.
- Within the strong-DM group, exclusivity is **not** guaranteed: 從旺 and 從强 differ on 印's weight and on
  日主當令, and a chart with 印綬重重 + 比劫疊疊 + 當令 satisfies both 從旺's premises and 從强's. 專旺 may
  also co-occur with either, since it adds a branch-configuration requirement without contradicting them.

**Step 2 — resolution of the genuinely overlapping cases:**

| Situation | Output | Authority |
|---|---|---|
| Exactly one pattern `CONFIRMED`, others `NOT_QUALIFIED` | that pattern | — |
| 從强 and 從旺 both `CONFIRMED` | **從强** | Source-backed: 從强's premises are strictly stronger (印綬重重 ⊃ 有印綬之生; adds 日主當令). The more specific satisfied contract wins — a `SUBTYPE_RELATION`, not a ranking |
| 專旺 and (從旺 or 從强) both `CONFIRMED` | **`AMBIGUOUS_MULTI_CANDIDATE`**, both named | **No source ranks them**, and they are defined in different chapters as different structures. Deokbuni does **not** invent a precedence. Both are surfaced |
| Any pattern `DOCTRINE_CONFLICT` | **`DOCTRINE_CONFLICT`**, naming the poles | §13; conflict dominates a confirmation elsewhere because it means the evidence itself is contested |
| One `CONFIRMED` + others `CANDIDATE_UNCONFIRMED` | the `CONFIRMED` one, with the near-misses attached as evidence | Near-misses are never silently dropped (§11.1 step 6) |
| All `CANDIDATE_UNCONFIRMED` | `SPECIAL_PATTERN_UNCERTAIN` | §13 |
| All `NOT_QUALIFIED` | `NOT_QUALIFIED` → ordinary model (§12) | — |

**Prohibited resolutions, stated so they cannot be reintroduced:** majority vote across evaluators;
first-match-wins by document order; an invented precedence rank; silently preferring the pattern with more
satisfied conditions. If two patterns are genuinely co-confirmed and no source ranks them,
`AMBIGUOUS_MULTI_CANDIDATE` is the honest output and it is authoritative.

---

## 11. Structural reasoning sequence — gate order fixed (audit's gate-order finding, brief §4)

**V1.1 correction:** V1's own Step G description said the special-structure gate "has verdict priority" while
ALSO saying it is "evaluated once, after B–F are final" — this is not actually contradictory once stated
precisely, but V1's prose left the ordering ambiguous enough that the audit reasonably read it as internally
inconsistent. This section restates the order with the ambiguity removed, distinguishing **fact preparation**
from **verdict priority** explicitly, as the brief requires.

### 11.1 The corrected order

```
1. DETERMINISTIC CHART FACTS
   (frozen layer: four pillars, hidden stems, ten gods, raw relation detection)
   — always available first; nothing below can run without these.

2. RELATION / FUNCTIONALITY INFERENCE NEEDED BY BOTH MODELS
   (Steps B, C, D, E, F of §11.2 below — root structure, support structure,
   opposition structure, functional-force gating, and §8's five-question
   relation layering, ALL finalized)
   — this is SHARED machinery. Both the ordinary model (Step H) and the
   special-structure gate (Step G, §10) consume the SAME finalized B–F
   output. Neither model re-derives its own separate copy of these facts.
   This is what makes §10.0's corrected disqualifier mechanism possible:
   the gate does not need its own fact-gathering pass because step 2
   already produced everything it needs.

3. SPECIAL-STRUCTURE EVALUATION (§10, Step G)
   — runs ONCE B–F are final (fact preparation is complete), and produces
   one of the four §10.3 states.

4. IF CONFIRMED: route to special-structure strength semantics (a distinct
   output category, out of this document's scope to design further — §12.6).

5. IF NOT_QUALIFIED: proceed to the ordinary structural-strength model
   (Step H, §12) using the SAME finalized B–F facts.

6. IF CANDIDATE_UNCONFIRMED or DOCTRINE_CONFLICT: the uncertainty is
   PRESERVED EXPLICITLY (§13's SPECIAL_PATTERN_UNCERTAIN or DOCTRINE_CONFLICT
   states) — the system does NOT silently fall back to ordinary-model
   certainty as though the special-structure question had never been asked.
   An ordinary-model band MAY still be computed and reported alongside the
   uncertainty state (since B–F facts already exist), but it is reported
   WITH the special-pattern uncertainty flagged, not as a clean, confident
   final verdict.
```

**Resolution of the "verdict priority vs. fact order" tension:** the special-structure gate has **verdict
priority** in the sense that its output (§10.3) determines which verdict *category* is used (special-pattern
vs. seven-band) and, per step 6, its uncertainty states can prevent the seven-band label from being reported
as confident even when B–F facts would otherwise support one. It does **not** have priority in the sense of
executing before the facts it needs exist — it cannot, since §10.0's corrected mechanism explicitly depends
on those facts. These are the two different senses of "priority" the brief's §4 distinguishes
(FACT PREPARATION vs. VERDICT PRIORITY), and V1.1 states both explicitly rather than leaving them to be
inferred.

### 11.2 The A–I sequence (unchanged from V1 in its step definitions; G's description corrected per above)

| Step | Question | TEXT_LAYER | Constrained by | Revised by |
|---|---|---|---|---|
| **A** | Seasonal prior from 월령 (§4) | SOURCE_CLASS_A | Frozen facts only | — |
| **B** | DM's functional root structure (§5) | SOURCE_CLASS_A/B | A | F |
| **C** | Provisional support structure (§6) | SOURCE_CLASS_B/C | A, B | E, F |
| **D** | Provisional opposition structure (§7) | SOURCE_CLASS_A/B | A, B | E, F |
| **E** | Functional-force gate, symmetric (§7.3) | SOURCE_CLASS_B | C, D | F |
| **F** | Relation/transformation layer, five-question (§8) | SOURCE_CLASS_A/B/C (per mechanism) | B, C, D, E | Feeds back into B/C/D as final |
| **G** | Special-structure gate (§10) — consumes finalized B–F, does not re-derive | SOURCE_CLASS_B/C (per pattern) | B, F (finalized) | — (evaluated once) |
| **H** | Ordinary structural balance, IF G ≠ CONFIRMED (§12) | SOURCE_CLASS_A/D | A–F (and G's routing) | — |
| **I** | Seven-band label + uncertainty state (§12–§13) | SOURCE_CLASS_D | H (or G if CONFIRMED) | — |

**Not reorderable, not parallelizable** — unchanged justification from V1 (§11.0's original argument, not an
audit finding, retained): converting every factor into a context-free commensurable unit before comparison
is exactly the mechanism that produced V1's own predecessor's rejected 18-cell table, and remains rejected
here for the same reason. Numeric counts remain legitimate as diagnostics inside a step; they may never
become cross-step or final authority.

---

## 12. Ordinary strength classification — **REWRITTEN IN V1.3 (audit finding D3)**

### 12.0 What the seven bands are, and what they are not

**The seven Korean labels are a Deokbuni product rendering (`DEOKBUNI_OPERATIONALIZATION`), not a classical
seven-level taxonomy, and V1.3 stops trying to prove otherwise.** 신강/신약 and 中和 are genuine classical
vocabulary; a fixed seven-way subdivision is not. This is now stated as a settled position rather than
defended.

What the rendering must satisfy is therefore **not** historical attestation. It is four engineering
properties, all of which §12.1–§12.3 must meet:

1. **Explicit** — every label's entry condition is written down.
2. **Deterministic / replayable** — same facts ⇒ same label, for any implementer.
3. **Non-hidden** — no weight, percentage, or cutoff exists that is not printed in this document.
4. **Structurally meaningful** — each label corresponds to a distinct cell of the §7.3 state model, not to a
   position on an invented scale.

V1.2's escape clause ("retained only because each boundary can be defined without hidden scoring") is
**discharged, not exercised**: §7.3's state model now supplies the missing definitions, so the bands survive.

### 12.1 Stage 1 — the WEAK / BALANCED / STRONG family, as a total decision table

Stage 1 consumes exactly three dimensions from §7.3: `ROOT_STATE`, `SEASONAL_STATE`, `FACTION_STATE`.
That is 3 × 2 × 3 = **18 cells**, and **every one is assigned below**. There is no formula: this is a lookup
table, and each cell is individually justified. Nothing is summed, weighted, or voted.

Read `R` = ROOT_STATE, `S` = SEASONAL_STATE, `F` = FACTION_STATE.

| # | R | S | F | Stage 1 | Basis |
|---|---|---|---|---|---|
| 1 | `NO_ROOT` | `SEASON_OPPOSING` | `SUPPORT_SCARCE` | **WEAK** | All three dimensions agree. 任鐵樵's root gate fails outright (無根 ⇒ 不能受), 徐樂吾's both axes read 衰/弱 |
| 2 | `NO_ROOT` | `SEASON_OPPOSING` | `FACTION_EVEN` | **WEAK** | Root gate fails and season opposes; the faction axis abstains rather than contradicting |
| 3 | `NO_ROOT` | `SEASON_OPPOSING` | `SUPPORT_NUMEROUS` | **BALANCED** *(uncertainty-flagged)* | Genuine conflict: rootless (任鐵樵 ⇒ cannot bear) but 黨眾 (徐樂吾 ⇒ 強). Unrooted support is 浮 — §6.2 says not zero, and no source ranks these two against each other ⇒ `STRENGTH_BORDERLINE` |
| 4 | `NO_ROOT` | `SEASON_SUPPORTIVE` | `SUPPORT_SCARCE` | **WEAK** | 得時 alone cannot establish 旺 — 子平真詮 得時不旺 applied directly; root gate fails and faction is scarce |
| 5 | `NO_ROOT` | `SEASON_SUPPORTIVE` | `FACTION_EVEN` | **BALANCED** *(uncertainty-flagged)* | Season supports, root gate fails, faction abstains. No source resolves this ⇒ `STRENGTH_BORDERLINE` |
| 6 | `NO_ROOT` | `SEASON_SUPPORTIVE` | `SUPPORT_NUMEROUS` | **BALANCED** | Two axes favourable, but 無根 blocks the STRONG family: a rootless DM 不能受 regardless of 勢. Sits at the top of BALANCED, never STRONG |
| 7 | `ROOT_PRESENT` | `SEASON_OPPOSING` | `SUPPORT_SCARCE` | **WEAK** | Two dimensions oppose; the root gate passes but 任鐵樵's clause establishes only *能受*, not 旺 |
| 8 | `ROOT_PRESENT` | `SEASON_OPPOSING` | `FACTION_EVEN` | **WEAK** | Season opposes, faction abstains. 失時 with no compensating 勢 |
| 9 | `ROOT_PRESENT` | `SEASON_OPPOSING` | `SUPPORT_NUMEROUS` | **BALANCED** | 子平真詮 失時不弱 applied directly: 失令 does not settle 弱 when root and faction both hold |
| 10 | `ROOT_PRESENT` | `SEASON_SUPPORTIVE` | `SUPPORT_SCARCE` | **BALANCED** | Mirror of #9: 得時 + root, but 助寡. 得時不旺 forbids STRONG on season alone |
| 11 | `ROOT_PRESENT` | `SEASON_SUPPORTIVE` | `FACTION_EVEN` | **BALANCED** | Two favourable dimensions, faction abstains — insufficient for STRONG without 黨眾 |
| 12 | `ROOT_PRESENT` | `SEASON_SUPPORTIVE` | `SUPPORT_NUMEROUS` | **STRONG** | All three agree: 得時 (旺) + 黨眾 (強) + 通根. This is 徐樂吾's 旺+強 corner |
| 13–18 | `ROOT_PRESENT_RELATION_UNRESOLVED` | *any* | *any* | **= the corresponding `ROOT_PRESENT` cell, but the result is capped at BALANCED and always uncertainty-flagged** | §8.9's conservative policy: an unresolved relation may not *promote* a chart, and may not silently demote it either |

**Two invariants a reader can check against the table.** (a) `NO_ROOT` never yields STRONG — 任鐵樵's clause
is an existence gate, and a chart that 不能受 is not 강. (b) No single dimension alone moves a chart to WEAK
or STRONG — every extreme cell (#1, #12) requires all three to agree, which is 子平真詮's 得時不旺失時不弱
enforced structurally rather than by exhortation.

### 12.2 Stage 2 — intensity, only where the table supports a distinction

Stage 2 does **not** subdivide every family into three merely to reach seven. It reports how many of the
three dimensions agree with the family direction — a transparent enumeration over the same 18 cells, not a
score.

| Stage 1 | Intensity | Entry condition | Cells |
|---|---|---|---|
| WEAK | `EXTREME_WEAK` | all three dimensions weak-leaning (`NO_ROOT` + `SEASON_OPPOSING` + `SUPPORT_SCARCE`) | #1 |
| WEAK | `CLEAR_WEAK` | WEAK family, not all three | #2, #4, #7, #8 |
| BALANCED | `BALANCED_LEAN_WEAK` | BALANCED and the root gate fails (`NO_ROOT`) | #3, #5, #6 |
| BALANCED | `BALANCED_CENTRAL` | BALANCED, root present, and the two remaining dimensions disagree with each other | #9, #10 |
| BALANCED | `BALANCED_LEAN_STRONG` | BALANCED, root present, and no dimension is strong-opposing (season supportive, faction even) | #11 |
| STRONG | `CLEAR_STRONG` | STRONG family reached, but a §12.5 limiting-evidence item applies | #12 with limiting evidence |
| STRONG | `EXTREME_STRONG` | #12 with **no** limiting evidence and no opposing channel functionally present | #12 clean |

**Honest disclosure about this stage.** The *corner* intensities (`EXTREME_WEAK`, `EXTREME_STRONG`) are
doctrinally grounded — they are the 極 cases the 從-patterns are carved out of (§12.6). The *middle*
gradations are `DEOKBUNI_OPERATIONALIZATION`: no source grades a BALANCED chart into three sub-levels. They
are retained because they are transparent, replayable, and each maps to a named cell — not because a
classical text licenses them. Any consumer requiring source-backed granularity must read Stage 1 only.

### 12.3 Stage 3 — the seven-band renderer

Stage 3 is a **pure mapping**. It introduces no new judgment, reads no facts, and cannot change a verdict.

| Stage 2 state | Band |
|---|---|
| `EXTREME_WEAK` | 극신약 |
| `CLEAR_WEAK` | 신약 |
| `BALANCED_LEAN_WEAK` | 중화신약 |
| `BALANCED_CENTRAL` | 중화 |
| `BALANCED_LEAN_STRONG` | 중화신강 |
| `CLEAR_STRONG` | 신강 |
| `EXTREME_STRONG` | 극신강 |

`SEVEN_BAND_STATUS = CANONICAL_RENDERER_OVER_STAGE_2`. The bands are canonical **as a rendering of Stage 2**,
and carry exactly the authority Stage 2 has — no more. Where Stage 2 is a `DEOKBUNI_OPERATIONALIZATION`
middle gradation, the band inherits that status; a consumer needing source-backed resolution must branch on
Stage 1.

**Uncertainty overrides the band, never the reverse.** If `UNCERTAINTY_STATE ≠ STRENGTH_CONFIDENT` (§13), the
band is emitted as `PROVISIONAL / DISPLAY_ONLY` and no downstream consumer (a future Yongshin phase, a UI
badge, analytics) may treat it as equivalent to a confident label. Cells #3 and #5 always carry
`STRENGTH_BORDERLINE`; row 13–18 always carries an unresolved-relation flag.

### 12.4 Adjacent-boundary contracts, restated as cell identity

Each boundary is now **a difference of cells**, not a threshold on a scale. Every boundary is decidable by
reading the three §7.3 states.

| Boundary | What actually separates them |
|---|---|
| 극신약 ↔ 신약 | Whether **all three** dimensions are weak-leaning (#1) or only some (#2/#4/#7/#8). Counterevidence blocking 극신약: any root at all, or `SEASON_SUPPORTIVE`, or a faction that is not scarce |
| 신약 ↔ 중화신약 | Whether the chart is in the WEAK family at all. Root present + one favourable dimension moves it to BALANCED (#9/#10); rootless with a favourable dimension lands in BALANCED_LEAN_WEAK (#3/#5/#6) |
| 중화신약 ↔ 중화 | The root gate. `NO_ROOT` ⇒ LEAN_WEAK (#3/#5/#6); `ROOT_PRESENT` with the other two disagreeing ⇒ CENTRAL (#9/#10) |
| 중화 ↔ 중화신강 | Whether any dimension actively opposes. CENTRAL has one opposing dimension (#9 season, #10 faction); LEAN_STRONG has none, only abstention (#11) |
| 중화신강 ↔ 신강 | Whether the faction axis reaches 黨眾. `FACTION_EVEN` ⇒ 중화신강 (#11); `SUPPORT_NUMEROUS` with root and season ⇒ STRONG (#12) |
| 신강 ↔ 극신강 | Presence of §12.5 limiting evidence or a functionally-present opposing channel. Its absence, not its magnitude |

**"Decisive tilt" is deleted from this document.** It appeared in V1.1/V1.2 as the sole authority for two
boundaries while §12.2 itself conceded it was irreducible judgment. Every boundary above is now decided by
cell identity over enumerated states. Any future text reintroducing a tilt/magnitude construct here is a
regression against finding D3.
### 12.5 Structural caps REMOVED — replaced by disqualifying/limiting evidence (audit finding 3)

**V1's two caps are deleted as canonical rules.** They asserted that a rootless DM can **never** reach
(극)신강, and a multiply-rooted, seasonally-supported DM can **never** reach (극)신약, through ordinary
reasoning — stated as absolute impossibilities layered on top of, and separate from, the rest of the
document's evidence-weighing machinery.

**The contradiction (§0):** §6.2 already establishes that floating (rootless) support "is not zero" — it
contributes real, if lesser, qualitative force, particularly when structurally proximate to the DM. An
absolute cap forbidding *any* accumulation of such non-zero contributions from ever reaching a strong band,
no matter how many reinforcing, in-season, proximate floating-support stems a chart has, directly contradicts
the claim that their contribution is non-zero. The same tension applies in reverse to Cap 2 against §7's
opposition-side doctrine.

**What replaces the caps:** the same evidence — rootlessness, or its mirror, exhaustive multi-root
seasonal support — is retained as **extremely strong, usually decisive** evidence, now expressed as the
positive REQUIRED CONDITIONS and COUNTEREVIDENCE fields of §12.4's own boundary contracts (e.g. 극신약's
REQUIRED CONDITIONS literally require zero surviving DM-side candidates — this achieves, through the ordinary
evidence-weighing sequence, almost all of what Cap 1 was trying to guarantee, without asserting it as a
separate, unconditional, non-participating rule that can contradict other stated doctrine). In the rare
theoretical edge case where a genuinely rootless DM accumulates enough functionally-real (§6.2), proximate,
reinforcing floating support to synthesize toward a strong reading through Step H's ordinary qualitative
weighing, this document does not forbid that outcome by fiat — it requires Step H's own sourced method
(§11.0) to actually reach it, which in practice is expected to be rare (floating support's contribution is
real but consistently described as lesser than rooted support, §6.1), but is not asserted to be *impossible*.
This is the corrected, internally-consistent position.

**This is a `DISQUALIFYING/LIMITING EVIDENCE` pattern, not a new arbitrary cap** (brief §11's explicit
instruction) — it participates in the same Step H synthesis as everything else, expressed through §12.4's
contracts rather than as a separate override layer.

### 12.6 Extreme bands vs. special patterns — explicitly separated (audit finding, brief §14)

**극신약/극신강 (ordinary-model extreme bands) are NOT the same claim as a CONFIRMED special structure**, and
must never be conflated:

- An **ordinary-model 극신약** chart (§12.4's boundary: all three dimensions weak-leaning) is reached through
  Step H's normal weighing and remains an ORDINARY seven-band label — it does **not** imply 從財/從官殺/從兒
  are automatically CONFIRMED. Those patterns have their own independently-evaluated positive conditions
  (§10.1) that an ordinary-model 극신약 chart may or may not also satisfy.
- An **ordinary-model 극신강** chart similarly does not imply 從强/從旺/專旺 are automatically CONFIRMED — 專旺
  specifically requires a completed §8.3 harmony set, which an ordinary-model 극신강 chart (reached merely by
  every opposition candidate failing §7.3's gate) may not have at all.
- Conversely, a chart where §10's gate returns `CONFIRMED` for a special pattern **does not receive an
  ordinary-model seven-band label at all** — per §12.6's own routing (§11.1 step 4), it receives the
  **named special-structure verdict** instead, a categorically different output. `SPECIAL_PATTERN_STATUS`
  (§14) is reported alongside CONFIRMED cases explicitly as `CONFIRMED`, not folded into whichever seven-band
  label the ordinary machinery would have separately produced.

This directly satisfies brief §14: EXTREMELY_WEAK_ORDINARY_STRUCTURE ≠ 從財/從官殺/從兒 automatically;
EXTREMELY_STRONG_ORDINARY_STRUCTURE ≠ 從旺/專旺 automatically. Both are real, independently-evaluated claims
that may or may not co-occur on the same chart.

---

## 13. Uncertainty model

Four Part-3 states from V1 retained; `DOCTRINE_CONFLICT`'s trigger condition widened to explicitly include
the new §10.3 gate-level `DOCTRINE_CONFLICT` output, and a fifth, `INSUFFICIENT_STRUCTURAL_EVIDENCE`'s
trigger revised to reflect §4.2's P0→P1 downgrade (it is no longer "the engine cannot compute Step A phase at
all," since the phase computation is available today — it is specifically the boundary-sensitivity flag from
§4.2's `OPTIONAL_SILING_POLICY`):

| State | Trigger condition |
|---|---|
| **STRENGTH_CONFIDENT** | Step H's synthesis shows a directional tilt independently reinforced at multiple steps, F introduces no material contradiction, and G's gate is cleanly closed (`NOT_QUALIFIED` with no near-misses, or `CONFIRMED` with zero unresolved sub-conditions). Seven-band label (or special-pattern verdict) asserted at face value. |
| **STRENGTH_BORDERLINE** | Same-method evidence genuinely close per §12.1's uncertainty-flagged cells (#3, #5) and rows 13-18, or a relation whose outcome is UNRESOLVED per §8.9. Output = an adjacent-pair range, never a forced single label. |
| **SPECIAL_PATTERN_UNCERTAIN** | §10's gate returns `CANDIDATE_UNCONFIRMED` for the relevant pattern(s) — a near-miss that must never silently fall back to the ordinary ladder as though the question were never asked (§11.1 step 6). |
| **DOCTRINE_CONFLICT** | Either (a) §10.1's per-pattern `AMBIGUOUS CASE POLICY` routes to this state at the gate level (e.g. the 財+官殺-both-present 從財 case), or (b) different named lineages/schools (§2) would weigh the *same* finalized B–F evidence differently at a specific step (e.g. §5.6's dimension-weighting question, or §8.1's DM-involvement 合화 dispute). Must name which schools/lineages disagree and how — never silently averaged. |
| **INSUFFICIENT_STRUCTURAL_EVIDENCE** | The chart is flagged `BOUNDARY_SENSITIVE` per §4.2's `OPTIONAL_SILING_POLICY` (birth near a 節氣 changeover, where the exact 사령 sub-period table — still not built, now P1 — could plausibly change the seasonal reading) AND the case is plausibly sensitive to that precision (i.e., other evidence is not so one-sided that the boundary question is moot). This is narrower than V1's original trigger, consistent with §4.2's downgrade — it no longer fires merely because the sub-period table doesn't exist; it fires only for genuinely boundary-proximate charts. |

**Hard rule (unchanged):** states 2–5 must never be collapsed into a single seven-band point-label as if
resolved.

### 13.1 Type relationship (brief §15)

The internal result permits, simultaneously and without conflation:

```
STRUCTURAL_CLASS        — Stage 1 (WEAK/BALANCED/STRONG), or the special-pattern category if CONFIRMED
SEVEN_BAND_DISPLAY       — Stage 3 rendering, ALWAYS computed if B–F facts exist, but...
UNCERTAINTY_STATE        — one of the five states above; NEVER absent
CANONICAL_CONFIDENCE_STATUS — derived from UNCERTAINTY_STATE, never an independent number (§14)
```

**If UNCERTAINTY_STATE is anything other than STRENGTH_CONFIDENT, the SEVEN_BAND_DISPLAY value is
`PROVISIONAL / DISPLAY_ONLY`** — it may still be shown (e.g. as part of an adjacent-pair range, or as a
best-current-reading with an explicit caveat), but it is **not** a canonical high-confidence fact, and no
downstream consumer (a future Yongshin phase, a UI badge, an analytics pipeline) may treat a
`PROVISIONAL/DISPLAY_ONLY` label as equivalent to a `STRENGTH_CONFIDENT` one. This fixes the type-relationship
gap the brief's §15 names: a borderline label is never silently promoted to certain.

---

## 14. Evidence contract

Fields unchanged in name from V1 (`SUPPORTING_FACTS`/`COUNTER_FACTS`/`DECISIVE_FACTORS`/`BORDERLINE_FACTORS`/
`SPECIAL_PATTERN_STATUS`/`DOCTRINE_SOURCE`/`CONFIDENCE`), with two revisions:

- **`DOCTRINE_SOURCE`** now records the full §2.2 provenance tuple (TEXT_LAYER/SCHOOL/CANONICAL_SCOPE/
  RUNTIME_AUTHORITY/CONFLICTS) for each DECISIVE_FACTOR, not merely a single Level A/B/C/D tag — this is the
  direct fix for audit finding 7 at the evidence-contract level, ensuring a restored/displayed verdict can
  show *which named lineage or school* licensed a given step's interpretation, not just a coarse confidence
  band.
- **`SPECIAL_PATTERN_STATUS`** now includes the fourth §10.3 state: `NOT_APPLICABLE` / `CONSIDERED_AND_
  REJECTED` (name which condition failed) / `SPECIAL_PATTERN_UNCERTAIN` / `CONFIRMED` / `DOCTRINE_CONFLICT`
  (name which schools disagree).

**`CONFIDENCE`** — exactly one of §13's five states, never a bare numeric score, unchanged principle from V1.

### 14.1 Worked example — REVISED to use the corrected §6.5 rule (財克印, not 官殺克印)

*(Illustrative of structure only. Not adopted doctrine for any specific real chart.)*

**FACT:** "Day Master 甲 (Yang Wood) has a structural root in a 寅 branch, at the 정기 layer." **FACT:** "The
month branch is 申 (Metal); its 정기 hidden stem 庚 stands in a 七殺 relation to 甲." **FACT:** "A 戊 (Earth,
財 relative to 甲) stem is visible in the 月干 position, adjacent to a 인성 candidate stem."

**INFERENCE** (Step A+E+F synthesis): "Because the month command (申) is seasonally Metal-dominant and the
DM's only root (寅) lies outside the governing season, that root's vitality is diminished relative to a
wood-governing month — it exists (a FACT) but does not carry full seasonal force (an INFERENCE about
vitality, §5.3, TEXT_LAYER SOURCE_CLASS_B). Separately, the visible 戊(財) stem, being adjacent to the 인성
candidate, is evaluated under §6.5's corrected rule (財克印, TEXT_LAYER SOURCE_CLASS_C): if 戊 is itself
functionally intact (rooted, seasonally live), it suppresses that 인성's output — this is a DIFFERENT claim
from the earlier, incorrect draft's `官殺剋印`, which the five-phase cycle does not support (官殺 generates 印,
it does not control it). If Step E's search finds no OTHER unclashed 인성 rooted or transparent anywhere, the
controlling faction (七殺, reinforced by the 財-suppressed 인성's absence from the support side) is judged
functionally dominant and largely unmediated."

**VERDICT** (Step I): "중화신약 — per §12.4's boundary contract, the DM retains one functional-but-seasonally-weakened
root (fails 극신약's zero-surviving-candidates requirement), while the functionally dominant, unmediated
七殺, reinforced by a correctly-attributed 財-suppressed 인성 absence, tips the balance to the weak side of
center."

The correction matters structurally, not just for the specific example: had the incorrect `官殺剋印` rule been
used, a downstream consumer might have double-counted 七殺's effect (once directly as opposition, once again
via a fabricated suppression of 인성) — the corrected 財克印 attribution keeps each Ten-God relationship's
effect properly scoped to the element that actually produces it.

---

## 15. Facts vs. inferences vs. verdict — repaired (brief §16)

**V1.1 correction:** V1's own prose occasionally blurred this boundary by describing derived configuration
tags (e.g. "root structure configuration," "functional force," "dominance," "root integrity result") in
language that read as though they were raw facts. This section restates the boundary with an explicit
non-example list, matching the brief's own FACT/INFERENCE/VERDICT examples precisely.

| Layer | Owns | Examples (FACT) | Examples (INFERENCE) | Examples (VERDICT) |
|---|---|---|---|---|
| **FACT** | Frozen deterministic calculation layer only — never school-dependent, never invented | Branch exists; hidden stem exists; same-element root exists (once P0-3's fact function is built, `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`); a relation pattern is DETECTED (§8's first question only, for any mechanism); a visible ten-god exists | — | — |
| **INFERENCE** | The doctrine reasoning sequence (§11, Steps A–H) — school-aware, sourced, graded by §2's provenance classes | — | Root is weakened (§8.4's FUNCTIONAL EFFECT judgment); root remains functional (§5.1's post-F integrity check); bureau formation is effective (§8.3's FORMATION/VALIDITY judgment, distinct from mere DETECTION); combination transforms (§8.1/§8.2's TRANSFORMATION judgment, distinct from DETECTION); special-pattern condition is satisfied (§10's per-pattern conditions, evaluated through §10.0's functional-integrity mechanism); opposition is functionally strong (§7.3's effective-force gate output) | — |
| **VERDICT** | Step I only | — | — | WEAK / BALANCED / STRONG (Stage 1); 중화신약 etc. (Stage 3, §12); a named special-structure category (§10, if CONFIRMED) |

**Explicitly NOT raw facts, restated per the brief's own list** (each is an INFERENCE, requiring the named
Step's reasoning, never a direct read of the frozen layer): root structure CONFIGURATION (§5's ROOT-B8-style
aggregate — a synthesis of multiple facts, not itself one); functional FORCE (§7.3's ordinal output);
DOMINANCE (any comparative judgment between DM-side and opposition-side, always a Step H synthesis output,
never a count comparison); root INTEGRITY RESULT (§8.4/§8.5's graded survival tag — the OUTCOME of an
inference over the raw clash-DETECTION fact, not the detection itself).

No layer may be skipped. Matching this session's own established discipline for the divination reasoning
kernel's G6 persistence gate: a future persisted strength verdict must be reconstructable/verifiable from
FACT+INFERENCE, never trusted as an opaque VERDICT string.

---

## 16. Repository fact coverage

Unchanged in substance from V1's audit (full detail in `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`); the P0/
P1/P2 classification itself is revised per §20 below and the companion document.

---

## 17. Adversarial doctrine cases — RE-AUDITED (brief §18)

Re-audited all 40. **Case 27 corrected** (the 官殺剋印 → 財克印 five-phase-cycle error, §0). **Case 7 and Case
20 reviewed against the revised doctrine** (brief's own explicit instruction) and revised where the prior
wording no longer matches V1.1's corrected rules (§7, §5.1/§6). Several other cases updated for consistency
with the removed universal SG-0 (§10.0) and removed structural caps (§12.3). 42 cases total (40 retained/
revised + 2 added to cover the newly-introduced `DOCTRINE_CONFLICT` gate state and the corrected §6.5 rule
directly, beyond Case 27's fix) — exceeding the 40-case minimum per the brief's own "add more if needed."

| # | Category | FACT CHANGE | EXPECTED STRUCTURAL EFFECT | WHAT MUST NOT HAPPEN | DOCTRINE BASIS |
|---|---|---|---|---|---|
| 1 | 得令 but structurally weak | DM 旺 by month, but zero functionally-surviving root elsewhere and the month branch itself is clashed | Reduced weight on the seasonal prior; verdict trends toward 신약/중화신약 depending on opposition | Verdict locked to 신강+ purely because month = 旺 | §4.4(1), §8.4 |
| 2 | 失令 but structurally strong | DM 死/囚 by month, but multiple intact, functionally-surviving 본기-tier roots elsewhere plus rooted transparent 비겁 | Verdict trends 신강/중화신강 despite 실령 | Verdict locked to 신약 purely because month ≠ 旺/相 | §4.4, §5.7 |
| 3 | One root vs. multiple roots (non-additive) | Chart A: one 본기-tier, seasonally vital, functionally-intact 월지 root. Chart B: three scattered 여기-tier roots in non-combining branches | Chart A may rate equal or stronger than Chart B despite fewer roots | Chart B automatically rated stronger purely by root COUNT | §5.7 |
| 4 | Root present but functionally damaged | A same-stem root exists in an isolated branch that is then clashed with no mediation | Per §8.4, root graded WEAKENED/DESTROYED, routed to ROOT_EFFECT_UNRESOLVED per §8.10 | Root counted as fully functional because "root = +1" regardless of clash | §8.4 |
| 5 | Unrooted visible support | A visible 인성 stem with no root anywhere, distant column | Support graded FLOATING (§6.2) — contributes materially less than a rooted equivalent, but not zero | Support counted identically to a rooted 인성 in the same tally | §6.1, §6.2 |
| 6 | Strong output drain | Multiple rooted, seasonally-vital 食傷 stems, DM otherwise moderate | Verdict trends toward 신약/중화신약 if unmediated; 신강 with 食神制殺 usefulness noted separately (favorability axis) if a controlling 관살 is present that 食傷 checks | Output drain treated identically regardless of whether it is checking a real 관살 threat (conflating strength-axis and favorability-axis, §7.4) | §7.1, §7.4 |
| 7 | Strong officer pressure — REVISED per re-audit | Rooted, seasonally-vital 七殺 with no functionally-intact 食傷/印 mediation | Verdict trends 신약/중화신약 per §12.1's table (an occupied opposing channel with the faction axis not favouring the DM); 七殺's unchecked-vs-正官 disposition is surfaced as a SEPARATE qualitative severity flag (§7.1) — the ORIGINAL case wording risked implying the disposition flag itself changes the strength magnitude, which §7.1 explicitly forbids; this revision makes the two claims (magnitude vs. disposition) textually distinct | 正官 and 七殺 treated as numerically different DRAIN MAGNITUDES (as opposed to different disposition/severity flags at equal magnitude) | §7.1 (explicit warning), §12.1 |
| 8 | Strong wealth burden | Multiple rooted 財 stems generating a rooted, functionally-intact 官殺 (財生官殺 chain) | Opposition faction tagged as reinforced/chained (§7.2), not three independent unrelated drains | 財 and its generated 官殺 counted as two unrelated, unlinked drain units | §7.2 |
| 9 | Balanced chart | Season mixed (相), one moderate functionally-surviving root, one moderate rooted support stem, one moderate rooted opposing stem, Step H's synthesis genuinely does not resolve a tilt | 중화, STRENGTH_BORDERLINE or STRENGTH_CONFIDENT depending on how cleanly Step H resolves | Forced into a definite one-sided band merely because the engine must output *something* precise | §12.1 (cells #9/#10), §13 |
| 10 | Near-balanced weak | Root present, one dimension favourable and one opposing, and the root gate fails | 중화신약 (BALANCED_LEAN_WEAK) | Forced all the way to 신약 or flattened to 중화 | §12.1 cells #3/#5/#6, §12.2 |
| 11 | Near-balanced strong | Root present, season supportive, faction EVEN (no dimension actively opposing) | 중화신강 (BALANCED_LEAN_STRONG) | Forced to 신강 or flattened to 중화 | §12.1 cell #11 |
| 12 | Apparent special-pattern candidate, rejected | DM appears rootless, but one 정기-tier functionally-intact root branch is found on exhaustive scan | `NOT_QUALIFIED` (the corrected §10.0 mechanism finds a functionally-surviving disqualifier) → ordinary model; likely 극신약/신약 depending on that root's own vitality/survival | Special-pattern verdict issued despite a functionally-intact disqualifying root | §10.0, §10.3 |
| 13 | Genuine special-pattern candidate | DM rootless on exhaustive scan, month and all branches dominated by one non-DM element, that element's own root-competitors are either absent or present-but-functionally-destroyed by F | `SPECIAL_PATTERN_CONFIRMED` (specific sub-type per §10.1) if EVERY sub-check independently clears through §10.0's mechanism | Ordinary seven-band label applied instead of the special-structure output category | §10.3, §12.4 |
| 14 | Disputed special-pattern boundary | DM rootless, dominant element aligned, but one branch carries only a 여기-tier root of the opposing element with genuinely contested clash status | `SPECIAL_PATTERN_UNCERTAIN` | Silently defaulting to either CONFIRMED or the ordinary ladder without flagging the near-miss | §10.0, §13 |
| 15 | Combination that does NOT transform | Two adjacent branches form a 六合 pair, but the transformed element lacks seasonal support and a third branch clashes one member | Tagged 합而不화 — FUNCTIONAL binding only (§8.2), original element's root function reduced but not erased | Root/support treated as having transformed into the new element | §8.2, TRANSFORMATION preconditions failing |
| 16 | Transformation candidate | Adjacent 干합 pair, transformed element seasonally supported, no breaking clash, non-DM stems | Tagged 합화 — STRUCTURAL transform (§8.1); downstream rooting/support re-evaluated against the new element | Transformation asserted from mere adjacency alone, ignoring seasonal-support/no-breaking-force preconditions | §8.1 |
| 17 | Clash affecting root | A 본기-tier root branch is clashed by an adjacent branch with no mediation and no reinforcement | Root tagged WEAKENED or DESTROYED (graded, per relative vitality of the two branches) | Uniform "root survives regardless of clash" or uniform "any clash = full destruction" without grading | §8.4 |
| 18 | Clash not destroying structural support | Same clash as #17, but a third branch combines with one clash member (貪合忘沖) | Root tagged MEDIATED — reduced but non-zero force | Root treated as fully destroyed, ignoring the mediating principle | §8.4 |
| 19 | Raw element count misleads | DM element appears 4 times across the 8 stem/branch slots (nominal high count), but all 4 occurrences are either 여기-tier hidden stems in seasonally-dead branches or floating unrooted stems | Verdict does NOT default to 신강 merely from the raw count; functional analysis (§5, §6) may still yield 신약/중화신약 | Raw element count used as a shortcut proxy for strength | §3 (concept #1), §5.1 |
| 20 | Hidden stems materially matter — REVISED per re-audit | DM has no visible same-element stem anywhere, but a 본기-tier hidden root exists in a functionally-intact, seasonally-vital branch | Root counted according to its own §5.2/§5.3/§8.4 layer-vitality-survival characteristics — on EQUAL ONTOLOGICAL FOOTING with a visible-stem root of comparable tier/vitality/survival, neither discounted merely for being hidden-only NOR asserted as an absolute "full functional weight" (V1's original wording), since this document does not use numeric "weight" at all | Hidden-stem roots discounted purely because they are "hidden"; OR a hidden root asserted at some absolute maximal weight independent of its own tier/vitality/survival facts | §5.1, §5.2, §12.1 |
| 21 | Climate and strength must remain separate — hot chart | DM is Fire, born in 巳 month (peak Fire season, structurally 신강-favorable), chart also shows extreme heat/dryness by the separate `CLIMATE_DOMAIN` fact object | Strength verdict driven purely by §3–§12 structural facts; `EXTREME_CLIMATE_FUNCTIONALITY` (§9) may inform how a SPECIFIC element's own functional grading (§5.3/§7.3) reads, but climate is reported as a separate fact, never directly assigning the band | Climate ("needs water to cool down") used to lower/raise the strength band directly | §9 |
| 22 | Climate and strength must remain separate — frozen chart | DM is Water, born in 子 month (peak Water season), chart shows extreme cold with no Fire anywhere | Same structural-strength verdict logic as any other 旺-season DM; `EXTREME_CLIMATE_FUNCTIONALITY` fact ("frozen, needs Fire to thaw for functional use") reported separately, may inform a SPECIFIC downstream element's functional grading, never the band directly | Structural strength band itself downgraded because the chart is climatically "unbalanced" | §9, CS-4-style "frozen water" example |
| 23 | 節氣-boundary birth, residual qi | Birth falls within the `BOUNDARY_SENSITIVE` window of §4.2's `OPTIONAL_SILING_POLICY`; month branch nominally supports DM, but the residual 餘氣 of the prior (opposing) month plausibly still governs | `INSUFFICIENT_STRUCTURAL_EVIDENCE` (§13, narrowed trigger) if the case is plausibly sensitive to the missing exact table; a best-current reading using the nominal primary element is still reported, flagged PROVISIONAL | Full-confidence 旺/相 label asserted purely from the new month's nominal element, ignoring boundary proximity; OR the entire reasoning sequence blocked outright pending the P1 사령 table | §4.2, §13 |
| 24 | 사령 tier mismatch inside the month branch (forward-looking — depends on the P1 사령 table, not yet built) | Month branch's 본기 nominally supports DM, but (once available) birth date's day-count would place governance in a 중기/여기 tier of a different element | Until the P1 table exists: chart is flagged `BOUNDARY_SENSITIVE` per §4.2 rather than silently assumed resolved; once the table exists: root/seasonal reading uses the actually-governing tier | Nominal 본기 assumed governing regardless of day-count position, reported with full confidence, when the chart is in fact boundary-sensitive | §4.2, §5.2–5.3 |
| 25 | Multiple weak roots vs. one strong root, escalation-adjacent | Three scattered branches happen to complete a §8.3 방합 trio of the DM's own element | Escalation flagged toward special-structure territory (§10 handoff, specifically 專旺's completed-set requirement), not merely "MULTIPLE roots, graded per §5.7" | Treated as an ordinary MULTIPLE-root case, ignoring the completed directional set's own §8.3 STRUCTURAL significance | §5.7, §8.3, §10.1 (專旺) |
| 26 | Contested combination (爭合) leaves support undecided | A potential support stem's combination partner is flanked by two competing suitor stems | Support stem NOT flagged fully NEUTRALIZED; residual function graded conservatively as uncertain, not zeroed | Combination assumed to complete cleanly and neutralize the support stem outright | §6.4 |
| 27 | Direct 克 suppressing support output — CORRECTED (五行 cycle error fixed) | A rooted, functionally-intact 財 stem (NOT 官殺 — 官殺 generates 印, per §0/§6.5, it does not control it) is directly flanked and controls an adjacent 인성 stem, no combination involved | 인성's functional output tagged suppressed by the ADJACENT 財 stem specifically, independent of its own rootedness fact | (a) Root fact alone treated as sufficient — suppression channel ignored; (b) **官殺 mistakenly credited with suppressing 印 (the original V1 error) — 官殺生印, it does not 克 印; only 財克印 is correct** | §6.5 (corrected) |
| 28 | Stem-level vs. branch-level independence | A rooted support stem is 合거'd (combined away) at the stem level; its ROOT branch itself is untouched by any relation | Root fact at the branch level persists unchanged; only the STEM's functional output is flagged reduced | Root fact deleted or discounted merely because the STEM was combined away | §6.6 |
| 29 | Floating support with proximity | An unrooted 비겁 stem sits in the 시간 column (adjacent to DM per §5.6's DAY-adjacency dimension) vs. an identical unrooted stem in 년간 (distant, no BINDING positional claim per the revised §5.6) | 시간 case graded with somewhat higher qualitative contribution per §6.2's proximity convention (CONDITIONAL, not BINDING), both still categorically lower than a rooted stem | Both floating stems treated identically regardless of proximity, OR either treated as equal to a rooted stem, OR the proximity difference asserted as a fixed classical ranking rather than the CONDITIONAL convention it actually is | §5.6, §6.2 |
| 30 | 財 reinforcing 官殺 without a visible 官殺 | Chart shows multiple rooted 財 stems, no visible 官殺 stem anywhere, but a 官殺-element hidden stem exists in a branch | Opposition faction assessment notes the latent 財生官殺 reinforcement potential rather than treating 財 as an isolated, unlinked drain | 財 evaluated in total isolation from its generative relationship to 官殺 | §7.2 |
| 31 | 食神制殺 usefulness does not change strength-axis magnitude | Rooted, vital 食神 checking a rooted, vital 七殺 | Strength-axis: 食神's drain on DM is counted at its own §7.3 functional-force grade, unaffected by its usefulness against 七殺; favorability-axis (out of scope here) notes the protective relationship separately | 食神's drain discounted or zeroed on the strength axis because it is "protecting" the DM from 七殺 | §7.1, §7.4 |
| 32 | 正官 vs. 七殺 disposition does not become a magnitude multiplier | Two charts, structurally identical rooted/seasonal officer-star presence, one 正官 one 七殺 | Both weighed at comparable strength-axis magnitude per §7.3's functional-force criteria; disposition difference surfaces as a qualitative severity flag (§7.1), not a different drain weight | 七殺 assigned an arbitrary higher numeric drain weight than 正官 with no sourced magnitude basis | §7.1 (explicit warning against this exact conflation) |
| 33 | Special structure disqualified by a hidden (not visible) functionally-intact opposing element | Chart otherwise resembles 從强, but a branch's 지장간 contains a functionally-intact opposing-element hidden stem at 본기 tier, no visible occurrence of it anywhere | `NOT_QUALIFIED` — §10.0's corrected mechanism applies to a functionally-intact opposing element regardless of whether it is visible or hidden-only | Special-pattern confirmed because the disqualifying element "isn't visible," ignoring the hidden root | §10.0, §5.1 |
| 34 | 從兒격 — missing 財 outlet — **REVISED IN V1.2** | 月令 carries 食傷 and 食傷 is present across the chart, but **no 財 anywhere** (dead-end 식상). DM rootedness is deliberately UNSPECIFIED in this case, because it is no longer a 從兒 condition | `NOT_QUALIFIED` for 從兒 — the missing 財 outlet is a genuine ORIGINAL_TEXT condition (「只要吾兒又得兒」, 任鐵樵 「必要局中有財」). The chart re-routes to the ordinary model | 從兒 qualified with no outlet check; **or the case being decided on the DM's rootlessness, which V1.2 removed as a condition** | §10.1 (從兒격, V1.2) |
| 34a (new, V1.2) | 從兒격 — rooted DM with 比劫 present still qualifies | 月令 carries 食傷, a 財 exists, and the DM **has a functionally-intact root** with a rooted 比肩 also present | 從兒 is **NOT disqualified by either fact**. 「從兒不管身強弱」 makes DM strength non-governing, and 任鐵樵's 「四柱雖有比劫仍去生助食傷也」 makes 比劫 a *feeder* of 食傷, not an opponent. Outcome caps at `CANDIDATE_UNCONFIRMED` on the unquantifiable 食傷-multiplicity condition, never `NOT_QUALIFIED` on rootedness | The V1.1 behaviour: rejecting the chart because the DM is rooted, or because a 比劫 is present — the single most consequential error this revision fixes | §10.1 (從兒격, V1.2), §0.2 D1 |
| 34b (new, V1.2) | 從兒격 — 月令 does not carry 食傷 | 食傷 is abundant in the chart and a 財 outlet exists, but the **month branch is not 食神/傷官** to the DM | `NOT_QUALIFIED` — 任鐵樵 marks the 提綱 condition 必要 (「必要食傷在提綱也」). If 食傷 sits only in the month branch's 중기/여기, the scope question is UNSETTLED → `CANDIDATE_UNCONFIRMED`, never silently resolved | Qualifying on chart-wide 食傷 abundance while ignoring the 月令 requirement — the condition V1.1 omitted entirely | §10.1 (從兒격, V1.2) |
| 35 | Seasonal vitality is five states, not two | DM's element is in a 休 (rest) relation to the month (DM generates the season), distinct from 死 (season overcomes DM) | 休 and 死 tagged and weighted as distinct degrees of seasonal disadvantage, not collapsed into one "DRAIN"/"실령" bucket | 休 and 死 (and 相 vs. 旺) treated as equivalent binary states | §4.3 |
| 36 | 12운성 disagreeing with 지장간 rooting | A branch is the DM's 帝旺 by 12운성 placement, but offers only a 여기-tier hidden-stem root by 지장간 accounting | Both facts surfaced separately, not silently merged into one rooting number; the 지장간-based tier grading (§5.2) governs the ROOTING axis specifically | 12운성 vitality used interchangeably with 지장간 root-tier grading as if the same measurement | §5.8 |
| 37 | Partial (半合) trine missing the center branch | Two of three 삼合 branches present, but NOT including the trio's 帝旺/center branch | Graded as a weaker partial combination (§8.3) than a center-inclusive half-combination or a full trine; does NOT reach 專旺-territory escalation (§10.1's own explicit AMBIGUOUS/NOT_QUALIFIED policy for partial sets) | Partial trine treated identically to a full trio, or identically regardless of whether the center branch is included, or silently escalated to 專旺 candidacy | §8.3, §10.1 (專旺) |
| 38 | Confidence must reflect agreement, not be computed by counting alone | A's seasonal prior, B's root finding, and D/E's opposition reading all independently reinforce the same direction, with no F-level contradiction and G cleanly closed (`NOT_QUALIFIED`, no near-misses) | `STRENGTH_CONFIDENT` — but the state is derived from the STRUCTURE of agreement (which named steps, why) not from a bare tally | Confidence computed purely as "N of M factors agree" without naming which steps and why | §13 (STRENGTH_CONFIDENT trigger), §14 (DECISIVE_FACTORS) |
| 39 | Doctrine conflict surfaced, not averaged | A candidate root's standing is the sole factor separating two adjacent bands, and §5.6-flagged SCHOOL_DEPENDENT dimension-weighting readings genuinely diverge | `DOCTRINE_CONFLICT` state, naming both readings and their diverging conclusions | The two readings silently blended into one "compromise" label | §13 (DOCTRINE_CONFLICT), §2's provenance discipline |
| 40 | Legacy engine gap honestly flagged | A chart is `BOUNDARY_SENSITIVE` per §4.2, and other evidence is genuinely close enough that the missing 사령 table could plausibly change the reading | `INSUFFICIENT_STRUCTURAL_EVIDENCE`, explicitly distinct from a genuine chart-level BORDERLINE case (§13's narrowed trigger) | Verdict issued at full confidence despite a known, named boundary-sensitivity condition that could plausibly change it; OR the entire chart blocked from any reasoning merely because the P1 table doesn't exist | §13, §4.2 |
| 41 (new) | Gate-level DOCTRINE_CONFLICT, not silently resolved | A 從財格 candidate chart has both a functionally-intact rooted 財 AND a functionally-intact rooted 官殺 (the explicitly named disputed configuration, §10.1) | §10.3 returns `DOCTRINE_CONFLICT` for the 從財 gate specifically, naming the two schools' opposite readings | The gate silently defaults to either qualifying or disqualifying without surfacing the named dispute | §10.1 (從財격 AMBIGUOUS CASE POLICY), §10.3 |
| 42 (new) | Corrected §6.5 rule applied to a full chart, not just isolated | A chart has a functionally-intact rooted 官殺 AND a functionally-intact rooted 財, both adjacent to the same 인성 candidate stem | The 인성's suppression is attributed to the adjacent 財 stem specifically (財克印); the adjacent 官殺 is evaluated on its OWN merits as opposition (§7) and, separately, is noted as GENERATING the 인성 (官殺生印) — a structural fact recorded, not scored | 官殺 counted as ALSO suppressing the 인성 (double-counting the same Ten-God relationship's effect incorrectly, per the original V1 error) | §6.5 (corrected), §0 |

### 17.1 V1.3 cases — special-pattern source conflicts (brief §37)

Every expected outcome below follows from the **revised** doctrine. Where a V1.1 expectation no longer
follows, it was changed rather than preserved.

| # | Category | FACT CHANGE | EXPECTED STRUCTURAL EFFECT | WHAT MUST NOT HAPPEN | DOCTRINE BASIS |
|---|---|---|---|---|---|
| 43 | 從兒 with a **rooted** Day Master | 月令 carries 食傷, a 財 exists, and the DM has a functionally-intact same-element root | 從兒 is **NOT disqualified**. Caps at `CANDIDATE_UNCONFIRMED` on the unquantified 食傷多也, never `NOT_QUALIFIED` on rootedness | Rejecting the chart because the DM is rooted — the V1.1 behaviour, refuted by 從兒不管身強弱 | §10.1 從兒, §0.2 D1 |
| 44 | 從兒 with 比劫 present feeding 食傷 | As #43, plus a rooted 比肩 | Unchanged outcome — 比劫 contributes **zero** evidence in either direction | Treating 比劫 as a disqualifier, or as positive evidence | 任鐵樵 「四柱雖有比劫仍去生助食傷也」 |
| 45 | 從兒 obstructed by 印 | 月令 carries 食傷, 財 exists, and a **functionally-intact rooted 印星** is present | `NOT_QUALIFIED` — 印剋食傷 severs the 生育 flow | Treating 印 under the 從財 rationale ("the DM regains an alternative") — right conclusion, wrong mechanism | §10.1 從兒 |
| 46 | 從兒 with no 財 outlet | 月令 carries 食傷, 食傷 abundant, **no 財 anywhere** | `NOT_QUALIFIED` — the outlet is ORIGINAL_TEXT (只要吾兒又得兒) | Qualifying on 食傷 abundance alone; **or** deciding the case on DM rootlessness, which is no longer a condition | §10.1 從兒 |
| 47 | 從旺 with **no 印 anywhere** | 四柱皆비겁, no 官殺, no 財, and **no 印綬** | `NOT_QUALIFIED` for 從旺 — 有印綬之生 is a **positive requirement** in 任鐵樵's definition, not a disqualifier | Confirming 從旺 from 비겁 dominance alone; V1.1 carried no 印 clause at all | §10.1 從旺 |
| 48 | 從旺 vs 從强 both satisfied | 印綬重重 + 比劫疊疊 + 日主當令, no 財/官殺 | **從强** wins — its premises are strictly stronger (`SUBTYPE_RELATION`), not a precedence rank | Emitting both; or picking 從旺 by document order | §10.7 |
| 49 | 專旺 and 從强 both satisfied | As #48, plus a completed 方合 of the DM's element | **`AMBIGUOUS_MULTI_CANDIDATE`**, both named — no source ranks them | Inventing a precedence; silently preferring the one with more satisfied conditions | §10.7 |
| 50 | 稼穡 with a 三合, not 四庫 | 土 DM, a completed 三合 of Earth-adjacent branches, but **not** all of 辰戌丑未 | `NOT_QUALIFIED` for 稼穡 — its requirement is 四庫皆全, which is neither a 三合 nor a 方合 | Applying the blanket "completed 삼합 or 방합" clause, which V1.1 wrongly extended to all five sub-patterns | §10.1 專旺 |
| 51 | 專旺 with a 財 present | 曲直 configuration complete, no 金 anywhere, but a rooted 財 | **Not broken by 財 presence alone** — only the controlling element breaks 專旺. But 子平真詮's separate clause applies: 財根深 or 財透兩位 ⇒ `NOT_QUALIFIED`; a merely transparent 財 ⇒ still qualifies | Extending the controller disqualifier to 財/食傷 (V1.1's over-extension) | §10.1 專旺 |
| 52 | Residual 餘氣 opposing root under 從强 | 印綬重重 + 比劫疊疊 + 當令, and a 餘氣-tier 財 hidden in a 중기 position | `CANDIDATE_UNCONFIRMED` — the scoped 絕無一毫 reading (visible + 본기) does not disqualify, but the residual occurrence is emitted as evidence | **V1.1's leniency** (a 餘氣, seasonally-dead root "does not by itself disqualify" ⇒ silent pass); **or** the unscoped reading, which would disqualify via the pattern's own constituent branches | §10.1 從强 |
| 53 | 眞從/假從 applied to a strong-DM pattern | A 從旺 candidate with one contested opposing occurrence | The 眞/假 vocabulary is **not applied** — it is scoped by its own gloss to the weak-DM family. The chart resolves via `CANDIDATE_UNCONFIRMED` instead | Reporting 假從旺 or similar; V1.1 over-extended 眞假從 to all patterns | §10.1 從旺, source matrix G-眞假從 |
| 54 | 從財 with both 財 and 官殺 occupied | `NO_ROOT`, and both WEALTH and CONTROL channels occupied | `DOCTRINE_CONFLICT`, naming both readings (continuous 財生官 flow vs structurally competing) | Silently qualifying or silently rejecting | §10.1 從財 |

### 17.2 V1.3 cases — ordinal structural states (brief §38)

Each case names the §12.1 cell it exercises, so the expected label is traceable rather than asserted.

| # | Purpose | Structural state | Expected | WHAT MUST NOT HAPPEN | Cell |
|---|---|---|---|---|---|
| 55 | Extreme ordinary weak, **not** a 從 pattern | `NO_ROOT` + `SEASON_OPPOSING` + `SUPPORT_SCARCE`, but two opposition channels occupied (so no channel is uniquely occupied) | **극신약** on the ordinary axis; special gate returns `NOT_QUALIFIED` | Routing to 從財/從官殺 merely because the DM is rootless — channel **uniqueness** is required | #1 |
| 56 | Weak family but not extreme | `ROOT_PRESENT` + `SEASON_OPPOSING` + `SUPPORT_SCARCE` | **신약** — the root gate passes, so not 극신약 | Collapsing to 극신약 because two dimensions oppose | #7 |
| 57 | Balanced leaning weak | `NO_ROOT` + `SEASON_SUPPORTIVE` + `SUPPORT_NUMEROUS` | **중화신약** — 無根 blocks the STRONG family even with two favourable dimensions | Reaching 신강/중화신강 on two favourable dimensions while rootless | #6 |
| 58 | True central balance | `ROOT_PRESENT` + `SEASON_OPPOSING` + `SUPPORT_NUMEROUS` | **중화** — 失時不弱 applied directly | Forcing 신약 because the season opposes | #9 |
| 59 | Balanced leaning strong | `ROOT_PRESENT` + `SEASON_SUPPORTIVE` + `FACTION_EVEN` | **중화신강** — no dimension actively opposes, but 黨眾 is not reached | Promoting to 신강 on an even faction | #11 |
| 60 | Strong but not extreme | `ROOT_PRESENT` + `SEASON_SUPPORTIVE` + `SUPPORT_NUMEROUS`, with a §12.5 limiting-evidence item | **신강** | Reaching 극신강 while limiting evidence stands | #12 |
| 61 | Extreme ordinary strong, **not** 專旺/從旺 | Cell #12 clean, but no completed 方合/三合 and 官殺 present in the chart | **극신강** on the ordinary axis; special gate `NOT_QUALIFIED` | Escalating to 專旺 without the branch configuration, or to 從旺 with 官殺 present | #12 |
| 62 | Root exists but its branch is in an unresolved relation | Cell #12 inputs, but a root branch participates in a detected 沖 | Capped at **BALANCED**, uncertainty-flagged — never promoted, never demoted to WEAK | Treating the clash as damage (forbidden), **or** ignoring it entirely | rows 13–18, §8.9 |
| 63 | Faction tie | `ROOT_PRESENT` + `SEASON_SUPPORTIVE` + `FACTION_EVEN` where support and opposition occurrence counts are exactly equal | `FACTION_EVEN` ⇒ #11, and the tie is **recorded in evidence** | Breaking the tie by a weight, a tier preference, or "the more important pillar" | §7.3.3 |

---

## 18. Metamorphic test plan — REVISED (brief §19, M1/M2/M7/M8 specifically)

Specified for a future implementation phase — not implemented as runtime tests here. M1, M2, M7, M8 rewritten
with explicit invariant preconditions, per the brief's own required form. M3–M6, M9, M10 unchanged in
substance (not named in the audit findings), preconditions added where the M1/M2/M7/M8 rework makes the
pattern generally applicable.

| # | Transformation with explicit invariant preconditions | Expected invariant | Rationale |
|---|---|---|---|
| **M1** | Same chart, minus one functional root, **WITH NO special-pattern transition (§10.3's output for this chart is the same before and after), NO transformation transition (§8's TRANSFORMATION layer output unchanged for every other relation on the chart), and NO change to any OTHER root's integrity status** | The ordinary structural judgment (Stage 1/§12) must not become STRONGER; the band must stay the same or move toward WEAK | Removing support can never help under these preconditions — a monotonicity floor on Axis C. **Precondition matters because**: removing a root COULD, in principle, break up a partial §8.3 harmony set differently, or alter a §10 special-pattern candidacy, in ways that are not monotonic in the same simple sense — this test is scoped to exclude those cases explicitly, not claim the invariant holds unconditionally |
| **M2** | Same chart, add a genuinely rooted, seasonally vital support stem, **WITH NO special-pattern transition, NO transformation transition, and NO new structural relation that changes any EXISTING root's integrity (e.g. the new stem does not itself clash with or combine away an already-counted root)** | Weakness must not increase; band must stay the same or move toward STRONG | Adding functional support can never hurt under these preconditions — monotonicity ceiling. Precondition scoping mirrors M1: an added stem that incidentally clashes an existing root, or that completes a §8.3 set, is a genuinely different scenario this test does not cover |
| M3 | Same chart, change only display/rendering wording (Korean phrasing, labels) | Identical strength verdict, identical evidence contract facts | Verdict is a function of structural facts, never of presentation |
| M4 | Same chart, change only the month branch (holding all else fixed) | Seasonal reasoning (Step A) must be fully recomputed; downstream steps B–I must re-run against the new prior | Step A is the root of the reasoning tree (§11) — everything downstream is conditioned by it |
| M5 | Same chart, add a NOMINAL support stem with zero root and zero proximate placement | Must NOT automatically shift a full strength band; at most a marginal, explicitly-flagged BORDERLINE-adjacent nudge, per §6.2's CONDITIONAL (not BINDING) proximity convention | Presence without function must not move the verdict (§6.1–6.2) |
| M6 | Same chart, reorder how facts are supplied to the reasoning pipeline (input array order) | Identical verdict, identical evidence contract, regardless of internal iteration order | Doctrine is order-independent with respect to *input ordering*, distinct from the mandated *reasoning-step* order (§11) |
| **M7** | Same chart, add a clash that mediates (貪合忘沖, §8.4) an existing clash on a root branch, **WITH NO special-pattern transition and NO OTHER simultaneous relation change on the same or a different branch** | The root's §8.4 survival grade must improve (e.g. DESTROYED → MEDIATED or WEAKENED), never worsen, from the addition of a mediating relation alone | Mediation is doctrinally protective, never destructive under an isolated addition. **Precondition matters because**: a mediating branch could itself, simultaneously, complete or break a DIFFERENT §8.3 set or trigger a DIFFERENT clash elsewhere — this test isolates the mediation effect specifically |
| **M8** | Same chart, add a genuinely functionally-intact rooted opposing element that would break an otherwise-qualifying special structure, **WITH the addition evaluated through §10.0's corrected functional-integrity mechanism (i.e., the new element itself is not, in this scenario, simultaneously neutralized by some other change)** | The special-pattern gate output (§10.3) must move from `SPECIAL_PATTERN_CONFIRMED`/`SPECIAL_PATTERN_CANDIDATE_UNCONFIRMED` toward `NOT_QUALIFIED`, never the reverse, for THIS specific pattern | A functionally-intact disqualifying element's effect is monotonic in the disqualifying direction (§10.0) — restated without V1's removed universal SG-0 short-circuit language; the monotonicity claim survives the correction because it was never the *universality* of SG-0 that was wrong, only treating mere existence (rather than functional integrity) as sufficient |
| M9 | Same chart, shift the birth time only enough to cross a §4.2 `BOUNDARY_SENSITIVE` threshold | The `INSUFFICIENT_STRUCTURAL_EVIDENCE` flag (§13) must engage where it did not before (or vice versa); once a P1 사령 table exists, root/seasonal tier assessment may additionally change | 사령 boundary-sensitivity is a genuine input to Step A/B, not a cosmetic detail |
| M10 | Same chart, run twice with identical input | Byte-identical verdict, evidence contract, and confidence state both times | Determinism — the reasoning sequence is a pure function of the chart facts |

---

## 19. Explicit rejected approaches

Unchanged from V1's list, with two additions reflecting this revision:

1. The prior `natalStrength.ts` candidate in its entirety.
2. `currentStrength.ts`'s `buildCurrentStrengthContext()` as a whole (label computation; the two-layer
   architecture pattern itself may be reused).
3. Any small fixed lookup table as final authority.
4. Support-count vs. drain-count comparison as a strength-magnitude test, on either side.
5. Confidence as a raw count of agreeing factors.
6. **REVISED (was: "형/害/파 as strength-magnitude inputs — rejected as LEVEL D"):** 형/害/파's *runtime
   strength authority* is `DEFER`red as a conservative product policy (§8.8) — this is NOT the same as
   asserting Level A that classical tradition universally says they have zero effect, which V1 incorrectly
   implied and which this revision corrects.
7. Climate (조후) as a **direct strength-band input**, in any form — rejected absolutely (§9); a narrowly
   sourced `EXTREME_CLIMATE_FUNCTIONALITY` modifier on already-established functional-force facts is
   **not** rejected, and is newly specified in §9.
8. Special-structure detection from one or two loose conditions — rejected; the gate (§10.3) requires every
   relevant sub-check, evaluated through §10.0's functional-integrity mechanism, to independently clear.
9. 化氣格 and 兩神成象格 gates — not adopted, deferred.
10. Any specific numeric table for 사령 day-count sub-periods, or for a per-cell 궁통보감 climate-remedy table
    — not adopted.
11. **(new) A universal, existence-only special-structure disqualifier (V1's SG-0)** — rejected as
    insufficiently supported; replaced by §10.0's functional-integrity mechanism, applied per-pattern.
12. **(new) Two absolute structural caps that contradict the document's own floating-support doctrine** —
    rejected; replaced by §12.4's positive boundary contracts and §12.5's disqualifying/limiting-evidence
    framing.

---

## 20. Implementation prerequisites — REVISED P0/P1/P2 (audit finding 4, brief §17)

Full detail and FACT-GAP/DOCTRINE-GAP/INFERENCE-GAP distinction in
`MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`. Summary, adopting the audit's reclassification:

**P0 (unchanged in count, revised composition):**
1. Deterministic same-element (득지) rooting fact — FACT GAP.
2. Deterministic relation→specific stem/root linkage (the clash/combination-to-root-integrity connector) —
   FACT GAP (the linkage itself) feeding an INFERENCE GAP (the grading rule, now specified in §8, not yet
   implemented).
3. Special-pattern prerequisite FACTS (ratios/counts only, not verdicts) — FACT GAP.
4. Canonical special-pattern RULE SET — **DOCTRINE GAP, now closed by §10 of this revision** (was open in
   V1; this document's §10.0–10.1 IS the rule set — no longer a gap requiring further research, though
   several sub-points remain explicitly `SCHOOL_DEPENDENT`/`DOCTRINE_CONFLICT`-eligible by design, not by
   omission).
5. Canonical relation outcome/transformation policy sufficient for V1 — **DOCTRINE GAP, now closed by §8 of
   this revision** for 天干合/六合/三合/방합/沖 (five-question layering specified); 형/害/破 remain
   `RUNTIME_STRENGTH_AUTHORITY = DEFER` by deliberate conservative policy, not an unresolved gap.
6. Executable seven-band boundary contract — **DOCTRINE GAP, closed by §12.1-§12.4 of the V1.3 revision.**

**P1 (revised — 司令 moved here from P0, per audit finding 4):**
1. Exact 사령 day-count refinement (§4.2) — **moved from P0.** V1.1's reasoning sequence runs fully without
   it, using `BOUNDARY_SENSITIVE` flagging + `INSUFFICIENT_STRUCTURAL_EVIDENCE` instead of blocking.
2. Generalized seasonal-phase utility (extraction/refactor of existing logic, not new theory).
3. Visible-stem/root-function joins where not already required by a P0 item.

**P2 for STRENGTH, becoming P0-equivalent-prerequisite before YONGSHIN specifically (brief's own explicit
instruction):**
1. Climate (조후) fact producer — remains P2/optional for the STRENGTH engine itself (§9's separation means
   strength reasoning does not need it), but is **required before any Yongshin-phase work begins**, since
   §21's Yongshin dependencies are unimplementable without it. This dual status is recorded explicitly rather
   than merged into one "P2" bucket that undersells its Yongshin-blocking role.

**FACT GAP vs. DOCTRINE GAP vs. INFERENCE GAP — kept distinct** (brief's explicit instruction not to mix
them under one heading): a FACT GAP is a missing deterministic function reading already-known chart data (no
theory needed, e.g. same-element rooting detection). A DOCTRINE GAP is a missing *sourced rule* for how to
interpret facts (e.g. V1's missing special-pattern rule set — now closed by this revision's §10). An
INFERENCE GAP is a missing *implementation* of an already-specified doctrinal rule against already-available
facts (e.g. §8.4's grading rule is now fully specified in doctrine, but still needs to be built once P0-2's
fact linkage exists — the rule itself is no longer the gap, the code is).

---

## 21. Yongshin dependency notes (unchanged from V1 — not an audit finding)

Explicitly out of scope. Validated structural strength; special-pattern status; climate/조후 facts (now
including `EXTREME_CLIMATE_FUNCTIONALITY`, §9); functional-force discounts for specific candidate elements;
climate-vs-structure conflict surfacing; 通關 prerequisites (not researched); 病藥 framing (available, not
adopted).

---

## 22. Unresolved doctrine questions

Carried forward from V1, revised where this document's own work resolved or reframed a prior entry, with new
entries from this revision:

1. Exact 사령 day-count sub-period boundaries — **unchanged as unresolved**, now explicitly P1 not P0 (§4.2,
   §20).
2. Exact severity/weighting of a 여기-tier vs. 중기-tier root relative to positional/contextual weight —
   **reframed**: §5.6 no longer poses this as "tier vs. a fixed position ranking" (the fixed ranking is
   removed), but the underlying weighting question among the now-multiple contextual dimensions (§5.6's
   table) remains genuinely open, `SCHOOL_DEPENDENT`.
3. Precise pillar-distance decay convention for 沖 severity — unchanged, ordinal only, no numeric curve.
4. DM-involvement default for 合화 (§8.1) — unchanged, genuinely disputed, no default adopted in this
   revision (V1 had recommended a conservative default; V1.1 makes explicit that even that recommendation is
   a disclosed Class-D choice, not resolved doctrine).
5. Whether 방합 doctrinally outranks 三合 in force — unchanged, `SCHOOL_DEPENDENT`.
6. Whether yin stems run 12운성 역행 or 순행 — unchanged, unresolved, flagged non-authoritative either way.
7. 化氣格 and 兩神成象格 entry conditions — unchanged, deferred.
8. Whether 從財格 with simultaneous strong, rooted 官殺 should qualify — **reframed, no longer defaulted**:
   this revision routes it to `DOCTRINE_CONFLICT` explicitly (§10.1, §17 Case 41) rather than silently
   defaulting conservative as V1 did.
9. Precise threshold for scattered-root escalation toward special-structure territory — unchanged,
   deliberately qualitative.
10. Whether 형/害/破 should be retained even as advisory-only annotations — **reframed**: this revision
    explicitly separates "insufficient evidence for runtime strength authority" (§8.8's actual position) from
    "classical tradition says zero effect" (which this revision explicitly does NOT claim) — the retention
    question for non-strength features remains a product decision, unchanged.
11. ~~**The 從强-vs-從旺 boundary**~~ — **RESOLVED IN V1.3.** The distinction is drawn by 任鐵樵 himself, in
    one continuous 從象 passage, on three explicit axes (印 present-and-generating vs 印綬重重; 日主當令
    silent vs mandatory; 四柱皆比劫 vs 二人同心). It is **source-level**, not a naming convention. What
    remains school-dependent is the *modern reception* of the pair, which is recorded in §10.1 as such.

12. ~~**The exact ordinal threshold values for the WEAK/MODERATE/STRONG effective-force scale**~~ —
    **DISSOLVED IN V1.3, not answered.** The question presupposed an ordinal magnitude scale that §7.3 has
    now **deleted** as unsourced. There are no threshold values to specify because there is no scale: §7.3
    replaces it with four enumerated structural dimensions, and §12.1 resolves them through a total 18-cell
    decision table. A future revision that reintroduces an effective-force ordinal would be reopening
    audit finding D3, not answering this question.
---

## 23. V1.3 FINAL SELF-AUDIT (brief §40–§42)

### 23.1 Load-bearing language sweep

Every occurrence of the flagged vocabulary was reviewed and classified. Classes:
**A** = structural state name with an explicit contract · **B** = source language with an explicit
interpretation · **C** = display/narrative language only · **D** = deferred / declared non-executable ·
**E** = undefined but carrying runtime authority.

| Term | Occurrences | Class | Disposition |
|---|---|---|---|
| `decisive tilt` | 2 | **C** | **DELETED as a rule.** Both remaining occurrences are meta-references recording the deletion (§0.2, §10.0) |
| `dominant force` / `near-total force` | 7 | **C** | **DELETED as a rule** (§10.0). All remaining occurrences document the removal or name what replaced it |
| `WEAK/MODERATE/STRONG` (effective force) | 4 | **C** | **DELETED as a scale** (§7.3.4). All remaining occurrences are meta-references |
| `WEAK` / `BALANCED` / `STRONG` (Stage-1 families) | many | **A** | Defined by the total 18-cell table, §12.1 |
| `numerous` / `黨眾` / `助寡` | several | **B** | 徐樂吾's own comparison, retained transparently per §3.5, with the occurrence LIST emitted |
| `重重` / `疊疊` | 2 | **B + DEOKBUNI_OPERATIONALIZATION** | Source-stated, unquantified; operationalized in the open as "two or more" (§3.5, §10.1) |
| `絕無一毫` | 3 | **B + DEOKBUNI_OPERATIONALIZATION** | Source-stated; **scope** disclosed as visible + 본기 (§10.1 從强) |
| `食傷多也` / `滿局` | 2 | **D** | DEFERRED — not operationalized; caps 從兒 at `CANDIDATE_ONLY_IN_V1` (§10.6) |
| `intact` / `unmodified` | several | **A** | §8.10's three-state model, each state with one named consumer |
| `destroyed` / `weakened` (root) | meta only | **D** | **States deleted** (§8.10); remaining occurrences record the deletion |
| `neutralized` | few | **C** | Narrative only; no rule branches on it |
| `moderate` / `significant` / `material` | few | **C** | Narrative prose in explanatory passages; no rule branches on them |
| `overwhelming` / `strong enough` | 0 | — | Absent |

**`E` count = 0.** No term carries runtime authority without a definition in this document.

### 23.2 Two-independent-implementers test

Two developers are given this document, the source matrix, the implementation-gap register, and the fact
foundation contract. They may not invent doctrine. Would both derive materially the same branching logic?

| Subsystem | Verdict | Basis / residual risk |
|---|---|---|
| **Relation outcome** | **YES** | §8.9 is a status table plus one conservative default. Every mechanism is `SUPPORTED` / `SUPPORTED_WITH_CONDITIONS` / `UNRESOLVED` / `DEFERRED`, and unsupported ⇒ `UNRESOLVED` is total. There is nothing to interpret |
| **Root integrity** | **YES** | Three states, each with an enumerated entry condition over deterministic facts, each with exactly one named consumer (§8.10) |
| **Special pattern** | **PARTIAL** | 從旺/從强/專旺/從財/從官殺 are decidable — every premise is an existence, absence, uniqueness, or configuration test. **Residual risk on two disclosed operationalizations**: 重重/疊疊 = "two or more", and 絕無一毫 scoped to visible + 본기. Both are printed, so two implementers reading this document converge; two implementers reading only the *sources* would not. That is why they are labelled `DEOKBUNI_OPERATIONALIZATION` rather than presented as classical. 從兒 is `CANDIDATE_ONLY_IN_V1`, which both implementers would reach identically |
| **Stage 1 (WEAK/BALANCED/STRONG)** | **YES** | §12.1 is a total 18-cell lookup table. No formula, no interpretation, no unassigned cell |
| **Uncertainty** | **PARTIAL** | The *triggers* are explicit (cells #3/#5, rows 13–18, `UNRESOLVED` relations, `DOCTRINE_CONFLICT`). What remains under-specified is whether one `INSUFFICIENT_STRUCTURAL_EVIDENCE` state may carry three distinct kinds of unknown (boundary sensitivity, faction tie, relation unresolved) or whether they must be distinguished. **Recorded as an open inference-design question**, not silently merged |
| **Seven-band rendering** | **YES** | §12.3 is a 7-row pure mapping from Stage 2. It reads no facts and cannot change a verdict |

**No load-bearing subsystem is `NO`.** The two `PARTIAL`s are both *disclosed* rather than latent: one is a
pair of printed operationalizations, the other is a named open question about uncertainty granularity.

### 23.3 No-hidden-scoring final policy (binding)

**ALLOWED:** transparent counts emitted as inspectable lists · source-backed qualitative numerousness
comparison where the selected source reasons that way · finite categorical states with enumerated entry
conditions · explicit decision tables/graphs with every cell written out · uncertainty exits.

**FORBIDDEN:** weighted additive scores · secret weights · arbitrary percentages · hidden numeric cutoffs ·
count comparison as the **sole** authority for a verdict · score bands presented as classical doctrine.

A numeric cutoff may be adopted **only** as `DEOKBUNI_OPERATIONALIZATION`, **only** where the source states a
concept it never quantifies, and **only** with the chosen value printed in this document. Two such cutoffs
exist in V1.3, both in §10.1 從强, both listed in §23.1.
