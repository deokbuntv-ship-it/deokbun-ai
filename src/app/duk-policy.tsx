import { LegalDocumentView, DUK_USE_POLICY } from '@/features/legal';

// 덕 유료 이용 정책 (route /duk-policy). DRAFT — shows the 검토 중 초안 banner. Values mirror economy_policy.
export default function DukPolicyScreen() {
  return <LegalDocumentView doc={DUK_USE_POLICY} />;
}
