// Shared temporal context — the single source 오늘·월별·상담 consume for natal composition + active 대운 +
// current 세운. Runs the REAL frozen engine (node digest); asserts facts present + deterministic, and that the
// active 대운 is selected by the SYMBOLIC minute boundary (not the display age). Orchestrator only: no strength
// verdict, no new calc.
import { createHash } from 'crypto';

import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  executeSajuFromBirthInput,
  type DigestProvider,
} from '@/features/interpretation';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { buildMyungriTemporalContext, natalContextFromFourPillars } from '@/features/myungri';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);
type BirthInput = Parameters<typeof toSajuEngineInput>[0];
const birthInfo = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '5', birthDay: '15',
  birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInput;

// KST civil datetime → UTC epoch seconds (post-1988 KST = UTC+9). Independent of the resolver under test.
const kst = (y: number, mo: number, d: number, h: number, mi: number) =>
  Math.floor(Date.UTC(y, mo - 1, d, h - 9, mi, 0) / 1000);

async function ctx(bi: BirthInput = birthInfo, now = NOW) {
  const execution = await executeSajuFromBirthInput(toSajuEngineInput(bi), {
    digestProvider,
    historicalTimezoneResolver: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });
  if (!execution.success || execution.engineResult.status === 'UNAVAILABLE') throw new Error('engine unavailable');
  const natal = natalContextFromFourPillars(execution.engineResult.output.fourPillars);
  return buildMyungriTemporalContext({
    engineResult: execution.engineResult, natal,
    normalizedBirth: execution.normalizedBirth, instantEpochSeconds: now,
    timezoneResolver: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
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

describe('active 대운 uses the SYMBOLIC minute boundary (real engine, golden fixture 1)', () => {
  // Golden fixture 1 (daewoonGoldenFixtures): birth 2024-04-15 09:44 (KST), MALE → the frozen engine's first
  // 대운 symbolic start = 2030-12-12 13:44 (KST). At that instant the subject is only ~6 (< the display start
  // age), so a correct result here proves selection is by the symbolic boundary, not the age label.
  const fixtureBirth = {
    displayName: '표준', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '2024', birthMonth: '4', birthDay: '15',
    birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '44',
    approximateTimePeriod: null, birthPlace: '서울',
  } as unknown as BirthInput;

  it('one minute BEFORE the symbolic start → no active 대운', async () => {
    const c = await ctx(fixtureBirth, kst(2030, 12, 12, 13, 43));
    expect(c.activeDaewoon).toBeNull();
    expect(c.warnings).toContain('ACTIVE_DAEWOON_UNRESOLVED');
  });

  it('EXACTLY at the symbolic start → first 대운 cycle (ordinal 1) active', async () => {
    const c = await ctx(fixtureBirth, kst(2030, 12, 12, 13, 44));
    expect(c.activeDaewoon?.ordinal).toBe(1);
  });
});
