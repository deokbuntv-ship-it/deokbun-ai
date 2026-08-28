# S2 BLOCKER REGISTER

Status: **RESEARCH ARTIFACT** · Opened S1.6, updated S1.6 (bridge-hunt results).

What stands between the current state and a safe S2 structural-axis freeze.
A blocker is `CLOSED` only when the evidence that would change an S2 decision
actually exists — not when it has been argued around.

---

## B1 — Same-chart cross-lineage adjudication

| | |
|---|---|
| **Status** | **PARTIAL — evidence now exists, but does not directly adjudicate the lineages CF-011/B3 need most** |
| **Why it blocks** | Lineages are known to disagree *as doctrines*. What was unknown is how a disagreement changes the reading of **identical structural facts**. Without that, an axis derived from 任鐵樵's corpus alone cannot be distinguished from a 任鐵樵 artefact |
| **Evidence needed** | ≥1 Grade-A bridge, or ≥2 Grade-B — same eight characters, two independent authorities, comparable reasoning, all verified |
| **Evidence found (S1.6)** | **4 Grade-A, 12 Grade-B, 1 Grade-C bridges**, from a systematic 8-angle hunt (77 candidates → 28 adversarially verified). Full detail: `CROSS_LINEAGE_BRIDGE_CASES.md`. Target exceeded on raw count. |
| **The catch** | The richest expected vein (任鐵樵 vs 徐樂吾) turned out to be **largely a mirage** — 徐's 滴天髓補註 exists specifically to supplement, not re-argue, 任's cases, and its worked examples partition from 任's by disjoint numbering. The bridges that *did* survive are mostly Ming-vs-Ming (張楠 vs 萬民英) or Republican-vs-Republican (徐樂吾 vs 韋千里) — genuinely valuable for the general question (`B4`) but **none directly pit 任鐵樵/滴天髓 against a strict-root lineage** the way CF-011/B3 most need. BRIDGE-B2/B3 (two modern authors disputing 任's rooted-following reading) is the closest approach. |
| **One Grade-A bridge carries an unresolved defect** | BRIDGE-A4 (乙酉×3 甲申) turned out to be substantially an **intra-source inconsistency** in 萬民英's own book (三命通會 holds three incompatible readings of one chart across 卷三/卷八/卷十一) rather than a clean two-lineage disagreement. Recommended handling: Grade B pending a column-aware re-extraction of 三命通會 卷八/九. See `CROSS_LINEAGE_BRIDGE_CASES.md` §1.4. |
| **Resolution path forward** | Run the 296-chart 神峰通考 catalogue against the 徐樂吾 corpus (never done); mine 溫遇甲's purpose-built 任鐵樵/點評 blog corpus; fix the BRIDGE-A4 extraction defect. All ranked in `BRIDGE_SEARCH_REGISTER.md` §14 |
| **If it cannot be fully closed against 任鐵樵 specifically** | The general cross-lineage evidence (B4) still stands on its own merits — it need not route through 滴天髓 to be useful. Fall back to structural matched pairs only for anything that must be 任-specific; these are never counted as bridges |

---

## B2 — Sequencing is contested between named authorities

| | |
|---|---|
| **Status** | **OPEN — sharpened to a confirmed three-way conflict, not closed** |
| **Why it blocks** | Pipelines A/B/C give different answers on precisely the borderline charts that matter. Freezing an order silently adopts one school |
| **What S1.6 established** | `CF-012` is now a confirmed **three-way** `SAME_PROPOSITION_DIFFERENT_ANSWER` conflict, not two. 淵海子平: 先明從化爲本，化不成方論財官，財官無取方論格局 (special **first**, 格局 **last**). 沈孝瞻: 八字用神，專求月令…月令，本也；外格，末也 (月令 **first**, external **last**). **任鐵樵 (correction to the prior draft, which wrongly claimed no order exists): 先觀月令 → 次看天干透出 → 再究司令以定真假 → 然後取用** — 月令 first, but the special-pattern authenticity check sits at step three, a genuine third position. All three verified verbatim. |
| **A fourth position found and refuted** | 三命通會 卷十's 「凡命先論化氣」 was tested as possible corroboration for 淵海子平's order and **REFUTED** — it is one of four unreconciled 「凡…先…」 openers in the same undifferentiated section, is not an ordering rule in context, and the section's own first opener states the opposite thesis. See `SEQUENCING_COMPARISON.md` §4–§5. |
| **Pipeline A is not merely modern** | 陳素庵 (命理約言, Qing) gives the single most forceful statement of strength-first sequencing in the entire program: 推命先看日干…此看命第一要訣也, applied recursively to every pillar. This revises the earlier framing of Pipeline A as a 1936 artefact. |
| **What is still needed** | Whether the ordering disagreement **causes** the root disagreement (`B3`/CF-011). Strengthened but not proven — see `SEQUENCING_COMPARISON.md` §6 |
| **Resolution path** | Either a shared chart where the three orders yield different verdicts, or a decision to carry `RULE_LINEAGE` metadata and disclose the choice per pipeline |
| **Note** | Pipeline B (月令/格局 first) is now the **best-attested** — 3 lineages, including a corrected 任鐵樵. Pipeline C has 2 explicit adherents and 1 explicit opponent. No pipeline commands consensus |

