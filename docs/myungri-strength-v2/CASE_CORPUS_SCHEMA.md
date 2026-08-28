# V2 CASE CORPUS — SCHEMA

Every record in `data/myungri-strength-v2/discovery-cases.json` conforms to this schema. The validator
`data/myungri-strength-v2/validate-corpus.mjs` enforces the machine-checkable parts.

---

## 1. The separation rule (the most important thing in this document)

```
ORIGINAL_* fields   =  what the source says, verbatim, in its own language
V2_* fields         =  our reading of it
```

**These are never merged, never reconciled, and never overwritten by each other.**

If 任鐵樵 writes 「財多身弱」, then `ORIGINAL_STRENGTH_TERMS` contains exactly `財多身弱`. It does **not**
become `SOURCE_WEAK`, and it certainly does not become `신약` or `CANNOT_BEAR`. Our normalization lives in
`V2_NORMALIZED_STRUCTURAL_LABEL`, as a separate assertion we can later be shown to have gotten wrong.

V1 failed partly through circularity — a reading became a rule, then the rule was used to justify the
reading. Physically separating the fields is the structural defence against repeating that.

---

## 2. Identity fields

| Field | Rule |
|---|---|
| `CASE_ID` | Unique. Format `DTS-<chapter>-<n>` for 滴天髓闡微 (e.g. `DTS-CONGXIANG-01`). Stable forever once assigned |
| `CHART_CASE_ID` | Identifies the **eight characters**. Two commentators discussing the same chart share this |
| `INTERPRETATION_ID` | Identifies **this reading** of that chart. `<CHART_CASE_ID>#<authority>` |
| `CASE_FINGERPRINT` | `<4 pillars joined>|<earliest known source>` — used for duplicate detection |
| `RECORD_ROLE` | `PRIMARY_CASE` · `DERIVED_REPRINT` · `COMMENTARY_VARIANT` |

**Duplicate policy.** The same classical chart is reprinted across many later books. A reprint is **not** a
new case — it is `DERIVED_REPRINT` and does not increment the real-case count. A later commentator's
*materially different* reading of the same chart **is** a new `INTERPRETATION_RECORD` but **not** a new
unique chart. `UNIQUE_CHART_COUNT` and `INTERPRETATION_RECORD_COUNT` are reported separately for this reason.

---

## 3. Source fields

| Field | Rule |
|---|---|
| `SOURCE_ID` | FK into `SOURCE_REGISTER.md` / `sources.json` |
| `SOURCE_TIER` | `A` primary classical · `B` named historical commentary · `C` named school/lineage · `D` modern professional with identifiable provenance · `E` Deokbuni/founder |
| `SOURCE_TITLE` | e.g. 滴天髓闡微 |
| `AUTHOR_OR_COMMENTATOR` | e.g. 任鐵樵. Never "anonymous" for a counted case |
| `SOURCE_LOCATION` | chapter + ordinal within chapter, e.g. `從象第四十七, example 1` |
| `SOURCE_URL_OR_BIBLIOGRAPHIC_LOCATION` | retrievable URL, or edition+page. `LOCATION_UNRESOLVED` if genuinely unknown — **never invented** |
| `SOURCE_TEXT_LAYER` | `ORIGINAL_TEXT` · `YUANZHU` (原注) · `NAMED_COMMENTARY` · `NAMED_SCHOOL` · `MODERN_SYSTEMATIZATION` |

---

## 4. Chart fields

| Field | Rule |
|---|---|
| `CHART_YEAR` `CHART_MONTH` `CHART_DAY` `CHART_HOUR` | Two characters each: stem + branch. **Never reconstructed.** If a pillar is absent from the source, the value is `null` and `DATA_COMPLETENESS` reflects it |
| `PILLAR_SOURCE_ORDER` | The pillars as printed, so a transcription error is detectable later |
| `LUCK_CYCLE` | 大運 sequence verbatim, or `null` |
| `SEX_IF_GIVEN` | `乾造` (male) · `坤造` (female) · `NOT_STATED`. **Never inferred from context** |
| `BIRTH_TIME_STATUS` | `GIVEN` · `UNKNOWN` · `AMBIGUOUS`. An hour pillar is never invented to complete a chart |
| `CALENDAR_NOTES` | any 節氣/calendar caveat the source states |

Validator checks: stems ∈ the 10 天干, branches ∈ the 12 地支, exactly 2 chars per pillar, no duplicate
`CASE_ID`, `SOURCE_ID` resolves.

---

## 5. Original-source fields (verbatim, never edited)

`ORIGINAL_JUDGMENT_TEXT` · `ORIGINAL_STRENGTH_TERMS` · `ORIGINAL_SPECIAL_PATTERN_TERMS` ·
`ORIGINAL_ROOT_DISCUSSION` · `ORIGINAL_SEASON_DISCUSSION` · `ORIGINAL_SUPPORT_DISCUSSION` ·
`ORIGINAL_OUTPUT_DISCUSSION` · `ORIGINAL_WEALTH_DISCUSSION` · `ORIGINAL_CONTROL_DISCUSSION` ·
`ORIGINAL_RELATION_DISCUSSION` · `ORIGINAL_YONGSHIN_DISCUSSION` · `ORIGINAL_TIMING_DISCUSSION` ·
`SOURCE_REASONING_SUMMARY`

