// TARGETED REGRESSION for the Saju YEAR(立春)/MONTH(12 Jie) boundary fix.
// The natal engine previously attributed year/month from the LUNAR calendar year/month; it now
// attributes them from the Sun (立春 for the year, the twelve 節 for the month), reusing the
// ENGINE-12 solar-term runtime. Golden anchor (owner-locked):
//   solar 2024-01-03  ==  lunar 2023-11-22  →  癸卯年 甲子月 丙寅日
import { Solar } from 'lunar-javascript';

import {
  DEOKBUNAI_SAJU_V1_RULE_PROFILE,
  EARTHLY_BRANCH_LABELS,
  HEAVENLY_STEM_LABELS,
  JIE_TERM_TO_SAJU_MONTH_ORDINAL,
  LUNAR_JS_SOLAR_TERM_ADAPTER,
  calculateFourPillars,
  calculateSajuDaewoon,
  gregorianToCivilDayOrdinal,
  resolveSajuYearAndMonth,
  resolveWithKasiCalendar,
} from '../../index';
import type {
  CivilLocalBirthTime,
  NormalizedBirthInput,
  SajuFourPillarsCalculationInput,
  SajuFourPillarsResult,
  SexagenaryPillar,
  TimezoneResolution,
} from '../../index';

const UNIX0 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });
const KST_OFFSET = 32_400;
// UTC epoch for an Asia/Seoul civil wall-clock (matches fourPillars' reference-instant derivation).
const kst = (y: number, mo: number, d: number, h = 12, mi = 0, s = 0): number =>
  (gregorianToCivilDayOrdinal({ year: y, month: mo, day: d }) - UNIX0) * 86_400 +
  h * 3_600 + mi * 60 + s - KST_OFFSET;

const gz = (p: SexagenaryPillar): string =>
  HEAVENLY_STEM_LABELS[p.stem].hanja + EARTHLY_BRANCH_LABELS[p.branch].hanja;

function uniqueTz(): TimezoneResolution {
  return {
    status: 'RESOLVED',
    ianaZone: 'Asia/Seoul',
    resolvedOffsetSeconds: KST_OFFSET,
    resolvedOffsetMinutes: 540,
    timezoneDataVersion: 'boundary-fix-test',
    resolutionSource: 'EXTERNAL_LOOKUP',
    dst: { status: 'NOT_OBSERVED', dstOffsetSeconds: 0, provenance: { resolverId: 'T', resolverVersion: '1', source: 'ENGINE' } },
    localTimeResolution: {
      kind: 'UNIQUE',
      candidate: { utcEpochSeconds: 0, totalOffsetSeconds: KST_OFFSET, dstOffsetSeconds: 0, isDst: false },
    },
    historicalProvenance: {
      authorityStatus: 'OFFICIAL_SOURCE_VERIFIED',
      officialSources: [],
      ruleSetVersion: 'boundary-fix-test',
      comparison: 'MATCH',
      jurisdiction: 'KR',
      applicableRegion: 'KR',
    },
    provenance: { resolverId: 'T', resolverVersion: '1', source: 'ENGINE' },
  };
}

function buildInput(
  gregorian: { year: number; month: number; day: number },
  time: CivilLocalBirthTime,
): SajuFourPillarsCalculationInput {
  const calendar = resolveWithKasiCalendar({ ...gregorian, calendar: 'GREGORIAN' });
  if (calendar.status !== 'RESOLVED') throw new Error('calendar did not resolve');
  return {
    normalizedBirthFingerprint: `bfix.${gregorian.year}-${gregorian.month}-${gregorian.day}`,
    normalized: { calendar, civilLocal: time, timezone: uniqueTz(), trueSolarTime: { status: 'NOT_APPLIED' } },
    ruleProfile: DEOKBUNAI_SAJU_V1_RULE_PROFILE,
    engineRuleSetVersion: 'boundary-fix-test',
  };
}

const exact = (y: number, mo: number, d: number, h = 12, mi = 0): CivilLocalBirthTime => ({
  accuracy: 'EXACT',
  date: { year: y, month: mo, day: d },
  time: { hour: h, minute: mi, second: 0 },
});

