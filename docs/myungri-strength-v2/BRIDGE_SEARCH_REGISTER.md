# BRIDGE SEARCH REGISTER — S1.6

Status: **S1.6 RESEARCH ARTIFACT — NOT CANONICAL DOCTRINE**

Purpose: prevent repeated blind searching. Records what was searched, what
worked, what failed, what was refuted, and the environment traps that cause
**silent corruption** rather than clean failure — the most dangerous class,
because they produce plausible wrong answers.

---

## 1. Corpora fully retrieved and literally searched

| Work | Size / extent | Route |
|---|---|---|
| 滴天髓闡微 (任鐵樵) | 64 ch. / 143,701–159,754 chars (two independent lineages) | wikisource raw, diancang.xyz, suanzhun.net, quanxue.cn, gushiwen.cn |
| 子平真詮評註 (徐樂吾) | 49–51 ch. / 126,365 chars | suanzhun.net, diancang.xyz, 8bei8.com, ncc.com.tw, sanqing.com.tw |
| 子平真詮 base (沈孝瞻) | 43–47 ch. | donglishuzhai.net/chapter/3712–3762, ncc.com.tw |
| 神峰通考 (張楠) | 156,770 chars / 115 pages | zh.wikisource raw, 8bei8.com ×115 pages |
| 三命通會 (萬民英) | 2,895,811 B (kanripo 四庫) + 卷01–12 wikisource + 381 ch. diancang | three independent lineages |
| 淵海子平 | 61,325–173,237 chars | zh.wikisource raw, 8bei8.com, btko.net, sajumania.com |
| 命理約言 (陳素庵) | 4 juan, double-sourced | diancang.xyz, suanzhun.net |
| 千里命稿 (韋千里) | 23 ch. incl. 補充/評斷/應運上·下 | diancang.xyz, 8bei8.com, quanxue.cn |
| 呱呱集 上集 (韋千里) | 5 pages | suanzhun.net (pillars single-host only — see §7) |
| 五行精紀 (廖中, 宋) | 194,000 chars / 35 art. | zh.wikisource raw, suanzhun.net |
| 星平會海 | 136 articles | suanzhun.net |
| 命理探原 (袁樹珊) | 26 articles | suanzhun.net |
| 珞琭子三命消息賦注 / 張果星宗 | 26k / 196k chars | zh.wikisource raw |
| 御定子平, 窮通寶鑑, 子平管見, 蘭臺妙選 | 10 / 6 / 24 / 3 articles | suanzhun.net |

Aggregate: ~970 raw files, ~7.7 MB, plus a separate ~430-page / ~6 MB corpus
from the sequencing-angle sweep.

## 2. Located but NOT retrievable