---

## B3 — Root-vs-following is school-dependent — now five-way, not two

| | |
|---|---|
| **Status** | **OPEN — sharpened from a two-lineage dispute to a five-position one; first worked-case bridge found** |
| **Why it blocks** | AX-06 (special-structure status) cannot be specified while its central entry test is disputed this broadly |
| **The dispute, now five positions** | (1) 淵海子平 — root voids following, binary. (2) 張楠 — root fatal, but **only for yang day stems**; yin stems may follow despite root. (3) 陳素庵 — root is one conjunct of a *compound* adverse condition (從神受剋 AND 日主逢根 together), not a standalone entry bar. (4) 任鐵樵 — strength/rootedness is the wrong axis for 從兒 specifically; six charts, two explicit refusals (非身弱論也/非身衰論也). (5) 沈孝瞻/徐樂吾 — the named disqualifiers are 傷食 and 印, not root itself. Full citations: `CONFLICT_REGISTER.md` CF-011. |
| **Formal status** | `SAME_PROPOSITION_DIFFERENT_ANSWER` between positions 1/2 and 4, with positions 3 and 5 supplying genuinely different formal shapes neither pole states on its own. No single boolean flag represents all five. |
| **Worked-case evidence (S1.6, new)** | `CROSS_LINEAGE_BRIDGE_CASES.md` BRIDGE-B2/B3 — two modern practitioners independently dispute 任's rooted-following reading of 甲午 丁丑 甲午 丙寅, one downgrading the 格, one rejecting following outright. **This is the best-attested single case for this question in the program**, but it is modern-vs-classical, not classical-lineage-vs-classical-lineage. |
| **Evidence still needed** | One rooted borderline chart ruled on by **两** classical lineages directly (e.g. 淵海子平 or 張楠 vs 任鐵樵 on the same eight characters) |
| **Hypothesis to test** | Still open: B3 may be **downstream of B2** — under a special-screen-first order the root test pre-empts any whole-chart 氣勢 reading, so the question may not arise the same way in every pipeline. Strengthened, not proven, by S1.6 |

---

## B4 — Engine object — now supported by cross-lineage doctrine AND early bridge evidence

| | |
|---|---|
| **Status** | **PARTIAL, moving toward supported** |
| **Why it blocks** | Whether V2 builds a strength engine, a structural engine with a strength view, or task-capacity judges determines which axes matter |
| **What is settled** | Global scalar **UNSUPPORTED**; task-relative **SUPPORTED**; four of five lineages do not treat strength as first-class; one operates with no strength axis at all; global strength scores **zero DIRECT cells** downstream (S1.5) |
| **S1.6 addition** | BRIDGE-B1 (葛參政, THREE lineages — 淵海子平 → 三命通會 → 子平真詮) converges on the same practical conclusion via three non-competing mechanisms — direct cross-lineage support for the task-relative/subsystem model, not merely within-滴天髓 evidence as before. Weighed against this: BRIDGE-A1, A2, A3 are genuine `SAME_PROPOSITION_DIFFERENT_ANSWER` conflicts, so the subsystem model must accommodate real disagreement, not only harmonious convergence |
| **What is still not settled** | Whether disagreements like BRIDGE-A3 (七殺-deficient vs 正印-sufficient reading of the same water element) are better modelled as two valid views under a task-relative frame, or as evidence that a `LINEAGE_AWARE_BRANCHING_ENGINE` is required after all |
| **Resolution path** | Continue the bridge hunt (B1) specifically for cases that pit the SAME two lineages against each other repeatedly, to see whether their disagreements are systematic (favours lineage-aware branching) or idiosyncratic (favours a shared subsystem with local exceptions) |

