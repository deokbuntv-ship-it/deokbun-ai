import type {
  BirthNormalizationDependencies,
} from '../normalization/birthNormalization';
import { normalizeBirthInput } from '../normalization/birthNormalization';
import {
  createBirthFingerprintFrame,
  createBirthFingerprintPayload,
  serializeBirthFingerprintPayload,
} from '../normalization/canonicalSerialization';
import {
  digestBirthFingerprintFrame,
  type DigestProvider,
  type Sha256Fingerprint,
} from '../normalization/fingerprint';
import type { SajuEngineInput, SajuEngineResult } from '../contracts/saju';
import type { NormalizedBirthInput } from '../contracts/normalization';
import type {
  NormalizationError,
  NormalizationWarning,
} from '../domain/validation';
import { executeSaju } from './engineAdapter';

export type SajuBirthExecutionDependencies = BirthNormalizationDependencies & {
  digestProvider: DigestProvider;
};

export type SajuBirthExecutionResult =
  | {
      success: true;
      normalizedBirth: NormalizedBirthInput;
      normalizedBirthFingerprint: Sha256Fingerprint;
      engineResult: SajuEngineResult;
      warnings: NormalizationWarning[];
    }
  | {
      success: false;
      failedStage: 'NORMALIZATION' | 'FINGERPRINT';
      errors: NormalizationError[];
      warnings: NormalizationWarning[];
    };

function fingerprintError(code: NormalizationError['code']): NormalizationError {
  return {
    code,
    path: 'normalizedBirthFingerprint',
    stage: 'SERIALIZATION',
    messageKey: `interpretation.normalization.${code}`,
  };
}

/**
 * APP-facing bridge from canonical birth input to the existing Saju adapter.
 * Each normalization and fingerprint stage executes once; pillar calculation
 * remains exclusively owned by executeSaju.
 */
export async function executeSajuFromBirthInput(
  input: SajuEngineInput,
  dependencies: SajuBirthExecutionDependencies,
): Promise<SajuBirthExecutionResult> {
  const normalization = await normalizeBirthInput(input.birth, dependencies);
  if (!normalization.success) {
    return {
      success: false,
      failedStage: 'NORMALIZATION',
      errors: normalization.errors,
      warnings: normalization.warnings,
    };
  }

  let frame: string;
  try {
    const payload = createBirthFingerprintPayload(normalization.value);
    const serialized = serializeBirthFingerprintPayload(payload);
    frame = createBirthFingerprintFrame(serialized);
  } catch {
    return {
      success: false,
      failedStage: 'FINGERPRINT',
      errors: [fingerprintError('CANONICAL_SERIALIZATION_FAILED')],
      warnings: normalization.warnings,
    };
  }

  let normalizedBirthFingerprint: Sha256Fingerprint;
  try {
    normalizedBirthFingerprint = await digestBirthFingerprintFrame(
      frame,
      dependencies.digestProvider,
    );
  } catch {
    return {
      success: false,
      failedStage: 'FINGERPRINT',
      errors: [fingerprintError('FINGERPRINT_DIGEST_FAILED')],
      warnings: normalization.warnings,
    };
  }
  if (normalizedBirthFingerprint.value.trim().length === 0) {
    return {
      success: false,
      failedStage: 'FINGERPRINT',
      errors: [fingerprintError('FINGERPRINT_DIGEST_FAILED')],
      warnings: normalization.warnings,
    };
  }

  return {
    success: true,
    normalizedBirth: normalization.value,
    normalizedBirthFingerprint,
    engineResult: executeSaju({
      engine: 'SAJU',
      normalizedBirth: normalization.value,
      normalizedBirthFingerprint,
    }),
    warnings: normalization.warnings,
  };
}
