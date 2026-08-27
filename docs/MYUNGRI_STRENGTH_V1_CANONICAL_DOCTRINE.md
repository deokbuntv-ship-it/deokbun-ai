# MYUNGRI_STRENGTH_V1.2 — Canonical Doctrine Specification (Second Independent-Audit Remediation)

> **STATUS: DOCTRINE PHASE ONLY.** No runtime strength code is implemented or approved by this document.
> No Yongshin logic is implemented or approved. The frozen deterministic reasoning kernel and the frozen
> Myungri calculation layer are **untouched** by this document.

Base commit: `abc8b281d48a59e21906590bccdd0ef880943cdd` (V1.1); V1.2 remediation applied on
`4d98ec1bd938d16be5295cd708981d40b9a251be`. Companion documents:
`MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md`, `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`.

> ## ⚠️ V1.2 STATUS NOTICE — READ BEFORE USING THIS DOCUMENT
>
> A second independent audit classified V1.1 as `DOCTRINE_NOT_READY` on four findings (D1–D4). This
> revision closes **D1 in full** and makes disclosed, partial progress on D2–D4. It does **not** declare
> the doctrine ready.
>
> **D1 (從兒 materially wrong) — CLOSED.** §10.1's 從兒格 entry is rewritten from its governing
> ORIGINAL_TEXT verse. See §0's V1.2 table.
>
> **D2/D3/D4 — REMAIN OPEN, and one of them may be unclosable.** The central finding of this pass is
> stated here rather than buried: 徐樂吾's own definition of the strength axes is
> 「大致得時為旺，失時為衰；黨眾為強，助寡為弱」 — the second axis is explicitly **NUMEROUSNESS**
> (黨眾/助寡). Since this project forbids counting, magnitude, and threshold rules as decision authority,
> **that axis is not executable**, and every seven-band boundary contract in §12.2 depends on it (via
> §7.3's never-defined WEAK/MODERATE/STRONG "effective force" gate). Independently, 子平真詮 ch.6
> 「論十干得時不旺失時不弱」 forbids projecting a verdict from the seasonal axis alone. The honest
> consequence is that **the ordinary seven-band strength verdict is not currently derivable from the
> adopted sources under this project's own no-scoring constraint.**
>
> Accordingly: **no part of §12 may be implemented as runtime code on the strength of this revision.**
> §12's remediation is tracked as an open `P0_DOCTRINE_GAP` in `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`,
> not as closed. `STRENGTH_REASONER_IMPLEMENTATION_ALLOWED = NO` continues to hold.

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
| 2. Seven-band boundaries not reconstructable | Every boundary in §12.2 rewritten as a DECISION CONTRACT (required conditions / counterevidence / uncertainty conditions / special-pattern interaction / insufficiency examples) — no boundary is defined by an undefined term like "clearly dominant" without a structural predicate. |
| 3. Structural caps contradict band definitions | Both caps **removed**. §6.2 already held that floating (rootless) support is "not zero" — an absolute cap forbidding a rootless DM from *ever* reaching a strong band contradicted that claim. Replaced with DISQUALIFYING/LIMITING EVIDENCE (§12.3) that participates in the ordinary A–H reasoning, not a bolt-on ceiling/floor. |
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

## 0.2 V1.2 Second-Audit Remediation (D1–D4)

| Audit finding | Status | What changed |
|---|---|---|
| **D1. 從兒 doctrine materially wrong / overconstrained** | **CLOSED** | §10.1's 從兒格 entry rewritten from its own governing ORIGINAL_TEXT verse (滴天髓 順局). Three V1.1 errors corrected: (a) the **"DM exhaustively rootless" precondition is DELETED** — 「從兒不管身強弱」 states Day-Master strength is expressly *not* the governing question; (b) the **比劫 disqualifier is DELETED in all directions** — 任鐵樵: 「不論身強弱者，四柱雖有比劫仍去生助食傷也」 (比劫 may remain precisely because they feed 食傷). These two were the same error stated twice, since a branch rooting a 比/劫 necessarily roots the DM's own element under §5.1; (c) the condition 任鐵樵 marks **必要 was missing entirely** — 月令 must carry 食傷 (「必要食傷在提綱也」), now added. The 財-outlet condition is **retained and upgraded** from a weakly-sourced "extra" to ORIGINAL_TEXT (「只要吾兒又得兒」 + 任鐵樵 「必要局中有財」). The pattern's SOURCE grade is corrected from `SOURCE_CLASS_C` "thinnest-grounded of the four" to ORIGINAL_TEXT + NAMED_COMMENTARY — it is in fact the **best**-sourced pattern in the cluster. The unsourced "zero borderline flags" strictness bar is deleted. |
| **D2. 從旺/從强 need source-by-source reconciliation** | **OPEN** | Not closed in this revision. A predicate×source reconciliation table is required (rows: formation condition / 印 / 財 / 官殺 / 食傷 / 月令 / residual root / opposing qi; columns: 滴天髓 verse, 原注, 任鐵樵, 子平真詮, 徐樂吾, 淵海子平, 三命通會, modern). 淵海子平's and 三命通會's own 從旺/從强 material remains **unretrieved** — recorded honestly rather than filled by inference. Tracked as `P0_DOCTRINE_GAP`. |
| **D3. Seven-band boundaries not executable** | **OPEN — and possibly unclosable** | See the status notice above. §7.3's WEAK/MODERATE/STRONG "effective force" ordinal is **unsourced** and is the sole authority for four of the six band boundaries; "decisive tilt" carries the other two and §12.2 itself concedes it is irreducible judgment. The sourced replacement axis (徐樂吾's 黨眾為強) is **numerousness-based and therefore forbidden here**. `得令/得地/得勢` was investigated as an alternative backbone and **rejected**: it is not an attested classical triple, and the citation circulating in its support did not survive verification. No substitute has been found that is simultaneously sourced, threshold-free, and decisive. Tracked as `P0_DOCTRINE_GAP`. |
| **D4. Relation/root-damage predicates not operational** | **PARTIALLY OPEN** | §8.4/§17's `DESTROYED` root state is **not** established as a categorical outcome by the sources, which treat 沖 severity contextually throughout; 「沖 detected → root destroyed」 remains forbidden as a direct rule (unchanged from V1.1) and the `DESTROYED` label itself is now flagged for removal-or-deferral pending the D4 close. Tracked as `P0_DOCTRINE_GAP`. |

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
score, a vote, or an absolute cap (§12.3)
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
FINAL STRENGTH VERDICT, subject to DISQUALIFYING/LIMITING EVIDENCE (§12.3)
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
self-contradictory (§0, §12.3) — retained here unchanged, with the caps now removed instead of the doctrine
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

