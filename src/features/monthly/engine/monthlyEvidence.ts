// MONTHLY FORTUNE EVIDENCE (§3/§11, v1.1) — the deterministic, COMPACT month fact set. It reuses the EXACT
// frozen birth→chart path the consultation grounding uses (executeSajuFromBirthInput →
// natalContextFromFourPillars), then covers the FULL Korea civil month across the 節 boundary: it splits the
// civil month into its 節-based 월운 segments (resolveCivilMonthSajuSegments) and attributes each segment's
// 월운 via the FROZEN calculateWolwoonForInstant at a point inside that segment. Each segment carries its
// duration weight, so the plan reflects the whole month — not only the midpoint regime (the V1 approximation
// this replaces). Fail-closed: an unsupported/invalid chart or an out-of-range month yields `available:false`.
// Daewoon (10-year 대운) remains DEFERRED to a later version.
import type { BirthInfoDraft } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  executeSajuFromBirthInput,
  type DigestProvider,
  type HistoricalTimezoneResolver,
} from '@/features/interpretation';
import {
  buildMyungriTemporalContext,
  calculateWolwoonForInstant,
  natalContextFromFourPillars,
  type MyungriTemporalContext,
} from '@/features/myungri';
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { resolveCivilMonthSajuSegments } from '@/features/monthly/engine/civilMonthSegments';
import { currentTargetMonth, FORTUNE_TIMEZONE, monthMidpointEpochSeconds, type TargetMonth } from '@/features/monthly/engine/monthDate';

export const MONTHLY_EVIDENCE_VERSION = 'monthly-evidence@1.2.0';

// The consumer-facing month domains (§10). Only the domains the 십신 mapping can robustly support are exposed.
export type MonthlyDomain = 'overall' | 'work' | 'wealth' | 'relationship' | 'action';

// One 節-based 월운 regime overlapping the civil month, with its share of the month (weight).
export type MonthlySegmentEvidence = {
  /** 節-based saju month ordinal (寅월=1 … 丑월=12). */
  sajuMonthOrdinal: number;
  durationSeconds: number;
  /** Share of the civil month, [0,1]; the segments' weights sum to 1. */
  weight: number;
  /** Korea civil date (YYYY-MM-DD) the segment starts (the later segment's = the 節 transition date). */
  startCivilDate: string;
  /** 월운 stem 십신 relative to the natal 일간 — the "energy" of the segment. */
  stemTenGod: TenGod;
  /** 월운 branch main 십신 — used for the caution domain. */
  branchTenGod: TenGod;
  /** 월운 pillar's 합/충/형/파/해 against the natal chart — the tier-tally source. */
  relationsToNatal: RelationsToNatal;
};

export type MonthlyFortuneEvidence =
  | { available: false; year: number; month: number; timezone: string; reason: string; evidenceVersion: string }
  | {
      available: true;
      year: number;
      month: number;
      timezone: string;
      /** The 1 or 2 節-based 월운 segments covering the civil month, in chronological order. */
      segments: MonthlySegmentEvidence[];
      /** The 節 transition civil date (YYYY-MM-DD) when the month has two segments; null otherwise. */
      transitionCivilDate: string | null;
      /** The containing 세운 (year flow) availability — lets the prose mention the broader year, not the tier. */
      sewoonAvailable: boolean;
      /** Shared myungri temporal facts (오행 구성 + active 대운 + current 세운) — the SAME core 상담/오늘 use.
       *  Context/evidence only; it does NOT drive the month tier (§8/§12). Always set by the builder; optional
       *  so lightweight test fixtures may omit it. */
      temporal?: MyungriTemporalContext;
      supportedDomains: MonthlyDomain[];
      evidenceVersion: string;
    };

export type MonthlyEvidenceDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  /** SERVER receipt epoch (seconds) — the authority for the current target month. */
  nowEpochSeconds: number;
  /** Optional explicit target (read-only history); defaults to the server's current civil month. */
  target?: TargetMonth;
};

const ALL_DOMAINS: MonthlyDomain[] = ['overall', 'work', 'wealth', 'relationship', 'action'];

export async function buildMonthlyFortuneEvidence(
  input: { birthInfo: BirthInfoDraft },
  deps: MonthlyEvidenceDeps,
): Promise<MonthlyFortuneEvidence> {
  const target = deps.target ?? currentTargetMonth(deps.nowEpochSeconds);
  const unavailable = (reason: string): MonthlyFortuneEvidence => ({
    available: false,
    year: target.year,
    month: target.month,
    timezone: FORTUNE_TIMEZONE,
    reason,
    evidenceVersion: MONTHLY_EVIDENCE_VERSION,
  });

  let execution;
  try {
    execution = await executeSajuFromBirthInput(toSajuEngineInput(input.birthInfo), {
      digestProvider: deps.digestProvider,
      historicalTimezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
    });
  } catch {
    return unavailable('CHART_EXECUTION_THREW');
  }
  if (!execution.success) return unavailable('CHART_INPUT_INVALID');
  const engineResult = execution.engineResult;
  if (engineResult.status === 'UNAVAILABLE') return unavailable('CHART_UNAVAILABLE');

  const natal = natalContextFromFourPillars(engineResult.output.fourPillars);

  const rawSegments = resolveCivilMonthSajuSegments(target);
  if (!rawSegments || rawSegments.length === 0) return unavailable('CIVIL_MONTH_SEGMENTS_UNAVAILABLE');
  const totalSeconds = rawSegments.reduce((sum, s) => sum + s.durationSeconds, 0);

  const segments: MonthlySegmentEvidence[] = [];
  for (const s of rawSegments) {
    // A point strictly inside the segment → the frozen resolver attributes THIS segment's 월운 pillar.
    const midEpoch = s.startEpoch + Math.floor(s.durationSeconds / 2);
    const w = calculateWolwoonForInstant({ natal, instantEpochSeconds: midEpoch });
    if (w.capability !== 'AVAILABLE') return unavailable(`WOLWOON_${w.reason}`);
    segments.push({
      sajuMonthOrdinal: s.sajuMonthOrdinal,
      durationSeconds: s.durationSeconds,
      weight: totalSeconds > 0 ? s.durationSeconds / totalSeconds : 1,
      startCivilDate: s.startCivilDate,
      stemTenGod: w.tenGods.stemTenGod,
      branchTenGod: w.tenGods.branchMainTenGod,
      relationsToNatal: w.relationsToNatal,
    });
  }

  // Shared myungri temporal context (the SAME core 상담/오늘 use): 오행 구성 + active 대운 + current 세운, read
  // at the civil-month midpoint. Facts only — background context, NOT a driver of the month tier (§8/§12). 세운
  // is computed once here (§31); active 대운 via the canonical date-based resolver (engine's own birth date).
  const temporal = buildMyungriTemporalContext({
    engineResult,
    natal,
    normalizedBirth: execution.normalizedBirth,
    instantEpochSeconds: monthMidpointEpochSeconds(target),
  });

  return {
    available: true,
    year: target.year,
    month: target.month,
    timezone: FORTUNE_TIMEZONE,
    segments,
    transitionCivilDate: segments.length > 1 ? segments[1].startCivilDate : null,
    sewoonAvailable: temporal.sewoon !== null,
    temporal,
    supportedDomains: ALL_DOMAINS,
    evidenceVersion: MONTHLY_EVIDENCE_VERSION,
  };
}