| Work | Status |
|---|---|
| 《子平粹言》(徐樂吾) | TOC only (武陵出版 1995: 6 編, incl. 第三編 論衰強弱, 第四編 明體立用). Absent from diancang/suanzhun/ctext/wikisource. archive.org's 1,280 hits are all false positives. **Zero verified quotations exist for this book. Treat any claim about its contents as unverified.** |
| 《韋氏命學講義》(1934) | Attested bibliographically, no HTML host found. **UNSEARCHED, not searched-and-empty.** His teaching text — may carry classical worked charts 千里命稿 lacks. Highest-value remaining gap on the 韋 axis. |
| 《造化元鑰》, 《星平會海》(full) | No machine-readable full text obtained. Negatives unscoped. |
| 《現代破譯滴天髓》(鍾義明), 梁湘潤 | Not online in any form. 鍾 appears only as a cited name; 梁 only second-hand, no chart attached. |
| 《滴天髓徵義》 | Moot — see §3 below (it is 任鐵樵's own commentary, republished). 8bei8's `/book/ditiansuizhengyi.html` returns a generic site shell. |
| 《滴天髓補註》(徐樂吾, 1937) full text | Not available as one document. Retrievable only serialized (Zhihu 周易卜命, 575 articles; sina.cn mirrors). The 203 KB GitHub `.txt` is dead — repo returns 404 on the API, raw, and jsDelivr. |

## 3. THE CENTRAL METHODOLOGICAL FINDING — 任鐵樵 vs 徐樂吾 is largely a mirage

The single richest-looking vein in the whole program turned out to be mostly a
dead end, and understanding *why* matters more than the negative result itself.

**《訂正滴天髓徵義》 is not a second authority.** It is 任鐵樵's own commentary,
re-ordered and republished by 徐樂吾. His own front matter states this outright
(`guoxuezhan.com/5711.html`, raw):

> 本書原為研究滴天髓之札記，以其可補任注之缺，易名補注。閱者須與原注(百二漢鏡齋叢刊
> 千頃堂木刻本)**任注(滴天髓徵義本社出版)**參合閱之。

徐 labels 徵義 as 「任注」 issued by 「本社」 — his own press. Any pairing built on
任 vs 徵義 is one commentary layer wearing two names, excluded on the same
ground as 任 commenting on the base verse.

**《滴天髓補註》 IS a genuine second authority — and it deliberately does not
re-analyse 任's charts.** Every retrievable chapter confirms this in practice:

- 衰旺 chapter: 「任注闡發極為精詳，然細按之…上文言之已詳，**無庸重述**。」 —
  followed by five entirely fresh charts of his own, none of them 任's.
- 順局 chapter: partitioned explicitly — 任 supplies cases numbered 472–480, 徐
  supplies 481–483. **Disjoint sets by construction.**
- 假化 chapter: 任 467–471 vs 徐's own four. Disjoint again.

**Near-miss recorded so nobody fuzzy-matches it later**: 徐's case 483 (丁未 丙午
甲午 丙寅) shares day and hour pillars with 任's case 476 (甲午 丁丑 甲午 丙寅)
under the same 從兒 doctrine. **Not the same chart.**

**Corollary — verified twice at close range**: every retrievable 滴天髓闡微 ∩
子平真詮評註 overlap is shared-source reuse, 徐 publishing 任, not two
authorities. Decisive evidence: 方重審's preface, printed **inside 子平真詮評註
itself**: 「今徐子樂吾，既將任註《滴天髓》印行於前，復將《子平真詮》評註於後」. One
verified instance additionally shows 徐 reusing 任's four-character coinage 反為
四助 verbatim, uncited, bound to the identical chart.

**Scope of this negative**: firm for 衰旺, 假化, 順局 (3 of 7 target charts
originally sought). Structurally strong for the whole of 補註 given the pattern
above. **Not firm** for 從象/化象/真從 — those 補註 instalments were never
located, and ctext.org (which might carry them) was wholly unscoped by a
CAPTCHA wall, not bypassed. **Do not use the 任↔徐 axis as independent
corroboration for anything without checking chapter-numbering disjointness
first.**

## 4. Two candidates REFUTED outright

**繼善篇 vs 萬民英's 明通賦解.** Both quotes real and verbatim; the *bridge* is
not. Both cited URLs turned out to be the *same page* — A is an anonymous verse
萬民英 chose to print, B is his own gloss on it. He declares the derivation
himself: 「喜忌篇繼善篇是從此賦變化而出，今人但知有此二篇而不知有此賦，故錄之」. The
adjacent gloss cites 繼善篇 by name — B demonstrably has A in hand. They do not
even disagree: B's 「故月為提綱」 agrees with A's 「月令乃提綱」 and merely adds a
mechanism.

**三命通會 卷十 vs 神峰通考 十干從化定訣 (sequencing).** Quotes real, authorities
genuinely independent — proposition identity fails. 「凡命先論化氣」 is one of
*four* parallel 「凡…先…」 openers inside the same 卷十 section, each nominating
something different as "first" (財官 / 干神尅制 / 化氣 / 五行體面局勢). The
*actual* first of the four, ~2,000 characters earlier, reads 「大凡㸔命先㸔月支
有無財官方㸔其他」 — the **direct inverse** of the refuted claim's own thesis.
Read in context, the quoted passage is a mechanism for deciding 本體-vs-化 by
day/night birth (a 天元變化書 rule), not an ordering rule at all.

