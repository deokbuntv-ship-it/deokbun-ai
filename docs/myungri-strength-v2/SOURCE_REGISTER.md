# SOURCE REGISTER

Every source consulted for the V2 corpus. A case may only be counted if its `SOURCE_ID` appears here.

---

## SRC-001 — 滴天髓闡微

| Field | Value |
|---|---|
| `SOURCE_ID` | `SRC-001` |
| `TITLE` | 滴天髓闡微 (Ditian Sui Chan Wei) |
| `BASE_TEXT_AUTHOR` | 京圖 (attributed, Song); 原注 traditionally attributed to 劉基 — **attribution contested by modern scholarship** |
| `COMMENTATOR` | **任鐵樵** (Ren Tieqiao), Qing, 道光 era |
| `ERA` | base text Song (attributed) · commentary c. 1848 |
| `SOURCE_TIER` | **A** for the verse layer · **B** for 任鐵樵's commentary — recorded per-case, never merged |
| `TEXT_LAYERS_PRESENT` | `ORIGINAL_TEXT` (原文 verse) · `YUANZHU` (原注) · `NAMED_COMMENTARY` (任氏曰) |
| `ACCESS_LOCATION` | `https://www.guwendao.net/guwen/book_74c064ea85bf.aspx` (63-chapter index). Per-chapter pages `bookv_<hash>.aspx`. Mirrors: 古詩文網 `gushiwen.cn`, Wikisource `zh.wikisource.org/wiki/滴天髓闡微`, ctext.org |
| `COPYRIGHT` | **Public domain.** Base text and 1848 commentary both long out of copyright. Site presentation is not the text |
| `SCRIPT` | This edition is rendered in **SIMPLIFIED** characters (体用, 时, 煞, 泄, 财). Transcribed verbatim as printed; **not** converted to traditional |
| `RELIABILITY_NOTES` | Generally faithful, but **contains OCR/typesetting corruption**. Observed: 「刑丧破髦」(耗 expected) · 「损之反角其触」(反触其怒 expected) · 「未中已土」(己 expected) · 「不如」(不知 expected) · run-together luck pillars 「己巳庚午」. All transcribed as printed and flagged `TRANSCRIPTION_UNCERTAIN` rather than silently corrected |
| `KNOWN_SCHOOL_BIAS` | 滴天髓 lineage; 氣勢-oriented whole-chart reading. Notably **hostile to 俗論** (conventional/formulaic reading) — 任鐵樵 repeatedly constructs examples specifically to refute mechanical rules, which makes this source unusually rich in counterexamples |
| `WORKED_EXAMPLE_FORMAT` | `<4 pillars> / <大運 sequence> / <任氏 analysis>` |
| `SEX_MARKERS` | This edition carries **no** 乾造/坤造 labels in the chapters surveyed. `SEX_IF_GIVEN = NOT_STATED` throughout — never inferred |
| `QUOTE_VERIFICATION_STATUS` | Chapter-level verified by direct retrieval |
| `MACHINE_READABLE_ALLOWED` | Yes (public domain) |

> **Access note for future researchers:** the URL host `oss.guwendao.net` returns **HTTP 404**. The live
> host is `www.guwendao.net` with otherwise identical paths. `gushiwen.cn`'s book-index page returns 500,
> but its per-chapter `bookv_*.aspx` pages resolve normally.

### Chapters surveyed in S1

| Chapter | Charts found |
|---|---|
| 体用第十四 | 2 |
| 精神第十五 | 3 |
| 月令第十六 | 2 (both season counterexamples) |
| 生时第十七 | **0** — 原文/原注/任氏曰 only, no charts |
| *(further chapters — see `S1_GATE_REPORT.md`)* | |

---

## SRC-002 — 子平真詮 / 子平真詮評註

