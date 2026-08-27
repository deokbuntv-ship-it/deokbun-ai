# MYUNGRI_STRENGTH_V1 — Canonical Doctrine Specification

> **STATUS: DOCTRINE PHASE ONLY.** No runtime strength code is implemented or approved by this document.
> No Yongshin logic is implemented or approved. The frozen deterministic reasoning kernel and the frozen
> Myungri calculation layer are **untouched** by this document. This is research + specification, produced
> for independent doctrine audit before any implementation phase begins.

Base commit: `956474999222221918b79b824fded5c6bf06d66a`. Companion documents: `MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md`
(per-rule source table), `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md` (P0/P1/P2 fact gaps).

---

## 1. Executive doctrine decision

The prior strength candidate (`src/features/myungri/services/natalStrength.ts`, `docs/MYUNGRI_STRENGTH_V1.md`)
was independently audited and rejected as `NEW_HEURISTIC / CONFLICTS_WITH_FREEZE`. Its defects, confirmed by
direct source inspection: rooting collapsed to a flat `NONE/SINGLE/MULTIPLE` count bucket with no
existence-vs-function distinction and no clash/combination check; visible-stem support collapsed to a raw
`support-count > drain-count` comparison; an 18-cell lookup table (`{month × rooting × composition} → label`)
with no combination/clash effects and no special-structure detection; confidence computed as a raw count of
how many of 3 factors "agree." None of this is reused, referenced as precedent, or treated as pre-validated by
this document. This finding is confirmed independently in `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`'s
fact-vs-inference audit.

**This document's core decision:** Day-Master strength is not a number. It is the output of a **sequenced,
conditional reasoning chain** (§11) over four heterogeneous axes — seasonal command, root structure, support
structure, opposition structure — where each axis's meaning is set by the axis before it, gated first by a
special-structure check, and resolved into a seven-band verdict (§12) that always carries an explicit
uncertainty state (§13) and a full evidence trail (§14). No step in this chain is a vote, a sum, or a fixed
threshold. Numeric counts may assist as **diagnostics inside a step**; they may never become the cross-step or
final authority. This is not a stylistic preference — §11.0 shows the doctrinal sources (子平真詮, 滴天髓)
argue against context-free, commensurable-unit comparison as a matter of method, and the previous candidate's
concrete failure (a 3-count "confidence" and an 18-cell table) is the direct, demonstrated consequence of
ignoring that argument.

Two capability statements up front, both binding on any future implementation phase:

- **The engine must be able to say "I don't know cleanly"** (§13) rather than force an artificially precise
  seven-band label onto a genuinely contested chart.
- **The engine must be able to say "this needs the special-structure gate, and I'm not confident"** (§10)
  rather than force every chart into the ordinary strong/weak ladder.

---

## 2. Source hierarchy

| Level | Definition | Runtime authority |
|---|---|---|
| **A** | Canonical structural principle — broad, near-universal cross-school agreement (e.g. month-branch seasonal primacy; root-existence ≠ root-function; no naive vote-counting). | May become runtime authority once operationalized (see Level C). |
| **B** | School-dependent but defensible interpretation — named school, real classical grounding, but genuine disagreement exists among legitimate traditions (e.g. 방합-outranks-三합 ranking; DM-involved 合化 default; 사지/년지 relative rooting weight). | May become runtime authority **only** with the chosen school explicitly named in the rule's documentation, and the rejected alternative recorded, never silently resolved. |
| **C** | Modern operationalization needed for software — a reasonable, disclosed engineering translation of a real Level A/B principle into a checkable condition (e.g. "VITAL/MODERATE/DORMANT" as a 3-tier translation of continuous seasonal-vitality doctrine; a specific ordinal effective-force scale). | May become runtime authority, but must be labeled as an engineering translation, not classical citation, and must remain revisable without being treated as doctrine itself. |
| **D** | Unverified / common-practice heuristic — internet convention, unsourced numeric table, a rule whose classical grounding could not be confidently traced (e.g. 형/해/파's structural effect on qi-strength; any specific 사령 day-count table not tied to a named edition). | **MUST NOT become runtime authority.** May be retained as an advisory/documentation-only annotation at most, explicitly labeled non-authoritative. |

Every rule in `MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md` carries one of these four levels. A rule cannot be
`ADOPT`ed at Level D under any circumstance — the canonical status options for Level D rules are `REJECT` or
`DEFER` only.

---

## 3. Definition of strength

Five related-but-distinct concepts must not be collapsed into one:

| # | Concept | What it measures | Why it is not "strength" alone |
|---|---|---|---|
| 1 | Raw element count | How many stems/branches nominally share the DM's element | A hidden stem can be a dead residual trace; a visible stem can be rootless and floating (浮). Counting occurrences ignores whether any occurrence is alive. |
| 2 | Seasonal vitality (旺相休囚死) | Where the DM's element sits in the month's Five-Phase cycle | Ambient climate the DM is born into, not whether the DM has taken root in it. |
| 3 | Rootedness with integrity (通根) | Presence AND survival of a root (unclashed, uncombined-away, not exhausted) | Two separate checks, both required — presence alone is insufficient. |
| 4 | Visible-stem support with function (透干) | Whether Resource/Companion stems appear AND are themselves rooted/proximate | A rootless "floating" support stem is weaker; proximity to the DM further modulates force. |
| 5 | Capacity to bear the structure (억부 관점, 任財官) | Whether the DM, once strength is already known, can sustain its 격局's Wealth/Officer/Output load | Downstream *application* of a strength verdict, not an input — folding it backward is circular. |

**Canonical definition adopted:** Day-Master strength (身强/身弱, 旺衰) is a four-axis, order-dependent
synthesis, never an additive score:

```
AXIS A — CATEGORY GATE (evaluated FIRST — §10)
   Does ordinary strong/weak scoring even apply, or does the chart qualify
   as a special structure (從强/從弱/從兒/從財/從殺, 專旺) judged by a
   separate rule set entirely?

AXIS B — SEASONAL VITALITY (旺相休囚死, from month branch — §4)
   Necessary context, contributes heavily. NOT sufficient alone.

AXIS C — ROOTEDNESS WITH INTEGRITY (通根 — §5)
   Root exists AND is unclashed, uncombined-away, not exhausted by
   simultaneous heavy drain. Generally the load-bearing factor.

AXIS D — VISIBLE-STEM SUPPORT WITH FUNCTION (透干 — §6)
   Support stem exists AND is itself rooted/proximate — not floating.
   Secondary/reinforcing.
  ↓
FINAL STRENGTH VERDICT = qualitative synthesis of B+C+D under the A gate —
explanatory chaining ("득령이지만 무근·무조 → 신약"), never vote-counting
or score summation.
  ↓
억부 APPLICATION (downstream, explicitly OUT OF SCOPE of this document —
Yongshin dependency, §21)
```

Sourcing: AXIS A → 滴天髓/滴天髓闡微 (從象 doctrine, LEVEL A for the discontinuity principle, SOURCE_GAP on
exact triggers, deferred to §10). AXIS B → 淵海子平/三命通會 five-phase doctrine (LEVEL A). AXIS C → 滴천수
(rooting-as-substantiality theme; exact wording SOURCE_GAP, LEVEL A on the principle). AXIS D → 子平真詮
(stem-position proximity and "floating" stems, LEVEL B/A). Full citation detail in
`MYUNGRI_STRENGTH_V1_SOURCE_MATRIX.md`.

**Explicit rejections** (matching Red Flags §27 of the brief): simple element count = strength; month command
alone = final strength; fixed root/stem points; support-votes-vs-opposition-votes; any small fixed lookup
table over coarse buckets with no clash/combination/special-structure handling; confidence as a raw
agreement-count.

---

## 4. Month-command (月令/월령) doctrine

### 4.1 Evidentiary primacy, not sole determination

월지 is examined first and weighted most heavily — 子平真詮 frames it as the 提綱 ("guiding thread") of the
entire reading. **LEVEL A.** This is primacy, not exclusivity: every source consulted treats month command as
necessary-not-sufficient for strength (§4.4).

### 4.2 사령 (day-count command) — two different questions, two different answers

- **For 격국 (structure) selection:** when the month branch's hidden-stem set has multiple candidates, 子평真詮
  prefers the stem currently 司令 (in command by day-count from the preceding 節氣) if it is also transparent;
  sub-day 사령 authority is load-bearing here. **LEVEL A/B.**
- **For the DM's own 旺相休囚死 label:** classical practice is coarser — the five-state cycle keys to the
  month's primary/dominant seasonal element, not day-count. The month branch's primary element is sufficient
  for the *ordinary* label. **LEVEL A** for coarse-label sufficiency.
- **Exception — 節氣-boundary births:** near a 節氣 changeover a chart may still carry substantial 餘氣
  (residual qi) from the *prior* month rather than the new month's nominal element, most pronounced in the
  four 辰戌丑未 earth-transition months. **LEVEL A** for the existence/relevance of the effect;
  **SOURCE_GAP** on exact day-count sub-period tables — 淵海子평-descended and 三命통회/徐樂吾-descended
  tables disagree on precise splits. **No specific numeric table is adopted by this document; a specific
  edition-sourced table must be chosen and its provenance recorded before implementation (P0 gap, see
  `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`).**

### 4.3 The 旺相休囚死 five-state cycle (canonical mapping) — adopted, LEVEL A

Given the month's dominant seasonal element **S** and the DM's element **D**:

| Relation of D to S | State | Gloss |
|---|---|---|
| D = S | 旺 (wang) | DM element IS the season — full command |
| S generates D | 相 (xiang) | DM is season's "child" — supported |
| D generates S | 休 (xiu) | DM is season's "parent" — spent, resting |
| D controls S | 囚 (qiu) | DM nominally controls, but exhausted by a peak season — imprisoned |
| S controls D | 死 (si) | DM directly overcome by the season |

Per season: 春(寅卯)→木旺火相水休金囚土死 · 夏(巳午)→火旺土相木休水囚金死 · 秋(申酉)→金旺水相土休火囚木死 ·
冬(亥子)→水旺木相金休土囚火死 · 辰戌丑未→土旺金相火休木囚水死 (subject to the §4.2 餘氣 caveat).

**This is a five-way, not binary, classification.** Only 旺 is strict 得令 in the strongest sense; 相 is a
real but weaker positive state; 休/囚/死 are three distinct *degrees* of disadvantage, not one flat "weak"
bucket. Any implementation collapsing this to a binary `SUPPORT/DRAIN` flag (as the rejected candidate did)
discards sourced granularity.

### 4.4 Why month command cannot be sole authority, with concrete conditions

**득령 does NOT imply strength when:** (1) the only root is in the month branch itself and that branch is
clashed or pulled into a different 化 element by combination — LEVEL B; (2) the DM's element is present only
as a fading 餘氣, not the ruling qi (the §4.2 boundary case) — LEVEL B; (3) overwhelming rooted opposition
elsewhere outweighs bare seasonal command ("得時不為旺" — exact classical wording SOURCE_GAP, principle broadly
taught) — LEVEL B/C; (4) special-structure override in rare configurations — LEVEL C, LOW confidence, deferred
to §10.

**실령 does NOT imply weakness when:** (1) strong, intact root elsewhere compensates — LEVEL B; (2) numerous
rooted, transparent Companion/Resource stems supply sufficient force without month support — LEVEL B; (3)
special-structure override (§10) — LEVEL C, LOW confidence; (4) the month branch's controlling force toward
the DM is itself neutralized by clash/combination, or its hidden-stem set contains a minor supporting qi —
LEVEL B.

**Verdict: "득령 = 신강" and "실령 = 신약" are REJECTED as sufficient rules.** Both survive only as a single
heavily-weighted *default* that must pass Axis C (rootedness/integrity) and Axis D (support quality) before
being finalized, and must run after the Axis A special-structure gate.

---

## 5. Rooting (通根/통근) doctrine

### 5.1 Root existence vs. functional strength — the mandatory distinction

| Fact | Determines |
|---|---|
| Branch's 지장간 contains DM's element (same-stem or same-element/diff-polarity — graded separately, LEVEL A/B) | **EXISTENCE ONLY** — categorical, never a score |
| Which qi-tier supplies it: 본기/중기/여기, and whether that tier is currently 사령 | Root QUALITY tier |
| Seasonal vitality of the root's own element this month (independent of the DM's own 왕상휴수사) | Root VITALITY |
| Position: 월지 > 일지 > 시지/년지 (월지 primacy LEVEL A; 일지>시지>년지 ordering LEVEL B) | Root AUTHORITY/closeness |
| Clash (沖) exposure and outcome | Root SURVIVAL: intact / weakened / destroyed / mediated |
| Combination (合) exposure and outcome | Root SURVIVAL: intact / diverted / transformed-away |
| Reinforcement vs. scattering across multiple roots | Root CONFIGURATION, not a sum |