**Salvage**: a real contradiction does exist between these two texts on a
different question — 三命通會 「如六甲日生木夜生化土」 vs 神峰通考 「惟甲木則無從化
之理」 — but attribution of the latter is ambiguous (it may sit inside a quoted
賦, not 張楠's own voice).

## 5. Eight Grade-D candidates — recurring failure modes

| # | Chart / topic | Why D |
|---|---|---|
| 癸酉 甲子 丁卯 丙午 | 徐 published 任; reuses 任's coinage 反為四助 uncited |
| 辛卯 丁酉 戊子 戊午 | Identical six-pillar 大運; phrase-level reuse; the whole demonstration set is lifted |
| 乙酉×3 甲申 (卷十一 vs 神峰/沈, first pass) | 萬民英's **own** 卷八 already holds the 從煞 reading — see BRIDGE-A4's defect |
| 戊辰 辛酉 辛酉 戊子 | 徐樂吾 names his source in his own text: 「戊辰一造，見《神峰通考》，為古張知縣命」 |
| 己未 丁丑 丙戌 戊戌 (a second candidate) | B's four cases are 任's first four 順局 charts *in 任's order*, cut at four |
| 淵海子平 眉批 vs 張楠 (sequencing) | A is itself a quotation opening 「神趣八法云」 — both quote the same 賦; A's URL is a permanent 404 |
| 壬辰 辛亥 癸亥 癸亥 (王陽明) | A is anonymous floating commentary shared verbatim with 淵海子平; B self-declares its rule was retrofitted: 「此亦因陽明而立論」 |
| 壬申 辛亥 己巳 丙寅 (韓平原) | REPRINT_ONLY — A is 淵海子平's 喜忌篇 註, reprinted in 神峰通考; 萬民英 himself tags it 「亦是一説」 |

## 6. One outright fabrication, and a fabrication census

**Fabricated quote submitted as evidence**: an alleged 徐樂吾 附註 — 「乙木無根，
氣勢偏於金，為棄命從煞格。金運最美，水土亦吉。」 — **does not exist**. Every
fragment tested individually failed against the real 徐注 on that passage. And
it is substantively wrong on its own terms: 徐 actually writes 印則洩煞之氣為不美,
whereas 印 for a 乙 Day Master is Water — directly contradicting the invented
"水土亦吉".

**Summarizer fabrications caught, all by raw re-retrieval** (this is now the
**fourth** independent research batch in this program to hit this failure
mode — see `S1_5_GATE_REPORT.md` §4 for the prior three):

- "《滴天髓闡微》includes 壬辰 辛亥 癸亥 癸亥 for 王陽明" — **false**; 王陽明/王阳明
  = 0 hits in the complete 闡微. (The chart is real — it appears in 神峰通考 and
  三命通會 — a plausible pattern-match manufactured a false attribution.)
- 庚申乙酉庚戌庚辰 (the CF-009 chart) asserted to be 徐樂吾's own chart "with
  three 丙" — nonsense; 徐's own natal chart is 丙戌 壬辰 丙申 丙申, which he
  states himself in 補註's 通神頌.
- 「丙火用神**臨**於病地」 — the cleaned/corrected reading. No source page anywhere
  reads this; all read 監 (as printed, uncorrected).
- 《金不換骨髓歌斷》 attributed classical-Qing status to text that is a 2022
  annotator's own prose. Every circulating 金不換 text is verse only, no 命例.
- A WebSearch attributed the 己未 丁丑 丙戌 戊戌 commentary to the *adjacent*
  chart 己未 **辛未** 丙戌 戊戌 — a one-character substitution error.
- A 繼善篇 "full passage" that in reality splits across two entries in the 四庫
  text, with a 乃/及 script variant, presented as one continuous quotation.

**Citation defects were endemic, not cosmetic.** `KR3g0042_009.txt` was cited
three separate times for passages that actually live in `_003`, `_006`, `_011`,
`_012`. Book *index* pages were cited as quote sources at least five times.
Wrong chapter names circulated: 論羊刃 (0 hits in 卷05, correct is 論陽刃), 絡繹賦
(0 hits in 卷03, correct is 寅申巳亥四宫互換神煞), 玉井奧訣 (0 hits in 卷12, correct
is 調元賛化), 論用神格局高低 (the correct chapter is ch.21 論星辰無關格局). **A
researcher re-checking any of these at the given citation would find nothing
and could wrongly conclude fabrication** — the fix is always to re-locate by
content, not to trust the cited locus.

## 7. Near-miss registry — record these, never fuzzy-match them

- 徐's 補註 case 483 (丁未 丙午 甲午 丙寅) vs 任's case 476 (甲午 丁丑 甲午 丙寅) —
  same day+hour, same 從兒 doctrine, different chart.
- 任鐵樵's 甲寅 丁卯 乙未 **丁亥** vs 淵海子平's 曲直格 甲寅 丁卯 乙未 **丙子** — first
  three pillars identical.
- 淵海子平's 庚申 乙酉 丙申 **丙申** vs 王十萬 庚申 乙酉 丙申 **己丑**.
- 三命通會's family of 三乙酉 charts (乙酉乙酉乙酉壬午 / 乙酉×4 / 庚辰乙酉乙酉庚辰 /
  庚戌乙酉乙酉壬午) — only 乙酉乙酉乙酉甲申 (BRIDGE-A4) is the target.
