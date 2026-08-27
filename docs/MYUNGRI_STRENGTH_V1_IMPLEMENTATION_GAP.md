# MYUNGRI_STRENGTH_V1.1 — Implementation Gap Analysis (Independent-Audit Remediation)

> Companion to `MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md` §20. Adopts the independent audit's P0/P1/P2
> reclassification. Three gap TYPES are now tracked separately per the audit's explicit instruction not to
> mix them under one heading:
>
> - **FACT GAP** — a missing deterministic function reading already-known chart data. No new doctrine needed.
> - **DOCTRINE GAP** — a missing *sourced rule* for how to interpret facts. Requires research, not code.
> - **INFERENCE GAP** — a missing *implementation* of an already-specified doctrinal rule against
>   already-available (or soon-to-exist) facts. The rule exists in the doctrine document; the code does not.
>
> No gap listed here is implemented in this phase — this document classifies and scopes only.

---

## What changed from V1's classification

| V1 said | V1.1 says | Why |
|---|---|---|
| 사령 day-count calculator = P0 blocker | 사령 day-count calculator = **P1** | Audit finding 4: over-promoted. V1.1's reasoning sequence runs fully today using `BOUNDARY_SENSITIVE` flagging + `INSUFFICIENT_STRUCTURAL_EVIDENCE` (canonical doctrine §4.2, §13) instead of blocking on an unbuilt, disputed-table dependency. |
| Special-pattern prerequisite facts = P1 | Special-pattern prerequisite **FACTS** = **P0** (unchanged priority, reclassified as FACT GAP specifically, distinguished from the now-closed DOCTRINE GAP below) | The audit's expected P0 list places this at P0; V1.1 agrees the FACT layer (ratios/counts) is genuinely blocking, since even the now-specified §10 rule set (canonical doctrine) cannot run without it. |
| Canonical special-pattern rule set = open research question | **DOCTRINE GAP CLOSED** by canonical doctrine §10.0–10.2 (this revision). Remaining work is an INFERENCE GAP (implementing the now-specified rules), listed at P0 because nothing in §10 can run without it. | The audit's expected P0 list names "canonical special-pattern RULE SET" as P0 — V1.1 satisfies this by writing the rule set into doctrine (§10), and reclassifies the REMAINING gap correctly as implementation work, not open research. |
| Canonical relation-outcome/transformation policy = partially specified, inconsistently | **DOCTRINE GAP CLOSED** for 天干合/六合/三合/방합/沖 by canonical doctrine §8's five-question layering. 형/害/破 remain `DEFER`red by deliberate product policy (not an open gap — a decision). Remaining work for the five active mechanisms is an INFERENCE GAP. | Audit finding 6. |
| Seven-band boundary semantics = qualitative prose, not fully reconstructable | **DOCTRINE GAP CLOSED** by canonical doctrine §12.2's per-boundary DECISION CONTRACTS. Remaining work is an INFERENCE GAP. | Audit finding 2. |

---

## P0 — BLOCKER

### P0-1. Root/support-integrity judgment layer (FACT GAP, feeding multiple INFERENCE GAPs)

**Status:** unchanged from V1 — does not exist anywhere in the repository. `rules/pillarRelations.ts` computes
all 8 relation types at **detection only**; nothing joins a detected clash/combination on a branch to whether
a specific root stored in that branch's 지장간 is affected.

**Gap type:** FACT GAP (the linkage itself — "is branch X, which hosts root Y, also clashed by branch Z, and
what do X/Z's relative seasonal vitality/reinforcement/pillar-distance facts say" is a structural
co-occurrence fact, computable deterministically once built).

**Blocks:** canonical doctrine §5.4–5.5, §6.3/§6.5, §7.3, §8 (§8.1–8.4's FUNCTIONAL EFFECT/TRANSFORMATION
questions for every mechanism), §10.0's corrected functional-integrity mechanism (the gate cannot evaluate
whether a candidate disqualifier is functionally intact without this), §12.2's boundary contracts (nearly
every contract references post-F survival).

