import { LegalDocumentView, REFUND_POLICY } from '@/features/legal';

// 환불·청약철회 정책 (route /refund-policy). DRAFT — finalized when paid purchase (05B) ships.
export default function RefundPolicyScreen() {
  return <LegalDocumentView doc={REFUND_POLICY} />;
}