| Field | Value |
|---|---|
| `SOURCE_ID` | `SRC-002` |
| `TITLE` | 子平真詮 · 子平真詮評註 |
| `AUTHOR` | 沈孝瞻 (Qing) · commentary 徐樂吾 (Republican era) |
| `SOURCE_TIER` | **A** (base) · **B** (徐樂吾 commentary) |
| `ACCESS_LOCATION` | 東里書齋 秘本子平真詮 (卷四 論雜格 verified during V1); Wikisource |
| `COPYRIGHT` | Base text public domain. 徐樂吾 commentary — verify edition status before bulk quotation |
| `RELIABILITY_NOTES` | Verified passages during V1: ch.6 「論十干得時不旺失時不弱」; 論雜格's three sentences on 外格 and 財根深 |
| `KNOWN_SCHOOL_BIAS` | 格局派 — structure-first; treats mono-element forms as 雜格 rather than named 從/專旺 categories |
| `CASES_EXTRACTED` | 0 in S1 — **priority target for S1 continuation** |
| `MACHINE_READABLE_ALLOWED` | Base text yes; 徐樂吾 commentary pending edition check |

---

## SRC-003 — 淵海子平

| Field | Value |
|---|---|
| `SOURCE_ID` | `SRC-003` |
| `TITLE` | 淵海子平 |
| `AUTHOR` | attributed 徐大升 (Song), compiled later |
| `SOURCE_TIER` | **A** |
| `RELIABILITY_NOTES` | V1 located its 曲直格 passage; the 稼穡 couplet 「戊己生居四季中，辰戌丑未要全逢…」 belongs to its 外十八格 眉批 (張真人 chart), **not** to 三命通會 as once misattributed |
| `KNOWN_SCHOOL_BIAS` | 格局/神煞-inclusive older stratum; presence-based disqualifiers (見庚辛即官殺，非此格也) |
| `CASES_EXTRACTED` | 0 in S1 — **known gap; flagged in V1 as `NOT RETRIEVED`** |

---

## SRC-004 — 三命通會

| Field | Value |
|---|---|
| `SOURCE_ID` | `SRC-004` |
| `TITLE` | 三命通會 |
| `AUTHOR` | 萬民英 (Ming) |
| `SOURCE_TIER` | **A** |
| `RELIABILITY_NOTES` | V1 located 「甲乙日得亥卯未局，柱中須有亥字帶印為入格」 and the 稼穡 line 「戊己忻逢四季，乃為稼穡之名」. Groups the five mono-element forms as one section |
| `CASES_EXTRACTED` | 0 in S1 — **known gap; flagged `NOT RETRIEVED` in V1** |

---

## NEGATIVE REFERENCE — not sources, recorded so they are never mistaken for sources

| Item | Why excluded |
|---|---|
| `solve/sinyaksingang.php` (legacy 219-product system) | Author-specific weights (0.7/0.5/0.3, 왕지 1.2, 土월 0.84, 천간 0.2) and a hard `身强 if >1.2` threshold. **Its own author left a comment that the method still needed research.** The owner's `MYUNGRI_100_ADOPTION_ANALYSIS.md` independently concluded: deterministic inputs only, never the verdict |
| `services/natalStrength.ts` (`evaluateNatalStrength`) | Withdrawn Deokbuni classifier. `LEGACY_CANONICAL_AUTHORITY = NO` |
| Generic online 신강/신약 · 점수 · 오행 percentage calculators | No provenance, no author, no reasoning. Admissible only as `NEGATIVE_REFERENCE` |
| Unattributed blog/community material | No identifiable authority |
| AI-generated example charts | Not evidence |

---

## Source diversity status (S1)

`SOURCE_MONOCULTURE_RISK = **HIGH**` — the S1 corpus is drawn overwhelmingly from `SRC-001`.

This is disclosed rather than disguised. It has a defensible reason (滴天髓闡微 is by far the densest
retrievable collection of worked charts with explicit strength reasoning) and a real cost (a single
lineage's habits will look like universal doctrine). **Diversifying into SRC-002/003/004 is the first
priority of any S1 continuation**, and no axis may be frozen at S2 while the corpus remains single-source.
