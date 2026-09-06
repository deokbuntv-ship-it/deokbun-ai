// Premium Report — server surface. Imported by the chat Edge through the bundled server graph.
export {
  buildPremiumReport,
  parsePremiumReport,
  type PremiumReportRequest,
  type PremiumReportDeps,
  type PremiumReportServerResult,
} from './buildPremiumReport';
export { premiumReportResponseFormat, PREMIUM_REPORT_JSON_SCHEMA } from './premiumReportSchema';
export { buildPremiumEvidence, premiumEvidenceLines } from '@/features/premium/engine/premiumEvidence';
export type { PremiumEvidence } from '@/features/premium/engine/premiumEvidence';
export {
  PREMIUM_POLICY_VERSION,
  PREMIUM_EVIDENCE_VERSION,
  PREMIUM_FORWARD_MONTHS,
  type PremiumReportResult,
  type PremiumSection,
} from '@/features/premium/types';
