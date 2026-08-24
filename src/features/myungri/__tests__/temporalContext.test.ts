// Shared temporal context — the single source 오늘·월별·상담 consume for natal composition + active 대운 +
// current 세운. Runs the REAL frozen engine (node digest); asserts facts present + deterministic. Orchestrator
// only: no strength verdict, no new calc.
import { createHash } from 'crypto';

import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  executeSajuFromBirthInput,
  type DigestProvider,
} from '@/features/interpretation';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { toZiweiBirthInput } from '@/features/ziwei';
import {
  buildMyungriTemporalContext,
  currentSajuAge,
  natalContextFromFourPillars,
  selectActiveDaewoonCycleOrdinal,
} from '@/features/myungri';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);
const birthInfo = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '5', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as Parameters<typeof toSajuEngineInput>[0];

async function ctx(now = NOW) {
  const execution = await executeSajuFromBirthInput(toSajuEngineInput(birthInfo), {
    digestProvider,
    historicalTimezoneResolver: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });
  if (!execution.success || execution.engineResult.status === 'UNAVAILABLE') throw new Error('engine unavailable');
  const natal = natalContextFromFourPillars(execution.engineResult.output.fourPillars);
  const solarBirthYear = Number(toZiweiBirthInput(birthInfo).birthYear);
  return buildMyungriTemporalContext({
    engineResult: execution.engineResult, natal,
    normalizedBirth: execution.normalizedBirth, instantEpochSeconds: now, solarBirthYear,
  });
}

describe('shared temporal context (real engine)', () => {
  it('surfaces raw 오행 composition (counts sum to the 8 chart slots)', async () => {
    const c = await ctx();
    expect(c.elementCounts).toBeTruthy();
    const total = (['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'] as const).reduce((s, e) => s + (c.elementCounts![e] ?? 0), 0);
    expect(total).toBe(8); // 4 stems + 4 branches, RAW counts (not 세력/percent)
  });

  it('resolves the active 대운 with ten-gods + natal relations (facts, no verdict)', async () => {
    const c = await ctx();
    expect(c.activeDaewoon).toBeTruthy();
    expect(c.activeDaewoon!.tenGods.stemTenGod).toBeTruthy();
    expect(c.activeDaewoon!.relationsToNatal).toBeTruthy();
    expect(c.activeDaewoon!.startAgeInclusive).toBeLessThanOrEqual(c.activeDaewoon!.endAgeInclusive);
    // no strength/verdict field leaks
    expect(JSON.stringify(c)).not.toMatch(/신강|신약|strengthVerdict|"score"/);
  });

  it('surfaces the current 세운 with 원국 relations', async () => {
    const c = await ctx();
    expect(c.sewoon?.capability).toBe('AVAILABLE');
    if (c.sewoon?.capability === 'AVAILABLE') expect(c.sewoon.relationsToNatal).toBeTruthy();
  });

  it('is deterministic for the same (natal, instant)', async () => {
    expect(await ctx()).toEqual(await ctx());
  });
});

describe('pure selectors', () => {
  const cycles = [
    { ordinal: 1, startAgeInclusive: 3, endAgeInclusive: 12 },
    { ordinal: 2, startAgeInclusive: 13, endAgeInclusive: 22 },
    { ordinal: 3, startAgeInclusive: 23, endAgeInclusive: 32 },
  ];
  it('selectActiveDaewoonCycleOrdinal finds the containing cycle, else null', () => {
    expect(selectActiveDaewoonCycleOrdinal(cycles, 25)).toBe(3);
    expect(selectActiveDaewoonCycleOrdinal(cycles, 12)).toBe(1);
    expect(selectActiveDaewoonCycleOrdinal(cycles, 2)).toBeNull(); // before first cycle
    expect(selectActiveDaewoonCycleOrdinal(cycles, null)).toBeNull();
  });
  it('currentSajuAge = sewoon year − solar birth year (null if either missing)', () => {
    expect(currentSajuAge(2026, 1990)).toBe(36);
    expect(currentSajuAge(null, 1990)).toBeNull();
    expect(currentSajuAge(2026, null)).toBeNull();
  });
});
