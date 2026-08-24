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

/** Which 대운 cycle contains `currentAge` (deterministic; year-granularity — see DAEWOON_PRECISION followup). */
export function selectActiveDaewoonCycleOrdinal(
  cycles: readonly { ordinal: number; startAgeInclusive: number; endAgeInclusive: number }[],
  currentAge: number | null,
): number | null {
  if (currentAge === null) return null;
  const active = cycles.find((c) => currentAge >= c.startAgeInclusive && currentAge <= c.endAgeInclusive);
  return active ? active.ordinal : null;
}

/** Current 사주 age = current 세운 year − solar birth year (the SAME basis 상담 uses, for cross-feature parity). */
export function currentSajuAge(sewoonTargetYear: number | null, solarBirthYear: number | null): number | null {
  return sewoonTargetYear !== null && solarBirthYear !== null && Number.isFinite(solarBirthYear)
    ? sewoonTargetYear - solarBirthYear
    : null;
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
 * the chart is available. Deterministic; no LLM. `solarBirthYear` must be the SAME basis across features (the
 * lunar→solar-converted birth year) so the active-대운 selection is identical everywhere.
 */
export function buildMyungriTemporalContext(input: {
  engineResult: SajuEngineResult;
  natal: NatalPillarContext;
  normalizedBirth: Parameters<typeof calculateSajuDaewoon>[0]['normalizedBirth'];
  instantEpochSeconds: number;
  solarBirthYear: number | null;
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
    const age = currentSajuAge(sewoon ? sewoon.targetYear : null, input.solarBirthYear);
    const ordinal = selectActiveDaewoonCycleOrdinal(daewoon.cycles, age);
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
