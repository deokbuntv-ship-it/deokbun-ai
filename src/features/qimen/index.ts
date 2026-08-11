// 기문둔갑 engine (Claude-owned, REUSE-first via qimen-dunjia). Engine-external:
// never imports/edits the frozen 사주 engine (src/features/interpretation/**) or
// the ziwei module.
export { computeQimenBoard } from './services/qimenService';
export { computeQimenBoardMemoized, clearQimenCache } from './services/qimenCache';
export { toQimenEvidence } from './adapters/qimenEvidenceAdapter';
export { resolveQimenEligibility } from './adapters/qimenInputAdapter';
export { validateQimenBoard, type QimenValidationResult } from './validation/qimenValidation';
export { formatQueryDatetime } from './domain/qimenTypes';
export {
  QIMEN_LIBRARY,
  QIMEN_LIBRARY_VERSION,
  QIMEN_ADAPTER_VERSION,
  QIMEN_RULESET_VERSION,
} from './adapters/qimenCoreAdapter';
export type {
  QimenAvailability,
  QimenBoard,
  QimenPalace,
  QimenQuery,
  QimenQueryTime,
  QimenResult,
} from './domain/qimenTypes';
