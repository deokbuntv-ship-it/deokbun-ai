# MYUNGRI CORE AUDIT REPORT

**Sprint:** MYUNGRI CORE INTEGRATION — Phase 0 (read-only audit)
**Date:** 2026-08-24 · **Base commit:** `6e924ab` · **Method:** 2 read-only Explore agents (engine layer + consumer-grounding wiring) + direct source reads.
**Headline:** The deterministic 명리 core is **already complete, frozen, and fully wired into the consultation prompt.** The one genuinely-missing aggregate (일간 기준 십신 역할 구성) is now built (M-18, facts-only). The one genuinely-*absent* judgment (신강/신약 세력 verdict) is a **deliberate, theory-gated deferral** with no adopted threshold in the repo → Owner Review.

---

## A–N answers

### A. 오행 구성 — count or weighted strength?
**Pure COUNT.** `calculateFiveElementDistribution` (`interpretation/saju/distribution/…`) does `counts[element] += 1` over the 8 visible slots (4 stems + 4 branches). No weighting, no 월령 factor, no position factor. It is **구성(composition)**, not **세력(strength)** — exactly the §6 distinction. Exposed to the prompt as `오행 분포` (`sajuEvidenceAdapter.ts:133-138`).

### B. Are 지장간(hidden stems) folded into the 오행 distribution?
**No.** The distribution counts only the 8 visible slots. Hidden stems are a **parallel fact stream** (`십신·지장간` section, `sajuEvidenceAdapter.ts:140-143`), carrying their own 십신. Merging them into a single weighted element total would require a 여기/중기/정기 weighting convention — a 세력 decision, not made anywhere.

### C. 월령(month command) deterministic?
**Yes, single-factor deterministic.** `calculateMonthCommand` produces 월지 element, 일간 왕상휴수사 phase (旺/相/休/囚/死), 득령/실령(IN/OUT_OF_COMMAND), season, 月建 ordinal — all from the canonical (立春/節) month branch via frozen rules. **No verdict** (it is an INPUT to strength, not the strength). Exposed as `월령·득령(입력 사실)` (`:164-171`).

### D. Is 구성(composition) separated from 세력(strength)? (§6)
**Yes — and only composition exists.** Everything computed is composition-level facts (counts, phases, rootings, relations). The 세력 layer (weighting composition by 월령/통근/투간/position into a strength magnitude) **does not exist**. The freeze doc (`MYUNGRI_V1_FREEZE.md`) states the calc layer is "facts-only, NO strength verdict."

### E. 신강/신약 deterministic anywhere?
**No — and it is actively forbidden.** There is no 신강/신약 calculator in the repo (grep confirms only prompt-bans, tests, docs, the compiled edge bundle, and `monthCommand.ts` seasonal phase). Additionally the LLM is **forbidden** to assert it: the term is banned in the prompt (`structuredConsultation.ts:61`) and any answer asserting 신강/신약/용신/격국/12운성/12신살 is nulled by the `FORBIDDEN_THEORY` validator (`structuredConsultation.ts:238-239,367`). The adapter states it explicitly: `강약/용신/격국/12운성/12신살은 V1 미계산(사실로 단정 금지)` (`sajuEvidenceAdapter.ts:316`).

### F. Strength grades (e.g. 7-level 태강…태약)?
**Zero.** No grade enum, no thresholds, no classifier. Grading requires the (missing, contested) 세력 score + boundary values.

### G. 대운(daewoon) deterministic?
**Yes, fully.** ENGINE-12 owns it: 순행/역행 by year-stem yin-yang × gender, 절입 datetime → start age, 10-year sequence, per-cycle 간지. Myungri adds 대운십신 via frozen `calculateTenGod` (`calculateDaewoonTenGods`). Exposed with direction + start/end ages + `〈현재〉` marker + 대운십신 (`sajuEvidenceAdapter.ts:173-189`), with full ENGINE-12 provenance (`:302-308`).

### H. Current-daewoon SELECTION correct?
**Deterministic but coarse.** `consultationGrounding.ts:175-183` selects the active cycle by **year-granularity age arithmetic** (`currentSajuYear − solarBirthYear`), not by comparing "now" against each cycle's exact 절입 datetime boundary. Off-by-one is possible in the weeks around a birthday/節 boundary. **Non-blocking** (facts-only, and the active-cycle marker is advisory), but flagged as a precision follow-up. See Integration Plan §C-2.

### I. 세운/월운(sewoon/wolwoon) deterministic?
**Yes.** `calculateSewoonForInstant`/`calculateWolwoonForInstant` compute the year/month 간지 + 십신 + 원국관계 + (월운) 세운관계 from the frozen engine, including **question-targeted** future years/months so a "2027년"/"내년 2월" answer is grounded and becomes a valid timing anchor (`sajuEvidenceAdapter.ts:191-233,249-276`).