### 7.3 Presence vs. effective force — symmetric to opposition

**TEXT_LAYER:** SOURCE_CLASS_B (窮通寶鑑, 調候派, for the seasonal-vitality-as-gate principle) / SOURCE_CLASS_B
(滴천수, 病藥 framework). **RUNTIME_AUTHORITY:** BINDING for the principle that presence ≠ effective force,
applied symmetrically to both DM-support and opposition. **CONFLICTS:** none doctrinal; the risk is
implementational (conflating 조후-utility with 강약-strength — guarded against per §9).

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
§12.3) produced an internal contradiction.

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
(§10.5), graded, not a hard veto. This is DISQUALIFYING/LIMITING EVIDENCE (matching §11/§12.3's general
replacement of hard caps), not a bolt-on universal short circuit — and it directly fixes the gate-order
contradiction the audit also flagged (§11 below): the gate no longer needs its own separate fact-gathering
pass, because it consumes the SAME finalized (post-F) B/C/D/E facts the ordinary model already computed.

**眞從 vs 假從 remains a real spectrum** (SOURCE_CLASS_C — commonly-taught distinction, not tied to one
precisely citable passage): 眞從 = a candidate disqualifying element is confirmed functionally absent/
neutralized across the whole exhaustive scan; 假從 = a disqualifying element retains marginal, contested, or
partially-neutralized standing. This spectrum is the doctrinal basis for the three-state (now four-state,
see below) output, not a binary.

**Structural definition of "dominant force" (used throughout §10.1 — required by §21's no-hidden-threshold
discipline):** every §10.1 pattern's MINIMUM POSITIVE CONDITIONS names a "dominant force." This is **not** a
separate ratio/percentage test layered on top of §10.0's disqualifier mechanism — it is **defined BY that
mechanism, by elimination:** a candidate force is "dominant" for gate purposes if and only if (a) it is itself
functionally intact per §5/§7/§8 (rooted-or-generated, seasonally live or not clash-destroyed), AND (b) the
exhaustive scan (§10.0) finds **no other functionally-intact competing force** anywhere in the chart for the
role that pattern's DISQUALIFYING CONDITIONS name. Whatever functionally-intact presence exists for the
claimed direction is, by this elimination test, uncontested — and therefore "dominant" in the only sense this
gate operationalizes. This is explicitly **not** a magnitude/count/ratio threshold (no "N of 8 slots," no
"majority of visible stems") — a chart with even a single functionally-intact instance of the claimed force,
and zero functionally-intact competitors, satisfies "dominant force" under this definition. Where a pattern's
own conditions additionally require multiple positions (e.g. 專旺's completed §8.3 harmony set, which is a
DETECTION/FORMATION fact, not a magnitude judgment), that requirement is stated in that pattern's own entry
and does not rely on this elimination-based "dominant" definition for its multi-position aspect.

### 10.1 Per-pattern rebuild — no homogeneous "從弱 family"

**V1.1 correction:** V1 treated 從財格/從官殺格/從兒格 as one "從弱 family" sharing entry/disqualifier
conditions with only per-subtype additions layered on top. **The audit found this treats a shared category as
though a specific school explicitly organizes it that way; no single adopted source is cited establishing
that shared-scaffold structure as such.** Each pattern below is now specified independently, with its own
SOURCE LINEAGE, and shared language between patterns is stated only where the *same* source material
genuinely supports the same claim for each — not assumed by category membership.

#### 從旺格 (Follow-Prosperous — DM's own element is itself the dominant, near-total force)

- **SOURCE LINEAGE:** SOURCE_CLASS_B, 從象 doctrine as developed in 滴天髓 commentary tradition (특히 任鐵樵),
  later systematized (徐樂吾-lineage naming conventions). 子평真詮 does not use this vocabulary — its own
  method does not carve out this named pattern separately, which is itself recorded as a school difference,
  not silently smoothed over.