- 三命通會 卷08 「乙卯 金狀元 甲午」 — a year pillar plus an office label inside a
  日+時 lookup table, **not** the actual 金狀元 chart, whose day pillar is 丁未,
  not 丁酉.
- 日德/魁罡/十惡大敗 day-pillar *enumerations* parse as four-pillar strings
  (甲寅丙辰戊辰庚辰, 甲寅乙卯庚申辛酉, 庚子壬子辛亥癸亥, 丁酉丁亥癸巳癸卯). **These are
  not charts.**
- Consecutive-jiazi 大運 *rows* dominate raw fingerprint intersections — 55 of
  65 hits in one 韋千里 × 任鐵樵 test were luck-cycle sequences matching each
  other, not natal charts. **A 大運-run filter is mandatory** before treating
  any fingerprint intersection as a candidate.
- 丙辰 丁巳 戊午 己未 (神峰通考 ∩ 滴天髓闡微's one raw fingerprint hit) — a luck-pillar
  run on both sides, not a chart.
- Three regex artefacts where a wide separator character class bridged
  unrelated pillars across a list boundary: 甲寅癸酉乙亥丙子, 癸未乙卯庚子庚辰,
  癸卯庚申庚子庚辰.

## 8. Negatives that can be stated with scope

1. **滴天髓闡微 ∩ 神峰通考 = ZERO exact charts.** Machine-tested 296 distinct 神峰
   chart-sets against 518+ distinct 闡微 chart-sets. The one raw hit is the
   luck-pillar run noted above. Structurally expected — 張楠's cases are Ming
   Jiangxi contemporaries, 任's are Qing.
2. **神峰通考 ∩ 三命通會 = 21 exact overlaps**, of which 5 are usable candidates
   and 16 are explicitly ruled out (5 shared-source verbatim reprints from 舊
   《纂要》/嚴陵命書; 3 day-pillar enumerations that are not charts; 6 that fail
   "reasoning on both sides"; and one 咸池 verbatim reprint).
3. **命理約言 contains no worked charts of its own.** Exhaustive machine check
   across the full text: 卷一 = 2, 卷二 = 0, 卷三 = 4, 卷四 = 4 contiguous
   four-pillar runs — all ten are non-charts (hypothetical 拱夾 illustrations,
   day-pillar lists being debunked, or material inside 附張神峰辟五行諸謬, which
   is 張楠's text, not 陳素庵's). **陳素庵's doctrine is argued entirely without
   case material — his value to this program is doctrinal only.**
4. **No 韋千里 × 任鐵樵 bridge beyond BRIDGE-B4.** 286 + 31 韋 strings intersected
   against 2,201 闡微 strings; after 大運-run filtering, exactly three survive,
   two of which are verbatim reprints from the 外格篇 with no new analysis.
5. **No 韋千里 × 沈孝瞻 base-text bridge.** Every 子平真詮評註 overlap sits in the
   徐注 commentary layer, never in the Qing 原文.
6. **No usable 韋千里 × 三命通會 bridge.** One candidate self-flagged by 韋, and
   三命通會 supplies no per-chart reasoning to compare against; the string does
   not occur contiguously anywhere in the 四庫 text.
7. **No 徐樂吾 counterpart found for any of the seven original 滴天髓 target
   charts** (see `CROSS_LINEAGE_BRIDGE_CASES.md` for which). Four are negative
   and scoped via the 順局 chapter partition; three remain unresolved with no
   positive evidence found — not proven absent.
8. **朱文公 (朱熹) 庚戌 丙戌 甲寅 庚午 — SINGLE SOURCE.** Exactly one occurrence
   corpus-wide, in 三命通會 卷六. 朱文公 appears in no other work; 朱熹 nowhere.
9. **顏子 己丑 辛未 丙午 戊子 — SINGLE AUTHOR** across two 萬民英 passages.
   ⚠️ 顏子 also appears in 神峰通考, 淵海子平, 星平會海, 子平管見 — **every one a
   literary allusion** to Yan Hui as the archetypal short-lived virtuous man
   (祿馬衰微，顏子難逃短命), **never a chart**. Grepping the name alone
   manufactures a false bridge.
10. **章統制 辛丑 辛丑 辛丑 庚寅** — 沈孝瞻 + 徐樂吾's commentary on the same
    passage. One lineage; excluded by the program's own rule. (Note for the
    record: 徐 openly rejects 沈's own reading — 「然如章統制辛丑一造，寅中木火財官
    可用，何待于遥？」 — but this remains one lineage disputing itself, not a
    bridge.)
