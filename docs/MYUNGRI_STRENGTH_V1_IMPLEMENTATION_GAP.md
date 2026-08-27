# MYUNGRI_STRENGTH_V1 — Implementation Gap Analysis

> Companion to `MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md`. Answers: **what deterministic facts does the
> current engine still lack before canonical strength can be implemented safely?** No gap listed here is
> implemented in this phase — this document classifies and scopes only.

Audit method: full read of every file under `src/features/myungri/` (services, rules, domain, adapters) plus
the `src/features/interpretation` ten-god/hidden-stem/five-element functions Myungri consumes, plus
`src/features/divination/myungriStrength.ts`, cross-checked against `docs/MYUNGRI_V1_FREEZE.md` and
`docs/MYUNGRI_STRENGTH_V1.md`.

---

## P0 — BLOCKER (canonical strength reasoning cannot proceed without these)

### P0-1. Root/support-integrity judgment layer (clash/combination → does it destroy/weaken/transform a specific root or support stem)

**Status:** Does not exist anywhere in the repository. Confirmed by direct inspection: `rules/pillarRelations.ts`
computes all 8 relation types (합/충/형/파/해/삼합/방합/합화-nominal) at **detection only** — its own header
comment states explicitly: "no 성립 조건(합화 성사 여부), no interpretation. Whether a 합 actually 化, or a 충
is 'resolved', is INTERPRETIVE and lives in a later layer, never here." `services/rootingTransparency.ts`
computes roots per branch. `services/natalRelations.ts`/`services/calculateTimeAxis.ts` compute relations per
branch pair. **Nothing joins them.** A repo-wide search confirms no function anywhere connects a detected
clash/punishment/harm/destruction on a branch to whether a root stored in that branch's 지장간 is destroyed or
weakened.

**Blocks:** Doctrine §5.4–5.5 (root survival under 沖/合), §6.3–6.5 (visible-stem 干合/克 suppression), §7.3
(effective-force gate for opposition), §8 in full (all F-series rules), and therefore §12.2's seven-band
boundaries and both structural caps (§12.3) at any but the most trivial charts (charts with zero detected
relations).