- **MINIMUM POSITIVE CONDITIONS:** DM's own element (via 비겁, not 인성-generated — see 從强 below for the
  generated-support variant) constitutes the composition's dominant force across visible stems and
  functionally-intact roots (§5/§8); 월령 seasonally aligned with the DM's own element or neutral-to-favorable
  toward it.
- **DISQUALIFYING CONDITIONS:** a functionally-intact rooted controlling (克) or draining (洩/剋 via 官殺/財/
  食傷) element anywhere, per §10.0's corrected mechanism — not mere presence.
- **WEAK/RESIDUAL ROOT POLICY:** a disqualifying candidate present only as a 餘氣-tier, seasonally-dead,
  clash-damaged root does not by itself disqualify — it is evidence toward 假從/`CANDIDATE_UNCONFIRMED`
  (§10.0), not an automatic veto and not a silent pass either.
- **眞假從 POLICY:** as §10.0.
- **AMBIGUOUS CASE POLICY:** where the functional-integrity read of a candidate disqualifier is itself
  genuinely contested (e.g. a clash-mediation call that could reasonably go either way), output
  `DOCTRINE_CONFLICT`, not a forced resolution.
- **SCHOOL CONFLICT:** 子평真詮's silence on this named pattern vs. 滴천수-descended lineages' active use of it
  is a real, named school difference — not resolved here, both positions recorded.
- **SOFTWARE STATUS:** `NOT_QUALIFIED` / `CANDIDATE_UNCONFIRMED` / `CONFIRMED` / `DOCTRINE_CONFLICT`.

#### 從强格 (Follow-Strong — DM's own element + its generating element together dominate)

- **SOURCE LINEAGE:** SOURCE_CLASS_B, same 滴천수/任鐵樵-descended lineage as 從旺; **where the adopted school
  actually distinguishes 從强 from 從旺** (some lineages treat 從强 as the broader category encompassing 從旺
  as a sub-case where 비겁 alone, without 인성, dominates; others use the two terms closer to
  interchangeably) — **this distinction is itself SCHOOL_DEPENDENT and is recorded as such, not silently
  resolved.**
- **MINIMUM POSITIVE CONDITIONS:** DM's own element + generating element (比劫+印星 combined) constitute the
  composition's dominant, functionally-intact force; 월령 favorable or neutral.
- **DISQUALIFYING CONDITIONS:** same corrected mechanism as 從旺 (§10.0) — a functionally-intact rooted 財 or
  官殺.
- **WEAK/RESIDUAL ROOT POLICY, 眞假從 POLICY, AMBIGUOUS CASE POLICY:** as 從旺.
- **SCHOOL CONFLICT:** the 從强-vs-從旺 boundary itself (above); also, whether 印星 dominant with 비겁 nearly
  absent (or the reverse) still qualifies as 從强 is genuinely school-variable.
- **SOFTWARE STATUS:** four-state, as above.

#### 從財格 (Follow-Wealth)

- **SOURCE LINEAGE:** SOURCE_CLASS_B/C, 滴천수-era 從 concepts as elaborated in later systematizing scholarship.
- **MINIMUM POSITIVE CONDITIONS:** DM has **no functionally-intact root or generating support** anywhere
  (exhaustive scan, per §10.0 — not merely "appears rootless"); dominant force is specifically 財星 (± its
  generator 食傷), 월령 aligned with 財's season or the season of its generator.
- **DISQUALIFYING CONDITIONS:** a functionally-intact rooted 比劫 or 印星 (reintroduces a viable alternative
  for the DM, per §10.0). A chart with BOTH strong, functionally-intact 財 AND strong, functionally-intact
  官殺 alongside an otherwise-qualifying rootless DM is a **genuinely disputed configuration** — some schools
  read it as one continuous 財生官 flow still qualifying; others treat the two simultaneous dominant forces
  as structurally competing and disqualifying. **V1.1 does not resolve this by default; it is
  SCHOOL_DEPENDENT and routes to `DOCTRINE_CONFLICT` when the configuration is clean enough to reach this
  question at all**, rather than V1's prior silent conservative default.
- **WEAK/RESIDUAL ROOT POLICY:** as §10.0.
- **眞假從 POLICY:** as §10.0.
- **AMBIGUOUS CASE POLICY:** as above; the 財+官殺-both-present case specifically routes to `DOCTRINE_CONFLICT`.
- **SCHOOL CONFLICT:** named above.
- **SOFTWARE STATUS:** four-state.

#### 從官殺格 (從殺格, Follow-Officer/Killing)

- **SOURCE LINEAGE:** SOURCE_CLASS_B/C, same lineage as 從財; relatively more confidently and consistently
  attested across secondary literature than 從兒 (below).
- **MINIMUM POSITIVE CONDITIONS:** DM exhaustively rootless (§10.0); dominant force is 官殺 (± its generator
  財), 월령 aligned.
- **DISQUALIFYING CONDITIONS:** functionally-intact rooted 比劫/印星 (as 從財); **additionally, a
  functionally-intact rooted 食傷** — 食傷 directly controls 官殺 (食傷剋官殺), so its functional presence
  means the chart is not helplessly submitting, which contradicts this pattern's own defining premise. Per
  §10.0, this is evaluated for functional integrity, not mere presence — a nominally-present but
  clash-neutralized 食傷 does not by itself disqualify.