const pillars = (r: SajuFourPillarsResult) => {
  if (r.status === 'UNAVAILABLE') throw new Error('four pillars UNAVAILABLE');
  return r.pillars;
};

describe('resolveSajuYearAndMonth — 立春 year / 12 Jie month attribution', () => {
  it('GOLDEN: 2024-01-03 → Saju year 2023 (癸卯), 子월 ordinal 11 (NOT lunar 2024/月11)', () => {
    const a = resolveSajuYearAndMonth(kst(2024, 1, 3), LUNAR_JS_SOLAR_TERM_ADAPTER);
    if (!a.ok) throw new Error(a.error.code);
    expect(a.value.sajuYear).toBe(2023);
    expect(a.value.jieMonthOrdinal).toBe(11); // 子월 (大雪 2023 → next 小寒)
  });

  it('before 立春 (2024-02-03, after 小寒) → 2023 / 丑월(12); after 立春 (2024-02-10) → 2024 / 寅월(1)', () => {
    const before = resolveSajuYearAndMonth(kst(2024, 2, 3), LUNAR_JS_SOLAR_TERM_ADAPTER);
    const after = resolveSajuYearAndMonth(kst(2024, 2, 10), LUNAR_JS_SOLAR_TERM_ADAPTER);
    if (!before.ok || !after.ok) throw new Error('unavailable');
    expect(before.value).toMatchObject({ sajuYear: 2023, jieMonthOrdinal: 12 });
    expect(after.value).toMatchObject({ sajuYear: 2024, jieMonthOrdinal: 1 });
  });

  it('立春-day boundary (2024 立春 ≈ Feb 4 16:27 KST): forenoon=2023/丑, evening=2024/寅', () => {
    const morning = resolveSajuYearAndMonth(kst(2024, 2, 4, 6), LUNAR_JS_SOLAR_TERM_ADAPTER);
    const evening = resolveSajuYearAndMonth(kst(2024, 2, 4, 22), LUNAR_JS_SOLAR_TERM_ADAPTER);
    if (!morning.ok || !evening.ok) throw new Error('unavailable');
    expect(morning.value).toMatchObject({ sajuYear: 2023, jieMonthOrdinal: 12 });
    expect(evening.value).toMatchObject({ sajuYear: 2024, jieMonthOrdinal: 1 });
  });

  it('monthly Jie boundary (驚蟄 2024 ≈ Mar 5): before=寅월(1), after=卯월(2)', () => {
    const before = resolveSajuYearAndMonth(kst(2024, 3, 4), LUNAR_JS_SOLAR_TERM_ADAPTER);
    const after = resolveSajuYearAndMonth(kst(2024, 3, 6), LUNAR_JS_SOLAR_TERM_ADAPTER);
    if (!before.ok || !after.ok) throw new Error('unavailable');
    expect(before.value.jieMonthOrdinal).toBe(1);
    expect(after.value.jieMonthOrdinal).toBe(2);
  });

  it('all 12 Jie → month ordinal (mid-interval dates, 寅월=1 … 丑월=12)', () => {
    const mid: [number, number, number, number][] = [
      [2024, 2, 20, 1], [2024, 3, 20, 2], [2024, 4, 20, 3], [2024, 5, 20, 4],
      [2024, 6, 20, 5], [2024, 7, 20, 6], [2024, 8, 20, 7], [2024, 9, 20, 8],
      [2024, 10, 20, 9], [2024, 11, 20, 10], [2024, 12, 20, 11], [2025, 1, 20, 12],
    ];
    for (const [y, mo, d, ord] of mid) {
      const a = resolveSajuYearAndMonth(kst(y, mo, d), LUNAR_JS_SOLAR_TERM_ADAPTER);
      if (!a.ok) throw new Error(`${y}-${mo}-${d} unavailable`);
      expect(a.value.jieMonthOrdinal).toBe(ord);
    }
    // sanity: the 12-Jie map has exactly 12 entries covering ordinals 1..12
    expect(new Set(Object.values(JIE_TERM_TO_SAJU_MONTH_ORDINAL)).size).toBe(12);
  });
});

