import type { CanonicalBirthInput } from '../domain/birth';
import type { NormalizedBirthInput } from '../contracts/normalization';

export const BIRTH_FINGERPRINT_SCHEMA_VERSION =
  'deokbunai.birth-normalization.v1' as const;

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
  payload: BirthFingerprintPayload,
): string {
  return serializeCanonicalValue(payload, '$');
}

export function createBirthFingerprintFrame(
  canonicalPayload: string,
): string {
  return `${BIRTH_FINGERPRINT_SCHEMA_VERSION}\n${canonicalPayload}`;
}
