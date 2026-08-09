import {
  EARTHLY_BRANCH_LABELS,
  FIVE_ELEMENT_LABELS,
  HEAVENLY_STEM_LABELS,
  HIDDEN_STEM_ROLE_LABELS,
  TEN_GOD_LABELS,
  YIN_YANG_LABELS,
  type SajuBirthExecutionResult,
  type SajuDerivedBranchAnnotation,
  type SajuDerivedHiddenStemAnnotation,
  type SajuDerivedPillarAnnotation,
  type SajuDerivedStemAnnotation,
  type SajuEngineResult,
  type SajuFourPillars,
  type SajuFourPillarsHour,
  type SajuFourPillarsUnavailableReason,
  type SexagenaryPillar,
} from '@/features/interpretation';

import type {
  ManseBirthDisplay,
  ManseBranchView,
  ManseFourPillars,
  ManseHiddenStemView,
  ManseHourStatus,
  ManseStemView,
  ManseView,
  PillarView,
} from '../types';
import { fiveElementColorKey } from './elementColor';

// APP-owned adapter: ENGINE SajuEngineResult -> presentation ManseView. NO
// calculation happens here — it maps authoritative ENGINE output + canonical ENGINE
// labels onto the presentation view model. element/yinYang/tenGod/hiddenStems are
// all ENGINE-owned; the APP only picks a theme color key and reuses ENGINE labels.

const DAY_MASTER_LABEL = '일간';

function stemView(
  sexStem: SexagenaryPillar['stem'],
  annotation: SajuDerivedStemAnnotation,
  isDayMaster: boolean,
): ManseStemView {
  const label = HEAVENLY_STEM_LABELS[sexStem];
  return {
    hanja: label.hanja,
    hangul: label.hangul,
    elementColorKey: fiveElementColorKey(annotation.element),
    elementLabel: FIVE_ELEMENT_LABELS[annotation.element].hangul,
    yinYangLabel: YIN_YANG_LABELS[annotation.yinYang].hangul,
    // ENGINE raw fact stays PEER for the day stem; the APP shows "일간" for the
    // Day Master position only. Value is not altered — presentation label only.
    tenGodLabel: isDayMaster
      ? DAY_MASTER_LABEL
      : TEN_GOD_LABELS[annotation.tenGod].hangul,
    isDayMaster,
  };
}

function hiddenStemView(
  hidden: SajuDerivedHiddenStemAnnotation,
): ManseHiddenStemView {
  const label = HEAVENLY_STEM_LABELS[hidden.stem];
  return {
    hanja: label.hanja,
    hangul: label.hangul,
    roleLabel: HIDDEN_STEM_ROLE_LABELS[hidden.role].hangul,
    elementColorKey: fiveElementColorKey(hidden.element),
    elementLabel: FIVE_ELEMENT_LABELS[hidden.element].hangul,
    yinYangLabel: YIN_YANG_LABELS[hidden.yinYang].hangul,
    tenGodLabel: TEN_GOD_LABELS[hidden.tenGod].hangul,
  };
}

function branchView(
  sexBranch: SexagenaryPillar['branch'],
  annotation: SajuDerivedBranchAnnotation,
): ManseBranchView {
  const label = EARTHLY_BRANCH_LABELS[sexBranch];
  return {
    hanja: label.hanja,
    hangul: label.hangul,
    elementColorKey: fiveElementColorKey(annotation.element),
    elementLabel: FIVE_ELEMENT_LABELS[annotation.element].hangul,
    yinYangLabel: YIN_YANG_LABELS[annotation.yinYang].hangul,
    hiddenStems: annotation.hiddenStems.map(hiddenStemView),
  };
}

function pillarView(
  columnLabel: string,
  sexagenary: SexagenaryPillar,
  annotation: SajuDerivedPillarAnnotation,
  isDayMaster: boolean,
): PillarView {
  return {
    columnLabel,
    stem: stemView(sexagenary.stem, annotation.stem, isDayMaster),
    branch: branchView(sexagenary.branch, annotation.branch),
  };
}

function emptyPillar(columnLabel: string): PillarView {
  return { columnLabel, stem: null, branch: null };
}

function emptyPillars(): ManseFourPillars {
  return {
    hour: emptyPillar('시'),
    day: emptyPillar('일'),
    month: emptyPillar('월'),
    year: emptyPillar('년'),
  };
}

