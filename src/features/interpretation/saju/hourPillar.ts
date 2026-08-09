import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  type EarthlyBranch,
  type SajuHourPillarInput,
  type SajuHourPillarRuleDescriptor,
  type SexagenaryPillar,
  type SexagenaryResult,
} from './contracts';
import { floorMod, pillarToSexagenaryIndex, sexagenaryIndexToPillar } from './sexagenary';

export const DEOKBUNAI_SAJU_HOUR_V1_RULE: SajuHourPillarRuleDescriptor = {
  ruleId: 'DEOKBUNAI_SAJU_HOUR_V1',
  ruleVersion: 'deokbunai.saju-hour-pillar-rules.v1',
  timeBasis: 'LOCAL_CIVIL_TIME',
  dayBoundary: 'CIVIL_MIDNIGHT',
  ziHourRange: '23:00:00..00:59:59',
  trueSolarTime: 'DO_NOT_APPLY',
  authority: 'DEOKBUNAI_SAJU_V1_PRODUCT_RULE',
};

function isFiniteInteger(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value);
}

export function resolveHourBranch(
  localTime: SajuHourPillarInput['localTime'],
): SexagenaryResult<EarthlyBranch> {
  if (
    localTime == null ||
    !isFiniteInteger(localTime.hour) ||
    !isFiniteInteger(localTime.minute) ||
    !isFiniteInteger(localTime.second) ||
    localTime.hour < 0 ||
    localTime.hour > 23 ||
    localTime.minute < 0 ||
    localTime.minute > 59 ||
    localTime.second < 0 ||
    localTime.second > 59
  ) {
    return {
      ok: false,
      error: {
        code: 'INVALID_LOCAL_TIME',
        field: 'localTime',
        message: 'Exact local civil time requires integer hour 0..23, minute 0..59, and second 0..59.',
        receivedValue: localTime,
      },
    };
  }

  const branchIndex = floorMod(Math.floor((localTime.hour + 1) / 2), 12);
  return { ok: true, value: EARTHLY_BRANCHES[branchIndex] };
}

export function calculateHourPillar(
  input: SajuHourPillarInput,
): SexagenaryResult<SexagenaryPillar> {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(input.dayStem);
  if (dayStemIndex < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_STEM',
        field: 'dayStem',
        message: 'Hour Pillar requires a valid verified Day Stem.',
        receivedValue: input.dayStem,
      },
    };
  }

  const branch = resolveHourBranch(input.localTime);
  if (!branch.ok) return branch;

  const branchIndex = EARTHLY_BRANCHES.indexOf(branch.value);
  const ziHourStemIndex = (dayStemIndex % 5) * 2;
  const hourStem = HEAVENLY_STEMS[
    floorMod(ziHourStemIndex + branchIndex, HEAVENLY_STEMS.length)
  ];
  const pillarIndex = pillarToSexagenaryIndex(hourStem, branch.value);
  if (!pillarIndex.ok) return pillarIndex;
  return sexagenaryIndexToPillar(pillarIndex.value);
}
