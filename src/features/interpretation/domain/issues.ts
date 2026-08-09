export type WarningSeverity = 'INFO' | 'CAUTION' | 'BLOCKING';

export type EngineWarning = {
  code: string;
  severity: WarningSeverity;
  scope: string;
  messageKey: string;
  relatedInputPaths?: string[];
  affectedFactKeys?: string[];
};

export type MissingDataReason =
  | 'NOT_PROVIDED'
  | 'UNRESOLVED'
  | 'INSUFFICIENT_ACCURACY'
  | 'UNSUPPORTED';

export type MissingDataItem = {
  field: string;
  reason: MissingDataReason;
  requiredFor: string[];
};
