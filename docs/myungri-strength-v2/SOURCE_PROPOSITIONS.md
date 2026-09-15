# SOURCE PROPOSITION LIBRARY

> Verified source propositions, kept **separately from software rules**. A proposition here is something a
> named source actually asserts. It is **not** a V2 rule, and nothing in this file is implementable.

The load-bearing field is **`DOES_NOT_IMPLY`**. V1 was closed largely because a sufficient condition was
silently read as a necessary one; every proposition here must therefore state, explicitly, what it does
*not* license.

---

## Logical safety guards (applied to every proposition)

| Guard | The error it prevents |
|---|---|
| **CONVERSE_GUARD** | `A → B` does **not** give `B → A` |
| **INVERSE_GUARD** | `A → B` does **not** give `¬A → ¬B` *(this is the exact error that closed V1)* |
| **SCOPE_GUARD** | a claim about 月令 is not a claim about all branches; a claim about 天干 is not about 地支 |
| **QUANTIFIER_GUARD** | 皆/全/滿局/重重 are **not** given numeric values; 「多」 is not "≥3" |
| **LOCAL_TO_UNIVERSAL_GUARD** | a claim inside one pattern's discussion does not generalize to all charts *(this is the 何其獨旺 error)* |

---

## P-001 — Root confers bearing capacity

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-001 |
| `SOURCE` | 滴天髓闡微, 任鐵樵 |
| `TEXT_LAYER` | `NAMED_COMMENTARY` |
| `EXACT_TEXT` | 「日干不論月令休囚，只要四柱有根，便能受財官食神而當傷官七殺」 |
| `SAFE_PARAPHRASE` | Regardless of whether the month leaves the Day Master 休 or 囚, it need only have a root among the four pillars, and it can then bear 財/官/食神 and withstand 傷官/七殺. |
| `LOGICAL_FORM` | `HAS_ROOT(chart) → CAN_BEAR(chart)` |
| `SCOPE` | The Day Master's capacity to *bear load*. Explicitly **season-independent** (不論月令休囚) |
| **`DOES_NOT_IMPLY`** | ① `¬HAS_ROOT → ¬CAN_BEAR` — **INVERSE_GUARD violation. This is the error that closed V1.** 只要 states a *sufficient* condition; the text is silent on rootless charts, and other configurations may confer capacity by another route. ② `HAS_ROOT → 身旺`. Bearing capacity is not strength. ③ `HAS_ROOT → any seven-band label`. ④ that root count or tier matters — the text says 有根, not 根重 |
| `EXAMPLE_CASE_IDS` | *(pending corpus)* |
| `COUNTEREXAMPLE_CASE_IDS` | *(actively sought: charts the source calls 身弱 despite a root; charts the source treats as bearing without one)* |
| `V2_STATUS` | `RESEARCH_ONLY` — affirmative direction only |

---

## P-002 — Season alone settles nothing

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-002 |
| `SOURCE` | 子平真詮, 沈孝瞻, ch.6 「論十干得時不旺失時不弱」 |
| `TEXT_LAYER` | `ORIGINAL_TEXT` |
| `EXACT_TEXT` | 「書云，得時俱為旺論，失時便作衰看，雖是至理，亦死法也。然亦可活看」 |
| `SAFE_PARAPHRASE` | The maxim that 得時 means prosperous and 失時 means declining, though sound in principle, is a *dead rule*; it must be read flexibly. |
| `LOGICAL_FORM` | `¬(得令 → 旺)` and `¬(失令 → 弱)` — a **negative** constraint |
| `SCOPE` | Forbids projecting a strength verdict from the seasonal axis alone, in either direction |
| **`DOES_NOT_IMPLY`** | ① that season is irrelevant — it constrains inference, it does not remove the factor. ② that any *other* single factor may decide instead. ③ what the correct combination rule is — the text says the rule must be read 活, not what the live reading is |
| `EXAMPLE_CASE_IDS` | *(sought: 得令-but-weak and 失令-but-strong cases, tagged `SEASON_COUNTEREXAMPLE`)* |
| `V2_STATUS` | `RESEARCH_ONLY` — usable as a guard, not as a decision rule |
| `NOTE` | 沈孝瞻 introduces the rejected maxim with 書云 — the maxim predates him; the refutation is his |

---