### J. Cross-layer interactions (원국×대운×세운×월운)?
**Deterministic, computed.** `calculateMyungriTimeAxis` + `pillarRelations` produce cross-layer 합/충/형/파/해 + 삼합/방합, exposed as `시간축 연결` (`:235-243`). Natal 관계 and 세운 관계 are likewise computed, not inferred.

### K. 통근/투간(rooting/transparency)?
**Deterministic.** `calculateRootingTransparency` matches each stem to its branch roots (same-干 identity) + reveals 지장간 → 천간. Same-*element* rooting is a deferred policy choice, not done. Exposed as `통근`/`투간` (`:155-162`).

### L. Evidence adapter → does it reach the prompt?
**Yes, verbatim.** `toSajuEvidence` (`sajuEvidenceAdapter.ts`) is a CONVERTER-ONLY formatter ("never calculates") that turns every computed fact into labeled `EngineEvidence.sections`. `buildConsultationGrounding` → `renderGroundingContext` → `promptBuilder.ts:104` renders those sections into the single context system message. The `근거·한계` section carries provenance (立春/12節 + every ruleVersion + real assumptions/limitations) + the 미계산 disclaimer.

### M. Is any core judgment LLM-**inferred** rather than computed? (incl. "불의 기운이 우세" source)
**No core judgment is inferred.** 오행 counts, 대운, 세운/월운, and all 합/충 interactions are computed and rendered; the LLM only **verbalizes** them, and the timing validator (`hasUnsupportedTiming`) rejects any period not backed by daewoon/sewoon/wolwoon anchors. Phrases like **"불의 기운이 우세 / 물이 약하다"** are the LLM putting qualitative words on the **deterministic count vector** (e.g. 火=3, 水=1) that is present in the prompt — the raw distribution is deterministic; only the adjective is the LLM's. The single judgment that is neither computed nor allowed is 신강/신약 (see E).

### N. Shared core across 상담 / 오늘 / 월별 / 유명인?
**PARTIAL.** All paths share the frozen producer `executeSajuFromBirthInput`, `natalContextFromFourPillars`, the 세운/월운 services, and the `derivePolarity` kernel. **Not shared:** the full grounding + `toSajuEvidence` evidence bundle is **consultation-only**. `오늘` computes a day-pillar-only slice; `월별` computes 節-month segments only (and **explicitly defers 대운**, `monthlyEvidence.ts:8`); neither computes 오행 분포 or 대운, and both feed the LLM a **pre-derived tier/plan** (raw 간지 banned from their prompts) rather than raw facts. So the deterministic depth is intentionally lighter for 오늘/월별.

---

## Extra required answers

**Evaluation preservation:** The `EngineEvidence.sections` structure preserves everything computed upstream (adapter header: "Preserves EVERYTHING computed upstream"), plus a `targetPolarities.derivation` audit (harmony/friction counts + exact relation kinds). The "왜 이렇게 보나요?" follow-up does **not** re-guess — it reconstructs from the **stored decision snapshot** (`groundingFromStoredDecision`), reusing the same deterministic grounding.

**STRENGTH_MODEL_FEASIBLE_FROM_REPO = PARTIAL.** The strength *inputs* are all present as frozen facts (오행 count · 월령/왕상휴수사/득령 · 통근/투간 · now 십신 역할 구성). The strength *synthesis* is **blocked**: there is **no adopted weighting/threshold** in the repo. The only concrete scheme found (legacy PHP `0.7/0.5/0.3`, 왕지 ×1.2, 土월 ×0.84, 천간 0.2, 신강 threshold `>1.2`) is documented as **reference-only / author-admitted-unfinished / not adopted** in the owner's `MYUNGRI_100_ADOPTION_ANALYSIS.md`. Per §32 (no theory invention) and §10 (contested threshold), it must **not** be hard-coded → `STRENGTH_THRESHOLD_OWNER_REVIEW_REQUIRED`.

---

## Blocked owner decisions (recorded, per §0/§39)

| ID | Decision | Why blocked |
|----|----------|-------------|
| `STRENGTH_THRESHOLD_OWNER_REVIEW_REQUIRED` | The 세력 weighting formula + 신강/신약 boundary values | No adopted standard in repo; only a rejected legacy scheme (§10/§32). |
| `THEORY_DECISION_REQUIRED — 지장간 weighting` | Whether/how 여기·중기·정기 count toward 세력 | Convention-dependent; a 세력 choice, not a fact. |
| `SHARED_CORE_DEPTH_OWNER_REVIEW` | Whether 오늘/월별 should consume the full myungri evidence (오행분포·대운) | 월별 DB contract + deliberate 대운 deferral; expansion is scope, not a bug. |

All three are **independent** of the safe work delivered this sprint (M-18), which needs none of them.