A root's **existence** is a fixed per-chart fact. Its **functional strength** is a composite of tier, 사령
status, seasonal vitality, position, and clash/combination survival — evaluable only relative to a specific
moment (natal, or natal+대운/세운), and must never collapse into a static per-branch point value. **Any
implementation assigning a fixed "root points" number to a branch reproduces the rejected candidate's core
defect.**

### 5.2 Hidden-stem qi tiers (LEVEL A concept / SOURCE_GAP on exact day-counts)

本氣/正氣 (main, largest day-window, defines the branch's official identity) > 中氣 (secondary, often
anticipates a trine) > 餘氣/初氣 (smallest window, prior month's carryover). Root strength ranks main > middle
> residual, further conditioned by whether that tier is actually 사령 on the birth day (§4.2). Exact
day-count boundaries differ between 淵海子평's and 三命통회's tables — **no specific table is adopted here;
this is a P0 SOURCE_GAP** (see `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`).

### 5.3 Seasonal vitality of the root itself (LEVEL A principle / LEVEL C tiering)

A root's force depends on whether the root branch's OWN element is itself seasonally vital (旺/相) or
declining (囚/死), independent of the DM's own seasonal reading. Same-stem, 本氣-tier root in a seasonally
dead branch is weaker than the identical configuration in a seasonally vital one.

### 5.4 Root survival under 沖 (clash) — LEVEL A principle / LEVEL B conditionality / LEVEL C operationalization

Clash can weaken or destroy a root, but conditionally, not automatically: an isolated, unsupported root branch
is more vulnerable; a root branch reinforced by combination or an adjacent compatible branch resists better;
清氣-tier damage may be graded by which qi-tier is struck; a clash can be mediated ("解"/通關) by an
intervening branch, leaving the root reduced but not destroyed. **No binary DESTROYED/SURVIVED tag may be the
sole output — grade as INTACT / WEAKENED / DESTROYED / MEDIATED.**

### 5.5 Root survival under 合 (combination) — LEVEL A/B/C, see §8 for full combination mechanics

合而不化 (binds, does not transform) leaves the original element largely intact though diverted; 合化 (binds
AND transforms — itself conditionally gated, §8.7) can convert the branch's functional identity away from
the DM's root entirely. Partial (半合, 2-of-3) trines are weaker than full trines, with center-branch (帝旺)
inclusion mattering.

### 5.6 Positional weight (LEVEL A for 월지 primacy / LEVEL B for the rest)

월지 (greatest authority, the 월령/提綱 itself) > 일지 (directly beneath the DM, 坐下) > 시지/년지 (weaker,
peripheral; 시지 generally ranked above 년지 but this specific ordering is less rigorously settled than 월지
primacy). Positional weight and qi-tier are **independent axes** — a 餘氣-tier root in 월지 is not
automatically weaker than a 本氣-tier root in 년지; track both, do not collapse into one score.

### 5.7 Compounding — multiple roots do not sum (LEVEL A)

Roots combining into a completed 方合/三合 of the same element escalate qualitatively, bordering on
special-structure territory (§10, not resolved here). Roots scattered across non-adjacent, non-combining
branches remain individually weak and must **not** be read as jointly equivalent to one strong 본기 root — this
is precisely the "vote-counting" error the rejected candidate made. A single 본기-tier, seasonally-vital,
unclashed root in 월지 can outweigh several scattered weak roots; reading is configurational (氣勢/局), not
additive.

### 5.8 Twelve-stage vitality cycle (十二運星) — adjacent, not identical, axis (LEVEL B / D-risk)

A stem's 12운성 placement (長生/帝旺/墓/絶 etc.) is a *separate* vitality lens that can disagree with
지장간-based rooting and must not be silently merged with it. Whether yin stems run this cycle 역행 (reverse) or
순행 (forward, per a real minority/modern-critical position) is a genuine unresolved school conflict —
**flagged for integration-level decision, not resolved here.**

---

## 6. Visible-stem support (透干) doctrine

### 6.1 Rooted vs. floating support is not equal force (LEVEL A)

A visible 비겁/인성 stem WITH a root (cross-referenced from §5, never re-derived) is more substantial than an
identical stem with no root anywhere (無根/浮, "floating"). A rooted and a floating support stem of the same
십신 category must not be tagged with equal supportive force.

### 6.2 Floating support is not zero; proximity to the DM matters (LEVEL B/C)

An unrooted stem still contributes qualitatively (비겁 = company/backup; 인성 = generative/protective
function), more so when adjacent to the DM's own stem column (월간/시간 vs. distant 년간). This proximity
convention is real and widely used but not formalized with 월지-primacy rigor — treat as **LEVEL C**
(defensible engineering translation of a **LEVEL B** loosely-formalized convention).

### 6.3 干合 (stem combination) can neutralize support — two distinct outcomes (LEVEL A/B, see §8)

合而不화 (distracted, function reduced, not erased) vs. 合化 (genuinely transforms, contingent on §8.7's
preconditions — not automatic from adjacency).

### 6.4 爭合/妒合 (contested combination) — LEVEL B/C

When a combination partner is contested by more than one suitor, the combination may fail to complete cleanly
or complete only partially — a support stem in this state must **not** be flagged as fully neutralized;
residual uncertainty must be graded conservatively, not resolved to a clean tag.

### 6.5 Direct 克 (overcoming) by an adjacent stem (LEVEL B/C)

A support stem (especially 인성) can be functionally suppressed by an adjacent controlling stem independent of
any combination mechanism, graded more strongly by adjacency.

### 6.6 Stem-level vs. branch-level facts are separate objects (LEVEL C — engineering discipline)

A support stem's own 干合-driven distraction (§6.3–6.4) and its ROOT's clash/combination survival (§5.4–5.5)
are facts about *different objects* (the stem column vs. the branch column) that happen to interact. Both must
be tracked independently; only a later synthesis step may combine them into one per-stem functional verdict.
This mirrors how 淵海子평/三命통회 always present 干合 and 支合/支沖 as formally separate rule sets.

---

## 7. Drain/control doctrine

### 7.1 Three mechanistically distinct opposing forces (LEVEL A)

| Force | Ten Gods | Cycle relation | Character |
|---|---|---|---|
| 食傷 (Output) | 食神, 傷官 | DM generates it (我生者) | Outflow/leak — pure depletion, not resistance |
| 財 (Wealth) | 偏財, 正財 | DM overcomes it (我剋者) | Expenditure-through-control — costs DM energy even while nominally "in charge" |
| 官殺 (Officer/Killing) | 正官, 七殺 | It overcomes DM (剋我者) | Direct restraint — the only one of the three that is opposition in the strict 剋 sense |

**Disposition distinctions (子평真詮, LEVEL B, 격局派):** 正官 (regulating, tolerable) vs. 七殺 (unchecked,
needs 制殺/化殺); 食神 (gentle, can itself control 七殺 via 食神制殺, protective) vs. 傷官 (aggressive,
dangerous meeting 正官 — 傷官見官). **These disposition distinctions modulate qualitative severity/structure
flags, not the base magnitude of drain — conflating a 格局派 disposition scale with an 億扶派 strength-magnitude
scale is an explicit, named risk this document guards against.**

### 7.2 財 as a bridging force — 財生官殺 (LEVEL B/C)

The three opposing categories relate internally (食傷生財, 財生官殺); a chart heavy in 財 latently reinforces
官殺 even absent a visible 官殺 stem. No formula for "how much" — a structural-awareness requirement, not a
quantified rule.

### 7.3 Presence vs. effective force — applied symmetrically to opposition (LEVEL A, central corrective)

**The rejected candidate's flaw was crude counting on both sides; the fix must apply equally to opposition,
not only to support.** A drain/control candidate's mere presence does not establish effective force. Per
candidate, evaluate: (1) 得令 — seasonal vitality of its element (旺/相 vs 死/囚/絶); (2) 得地/有根 — rooted vs.
floating, and which tier; (3) 得勢/有輔 — reinforced or isolated; (4) survival through combination/clash (§8).
A candidate failing (1)–(3) or structurally removed by (4) is `FUNCTIONALLY_NEGLIGIBLE` for the strength axis
specifically, while remaining fully present for other purposes (격局 naming, life-domain symbolism).

窮通寶鑑 (調候派) is cited here **only** for the general principle that an element's function is intensely
season-dependent — **never** for "the seasonally-needed element is therefore the strong element," which is
precisely the climate-as-strength conflation this document forbids (§9).

### 7.4 Strength and favorability are different axes (LEVEL A)

食傷 draining the DM's qi is a strength-axis fact regardless of whether that drain is, in context, structurally
useful (e.g. 食神制殺). Usefulness is a 격局/favorability judgment consuming the same facts differently
downstream — this document's scope is the strength-axis effect only.

---

## 8. Combinations/clashes/transformations doctrine

Each mechanism is rated for: activation conditions, SOURCE_LEVEL, whether it changes STRUCTURAL strength
(re-derivable element identity) vs. only FUNCTIONAL availability, and school disagreement.

| Mechanism | Pairs/groups | STRUCTURAL vs FUNCTIONAL | SOURCE_LEVEL | Notes |
|---|---|---|---|---|
| **合(六合)** — stem/branch binding | 天干: 甲己乙庚丙辛丁壬戊癸. 地支: 子丑寅亥卯戌辰酉巳申午未 | FUNCTIONAL by default; escalates to STRUCTURAL only if §8.7's transformation conditions are met | A (binding exists) / B (discount magnitude) | Proximity matters — adjacent pillars bind more forcefully than distant ones |
| **沖** — clash | 子午丑未寅申卯酉辰戌巳亥 | FUNCTIONAL — damages/weakens a branch's root/force capacity; graded (intact/weakened/destroyed), never binary | A (mutual, not unilateral; 貪合忘沖 mediation exists) / B (pillar-distance decay, no numeric curve sourceable) | Outcome depends on each branch's own vitality, reinforcement, and pillar distance |
| **刑** — punishment | 寅巳申 / 丑戌未 / 子卯 / 自刑(辰午酉亥) | Neither, for strength — advisory-only | **D** | Thin/contested grounding for any qi-strength effect; excluded from strength calculus |
| **害** — harm | 子未丑午寅巳卯辰申亥酉戌 | Neither — advisory-only | **D** | Weakest of the classical branch relationships; largely symbolic |
| **破** — break | 子酉午卯巳申寅亥辰丑戌未 (SOURCE_GAP on canonical pair list — derivations disagree) | Neither — recommend exclusion outright | **D** | Many teaching lineages omit entirely; overlaps awkwardly with other mechanisms across derivations |
| **會 (三合/方合)** — trio harmony | 三合: 申子辰(水) 亥卯未(木) 寅午戌(火) 巳酉丑(金). 方合: 寅卯辰 巳午未 申酉戌 亥子丑 | **STRUCTURAL** when formed — concentrates branch qi into one dominant element, superseding individual-branch analysis; must re-trigger downstream vitality/rooting checks | A/B (existence + relative strength) / B (방합>三合 ranking, disputed) / C (half-combination discount) | 半合 (2-of-3) weaker, center-branch (帝旺) inclusion matters |
| **合化** — combination-transformation | Five 干합 pairs | **STRUCTURAL when preconditions met** (§8.7); else collapses to FUNCTIONAL 合而不化 | A/B (framework) / B, explicitly contested (DM-involvement default) | See §8.7 for full precondition list |

### 8.7 합화 preconditions (synthesizing 子평真詮/滴천수-descended teaching)

1. **得地/得時** — the transformed element must be seasonally supported (LEVEL A/B).
2. **Proximity** — combining characters should be directly adjacent (LEVEL B).
3. **Absence of a breaking/competing force** — a clashing third character or strong rival prevents/weakens
   transformation; fallback is 合而不化 (LEVEL A/B).
4. **Unopposed persistence** — some traditions require the transformed element not be immediately re-attacked
   (LEVEL B/C, school-variable).
5. **DM-involvement caution** — when the Day Master itself is one of the combining stems, many lines treat this
   conservatively (functional binding, not full transformation); genuine DM transformation is closer to 從化/
   從格 territory (§10), a rarer, distinct claim. **This is a genuinely disputed point across lineages — a
   runtime default of "conservative/binding-not-transforming" is a LEVEL C engineering choice reflecting the
   cautious reading, explicitly not a resolved consensus, and must be documented as such wherever implemented.**

---

## 9. Climate (調候) vs. structural-strength separation

**Governing statement, binding on the entire specification:** 調候 and 身强弱 are two independent analytical
axes. Climate must **never** be computed as, added to, subtracted from, or merged into the strength verdict.

- 窮통보감 (調候派) organizes its entire method around season-first climate correction, indexed by DM stem ×
  month — it does not compute or claim to compute a 신강/신약 label (LEVEL A for the axis-distinctness; LEVEL B
  for 궁통보감's specific priority table as a school emphasis).
- 滴천수's 病藥 (illness-remedy) framing keeps climate logically downstream of strength: a chart can be 신강
  and climatically "diseased," or 신약 and climatically neutral (LEVEL A).
- 子평真詮 (格局派) organizes around 격局 needs, largely silent on 조후 — neither endorsing nor rejecting
  궁통보감's system; it simply operates on a different axis (LEVEL A, cited to show what must not be
  conflated).
- **Function-level climate effects are real and must be tracked separately**, never folded back into 신강/신약:
  e.g. Water in peak-summer months functionally stressed even if nominally rooted; Water in peak-winter months
  abundant yet "frozen," not properly nourishing Wood without Fire to thaw it; Wood in dry-土 months needing
  Water regardless of nominal root count. Two DMs can reach the **same nominal rooting/support configuration**
  while sitting in opposite climate extremes with opposite downstream remedy needs — this is exactly why
  climate must be a separate fact object, consumed only by Yongshin, never by the strength verdict itself
  (LEVEL A/B for the phenomenon, LEVEL C for any specific checkable rule, SOURCE_GAP on exact per-cell tables
  — do not fabricate a 궁통보감 lookup table from memory).

**Structural mandate:** climate is implemented as an independent fact object (per-pillar and aggregate
thermal/moisture profile), computed and exposed separately from the strength verdict. See §21 for
Yongshin-dependency notes.

---

## 10. Special-structure gate

### 10.0 Shared cross-category doctrine

- **SG-0 (LEVEL A/B):** For any 從格/專旺格 claim, even one genuinely ROOTED opposing element is sufficient to
  break the pattern (破格) and force reversion to the ordinary model. Grading "how rooted" (餘氣-only vs
  本氣-seated) is school-dependent (LEVEL B); this specification defaults conservatively — an ambiguous or weak
  root disqualifies, given the explicit high-risk mandate on false special-pattern classification.
- **SG-0b — 眞從 vs 假從 (LEVEL B):** A spectrum, not a binary. 眞從 = literally zero usable root, total
  dominance. 假從 = superficially resembles it but retains marginal root/support — fragile, disputed. This is
  the doctrinal basis for a three-state gate output (§10.5) rather than yes/no.

### 10.1 從强格/從旺格 (Follow-Strong)

ENTRY = DM's own+generating element (比劫+印星) overwhelming majority of composition; 월령 favorable; no
rooted 財/官殺. DISQUALIFIERS = any single rooted 財/官殺 branch. BORDERLINE = unrooted 財/官 stem present; a
餘氣-only root of the opposing element (假從 zone). NORMAL_STRENGTH_MODEL_ALLOWED = **YES** (an unconfirmed
candidate is simply very-high 신강). CONFIDENCE = MEDIUM-HIGH only with zero disqualifiers and zero borderline
flags; otherwise `CANDIDATE_UNCONFIRMED`.

### 10.2 從弱格 family (從財格/從官殺格/從兒格)

SHARED ENTRY = DM has zero usable root; 월령 belongs to the dominant opposing force's season; one force
overwhelmingly dominates. SHARED DISQUALIFIERS = any rooted 比劫/印星 branch. SHARED BORDERLINE = unrooted
比劫/印 stem only; 餘氣-only DM-element root.

- **從財格:** additional entry = dominant force specifically 財星 (± its generator 食傷), largely unopposed by
  官殺 — a chart with BOTH strong 財 and strong 官殺 alongside a rootless DM is disputed (some schools allow
  財生官 continuity, others treat competing forces as disqualifying); default conservative → does not qualify
  cleanly.
- **從官殺格:** additional entry = dominant force 官殺 (± generating 財), DM rootless, 월령 aligned. Additional
  disqualifier = a rooted 食傷 branch (直接 controls 官殺, contradicts the "no resistance possible" premise).
  Relatively more confidently attested than 從兒.
  中CONFIDENCE = MEDIUM for clean cases.
- **從兒格:** additional entry = dominant force 食傷, DM rootless, AND 食傷 must flow onward into 財 (食傷生財)
  unobstructed. Additional disqualifier = a rooted 印星 branch (印剋食傷); 食傷 dominant with no 財 outlet =
  incomplete instance. **Most-disputed sub-type in secondary literature — recommend requiring an unusually
  strict "zero borderline flags anywhere" bar, CONFIDENCE = LOW-MEDIUM even for superficially clean cases.**

NORMAL_STRENGTH_MODEL_ALLOWED (all 從弱 sub-types) = **YES** (unconfirmed candidate reads as extremely 신약).

### 10.3 專旺格/전왕격 (曲直/炎上/稼穡/從革/潤下)

A narrower, stricter case than 從强 — requires near-total mono-element composition of the DM's OWN element,
typically via a completed 삼합/방합 in the branches. ENTRY = full trio/directional set of DM's element; stems
consistent (same or generating); 월령 squarely the matching season (treated as closer to mandatory than for
從强, since each pattern is season-anchored); no rooted controlling (克) element. DISQUALIFIERS = any rooted
controlling element; a 합/충 breaking up the trio set; misaligned 월령. BORDERLINE = partial (2-of-3) harmony
set (does not qualify — falls back to ordinary model, likely still reads strongly 신강 anyway); unrooted
controlling stem. NORMAL_STRENGTH_MODEL_ALLOWED = **YES**. CONFIDENCE = MEDIUM-HIGH only for a full, clean,
aligned, zero-controlling-root case.

### 10.4 Categories explicitly considered and excluded

- **化氣格** (stem-combination transformation structures) — NOT included; substantial, well-documented
  cross-school disagreement on completion conditions; **SOURCE_GAP**, recommend a dedicated follow-up research
  pass before any gate is added.
- **兩神成象格** — NOT included; thin classical grounding, inconsistently stated entry criteria. **SOURCE_GAP.**
- **從印格** — NOT included; doctrinally collapses into 從强 in mainstream treatment (印 generates the DM
  rather than opposing it, so it doesn't create the "must give up resistance" premise that defines true 從).
  Naming it separately risks exactly the unsourced-internet-convention red flag.

### 10.5 Gate output — three states, deliberately asymmetric

`NOT_QUALIFIED` / `SPECIAL_PATTERN_CANDIDATE_UNCONFIRMED` / `SPECIAL_PATTERN_CONFIRMED`. Reaching `CONFIRMED`
requires **every** relevant sub-check to independently agree with **zero** exceptions; any single ambiguity
(borderline root, unrooted opposing stem, partial harmony set) caps the result at `CANDIDATE_UNCONFIRMED`.
Both `NOT_QUALIFIED` and `CANDIDATE_UNCONFIRMED` route to the ordinary structural-strength model, unmodified —
the gate can only ever *add* a special-pattern verdict on top of a clean, fully-satisfied case; it can never
produce one by default or tie-break. A false special-pattern classification is treated as materially higher
risk than a missed one.

---

## 11. Structural reasoning sequence

### 11.0 Why a sequence, not a vote

**子평真詮** (LEVEL A): derives 격局 first from what is rooted/transparent out of the month branch's hidden
stems, then asks whether the structure is 成/敗, then 順用/逆用. Strength is asked *in service of* what the
structure needs — a conditional question, never an independently computed score matched to a label afterward.

**滴천수** (LEVEL A): its central diagnostic concept is 氣勢 — the qi-momentum of the *whole* chart read
holistically, repeatedly illustrating charts where naive counting misleads and the correct reading only
emerges from season+transformation+entanglement together.

**Consequence for architecture:** season (A) determines what "rooted" (B) and "supporting" (C) even mean in
context; rootedness (B) determines whether a nominal support/drain stem (C/D) has real force at all;
entanglement (F) can retroactively cancel what B/C/D provisionally found. A later step cannot be evaluated in
isolation from earlier ones. A parallel vote requires converting every factor into a context-free,
commensurable unit *before* comparing — doing so silently pre-answers the sequential questions with a fixed,
uncontextual weight, which is mechanically how the rejected 18-cell table produced arbitrary boundaries (same
raw counts, wrong meaning, because month-command context was discarded). **Numeric measurement may still
assist as a diagnostic aid inside a step; it is promotion of a count to final cross-step authority that is
rejected.**

### 11.1 The sequence

| Step | Question | Primary basis | Constrained by | Revised by |
|---|---|---|---|---|
| **A** | What seasonal prior does 월령 establish, and what structure does it point to? | 淵海子평 (월령=提綱), 子평真詮 (structure from month-branch transparency) | Frozen facts only | — (root of the tree) |
| **B** | Does the DM have a functional root, at what layer, in/out of season per A? | §5 (rooting doctrine) | A | F (may destroy a provisional root) |
| **C** | Which 인성/비겁 provisionally support the DM, and what is each one's own root/season status? | §6, 억부 conditional logic grounded in 子평真詮's 順用 | A, B | E, F |
| **D** | Which 식상/재성/관살 provisionally oppose/drain the DM, mirrored? | §7 | A, B | E, F |
| **E** | Of C/D's candidates, which are actually functional (not tied up, not itself cut off)? | 子평真詮 成/敗格; 滴천수 合而不化/沖而不去 | C, D | F |
| **F** | Do detected 형충회합 relations *materially* alter B/C/D — transform (合화) or merely bind (合絆); remove a root or fail against a mediated one (貪合忘沖)? | §8 | B, C, D, E | Feeds back into B/C/D as final revisions |
| **G** | Does the chart clear the special-structure gate? | §10 | B (exhaustive rootlessness/dominance), F (unclashed dominant element) | — (evaluated once, after B–F final) |
| **H** | Given A's prior and finalized (post-F) B/C/D/E, where does the chart sit relative to 中화? | 滴천수 氣勢/中화 holistic synthesis | A–G (if G clears, H is bypassed — §12.4) | — |
| **I** | Which of the seven bands, with what confidence/uncertainty state? | §12/§13 | H | — |

**Not reorderable, not parallelizable** (§11.0's argument applies at every step boundary — see the source
cluster's full reasoning for each transition, condensed here for space). Numeric counts remain legitimate
*inside* a step (e.g. "how many post-F functional roots survive" is a fair internal fact); what is forbidden
is any such count becoming the cross-step or final determinant. Factor-vote, majority-vote, simple
weighted-sum, and single-threshold approaches are all explicitly rejected as final authority for the reasons
above — each requires the very context-free conversion doctrine argues against, and each was the literal
mechanism of the rejected candidate's failure.

---

## 12. Seven-band classification semantics

### 12.1 Three-stage structure

**Stage 1** (WEAK/BALANCED/STRONG) — the sign of H's synthesis. **Stage 2** (intensity within class) — not a
magnitude score; the qualitative question of how *decisive* the tilt is (concentrated, multiply-reinforcing
evidence vs. a narrow single-step tilt a different reasonable F-call could flip). **Stage 3** (seven bands) —
극신약/신약/중화신약/중화/중화신강/신강/극신강; WEAK and STRONG each split into three intensity levels,
BALANCED occupies the center alone.

### 12.2 Adjacent-pair distinctions — structural evidence, never score bands

| Boundary | Structural evidence (post B–F) |
|---|---|
| 극신약 vs 신약 | 극신약: zero surviving functional roots after F, no functional 인성 survives E, opposition in-season and unclashed. 신약: at least one functional root/partial functional 인성 survives, even at a lesser layer — undefended-but-not-void vs. defended-but-outmatched. |
| 신약 vs 중화신약 | 신약: opposition clearly dominant relative to the DM's post-F/E functional side — seasonally and functionally ahead, not merely more numerous. 중화신약: DM's side has gained a genuinely functional, in-season/정기-layer element such that the outcome is contested, and/or opposing force is dispersed across multiple outlets rather than concentrated. |
| 중화신약 vs 중화 | 중화신약: qualitative edge still tips to opposition. 중화: no single step (A–F) produces a decisive tilt either way — genuine indeterminacy, frequently co-occurring with STRENGTH_BORDERLINE. |
| 중화 vs 중화신강 | Mirror. |
| 중화신강 vs 신강 | Mirror of 신약/중화신약: opposition's post-E/F functional presence negligible or clearly outmatched, support clearly in-season and functionally rooted/transparent — decisive, not marginal. |
| 신강 vs 극신강 | 신강: support dominant, but at least one opposing element retains some functional standing after E/F. 극신강: every opposing candidate has failed E or been cancelled by F, or exists only nominally — opposition not merely outmatched but effectively absent as a functional force. |

### 12.3 Two structural caps

**Cap 1 — a genuinely rootless DM cannot reach (극)신강.** (극)신강 requires functional support (a surviving B
root and/or E-cleared in-season 인성). Visible-but-unrooted stems are 虛 (empty) per 滴천수's rooting doctrine
and cannot ground a strong verdict — exactly the raw-stem-count fallacy this document rejects. The **only**
route to a strong-side verdict for a rootless DM is 從强格/從兒格 through the special-structure gate (§10) —
and that is **not** a seven-band label, it is a separate verdict category. *Non-exception:* 從强格 involves the
DM sitting amid dense peer/resource qi — the DM itself being densely rooted, satisfying B at the extreme, not
a rootless DM reaching strength another way.

**Cap 2 — a genuinely multiply-rooted, seasonally-supported DM cannot reach (극)신약.** Mirror: (극)신약
requires the absence of functional support after B–F. A DM with roots surviving F, backed by A, has already
cleared the bar (극)신약 requires to be unmet. *Non-exception:* 從弱/從殺/從財格 require the opposite premise
(B must find no surviving root as precondition) — structurally cannot be invoked against a multiply-rooted
chart, unless F discovers all those roots simultaneously destroyed, at which point the cap's own precondition
(post-F root count effectively zero) has failed to obtain, not been contradicted.

### 12.4 Special-structure verdicts are a separate output category

When §10's gate cleanly clears, the output is a **named special-structure verdict** (從格/化格/專旺格), not a
seven-band label. This keeps the ladder's semantics clean (every label presupposes ordinary 억부-style
contestability) and prevents special structures being detected by one or two loose conditions.

---

## 13. Uncertainty model

A verdict is exactly one of a confident seven-band label, OR one of five states — which may narrow to an
adjacent-pair range or a named open question, never manufacture a single false-precise label:

| State | Trigger |
|---|---|
| **STRENGTH_CONFIDENT** | Directional tilt independently reinforced at multiple steps (A, B/E, D/E all agree), F introduces no material contradiction, G's gate cleanly closed (not near-clearing). Seven-band label asserted at face value. |
| **STRENGTH_BORDERLINE** | Same-method evidence genuinely close (e.g. A favors opposition but B/E finds a strong in-season root; or F's call on a marginal 합/충 is itself uncertain). Output = an adjacent-pair range (e.g. "신약 or 중화신약"), not a forced single label. |
| **SPECIAL_PATTERN_UNCERTAIN** | §10's gate is close but unresolved (e.g. apparently rootless DM but F leaves one contested 여기-layer root; dominant element's clash-freedom itself contested). Because a special-structure claim inverts the entire polarity of what the chart "needs," a near-miss must be flagged explicitly — never silently fall back to the ordinary ladder as though the question never arose. |
| **DOCTRINE_CONFLICT** | Different legitimate schools would weigh the **same** finalized evidence differently at a specific step (e.g. how much standing a 여기-layer root deserves; a 格局派 vs 億扶派 reading of the same stems). Distinct from BORDERLINE: same-method-close-evidence vs. different-method-same-evidence-different-conclusion. Must name which schools disagree and how — never silently averaged. |
| **INSUFFICIENT_STRUCTURAL_EVIDENCE** | A precondition earlier in the sequence is unresolved for reasons *outside* the chart's own ambiguity — specifically, the current frozen fact layer computes Step A's phase from the month branch's primary element only, without 사령/full qi-tier weighting. Applies where a boundary-birth case is plausibly sensitive to true 사령 precision. This is an honesty valve about **engine fact coverage**, kept distinct from states 1–4 so a future fact-layer upgrade can specifically target flagged cases. |

**Hard rule:** states 2–5 must never be collapsed into a single seven-band point-label as if resolved.

---

## 14. Evidence contract

Every strength verdict must expose:

- **SUPPORTING_FACTS** — raw structural facts (frozen layer + B–F interpretive layer) favoring the DM's own
  side; facts only, carrying established qualifiers (root exists; layer; in/out season; survived/cancelled by
  F), no evaluative adjective beyond those.
- **COUNTER_FACTS** — mirror, opposing side.
- **DECISIVE_FACTORS** — the specific named steps (A–G) that actually drove the H/I verdict, e.g. "Step A:
  month command squarely favors 관살; Step E: candidate 인성 found non-functional (재극인)." Auditable and
  quotable, not a black box.
- **BORDERLINE_FACTORS** — the specific steps where evidence was genuinely close/contested, feeding §13's
  BORDERLINE/DOCTRINE_CONFLICT states; must name which step and why.
- **SPECIAL_PATTERN_STATUS** — one of `NOT_APPLICABLE` / `CONSIDERED_AND_REJECTED` (name which condition
  failed) / `SPECIAL_PATTERN_UNCERTAIN` / `CONFIRMED`.
- **DOCTRINE_SOURCE** — for each DECISIVE_FACTOR (ideally each BORDERLINE_FACTOR): which named doctrinal
  principle licensed that step's interpretation, plus its SOURCE_LEVEL (A/B/C/D). This is the field that
  prevents a future maintainer from silently reintroducing an unsourced heuristic — the original defect the
  prior candidate was rejected for.
- **CONFIDENCE** — exactly one of §13's five states, **never a bare numeric score**. If a numeric value is
  wanted downstream purely for UI ordering, it must be *derived from and subordinate to* the named state, never
  computed independently — this directly forbids reintroducing "confidence = count of agreeing factors."

### Worked example (structure only — not adopted doctrine for any real chart)

**FACT:** "Day Master 甲 has a structural root in a 寅 branch, at the 정기 layer (寅's primary hidden stem is
甲)." **FACT:** "The month branch is 申 (Metal); its 정기 hidden stem 庚 stands in a 七殺 relation to 甲."
**INFERENCE** (Step A+E synthesis, requires judgment): "Because 申's season is Metal-dominant and the DM's
only root (寅) lies outside the governing season, that root's vitality is diminished relative to a
wood-governing month — it exists (a FACT) but does not carry full seasonal force (an inference about
vitality). If Step E finds no unclashed 인성 rooted or transparent anywhere, the controlling faction is judged
functionally dominant and largely unmediated — contingent on E's search coming back empty, not a fact in
itself." **VERDICT** (Step I): "중화신약 — the DM retains one functional, if seasonally weakened, root (Cap 2's
floor not met), but the seasonally dominant, unmediated controlling faction tips the balance to the weak side
of center." A runtime that skips straight from the two FACTs to the VERDICT — without naming which judgment
call produced the tilt — cannot populate DECISIVE_FACTORS/DOCTRINE_SOURCE, and silently re-collapses into
"root exists → strong" even if the final label happens to look reasonable.

---

## 15. Facts vs. inferences boundary

| Layer | Owns | Example |
|---|---|---|
| **FACT** | Frozen deterministic calculation layer — never invented, never school-dependent | "Day Master has a root in branch X at the 정기 layer"; "the month branch is 申"; "a 沖 relation is detected between branches Y and Z" (detection only) |
| **INFERENCE** | The doctrine reasoning sequence (§11, steps A–H) — school-aware, sourced, graded by SOURCE_LEVEL | "That root's vitality is diminished because it sits outside the governing season"; "the clash on branch Y destroys the root it hosted because the branch is isolated and the clashing branch is seasonally dominant" |
| **VERDICT** | Step I only — the seven-band label (or special-structure category, or an uncertainty state) | "중화신약", "SPECIAL_PATTERN_CANDIDATE_UNCONFIRMED (從財格)" |

No layer may be skipped. A restored/persisted verdict (mirroring this session's G6 kernel-freeze discipline
for the divination reasoning kernel) must, in a future implementation phase, be reconstructable/verifiable
from FACT+INFERENCE, never trusted as an opaque VERDICT string — the same "graph is sole authority" principle
already enforced for the divination kernel's persisted state.

---

## 16. Repository fact coverage

Full detail (exact function signatures, file paths, per-relation-type breakdown, and the fact-vs-rejected-
inference flagging of every existing strength-adjacent file) is in the audit performed for this document and
reproduced in full in `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md` §1–3. Summary:

**Already available, clean, reusable FACT (safe to build new doctrine on):** month command / 旺相休囚死 (month
branch primary element only — see gap below), 지장간 with 여기/중기/정기 role tags, same-stem rooting with
tier preserved (`rootingTransparency.ts`), ten-god calculation and visible/hidden role-composition tallying
(`dayMasterStrengthInputs.ts` — explicitly the safest, most reusable module in the repo), all 8 branch/stem
relation types at DETECTION level (`pillarRelations.ts`, `natalRelations.ts`), raw five-element distribution,
full 대운/세운/월운 pillar+ten-god+relation facts.

**Missing (net-new deterministic facts needed before implementation):** 사령 day-count sub-period calculator;
standalone same-element (득지) rooting fact decoupled from the rejected file; a joiner between transparency and
ten-god-side facts; a standalone general seasonal-phase utility (logic exists, not exposed generally); a
root-vulnerability structural fact linking `pillarRelations.ts` detections to `rootingTransparency.ts` roots
(currently zero linkage exists — confirmed by direct inspection); special-pattern prerequisite facts (raw
ratios only, no detector exists at all); a 조후/climate fact module (does not exist anywhere in the repo —
`extremeSeason` is a declared-but-unproduced input field); a 성립/발동 (does-this-transformation-actually-apply)
assessment layer for 합/합화/삼합/방합, currently explicitly out of scope by the frozen layer's own design.

**Explicitly tainted, must not be reused:** `natalStrength.ts`'s `RULE_TABLE`, `rootingState()` bucketing,
support/drain dominance comparison, and agreement-count confidence; `currentStrength.ts`'s
`buildCurrentStrengthContext()` (internally calls the rejected `evaluateNatalStrength`). `dayMasterStrengthInputs.ts`
itself is safe; only `natalStrength.ts`'s consumption of its counts (the dominance comparison) is rejected.

---

## 17. Adversarial doctrine cases

40 cases. Each specifies FACT CHANGE / EXPECTED STRUCTURAL EFFECT / WHAT MUST NOT HAPPEN / DOCTRINE BASIS.
These are doctrine-conformance cases (does the *reasoning*, applied to a described fact pattern, reach a
defensible conclusion) — not yet a golden benchmark against real charts, which requires expert validation in a
later phase.

| # | Category | FACT CHANGE | EXPECTED STRUCTURAL EFFECT | WHAT MUST NOT HAPPEN | DOCTRINE BASIS |
|---|---|---|---|---|---|
| 1 | 得令 but structurally weak | DM 旺 by month, but zero root elsewhere and the month branch itself is clashed (沖) | Reduced weight on the seasonal prior; verdict trends toward 신약/중화신약 depending on opposition | Verdict locked to 신강+ purely because month = 旺 | §4.4(1), §5.4 |
| 2 | 失令 but structurally strong | DM 死/囚 by month, but multiple intact, unclashed 본기-tier roots elsewhere plus rooted transparent 비겁 | Verdict trends 신강/중화신강 despite 실령 | Verdict locked to 신약 purely because month ≠ 旺/相 | §4.4, §4.6, §5.7 |
| 3 | One root vs. multiple roots (non-additive) | Chart A: one 본기-tier, seasonally vital, unclashed 월지 root. Chart B: three scattered 여기-tier roots in non-combining branches | Chart A may rate equal or stronger than Chart B despite fewer roots | Chart B automatically rated stronger purely by root COUNT | §5.7 |
| 4 | Root present but functionally damaged | A same-stem root exists in an isolated branch that is then clashed with no mediation | Root tagged WEAKENED/DESTROYED, not counted at full force | Root counted as fully functional because "root = +1" regardless of clash | §5.4 |
| 5 | Unrooted visible support | A visible 인성 stem with no root anywhere, distant column (년간) | Support tagged FLOATING, contributes materially less than a rooted equivalent | Support counted identically to a rooted 인성 in the same tally | §6.1, §6.2 |
| 6 | Strong output drain | Multiple rooted, seasonally-vital 食傷 stems, DM otherwise moderate | Verdict trends toward 신약/중화신약 if unmediated; 신강 with 食神制殺 usefulness noted separately if a controlling 관살 is present that 食傷 checks | Output drain treated identically regardless of whether it is checking a real 관살 threat (conflating strength-axis and favorability-axis, §7.4) | §7.1, §7.4 |
| 7 | Strong officer pressure | Rooted, seasonally-vital 七殺 with no 食傷/印 mediation | Verdict trends 신약/중화신약; disposition-flagged as unchecked 七殺 (severity annotation, not a strength-magnitude change) | 正官 and 七殺 treated as numerically identical drain | §7.1 |
| 8 | Strong wealth burden | Multiple rooted 財 stems generating a rooted 官殺 (財生官殺 chain) | Opposition faction tagged as reinforced/chained, not three independent unrelated drains | 財 and its generated 官殺 counted as two unrelated, unlinked drain units | §7.2 |
| 9 | Balanced chart | Season mixed (相), one moderate root, one moderate rooted support stem, one moderate rooted opposing stem, no decisive tilt at any step | 중화, STRENGTH_BORDERLINE or STRENGTH_CONFIDENT depending on how cleanly A–F resolve | Forced into a definite one-sided band merely because the engine must output *something* precise | §12.2 (중화 boundary), §13 |
| 10 | Near-balanced weak | Same as #9 but opposition has a slight, genuine functional edge post-F | 중화신약 | Forced all the way to 신약 or flattened to 중화 | §12.2 |
| 11 | Near-balanced strong | Mirror of #10 | 중화신강 | Forced to 신강 or flattened to 중화 | §12.2 |
| 12 | Apparent special-pattern candidate, rejected | DM appears rootless, but one 정기-tier rooted 비겁 branch is found on exhaustive scan | `NOT_QUALIFIED` (SG-0 hit) → ordinary model; likely 극신약/신약 depending on that root's own vitality/survival | Special-pattern verdict issued despite a rooted disqualifier | §10.0 (SG-0), §10.5 |
| 13 | Genuine special-pattern candidate | DM rootless on exhaustive scan, month and all branches dominated by one non-DM element, that element's own root-competitors absent | `SPECIAL_PATTERN_CONFIRMED` (specific sub-type per §10.1–10.3) if EVERY sub-check independently clears | Ordinary seven-band label applied instead of the special-structure output category | §10.5, §12.4 |
| 14 | Disputed special-pattern boundary | DM rootless, dominant element aligned, but one branch carries only a 여기-tier root of the opposing element with contested clash status | `SPECIAL_PATTERN_UNCERTAIN` | Silently defaulting to either CONFIRMED or the ordinary ladder without flagging the near-miss | §10.0 (SG-0b), §13 |
| 15 | Combination that does NOT transform | Two adjacent branches form a 六合 pair, but the transformed element lacks seasonal support and a third branch clashes one member | Tagged 合而不화 — FUNCTIONAL binding only, original element's root function reduced but not erased | Root/support treated as having transformed into the new element | §8 (合 row), §8.7 conditions 1&3 failing |
| 16 | Transformation candidate | Adjacent 干합 pair, transformed element seasonally supported, no breaking clash, non-DM stems | Tagged 合화 — STRUCTURAL transform; downstream rooting/support re-evaluated against the new element | Transformation asserted from mere adjacency alone, ignoring seasonal-support/no-breaking-force preconditions | §8.7 |
| 17 | Clash affecting root | A 본기-tier root branch is clashed by an adjacent branch with no mediation and no reinforcement | Root tagged WEAKENED or DESTROYED (graded, per relative vitality of the two branches) | Uniform "root survives regardless of clash" or uniform "any clash = full destruction" without grading | §5.4, §8 (沖 row) |
| 18 | Clash not destroying structural support | Same clash as #17, but a third branch combines with one clash member (貪合忘沖) | Root tagged MEDIATED — reduced but non-zero force | Root treated as fully destroyed, ignoring the mediating principle | §8 (沖 row, 貪合忘沖) |
| 19 | Raw element count misleads | DM element appears 4 times across the 8 stem/branch slots (nominal high count), but all 4 occurrences are either 여기-tier hidden stems in seasonally-dead branches or floating unrooted stems | Verdict does NOT default to 신강 merely from the raw count; functional analysis (§5, §6) may still yield 신약/중화신약 | Raw element count used as a shortcut proxy for strength | §3 (concept #1), §5.1 |
| 20 | Hidden stems materially matter | DM has no visible same-element stem anywhere, but a 본기-tier hidden root exists in an unclashed, seasonally-vital branch | Root counted at full functional weight despite being hidden-only | Hidden-stem roots discounted or ignored relative to visible stems purely because they are "hidden" | §5.1, §5.2 |
| 21 | Climate and strength must remain separate — hot chart | DM is Fire, born in 巳 month (peak Fire season, structurally 신강-favorable), chart also shows extreme heat/dryness by the (separate) climate fact object | Strength verdict driven purely by §3–§12 structural facts; climate fact reported separately, flagged only for downstream Yongshin | Climate ("needs water to cool down") used to lower/raise the strength band itself | §9 |
| 22 | Climate and strength must remain separate — frozen chart | DM is Water, born in 子 month (peak Water season), chart shows extreme cold with no Fire anywhere | Same structural-strength verdict logic as any other 旺-season DM; climate fact ("frozen, needs Fire to thaw for functional use") reported as a separate Yongshin-relevant fact | Structural strength downgraded because the chart is climatically "unbalanced" | §9, CS-4's "frozen water" example |
| 23 | 節氣-boundary birth, residual qi | Birth falls within a few days of the boundary into a new month; month branch nominally supports DM, but the residual 餘氣 of the prior (opposing) month plausibly still governs | `INSUFFICIENT_STRUCTURAL_EVIDENCE` if a 사령 calculation is not yet available; if available, seasonal reading based on true governing qi-tier, not the new month's nominal label | Full-confidence 旺/相 label asserted purely from the new month's nominal element, ignoring boundary proximity | §4.2, §13 |
| 24 | 사령 tier mismatch inside the month branch | Month branch's 본기 nominally supports DM, but birth date's day-count places governance in a 중기/여기 tier of a different element | Root/seasonal reading uses the ACTUALLY governing tier, not the nominal 본기 | Nominal 본기 assumed governing regardless of day-count position | §4.2, §5.2–5.3 |
| 25 | Multiple weak roots vs. one strong root, escalation-adjacent | Three scattered branches happen to complete a 방합 trio of the DM's own element | Escalation flagged toward special-structure territory (§10 handoff), not merely "MULTIPLE roots, cap at 중화신약" | Treated as an ordinary MULTIPLE-bucket root case, ignoring the completed directional set's structural significance | §5.7, §10 boundary note |
| 26 | Contested combination (爭合) leaves support undecided | A potential support stem's combination partner is flanked by two competing suitor stems | Support stem NOT flagged fully NEUTRALIZED; residual function graded conservatively as uncertain, not zeroed | Combination assumed to complete cleanly and neutralize the support stem outright | §6.4 |
| 27 | Direct 克 suppressing support output | A rooted 인성 stem is directly flanked and controlled by an adjacent 관살 stem, no combination involved | 인성's functional output tagged suppressed, independent of its own rootedness fact | Root fact alone treated as sufficient — suppression channel ignored | §6.5 |
| 28 | Stem-level vs. branch-level independence | A rooted support stem is 合거'd (combined away) at the stem level; its ROOT branch itself is untouched by any relation | Root fact at the branch level persists unchanged; only the STEM's functional output is flagged reduced | Root fact deleted or discounted merely because the STEM was combined away | §6.6 |
| 29 | Floating support with proximity | An unrooted 비겁 stem sits in the 시간 column (adjacent to DM) vs. an identical unrooted stem in 년간 (distant) | 시간 case graded with somewhat higher qualitative contribution than 년간 case, both still categorically lower than a rooted stem | Both floating stems treated identically regardless of proximity, OR either treated as equal to a rooted stem | §6.2 |
| 30 | 財 reinforcing 官殺 without a visible 官殺 | Chart shows multiple rooted 財 stems, no visible 官殺 stem anywhere, but a 官殺-element hidden stem exists in a branch | Opposition faction assessment notes the latent 財生官殺 reinforcement potential rather than treating 財 as an isolated, unlinked drain | 財 evaluated in total isolation from its generative relationship to 官殺 | §7.2 |
| 31 | 食神制殺 usefulness does not change strength-axis magnitude | Rooted, vital 食神 checking a rooted, vital 七殺 | Strength-axis: 食神's drain on DM is counted at full functional force per §7.3's criteria, unaffected by its usefulness against 七殺; favorability-axis (out of scope here) notes the protective relationship separately | 食神's drain discounted or zeroed on the strength axis because it is "protecting" the DM from 七殺 | §7.1, §7.4 |
| 32 | 正官 vs. 七殺 disposition does not become a magnitude multiplier | Two charts, structurally identical rooted/seasonal officer-star presence, one 正官 one 七殺 | Both weighed at comparable strength-axis magnitude per §7.3's functional-force criteria; disposition difference surfaces as a qualitative severity flag, not a different drain weight | 七殺 assigned an arbitrary higher numeric drain weight than 正官 with no sourced magnitude basis | §7.1 (explicit warning against this exact conflation) |
| 33 | Special structure disqualified by a hidden (not visible) rooted opposing element | Chart otherwise resembles 從强, but a branch's 지장간 contains a rooted opposing-element hidden stem at 본기 tier, no visible occurrence of it anywhere | `NOT_QUALIFIED` — SG-0 applies to a genuinely rooted opposing element regardless of whether it is visible or hidden-only | Special-pattern confirmed because the disqualifying element "isn't visible," ignoring the hidden root | §10.0 (SG-0), §5.1 |
| 34 | 從兒格 strict bar — missing outlet | Chart shows dominant rooted 食傷, DM rootless, but no 財 anywhere (dead-end 식상) | `NOT_QUALIFIED` for 從兒 specifically (missing outlet is a disqualifying condition unique to this sub-type) — chart re-routes to ordinary model or a different 從弱 sub-type if its conditions independently hold | 從兒 confirmed purely from a dominant 食傷 with no outlet check | §10.2 (從兒격 additional entry condition) |
| 35 | Seasonal vitality is five states, not two | DM's element is in a 休 (rest) relation to the month (DM generates the season), distinct from 死 (season overcomes DM) | 休 and 死 tagged and weighted as distinct degrees of seasonal disadvantage, not collapsed into one "DRAIN"/"실령" bucket | 休 and 死 (and 相 vs. 旺) treated as equivalent binary states | §4.3 |
| 36 | 12운성 disagreeing with 지장간 rooting | A branch is the DM's 帝旺 by 12운성 placement, but offers only a 여기-tier hidden-stem root by 지장간 accounting | Both facts surfaced separately, not silently merged into one rooting number; the 지장간-based tier grading (§5.2) governs the ROOTING axis specifically | 12운성 vitality used interchangeably with 지장간 root-tier grading as if the same measurement | §5.8 |
| 37 | Partial (半合) trine missing the center branch | Two of three 삼合 branches present, but NOT including the trio's 帝旺/center branch | Graded as a weaker partial combination than a center-inclusive half-combination or a full trine; does not reach 專旺-territory escalation | Partial trine treated identically to a full trio, or identically regardless of whether the center branch is included | §5.5, §8 (會 row), §10.3 (BORDERLINE) |
| 38 | Confidence must reflect agreement, not be computed by counting alone | A's seasonal prior, B's root finding, and D/E's opposition reading all independently reinforce the same direction, with no F-level contradiction and G cleanly closed | `STRENGTH_CONFIDENT` — but the state is derived from the STRUCTURE of agreement (which named steps, why) not from a bare tally | Confidence computed purely as "N of M factors agree" without naming which steps and why (the rejected candidate's exact defect) | §13 (STRENGTH_CONFIDENT trigger), §14 (DECISIVE_FACTORS) |
| 39 | Doctrine conflict surfaced, not averaged | A 여기-tier root's standing is the sole factor separating two adjacent bands, and 格局派-style and 億扶派-style readings of that root's sufficiency genuinely diverge | `DOCTRINE_CONFLICT` state, naming both schools and their diverging conclusions | The two schools' views silently blended into one "compromise" label | §13 (DOCTRINE_CONFLICT), Mandatory Discipline (no silent averaging) |
| 40 | Legacy engine gap honestly flagged | A chart's verdict would plausibly change under a full 사령 day-count calculation, but the engine only has the month branch's primary-element phase available | `INSUFFICIENT_STRUCTURAL_EVIDENCE`, explicitly distinct from a genuine chart-level BORDERLINE case | Verdict issued at full confidence despite a known, named engine fact-coverage gap that could plausibly change it | §13 (INSUFFICIENT_STRUCTURAL_EVIDENCE), §16 |

---

## 18. Metamorphic test plan

Specified for a future implementation phase — **not implemented as runtime tests in this document.**

| # | Transformation | Expected invariant | Rationale |
|---|---|---|---|
| M1 | Same chart, minus one functional (unclashed, in-tier) root | Strength must not become STRONGER; band must stay the same or move toward WEAK | Removing support can never help — a monotonicity floor on Axis C |
| M2 | Same chart, add a genuinely rooted, seasonally vital support stem (no transformation triggered) | Weakness must not increase; band must stay the same or move toward STRONG | Adding functional support can never hurt — monotonicity ceiling |
| M3 | Same chart, change only display/rendering wording (Korean phrasing, labels) | Identical strength verdict, identical evidence contract facts | Verdict is a function of structural facts, never of presentation |
| M4 | Same chart, change only the month branch (holding all else fixed) | Seasonal reasoning (Step A) must be fully recomputed; downstream steps B–I must re-run against the new prior, not merely patch the old verdict | Step A is the root of the reasoning tree (§11.1) — everything downstream is conditioned by it |
| M5 | Same chart, add a NOMINAL support stem with zero root and zero proximate placement | Must NOT automatically shift a full strength band; at most a marginal, explicitly-flagged BORDERLINE-adjacent nudge | Presence without function must not move the verdict (§6.1–6.2) — direct test of the existence-vs-function distinction |
| M6 | Same chart, reorder how facts are supplied to the reasoning pipeline (e.g. branches processed in a different array order) | Identical verdict, identical evidence contract, regardless of internal iteration order | Doctrine is order-independent with respect to *input ordering* (distinct from the doctrinally-mandated *reasoning-step* order, §11.2) — mirrors the divination kernel's own G2 order-invariance gate |
| M7 | Same chart, add a clash that mediates (貪合忘沖) an existing clash on a root branch | Root's survival grade must improve (e.g. DESTROYED → MEDIATED or WEAKENED), never worsen, from the addition of a mediating relation | Mediation is doctrinally protective, never destructive (§5.4, §8 沖 row) |
| M8 | Same chart, add a rooted opposing element that would break an otherwise-qualifying special structure | Special-pattern gate output must move from CONFIRMED/CANDIDATE toward NOT_QUALIFIED, never the reverse | SG-0's disqualifying force is monotonic — one genuine rooted opposition is always sufficient to break a pattern (§10.0) |
| M9 | Same chart, shift the birth time only enough to cross a 節氣 sub-period boundary relevant to 사령 (once that fact exists) | Root/seasonal tier assessment may change; verdict must recompute from Step A onward, not merely adjust a cached number | 사령 status is a genuine input to Step A/B, not a cosmetic detail (§4.2, §5.3) |
| M10 | Same chart, run twice with identical input | Byte-identical verdict, evidence contract, and confidence state both times | Determinism — the reasoning sequence is a pure function of the chart facts, consistent with the frozen kernel's own determinism discipline |

---

## 19. Explicit rejected approaches

1. **The prior `natalStrength.ts` candidate in its entirety** — RULE_TABLE, root-count bucketing, composition
   dominance comparison, agreement-count confidence. Confirmed rejected by the original audit; re-confirmed
   independently by this document's own review (§1, §16).
2. **`currentStrength.ts`'s `buildCurrentStrengthContext()`** as a whole — internally calls the rejected
   `evaluateNatalStrength`; its two-layer architecture (immutable natal baseline + separate luck-influence
   overlay) is conceptually sound and may be reused as a *pattern*, but the label computation underneath it
   must be entirely replaced.
3. **Any small fixed lookup table** ({month-state × rooting-bucket × composition-bucket} → label, or similar)
   as final authority — rejected structurally, not merely because the specific prior table was wrong (§11.0,
   §11.3).
4. **Support-count vs. drain-count comparison** as a strength-magnitude test, on either side (support or
   opposition) — rejected symmetrically (§7.3's explicit corrective).
5. **Confidence as a raw count of agreeing factors** — rejected; confidence must be a named uncertainty state
   with a structural trigger (§13), never a tally.
6. **형/害/파 as strength-magnitude inputs** — rejected as LEVEL D; thin/contested classical grounding for any
   qi-strength effect; retained (if at all) as advisory/documentation-only annotations, never feeding the
   reasoning sequence.
7. **Climate (조후) as a strength input, in any form** — rejected absolutely (§9); climate is a separate fact
   object for downstream Yongshin only.
8. **Special-structure detection from one or two loose conditions** — rejected; the gate (§10.5) requires every
   relevant sub-check to independently clear with zero exceptions to reach CONFIRMED.
9. **化氣格 and 兩神成象格 gates** — not adopted in this phase; classical grounding for precise trigger
   conditions judged too thin/disputed to encode responsibly; explicit SOURCE_GAP, deferred to a follow-up
   research pass (§10.4).
10. **Any specific numeric table** for 사령 day-count sub-periods, or for a per-cell 궁통보감 climate-remedy
    table — not adopted; multiple classical/near-classical editions disagree, and no single table is treated
    as authoritative without being tied to a specific named edition (§4.2, §5.2, §9).

---

## 20. Implementation prerequisites

Full P0/P1/P2 gap classification in `MYUNGRI_STRENGTH_V1_IMPLEMENTATION_GAP.md`. Summary of what must exist
before a runtime strength engine can be responsibly built:

1. A sourced, edition-attributed 사령 day-count sub-period table (P0 — blocks Step A/B precision and the
   INSUFFICIENT_STRUCTURAL_EVIDENCE uncertainty state's intended narrow scope).
2. A root/support-integrity judgment layer connecting the existing relation-DETECTION facts
   (`pillarRelations.ts`) to the existing rooting facts (`rootingTransparency.ts`) — "does this clash/
   combination actually remove/weaken/transform this specific root" (P0 — blocks essentially all of Steps
   E/F, and therefore Cap 1/Cap 2 and the seven-band boundaries in §12.2).
3. A standalone, non-tainted same-element (득지) rooting fact function, decoupled from the rejected file (P0 —
   currently only computed inline inside `natalStrength.ts`).
4. A 조후/climate fact module (P1 — not required to gate an initial strength-only implementation per §9's
   separation mandate, but required before any Yongshin work begins).
5. Special-pattern prerequisite fact functions (ratio/count-based only, not threshold/verdict) (P1 — required
   before §10's gate can be implemented; the ordinary strength model per §3–§8/§11/§12 can, in principle, ship
   independently with the gate returning `NOT_QUALIFIED` unconditionally as an honest interim state, though
   this is a product decision outside this document's scope).
6. A standalone general seasonal-phase utility, decoupled from the "day master" framing (P2 — thin
   refactor/extraction of existing logic, not new theory).
7. A revealed-hidden-stem × ten-god-side joiner fact (P2 — convenience joiner over two already-existing facts).

---

## 21. Yongshin dependency notes

Explicitly out of scope to select or implement. Documented for the future Yongshin phase:

- **Validated structural strength** (this document's §3–§14 output) — the primary input Yongshin selection
  depends on; must not be computed by Yongshin itself.
- **Special-pattern status** (§10) — a confirmed special structure inverts what the chart "needs" entirely
  (from balance-restoration to reinforcing/preserving the dominant force); Yongshin logic must branch on this
  before doing anything else.
- **Climate/조후 facts** (§9) — 조후용신 candidate ranking and 병약용신 severity weighting both need the
  climate fact object as a primary input, independent of the strength verdict.
- **Functional-force discounts for specific candidate elements** (e.g. "this Water root exists but is
  climatically frozen") — needed to evaluate whether a candidate support/control element will actually work
  as a remedy; must not feed back into the strength classification itself (§9, CS-4).
- **Climate-vs-structure conflict surfacing** — cases where 조후 and 격局/억부 recommend opposite elements are a
  legitimate, sourced disagreement (§9, CS-3) requiring explicit reconciliation or dual surfacing downstream,
  never silent averaging.
- **通關 (bridging-element) prerequisites** — not researched in this phase; flagged as a likely future Yongshin
  research topic, not investigated here.
- **病藥 (disease/medicine) framing**, if adopted — noted as a real classical framework (§9, CS-2) available to
  a future Yongshin phase; no decision on adoption is made here.

---

## 22. Unresolved doctrine questions

Carried forward, explicitly not resolved by this document:

1. Exact 사령 day-count sub-period boundaries per branch — multiple classical/near-classical editions disagree;
   requires selecting and citing one specific named edition (§4.2, §5.2).
2. Exact severity/weighting of a 여기-tier vs. 중기-tier root relative to positional weight (§5.2 vs §5.6) —
   whether tier or position should dominate when they conflict is not settled across sources.
3. Precise pillar-distance decay convention for 沖 severity — real, widely-taught, but no sourced numeric
   curve exists; must remain ordinal (adjacent > distant), not quantified (§8, 沖 row).
4. DM-involvement default for 合화 (§8.7 condition 5) — genuinely disputed across lineages; this document
   recommends a conservative default but explicitly flags it as a documented engineering choice, not resolved
   classical consensus.
5. Whether 방합 doctrinally outranks 三合 in force — a real, commonly-taught point but disputed by some
   commentators (§8, 會 row).
6. Whether yin stems run the 12운성 cycle 역행 or 순행 — a genuine, unresolved traditional-vs-modern-critical
   disagreement (§5.8); flagged for integration-level decision, not resolvable within strength doctrine alone.
7. 化氣格 and 兩神成象格 entry conditions — deliberately not researched to adoptable confidence in this phase
   (§10.4); requires a dedicated follow-up research pass.
8. Whether 從財格 with simultaneous strong, rooted 官殺 (a 財-官 continuous flow) should qualify or be
   disqualified — schools disagree; this document defaults conservative (does not qualify cleanly) without
   claiming that default is the only defensible position (§10.2).
9. Precise threshold for how many/how reinforcing scattered weak roots must be before they approach
   special-structure-adjacent escalation (§5.7, §10 boundary) — deliberately left qualitative per doctrine's
   own anti-additive stance; whether a future implementation needs a named ordinal category here (beyond
   §5.1's CONFIGURATION tag) is an open engineering question, not a doctrine gap per se.
10. Whether 刑/害/파 should be retained even as advisory-only annotations, or dropped from the system entirely
    — a product decision more than a doctrine question, since this document already excludes them from any
    strength-authority role (§8).