- **WEAK/RESIDUAL ROOT POLICY, 眞假從 POLICY, AMBIGUOUS CASE POLICY:** as §10.0.
- **SCHOOL CONFLICT:** none major beyond the general 從財/從兒-adjacent disputes already named.
- **SOFTWARE STATUS:** four-state.

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

#### 專旺格/전왕격 (曲直/炎上/稼穡/從革/潤下)

- **SOURCE LINEAGE:** SOURCE_CLASS_C — named mono-element structures widely attested in later systematizing
  命理 scholarship building on classical 子평 fundamentals; a narrower, stricter case than 從强/從旺 (requires
  near-total mono-element composition of the DM's OWN element specifically, typically via a completed §8.3
  삼합/방합, not merely "DM+resource together dominate").
- **MINIMUM POSITIVE CONDITIONS:** DM's own element forms a completed (per §8.3's FORMATION/VALIDITY
  standard — full trio, not a bare 半합) 삼합 or 방합 across three or more branch positions; visible stems
  consistent with (same as, or generating) the dominant element; 월령 squarely the matching season (treated
  as closer to mandatory here than for 從强/從旺, since each of the five named patterns is explicitly
  season-anchored: 曲直=spring/Wood, 炎上=summer/Fire, 稼穡=辰戌丑未/Earth-peak, 從革=autumn/Metal,
  潤下=winter/Water); no functionally-intact rooted controlling (克) element anywhere.
- **DISQUALIFYING CONDITIONS:** a functionally-intact rooted controlling element (per §10.0's corrected
  mechanism — the most commonly cited breaker for 專旺); a clash/combination that breaks up the completed
  trio/directional set itself (per §8.3/§8.4 — this is now evaluated via the SAME formation-validity/
  functional-effect questions, not a separate rule); 월령 misaligned with the claimed dominant season.
- **WEAK/RESIDUAL ROOT POLICY:** an unrooted transparent controlling stem present is evidence toward
  `CANDIDATE_UNCONFIRMED`, per §10.0, school-variable on exact weight.
- **眞假從 POLICY:** N/A in the same sense (專旺 is about the DM's own dominance, not the DM submitting to an
  opposing force) — the analogous spectrum here is "clean completed set" vs. "partial/contested set," see
  below.
- **AMBIGUOUS CASE POLICY:** a partial (2-of-3) harmony set does **not** qualify for 專旺 under §8.3's
  FORMATION/VALIDITY standard — this is not an ambiguous case, it is a clean `NOT_QUALIFIED` for 專旺
  specifically (the chart likely still reads strongly on the ordinary axis, via §5/§6, independently). A
  月령 in a transitional/boundary period (§4.2's boundary-sensitivity flag) genuinely IS ambiguous →
  `CANDIDATE_UNCONFIRMED`, not silently resolved either way.
- **SCHOOL CONFLICT:** none major on the pattern's existence; the completed-set standard itself inherits
  §8.3's 방합-vs-三합 ranking dispute where relevant.
- **SOFTWARE STATUS:** four-state.

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

### 10.6 REACHABILITY DISCLOSURE — mandatory, new in V1.2

A four-state output whose `CONFIRMED` state no real chart can ever reach is a **three-state output wearing a
four-state label**. V1.1 shipped exactly that for 從兒 without noticing. Every pattern entry in §10.1 must
therefore carry an explicit **REACHABILITY** field naming which of the four output states a real chart can
actually attain, and any future edit to a pattern's conditions must re-derive it.

Two structural facts currently suppress `CONFIRMED` across this gate:

1. **Unquantifiable required conditions.** Where a source states a condition but never quantifies it
   (食傷多也, 滿局, 重重, 疊疊, 根深, 不雜, 黨眾), §0.2's method note caps the pattern at
   `CANDIDATE_UNCONFIRMED`. Any pattern with such a condition among its MINIMUM POSITIVE CONDITIONS cannot
   reach `CONFIRMED` until that condition is either sourced with a real decision procedure or formally
   dropped by an owner decision.
2. **The P0-2 dependency.** Every pattern's disqualifier set is evaluated through §10.0's
   functional-integrity mechanism, which routes into §8's clash/combination severity grading. That grading
   is marked `CONDITIONAL` in this document and **is not implemented**. Until it lands, no `CONFIRMED`
   verdict from this gate is trustworthy even where it is formally reachable.

| Pattern | Reachable states (V1.2) |
|---|---|
| 從兒格 | `NOT_QUALIFIED` · `CANDIDATE_UNCONFIRMED` · `DOCTRINE_CONFLICT` — **`CONFIRMED` unreachable** (食傷 multiplicity is required-but-unquantifiable) |
| 從旺格 / 從强格 / 從財格 / 從官殺格 / 專旺격 | **NOT YET DERIVED** — pending the D2 reconciliation (§0.2). These five entries still carry V1.1's "dominant force" / "near-total force" language, which is the same unsourced magnitude construct as the deleted "decisive tilt" (§12.2) and must be removed or sourced before their reachability can be honestly stated. **Do not implement any of these five gates on the strength of this revision.** |

**Consequence, stated plainly:** the special-structure gate cannot presently confirm any pattern. That is a
disclosed limitation of the available doctrine under this project's no-invented-thresholds rule, not a bug
to be patched by relaxing the rule.

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
   output category, out of this document's scope to design further — §12.4).

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

## 12. Seven-band classification — REVISED (audit findings 2, 3)

### 12.0 Explicit relabeling (brief §12)

**The seven bands are DEOKBUNI LEVEL-C / SOURCE_CLASS_D PRODUCT OPERATIONALIZATION, not a classical
seven-category taxonomy.** Classical sources discuss strength on a spectrum with named extremes (신강/신약
and 中和/balance are genuinely classical vocabulary), but the specific **seven-way** subdivision with two
intensity levels inside each of the strong/weak wings is this project's own rendering choice for product
purposes, not a claim that 子평真詮/滴천수/등 themselves enumerate exactly these seven labels as a fixed
taxonomy. This is stated explicitly here and is retained **only** because each adjacent boundary below can be
defined without hidden scoring (§12.2) — if a future revision cannot maintain that property, the seven-band
rendering itself should be reconsidered, not patched with an undefined term.

### 12.1 Three-stage structure (unchanged from V1 — restated per brief §13)

- **Stage 1** (WEAK/BALANCED/STRONG structural family) — the sign of Step H's synthesis, or the routed output
  of a CONFIRMED special structure (§12.4).
- **Stage 2** (within-family intensity) — not a magnitude score; the qualitative question of how decisive the
  tilt is.
- **Stage 3** (seven-band product rendering) — a **renderer over the richer Stage 1/2 structural verdict, not
  a separate doctrine engine** (brief §13's explicit requirement). The internal structural state (Steps A–H's
  full evidence trail, §14) must contain enough evidence that the seven-band label is reconstructable from it
  — the label is never computed independently of, or prior to, that evidence trail.

### 12.2 Adjacent-pair DECISION CONTRACTS (rewritten per brief §12 — no undefined terms as sole authority)

Each boundary below replaces V1's prose (which used terms like "clearly dominant," "decisive tilt,"
"genuinely functional," and "outmatched" as the *entire* decision rule) with an explicit contract. Where a
term like "functionally intact" or "seasonally vital" is used, it refers to the **already-defined** structural
predicates from §5 (root existence/tier/vitality/survival), §6 (support rootedness/proximity/combination
state), §7 (opposition presence/effective-force gate), and §8 (relation formation/transformation/functional
effect) — not to a new undefined term. Where no such prior definition exists for a term this document would
otherwise need, that term is marked `NON_EXECUTABLE / REQUIRES_FURTHER_DOCTRINE` rather than used as though it
were self-evident (§21).

