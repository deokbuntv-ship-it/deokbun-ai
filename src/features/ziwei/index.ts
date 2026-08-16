// 자미두수 engine (Claude-owned, REUSE-first via iztro). Engine-external: never
// imports or edits the frozen 사주 engine (src/features/interpretation/**).
export { computeZiweiChart } from './services/ziweiService';
export { computeZiweiChartMemoized, clearZiweiCache } from './services/ziweiCache';
export { toZiweiEvidence } from './adapters/ziweiEvidenceAdapter';
export { resolveZiweiInput, type ZiweiBirthInput } from './adapters/ziweiInputAdapter';
export { toZiweiBirthInput, type ZiweiBirthSource } from './adapters/ziweiBirthMapper';
export { validateZiweiChart, type ZiweiValidationResult } from './validation/ziweiValidation';
export { timeIndexFromHour } from './domain/ziweiTypes';
export {
  IZTRO_VERSION,
  ZIWEI_ADAPTER_VERSION,
  ZIWEI_RULESET_VERSION,
} from './adapters/iztroAdapter';
export type {
  ZiweiAvailability,
  ZiweiChart,
  ZiweiInput,
  ZiweiPalace,
  ZiweiResult,
  ZiweiStar,
  ZiweiTransformation,
} from './domain/ziweiTypes';
