import type {
  SajuBirthExecutionResult,
  SajuEngineResult,
  SajuFourPillarsHour,
  SajuFourPillarsUnavailableReason,
  SexagenaryPillar,
} from '@/features/interpretation';

import type {
  ManseBirthDisplay,
  ManseHourStatus,
  ManseView,
  PillarView,
} from '../types';

// APP-owned adapter: ENGINE SajuEngineResult -> presentation ManseView. NO
// calculation happens here — it only maps authoritative ENGINE output onto the
// existing APP-28B presentation view model.

// NOTE (Korean labels): the ENGINE exposes stem/branch as romanized semantic ids
// (HEAVENLY_STEMS 'JIA'.., EARTHLY_BRANCHES 'ZI'..) and does NOT provide Korean
// 간지 labels. Per the sprint rule the APP must NOT invent a 60갑자 lookup, so the
// authoritative semantic ids are shown provisionally and Korean canonical labels
// are reported as Integration Required. 음양/오행 remain placeholders (null) until
// the Derived Facts ENGINE provides them.

function pillarView(columnLabel: string, pillar: SexagenaryPillar): PillarView {
  return {
    columnLabel,
    heavenlyStem: pillar.stem,
    earthlyBranch: pillar.branch,
    ganzhiLabel: null,
    yinYang: null,
    element: null,
  };
}

function emptyPillar(columnLabel: string): PillarView {
  return {
    columnLabel,
    heavenlyStem: null,
    earthlyBranch: null,
    ganzhiLabel: null,
    yinYang: null,
    element: null,
  };
}

function emptyPillars() {
  return {
    hour: emptyPillar('시'),
    day: emptyPillar('일'),
    month: emptyPillar('월'),
    year: emptyPillar('년'),
  };
}

function mapHour(hour: SajuFourPillarsHour): {
  status: ManseHourStatus;
  pillar: PillarView;
} {
  if (hour.status === 'AVAILABLE') {
    return { status: 'available', pillar: pillarView('시', hour.pillar) };
  }
  if (hour.status === 'AMBIGUOUS') {
    return {
      status:
        hour.reason === 'BIRTH_TIME_APPROXIMATE_AMBIGUOUS'
          ? 'approximate'
          : 'ambiguous',
      pillar: emptyPillar('시'),
    };
  }
  // UNAVAILABLE
  return {
    status: hour.reason === 'BIRTH_TIME_UNKNOWN' ? 'unknown' : 'unavailable',
    pillar: emptyPillar('시'),
  };
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

// SajuEngineResult -> ManseView (the core adapter mapping).
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

  const fourPillars = result.output.fourPillars;
  const hour = mapHour(fourPillars.hour);

  return {
    birth,
    // SUCCESS = all four pillars; PARTIAL = year/month/day authoritative, hour not.
    aggregateStatus: result.status === 'SUCCESS' ? 'complete' : 'partial',
    hourStatus: hour.status,
    pillars: {
      hour: hour.pillar,
      day: pillarView('일', fourPillars.day),
      month: pillarView('월', fourPillars.month),
      year: pillarView('년', fourPillars.year),
    },
    derivedFactsAvailable: false,
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
