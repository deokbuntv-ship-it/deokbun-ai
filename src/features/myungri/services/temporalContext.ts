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
  type HistoricalTimezoneResolver,
  type SajuEngineResult,
} from '../../interpretation';
import { calculateDaewoonTenGods, type DaewoonCycleTenGods } from './daewoonTenGods';
import { calculateSewoonForInstant } from './luckForInstant';
import { buildRelationsToNatal } from './pillarFacts';
import type { NatalPillarContext, RelationsToNatal, SewoonResult } from '../domain/contracts';

type LocalDateTime = { date: { year: number; month: number; day: number }; time: { hour: number; minute: number; second?: number } };

/** Days in a Gregorian month (for clamping the 10-year civil-year add, e.g. Feb 29 → Feb 28). */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Add whole civil years to an Asia/Seoul local datetime (same month/day/time; clamps to month length). */
function addCivilYears(local: LocalDateTime, years: number): LocalDateTime {
  const year = local.date.year + years;
  const day = Math.min(local.date.day, daysInMonth(year, local.date.month));
  return { date: { year, month: local.date.month, day }, time: local.time };
}

/**
 * Asia/Seoul civil datetime → UTC epoch seconds via the ENGINE-12 HISTORICAL timezone resolver (NOT a fixed
 * UTC+9 — preserves 1987/88 DST + historical offsets). Matches the engine's own instant convention
 * (fourPillars): epoch = (UTC-as-if-local) − resolvedOffsetSeconds. Fail-closed → null on ambiguous /
 * nonexistent / unresolved local time.
 */
async function asiaSeoulLocalToEpoch(
  local: LocalDateTime,
  resolver: HistoricalTimezoneResolver,
): Promise<number | null> {
  const second = local.time.second ?? 0;
  const res = await resolver.resolve({
    ianaZone: 'Asia/Seoul',
    civilLocal: { accuracy: 'EXACT', date: local.date, time: { hour: local.time.hour, minute: local.time.minute, second } },
  });
  if (res.status !== 'RESOLVED' || !('resolvedOffsetSeconds' in res)) return null;
  const utcAsIfLocal = Math.floor(
    Date.UTC(local.date.year, local.date.month - 1, local.date.day, local.time.hour, local.time.minute, second) / 1000,
  );
  return utcAsIfLocal - res.resolvedOffsetSeconds;
}

export type ActiveDaewoon = {
  ordinal: number;
  startBoundaryEpochSeconds: number;
  endBoundaryEpochSeconds: number;
};

/**
 * CANONICAL active-대운 resolver — SYMBOLIC-boundary, MINUTE precision (Codex ENGINE-12 rule). The boundary is
 * the minute-derived `start.timing.symbolicLocalDateTime`, NOT the rounded start age (which is DISPLAY-only):
 *   cycleStart(0) = symbolicLocalDateTime (Asia/Seoul); cycleStart(i) = +10 civil years × i;
 *   active cycle i  = eval ∈ [cycleStart(i), cycleStart(i+1)).
 * Instants are compared via the historical Asia/Seoul resolver (not fixed UTC+9). Fail-closed → null when 대운
 * is unavailable (e.g. 시주 미상), a boundary's local time is unresolvable, or eval is before the first start /
 * after the last generated cycle (no fabricated 11th). Consultation/Today/Monthly all call THIS one resolver.
 */
export async function resolveActiveDaewoonAtInstant(
  daewoon: ReturnType<typeof calculateSajuDaewoon>,
  instantEpochSeconds: number,
  resolver: HistoricalTimezoneResolver,
): Promise<ActiveDaewoon | null> {
  if (daewoon.capability !== 'AVAILABLE') return null;
  const symbolic = daewoon.start.timing.symbolicLocalDateTime;
  for (let i = 0; i < daewoon.cycles.length; i += 1) {
    const startEpoch = await asiaSeoulLocalToEpoch(addCivilYears(symbolic, 10 * i), resolver);
    const endEpoch = await asiaSeoulLocalToEpoch(addCivilYears(symbolic, 10 * (i + 1)), resolver);
    if (startEpoch === null || endEpoch === null) return null; // unresolvable boundary → fail-closed
    if (instantEpochSeconds >= startEpoch && instantEpochSeconds < endEpoch) {
      return {
        ordinal: daewoon.cycles[i].ordinal,
        startBoundaryEpochSeconds: startEpoch,
        endBoundaryEpochSeconds: endEpoch,
      };
    }
  }
  return null; // before the first symbolic start OR after the last generated cycle
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
 * the chart is available. Deterministic; no LLM. Async because the active-대운 is selected by the canonical
 * SYMBOLIC-boundary resolver (`resolveActiveDaewoonAtInstant`), which resolves each cycle boundary through the
 * historical Asia/Seoul timezone resolver — identical across 상담/오늘/월별. `startAgeInclusive`/`endAgeInclusive`
 * on the returned context are DISPLAY labels (rounded 대운수) and never control which cycle is active.
 */
export async function buildMyungriTemporalContext(input: {
  engineResult: SajuEngineResult;
  natal: NatalPillarContext;
  normalizedBirth: Parameters<typeof calculateSajuDaewoon>[0]['normalizedBirth'];
  instantEpochSeconds: number;
  timezoneResolver: HistoricalTimezoneResolver;
}): Promise<MyungriTemporalContext> {
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
    const active = await resolveActiveDaewoonAtInstant(daewoon, input.instantEpochSeconds, input.timezoneResolver);
    const activeCycle = active ? daewoon.cycles.find((c) => c.ordinal === active.ordinal) ?? null : null;
    const tg = calculateDaewoonTenGods({ dayMaster: natal.dayMaster, cycles: daewoon.cycles });
    const tgCycle =
      active && tg.capability === 'AVAILABLE' ? tg.cycles.find((c) => c.ordinal === active.ordinal) ?? null : null;
    if (activeCycle && tgCycle) {
      activeDaewoon = {
        ordinal: activeCycle.ordinal,
        startAgeInclusive: activeCycle.startAgeInclusive, // DISPLAY label (rounded 대운수) — not the active boundary
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
