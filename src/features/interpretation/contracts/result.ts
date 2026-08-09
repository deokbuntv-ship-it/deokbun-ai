import type { EngineDescriptor, EngineUnavailableReason } from './engine';
import type {
  EngineFact,
  EngineSignal,
  EvidenceNode,
} from '../domain/evidence';
import type { EngineWarning, MissingDataItem } from '../domain/issues';

type EngineResultBase<TFact, TSignal> = {
  engine: EngineDescriptor;
  // Contract only. Canonical serialization and fingerprint generation belong
  // to ENGINE-02.
  inputFingerprint: string;
  facts: TFact[];
  signals: TSignal[];
  evidence: EvidenceNode[];
  warnings: EngineWarning[];
  missingData: MissingDataItem[];
};

export type EngineResult<
  TFact extends EngineFact = EngineFact,
  TSignal extends EngineSignal = EngineSignal,
> = EngineResultBase<TFact, TSignal> &
  (
    | {
        status: 'SUCCESS' | 'PARTIAL';
        unavailableReason?: never;
      }
    | {
        status: 'UNAVAILABLE';
        unavailableReason: EngineUnavailableReason;
      }
  );
