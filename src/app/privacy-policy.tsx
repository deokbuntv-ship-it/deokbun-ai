import { LegalDocumentView, PRIVACY_POLICY } from '@/features/legal';

// 개인정보 처리방침 (route /privacy-policy). Public — reachable without auth so it can be linked from onboarding
// consent and the store listing. Draft presentation grounded in the real data inventory (see legalContent.ts).
export default function PrivacyPolicyScreen() {
  return <LegalDocumentView doc={PRIVACY_POLICY} />;
}
