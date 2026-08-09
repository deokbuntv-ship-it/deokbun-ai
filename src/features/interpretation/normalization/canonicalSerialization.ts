import type { CanonicalBirthInput } from '../domain/birth';
import type {
  NormalizedBirthInput,
  UniqueTimezoneResolution,
} from '../contracts/normalization';

export const BIRTH_FINGERPRINT_SCHEMA_VERSION_V3 =
  'deokbunai.birth-normalization.v3' as const;

export const BIRTH_FINGERPRINT_SCHEMA_VERSION =
  // V4 refines historical timezone ambiguity, gaps, unresolved provenance,
  // and seconds-authoritative candidate semantics. V3 remains available only
  // for deterministic regression of already-produced frames.
  'deokbunai.birth-normalization.v4' as const;

export type BirthFingerprintPayload = {
  schemaVersion: typeof BIRTH_FINGERPRINT_SCHEMA_VERSION;
  source: {
    date: CanonicalBirthInput['date'];
    time: CanonicalBirthInput['time'];
    coordinates: CanonicalBirthInput['place']['coordinates'] | null;
    temporalContext: CanonicalBirthInput['temporalContext'];
    gender: CanonicalBirthInput['gender'];
  };
  normalized: {
    calendar: NormalizedBirthInput['calendar'];
    civilLocal: NormalizedBirthInput['civilLocal'];
    timezone: NormalizedBirthInput['timezone'];
    trueSolarTime: NormalizedBirthInput['trueSolarTime'];
    provenance: NormalizedBirthInput['provenance'];
  };
};

type BirthFingerprintTimezoneV3 =
  | UniqueTimezoneResolution
  | Pick<
      Extract<NormalizedBirthInput['timezone'], { status: 'UNRESOLVED' }>,
      'status' | 'ianaZone' | 'reason'
    >;

export type BirthFingerprintPayloadV3 = Omit<BirthFingerprintPayload, 'schemaVersion' | 'normalized'> & {
  schemaVersion: typeof BIRTH_FINGERPRINT_SCHEMA_VERSION_V3;
  normalized: Omit<BirthFingerprintPayload['normalized'], 'timezone'> & {
    timezone: BirthFingerprintTimezoneV3;
  };
};

export class CanonicalSerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CanonicalSerializationError';
  }
}

export function createBirthFingerprintPayload(
  input: NormalizedBirthInput,
): BirthFingerprintPayload {
  return {
    schemaVersion: BIRTH_FINGERPRINT_SCHEMA_VERSION,
    source: {
      date: input.source.date,
      time: input.source.time,
      coordinates: input.source.place.coordinates ?? null,
      temporalContext: input.source.temporalContext,
      gender: input.source.gender,
    },
    normalized: {
      calendar: input.calendar,
      civilLocal: input.civilLocal,
      timezone: input.timezone,
      trueSolarTime: input.trueSolarTime,
      provenance: input.provenance,
    },
  };
}

/** Regression-only V3 payload builder. New calculations must use V4. */
export function createBirthFingerprintPayloadV3(
  input: NormalizedBirthInput,
): BirthFingerprintPayloadV3 {
  let timezone: BirthFingerprintTimezoneV3;
  if (input.timezone.status === 'UNRESOLVED') {
    timezone = {
      status: 'UNRESOLVED',
      ...(input.timezone.ianaZone ? { ianaZone: input.timezone.ianaZone } : {}),
      reason: input.timezone.reason,
    };
  } else {
    if (!('resolvedOffsetSeconds' in input.timezone)) {
      throw new CanonicalSerializationError(
        'Normalization V3 cannot represent refined AMBIGUOUS or NONEXISTENT timezone semantics.',
      );
    }
    timezone = input.timezone;
  }
  const provenance = [];
  if (input.calendar.status === 'RESOLVED') provenance.push(input.calendar.provenance);
  if (input.timezone.status === 'RESOLVED') {
    provenance.push(input.timezone.provenance);
    if ('dst' in input.timezone) provenance.push(input.timezone.dst.provenance);
  }
  if (input.trueSolarTime.status === 'APPLIED') {
    provenance.push(input.trueSolarTime.provenance);
  }
  return {
    schemaVersion: BIRTH_FINGERPRINT_SCHEMA_VERSION_V3,
    source: {
      date: input.source.date,
      time: input.source.time,
      coordinates: input.source.place.coordinates ?? null,
      temporalContext: input.source.temporalContext,
      gender: input.source.gender,
    },
    normalized: {
      calendar: input.calendar,
      civilLocal: input.civilLocal,
      timezone,
      trueSolarTime: input.trueSolarTime,
      provenance,
    },
  };
}

function serializeCanonicalValue(value: unknown, path: string): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new CanonicalSerializationError(
        `Non-finite number at ${path}.`,
      );
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value
      .map((item, index) => serializeCanonicalValue(item, `${path}[${index}]`))
      .join(',')}]`;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const entries = keys.map((key) => {
      const item = record[key];
      if (item === undefined) {
        throw new CanonicalSerializationError(
          `Undefined value at ${path}.${key}.`,
        );
      }
      return `${JSON.stringify(key)}:${serializeCanonicalValue(
        item,
        `${path}.${key}`,
      )}`;
    });
    return `{${entries.join(',')}}`;
  }

  throw new CanonicalSerializationError(
    `Unsupported value at ${path}: ${typeof value}.`,
  );
}

export function serializeBirthFingerprintPayload(
  payload: BirthFingerprintPayload | BirthFingerprintPayloadV3,
): string {
  return serializeCanonicalValue(payload, '$');
}

export function createBirthFingerprintFrame(
  canonicalPayload: string,
): string {
  return `${BIRTH_FINGERPRINT_SCHEMA_VERSION}\n${canonicalPayload}`;
}

/** Regression-only V3 framing. New calculations must use V4. */
export function createBirthFingerprintFrameV3(
  canonicalPayload: string,
): string {
  return `${BIRTH_FINGERPRINT_SCHEMA_VERSION_V3}\n${canonicalPayload}`;
}
