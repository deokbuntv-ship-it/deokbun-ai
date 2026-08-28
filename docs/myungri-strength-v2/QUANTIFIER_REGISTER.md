# QUANTIFIER REGISTER

> Classical quantitative expressions, tracked so they are **not silently converted into numbers**.
>
> **S1 rule: no entry in this file may be given a numeric threshold.** Every one of these is currently an
> open question. V1 failed in large part by answering them privately — 重重/疊疊 became "two or more",
> 絕無一毫 became "visible stems plus 본기" — and those inventions then gated verdicts.

`IMPLEMENTATION_READY` is `NO` for every row, and will stay `NO` until the case corpus shows where
practitioners actually drew the line.

---

| Phrase | Literal sense | Where it appears | What is genuinely open | Status |
|---|---|---|---|---|
| **皆** | "all / throughout" | 從旺: 四柱皆比劫 · 稼穡: 四庫皆全 | Does 皆 range over visible stems only, or 지장간 too? At which tiers? In 四庫皆全 it is unambiguous (four named branches); in 四柱皆比劫 it is not | `NO` |
| **全** | "complete" | 專旺: 或方或局全 | Unambiguous where the set is named (亥卯未 / 寅卯辰). Open: does a set completed **only** via hidden stems count? | `NO` |
| **滿局** | "filling the chart" | 從財/從殺 discussions | No stated boundary. Is it a count, a proportion, or a qualitative impression of the chart's 氣勢? | `NO` |
| **重重** | "layered, repeated" | 從强: 印綬重重 | Two? Three? Or "repeated across pillars" rather than a count? V1.3 read it as ≥2 — **that was ours** | `NO` |
| **疊疊** | "piled up, repeated" | 從强: 比劫疊疊 | Same as 重重. Note the source uses **two different words** in one sentence — possibly deliberate gradation, possibly stylistic variation. Unresolved | `NO` |
| **一毫** | "a single hair" | 從强: 絕無一毫財星官殺之氣 | Rhetorical absolute or literal zero? Crucially: over what scope? Read across all 지장간 it is self-defeating, since 亥/寅 carry hidden 戊財 and such charts are built from those branches | `NO` |
| **獨** | "solely, uniquely" | 從勢: 何其獨旺 · 獨象 | In 從勢 it selects among 財/官/食傷 **after** the pattern applies (see P-005). In 獨象 it names a structure. Two different uses of one character | `NO` |
| **眾 / 寡** | "numerous / scarce" | 徐樂吾: 黨眾為強，助寡為弱 · 眾寡 chapter | **The central open question.** Counting what — stems? branches? rooted members only? weighted by function? V1.3 used equal-weight occurrence counts and that was rejected as unfaithful | `NO` |
| **多 / 少** | "many / few" | 財多身弱 · 食傷多 | Relative to what baseline? 財多身弱 is a *compound* judgment, not 財多 plus 身弱 independently | `NO` |
| **純 / 雜** | "pure / mixed" | 專旺: 不雜金 | Does a single hidden occurrence constitute 雜? Same scope question as 一毫 | `NO` |
| **深 / 淺** | "deep / shallow" | 子平真詮: 財根深 | Root depth — tier? count? position? 子平真詮 uses it to distinguish a 財 that breaks an 外格 from one that does not | `NO` |
| **兩位** | "two positions" | 子平真詮: 財透兩位 | **The one genuinely numeric expression found so far** — it names a count. Even so: two *visible* stems, or two occurrences anywhere? | `NO` (but flagged as the most tractable) |

---

## How these get resolved — the method, not the answer

A quantifier becomes operational **only** when the corpus shows a consistent boundary:

1. Collect every case where the source applies the term to a specific chart.
2. Compute that chart's frozen facts (occurrence counts by tier and position).
3. Look for a boundary that separates the cases the source called 重重 from those it did not.
4. If a clean structural boundary exists → propose it as a `RULE_CANDIDATE`, tagged
   `DEOKBUNI_OPERATIONALIZATION`, citing the case ids.
5. If **no** clean boundary exists → that is the finding. The term stays unresolved and any pattern
   depending on it stays candidate-only.

Step 5 is a legitimate outcome. V1's failure was treating it as unacceptable and inventing step 4.

**Not permitted:** picking a value because it makes a rule work · because it matches one famous case ·
because a modern textbook asserts one without provenance · because the product needs a decision.
