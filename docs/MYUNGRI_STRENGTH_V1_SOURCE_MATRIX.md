# MYUNGRI_STRENGTH_V1.3 — Source Matrix (Final Doctrine Closure)

> Companion to `MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md`. **Reconciled in V1.3 (audit finding D9).**
> V1.2 left this file knowingly inconsistent with the corrected doctrine — six rows contradicted it outright
> and the citation-layer vocabulary had no column at all, which made the layer discipline unenforceable and
> therefore decorative. Every affected row is corrected below.
>
> ## Citation layer vocabulary (new column, V1.3)
>
> | `TEXT_LAYER` | Means |
> |---|---|
> | `ORIGINAL_TEXT` | The classic's own verse/prose (滴天髓, 子平真詮, 淵海子平, 三命通會, 窮通寶鑑) |
> | `YUANZHU` (原注) | The received interlinear note. Traditionally attributed to 劉基; attribution contested |
> | `NAMED_COMMENTARY` | A named commentator's own words (任鐵樵, 徐樂吾), never merged into the base text |
> | `NAMED_SCHOOL` | A school's operational convention (格局派 / 억부派 / 調候派) |
> | `MODERN_SYSTEMATIZATION` | 20th-c. or contemporary textbook systematization |
> | `DEOKBUNI_OPERATIONALIZATION` | Deokbuni's own decision. May carry runtime authority; **never** presented as a classical quotation |
> | `SOURCE_NOT_VERIFIABLE` | Could not be verified ⇒ no runtime authority (doctrine §2.5 rule E) |
>
> **`CONFIDENCE`** is `HIGH` only where the wording was verified against a retrievable text; `MEDIUM` where
> the substance is corroborated but the exact wording or location is not pinned; `LOW` otherwise.
>
> **`CANONICAL_STATUS`**: `ADOPT` / `ADOPT_WITH_CONDITION` / `REJECT` / `DEFER`.

---

## Step A — Season / month command

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | NAMED_COMMENTATOR | SCHOOL | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | CONFIDENCE |
|---|---|---|---|---|---|---|---|---|---|
| MC-01 | Month's dominant seasonal element (4-season + 辰戌丑未) | `ORIGINAL_TEXT` — pre-Ziping 五行 cosmology, reproduced in 淵海子平/三命通會 | — | Cross-school | Fact derivation | BINDING | None | ADOPT | HIGH |
| MC-02 | 旺相休囚死 five-state from DM-vs-season relation | `ORIGINAL_TEXT` | — | Cross-school | Fact derivation | BINDING | None | ADOPT | HIGH |
| MC-03 | `BOUNDARY_SENSITIVE` 節氣-proximity flag | `DEOKBUNI_OPERATIONALIZATION` | — | — | Uncertainty trigger | **ADVISORY only** — the distance window is undetermined | Window undetermined | DEFER (as a decision trigger) / ADOPT (as annotation) | LOW |
| MC-04 | 격국 selection prefers 사령 hidden stem | `ORIGINAL_TEXT` (子平真詮 method) | — | 格局派 | 격국 selection — **not** strength | Out of V1 scope | — | DEFER | MEDIUM |
| **MC-09 (new)** | **得令 = 旺相 / 失令 = 休囚死** — the binary cut feeding §7.3.1 | `DEOKBUNI_OPERATIONALIZATION` of 徐樂吾's 得時/失時 | 徐樂吾 (for the underlying axis) | — | `SEASONAL_STATE` | BINDING **as disclosed policy** | Three rival cuts named and rejected: 臨官/帝旺-only; 長生~帝旺; 월지가 인성/비겁 | ADOPT_WITH_CONDITION | HIGH (as policy) |
| **MC-10 (new)** | **得時不旺，失時不弱** — no verdict from the seasonal axis alone | `ORIGINAL_TEXT` — 子平真詮 ch.6 「論十干得時不旺失時不弱」 | 沈孝瞻 (the refutation; 書云 marks the rule as older) | Cross-school | Binding NEGATIVE constraint on §12.1 | **BINDING** | None | ADOPT | HIGH |

