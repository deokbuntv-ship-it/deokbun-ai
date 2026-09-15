// Advertisement & Acquisition Tracking — PURE public surface (Sprint 3B). Types + pure
// logic ONLY (labels, tracking code/url, funnel, metrics, retention, xlsx, acquisition
// context). This barrel is imported by the node jest suites, so it must stay
// react-native-free — React components live behind '@/features/ads/components/…' and
// supabase services behind '@/features/ads/services/…' (never re-exported here).
export type {
  AdType,
  ContractType,
  AdStatus,
  Advertisement,
  AdInput,
  AdListItem,
  FunnelMilestone,
  AdFunnelCounts,
  AdPerformanceRow,
  AdOverviewTotals,
} from './types';

export {
  AD_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  AD_STATUS_LABELS,
  AD_STATUS_TONES,
  FUNNEL_LABELS,
  AD_TYPE_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  AD_STATUS_OPTIONS,
} from './labels';

export {
  TRACKING_CODE_PREFIX,
  encodeTrackingCode,
  generateTrackingCode,
  isValidTrackingCode,
  type RandomBytes,
} from './trackingCode';

export {
  TRACKING_QUERY_PARAM,
  TRACKING_UTM_PARAM,
  UTM_PRESETS,
  isUsableOrigin,
  buildTrackingUrl,
  buildUtmTrackingUrl,
  isValidAdCheckUrl,
  parseTrackingCodeFromQuery,
  trackingCodeSource,
} from './trackingUrl';

export { DAY_MS, RETENTION_DAYS, isRetainedAtDay } from './retention';

export { isNewAccountSignup } from './signupEligibility';

export {
  computeAdFunnelCounts,
  emptyFunnelCounts,
  computeOverviewTotals,
  type AttributedUser,
  type AdClick,
} from './funnel';

export {
  rate,
  costPer,
  formatRate,
  formatKrw,
  computeAdPerformance,
} from './adMetrics';

export { XLSX_HEADERS, buildAdPerformanceSheet } from './adXlsxReport';
export {
  buildXlsx,
  textCell,
  numberCell,
  type XlsxCell,
  type XlsxSheet,
} from './xlsx/xlsxWriter';

export {
  ACQUISITION_TTL_MS,
  captureAcquisition,
  peekAcquisition,
  consumeAcquisition,
  clearAcquisition,
  type AcquisitionContext,
} from './acquisition/acquisitionContext';
