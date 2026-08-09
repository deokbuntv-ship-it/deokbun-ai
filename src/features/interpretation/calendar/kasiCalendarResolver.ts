import type { BirthCalendarDate } from '../domain/birth';
import type {
  CalendarResolution,
  LunisolarCalendarResolver,
  ResolutionProvenance,
} from '../contracts/normalization';
import { KASI_CALENDAR_DATASET } from './data/kasiCalendarV1';
import {
  resolveGregorianToLunar,
  resolveLunarToGregorian,
} from './resolver';

const KASI_CALENDAR_PROVENANCE: ResolutionProvenance = {
  resolverId: 'DEOKBUNAI_KASI_LUNISOLAR_CALENDAR_RESOLVER',
  resolverVersion: 'deokbunai.kasi-calendar-resolver.v1',
  dataVersion: KASI_CALENDAR_DATASET.manifest.datasetVersion,
  ruleSetVersion: KASI_CALENDAR_DATASET.manifest.conversionRuleVersion,
  source: 'ENGINE',
};

export function resolveWithKasiCalendar(
  sourceDate: BirthCalendarDate,
): CalendarResolution {
  if (sourceDate.calendar === 'GREGORIAN') {
    const result = resolveGregorianToLunar(sourceDate, KASI_CALENDAR_DATASET);
    if (!result.success) {
      return {
        status: 'UNRESOLVED',
        sourceDate,
        reason: result.errors[0]?.code === 'UNSUPPORTED_GREGORIAN_RANGE'
          ? 'UNSUPPORTED_CALENDAR_RANGE'
          : 'CALENDAR_CONVERSION_FAILED',
      };
    }
    return {
      status: 'RESOLVED',
      sourceDate,
      gregorianDate: result.value.gregorianDate,
      lunarDate: result.value.lunarDate,
      calendarDatasetVersion: result.value.datasetVersion,
      calendarConversionRuleVersion: result.value.conversionRuleVersion,
      provenance: KASI_CALENDAR_PROVENANCE,
    };
  }

  const result = resolveLunarToGregorian(sourceDate, KASI_CALENDAR_DATASET);
  if (!result.success) {
    const firstError = result.errors[0]?.code;
    return {
      status: 'UNRESOLVED',
      sourceDate,
      reason:
        firstError === 'UNSUPPORTED_GREGORIAN_RANGE' ||
        firstError === 'UNSUPPORTED_LUNAR_RANGE'
          ? 'UNSUPPORTED_CALENDAR_RANGE'
          : firstError === 'INVALID_LUNAR_MONTH_KIND'
            ? 'INVALID_LUNAR_MONTH_KIND'
            : firstError === 'INVALID_LUNAR_DATE' ||
                firstError === 'LEAP_MONTH_NOT_PRESENT' ||
                firstError === 'DAY_EXCEEDS_MONTH_LENGTH'
              ? 'INVALID_LUNAR_DATE'
              : 'CALENDAR_CONVERSION_FAILED',
    };
  }
  return {
    status: 'RESOLVED',
    sourceDate,
    gregorianDate: result.value.gregorianDate,
    lunarDate: result.value.lunarDate,
    calendarDatasetVersion: result.value.datasetVersion,
    calendarConversionRuleVersion: result.value.conversionRuleVersion,
    provenance: KASI_CALENDAR_PROVENANCE,
  };
}

export const KASI_LUNISOLAR_CALENDAR_RESOLVER: LunisolarCalendarResolver = {
  async resolve(date) {
    return resolveWithKasiCalendar(date);
  },
};