All but the last hold **verbatim source text** (or `null` where the source is silent — silence is data).
`SOURCE_REASONING_SUMMARY` is our prose summary and is explicitly marked as ours.

**Yongshin note:** if a source discusses 用神, the field is *recorded*. No Yongshin doctrine is derived in
V2-Strength. Recording ≠ designing.

---

## 6. V2 normalization fields (ours, separately falsifiable)

| Field | Rule |
|---|---|
| `V2_NORMALIZED_STRUCTURAL_LABEL` | conservative vocabulary only, §7 |
| `V2_SPECIAL_PATTERN_STATUS` | what the source claims, normalized — not our own adjudication |
| `V2_NORMALIZED_FACT_NOTES` | facts as the **frozen fact layer** would compute them. Never hand-derived from a different hidden-stem table |
| `V2_INTERPRETATION_NOTES` | our commentary, clearly ours |
| `V2_UNCERTAINTY` | what is unresolved in this record |
| `NORMALIZATION_PROVENANCE` | `LLM_ASSISTED_UNREVIEWED` · `MAIN_SESSION_REVIEWED` · `FOUNDER_REVIEWED`. **An LLM-produced label is never gold** |

---

## 7. Normalized label vocabulary (S1, conservative and provisional)

```
SOURCE_WEAK · SOURCE_STRONG · SOURCE_BALANCED
SOURCE_EXTREME_WEAK · SOURCE_EXTREME_STRONG
SOURCE_FOLLOWING_PATTERN · SOURCE_SPECIAL_STRUCTURE
SOURCE_UNCERTAIN · SOURCE_NOT_EXPLICIT
```

These normalize **what the source said**. They are not V2 runtime outputs and not the seven bands.

> **No premature seven-band normalization.** If a source says 身弱, the label is `SOURCE_WEAK` — not 신약,
> not 중화신약. The source did not make that distinction, and neither may we. Where resolution is
> insufficient, `SOURCE_NOT_EXPLICIT` is the correct answer, not a guess.

This vocabulary is **provisional** and is reviewed against actual corpus wording after the first ~25 cases
(§19 of the governing plan).

---

## 8. Quality and status fields

| Field | Values |
|---|---|
| `DATA_COMPLETENESS` | `COMPLETE` · `PARTIAL_CHART` · `PARTIAL_REASONING` · `FRAGMENT` |
| `PROVENANCE_CONFIDENCE` | `HIGH` · `MEDIUM` · `LOW` |
| `SOURCE_AMBIGUITY` / `TRANSLATION_AMBIGUITY` / `SCHOOL_AMBIGUITY` | free text or `null` |
| `GRADE` | `A` complete chart + direct judgment + explicit reasoning + strong provenance · `B` complete chart + direct judgment + partial reasoning · `C` useful but incomplete/ambiguous · `D` comparison-only |
| `GOLD_LABEL_STATUS` | `GOLD_ELIGIBLE` · `RESEARCH_ONLY` · `CONFLICT_CASE` · `INSUFFICIENT` · `NEGATIVE_REFERENCE` |
| `REVIEW_STATUS` | `EXTRACTED` · `SOURCE_VERIFIED` · `CHART_VERIFIED` · `NORMALIZATION_REVIEWED` · `DOUBLE_REVIEWED` · `HOLDOUT_RESERVED` |

**`GOLD_ELIGIBLE` is not conferred by being classical.** A classical case with ambiguous transcription is
`RESEARCH_ONLY`. Only grades A/B normally reach `GOLD_ELIGIBLE`; `D` never does.

---

## 9. Research tags

`ORDINARY_STRENGTH` · `SPECIAL_PATTERN` · `ROOT_CASE` · `SEASON_CASE` · `SEASON_COUNTEREXAMPLE` ·
`FACTION_CASE` · `CAPACITY_CASE` · `RELATION_HEAVY` · `SCHOOL_CONFLICT` · `HIGH_SPECIFICITY_REASONING` ·
`ROOTED_CONGER_CANDIDATE` · `COUNTEREXAMPLE_TO_<RULE_ID>`

`HIGH_SPECIFICITY_REASONING` marks cases whose reasoning could not have been written without seeing that
specific chart — the future benchmark set for the founder quality gate.

---

## 10. Prohibited in this corpus

- fabricated charts, quotations, or sources
- reconstructed missing pillars; inferred birth hours; inferred sex
- anonymous calculator output as a label (`신강/신약` score sites, 오행 percentage tools)
- legacy `evaluateNatalStrength` / `sinyaksingang.php` output as a label
- synthetic charts counted as real cases (they live in `ADVERSARIAL_SYNTHETIC_CASES.md`)
- LLM-generated labels treated as gold
- bulk reproduction of copyrighted modern books — bibliographic reference + minimal excerpt + paraphrase only
