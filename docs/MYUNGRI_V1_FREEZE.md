# Myungri Engine V1 — Deterministic Freeze Record

> **Authoritative freeze/history record.** Documentation only — no code changes here.

## Freeze statement

The DeokbunAI **Myungri deterministic CALC layer is FROZEN** at:

```
canonical commit: 7c7ed82f9dcabad034795919f6103ef562d0a6bb
Codex final review: APPROVED_FREEZE
date recorded: 2026-08-16
```

This freeze covers the **deterministic, fail-closed, facts-only** Myungri calculation layer only.
It does **not** include EngineEvidence adapter/live-wiring or any interpretive/strength layer (see
Deferred). The frozen 立春 year / 12-Jie month boundary basis is settled and **must not be reopened**.

## Codex final-review checklist (all PASS)

| # | Check | Result |
|---|---|---|
| 1 | 立春 year boundary | ✅ PASS |
| 2 | 12 Jie month boundary | ✅ PASS |
| 3 | boundary-minute fail-closed | ✅ PASS |
| 4 | unknown / approximate-time fail-closed | ✅ PASS |
| 5 | supported range 1970–2050 | ✅ PASS |
| 6 | provenance | ✅ PASS |
| 7 | Solar / Lunar equivalence (2024-01-03 = 2023-11-22 → 癸卯/甲子/丙寅) | ✅ PASS |
| 8 | Daewoon regression | ✅ PASS |
| 9 | Sewoon / Wolwoon regression | ✅ PASS |
| 10 | ADOPT 3종 preservation | ✅ PASS |
| 11 | 457 / 457 tests | ✅ PASS |
| 12 | no material or minor freeze-blocking defect | ✅ PASS |

## Completed Myungri scope (frozen at `7c7ed82`)

Deterministic, fail-closed, facts-only — no strength verdict, no interpretation:

1. **Natal Four Pillars** (원국 사주)
2. **Canonical year/month attribution** — YEAR by 立春, MONTH by the twelve 節 (Jie); solar↔lunar
   conversion preserved; reuses ENGINE-12 Solar-Term V1 (lunar-javascript@1.7.7)
3. **Ten gods** (십신)
4. **Hidden stems** (지장간)
5. **Five-element facts / distribution** (오행)
6. **Pillar relations** — 합/충/형/파/해 · 삼합 · 방합
7. **Daewoon** (대운, ENGINE-12 — direction / start-age / 10-yr progression, consumed unchanged)
8. **Sewoon** (세운, 立春-attributed)
9. **Wolwoon** (월운, 節-attributed)
10. **원국 ↔ 대운 ↔ 세운 ↔ 월운 time-axis** (cross-layer relations + set-level 삼합/방합/삼형)
11. **Daewoon ten-gods** (대운십신)
12. **Rooting / transparency** (통근 / 투간) — same-干 identity facts, roles preserved
13. **Month command / 득령 input facts** (월령 · 旺相休囚死 · 득령/실령 single-factor input)

**Commit lineage:** `ccdf0ce` (ENGINE-12 integration) → `5feeb7b` (time-axis V1) → `8ce42b0`
(boundary fix) → `d256b51` (ADOPT 3종) → **`7c7ed82`** (Codex 4 fixes — **freeze**).

Boundary-fix detail: `MYUNGRI_YEAR_MONTH_BOUNDARY_FIX.md`. Time-axis + relations + ADOPT:
`MYUNGRI_TIME_AXIS_V1.md`. Adoption analysis: `MYUNGRI_100_ADOPTION_ANALYSIS.md`.

## Deferred / separately scoped (NOT in this freeze)

**Do NOT implement here (separately scoped):**
- 신강신약 (strength) verdict · 강약 score
- 용신
- 격국
- 12운성
- 12신살

**Do NOT reopen (settled & frozen):**
- calendar research · Solar-Term research · 立春 / 12-Jie rules · Daewoon theory · new-OSS research

**Deferred integration (do NOT start yet):**
- EngineEvidence adapter (`myungri` slot) + live-wiring into the prompt path
  (contextSelector → run engines → EngineEvidence → orchestration → promptBuilder).

## Constraints of record

Local commits only through `7c7ed82`. **No push, no deploy, no DB changes** were performed for the
Myungri V1 track. This document records the freeze; it authorizes no new work.
