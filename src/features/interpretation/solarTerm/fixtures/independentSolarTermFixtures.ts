import type { LocalDate } from '../../domain/time';
import type { SolarTermId } from '../contracts';
import type { SolarTermBoundaryDirection } from '../lunarJsSolarTermAdapter';

export type IndependentSolarTermFixture = {
  id: string;
  birthKst: {
    date: LocalDate;
    hour: number;
    minute: number;
    second: number;
  };
  direction: SolarTermBoundaryDirection;
  expected: {
    termId: SolarTermId;
    referenceKst: {
      date: LocalDate;
      hour: number;
      minute: number;
    };
    toleranceMinutes: 1;
  };
  authority: {
    name: 'NAOJ' | 'KASI';
    sourceUrl: string;
    sourceRevision: string;
  };
};

export const INDEPENDENT_SOLAR_TERM_FIXTURES = [
  {
    id: 'NAOJ_1991_MINOR_HEAT',
    birthKst: { date: { year: 1991, month: 7, day: 1 }, hour: 0, minute: 0, second: 0 },
    direction: 'FORWARD',
    expected: {
      termId: 'MINOR_HEAT',
      referenceKst: { date: { year: 1991, month: 7, day: 7 }, hour: 23, minute: 53 },
      toleranceMinutes: 1,
    },
    authority: {
      name: 'NAOJ',
      sourceUrl: 'https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy_en.cgi?year=1991',
      sourceRevision: 'NAOJ_ECO_LONG_TERM_V2.1I_ACCESSED_2026_08_15',
    },
  },
  {
    id: 'NAOJ_1991_WHITE_DEW',
    birthKst: { date: { year: 1991, month: 9, day: 1 }, hour: 0, minute: 0, second: 0 },
    direction: 'FORWARD',
    expected: {
      termId: 'WHITE_DEW',
      referenceKst: { date: { year: 1991, month: 9, day: 8 }, hour: 12, minute: 27 },
      toleranceMinutes: 1,
    },
    authority: {
      name: 'NAOJ',
      sourceUrl: 'https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy_en.cgi?year=1991',
      sourceRevision: 'NAOJ_ECO_LONG_TERM_V2.1I_ACCESSED_2026_08_15',
    },
  },
  {
    id: 'NAOJ_2024_MINOR_COLD',
    birthKst: { date: { year: 2024, month: 1, day: 1 }, hour: 0, minute: 0, second: 0 },
    direction: 'FORWARD',
    expected: {
      termId: 'MINOR_COLD',
      referenceKst: { date: { year: 2024, month: 1, day: 6 }, hour: 5, minute: 49 },
      toleranceMinutes: 1,
    },
    authority: {
      name: 'NAOJ',
      sourceUrl: 'https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy_en.cgi?year=2024',
      sourceRevision: 'NAOJ_ECO_LONG_TERM_V2.1I_ACCESSED_2026_08_15',
    },
  },
  {
    id: 'NAOJ_2024_START_OF_SUMMER',
    birthKst: { date: { year: 2024, month: 5, day: 1 }, hour: 0, minute: 0, second: 0 },
    direction: 'FORWARD',
    expected: {
      termId: 'START_OF_SUMMER',
      referenceKst: { date: { year: 2024, month: 5, day: 5 }, hour: 9, minute: 10 },
      toleranceMinutes: 1,
    },
    authority: {
      name: 'NAOJ',
      sourceUrl: 'https://eco.mtk.nao.ac.jp/koyomi/yoko/2024/rekiyou242.html',
      sourceRevision: 'NAOJ_2024_CALENDAR_REQUIREMENTS',
    },
  },
  {
    id: 'KASI_2023_START_OF_SUMMER',
    birthKst: { date: { year: 2023, month: 5, day: 1 }, hour: 0, minute: 0, second: 0 },
    direction: 'FORWARD',
    expected: {
      termId: 'START_OF_SUMMER',
      referenceKst: { date: { year: 2023, month: 5, day: 6 }, hour: 3, minute: 19 },
      toleranceMinutes: 1,
    },
    authority: {
      name: 'KASI',
      sourceUrl: 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/get24DivisionsInfo',
      sourceRevision: 'OPENAPI_GUIDE_V1.4_PROBE_ACQUIRED_2026_08_09',
    },
  },
] as const satisfies readonly IndependentSolarTermFixture[];
