// 가상 인물 표시가 **독자 눈에 보이는가** (지시서 3-6).
//
// WHY THIS EXISTS. `famous_profiles` 에는 "가상 인물" 전용 플래그가 **없다.** 표시 수단은
// `category` · `occupation` · `short_description` · `birth_source_note` 네 칸뿐이고, 그것이
// 실제로 화면에 그려지는지는 지난 런북에서 **확인하지 않은 채 남아 있었다**
// (`docs/OWNER_RUNBOOK_2026-09-10.md` §5-3: "공개 페이지에 그 표시가 실제로 노출되는지는
// 확인하지 않았습니다"). 실존 인물로 오해되면 그건 사람에 대한 거짓 서술이다.
//
// ⚠ 이 파일은 발행된 HTML 한 장을 눈으로 보는 것보다 강하다. 한 번 보고 넘어가는 확인이
//   아니라, 렌더 경로가 그 네 칸을 떨어뜨리면 **다시 빨개진다.**
//
// ⚠ staging 에 실제로 발행하지는 못했다 — 관리자 로그인 수단이 없고, 지시서가 테스트 전용
//   우회 로그인을 금지한다. 그래서 발행 대신 **같은 행 모양을 합성해** 렌더를 검사한다.
import { render, screen, waitFor, cleanup } from '@testing-library/react';

import { buildFamousChart } from '@/features/famous/server/famousChart';

(globalThis as Record<string, unknown>).__routeParams = { slug: 'fictional-demo-1' };

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

const deps = { digestProvider: { async sha256Utf8() { return 'a'.repeat(64); } } };

// ⚠ `docs/OWNER_RUNBOOK_2026-09-10.md` §5-1 의 표와 **글자까지 같은 값**이다.
//   런북이 시키는 대로 넣었을 때 무엇이 보이는지를 재는 것이 이 파일의 목적이다.
const FICTIONAL = {
  slug: 'fictional-demo-1',
  name: '예시인 하나',
  category: '가상 예시',
  occupation: '가상 인물 (예시)',
  shortDescription: '실존하지 않는 가상 인물입니다. 명식 해설 파이프라인 확인용으로 만들었습니다.',
  birthSource: 'estimated',
  birthSourceNote: '⚠ 가상 인물입니다. 실존 인물이 아니며, 생년월일시는 예시로 지어낸 값입니다.',
  bio: '## 일간\n\n본문입니다.',
  seoTitle: null, seoDescription: null, canonicalUrl: null,
  indexPolicy: 'index',
  publishedAt: '2026-09-10T00:00:00Z',
  related: [],
};

async function show(over: Record<string, unknown> = {}) {
  cleanup();
  const r = await buildFamousChart({
    displayName: '예시인 하나', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1993', birthMonth: '4', birthDay: '17',
    birthTimeAccuracy: 'exact', birthHour: '10', birthMinute: '25',
    approximateTimePeriod: null, birthPlace: '전주',
  } as never, deps);
  if (!r.ok) throw new Error(`chart failed: ${r.detail}`);
  DETAIL = { ...FICTIONAL, chart: r.snapshot, ...over };
  render(<FamousDetailScreen />);
  await waitFor(() => expect(screen.getByText('예시인 하나')).toBeTruthy());
  return document.body.textContent ?? '';
}

describe('가상 인물 — 표시가 화면에 보인다', () => {
  it('⚠ "가상" 이라는 말이 본문을 읽기 전에 나온다', async () => {
    const text = await show();
    // 세 칸이 전부 그려져야 한다. 하나라도 빠지면 실존 인물로 읽힐 여지가 생긴다.
    expect(text).toContain('가상 인물 (예시)');
    expect(text).toContain('실존하지 않는 가상 인물입니다');
    expect(text).toContain('실존 인물이 아니며');
  });

  it('⚠ 고지가 본문보다 위에 있다 — 읽고 나서 알게 되면 늦다', async () => {
    const text = await show();
    const notice = text.indexOf('실존하지 않는 가상 인물입니다');
    const body = text.indexOf('본문입니다');
    expect(notice).toBeGreaterThanOrEqual(0);
    expect(body).toBeGreaterThan(notice);
  });

  it('출생정보가 지어낸 값이라는 것이 출처 메모로 보인다', async () => {
    const text = await show();
    expect(text).toContain('생년월일시는 예시로 지어낸 값입니다');
  });

  it('⚠ 네 칸 중 하나라도 비면 "가상" 이라는 말이 사라진다 — 표시 수단이 이것뿐이라는 증거', async () => {
    const text = await show({ occupation: null, shortDescription: null, birthSourceNote: null });
    // 스키마에 가상 인물 플래그가 없으므로, 칸을 비우면 화면에 단서가 남지 않는다.
    // 이 사실을 테스트로 박아 둔다 — 나중에 플래그가 생기면 이 테스트가 먼저 깨진다.
    expect(text).not.toContain('가상');
  });

  it('noindex 정책이면 robots 메타가 붙는다', async () => {
    await show({ indexPolicy: 'noindex' });
    // expo-router/head 는 jsdom 에서 document.head 로 흘려보낸다.
    await waitFor(() =>
      expect(document.head.querySelector('meta[name="robots"][content="noindex"]')).not.toBeNull());
  });

  it('index 정책이면 noindex 가 붙지 않는다', async () => {
    await show();
    expect(document.head.querySelector('meta[name="robots"][content="noindex"]')).toBeNull();
  });
});
