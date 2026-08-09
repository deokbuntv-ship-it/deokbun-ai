export type EngineId = 'SAJU' | 'ZIWEI' | 'QIMEN';

export type EngineDescriptor = {
  id: EngineId;
  engineVersion: string;
  ruleSetVersion: string;
  dataVersion?: string;
};

export type EngineUnavailableReason =
  | 'NOT_IMPLEMENTED'
  | 'MISSING_DATA'
  | 'UNSUPPORTED_INPUT'
  | 'VALIDATION_FAILED';
