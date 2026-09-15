import { render, screen, waitFor } from '@testing-library/react';
import { setViewport } from '@/test-support/renderAudit';
import { FAMOUS_NATURE_NOTICE } from '@/features/famous/famousDisclosure';
(globalThis as Record<string, unknown>).__routeParams = { slug: 'sample' };
const D = {
  slug: 'sample', name: '예시 인물', category: '문화', occupation: '배우',
  shortDescription: '한 줄 소개.', bio: '## 일간\n\n본문입니다.',
  birthSource: 'reported', birthSourceNote: '메모', seoTitle: null, seoDescription: null,
  canonicalUrl: null, indexPolicy: 'index', publishedAt: null, chart: null, related: [],
};
jest.mock('@/features/publicSite/services/publicSiteService', () => ({
  __esModule: true,
  publicSiteService: { getFamous: () => Promise.resolve(D) },
}));
jest.mock('@/generated/famousStatic', () => ({
  __esModule: true, FAMOUS_STATIC: [], famousStaticBySlug: () => null,
}));
import FamousDetailScreen from '../famous/[slug]';
it('probe', async () => {
  expect(FAMOUS_NATURE_NOTICE.length).toBeGreaterThan(0);
  setViewport(360);
  render(<FamousDetailScreen />);
  await waitFor(() => expect(screen.getByText('예시 인물')).toBeTruthy());
});