**Not blocked by this gap:** the DOCTRINE itself (§8's grading rules — INTACT/WEAKENED/DESTROYED/MEDIATED,
and the five-question DETECTION/FORMATION/TRANSFORMATION/FUNCTIONAL/STRENGTH layering) is now fully specified
(canonical doctrine §8, closing the prior DOCTRINE GAP). What remains is building (a) the FACT linkage and
(b) the INFERENCE GAP of implementing §8's already-specified grading rules against it.

### P0-2. 특별-pattern prerequisite FACTS (not verdict) (FACT GAP)

**Status:** No detector of any kind exists. Raw ingredients available: `calculateFiveElementDistribution()`
(raw counts, 6/8 direct slots, never weighted); `dayMasterStrengthInputs.ts`'s `visibleSideCounts`/
`hiddenRoleCounts`. Neither computes an element-dominance ratio or an "N of 8 slots is one element" check.

**Gap type:** FACT GAP — must stop at reporting counts/ratios, never a threshold/verdict (the threshold
question is doctrine, and per canonical doctrine §10.1 the DOCTRINE is now specified — see P0-3).

**Blocks:** canonical doctrine §10's entire gate (all patterns), since even a fully-specified rule set cannot
run without the underlying ratio/count facts.

### P0-3. Special-pattern RULE SET implementation (INFERENCE GAP — doctrine closed by this revision)

**Status:** **Doctrine gap CLOSED.** V1 had no adopted rule set beyond a single universal SG-0 disqualifier
and unstructured per-pattern sketches; this revision's canonical doctrine §10.0–10.2 fully specifies, per
pattern (從旺/從强/從財/從官殺/從兒/專旺), the source lineage, minimum positive conditions, disqualifying
conditions (via the corrected functional-integrity mechanism), weak/residual-root policy, 眞假從 policy,
ambiguous-case policy, named school conflicts, and the four-state software output.

**Gap type:** INFERENCE GAP — the doctrine exists; code implementing it against P0-1's and P0-2's facts does
not. Listed at P0 because the audit's own expected P0 list places "canonical special-pattern RULE SET" here —
V1.1 interprets this as: the rule set must EXIST (now true) and the implementation of it is equally blocking
for any special-pattern feature to ship, hence retained at P0 as a combined doctrine-plus-implementation
checkpoint, with the doctrine half now done.

### P0-4. Relation outcome/transformation policy implementation (INFERENCE GAP — doctrine closed for 5 of 8 mechanisms)

**Status:** **Doctrine gap CLOSED** for 天干合, 六合, 三合, 방합, 沖 by canonical doctrine §8.1–8.4's
five-question layering. **Deliberately left as a product-policy `DEFER`** for 형/害/破 (§8.5–8.8) — not an
open doctrine question, a decision not to grant runtime strength authority given thin/contested sourcing.