**On "decisive tilt" specifically (§22 item 12 cross-reference):** several contracts below reference whether
Step H's synthesis reaches a "decisive tilt." This is **not** a hidden numeric threshold — it is the ONE
place this document deliberately retains genuine, disclosed qualitative synthesis, by design, matching the
classical grounding §11.0 argues for (子평真詮/滴천수's own method is explicitly NOT reducible to summing
commensurable factors). The distinction that matters: a HIDDEN threshold is an undisclosed rule dressed up in
prose that a developer would have to reverse-engineer or guess at. Step H's synthesis is the opposite — it is
**explicitly named as the locus of irreducible judgment**, constrained by everything upstream (A's seasonal
prior; B–F's finalized, individually-defined structural facts) and required to report HONESTLY when it does
not resolve (feeding `중화`/`STRENGTH_BORDERLINE`, §13, rather than forcing a tie-break). Two independent
implementers given the same finalized B–F facts are expected to converge on the same STRUCTURAL CONDITIONS
verdicts (§12.2's contracts are fully executable for those), and are expected to converge on the same
UNCERTAINTY-vs-CONFIDENT classification (a genuinely close call is discoverable from the same upstream facts
by any competent implementer) — what is not mechanically guaranteed to converge, by the doctrine's own
design, is a forced single answer on a chart where the sourced method itself does not produce one; the
doctrine's answer in that case is to report the uncertainty, not to fabricate agreement.

**극신약 vs. 신약**

- REQUIRED STRUCTURAL CONDITIONS (극신약): zero candidates pass §5's root-existence test with post-§8
  functional survival (i.e., every candidate root found in B either did not exist, or was found DESTROYED/
  fully diverted by F); no §6-qualifying support stem passes §7.3's effective-force gate at even a MODERATE
  ordinal level; §10's gate returns `NOT_QUALIFIED` for every 從弱-family pattern (i.e., this is NOT itself a
  confirmed special structure — see §12.4 for why 극신약-as-ordinary-band and 從弱-as-special-structure are
  different verdict categories).
- COUNTEREVIDENCE THAT PREVENTS 극신약 (→ 신약 instead): **any** single candidate root or support stem
  surviving F at even a WEAK ordinal §7.3 level, even at a 여기 tier or seasonally-disadvantaged position —
  this is the corrected replacement for V1's removed Cap 1 (§12.3): rootlessness is not an absolute cap
  producing a separate impossible-to-exit state, it is the literal REQUIRED CONDITION for 극신약 specifically,
  stated as a positive contract rather than a prohibition on the opposite band.
- UNCERTAINTY CONDITIONS: if F's clash/combination-integrity read on the sole remaining candidate is itself
  contested (a mediation call that could reasonably go either way) → `STRENGTH_BORDERLINE`, not a forced
  choice between the two bands.
- SPECIAL-PATTERN INTERACTION: if §10 returns `CANDIDATE_UNCONFIRMED` or `DOCTRINE_CONFLICT` for a 從弱-family
  pattern on this same chart, the ordinary-model band (극신약 or 신약) may still be reported per §11.1 step 6,
  but WITH the special-pattern uncertainty flagged alongside it, never silently suppressed.
- EXAMPLES OF WHAT IS NOT SUFFICIENT: a chart with several candidate roots that are ALL destroyed by F is
  still 극신약-eligible (destroyed roots do not count as surviving evidence) — raw candidate COUNT before F's
  integrity check is never sufficient on its own, only post-F survival counts.

**신약 vs. 중화신약**

- REQUIRED STRUCTURAL CONDITIONS (신약): at least one candidate passes §7.3's effective-force gate at WEAK-to-
  MODERATE ordinal level on the DM's own side (§5/§6), while the opposition side (§7/§8) has at least one
  candidate passing at MODERATE-or-higher, AND no single DM-side candidate reaches STRONG.
- COUNTEREVIDENCE THAT PREVENTS 신약 (→ 중화신약 instead): a DM-side candidate reaching STRONG ordinal level
  post-F (an in-season-or-정기-layer root/support surviving intact), OR the opposition's candidates being
  dispersed across multiple different §7.1 categories (食傷/財/官殺) rather than concentrated in one — per
  §7.1's own distinction, a dispersed opposing force is weighed differently from a concentrated one of
  equivalent raw presence, consistent with the anti-additive principle (§11.0).
- UNCERTAINTY CONDITIONS: if the DM-side candidate's ordinal grade (WEAK vs. MODERATE) is itself a close call
  under §7.3's own criteria → `STRENGTH_BORDERLINE`.
- SPECIAL-PATTERN INTERACTION: same as above.
- EXAMPLES OF WHAT IS NOT SUFFICIENT: a DM-side candidate that is merely PRESENT (pre-§7.3 gate) does not
  count — it must have passed the effective-force gate at the stated ordinal level.

**중화신약 vs. 중화**

- REQUIRED STRUCTURAL CONDITIONS (중화신약): the qualitative comparison across A (seasonal prior), the DM-side
  candidate set (post-E/F), and the opposition candidate set (post-E/F) still tips to opposition when all
  three are weighed together per Step H (§11) — not summed, weighed as the sequenced synthesis §11.0 requires.
- COUNTEREVIDENCE THAT PREVENTS 중화신약 (→ 중화 instead): no single one of A/DM-side/opposition-side produces
  a decisive tilt in Step H's synthesis — i.e., Step H itself, applying its own sourced method (子평真詮/滴천수,
  §11.0), reaches a genuine indeterminate reading, not merely "the numbers are close" (there are no numbers
  to be close — indeterminacy here means the QUALITATIVE synthesis itself does not resolve, which Step H must
  be able to report honestly rather than force a tie-break).