11. **Zero chart occurrences anywhere in the corpus for**: 曾國藩, 李鴻章, 乾隆 (as
    a chart), 袁世凱, 孫中山, 左宗棠, 張之洞, 和珅. 蔣介石 appears only in 千里命稿
    (single source). 彭玉麟 is mentioned by 徐樂吾 but with day-stem/month only,
    never eight characters.
12. **丁亥 辛亥 己卯 戊辰 (丁都督, 勾陳得位) and 庚戌 壬午 壬寅 辛亥 (李都督, 玄武當權)
    — SINGLE-SOURCE (淵海子平 only).** Zero hits across all 21 三命通會 volumes,
    full 神峰通考, full 子平真詮, full 滴天髓/闡微 — **even though the doctrine
    names 勾陳得位 and 玄武當權 occur in six and four of those documents
    respectively.** The doctrine travelled; the specific charts did not.
13. **乙卯 丁亥 丁未 庚戌 (金狀元) and 庚申 乙酉 丙申 己丑 (王十萬)** — not in 三命通會
    (any volume), not in 神峰通考. Two-source only (both from 淵海子平/子平真詮).
14. **壬申 壬子 戊午 乙卯 (葛參政, BRIDGE-B1) is not in 神峰通考** (156,770 chars,
    zero hits) and not in 滴天髓/闡微.
15. **扶抑 never appears in 神峰通考** (0 occurrences). 中和 = 47, 用神 = 58. Its
    content is renamed 損/益 and demoted to two of张楠's four "medicines."
16. **No pre-1950 named second authority** analysing the same eight characters
    as any of the six S1.5 rooted-following target charts, having searched
    specifically for 徐樂吾, 鍾義明, 梁湘潤, 韋千里.
17. **No Korean-corpus bridge pursued.** `dk-saju.com` hosts 적천수천미, but
    Korean editions translate the same 任鐵樵 commentary layer — the already
    excluded layer. Reopening this needs a Korean author's **own** 재해석
    (e.g. 박주현, 김동규), not a translation of 적천수천미.

## 9. Explicitly UNSCOPED — do not state negatives for these

- **ctext.org** — CAPTCHA (3,009-byte interstitial) or HTTP 403 from every
  environment tried. Not bypassed. Contributed nothing and cannot be scoped
  either way.
- **三命通會 for contiguous-string chart matching generally** — an artefact of
  its column-split table formatting, not evidence of non-overlap (§6, §10).
  Any "zero hits in 三命通會" claim made by simple string search should be
  treated as provisional until a column-aware extractor is built.