---

## B5 — AX-05 has no load ontology

| | |
|---|---|
| **Status** | **OPEN** |
| **Why it blocks** | `CAPACITY(party, load, ground, time)` is the best-evidenced output shape (18/18 occurrences of 足以 in S1) and the least implementable. Without an enumerated, sourced load set it cannot be specified |
| **Observed loads** | 財 · 官 · 殺 · 財官(joint) · 印(as destruction target) · 水勢 · 火炎 · 日主之虛 · 身(幫) |
| **Complication** | The **shape** recurs cross-lineage (子平真詮: 便能**受**財官食神而**當**傷官七煞 — two verbs, two load classes) but the **token** 足以 occurs 0 times there. Any ontology must be built from the shape, not the vocabulary |
| **Resolution path** | Source research, not analysis. Enumerate load expressions across all lineages before proposing a set. Not addressed in S1.6 |

---

## B6 — Normalization is single-reviewer

| | |
|---|---|
| **Status** | **OPEN** |
| **Why it blocks** | Every `V2_NORMALIZED_STRUCTURAL_LABEL` in the corpus is `MAIN_SESSION_REVIEWED`. Zero are `FOUNDER_REVIEWED`; zero are `DOUBLE_REVIEWED` |
| **Why it matters at S2** | Axis selection will lean on label distributions. A systematic normalization bias would propagate invisibly |
| **Resolution path** | Owner review of a stratified sample — the conflict cases, the counterexamples, and the special-pattern records first |
| **Note** | This is the one blocker no amount of further research closes |

---

## B7 (new, S1.6) — Source-integrity hazards discovered mid-hunt

| | |
|---|---|
| **Status** | **OPEN — a methodology blocker, not a doctrine one** |
| **Why it blocks** | S1.6 caught a fabricated quote submitted as evidence, a further six summarizer fabrications, and one Grade-A bridge that dissolved into an intra-source inconsistency once a table-extraction defect was found. This is the **fourth** independent research batch in this program to hit summarizer fabrication as a failure mode |
| **What was found** | Full census in `BRIDGE_SEARCH_REGISTER.md` §6 — includes a fabricated 徐樂吾 quote that was internally self-contradictory on inspection, endemic wrong-chapter citations, and a documented case (BRIDGE-A4) where a "confirmed negative control" had a mechanical hole (column-split table defeated contiguous-string search) that a second, independent verifier caught |
| **Resolution path** | Every load-bearing quote in this program must be raw-fetched, never taken from a summarizer. `insource:` literal search on MediaWiki-hosted texts is the most trustworthy tool found. No printed or scanned edition has been collated against any digital source used so far — flagged as a standing limitation on everything in `CROSS_LINEAGE_BRIDGE_CASES.md` |
| **Does this block S2?** | No — it is a discipline to carry forward, not a gate. Recorded here so it is not lost between gates |

---

## Closed

| ID | Subject | Closed |
|---|---|---|
| **CF-002** | 土旺極 internal contradiction | S1.6 — `COPY_ERROR`, settled on internal evidence (the treatment clause 宜火以練之 refutes 似水; Example 10 preserves 似金) |
| **CF-009** | one chart, two chapter readings | S1.5 — `TASK_RELATIVE_COMPATIBLE` |
| **CF-005** | 眾/寡 vs 強/弱 | S1 — independent axes, closed on primary text (強寡, 強眾) |

---

## Gate rule

**S2 must not open while B1 and B2 are both open.** They jointly determine what
S2 would be looking for — B1 whether an axis is general or a lineage artefact,
B2 whether the pipeline order is a finding or a choice.

**S1.6 assessment: B1 is PARTIAL (real bridges exist, but not yet the specific
任鐵樵-vs-strict-root adjudication CF-011 needs) and B2 remains OPEN (sharpened
to three-way, not resolved). The gate rule's condition is not yet met.**

B4, B5, B6 and B7 do not block **opening** S2; B4/B5/B6 bound what S2 may
**freeze**, and B7 is a standing methodological discipline.