- UNCERTAINTY CONDITIONS: 중화 frequently co-occurs with `STRENGTH_BORDERLINE` (§13) — this is expected and
  correct, not a failure state; a chart can be genuinely 중화 with confidence (all evidence points to balance)
  or 중화 with borderline uncertainty (the evidence is too thin/contested to be sure which way, if any, it
  tips) — both are valid, distinguished by the CONFIDENCE field (§14), not by a different band.
- SPECIAL-PATTERN INTERACTION: same as above (though 중화 charts are the least likely to have qualified for
  any 從-pattern, since 從-patterns require an exhaustive rootless/dominant premise that a balanced chart by
  definition does not have).
- EXAMPLES OF WHAT IS NOT SUFFICIENT: "the chart has roughly equal support and opposition candidates by
  count" is explicitly NOT the decision rule — count is never the decision rule anywhere in this document;
  중화 is reached (or not) by Step H's qualitative synthesis, which may or may not correlate with raw counts
  looking balanced.

**중화 vs. 중화신강 / 중화신강 vs. 신강 / 신강 vs. 극신강**

Exact mirror images of 중화신약/신약/극신약 above, with DM-side and opposition-side swapped. Restated in full
rather than left implicit, per §21's instruction against relying on an unstated "mirror" without executable
content:

- **중화 vs. 중화신강:** REQUIRED (중화신강): qualitative tilt in Step H favors the DM's own side, weighed as
  above. COUNTEREVIDENCE (→ 중화): no decisive tilt either way. UNCERTAINTY: same BORDERLINE co-occurrence
  logic. EXAMPLES NOT SUFFICIENT: raw count comparisons.
- **중화신강 vs. 신강:** REQUIRED (신강): a DM-side candidate reaches STRONG post-F, opposition candidates
  remain at WEAK-to-MODERATE with none reaching STRONG. COUNTEREVIDENCE (→ 중화신강 instead, i.e. NOT yet
  신강): an opposition candidate also reaching STRONG post-F, or the DM-side's STRONG candidate being itself
  contested by an unresolved F-layer integrity question. UNCERTAINTY: `STRENGTH_BORDERLINE` on a contested
  F-call. SPECIAL-PATTERN INTERACTION: as above. EXAMPLES NOT SUFFICIENT: mere presence without the §7.3
  ordinal grade.