## Step B — Root structure (§5)

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | NAMED_COMMENTATOR | RULE_SCOPE | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | CONFIDENCE |
|---|---|---|---|---|---|---|---|---|
| ROOT-B1 | Root existence: same-stem or same-element/diff-polarity | `ORIGINAL_TEXT` (existence test) | — | Existence fact | BINDING | Polarity **grading** is school-variable | ADOPT (existence) | HIGH |
| ROOT-B2 | Qi-tier 본기/중기/여기 | `ORIGINAL_TEXT` (concept) | — | Root quality tier | BINDING (concept) / DEFER (exact day-count values) | Editions disagree on values | ADOPT (concept) | HIGH |
| ROOT-B3 | 사령-adjusted tier override | `NAMED_COMMENTARY` | 任鐵樵; 三命通會 人元司令 framing | Tier precision | **DEFER** — P1 | Table not selected | DEFER | MEDIUM |
| ROOT-B4 | General 월>일>시>년 hierarchy | — | — | — | **REJECT** as a general ranking | No source establishes a four-way ranking | REJECT | — |
| ROOT-B5 | Root's own seasonal vitality | `NAMED_COMMENTARY` | 任鐵樵-descended | Root vitality | ADVISORY | — | ADOPT_WITH_CONDITION | MEDIUM |
| **ROOT-B10 (new)** | **只要四柱有根，便能受財官食神** — any root ⇒ the DM can bear | `NAMED_COMMENTARY` — 「日干不論月令休囚，只要四柱有根，便能受財官食神而當傷官七殺」 | 任鐵樵 | `ROOT_STATE` existence gate (§7.3.2) | **BINDING** | None located | ADOPT | HIGH |
| **ROOT-B11 (new)** | Root integrity reduced to 3 states; `DESTROYED` and `WEAKENED` **deleted** | `DEOKBUNI_CONSERVATIVE_OPERATIONAL_POLICY` | — | §8.10 | BINDING | — | ADOPT | — |
| ~~ROOT-B6/B7~~ | ~~Grade root survival under 沖/合~~ | — | — | — | **SUPERSEDED by ROOT-B11 + F-충-FUNC (V1.3)** | — | REJECT (as previously stated) | — |

## Step C/D — Support and opposition (§6, §7)

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | RULE_SCOPE | RUNTIME_AUTHORITY | CANONICAL_STATUS | CONFIDENCE |
|---|---|---|---|---|---|---|
| SUPPORT-C1 | Identify visible 비겁/인성 stems | `ORIGINAL_TEXT` (fixed Ten-God definition) | Mechanical read | BINDING | ADOPT | HIGH |
| SUPPORT-C2 | ROOTED vs FLOATING tagging | `NAMED_COMMENTARY` (통근 substantiality) | §6.1 | ADVISORY | ADOPT_WITH_CONDITION | MEDIUM |
| SUPPORT-C6 | 財克印 (corrected from the V1 官殺剋印 error) | `NAMED_SCHOOL` (오행 상극 at stem adjacency) | §6.5 | ADVISORY | ADOPT_WITH_CONDITION | HIGH |
| D1/D2 | Enumerate 食傷/財/官殺 candidates | `ORIGINAL_TEXT` (Ten-God definitions) | Mechanical | BINDING | ADOPT | HIGH |
| D5 | Group by kind; 財→官殺 chain flagged, never summed | `ORIGINAL_TEXT` (生剋 cycle) | §7.2 | ADVISORY | ADOPT_WITH_CONDITION | HIGH |
| ~~E1~~ | ~~Ordinal WEAK/MODERATE/STRONG effective-force label~~ | — | — | **DELETED IN V1.3** — unsourced magnitude scale; was the sole authority for four of six band boundaries (finding D3) | **REJECT** | — |
| E2 | Hard guard: never sum effective-force outputs into a vote | `DEOKBUNI_OPERATIONALIZATION` | Pipeline prohibition | **BINDING** | ADOPT | — |
| E4 | Hard guard: climate never feeds strength directly | `DEOKBUNI_OPERATIONALIZATION` | Pipeline prohibition | **BINDING** | ADOPT | — |

