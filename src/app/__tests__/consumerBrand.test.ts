import { readFileSync } from 'fs';
import { resolve } from 'path';

// Consumer brand lock (brand addendum). The finalized consumer-facing service name is 덕분이; legacy 덕분AI must
// not resurface on consumer surfaces. This scans the consumer files that were migrated and asserts none expose
// the legacy Korean brand. It intentionally does NOT scan the deliberately-preserved INTERNAL surfaces — the
// edge-bundled LLM prompts (today/monthly/consultation), the operator-only admin console, or Latin identifiers
// (DeokbunAI / DEOKBUNAI_* constants) — so legitimate technical identifiers never fail this test.
const SRC = resolve(__dirname, '..', '..');
const read = (rel: string) => readFileSync(resolve(SRC, rel), 'utf8');

// Consumer-facing files migrated to 덕분이 (login/onboarding/home/consultation/legal/public/share/SEO).
const CONSUMER_FILES = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/my.tsx',
  'app/login.tsx',
  'app/chat.tsx',
  'app/birth-info.tsx',
  'app/onboarding/terms.tsx',
  'app/onboarding/index.tsx',
  'app/notifications.tsx',
  'app/privacy-policy.tsx',
  'app/terms-of-service.tsx',
  'app/shared-report/[token].tsx',
  'app/content/index.tsx',
  'app/famous/index.tsx',
  'components/AppHeader/AppHeader.tsx',
  'components/QuestionComposer/QuestionComposer.tsx',
  'features/onboarding/OnboardingGate.tsx',
  'features/intelligence/components/ConsultationLoading.tsx',
  'features/consultation/components/BirthProfileForm.tsx',
  'features/publicSite/components/PublicLayout.tsx',
  'features/legal/legalContent.ts',
  'features/chat/report/ShareReportSheet.tsx',
];

describe('consumer surfaces use the finalized brand 덕분이', () => {
  it.each(CONSUMER_FILES)('%s does not expose the legacy 덕분AI brand', (rel) => {
    expect(read(rel)).not.toMatch(/덕분AI/);
  });

  it('key surfaces positively render 덕분이', () => {
    expect(read('components/AppHeader/AppHeader.tsx')).toMatch(/'덕분이'/);
    expect(read('app/login.tsx')).toMatch(/덕분이/);
    expect(read('app/chat.tsx')).toMatch(/덕분이입니다/);
    expect(read('components/QuestionComposer/QuestionComposer.tsx')).toMatch(/덕분이/);
  });
});