- **신강 vs. 극신강:** REQUIRED (극신강): **every** opposition candidate fails §7.3's effective-force gate
  post-F (none reach even WEAK) or is cancelled outright by F — the mirror of 극신약's "zero surviving DM-side
  candidates" contract, stated positively: zero surviving opposition candidates. COUNTEREVIDENCE (→ 신강
  instead): any single opposition candidate surviving F at even WEAK ordinal level. UNCERTAINTY: contested
  F-call on the sole remaining opposition candidate → `STRENGTH_BORDERLINE`. SPECIAL-PATTERN INTERACTION: if
  §10 returns anything other than `NOT_QUALIFIED` for 從强/從旺/專旺 on this chart, that is flagged alongside
  (§12.4 — these are DIFFERENT verdict categories, not automatically the same claim, see §14 below).
  EXAMPLES NOT SUFFICIENT: opposition candidates that are merely outnumbered, rather than failing the
  effective-force gate, do not qualify the chart for 극신강 — a single functionally STRONG opposition
  candidate, however outnumbered by DM-side candidates, keeps the chart at 신강, not 극신강.

### 12.3 Structural caps REMOVED — replaced by disqualifying/limiting evidence (audit finding 3)

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
positive REQUIRED CONDITIONS and COUNTEREVIDENCE fields of §12.2's own boundary contracts (e.g. 극신약's
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
instruction) — it participates in the same Step H synthesis as everything else, expressed through §12.2's
contracts rather than as a separate override layer.

### 12.4 Extreme bands vs. special patterns — explicitly separated (audit finding, brief §14)

**극신약/극신강 (ordinary-model extreme bands) are NOT the same claim as a CONFIRMED special structure**, and
must never be conflated:

