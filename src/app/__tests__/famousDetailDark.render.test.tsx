// 유명인 상세 — 다크모드.
//
// ⚠ 파일이 따로인 이유: react-native-web 의 `Appearance` 는 **모듈 로드 시점에** matchMedia 를
// 캐시한다. `famousDetail.render.test.tsx` 는 최상단에서 화면을 import 하므로 그 안에서 나중에
// 다크로 바꿔도 이미 늦다 — 조용히 라이트로 돈다. `compatibilityChatDark` 와 같은 구조다.
//
// 명식 표는 `useColorScheme()` 으로 테두리·표면을 직접 고르는 몇 안 되는 컴포넌트다. 토큰을 안 쓰고
// 직접 고르는 코드가 다크에서 틀리는 것이 이 종류의 전형적인 결함이라 여기서 잡는다.
import { setColorScheme } from '@/test-support/renderAudit';

setColorScheme('dark');

import { render, screen, waitFor } from '@testing-library/react';

import { colors } from '@/theme';
import { buildFamousChart } from '@/features/famous/server/famousChart';

(globalThis as Record<string, unknown>).__routeParams = { slug: 'sample' };

let DETAIL: unknown = null;
jest.mock('@/features/publicSite/services/publicSiteService', () => ({
  __esModule: true,
  publicSiteService: { getFamous: () => Promise.resolve(DETAIL) },
}));
jest.mock('@/generated/famousStatic', () => ({
  __esModule: true,
  FAMOUS_STATIC: [],
  famousStaticBySlug: () => null,
}));

import FamousDetailScreen from '../famous/[slug]';

/** 이 하위 트리가 밝은 팔레트의 배경색을 하나라도 칠했는가 (`darkModeCore` 와 같은 판정). */
const usesLightSurfaces = (root: HTMLElement): string[] => {
  const light = new Set(
    [colors.light.surface, colors.light.background, colors.light.backgroundElevated, colors.light.backgroundSelected]
      .map((h) => String(h).toUpperCase()),
  );
  const hits: string[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(el.style.backgroundColor);
    if (!m) continue;
    const hex = `#${m.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    if (light.has(hex)) hits.push(hex);
  }
  return hits;
};

// 다이제스트는 provenance fingerprint 에만 쓰이고 이 파일은 그것을 검사하지 않는다 —
// 엔진의 자체 검증 하네스(birthExecutionBridgeValidation)도 같은 방식으로 상수를 준다.
const deps = { digestProvider: { async sha256Utf8() { return 'a'.repeat(64); } } };

async function chartOf(over: Record<string, unknown> = {}) {
  const r = await buildFamousChart(
    {
      displayName: '예시', gender: 'female', calendarType: 'solar', lunarMonthType: null,
      birthYear: '1990', birthMonth: '6', birthDay: '21',
      birthTimeAccuracy: 'exact', birthHour: '13', birthMinute: '20',
      approximateTimePeriod: null, birthPlace: '서울', ...over,
    } as never,
    deps,
  );
  if (!r.ok) throw new Error(`chart failed: ${r.detail}`);
  return r.snapshot;
}

const detail = (chart: unknown) => ({
  slug: 'sample', name: '예시 인물', category: '문화', occupation: '배우',
  shortDescription: '한 줄 소개.', bio: '본문입니다.',
  birthSource: 'reported', birthSourceNote: '메모', seoTitle: null, seoDescription: null,
  canonicalUrl: null, indexPolicy: 'index', publishedAt: null, chart, related: [],
});

it('스텁이 실제로 먹었다 — 이 확인이 없으면 아래가 거짓 통과다', () => {
  expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  expect(colors.dark.surface).not.toBe(colors.light.surface);
});

// ⚠ 색 판정을 `waitFor` 안에 넣는 이유. `use-color-scheme.web` 은 hydration 전 한 프레임을
// 무조건 light 로 돌려준다(정적 렌더 대응). 이 화면의 카드는 fetch 가 끝난 뒤에야 마운트되므로
// 그 한 프레임이 본문 등장과 겹친다 — 텍스트가 보이는 순간 바로 색을 읽으면 아직 light 다.
// `darkModeCore.render.test.tsx` 도 늦게 마운트되는 화면에서 같은 방식을 쓴다.
it('명식 표가 다크에서 라이트 표면을 칠하지 않는다', async () => {
  DETAIL = detail(await chartOf());
  const { container } = render(<FamousDetailScreen />);
  await waitFor(() => expect(screen.getByText('명식 (사주 원국)')).toBeInTheDocument());
  await waitFor(() => expect(usesLightSurfaces(container)).toEqual([]));
});

it('시주가 빈 경우의 자리도 다크를 따른다 — 여기만 다른 표면을 쓴다', async () => {
  DETAIL = detail(await chartOf({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null }));
  const { container } = render(<FamousDetailScreen />);
  await waitFor(() => expect(screen.getByText('시각 미상')).toBeInTheDocument());
  await waitFor(() => expect(usesLightSurfaces(container)).toEqual([]));
});