## P-003 — 從兒 does not depend on Day-Master strength

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-003 |
| `SOURCE` | 滴天髓, 順局 chapter (verse layer) |
| `TEXT_LAYER` | `ORIGINAL_TEXT` |
| `EXACT_TEXT` | 「一出門來只見兒，吾兒成氣構門閭；從兒不管身強弱，只要吾兒又得兒」 |
| `SAFE_PARAPHRASE` | For 從兒, one does not concern oneself with whether the Day Master is strong or weak; what is required is that the "child" (食傷) in turn obtains *its* child (財). |
| `LOGICAL_FORM` | `從兒_APPLICABLE → ¬REQUIRES(day_master_weakness)` ; and `從兒 → REQUIRES(財 present)` |
| `SCOPE` | The 從兒 pattern only |
| **`DOES_NOT_IMPLY`** | ① that Day-Master strength is irrelevant to *other* patterns. ② that 從兒 has no entry conditions — it has at least the 財 outlet, and (per 任鐵樵) a 月令 requirement. ③ that a rooted Day Master is *preferred* — only that rootedness is not disqualifying |
| `RELATED` | 任鐵樵: 「不論身強弱者，四柱雖有比劫仍去生助食傷也」 (比劫 may remain — they feed 食傷); 「必要食傷在提綱也」 (月令 must carry 食傷); 「吾兒又得兒者，必要局中有財」 |
| `V2_STATUS` | `RESEARCH_ONLY` |

---

## P-004 — 專旺/獨象 requires season

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-004 |
| `SOURCE` | 滴天髓闡微, 任鐵樵, 形象第十一 |
| `TEXT_LAYER` | `NAMED_COMMENTARY` |
| `EXACT_TEXT` | 「木日，或方或局全，不雜金為曲直…土日，四庫皆全，不雜木為稼穡…皆從一方之秀氣，不同六格之常情。必要得時當令，遇旺逢生。」 |
| `SAFE_PARAPHRASE` | Each mono-element structure requires a complete directional set or trine (except 稼穡, which requires all four 庫: 辰戌丑未), absence of the controlling element, and — stated as 必要 — that it obtain the season. |
| `LOGICAL_FORM` | `專旺 → (COMPLETE_SET ∧ ¬CONTROLLER ∧ 得時當令)` — necessary conditions |
| `SCOPE` | The five named mono-element structures |
| **`DOES_NOT_IMPLY`** | ① that these conditions are *sufficient* — necessary ≠ sufficient. ② a 지장간 **scope** for 不雜 (visible only? hidden too? which tiers?) — the text does not say, and this is exactly why V1 could not confirm 專旺. ③ any operational reading of 遇旺逢生 |
| `V2_STATUS` | `RESEARCH_ONLY` |
| `NOTE` | V1.3 wrongly recorded 任鐵樵 as **silent** on season here and manufactured a conflict with 子平真詮's 又生春月. Both require season; the conflict did not exist |

---

## P-005 — 何其獨旺 belongs to 從勢

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-005 |
| `SOURCE` | 滴天髓闡微, 任鐵樵, 從象 |
| `TEXT_LAYER` | `NAMED_COMMENTARY` |
| `EXACT_TEXT` | 「從勢者，日主無根，四柱財官食傷並旺，不分強弱，又無劫印生扶日主，又不能從一神而去，惟有和解之可也。視其財官食傷之中，何其獨旺，則從旺者之勢。如三者均停，不分強弱，須行財運以和之…」 |
| `SAFE_PARAPHRASE` | In 從勢 — a rootless Day Master with 財/官/食傷 all prosperous and no 劫/印 support — one looks among 財/官/食傷 for whichever is uniquely prosperous and follows *its* momentum; and if all three are level, the case is handled by luck running to 財 to harmonize them. |
| `LOGICAL_FORM` | Within `從勢`: `SELECT_FOLLOWED_FORCE = argmax-prosperity(財, 官, 食傷)`, with an explicit balanced branch |
| `SCOPE` | **Internal to 從勢 only.** It selects which force an already-qualifying 從勢 chart follows |
| **`DOES_NOT_IMPLY`** | ① that "uniquely occupied channel" is an **entry test** for 從財 or 從官殺 — **LOCAL_TO_UNIVERSAL_GUARD violation; V1.3 committed exactly this.** ② that 從勢 requires a uniquely prosperous force — 如三者均停 explicitly covers the level case. ③ any numeric reading of 獨旺 |
| `V2_STATUS` | `RESEARCH_ONLY` |
| `NOTE` | 「不分強弱」 appears **twice** in this passage. V1.3 reported it unverifiable and dropped it |