- An **ordinary-model 극신약** chart (§12.2's contract: zero surviving DM-side candidates) is reached through
  Step H's normal weighing and remains an ORDINARY seven-band label — it does **not** imply 從財/從官殺/從兒
  are automatically CONFIRMED. Those patterns have their own independently-evaluated positive conditions
  (§10.1) that an ordinary-model 극신약 chart may or may not also satisfy.
- An **ordinary-model 극신강** chart similarly does not imply 從强/從旺/專旺 are automatically CONFIRMED — 專旺
  specifically requires a completed §8.3 harmony set, which an ordinary-model 극신강 chart (reached merely by
  every opposition candidate failing §7.3's gate) may not have at all.
- Conversely, a chart where §10's gate returns `CONFIRMED` for a special pattern **does not receive an
  ordinary-model seven-band label at all** — per §12.4's own routing (§11.1 step 4), it receives the
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
| **STRENGTH_BORDERLINE** | Same-method evidence genuinely close per §12.2's own UNCERTAINTY CONDITIONS fields (a contested F-layer integrity call; a DM-side candidate's ordinal grade sitting right at a §7.3 boundary). Output = an adjacent-pair range, never a forced single label. |
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

**VERDICT** (Step I): "중화신약 — per §12.2's contract, the DM retains one functional-but-seasonally-weakened
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
| 4 | Root present but functionally damaged | A same-stem root exists in an isolated branch that is then clashed with no mediation | Per §8.4, root graded WEAKENED/DESTROYED, not counted at full force in §5/§12.2's contracts | Root counted as fully functional because "root = +1" regardless of clash | §8.4 |
| 5 | Unrooted visible support | A visible 인성 stem with no root anywhere, distant column | Support graded FLOATING (§6.2) — contributes materially less than a rooted equivalent, but not zero | Support counted identically to a rooted 인성 in the same tally | §6.1, §6.2 |
| 6 | Strong output drain | Multiple rooted, seasonally-vital 食傷 stems, DM otherwise moderate | Verdict trends toward 신약/중화신약 if unmediated; 신강 with 食神制殺 usefulness noted separately (favorability axis) if a controlling 관살 is present that 食傷 checks | Output drain treated identically regardless of whether it is checking a real 관살 threat (conflating strength-axis and favorability-axis, §7.4) | §7.1, §7.4 |
| 7 | Strong officer pressure — REVISED per re-audit | Rooted, seasonally-vital 七殺 with no functionally-intact 食傷/印 mediation | Verdict trends 신약/중화신약 per §12.2's contract (opposition candidate reaches STRONG post-F); 七殺's unchecked-vs-正官 disposition is surfaced as a SEPARATE qualitative severity flag (§7.1) — the ORIGINAL case wording risked implying the disposition flag itself changes the strength magnitude, which §7.1 explicitly forbids; this revision makes the two claims (magnitude vs. disposition) textually distinct | 正官 and 七殺 treated as numerically different DRAIN MAGNITUDES (as opposed to different disposition/severity flags at equal magnitude) | §7.1 (explicit warning), §12.2 |
| 8 | Strong wealth burden | Multiple rooted 財 stems generating a rooted, functionally-intact 官殺 (財生官殺 chain) | Opposition faction tagged as reinforced/chained (§7.2), not three independent unrelated drains | 財 and its generated 官殺 counted as two unrelated, unlinked drain units | §7.2 |
| 9 | Balanced chart | Season mixed (相), one moderate functionally-surviving root, one moderate rooted support stem, one moderate rooted opposing stem, Step H's synthesis genuinely does not resolve a tilt | 중화, STRENGTH_BORDERLINE or STRENGTH_CONFIDENT depending on how cleanly Step H resolves | Forced into a definite one-sided band merely because the engine must output *something* precise | §12.2 (중화 contract), §13 |
| 10 | Near-balanced weak | Same as #9 but opposition has a slight, genuine post-F functional edge per Step H | 중화신약 | Forced all the way to 신약 or flattened to 중화 | §12.2 |
| 11 | Near-balanced strong | Mirror of #10 | 중화신강 | Forced to 신강 or flattened to 중화 | §12.2 |
| 12 | Apparent special-pattern candidate, rejected | DM appears rootless, but one 정기-tier functionally-intact root branch is found on exhaustive scan | `NOT_QUALIFIED` (the corrected §10.0 mechanism finds a functionally-surviving disqualifier) → ordinary model; likely 극신약/신약 depending on that root's own vitality/survival | Special-pattern verdict issued despite a functionally-intact disqualifying root | §10.0, §10.3 |
| 13 | Genuine special-pattern candidate | DM rootless on exhaustive scan, month and all branches dominated by one non-DM element, that element's own root-competitors are either absent or present-but-functionally-destroyed by F | `SPECIAL_PATTERN_CONFIRMED` (specific sub-type per §10.1) if EVERY sub-check independently clears through §10.0's mechanism | Ordinary seven-band label applied instead of the special-structure output category | §10.3, §12.4 |
| 14 | Disputed special-pattern boundary | DM rootless, dominant element aligned, but one branch carries only a 여기-tier root of the opposing element with genuinely contested clash status | `SPECIAL_PATTERN_UNCERTAIN` | Silently defaulting to either CONFIRMED or the ordinary ladder without flagging the near-miss | §10.0, §13 |
| 15 | Combination that does NOT transform | Two adjacent branches form a 六合 pair, but the transformed element lacks seasonal support and a third branch clashes one member | Tagged 합而不화 — FUNCTIONAL binding only (§8.2), original element's root function reduced but not erased | Root/support treated as having transformed into the new element | §8.2, TRANSFORMATION preconditions failing |
| 16 | Transformation candidate | Adjacent 干합 pair, transformed element seasonally supported, no breaking clash, non-DM stems | Tagged 합화 — STRUCTURAL transform (§8.1); downstream rooting/support re-evaluated against the new element | Transformation asserted from mere adjacency alone, ignoring seasonal-support/no-breaking-force preconditions | §8.1 |
| 17 | Clash affecting root | A 본기-tier root branch is clashed by an adjacent branch with no mediation and no reinforcement | Root tagged WEAKENED or DESTROYED (graded, per relative vitality of the two branches) | Uniform "root survives regardless of clash" or uniform "any clash = full destruction" without grading | §8.4 |
| 18 | Clash not destroying structural support | Same clash as #17, but a third branch combines with one clash member (貪合忘沖) | Root tagged MEDIATED — reduced but non-zero force | Root treated as fully destroyed, ignoring the mediating principle | §8.4 |
| 19 | Raw element count misleads | DM element appears 4 times across the 8 stem/branch slots (nominal high count), but all 4 occurrences are either 여기-tier hidden stems in seasonally-dead branches or floating unrooted stems | Verdict does NOT default to 신강 merely from the raw count; functional analysis (§5, §6) may still yield 신약/중화신약 | Raw element count used as a shortcut proxy for strength | §3 (concept #1), §5.1 |
| 20 | Hidden stems materially matter — REVISED per re-audit | DM has no visible same-element stem anywhere, but a 본기-tier hidden root exists in a functionally-intact, seasonally-vital branch | Root counted according to its own §5.2/§5.3/§8.4 layer-vitality-survival characteristics — on EQUAL ONTOLOGICAL FOOTING with a visible-stem root of comparable tier/vitality/survival, neither discounted merely for being hidden-only NOR asserted as an absolute "full functional weight" (V1's original wording), since this document does not use numeric "weight" at all | Hidden-stem roots discounted purely because they are "hidden"; OR a hidden root asserted at some absolute maximal weight independent of its own tier/vitality/survival facts | §5.1, §5.2, §12.2 |
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
    rejected; replaced by §12.2's positive boundary contracts and §12.3's disqualifying/limiting-evidence
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
6. Executable seven-band boundary contract — **DOCTRINE GAP, now closed by §12.2 of this revision.**

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
11. **(new) The 從强-vs-從旺 boundary** (§10.1) — whether these are genuinely distinct patterns or largely
    interchangeable naming is itself `SCHOOL_DEPENDENT`, not resolved here.
12. **(new) The exact ordinal threshold values for §7.3/§12.2's WEAK/MODERATE/STRONG effective-force scale**
    — this document specifies the EXISTENCE and STRUCTURAL ROLE of the ordinal scale (§7.3, §12.2) but does
    not, and per §21's no-hidden-thresholds discipline should not, specify exactly what distinguishes
    "WEAK" from "MODERATE" beyond the qualitative descriptions already given (in-season vs. out-of-season;
    which qi-tier; survived vs. weakened by F) — a future implementer must derive the exact boundary from
    those qualitative descriptions per-case, and if a genuinely executable line cannot be drawn for some
    specific comparison, that comparison should be marked `NON_EXECUTABLE / REQUIRES_FURTHER_DOCTRINE` at
    implementation time rather than assigned an invented number.
