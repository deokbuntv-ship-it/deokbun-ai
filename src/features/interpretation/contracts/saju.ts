import type { CanonicalBirthInput } from '../domain/birth';
import type { EngineFact } from '../domain/evidence';
import type { EngineWarning } from '../domain/issues';
import type { NormalizationWarning } from '../domain/validation';
import type { NormalizedBirthInput } from './normalization';
import type { EngineResult } from './result';
import type { Sha256Fingerprint } from '../normalization/fingerprint';
import type {
  SajuFourPillars,
  SajuFourPillarsCalculationIdentity,
  SajuFourPillarsProvenance,
  SajuFourPillarsUnavailableReason,
  SajuFourPillarsHourUnavailableReason,
  SexagenaryPillar,
} from '../saju/contracts';
import type {
  SajuDerivedFacts,
  SajuDerivedFactsRuleVersions,
} from '../saju/derived/contracts';
import type {
  SajuFiveElementDistribution,
  SajuFiveElementDistributionRuleVersions,
} from '../saju/distribution/contracts';

// Saju-specific options are intentionally not invented in ENGINE-01. They will
// be introduced with verified calculation rules in the Saju engine sprints.
export type SajuEngineInput = {
  engine: 'SAJU';
  birth: CanonicalBirthInput;
};

/** Post-normalization input for the single Saju execution boundary. */
export type SajuEngineExecutionInput = {
  engine: 'SAJU';
  normalizedBirth: NormalizedBirthInput;
  normalizedBirthFingerprint: Sha256Fingerprint;
};

export type SajuPillarFactKey =
  | 'YEAR_PILLAR'
  | 'MONTH_PILLAR'
  | 'DAY_PILLAR'
  | 'HOUR_PILLAR';

export type SajuPillarFact = EngineFact<SexagenaryPillar> & {
  key: SajuPillarFactKey;
  scope: 'SAJU.FOUR_PILLARS';
  confidence: 'DETERMINISTIC';
};

export type SajuEngineWarning = EngineWarning &
  (
    | {
        source: 'NORMALIZATION';
        normalizationWarning: NormalizationWarning;
      }
    | {
        source: 'HOUR_CAPABILITY';
        hourReason: SajuFourPillarsHourUnavailableReason;
      }
  );

export type SajuEngineOutput = {
  fourPillars: SajuFourPillars;
  derivedFacts: SajuDerivedFacts;
  fiveElementDistribution: SajuFiveElementDistribution;
  identity: SajuFourPillarsCalculationIdentity;
  provenance: SajuFourPillarsProvenance & {
    derivedFactsRuleVersions: SajuDerivedFactsRuleVersions;
    fiveElementDistributionRuleVersions: SajuFiveElementDistributionRuleVersions;
  };
};

type WithSajuWarnings<TResult> = TResult extends unknown
  ? Omit<TResult, 'warnings'> & { warnings: SajuEngineWarning[] }
  : never;

type SajuEngineResultBase = WithSajuWarnings<EngineResult<SajuPillarFact>>;

export type SajuEngineResult =
  | (SajuEngineResultBase & {
      status: 'SUCCESS';
      output: SajuEngineOutput;
      failure?: never;
    })
  | (SajuEngineResultBase & {
      status: 'PARTIAL';
      output: SajuEngineOutput;
      failure?: never;
    })
  | (SajuEngineResultBase & {
      status: 'UNAVAILABLE';
      output?: never;
      failure: {
        aggregateReason: SajuFourPillarsUnavailableReason;
      };
    });