- 子平粹言, 造化元鑰, 星平會海 (full), 八字提要, 三車一覽, 巾箱秘術, 韋氏命學講義,
  滴天髓徵義 — no full text obtained for any of these.
- 三命通會 卷二 (simplified recension) — malformed API JSON on two attempts.
  Covered by the 四庫本 卷02, which was clean and returned zero hits, so the
  traditional-recension gap is closed even though the simplified one is not.
- 滴天髓 subpages /16, /27, /38 on zh.wikisource — HTTP 429, retry-exhausted.
- **神峰通考 vs 徐樂吾 / 命理約言 / 韋千里 — never run.** This is the single
  highest-value cheap next step: 徐樂吾 is the named authority where 專旺格
  is reported (elsewhere) to first appear as a taxonomic bucket, so a shared
  chart against 神峰通考's 296 catalogued examples would be doubly valuable.

## 10. Environment traps that cause SILENT CORRUPTION, not clean failure

These are the most dangerous findings in this register, because they produce
**plausible wrong answers**, not errors that announce themselves.

1. **The Bash tool on this Windows box mangles CJK command-line arguments.**
   `三命通會/卷五` arrived at `curl` percent-encoded as `%DF%B2%D9%A4…` and the
   Wikimedia API normalised it to the nonsense title `卟伽髯/祥玳` — **HTTP 200,
   plausible-looking, completely wrong content.** Fix: keep every Chinese
   literal inside a script file written with the Write tool, or hand
   percent-encode it. Same bug class in Git Bash `curl` (`srsearch contains
   invalid or non-normalized data`).
2. **Simplified/traditional script split defeats literal search.** `先明從化`
   returns 0 site-wide while `先明从化为本` is present verbatim in 神峰通考.
   **Every literal string must be searched in both scripts.** All 60 ganzhi are
   byte-identical across scripts, so *chart* fingerprint matching is safe —
   but *prose* matching is not, and this trap alone would have produced a false
   negative on the strongest 從化-first sequencing witness found.
3. **The Grep tool silently omits very long lines** (`[Omitted long matching
   line]`), hiding real matches in 三命通會 wikitext where some lines exceed
   20,000 characters. Switch to offset-based extraction for that corpus.
4. **Column-split classical tables defeat contiguous-string matching.** 三命通會
   卷八/卷九 and 星平會海 卷十 print cases in interleaved columns; the kanripo
   transcription encodes double-column notes as `(X/Y)`. **This produced the
   mechanical hole in BRIDGE-A4's first negative control.** Reconstruct
   reading order mechanically before searching, or treat any "not found"
   result from these volumes as provisional.
5. **Wikimedia rate-limits at roughly 3–5 rapid requests**, and the 429
   response body is *plain text* that will crash a JSON parser expecting the
   normal response shape. Space requests 700 ms–3 s apart with backoff.
6. **suanzhun.net systematically renders 交 as 郊** — provable from within its
   own file (its `<meta description>` preserves 交媾/交戰 while the page body
   prints 郊媾/郊戰). At least three reported quotations in this hunt carried
   this corruption before being caught. **Do not cite suanzhun.net without a
   second witness.**
7. **PowerShell 5.1 misreads UTF-8-without-BOM scripts as ANSI.** Keep `.ps1`
   files pure ASCII; read query strings with `Get-Content -Encoding UTF8`;
   encode outbound strings with `[uri]::EscapeDataString`.
8. **`python`/`python3` on this machine are Windows Store stubs** (version
   0.0.0.0, exit code 49). Node.js is present and reliable; use it for all
   tooling.
9. **A scratchpad script file was silently rewritten mid-session** when two
   background agents happened to share a filename. Use uniquely-named scratch
   files whenever agents may run concurrently in the same directory.

## 11. What worked — the recommended method going forward

**Raw byte retrieval + local extraction, always, for anything load-bearing.**
`curl` / PowerShell `WebClient` / `Invoke-WebRequest` to a local file → charset
detect (`Content-Type` header, then `<meta>` sniff; gb2312/gbk normalised to
gb18030) → strip HTML tags locally → literal `indexOf` / `grep -F` / codepoint
dump. **No summarizing layer should touch any string that will be quoted as
evidence.**