describe('calculateFourPillars — end-to-end boundary correctness', () => {
  it('GOLDEN §4: 2024-01-03 → 癸卯 / 甲子 / 丙寅', () => {
    const p = pillars(calculateFourPillars(buildInput({ year: 2024, month: 1, day: 3 }, exact(2024, 1, 3))));
    expect(gz(p.year)).toBe('癸卯');
    expect(gz(p.month)).toBe('甲子');
    expect(gz(p.day)).toBe('丙寅');
  });

  it('solar-input vs lunar-input equivalence: same real instant → identical pillars', () => {
    // lunar 2023-11-22 resolves to the SAME gregorian instant as solar 2024-01-03.
    const lunarSolar = Solar.fromYmd(2024, 1, 3).getLunar();
    expect(lunarSolar.getYear()).toBe(2023);
    expect(lunarSolar.getMonth()).toBe(11);
    expect(lunarSolar.getDay()).toBe(22); // confirms the golden solar/lunar pair
    // The engine attributes from gregorianDate, so a tampered lunarDate must NOT change the chart.
    const base = buildInput({ year: 2024, month: 1, day: 3 }, exact(2024, 1, 3));
    if (base.normalized.calendar.status !== 'RESOLVED') throw new Error('resolve');
    const tampered: SajuFourPillarsCalculationInput = {
      ...base,
      normalized: {
        ...base.normalized,
        calendar: {
          ...base.normalized.calendar,
          lunarDate: { ...base.normalized.calendar.lunarDate, year: 2099, month: 5 },
        },
      },
    };
    const a = pillars(calculateFourPillars(base));
    const b = pillars(calculateFourPillars(tampered));
    expect(gz(b.year)).toBe('癸卯'); // lunar year no longer drives the Saju year
    expect(gz(b.month)).toBe('甲子'); // lunar month no longer drives the Saju month
    expect([gz(a.year), gz(a.month), gz(a.day)]).toEqual([gz(b.year), gz(b.month), gz(b.day)]);
  });

  it('leap lunar month does NOT independently reset the Saju month pillar', () => {
    const base = buildInput({ year: 2024, month: 1, day: 3 }, exact(2024, 1, 3));
    if (base.normalized.calendar.status !== 'RESOLVED') throw new Error('resolve');
    const asLeap: SajuFourPillarsCalculationInput = {
      ...base,
      normalized: {
        ...base.normalized,
        calendar: {
          ...base.normalized.calendar,
          lunarDate: { ...base.normalized.calendar.lunarDate, lunarMonthKind: 'LEAP' },
        },
      },
    };
    expect(gz(pillars(calculateFourPillars(asLeap)).month)).toBe(
      gz(pillars(calculateFourPillars(base)).month),
    );
  });

  it('time-unknown birth still resolves year/month from the date (non-boundary date)', () => {
    const r = calculateFourPillars(
      buildInput({ year: 2024, month: 1, day: 3 }, { accuracy: 'UNKNOWN', date: { year: 2024, month: 1, day: 3 } }),
    );
    expect(r.status).toBe('PARTIAL');
    const p = pillars(r);
    expect(gz(p.year)).toBe('癸卯');
    expect(gz(p.month)).toBe('甲子');
  });

  it('provenance declares the 立春/12-Jie attribution rule (§14)', () => {
    const r = calculateFourPillars(buildInput({ year: 2024, month: 1, day: 3 }, exact(2024, 1, 3)));
    if (r.status === 'UNAVAILABLE') throw new Error('unavailable');
    expect(r.provenance.yearMonthAttributionRule.yearBoundary).toBe('START_OF_SPRING_IPCHUN');
    expect(r.provenance.yearMonthAttributionRule.monthBoundary).toBe('TWELVE_JIE_JIEQI');
    expect(r.provenance.yearMonthAttributionRule.ruleVersion).toBe('deokbunai.saju-year-month-attribution.v1');
  });
});

