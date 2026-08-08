import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  type EarthlyBranch,
  type HeavenlyStem,
  type SexagenaryIndex,
  type SexagenaryPillar,
  type SexagenaryResult,
} from './contracts';

const SEXAGENARY_CYCLE_LENGTH = 60;

export function floorMod(dividend: number, divisor: number): number {
  if (!Number.isFinite(dividend) || !Number.isInteger(dividend)) {
    throw new RangeError('dividend must be a finite integer');
  }
  if (!Number.isFinite(divisor) || !Number.isInteger(divisor) || divisor <= 0) {
    throw new RangeError('divisor must be a positive finite integer');
  }
  return ((dividend % divisor) + divisor) % divisor;
}

function normalizedIndex(value: number): SexagenaryResult<SexagenaryIndex> {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return {
      ok: false,
      error: {
        code: 'NON_FINITE_INTEGER',
        field: 'sexagenaryIndex',
        message: 'Sexagenary index must be a finite integer.',
        receivedValue: value,
      },
    };
  }
  return {
    ok: true,
    value: floorMod(value, SEXAGENARY_CYCLE_LENGTH) as SexagenaryIndex,
  };
}

export function sexagenaryIndexToPillar(
  index: number,
): SexagenaryResult<SexagenaryPillar> {
  const normalized = normalizedIndex(index);
  if (!normalized.ok) return normalized;

  return {
    ok: true,
    value: {
      index: normalized.value,
      stem: HEAVENLY_STEMS[normalized.value % HEAVENLY_STEMS.length],
      branch: EARTHLY_BRANCHES[normalized.value % EARTHLY_BRANCHES.length],
    },
  };
}

export function isValidSexagenaryPair(
  stem: HeavenlyStem,
  branch: EarthlyBranch,
): boolean {
  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  return stemIndex >= 0 && branchIndex >= 0 && stemIndex % 2 === branchIndex % 2;
}

export function pillarToSexagenaryIndex(
  stem: HeavenlyStem,
  branch: EarthlyBranch,
): SexagenaryResult<SexagenaryIndex> {
  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  if (stemIndex < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_STEM',
        field: 'stem',
        message: 'Unknown heavenly stem.',
        receivedValue: stem,
      },
    };
  }

  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  if (branchIndex < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_BRANCH',
        field: 'branch',
        message: 'Unknown earthly branch.',
        receivedValue: branch,
      },
    };
  }

  if (!isValidSexagenaryPair(stem, branch)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_SEXAGENARY_PAIR',
        field: 'pillar',
        message: 'Stem and branch yin-yang parity does not form a cycle pair.',
        receivedValue: { stem, branch },
      },
    };
  }

  for (let index = 0; index < SEXAGENARY_CYCLE_LENGTH; index += 1) {
    if (
      index % HEAVENLY_STEMS.length === stemIndex &&
      index % EARTHLY_BRANCHES.length === branchIndex
    ) {
      return { ok: true, value: index as SexagenaryIndex };
    }
  }

  return {
    ok: false,
    error: {
      code: 'INVALID_SEXAGENARY_PAIR',
      field: 'pillar',
      message: 'Stem and branch pair is not present in the sexagenary cycle.',
      receivedValue: { stem, branch },
    },
  };
}

export function advanceSexagenaryIndex(
  index: SexagenaryIndex,
  distance: number,
): SexagenaryResult<SexagenaryIndex> {
  if (!Number.isFinite(distance) || !Number.isInteger(distance)) {
    return {
      ok: false,
      error: {
        code: 'NON_FINITE_INTEGER',
        field: 'distance',
        message: 'Advance distance must be a finite integer.',
        receivedValue: distance,
      },
    };
  }
  return normalizedIndex(index + distance);
}
