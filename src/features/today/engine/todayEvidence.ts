// TODAY FORTUNE EVIDENCE — the deterministic, COMPACT daily fact set (§8/§9). It reuses the EXACT frozen
// birth→chart path the consultation grounding uses (executeSajuFromBirthInput → natalContextFromFourPillars),
// then composes today's 일운 (calculateDayLuck) + the current 세운/월운 for context. It sends nothing to any
// LLM and computes far less than a deep consultation (day-relevant facts only). Fail-closed: an unsupported/
// invalid chart yields `available:false` — never a fabricated pillar.
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
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { calculateDayLuck, type DayLuck } from '@/features/today/engine/dayLuck';
import { epochToKstCivilDate, FORTUNE_TIMEZONE, fortuneDateStringFromEpoch } from '@/features/today/engine/fortuneDate';

export const TODAY_EVIDENCE_VERSION = 'today-evidence@1.1.0';

// The five user-facing daily domains (§10). Codes are internal; labels live in presentation.
export type TodayDomain = 'overall' | 'work' | 'wealth' | 'relationship' | 'action';

export type TodayFortuneEvidence =
  | { available: false; fortuneDate: string; timezone: string; reason: string; evidenceVersion: string }
  | {
      available: true;
      fortuneDate: string;
      timezone: string;
      /** Today's 일진 pillar + its 십신/관계 to the natal chart. */
      dayLuck: Extract<DayLuck, { available: true }>;
      /** The day's stem 십신 relative to the natal 일간 — the "energy" of the day. */
      dayStemTenGod: TenGod;
      /** The day branch's main 십신 — used for the caution domain. */
      dayBranchTenGod: TenGod;
      /** Context availability (the current year/month flow), not the day itself. */
      sewoonAvailable: boolean;
      wolwoonAvailable: boolean;
      /** Shared myungri temporal facts (오행 구성 + active 대운 + current 세운) — the SAME core 상담 uses.
       *  Deterministic context/evidence only; it does NOT drive the day's tier (§8/§11). Always set by the
       *  builder; optional so lightweight test fixtures may omit it. */
      temporal?: MyungriTemporalContext;
      supportedDomains: TodayDomain[];
      evidenceVersion: string;
    };

export type TodayEvidenceDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
};

const ALL_DOMAINS: TodayDomain[] = ['overall', 'work', 'wealth', 'relationship', 'action'];

export async function buildTodayFortuneEvidence(
  input: { birthInfo: BirthInfoDraft; nowEpochSeconds: number },
  deps: TodayEvidenceDeps,
): Promise<TodayFortuneEvidence> {
  const fortuneDate = fortuneDateStringFromEpoch(input.nowEpochSeconds);
  const unavailable = (reason: string): TodayFortuneEvidence => ({
    available: false,
    fortuneDate,
    timezone: FORTUNE_TIMEZONE,
    reason,
    evidenceVersion: TODAY_EVIDENCE_VERSION,
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
  const dayLuck = calculateDayLuck({ natal, civilDate: epochToKstCivilDate(input.nowEpochSeconds) });
  if (!dayLuck.available) return unavailable(`DAY_LUCK_${dayLuck.reason}`);

  // Shared myungri temporal context (the SAME core 상담 uses): 오행 구성 + active 대운 + current 세운.
  // Facts only — background context for the prose, NOT a driver of the day's tier (§8/§11). 세운 is computed
  // once here (§31 no duplicate calc). Active 대운 is selected by the canonical SYMBOLIC-boundary resolver
  // (minute-precise symbolic start + 10-year cycles via the historical Asia/Seoul resolver). 월운 availability
  // is still read separately (today's own context).
  const temporal = await buildMyungriTemporalContext({
    engineResult,
    natal,
    normalizedBirth: execution.normalizedBirth,
    instantEpochSeconds: input.nowEpochSeconds,
    timezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });
  const wolwoon = calculateWolwoonForInstant({ natal, instantEpochSeconds: input.nowEpochSeconds });

  return {
    available: true,
    fortuneDate,
    timezone: FORTUNE_TIMEZONE,
    dayLuck,
    dayStemTenGod: dayLuck.tenGods.stemTenGod,
    dayBranchTenGod: dayLuck.tenGods.branchMainTenGod,
    sewoonAvailable: temporal.sewoon !== null,
    wolwoonAvailable: wolwoon.capability === 'AVAILABLE',
    temporal,
    supportedDomains: ALL_DOMAINS,
    evidenceVersion: TODAY_EVIDENCE_VERSION,
  };
}
