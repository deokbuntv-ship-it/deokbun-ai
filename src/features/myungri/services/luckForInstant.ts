// 세운·월운 CANONICAL DATE ATTRIBUTION (§10/§11). When a 세운/월운 query carries a DATE/instant
// (not just a year label), the Saju year must roll at 立春 and the Saju month at the twelve 節 —
// never Jan 1 / lunar-new-year / lunar-month-1. These wrappers resolve the (sajuYear, jieMonthOrdinal)
// from the instant via the SAME frozen attribution the natal chart now uses, then delegate to the
// existing 세운/월운 arithmetic. Pure arithmetic in calculateSewoon/calculateWolwoon is unchanged.
import {
  LUNAR_JS_SOLAR_TERM_ADAPTER,
  resolveSajuYearAndMonth,
} from '../../interpretation';
import type { LunarJsSolarTermAdapter } from '../../interpretation';
import { calculateSewoon } from './calculateSewoon';
import { calculateWolwoon } from './calculateWolwoon';
import type { NatalPillarContext, SewoonResult, WolwoonResult } from '../domain/contracts';

export type SajuTemporalForInstant = {
  sajuYear: number;
  jieMonthOrdinal: number;
};

/** Resolve the 立春-based Saju year + 節-based month ordinal (寅월=1…丑월=12) for a UTC instant. */
export function resolveSajuTemporalForInstant(
  instantEpochSeconds: number,
  adapter: LunarJsSolarTermAdapter = LUNAR_JS_SOLAR_TERM_ADAPTER,
): SajuTemporalForInstant | null {
  const r = resolveSajuYearAndMonth(instantEpochSeconds, adapter);
  return r.ok ? { sajuYear: r.value.sajuYear, jieMonthOrdinal: r.value.jieMonthOrdinal } : null;
}

export type SewoonForInstantInput = {
  natal: NatalPillarContext;
  /** UTC epoch of the target date; its Saju year is resolved by 立春. */
  instantEpochSeconds: number;
};

/** 세운 for a target DATE — year pillar attributed by 立春 (a date before 立春 → previous Saju year). */
export function calculateSewoonForInstant(
  input: SewoonForInstantInput,
  adapter: LunarJsSolarTermAdapter = LUNAR_JS_SOLAR_TERM_ADAPTER,
): SewoonResult {
  const t = resolveSajuTemporalForInstant(input.instantEpochSeconds, adapter);
  // Attribution failure (e.g. out of solar-term range) → fail-closed via the invalid-year path.
  return calculateSewoon({ targetYear: t ? t.sajuYear : Number.NaN, natal: input.natal });
}

export type WolwoonForInstantInput = SewoonForInstantInput;

/** 월운 for a target DATE — month pillar attributed by the active 節 interval (Jie), not lunar month. */
export function calculateWolwoonForInstant(
  input: WolwoonForInstantInput,
  adapter: LunarJsSolarTermAdapter = LUNAR_JS_SOLAR_TERM_ADAPTER,
): WolwoonResult {
  const t = resolveSajuTemporalForInstant(input.instantEpochSeconds, adapter);
  return calculateWolwoon({
    targetYear: t ? t.sajuYear : Number.NaN,
    lunarMonth: t ? t.jieMonthOrdinal : Number.NaN,
    natal: input.natal,
  });
}
