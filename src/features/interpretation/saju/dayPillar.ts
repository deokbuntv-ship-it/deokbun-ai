import {
  compareGregorianDates,
  gregorianToCivilDayOrdinal,
  isValidGregorianDate,
} from '../calendar/civilDay';
import type { LocalDate } from '../domain/time';
import type {
  SajuDayPillarRuleDescriptor,
  SexagenaryPillar,
  SexagenaryResult,
} from './contracts';
import { floorMod, sexagenaryIndexToPillar } from './sexagenary';

export const DEOKBUNAI_SAJU_DAY_V1_RULE: SajuDayPillarRuleDescriptor = {
  ruleId: 'DEOKBUNAI_SAJU_DAY_V1',
  ruleVersion: 'deokbunai.saju-day-pillar-rules.v1',
  calendarBasis: 'GREGORIAN_CIVIL_DATE',
  dayBoundary: 'CIVIL_MIDNIGHT',
  anchorDate: { year: 2000, month: 1, day: 7 },
  anchorPillar: 'JIA-ZI',
  anchorIndex: 0,
  authority: 'KASI_LUN_ILJIN',
  supportedRange: {
    start: { year: 1900, month: 1, day: 1 },
    end: { year: 2050, month: 12, day: 31 },
  },
};

export function calculateDayPillar(
  gregorianCivilDate: LocalDate,
): SexagenaryResult<SexagenaryPillar> {
  if (!isValidGregorianDate(gregorianCivilDate)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_GREGORIAN_DATE',
        field: 'gregorianCivilDate',
        message: 'Day Pillar requires a valid Gregorian civil date.',
        receivedValue: gregorianCivilDate,
      },
    };
  }

  if (
    compareGregorianDates(
      gregorianCivilDate,
      DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.start,
    ) < 0 ||
    compareGregorianDates(
      gregorianCivilDate,
      DEOKBUNAI_SAJU_DAY_V1_RULE.supportedRange.end,
    ) > 0
  ) {
    return {
      ok: false,
      error: {
        code: 'UNSUPPORTED_DATE_RANGE',
        field: 'gregorianCivilDate',
        message: 'Day Pillar supports Gregorian dates from 1900-01-01 through 2050-12-31.',
        receivedValue: gregorianCivilDate,
      },
    };
  }

  const dayDistance =
    gregorianToCivilDayOrdinal(gregorianCivilDate) -
    gregorianToCivilDayOrdinal(DEOKBUNAI_SAJU_DAY_V1_RULE.anchorDate);
  const dayIndex = floorMod(
    DEOKBUNAI_SAJU_DAY_V1_RULE.anchorIndex + dayDistance,
    60,
  );
  return sexagenaryIndexToPillar(dayIndex);
}