// Daewoon (ENGINE-12, frozen) consumes the natal year/month pillars as explicit inputs, so it
// inherits the correction from whoever feeds it. This proves the corrected pillars flow through.
function daewoonBirth(
  y: number, mo: number, d: number, h: number, mi: number,
  gender: 'MALE' | 'FEMALE',
): NormalizedBirthInput {
  const calendar = resolveWithKasiCalendar({ year: y, month: mo, day: d, calendar: 'GREGORIAN' });
  if (calendar.status !== 'RESOLVED') throw new Error('calendar');
  const tz = uniqueTz();
  const candidate =
    tz.status === 'RESOLVED' && tz.localTimeResolution.kind === 'UNIQUE'
      ? tz.localTimeResolution.candidate
      : { utcEpochSeconds: 0, totalOffsetSeconds: KST_OFFSET, dstOffsetSeconds: 0, isDst: false };
  const timezone: TimezoneResolution = {
    ...(tz as Extract<TimezoneResolution, { status: 'RESOLVED' }>),
    localTimeResolution: { kind: 'UNIQUE', candidate: { ...candidate, utcEpochSeconds: kst(y, mo, d, h, mi) } },
  };
  return {
    source: { gender } as NormalizedBirthInput['source'],
    calendar,
    civilLocal: { accuracy: 'EXACT', date: { year: y, month: mo, day: d }, time: { hour: h, minute: mi, second: 0 } },
    timezone,
    trueSolarTime: { status: 'NOT_APPLIED' },
    provenance: [],
    warnings: [],
  } as unknown as NormalizedBirthInput;
}

describe('§9 Daewoon consumes the CORRECTED natal year/month pillars', () => {
  it('golden natal 癸卯/甲子 → Daewoon direction REVERSE (癸 yin + MALE), cycles advance from 甲子', () => {
    const natal = pillars(calculateFourPillars(buildInput({ year: 2024, month: 1, day: 3 }, exact(2024, 1, 3))));
    expect(gz(natal.year)).toBe('癸卯');
    expect(gz(natal.month)).toBe('甲子');
    const dw = calculateSajuDaewoon(
      { normalizedBirth: daewoonBirth(2024, 1, 3, 12, 0, 'MALE'), yearPillar: natal.year, monthPillar: natal.month },
      LUNAR_JS_SOLAR_TERM_ADAPTER,
    );
    expect(dw.capability).toBe('AVAILABLE');
    if (dw.capability !== 'AVAILABLE') return;
    expect(dw.direction).toBe('REVERSE');
    // REVERSE first cycle = one step back from the corrected 甲子(index 0) month pillar → 癸亥.
    expect(gz(dw.cycles[0].pillar)).toBe('癸亥');
  });
});

// The first Jie strictly after `fromEpoch`, as a UTC instant — used to hit exact boundary minutes.
function nextTermEpoch(fromEpoch: number): number {
  const r = LUNAR_JS_SOLAR_TERM_ADAPTER.resolve({
    birthInstant: { kind: 'UTC_INSTANT', epochSeconds: fromEpoch },
    direction: 'FORWARD',
  });
  if (!r.ok) throw new Error('term resolve failed');
  return r.value.normalizedUtcInstant.epochSeconds;
}

describe('Codex FIX 1 — same-UTC-minute boundary tie → AMBIGUOUS', () => {
  it('reference exactly at 立春 (and +20s, same minute) → AMBIGUOUS_BOUNDARY_MINUTE', () => {
    const ipchun = nextTermEpoch(kst(2024, 1, 20)); // 立春 2024
    for (const epoch of [ipchun, ipchun + 20]) {
      const r = resolveSajuYearAndMonth(epoch, LUNAR_JS_SOLAR_TERM_ADAPTER);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe('AMBIGUOUS_BOUNDARY_MINUTE');
    }
  });
  it('representative monthly Jie (驚蟄) minute → AMBIGUOUS', () => {
    const jie = nextTermEpoch(kst(2024, 2, 20)); // 驚蟄 2024
    const r = resolveSajuYearAndMonth(jie, LUNAR_JS_SOLAR_TERM_ADAPTER);
    if (!r.ok) expect(r.error.code).toBe('AMBIGUOUS_BOUNDARY_MINUTE');
    else throw new Error('expected ambiguous');
  });
  it('a non-boundary minute resolves normally', () => {
    expect(resolveSajuYearAndMonth(kst(2024, 3, 20, 10, 0), LUNAR_JS_SOLAR_TERM_ADAPTER).ok).toBe(true);
  });
});

