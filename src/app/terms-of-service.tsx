import { LegalDocumentView, TERMS_OF_SERVICE } from '@/features/legal';

// 서비스 이용약관 (route /terms-of-service). Public — reachable without auth for onboarding + store listing.
export default function TermsOfServiceScreen() {
  return <LegalDocumentView doc={TERMS_OF_SERVICE} />;
}