**MediaWiki `insource:"…"` is the single most trustworthy literal-verification
tool found in this program.**
`zh.wikisource.org/w/api.php?action=query&list=search&srsearch=insource:"STR"`
is an exact-substring index. It returns 0 honestly and **cannot fabricate a
containing sentence.** Recommend it as the default check for any load-bearing
quote. `action=query&titles=A|B|C` settles page existence for a whole title
list in one request.

**`action=raw` wikitext** gives clean plain text with no HTML, no JS. Some
pages return 404 on `?action=raw` regardless of user agent — fall back to
`api.php?action=query&prop=revisions&rvprop=content&rvslots=main` or the REST
`api/rest_v1/page/html/…` endpoint.

**Concatenated 8-character search** (no spaces: `戊戌丙辰乙未丙戌`) is the single
most useful discovery trick for modern Chinese self-media, because that is how
self-media authors title their posts. Quoted, spaced strings tokenise into
noise on Baidu.

**Cross-host corroboration for chart identity, verified by codepoint dump, not
by eyeballing.** Several verdicts in this hunt turned on distinguishing 己
(U+5DF1) from 已 (U+5DF2) from 巳 (U+5DF3), and 戊 (U+620A) from 戌 (U+620C) — all
confirmed programmatically.

**五虎遁 and 五鼠遁 as anti-fabrication tests.** These validate a chart's month
and hour stems against its year and day stem. A fabricated chart usually fails
one of them. Both derivation checks passed on BRIDGE-A3 and on BRIDGE-A1/B4 —
positive evidence against invention. Cheap; should be standard on every
candidate before it is trusted.

**Chronology, read off a book's own preface, as the independence test.**
Publication datelines settled derivation direction for the two strongest
bridges (BRIDGE-A1 and BRIDGE-A2: 韋千里's 1935 preface precedes 徐樂吾's
February-1936 one) far more decisively than any stylistic argument could.

**Real-browser DOM text where scripted HTTP is blocked.** `zhuanlan.zhihu.com`
returns HTTP 403 to a scripted `curl` but yields full rendered text through a
browser pane. `baijiahao.baidu.com` returns HTTP 200 with a 1,488-byte 百度安全
验证 stub to every scripted fetch attempted (desktop UA, iPhone UA, Referer,
Accept-Language, and the `mbd.baidu.com/newspage` mobile form all failed).
**Any baijiahao "quote" obtained from a scripted fetch, or from a summarizer,
is necessarily fabricated** and should be discarded on sight.

## 12. What failed

| Route | Failure mode |
|---|---|
| **ctext.org** | CAPTCHA (3,009 B) or HTTP 403 universally. Not bypassed. Wholly unscoped. |
| **WebSearch prose summaries** | Repeatedly and demonstrably wrong; produced at least six fabrications (§6). Usable for **link discovery only**, never for a quotation. |
| **WebFetch, used for a quotation** | Not used for any load-bearing string by policy in this hunt. |
| **DuckDuckGo HTML endpoint** | Worked for ~2 queries, then a CAPTCHA challenge page. |
| **Bing** | Returned wholly unrelated results for exact-phrase CJK queries — a speed-test site and a page of unrelated results for a site-restricted query. Apparent proxy interference. Unusable for this program. |
| **Baidu, scripted** | Returns a 1.4 KB JS shell. Browser-driven Baidu (raw `#content_left` DOM extraction) is the only reliable Chinese search corpus found. |
| **Zhihu search / author article lists / `/api/v4/members/…`** | 401, login-gated. On-site search returns "未搜索到相關內容" when logged out. |
| **Sina blog article indexes** | "系統維護中，博文僅作者可見" — but the **homepage** still renders recent posts in full. Scrape homepages, not indexes. |
| **Weibo direct post URLs** | 302 redirect to the Sina visitor-cookie wall. Works only on a *second* navigation after the visitor cookie is set. `m.weibo.cn` returns "不合法的請求". |
| **Paywalled sources** | wenxue100.com (500 chars/chapter preview), cuwen.com, one 658-article Weibo series (~87% paywalled), 微盤/Scribd/Z-Library (download-gated — not attempted, per the untrusted-source rule). |
| **JS-only single-page apps** | shidianguji.com, sajumania.com's homepage (106 chars of extractable text), qire.net (21 chars), 8bei8's 淵海子平 index page (`href="javascript:;"` throughout). |

