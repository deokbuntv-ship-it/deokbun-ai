export type FactId = string;
export type SignalId = string;
export type EvidenceId = string;

export type FactConfidence = 'DETERMINISTIC' | 'CONDITIONAL';

export type EngineFact<TValue = unknown> = {
  id: FactId;
  key: string;
  value: TValue;
  scope: string;
  confidence: FactConfidence;
  evidenceIds: EvidenceId[];
};

export type SignalDirection =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'NEUTRAL'
  | 'MIXED';

export type EngineSignal = {
  id: SignalId;
  key: string;
  direction?: SignalDirection;
  strength?: number;
  factIds: FactId[];
  evidenceIds: EvidenceId[];
};

export type EvidenceNode = {
  id: EvidenceId;
  kind: 'INPUT' | 'RULE' | 'DERIVATION' | 'LOOKUP';
  ruleId?: string;
  ruleVersion?: string;
  inputPaths?: string[];
  factIds?: FactId[];
  parentEvidenceIds?: EvidenceId[];
};