---

## P-006 — 從旺 requires 印 to be present

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-006 |
| `SOURCE` | 滴天髓闡微, 任鐵樵, 從象第四十七 |
| `TEXT_LAYER` | `NAMED_COMMENTARY` |
| `EXACT_TEXT` | 「從旺者，四柱皆比劫，無官殺之制，有印綬之生，旺之極者，從其旺神也。」 |
| `SAFE_PARAPHRASE` | 從旺: the four pillars are throughout 比劫, there is no 官殺 exercising control, 印綬 **is present and generating**, and prosperity is at its extreme, so one follows the prosperous spirit. |
| `LOGICAL_FORM` | `從旺 → (四柱皆比劫 ∧ ¬官殺之制 ∧ HAS(印綬))` |
| `SCOPE` | 從旺 only |
| **`DOES_NOT_IMPLY`** | ① a **scope** for 皆 — visible stems only, or 지장간 too, and at which tiers. The text does not say; V1.3 resolved it silently to gate a verdict. ② that 印 is merely *permitted* — it is stated as a **positive requirement** (有印綬之生), which V1.1 omitted entirely. ③ that 財/食傷 are separately named breakers — they are excluded by 皆, not by their own clause |
| `V2_STATUS` | `RESEARCH_ONLY` |

---

## P-007 — 從强's quantifiers are unquantified

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-007 |
| `SOURCE` | 滴天髓闡微, 任鐵樵, 從象第四十七 |
| `TEXT_LAYER` | `NAMED_COMMENTARY` |
| `EXACT_TEXT` | 「從強者，四柱印綬重重，比劫疊疊，日主又當令。絕無一毫財星官殺之氣，謂二人同心，強之極矣，可順而不可逆也。」 |
| `SAFE_PARAPHRASE` | 從强: 印綬 repeated and 比劫 repeated, the Day Master additionally commanding the month, and not one hair of 財星/官殺 qi. |
| `LOGICAL_FORM` | `從强 → (印綬重重 ∧ 比劫疊疊 ∧ 當令 ∧ ¬ANY(財, 官殺))` |
| `SCOPE` | 從强 only |
| **`DOES_NOT_IMPLY`** | ① any numeric reading of 重重 / 疊疊 — see `QUANTIFIER_REGISTER.md`. V1.3's "two or more" is **ours**, not 任鐵樵's. ② a scope for 絕無一毫 — read across all 지장간 it becomes self-defeating, since the branches constituting such a chart carry hidden 財. That a reading is *needed to make the rule work* is not evidence the author intended it. ③ that 從强 and 從旺 are interchangeable — the same passage distinguishes them on three axes |
| `V2_STATUS` | `RESEARCH_ONLY` |

---

## P-008 — 假從 exists because a helper remains

| Field | Value |
|---|---|
| `PROPOSITION_ID` | P-008 |
| `SOURCE` | 滴天髓 (verse) + its gloss |
| `TEXT_LAYER` | `ORIGINAL_TEXT` (verse); gloss layer recorded separately |
| `EXACT_TEXT` | verse: 「真從之象有幾人，假從亦可發其身」 · gloss: 「日主弱矣，財官強矣，不能不從，中有所助者，便假」 |
| `SAFE_PARAPHRASE` | True following is rare; false following can still bring advancement. Where the Day Master is weak and 財官 strong so that it cannot but follow, yet *something within helps it*, the following is false (假). |
| `LOGICAL_FORM` | `(WEAK_DM ∧ STRONG_財官 ∧ HAS(residual_helper)) → 假從` |
| `SCOPE` | The **weak-Day-Master** following family |
| **`DOES_NOT_IMPLY`** | ① that 眞/假 applies to 從旺/從强/專旺 — those are strong-DM structures and the gloss scopes this to weak ones. **V1.1 over-extended it.** ② that 假從 is a failure state — the verse says it 亦可發其身. ③ any threshold for what counts as 所助 |
| `V2_STATUS` | `RESEARCH_ONLY` |

---

## Propositions deliberately NOT recorded

Anything from the withdrawn V1 contracts that was **our** construction rather than a source's assertion:
`NO_ROOT → CANNOT_BEAR` · "dominant force" · "decisive tilt" · equal-weight faction comparison ·
WEAK/MODERATE/STRONG effective force · the 18-cell table. These are recorded as failures in
`../MYUNGRI_STRENGTH_V1_CLOSURE.md`, not as propositions here.