**Scope note:** this must remain a FACT-level structural co-occurrence check ("is branch X, which hosts root
Y, also clashed by branch Z, and what do X and Z's relative seasonal vitality/reinforcement/pillar-distance
facts say") — the doctrine's own qualitative grading (INTACT/WEAKENED/DESTROYED/MEDIATED, §5.4) is an
INFERENCE consuming this fact, not something this fact module should itself decide. Building the inference
rule and building the missing fact-linkage are two different pieces of future work; this gap is about the
fact-linkage only.

### P0-2. 사령 (day-count-within-month sub-period) calculator

**Status:** Does not exist. `services/monthCommand.ts` computes 旺相休囚死 from the month branch's **primary
element only** (`getBranchElement`), with an explicit code-level assumption tag
`'EARTH_MONTH_YEOGI_RESIDUAL_QI_WEIGHTING_IS_A_DEFERRED_POLICY'`. No function anywhere computes elapsed days
since the preceding 節入 (solar-term entry) or maps that count against a 여기/중기/정기 day-span table.

**Blocks:** Doctrine §4.2 (사령 for both 격국 selection and boundary-birth vitality correction), §5.2–5.3
(root qi-tier grading and 사령-adjusted override), and is the explicit trigger condition for the
`INSUFFICIENT_STRUCTURAL_EVIDENCE` uncertainty state (§13) — without this calculator, that state cannot be
scoped narrowly (to genuine boundary-birth cases) and risks either over-firing (treating every chart as
uncertain) or under-firing (silently treating the primary-element phase as always sufficient, reintroducing a
Level D simplification as if it were final authority).

**Scope note:** requires (a) selecting and citing one specific named edition's day-count table (§22 unresolved
question #1 in the canonical doctrine — multiple editions disagree, do not synthesize an average table), and
(b) the month-boundary jie-instant is already resolved elsewhere in the frozen layer (`resolveSajuYearAndMonth`)
and should be reused, not recomputed.

### P0-3. Standalone, non-tainted same-element (득지) rooting fact

**Status:** Currently computed **only** inline inside the rejected `natalStrength.ts`
(`inputs.hiddenStems.filter(h => h.role === 'PARALLEL')`), which is not a standalone reusable fact module and
is explicitly disposed-of alongside the rest of that file's rejected inference. `rootingTransparency.ts`'s
`isRooted`/`roots` fields are same-STEM identity matches only (its own ASSUMPTION tag:
`'ROOTING_IS_SAME_STEM_IDENTITY_MATCH_NOT_SAME_ELEMENT'`, with an explicit LIMITATION tag:
`'SAME_ELEMENT_ROOTING_IS_A_SEPARATE_DEFERRED_POLICY_NOT_COMPUTED_HERE'`).

**Blocks:** Doctrine §5.1's Row 1 ("branch's 지장간 contains DM's element — same-stem or same-element/
diff-polarity, graded separately"). Same-stem rooting alone (already available) covers only the tighter of the
two grades §5.1 requires.

**Scope note:** this is a clean, low-risk extraction — a new pure function taking the same inputs
`rootingTransparency.ts` already consumes, decoupled from any inference. No new theory; the doctrine's own
polarity-grading distinction (§5.1) determines HOW the two grades differ once this fact exists — that grading
logic is itself gated on P0-1's integrity layer for full accuracy, but the raw same-element detection itself
is not.

---

## P1 — IMPORTANT (required before the FULL doctrine can run end-to-end, not required to start structural design work)

### P1-1. 조후 (climate) fact module

**Status:** Does not exist anywhere in the repository. An `extremeSeason: '한랭'|'염열'|null` field is
**declared as an input type** in `divination/myungriNatal.ts` and `divination/myungriStrength.ts` (`judgeYongshin`
input), but repo-wide search found **no function anywhere that computes or assigns this value** — it is a
caller-supplied field with no producer.

**Blocks:** Doctrine §9's climate/strength separation mandate can be *specified* without this (and is — §9
requires climate to be a wholly separate fact object regardless of when it's built), but no downstream Yongshin
work (§21) can begin until it exists, and its absence also means `extremeSeason`'s dangling declared-but-
unproduced status should be resolved (either remove the unused declaration or build the producer) before any
strength-adjacent consumer trusts it.

**Scope note:** must be built as month-branch season + day-master element + overall element counts →
hot/cold/dry/wet facts, grounded in a cited classical source (§9 of canonical doctrine names 窮通寶鑑/滴천수 as
the doctrinal basis) — not fabricated from memory, and explicitly NOT merged into the strength fact path.

### P1-2. Special-pattern (從格/專旺) prerequisite facts

**Status:** No detector of any kind exists. Raw ingredients are available:
`calculateFiveElementDistribution()` gives raw element counts across 6/8 direct slots (never weighted, per
`temporalContext.ts`'s own comment: "RAW counts (NEVER 세력/percent)"); `dayMasterStrengthInputs.ts`'s
`visibleSideCounts`/`hiddenRoleCounts` give role tallies. Neither module computes an element-dominance ratio,
an "N of 8 slots is one element" check, or an "all visible stems are one side" check. `natalStrength.ts`'s
`EXTREMELY_WEAK`/`EXTREMELY_STRONG` bands emit only a **warning string**, explicitly
`specialPatternPolicy: 'NORMAL_CLASSIFIER_V1'` — deliberately not a detector.

**Blocks:** Doctrine §10 in full (the entire special-structure gate, G1–G10 in the source matrix).

**Scope note:** must stop at reporting counts/ratios (a FACT), never a threshold/verdict (that's doctrine,
§10's own G1–G8 rules, already specified and awaiting this fact layer). Also depends on P0-1 for G2/G5/G6's
root-integrity checks (is a candidate disqualifying root actually intact after clash/combination).

---

## P2 — OPTIONAL (convenience/refactor; does not block correctness of any doctrine rule, only convenience/generality of the fact layer)

### P2-1. Standalone general seasonal-phase utility

**Status:** The 旺相휴수死 phase-derivation logic inside `calculateMonthCommand()` is structurally
element-vs-element already (via `calculateTenGod(ELEMENT_YANG_STEM[X], ELEMENT_YANG_STEM[monthElement])` →
`TEN_GOD_TO_PHASE`), but is only reachable by calling `calculateMonthCommand` with a full
`NatalPillarContext` — framed around "day master," not exposed as a general
`generalSeasonalPhase(element, monthBranch)` utility.

**Scope note:** thin extraction/refactor of existing logic, zero new theory. Useful for Step D3/D4 (opposing
candidates' own seasonal vitality, not just the DM's) and Step ROOT-B5 (a root's own seasonal vitality,
independent of the DM's), both of which currently need "some element's phase given the month," not
specifically the day master's.

### P2-2. Revealed-hidden-stem × ten-god-side joiner

**Status:** `rootingTransparency.ts`'s `HiddenStemTransparency` (is a hidden stem revealed, and where) and
`dayMasterStrengthInputs.ts`'s ten-god-side tallying exist as two separate facts; nothing joins them into one
fact ("which specific *revealed* hidden stems are on the SUPPORT side"). A caller currently must hand-assemble
this from the two separate modules (as `divination/myungriNatal.ts`'s `supportRevealed: boolean` field
apparently already does, ad hoc).

**Scope note:** convenience joiner over two already-existing, already-clean facts. Not required for doctrine
correctness (both underlying facts are independently available and sufficient), only for reducing duplicate
hand-assembly logic across future consumers.

---

## Explicitly NOT gaps — safe to build on immediately

Per the fact-coverage audit, these already exist as clean, reusable, fail-closed FACT modules and require no
new deterministic-fact work before the doctrine's non-P0/P1-blocked rules can be designed against them:

- Month command / 旺상휴수사 (primary-element phase only — see P0-2 for the sub-period refinement)
- 지장간 with 여기/중기/정기 role tags (`getHiddenStems`)
- Same-stem rooting with tier preserved, transparency both directions (`rootingTransparency.ts`)
- Ten-god calculation and visible/hidden role-composition tallying (`dayMasterStrengthInputs.ts` — the single
  most reusable module in the repo for this work; its `TEN_GOD_ROLE` fixed classical mapping is not a
  weighting choice)
- All 8 branch/stem relation types at DETECTION level (`pillarRelations.ts`, `natalRelations.ts`,
  `calculateTimeAxis.ts` for cross-layer)
- Raw five-element distribution (`calculateFiveElementDistribution()`)
- Full 대운/세운/월운 pillar + ten-god + relation facts (`daewoonTenGods.ts`, `calculateSewoon.ts`,
  `calculateWolwoon.ts`)

---

## Explicitly tainted — must NOT be reused as-is

- `services/natalStrength.ts` — the entire verdict path (`RULE_TABLE`, `rootingState()` NONE/SINGLE/MULTIPLE
  bucketing, support/drain dominance comparison, agreement-count confidence). Individual FACT reads inside it
  (e.g. reading `month.commandStatus`) are fine because the *source* they read from is fine — the inference
  built on top is not.
- `services/currentStrength.ts` — `buildCurrentStrengthContext()` internally calls the rejected
  `evaluateNatalStrength()` and returns its label verbatim; any caller of this function receives the rejected
  verdict embedded in its output. `luckInfluence()` in isolation is lower-risk but was never independently
  audited/approved — treat as a reasonable pattern, not pre-cleared doctrine. `combine()`'s
  SUPPORTIVE-vs-DRAINING occurrence counting is the same vote-counting shape as the rejected confidence
  calculation, at smaller scale.
- `divination/myungriStrength.ts` — a separate, later rebuild that already documents its own rejection of
  `natalStrength.ts` and deliberately withholds classification (`classification: 'UNDETERMINED'` always, with
  an explicit `classificationBlocker` string). Its four-factor evidence shape
  (`monthCommandEffect`/`rootingEffect`/`transparencyEffect`/`compositionEffect`) is useful *structural
  precedent* for evidence presentation, but it is **not** itself clean fact — its own `confidence` field is
  still computed from `ambiguities.length` thresholds (0→HIGH, >1→LOW, else MEDIUM), the same class of
  un-cited count-threshold heuristic this document's doctrine (§13, §14) replaces. Treat as precedent for
  structure, not as a source of pre-approved fact functions — it lives in `divination/` (the judgment layer)
  not `myungri/` (the facts layer), and predates this document's doctrine work.

---

## Summary table

| Gap | Priority | Blocks (canonical doctrine §) | New theory required? |
|---|---|---|---|
| Root/support-integrity judgment layer | P0 | §5.4–5.5, §6.3–6.5, §7.3, §8 (all F-series), §12.2, §12.3 | Fact-linkage: no. Inference grading (INTACT/WEAKENED/DESTROYED/MEDIATED): yes, already specified in this document, not yet implemented |
| 사령 day-count calculator | P0 | §4.2, §5.2–5.3, §13 (INSUFFICIENT_STRUCTURAL_EVIDENCE scoping) | No — requires selecting one cited edition's table |
| Standalone same-element (득지) rooting fact | P0 | §5.1 (polarity-graded existence test) | No — clean extraction |
| 조후 (climate) fact module | P1 | §21 (Yongshin dependencies); not required to specify §9 itself | Yes — module does not exist at all, must be built from a cited source |
| Special-pattern prerequisite facts | P1 | §10 (entire special-structure gate) | No (facts only) — but the gate's own doctrine rules (G1–G8) are already specified, only the fact-producer is missing |
| General seasonal-phase utility | P2 | Convenience only (Step D3/D4, ROOT-B5) | No — refactor/extraction |
| Revealed-hidden-stem × ten-god-side joiner | P2 | Convenience only | No — joiner over existing facts |