describe('Codex FIX 2 — unknown/approximate time on a boundary date → AMBIGUOUS (never noon-forced)', () => {
  it('resolver: unknown time on the 立春 date', () => {
    const r = resolveSajuYearAndMonth(kst(2024, 2, 4, 12), LUNAR_JS_SOLAR_TERM_ADAPTER, { timeIsKnown: false });
    if (!r.ok) expect(r.error.code).toBe('AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE');
    else throw new Error('expected ambiguous');
  });
  it('fourPillars: 2024-02-04 (立春 date) + UNKNOWN time → UNAVAILABLE (fail-closed)', () => {
    const r = calculateFourPillars(
      buildInput({ year: 2024, month: 2, day: 4 }, { accuracy: 'UNKNOWN', date: { year: 2024, month: 2, day: 4 } }),
    );
    expect(r.status).toBe('UNAVAILABLE');
    if (r.status === 'UNAVAILABLE') expect(r.reason.code).toBe('YEAR_MONTH_ATTRIBUTION_FAILED');
  });
  it('non-boundary date + unknown time stays safe (PARTIAL with year/month)', () => {
    const r = calculateFourPillars(
      buildInput({ year: 2024, month: 1, day: 3 }, { accuracy: 'UNKNOWN', date: { year: 2024, month: 1, day: 3 } }),
    );
    expect(r.status).toBe('PARTIAL');
  });
});

describe('Codex FIX 3 — supported range 1970-01-01 … 2050-12-31', () => {
  it('1969 and 2051 → UNSUPPORTED_DATE_RANGE; 2024 resolves', () => {
    const y1969 = resolveSajuYearAndMonth(kst(1969, 6, 1), LUNAR_JS_SOLAR_TERM_ADAPTER);
    const y2051 = resolveSajuYearAndMonth(kst(2051, 6, 1), LUNAR_JS_SOLAR_TERM_ADAPTER);
    if (!y1969.ok) expect(y1969.error.code).toBe('UNSUPPORTED_DATE_RANGE');
    else throw new Error('1969 must be unsupported');
    if (!y2051.ok) expect(y2051.error.code).toBe('UNSUPPORTED_DATE_RANGE');
    else throw new Error('2051 must be unsupported');
    expect(resolveSajuYearAndMonth(kst(2024, 6, 1), LUNAR_JS_SOLAR_TERM_ADAPTER).ok).toBe(true);
  });
});

describe('Codex FIX 4 — provenance matches the 立春/12-Jie runtime', () => {
  it('productRule declares SOLAR_TERM year/month + v2; golden pillars unchanged', () => {
    const r = calculateFourPillars(buildInput({ year: 2024, month: 1, day: 3 }, exact(2024, 1, 3)));
    if (r.status === 'UNAVAILABLE') throw new Error('unavailable');
    expect(r.provenance.productRule.yearPillarRule).toBe('SOLAR_TERM_START_OF_SPRING');
    expect(r.provenance.productRule.monthPillarRule).toBe('SOLAR_TERM_TWELVE_JIE');
    expect(r.provenance.productRule.solarTermRole).toBe('USED_FOR_YEAR_AND_MONTH_PILLARS');
    expect(r.provenance.productRule.ruleVersion).toBe('deokbunai.saju-pillar-rules.v2');
    const p = pillars(r);
    expect([gz(p.year), gz(p.month), gz(p.day)]).toEqual(['癸卯', '甲子', '丙寅']);
  });
});
