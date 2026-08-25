// Shared deterministic TEMPORAL CONTEXT for the consumer features (오늘의 운세 · 월별운세; also usable by 상담).
//
// ORCHESTRATOR ONLY — introduces NO new calculation, NO strength verdict, NO interpretation. It composes the
// SAME frozen services the consultation grounding uses (calculateSajuDaewoon / calculateDaewoonTenGods /
// calculateSewoonForInstant / buildRelationsToNatal) so 오늘·월별·상담 see the IDENTICAL natal composition +
// active 대운 + current 세운 for the same (natal, instant). Facts only — tone/polarity is derived by the
// feature layers via the shared `derivePolarity` kernel (kept out of here to avoid a myungri→polarity dep).
import {
  calculateSajuDaewoon,
  LUNAR_JS_SOLAR_TERM_ADAPTER,
  type FiveElement,
  type SajuEngineResult,
} from '../../interpretation';
import { calculateDaewoonTenGods, type DaewoonCycleTenGods } from './daewoonTenGods';
import { calculateSewoonForInstant } from './luckForInstant';
import { buildRelationsToNatal } from './pillarFacts';
import type { NatalPillarContext, RelationsToNatal, SewoonResult } from '../domain/contracts';

/** Which integer-age 대운 cycle contains `currentAge` (the engine's cycles are integer-age spans). */
export function selectActiveDaewoonCycleOrdinal(
  cycles: readonly { ordinal: number; startAgeInclusive: number; endAgeInclusive: number }[],
  currentAge: number | null,
): number | null {
  if (currentAge === null) return null;
  const active = cycles.find((c) => currentAge >= c.startAgeInclusive && currentAge <= c.endAgeInclusive);
  return active ? active.ordinal : null;
}

/**
 * Full elapsed years (만나이) from a birth civil date to an eval civil date. This matches the engine's OWN
 * duration-based 대운 start-age basis (rawStartAgeYears = elapsed-from-birth), unlike the prior year-subtraction
 * (evalYear − birthYear) which over-counts by 1 before the birthday → a ±1-year error at decade boundaries.
 */
export function fullElapsedYears(
  birth: { year: number; month: number; day: number },
  evalDate: { year: number; month: number; day: number },
): number {
  let years = evalDate.year - birth.year;
  if (evalDate.month < birth.month || (evalDate.month === birth.month && evalDate.day < birth.day)) years -= 1;
  return years;
}

