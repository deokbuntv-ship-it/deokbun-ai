import { LegalDocumentView, MINOR_USE_POLICY } from '@/features/legal';

// 미성년자 이용 및 결제 안내 (route /minor-policy). DRAFT — real age-gate + guardian consent = LEGAL_REVIEW_REQUIRED.
export default function MinorPolicyScreen() {
  return <LegalDocumentView doc={MINOR_USE_POLICY} />;
}
