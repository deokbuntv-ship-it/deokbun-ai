# GLOBAL SPEND GUARD SPEC (§S)

> **Status:** INVESTIGATION + GAP DESIGN (Sprint F). The guard **already exists**; this documents what is live
> and the delta to the target. No economic policy value is changed this sprint (per standing rules).

## 1. What exists today (verified in code)

- **Migration** `supabase/migrations/20260828000000_global_paid_generation_guard.sql`
- **Shared module** `supabase/functions/_shared/globalSpendGuard.ts`
- **Config row** `global_generation_guard`:
  - `generation_enabled boolean` — **kill switch** (false → all new paid generation fails safe).
  - `hourly_limit integer` (seed 100), `daily_limit integer` (seed 1000).
  - `warning_thresholds integer[]` fixed `[50, 80, 95]`.
- **Per-workload weighting** (`units`, 1–100) over the set `chat, today_fortune, monthly_fortune, compatibility,
  summary`.
- **Rolling windows:** hourly + daily used-counts computed at reserve time.
- **Warning levels** returned to the Edge: `NORMAL / WATCH_50 / WARNING_80 / CRITICAL_95`.
- **Hard ceiling:** when `used + units > limit`, the reserve is refused (`exhausted`, with `retryAfterMs`); the
  Edge maps this to `GLOBAL_GENERATION_LIMIT_REACHED` (429). 100% *is* the hard stop; 95% is the last warning.
- **Fail-safe:** `generation_enabled = false` → `disabled` verdict → the Edge refuses new paid work.
- **Service-role only:** the reserve RPC raises `service role required` otherwise.

## 2. Target (from Sprint F) vs current

| Target requirement | Current | Gap / action |
|---|---|---|
| daily budget | ✅ `daily_limit` | none |
| monthly budget | ❌ | **ADD** a monthly window + `monthly_limit` (POLICY) |
| 50% / 80% / 100% thresholds | ✅ 50 / 80 / 95 warn + 100 hard | keep; 95 is the pre-ceiling warning. Optional: rename to make 100 explicit |
| per-workload usage | ✅ `units` per workload | none |
| per-model usage | ❌ (model is uniform today) | **ADD** once §J model routing (Mini/Terra) ships — attribute units by model so Terra spend is visible |
| kill switch | ✅ `generation_enabled` | none |
| 100% → keep cost-free cached features | ⚠️ verify | cached Today/Monthly **reads** must not call the reserve; confirm the read path returns cached rows without `reserve_paid_work` |

## 3. Design deltas (not implemented this sprint)

1. **Monthly window.** Add `monthly_limit` to the config and a monthly used-count (calendar-month or rolling 30d
   — owner decision) alongside hourly/daily. Same fail-safe + warning ladder.
2. **Per-model attribution.** When Mini/Terra routing lands (§J), record the resolved model on each generation
   and expose per-model used-counts so the guard (and the owner dashboard) can see Terra vs Mini spend
   separately. Terra is the expensive tier; per-model visibility is what makes a budget actionable.
3. **Cost-free features at 100%.** The ceiling must gate only *new paid LLM work*. Verify (and lock with a test)
   that a **cached** Today/Monthly fortune read — which performs no LLM call — is served even when the guard is
   `exhausted` or `disabled`. Consultation (always a live LLM call) is correctly blocked.

## 4. Policy values (owner-owned, unchanged this sprint)

`hourly_limit`, `daily_limit`, (new) `monthly_limit`, and the exact KRW→units mapping are **economic policy**.
Sprint F does not set or change them. They should be derived from the §K/§M benchmark (real cost per workload
and per model) plus a target monthly spend ceiling the owner sets.

## 5. Interaction with the Duk economy

The global spend guard is a **platform-wide** safety valve (protects total spend regardless of user balances).
The Duk economy is a **per-user** entitlement. Both must pass for a paid turn to run: a user with Duk still can
not generate if the global guard is exhausted (they are not charged — reserve fails before any charge, per the
billing state machine §R). The two systems are independent and composable.