/** KST (UTC+9) civil date for a UTC instant — the eval-date basis for 대운 selection (Korea has no DST). */
function kstCivilDate(instantEpochSeconds: number): { year: number; month: number; day: number } {
  const d = new Date((instantEpochSeconds + 9 * 3600) * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * CANONICAL active-대운 resolver — DATE-based, convention-free. Uses the engine's OWN exposed birth civil date
 * (`start.timing.birthLocalDateTime.date`) to compute true elapsed years (만나이) at the instant, then selects
 * the integer-age cycle containing it. Precision = day-level (matches the engine's date-level source truth); no
 * 세는나이/school choice, no re-derivation of the frozen 절입-distance. null when 대운 unavailable (e.g. 시주
 * 미상) — fail-closed, never a fabricated cycle. Consultation/Today/Monthly all call THIS one resolver.
 */
export function resolveActiveDaewoonOrdinal(
  daewoon: ReturnType<typeof calculateSajuDaewoon>,
  instantEpochSeconds: number,
): number | null {
  if (daewoon.capability !== 'AVAILABLE') return null;
  const age = fullElapsedYears(daewoon.start.timing.birthLocalDateTime.date, kstCivilDate(instantEpochSeconds));
  return selectActiveDaewoonCycleOrdinal(daewoon.cycles, age);
}

export type ActiveDaewoonContext = {
  ordinal: number;
  startAgeInclusive: number;
  endAgeInclusive: number;
  /** 대운 pillar 십신 (천간 + 지지 정기 + 지장간) via the frozen ten-god rule. */
  tenGods: DaewoonCycleTenGods['tenGods'];
  /** 대운 pillar's 합/충/형/파/해 against the natal chart — the feature's polarity input. */
  relationsToNatal: RelationsToNatal;
};

/** The 세운 result narrowed to its AVAILABLE variant (the only one this context stores). */
export type AvailableSewoon = Extract<SewoonResult, { capability: 'AVAILABLE' }>;

export type MyungriTemporalContext = {
  /** 오행 구성 — RAW counts (NEVER 세력/percent). */
  elementCounts: Record<FiveElement, number> | null;
  /** Active 대운 at the instant (null when unavailable / unresolvable). */
  activeDaewoon: ActiveDaewoonContext | null;
  /** Current 세운 (year flow) with 원국 relations (null when unavailable). */
  sewoon: AvailableSewoon | null;
  warnings: string[];
};

/**
 * Compose the shared temporal facts for a chart at an instant. Fail-open on luck (missing daewoon/sewoon is a
 * warning, not a throw) so a feature can still degrade gracefully; the natal composition is always returned when
 * the chart is available. Deterministic; no LLM. The active-대운 is selected by the canonical date-based
 * resolver (`resolveActiveDaewoonOrdinal`, using the engine's own birth date), identical across all features.
 */
export function buildMyungriTemporalContext(input: {
  engineResult: SajuEngineResult;
  natal: NatalPillarContext;
  normalizedBirth: Parameters<typeof calculateSajuDaewoon>[0]['normalizedBirth'];
  instantEpochSeconds: number;
}): MyungriTemporalContext {
  const warnings: string[] = [];
  const { engineResult, natal } = input;
  if (engineResult.status !== 'SUCCESS' && engineResult.status !== 'PARTIAL') {
    return { elementCounts: null, activeDaewoon: null, sewoon: null, warnings: ['CHART_UNAVAILABLE'] };
  }
  const elementCounts = engineResult.output.fiveElementDistribution.direct.counts;

  const sewoonRaw = calculateSewoonForInstant({ natal, instantEpochSeconds: input.instantEpochSeconds });
  const sewoon = sewoonRaw.capability === 'AVAILABLE' ? sewoonRaw : null;
  if (!sewoon) warnings.push('SEWOON_UNAVAILABLE');

  let activeDaewoon: ActiveDaewoonContext | null = null;
  const daewoon = calculateSajuDaewoon(
    {
      normalizedBirth: input.normalizedBirth,
      yearPillar: engineResult.output.fourPillars.year,
      monthPillar: engineResult.output.fourPillars.month,
    },
    LUNAR_JS_SOLAR_TERM_ADAPTER,
  );
  if (daewoon.capability !== 'AVAILABLE') {
    warnings.push('DAEWOON_UNAVAILABLE');
  } else {
    const ordinal = resolveActiveDaewoonOrdinal(daewoon, input.instantEpochSeconds);
    const activeCycle = ordinal !== null ? daewoon.cycles.find((c) => c.ordinal === ordinal) ?? null : null;
    const tg = calculateDaewoonTenGods({ dayMaster: natal.dayMaster, cycles: daewoon.cycles });
    const tgCycle =
      ordinal !== null && tg.capability === 'AVAILABLE' ? tg.cycles.find((c) => c.ordinal === ordinal) ?? null : null;
    if (activeCycle && tgCycle) {
      activeDaewoon = {
        ordinal: activeCycle.ordinal,
        startAgeInclusive: activeCycle.startAgeInclusive,
        endAgeInclusive: activeCycle.endAgeInclusive,
        tenGods: tgCycle.tenGods,
        relationsToNatal: buildRelationsToNatal(activeCycle.pillar, natal),
      };
    } else {
      warnings.push('ACTIVE_DAEWOON_UNRESOLVED');
    }
  }

  return { elementCounts, activeDaewoon, sewoon, warnings };
}
