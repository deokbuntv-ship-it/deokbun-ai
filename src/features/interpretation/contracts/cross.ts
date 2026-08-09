import type {
  EngineDescriptor,
  EngineId,
  EngineUnavailableReason,
} from './engine';
import type { EngineResult } from './result';
import type { EvidenceId, FactId, SignalId } from '../domain/evidence';
import type { EngineWarning } from '../domain/issues';

export type NormalizedEngineResult = EngineResult;

export type CrossLogicInput = {
  results: NormalizedEngineResult[];
  requestedEngines: EngineId[];
  policyVersion: string;
};

export type CrossSourceReference = {
  engine: EngineId;
  factIds?: FactId[];
  signalIds?: SignalId[];
  evidenceIds?: EvidenceId[];
};

export type CrossAgreement = {
  id: string;
  key: string;
  sources: CrossSourceReference[];
};

export type CrossTension = {
  id: string;
  key: string;
  sources: CrossSourceReference[];
};

export type CrossSignal = {
  id: string;
  key: string;
  ruleId: string;
  ruleVersion: string;
  sources: CrossSourceReference[];
};

export type CrossCoverage = {
  requested: EngineId[];
  completed: EngineId[];
  unavailable: Array<{
    engine: EngineId;
    reason: EngineUnavailableReason;
  }>;
  notRequested: EngineId[];
};

export type CrossLogicResult = {
  status: 'SUCCESS' | 'PARTIAL' | 'UNAVAILABLE';
  policyVersion: string;
  participatingEngines: EngineDescriptor[];
  agreements: CrossAgreement[];
  tensions: CrossTension[];
  compositeSignals: CrossSignal[];
  warnings: EngineWarning[];
  coverage: CrossCoverage;
};
