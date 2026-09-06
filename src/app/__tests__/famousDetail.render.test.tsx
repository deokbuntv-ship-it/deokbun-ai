// 유명인 공개 상세 — 명식 표(F3 = C 수준) · 고지 2회 배치 · 360dp · 다크 · 접근성.
//
// ⚠ 명식은 **fixture 가 아니라 실제 엔진 출력**으로 그린다. 손으로 적은 fixture 는 스냅샷 구조가
// 바뀌어도 조용히 통과하고, 그러면 이 파일은 "표가 렌더된다" 가 아니라 "내가 적은 객체가 렌더된다"
// 를 증명하게 된다. 엔진 1콜(실측 34ms)로 그 종류의 거짓 PASS 를 없앤다.
import { render, screen, waitFor, cleanup } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

import { buildFamousChart } from '@/features/famous/server/famousChart';
import {
  FAMOUS_NATURE_NOTICE,
  FAMOUS_NATURE_NOTICE_FOOTER,
} from '@/features/famous/famousDisclosure';

// 하네스가 이미 expo-router 를 mock 한다. 다시 mock 하면 requireActual 이 실제 모듈을 끌고 와
// Link 가 undefined 가 되고 공개 헤더부터 무너진다 — 파라미터는 하네스가 읽는 전역으로 넣는다.
(globalThis as Record<string, unknown>).__routeParams = { slug: 'sample' };

let DETAIL: unknown = null;
jest.mock('@/features/publicSite/services/publicSiteService', () => ({
  __esModule: true,
  publicSiteService: { getFamous: () => Promise.resolve(DETAIL) },
}));
// 빌드 스냅샷은 이 테스트의 관심사가 아니다 — 비워 두고 RPC 경로만 본다.
jest.mock('@/generated/famousStatic', () => ({
  __esModule: true,
  FAMOUS_STATIC: [],
  famousStaticBySlug: () => null,
}));

import FamousDetailScreen from '../famous/[slug]';

// 다이제스트는 provenance fingerprint 에만 쓰이고 이 파일은 그것을 검사하지 않는다 —
// 엔진의 자체 검증 하네스(birthExecutionBridgeValidation)도 같은 방식으로 상수를 준다.
const deps = { digestProvider: { async sha256Utf8() { return 'a'.repeat(64); } } };