## Step E (new in V1.3) — Ordinary strength structural model

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | NAMED_COMMENTATOR | SOURCE_LOCATION | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS | CONFIDENCE |
|---|---|---|---|---|---|---|---|---|
| **SS-01** | Two-axis decomposition: 得時/失時 (seasonal) × 黨眾/助寡 (faction) | `NAMED_COMMENTARY` — 「大致得時為旺，失時為衰；黨眾為強，助寡為弱」 | 徐樂吾 | 子平真詮評註 ch.6 | **BINDING** (organizing structure) | None located | ADOPT — *Deokbuni V1 adopts 徐樂吾's decomposition* | MEDIUM |
| **SS-02** | Faction membership: 비겁+인성 vs 식상+재성+관살 | `DEOKBUNI_OPERATIONALIZATION` of an undisputed Ten-God taxonomy | — | — | BINDING | 徐樂吾 does not state what counts as a 黨 member | ADOPT | — |
| **SS-03** | `NUMEROUSNESS_FACT` — enumerable LIST of occurrences, not a bare number | `DEOKBUNI_OPERATIONALIZATION` | — | doctrine §7.3.3 | BINDING | — | ADOPT | — |
| **SS-04** | Transparent count comparison allowed; hidden additive scoring forbidden | `DEOKBUNI_OPERATIONALIZATION` | — | doctrine §3.5 | **BINDING** | Reverses V1.2's blanket ban on counting | ADOPT | — |
| **SS-05** | Stage-1 total 18-cell decision table | `DEOKBUNI_OPERATIONALIZATION` over SS-01 + MC-10 + ROOT-B10 | — | doctrine §12.1 | BINDING | Corner cells doctrinally grounded; middle cells are Deokbuni's | ADOPT | — |
| **SS-06** | Stage-2 intensity; Stage-3 seven-band renderer | `DEOKBUNI_OPERATIONALIZATION` | — | doctrine §12.2–12.3 | BINDING **as product rendering** | Explicitly **not** claimed as a classical seven-level taxonomy | ADOPT | — |
| **SS-07** | Faction count is never sole authority for a verdict | `ORIGINAL_TEXT` basis (MC-10) + policy | 沈孝瞻 | 子平真詮 ch.6 | **BINDING** | — | ADOPT | HIGH |

## Step F — Relation layer (§8) — RECONCILED IN V1.3

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | RULE_SCOPE | V1_STATUS | RUNTIME_AUTHORITY | DISPUTED | CANONICAL_STATUS |
|---|---|---|---|---|---|---|---|
| F-천간합-DETECT | Detect the five stem pairs | `ORIGINAL_TEXT` | Detection (frozen fact) | `SUPPORTED` | BINDING | None | ADOPT |
| F-천간합-TRANS | 合化 5-precondition test | `ORIGINAL_TEXT`/`NAMED_COMMENTARY` framework; DM-involvement contested | Transformation | **`SUPPORTED_WITH_CONDITIONS`** — evidence only, no outcome | ADVISORY | DM-involvement unresolved | ADOPT_WITH_CONDITION |
| F-육합 | Branch six-combination | `ORIGINAL_TEXT` (detection) | §8.2 | **`UNRESOLVED`** — neither pole cited for independent 化 | Detection only | Real | DEFER (transformation) |
| F-삼합방합-DETECT | Detect full/partial trio | `ORIGINAL_TEXT` | Detection | `SUPPORTED` | BINDING | None | ADOPT |
| F-삼합방합-TRANS | Full vs partial set | `ORIGINAL_TEXT`/`NAMED_COMMENTARY` for the **formation** distinction | §8.3 | **`SUPPORTED_WITH_CONDITIONS`** — formation only; **transformation NOT adopted** | Formation: BINDING. Transformation: **none** | **CORRECTED:** V1.1 said "DISPUTED: none on the distinction itself" — true of the full/partial *formation* distinction, but it was being read as licensing a transformation verdict, which no source supplies | ADOPT (formation) / DEFER (transformation) |
| F-충-FUNC | 沖 severity grading | `ORIGINAL_TEXT`/`NAMED_COMMENTARY` — contextual throughout | §8.4 | **`UNRESOLVED`** | **Detection only** | Severity genuinely school-flavoured; no decision procedure located | **CORRECTED:** V1.1 listed outcomes `INTACT/WEAKENED/DESTROYED/MEDIATED`. `DESTROYED` and `WEAKENED` are **deleted** (ROOT-B11); 沖 detected ≠ root destroyed remains a hard contract |
| F-형 / F-해 / F-파 | 형/害/破 strength authority | `ORIGINAL_TEXT` for the groupings; nothing for the effect | §8.5–8.7 | **`DEFERRED`** | None | Substantial and unresolved | DEFER |
| **F-CONSERVATIVE (new)** | Detection alone never changes root/stem function; unsupported ⇒ `UNRESOLVED` | `DEOKBUNI_CONSERVATIVE_OPERATIONAL_POLICY` | §8.9 | — | **BINDING** | Explicitly **not** a claim that classical doctrine says "no effect" | ADOPT |