// Hour column: full view only when the ENGINE hour is AVAILABLE and its derived
// annotation exists. Otherwise null stem/branch (PARTIAL-safe, never fabricated).
function hourPillarView(
  fourPillarsHour: SajuFourPillarsHour,
  hourAnnotation: SajuDerivedPillarAnnotation | undefined,
): PillarView {
  if (fourPillarsHour.status === 'AVAILABLE' && hourAnnotation !== undefined) {
    return pillarView('시', fourPillarsHour.pillar, hourAnnotation, false);
  }
  return emptyPillar('시');
}

function mapHourStatus(hour: SajuFourPillarsHour): ManseHourStatus {
  if (hour.status === 'AVAILABLE') {
    return 'available';
  }
  if (hour.status === 'AMBIGUOUS') {
    return hour.reason === 'BIRTH_TIME_APPROXIMATE_AMBIGUOUS'
      ? 'approximate'
      : 'ambiguous';
  }
  return hour.reason === 'BIRTH_TIME_UNKNOWN' ? 'unknown' : 'unavailable';
}

const AGGREGATE_UNAVAILABLE_MESSAGE: Partial<
  Record<SajuFourPillarsUnavailableReason['code'], string>
> = {
  CALENDAR_UNRESOLVED: '출생 정보로 만세력 달력을 확정할 수 없습니다.',
  NORMALIZED_DATE_MISMATCH: '만세력 결과를 확정할 수 없습니다.',
  NORMALIZED_INPUT_INCONSISTENT: '만세력 결과를 확정할 수 없습니다.',
  PRODUCT_RULE_VIOLATION: '만세력 결과를 확정할 수 없습니다.',
  INVALID_CALCULATION_IDENTITY: '만세력 결과를 확정할 수 없습니다.',
  CORE_CALCULATION_FAILED: '만세력 결과를 확정할 수 없습니다.',
};

const NORMALIZATION_FAILURE_MESSAGE: Record<string, string> = {
  UNSUPPORTED_CALENDAR_RANGE: '지원하지 않는 출생일 범위입니다.',
  INVALID_GREGORIAN_DATE: '출생일 정보가 올바르지 않습니다.',
  INVALID_DATE_COMPONENT: '출생일 정보가 올바르지 않습니다.',
  INVALID_LUNAR_DATE: '음력 출생일 정보가 올바르지 않습니다.',
  INVALID_LUNAR_MONTH_KIND: '음력 출생일 정보가 올바르지 않습니다.',
  INVALID_TIME: '출생시간 정보가 올바르지 않습니다.',
};

// SajuEngineResult -> ManseView (core adapter mapping).
export function manseViewFromEngineResult(
  birth: ManseBirthDisplay,
  result: SajuEngineResult,
): ManseView {
  if (result.status === 'UNAVAILABLE') {
    return {
      birth,
      aggregateStatus: 'unavailable',
      hourStatus: 'unavailable',
      pillars: emptyPillars(),
      derivedFactsAvailable: false,
      fortuneCycleAvailable: false,
      unavailableReason:
        AGGREGATE_UNAVAILABLE_MESSAGE[result.failure.aggregateReason.code] ??
        '만세력 결과를 표시할 수 없습니다.',
    };
  }

  const fourPillars: SajuFourPillars = result.output.fourPillars;
  const derived = result.output.derivedFacts.pillars;

  return {
    birth,
    // SUCCESS = all four pillars; PARTIAL = year/month/day, hour not available.
    aggregateStatus: result.status === 'SUCCESS' ? 'complete' : 'partial',
    hourStatus: mapHourStatus(fourPillars.hour),
    pillars: {
      hour: hourPillarView(fourPillars.hour, derived.hour),
      day: pillarView('일', fourPillars.day, derived.day, true),
      month: pillarView('월', fourPillars.month, derived.month, false),
      year: pillarView('년', fourPillars.year, derived.year, false),
    },
    // year/month/day derived facts are always present for SUCCESS/PARTIAL.
    derivedFactsAvailable: true,
    fortuneCycleAvailable: false,
  };
}

// Normalization/fingerprint stage failure (before executeSaju) -> unavailable view.
export function manseViewFromBridgeFailure(
  birth: ManseBirthDisplay,
  failure: Extract<SajuBirthExecutionResult, { success: false }>,
): ManseView {
  const code = failure.errors[0]?.code;
  const reason =
    (code !== undefined ? NORMALIZATION_FAILURE_MESSAGE[code] : undefined) ??
    '만세력 결과를 표시할 수 없습니다.';

  return {
    birth,
    aggregateStatus: 'unavailable',
    hourStatus: 'unavailable',
    pillars: emptyPillars(),
    derivedFactsAvailable: false,
    fortuneCycleAvailable: false,
    unavailableReason: reason,
  };
}