const birth = (over: Record<string, unknown> = {}) =>
  ({
    displayName: '예시', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '6', birthDay: '21',
    birthTimeAccuracy: 'exact', birthHour: '13', birthMinute: '20',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as never;

const detail = (chart: unknown, over: Record<string, unknown> = {}) => ({
  slug: 'sample', name: '예시 인물', category: '문화', occupation: '배우',
  shortDescription: '한 줄 소개.', bio: '## 일간\n\n본문입니다.',
  birthSource: 'reported', birthSourceNote: '인터뷰 발언을 근거로 정리했습니다.',
  seoTitle: null, seoDescription: null, canonicalUrl: null, indexPolicy: 'index',
  publishedAt: '2026-09-01T00:00:00Z', chart, related: [], ...over,
});

async function chartOf(over: Record<string, unknown> = {}) {
  const r = await buildFamousChart(birth(over), deps);
  if (!r.ok) throw new Error(`chart failed: ${r.detail}`);
  return r.snapshot;
}

async function show(d: unknown, width = 360) {
  cleanup();
  DETAIL = d;
  setViewport(width);
  render(<FamousDetailScreen />);
  await waitFor(() => expect(screen.getByText('예시 인물')).toBeTruthy());
}

describe('유명인 상세 — 명식 표', () => {
  it('원국 4주가 한자와 한글로 보이고 십성·지장간·오행이 함께 나온다', async () => {
    const chart = await chartOf();
    await show(detail(chart));

    for (const p of [chart.pillars.year, chart.pillars.month, chart.pillars.day, chart.pillars.hour!]) {
      expect(screen.getAllByText(p.stem.hanja).length).toBeGreaterThan(0);
      expect(screen.getAllByText(p.branch.hanja).length).toBeGreaterThan(0);
    }
    // 십성 — 일간을 뺀 세 천간에는 반드시 붙는다.
    for (const p of [chart.pillars.year, chart.pillars.month, chart.pillars.hour!]) {
      expect(screen.getAllByText(p.stem.tenGod!).length).toBeGreaterThan(0);
    }
    // 지장간 — 일지의 첫 글자가 화면에 있다.
    const hidden = chart.pillars.day.branch.hiddenStems[0];
    expect(document.body.textContent).toContain(hidden.hangul);
    // 오행 개수 — 다섯 개 칩 전부. 0 개인 오행도 빠지지 않는다(없다는 사실이 정보다).
    for (const c of chart.elementCounts) {
      expect(screen.getAllByText(`${c.element} ${c.count}`).length).toBe(1);
    }
  });

  it('⚠ 대운·세운은 어디에도 없다', async () => {
    await show(detail(await chartOf()));
    expect(document.body.textContent ?? '').not.toMatch(/대운|세운|운성|신살/);
  });

  it('시각을 모르면 시주 자리가 비고, 스크린리더가 그 사실을 읽는다', async () => {
    const chart = await chartOf({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    expect(chart.hourKnown).toBe(false);
    await show(detail(chart));

    expect(screen.getByText('시각 미상')).toBeTruthy();
    expect(
      screen.getByLabelText('시주 없음 — 태어난 시각을 몰라 세우지 않았습니다'),
    ).toBeTruthy();
  });

  it('명식이 없으면 표를 그리지 않는다 — 빈 표가 아니라 없음', async () => {
    await show(detail(null));
    expect(screen.queryByText('명식 (사주 원국)')).toBeNull();
    expect(screen.getByText('본문입니다.')).toBeTruthy();
  });
});

describe('유명인 상세 — 고지', () => {
  it('본문 위·아래 두 곳에 서로 다른 문장으로 놓인다', async () => {
    await show(detail(await chartOf()));
    const text = document.body.textContent ?? '';
    expect(text).toContain(FAMOUS_NATURE_NOTICE);
    expect(text).toContain(FAMOUS_NATURE_NOTICE_FOOTER);
    // 같은 문장을 두 번 붙여 놓은 것이 아니다.
    expect(FAMOUS_NATURE_NOTICE).not.toBe(FAMOUS_NATURE_NOTICE_FOOTER);
    // 위쪽 고지는 본문보다 먼저 나온다.
    expect(text.indexOf(FAMOUS_NATURE_NOTICE)).toBeLessThan(text.indexOf('본문입니다.'));
    expect(text.indexOf(FAMOUS_NATURE_NOTICE_FOOTER)).toBeGreaterThan(text.indexOf('본문입니다.'));
  });

  it('시각을 아는 경우와 모르는 경우의 문구가 다르다', async () => {
    await show(detail(await chartOf()));
    const known = document.body.textContent ?? '';

    const unknownChart = await chartOf({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    await show(detail(unknownChart));
    const unknown = document.body.textContent ?? '';

    expect(known).not.toBe(unknown);
    expect(unknown).toMatch(/시각/);
  });

  it('출처 설명이 있으면 함께 보인다', async () => {
    await show(detail(await chartOf()));
    expect(screen.getByText('인터뷰 발언을 근거로 정리했습니다.')).toBeTruthy();
  });
});

describe('유명인 상세 — 레이아웃', () => {
  it.each([320, 360, 393, 480])('%idp 에서 넘치는 고정 폭이 없다', async (w) => {
    await show(detail(await chartOf()), w);
    expect(fixedWidthsOver(document.body, w)).toEqual([]);
    expect(nowrapLongText(document.body)).toEqual([]);
  });
});