## Step G — Special-structure gate (§10) — RECONCILED IN V1.3

| RULE_ID | RULE_SUMMARY | TEXT_LAYER | NAMED_COMMENTATOR | SOURCE_LOCATION | PRECONDITIONS | COUNTEREVIDENCE | REACHABILITY | DISPUTED | CANONICAL_STATUS | CONFIDENCE |
|---|---|---|---|---|---|---|---|---|---|---|
| **G-從旺** | 四柱皆比劫 · 無官殺之制 · **有印綬之生** | `NAMED_COMMENTARY` | 任鐵樵 | 滴天髓闡微 六親論·從象 (第四十七) | 印 must be PRESENT (positive condition) | any 官殺 or 財 occurrence | `CAN_REACH_CONFIRMED` | **CORRECTED from "none material":** 子平真詮 does not use this vocabulary at all — a real, named school gap. V1.1's 徐樂吾 co-attribution **withdrawn as unverified** | ADOPT — *Deokbuni V1 adopts 任鐵樵* | HIGH |
| **G-從强** | 印綬重重 · 比劫疊疊 · **日主又當令** · 絕無一毫財星官殺之氣 | `NAMED_COMMENTARY` | 任鐵樵 | same passage | 當令 mandatory (unlike 從旺) | any 財/官殺 occurrence, scoped to visible + 본기 | `CAN_REACH_CONFIRMED` | **CORRECTED:** the 從旺/從强 boundary is **source-level**, drawn by 任鐵樵 on three axes — not "school-dependent" as V1.1 said. The genuine dispute is at the modern-reception layer | ADOPT_WITH_CONDITION — depends on two disclosed operationalizations (重重/疊疊 = "two or more"; 絕無一毫 scope) | HIGH (source) / — (operationalizations) |
| **G-專旺** | 或方或局全 + 不雜\<controller\>; **稼穡 = 四庫皆全** | `NAMED_COMMENTARY` (five-pattern list); `ORIGINAL_TEXT` for 獨象 verse | 任鐵樵 | 滴天髓闡微 形象第十一; 滴天髓 「獨象喜行化地，而化神要昌」 | branch configuration per sub-pattern | controlling element **only** (not 財/食傷) | `CAN_REACH_CONFIRMED` | **CORRECTED:** the LABEL 專旺格 has **no located classical attestation** (`MODERN_SYSTEMATIZATION`); 三命通會 does group the five. Season required by 子平真詮, silent in 任鐵樵/淵海子平 — named, unresolved. 三命通會 requires 亥 in 亥卯未, contradicting 方/局 equality | ADOPT_WITH_CONDITION | HIGH |
| **G-從財** | `NO_ROOT` + WEALTH_CHANNEL uniquely occupied | `SELECTED_LINEAGE`; 眞/假 frame is `ORIGINAL_TEXT` | 任鐵樵 (何其獨旺) | 滴天髓 假從 verse + gloss; 從象 | exhaustive rootlessness | any 比劫/印 occurrence | `CAN_REACH_CONFIRMED` | 財+官殺 both present → `DOCTRINE_CONFLICT` | ADOPT_WITH_CONDITION | MEDIUM |
| **G-從官殺** | `NO_ROOT` + CONTROL_CHANNEL uniquely occupied | `SELECTED_LINEAGE` | 任鐵樵 | as above | exhaustive rootlessness | any 比劫/印/**食傷** occurrence | `CAN_REACH_CONFIRMED` | none located | ADOPT_WITH_CONDITION | MEDIUM |
| **G-從兒** | 月令 carries 食傷 · ∃財 · 食傷多也 | `ORIGINAL_TEXT` (verse) + `NAMED_COMMENTARY` (提綱/財 clauses) | 任鐵樵 | 滴天髓 順局 「從兒不管身強弱，只要吾兒又得兒」; 闡微 「必要食傷在提綱也」/「必要局中有財」 | **NO rootlessness requirement** | functionally-intact rooted 印 | **`CANDIDATE_ONLY_IN_V1`** — 食傷多也 unquantified | **CORRECTED from "thinnest-grounded… biased toward CANDIDATE_UNCONFIRMED":** 從兒 is the **best**-sourced pattern in the cluster (own verse + mechanism gloss). The V1.1 CANDIDATE bias was an unsourced thumb on the scale and is **deleted**; the current cap is a different thing — an unresolved quantifier | ADOPT | HIGH |
| **G-從氣 / G-從勢** | Co-equal members of the same 任鐵樵 passage | `NAMED_COMMENTARY` | 任鐵樵 | 從象 | — | — | **`DEFERRED_FROM_V1`** | Not disputed — simply not selected | DEFER |
| **G-眞假從** | 真從之象有幾人，假從亦可發其身 | **`ORIGINAL_TEXT`** | — | 滴天髓 假從; gloss 「日主弱矣，財官強矣，不能不從，中有所助者，便假」 | weak-DM family **only** | — | — | **CORRECTED from `SOURCE_CLASS_C` "not tied to one citable passage":** it **is** tied to one verse and is ORIGINAL_TEXT. V1.1 also **over-extended** it to 從旺/從强/專旺 — withdrawn | ADOPT (weak-DM family) / REJECT (strong-DM extension) | HIGH |
| **G-COMPOSITION** | Cross-pattern composition, total mapping | `DEOKBUNI_OPERATIONALIZATION`; 從强⊃從旺 subtype relation is source-derived | — | doctrine §10.7 | — | — | — | 專旺 vs 從旺/從强 → `AMBIGUOUS_MULTI_CANDIDATE`; no source ranks them | ADOPT |

---

## Cross-check (audit finding D9, brief §32)

**No orphan doctrine rules.** Every `RULE_ID` cited by the canonical doctrine has a row here:
MC-01…MC-04, MC-09, MC-10, ROOT-B1…B5, ROOT-B10, ROOT-B11, SUPPORT-C1/C2/C6, D1/D2/D5, E2, E4,
SS-01…SS-07, F-천간합-*, F-육합, F-삼합방합-*, F-충-FUNC, F-형/해/파, F-CONSERVATIVE,
G-從旺/從强/專旺/從財/從官殺/從兒/從氣/從勢/眞假從/COMPOSITION.

**No orphan runtime-authoritative matrix rules.** Every row above marked `RUNTIME_AUTHORITY = BINDING` has a
corresponding contract section in the canonical doctrine: MC-09 → §7.3.1 · MC-10 → §7.3.0/§12.1 ·
ROOT-B10 → §7.3.2 · ROOT-B11 → §8.10 · SS-01…SS-07 → §3.5/§7.3/§12 · F-CONSERVATIVE → §8.9 ·
E2/E4 → §7.3/§9 · G-* → §10.1/§10.6/§10.7.

**Withdrawn/deleted in V1.3, recorded so they cannot silently return:**

| Item | Why |
|---|---|
| `E1` ordinal WEAK/MODERATE/STRONG effective force | Unsourced magnitude scale (finding D3) |
| `DESTROYED` root state | No source supplies categorical destruction |
| `WEAKENED` root state | Computable, but no consumer — decoration, not a contract |
| 徐樂吾 co-attribution for 從旺/從强 | Never verified (§2.5 rule E) |
| 眞從/假從 applied to 從旺/從强/專旺 | Over-extension; the verse's gloss scopes it to the weak-DM family |
| G-從兒's "biased toward CANDIDATE_UNCONFIRMED" | Unsourced thumb on the scale |
| "dominant force" / "near-total force" in every 從 pattern | Same unsourced construct as the deleted "decisive tilt" |

## Explicitly excluded / deferred categories (carried forward)

| Category | CANONICAL_STATUS | Reason |
|---|---|---|
| 化氣格 · 兩神成象格 | DEFER | Thin/disputed completion criteria |
| 從印格 (as a separate name) | REJECT | Collapses into 從强 |
| 형 / 害 / 破 as strength authority | DEFER | Substantial unresolved disagreement — **not** asserted as zero effect |
| Any specific 사령 day-count table | DEFER | Named editions disagree; none selected |
| Any per-cell 궁통보감 climate table | DEFER | Belongs to a future Yongshin phase |
| A universal existence-only special-structure disqualifier (V1's SG-0) | REJECT | Contradicted the document's own existence-vs-function principle |
| 得令/得地/得勢 as a classical triple | **REJECT** | Not an attested triple; the citation offered for it did not survive verification. The three underlying facts are adopted **separately**, each under its own source |
