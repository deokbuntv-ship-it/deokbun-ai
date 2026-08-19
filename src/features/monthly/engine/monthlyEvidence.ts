// MONTHLY FORTUNE EVIDENCE — the deterministic, COMPACT month fact set (§8/§9). It reuses the EXACT frozen
// birth→chart path the consultation grounding uses (executeSajuFromBirthInput → natalContextFromFourPillars),
// then attributes the target month's 월운 (and the containing 세운) via the FROZEN 節-based resolver
// (calculateWolwoonForInstant at the civil month's midpoint). It sends nothing to any LLM and computes far
// less than a deep consultation (month-relevant facts only). Fail-closed: an unsupported/invalid chart or an
// unavailable month pillar yields `available:false` — never a fabricated pillar. Daewoon (10-year 대운) is
// intentionally DEFERRED to V1.1 (would need the ENGINE-12 cycle sequence + age attribution); the month↔natal
// relations + 월운 십신 are a complete, grounded month signal on their own.
import type { BirthInfoDraft } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  executeSajuFromBirthInput,
  type DigestProvider,
  type HistoricalTimezoneResolver,
} from '@/features/interpretation';
import {
  calculateSewoonForInstant,
  calculateWolwoonForInstant,
  natalContextFromFourPillars,
} from '@/features/myungri';
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { currentTargetMonth, FORTUNE_TIMEZONE, monthMidpointEpochSeconds, type TargetMonth } from '@/features/monthly/engine/monthDate';

export const MONTHLY_EVIDENCE_VERSION = 'monthly-evidence@1.0.0';

// The consumer-facing month domains (§10). Only the domains the 십신 mapping can robustly support are
// exposed — no fabricated 학업/준비 axis. Codes are internal; labels live in presentation.
export type MonthlyDomain = 'overall' | 'work' | 'wealth' | 'relationship' | 'action';

export type MonthlyFortuneEvidence =
  | { available: false; year: number; month: number; timezone: string; reason: string; evidenceVersion: string }
  | {
      available: true;
      year: number;
      month: number;
      timezone: string;
      /** 월운 stem 십신 relative to the natal 일간 — the "energy" of the month. */
      monthStemTenGod: TenGod;
      /** 월운 branch main 십신 — used for the caution domain. */
      monthBranchTenGod: TenGod;
      /** 월운 pillar's 합/충/형/파/해 against the natal chart — the tier tally source. */
      monthRelationsToNatal: RelationsToNatal;
      /** The containing 세운 (year flow) availability — lets the prose mention the broader year, not the tier. */
      sewoonAvailable: boolean;
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
  const instant = monthMidpointEpochSeconds(target);
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
  const wolwoon = calculateWolwoonForInstant({ natal, instantEpochSeconds: instant });
  if (wolwoon.capability !== 'AVAILABLE') return unavailable(`WOLWOON_${wolwoon.reason}`);

  const sewoon = calculateSewoonForInstant({ natal, instantEpochSeconds: instant });

  return {
    available: true,
    year: target.year,
    month: target.month,
    timezone: FORTUNE_TIMEZONE,
    monthStemTenGod: wolwoon.tenGods.stemTenGod,
    monthBranchTenGod: wolwoon.tenGods.branchMainTenGod,
    monthRelationsToNatal: wolwoon.relationsToNatal,
    sewoonAvailable: sewoon.capability === 'AVAILABLE',
    supportedDomains: ALL_DOMAINS,
    evidenceVersion: MONTHLY_EVIDENCE_VERSION,
  };
}