**Gap type:** INFERENCE GAP for the five active mechanisms (the rules — FORMATION/VALIDITY tests, 合화's
5-precondition set, 沖's four-factor severity grading, 三合/방합's full-vs-partial STRUCTURAL/FUNCTIONAL split
— are specified; code implementing them against P0-1's fact linkage does not exist).

### P0-5. Seven-band boundary contract implementation (INFERENCE GAP — doctrine closed by this revision)

**Status:** **Doctrine gap CLOSED.** Canonical doctrine §12.2 specifies, per adjacent-pair boundary, REQUIRED
STRUCTURAL CONDITIONS / COUNTEREVIDENCE / UNCERTAINTY CONDITIONS / SPECIAL-PATTERN INTERACTION / EXAMPLES OF
WHAT IS NOT SUFFICIENT, in terms of already-defined structural predicates from §5–§8, with no term used as
sole executable authority without a prior definition (§21's no-hidden-thresholds discipline).

**Gap type:** INFERENCE GAP — the contracts exist in doctrine; code evaluating them against a chart's
finalized B–F facts does not. Blocked transitively on P0-1 (most contracts reference post-F survival grades)
and, for the ordinal WEAK/MODERATE/STRONG ranking specifically, on the unresolved question flagged in
canonical doctrine §22 item 12 (exact ordinal boundaries are deliberately left to a future implementer's
case-by-case derivation from the qualitative descriptions, per §21 — this is a genuine, disclosed remaining
design choice, not a doctrine gap the way P0-3/P0-4/P0-5's *other* content was).

### P0-6. Standalone, non-tainted same-element (득지) rooting fact (FACT GAP)

**Status:** unchanged from V1 — currently computed only inline inside the rejected `natalStrength.ts`.
`rootingTransparency.ts`'s rooting facts are same-STEM identity only.

**Gap type:** FACT GAP — clean, low-risk extraction; no new theory. The doctrine's own polarity-grading
distinction (canonical doctrine §5.1) determines how the two grades (same-stem vs. same-element/
diff-polarity) differ once this fact exists.

**Blocks:** canonical doctrine §5.1's Row 1 in full (the polarity-graded existence test needs both grades to
exist as facts before grading can apply).

---

## P1 — IMPORTANT

### P1-1. Exact 사령 (day-count) refinement — DOWNGRADED FROM P0

**Status:** unchanged (does not exist) — but no longer blocking. Canonical doctrine §4.2 specifies
`OPTIONAL_SILING_POLICY`: a `BOUNDARY_SENSITIVE` flag computable TODAY from the already-frozen 절입 instant
(distance to the boundary only — not which qi-tier governs), feeding `INSUFFICIENT_STRUCTURAL_EVIDENCE`
(§13) for genuinely boundary-proximate charts, rather than blocking all reasoning.

**Gap type:** FACT GAP for the `BOUNDARY_SENSITIVE` flag itself (P2-level effort — trivial once the 절입
instant, already available, is compared against a to-be-chosen window). DOCTRINE GAP, explicitly and
deliberately left open, for the EXACT day-count sub-period table (canonical doctrine §22 item 1 — multiple
named editions disagree, no single edition selected; this is not an oversight, it is a considered decision to
avoid fabricating precision, per the brief's own stated preference for `DEFER` over invention).

**Blocks:** full-precision root qi-tier assignment near boundaries (canonical doctrine §5.2's exact tier);
does NOT block the ordinary reasoning sequence, which now runs with honest reduced confidence instead.

### P1-2. Generalized seasonal-phase utility

**Status:** unchanged from V1 — the logic inside `calculateMonthCommand()` is structurally element-vs-element
already but only reachable via a full `NatalPillarContext` call, not exposed as a general
`generalSeasonalPhase(element, monthBranch)` utility.

**Gap type:** FACT GAP — thin extraction/refactor, zero new theory.

**Blocks:** convenience only (canonical doctrine's D3/D4 opposition-candidate seasonal vitality; ROOT-B5's
root-own-vitality check) — both are currently achievable by calling the existing function with a full
context, just less cleanly.

### P1-3. Visible-stem/root-function joins where not already P0

**Status:** unchanged from V1 — `rootingTransparency.ts`'s transparency facts and `dayMasterStrengthInputs.ts`'s
ten-god-side tallying exist separately; no joiner exists for "which specific revealed hidden stems are on the
SUPPORT side."

**Gap type:** FACT GAP — convenience joiner over two already-clean facts.

**Blocks:** convenience only; both underlying facts are independently sufficient without the joiner.

---

## P2 for STRENGTH — becomes a prerequisite before YONGSHIN specifically

### P2-1. 조후 (climate) fact producer

**Status:** unchanged from V1 — does not exist anywhere in the repository. `extremeSeason` is declared as an
input type in `divination/myungriNatal.ts`/`divination/myungriStrength.ts` with no producer.

**Gap type:** DOCTRINE GAP (partial) + FACT GAP. Canonical doctrine §9 specifies the STRUCTURAL rule
(`CLIMATE_DOMAIN` separate, `EXTREME_CLIMATE_FUNCTIONALITY` as a narrowly-scoped modifier on already-
established functional-force facts, never a direct band input) — this closes the *separation* doctrine
question. It deliberately does **not** specify exact per-element/per-month operational thresholds (no
per-cell 궁통보감 table is adopted, per canonical doctrine §22 and the brief's own instruction not to
fabricate one) — that remains an open DOCTRINE GAP for a future research pass. The FACT-producing module
itself (month-branch season + DM element + overall counts → hot/cold/dry/wet facts) does not exist at all.

**Distinguished status (brief's explicit instruction):** remains **P2 for the STRENGTH engine itself**
(§9's separation means strength reasoning does not need this module to run correctly), but is **required
before any Yongshin-phase work begins** (canonical doctrine §21's dependencies are unimplementable without
it). This dual status is recorded explicitly, not merged into one bucket that would undersell its
Yongshin-blocking role.

---

## Explicitly NOT gaps — safe to build on immediately (unchanged from V1)

- Month command / 旺相휴수死 (primary-element phase; see P1-1 for the sub-period refinement)
- 지장간 with 여기/중기/정기 role tags
- Same-stem rooting with tier preserved, transparency both directions (`rootingTransparency.ts`)
- Ten-god calculation and visible/hidden role-composition tallying (`dayMasterStrengthInputs.ts`)
- All 8 branch/stem relation types at DETECTION level (`pillarRelations.ts`, `natalRelations.ts`,
  `calculateTimeAxis.ts`)
- Raw five-element distribution
- Full 대운/세운/월운 pillar + ten-god + relation facts

## Explicitly tainted — must NOT be reused as-is (unchanged from V1)

- `services/natalStrength.ts` — entire verdict path (RULE_TABLE, root-count bucketing, dominance comparison,
  agreement-count confidence, and — per this revision's own §0 correction — its lineage's implicit reliance
  on a universal existence-only disqualifier, now also rejected in the new doctrine, §10.0).
- `services/currentStrength.ts` — `buildCurrentStrengthContext()` internally calls the rejected
  `evaluateNatalStrength()`.
- `divination/myungriStrength.ts` — later rebuild, useful structural precedent for evidence presentation
  only, not a source of pre-approved facts; its own `confidence` field is still a count-threshold heuristic.

---

## Summary table

| Gap | Priority | Type | Blocks (canonical doctrine §) |
|---|---|---|---|
| Root/support-integrity fact linkage | P0 | FACT | §5.4–5.5, §6.3/6.5, §7.3, §8, §10.0, §12.2 |
| Special-pattern prerequisite facts (ratios/counts) | P0 | FACT | §10 (entire gate) |
| Special-pattern rule set | P0 | DOCTRINE — **CLOSED this revision**; INFERENCE remains | §10.0–10.2 (now specified) |
| Relation outcome/transformation policy (5 of 8 mechanisms) | P0 | DOCTRINE — **CLOSED this revision**; INFERENCE remains | §8.1–8.4 (now specified); §8.5–8.8 deliberately DEFERRED |
| Seven-band boundary contract | P0 | DOCTRINE — **CLOSED this revision**; INFERENCE remains | §12.2 (now specified) |
| Standalone same-element rooting fact | P0 | FACT | §5.1 |
| Exact 사령 day-count refinement | **P1 (downgraded from P0)** | FACT (flag) + DOCTRINE (table, deliberately deferred) | §4.2, §5.2 (precision only — sequence runs without it) |
| Generalized seasonal-phase utility | P1 | FACT | Convenience only |
| Visible-stem/root-function joiner | P1 | FACT | Convenience only |
| 조후 (climate) fact producer | P2 (strength) / effectively P0 for Yongshin | DOCTRINE (separation closed; operational thresholds open) + FACT | §21 (Yongshin dependencies) |