## 13. Provenance discipline — the standing caveat on this entire register

**Every source in this program is a modern digital transcription. Not one
printed edition, facsimile, or scan was collated against.** Concretely
demonstrated hazards, so nobody re-discovers them the hard way:

- All three retrievable 神峰通考 sources are **one simplified digitization**,
  not three independent witnesses — the wenxue100 paywall preview is
  byte-identical to 8bei8, **including its errors**: 雕桔 for 凋枯 (in a chapter
  title), 印緩 for 印綬, 師大找 for 師大撓, 克這 for 克之. A photographic witness
  exists (`commons.wikimedia.org/wiki/File:NLC416-13jh001619-43305_神峰通考.pdf`,
  國家圖書館, 2 vols / 6 卷) and would settle any disputed character — it has
  **not** been OCR'd.
- Only ONE OCR lineage of 千里命稿's 應運篇 exists online, and it is visibly
  corrupt: 午**水**洩秀 (should be 午火), 干上庚庚辛**酉**方一氣 (should be 西方), 柄
  for 丙, 這 for 之, 下丑 for 丁丑, 杌**楻** for 杌陧, 洗冠生 for 冼冠生.
- 三命通會 (四庫本) is a faithful traditional transcription but carries
  `{{SKchar|NNNN}}` glyph placeholders and `{{SK notes}}` wrappers; at least one
  quoted `然後[參]` had to be reconstructed from surrounding context.
- 命理約言's two hosts share identical corruptions (凡**若**者宜扶 for 凡弱者宜扶;
  看用**身** for 看用神; 相**姿** for 相資) — confirming they are one digital
  lineage, not two witnesses.
- 東里書齋's 子平真詮 is explicitly a 秘本 collated against a 中州本, carrying
  modern 【校：…】 and 【東里山人按：…】 layers. These must never be quoted as if
  they were classical text.
- Office-title variants observed and recorded as **transmission fingerprints,
  not errors to silently normalise**: 李總兵/李部兵, 萬宗人/萬宗仁, 丁部督/丁都督,
  李參政/李廉使, 李侍郎/尚書命, 蔡貴妃/古蔡妃, 張知院/張知縣, 譚二華/譚論, 貴女命/青女命.

**Nothing in `CROSS_LINEAGE_BRIDGE_CASES.md` or this register should be
published as a primary-source quotation without an edition check against a
print or facsimile witness.** Everything verified here is verified as *what
the circulating digital text currently says* — a real and useful claim, but a
different one from *what the classical author actually wrote*.

---

## 14. Ranked recommendations for the next search pass

1. **Resolve the BRIDGE-A4 defect** with a column-aware extractor over 三命通會
   卷八/卷九. Decides whether the program's most-attested chart is a genuine
   Grade-A bridge or an intra-source inconsistency. Cheap relative to its
   value.
2. **Run the 296 神峰通考 charts against the 徐樂吾 corpus.** Never done; the
   overlap-checking tooling exists (`scripts/research/chart-fingerprint.mjs`
   can be extended). 徐樂吾 is the named authority where 專旺格 as a taxonomic
   category is attested, so a shared chart against 神峰通考's catalogue would
   be doubly valuable.
3. **Mine 溫遇甲's 54-post 古命例 category** (`blog.sina.com.cn/u/3190614500`) —
   structurally a purpose-built 「任鐵樵分析：… / 溫遇甲點評：…」 bridge corpus.
   Scrape the homepage; the article index is login-gated.
4. **Obtain a print or scanned witness for 神峰通考 and 千里命稿** before either
   is published as a primary-source quotation anywhere outside this research
   directory. The Wikimedia Commons NLC scan is the offline route for the
   former.
5. **Fix every citation before reuse** — the corrected loci are recorded
   inline in `CROSS_LINEAGE_BRIDGE_CASES.md` and above in §6/§8.
