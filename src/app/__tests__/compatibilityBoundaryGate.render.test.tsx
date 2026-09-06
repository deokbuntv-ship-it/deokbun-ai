// 궁합 절기 경계일 게이트 — 결제 앞으로 당겨 온 판정 (2026-09-06).
//
// ⚠ 왜 경고가 아니라 차단인가 (실측): 궁합 서버는 두 사람의 차트가 **둘 다 없어도** 실패하지 않는다.
// `buildCompatibilityConsultation` 을 실제로 돌려 보면 경계일+시각 모름에서 `ok:true`, LLM 1콜,
// `grounded:false` 로 답이 만들어지고 **12덕이 청구된다**. 솔로 상담은 명리가 안 서도 기문이 답할 여지가
// 있어 "경고 후 진행" 이 말이 되지만, 궁합의 pairwise 근거는 두 차트를 모두 요구해 부분 성립이 없다.
// 그래서 화면 쪽에서 막는다. 상세는 `PROJECT_STATE.md` §7.29 · `KNOWN_RISKS.md` H6.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

// 하네스가 이미 expo-router 를 mock 하고 그 router 를 export 한다 — 다시 mock 하면
// requireActual 이 실제 모듈(PNG import 포함)을 끌고 와 스위트가 파싱 단계에서 죽는다.
import { routerMock } from '../../../jest.render.setup';

const push = routerMock.push;

jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));
const WALLET = { state: { totalSpendable: 200 }, loading: false, error: null, refresh: jest.fn().mockResolvedValue(undefined) };
jest.mock('@/features/duk/useWallet', () => ({ __esModule: true, useWallet: () => WALLET, refreshWallet: () => Promise.resolve() }));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false, nextAvailableAtEpoch: null, rewardAmount: 1 }),
}));
jest.mock('@/features/compatibility/services/pendingCompatibilitySubject', () => ({
  __esModule: true,
  consumePendingCompatibilitySubjectId: () => null,
}));

// ⚠ mock 이 돌려주는 배열은 **모듈 상수**여야 한다. 매 렌더 새 배열이면 무한 리렌더로 테스트가 멈춘다.
let SUBJECTS: unknown[] = [];
jest.mock('@/features/consultation', () => {
  const actual = jest.requireActual('@/features/consultation');
  return {
    ...actual,
    __esModule: true,
    useConsultationSubjects: () => ({ subjects: SUBJECTS, status: 'ready', reload: jest.fn() }),
  };
});

import { resolveWithKasiCalendar } from '@/features/interpretation';

import CompatibilityScreen from '../(tabs)/compatibility';

// 1996-10-08 = 寒露 경계일 (REG4-SUBJ-10, V8 Blind-84 의 앵커 케이스).
const birth = (over: Record<string, unknown> = {}) => ({
  displayName: '사람', gender: 'female', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1992', birthMonth: '5', birthDay: '20',
  birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '30',
  approximateTimePeriod: null, birthPlace: '서울', ...over,
});
const BOUNDARY = { birthYear: '1996', birthMonth: '10', birthDay: '8' };
const subject = (id: string, name: string, isSelf: boolean, b: Record<string, unknown>) => ({
  id, userId: 'u1', displayName: name, relationship: isSelf ? '본인' : '친구', isSelf,
  birthInfo: birth(b), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
});

// 같은 solar 경계일로 변환되는 음력 입력 — 엔진에서 직접 뽑는다(하드코딩 금지).
const lunarBoundary = () => {
  const r = resolveWithKasiCalendar({ year: 1996, month: 10, day: 8, calendar: 'GREGORIAN' });
  if (r.status !== 'RESOLVED') throw new Error('fixture date must resolve');
  return {
    calendarType: 'lunar',
    lunarMonthType: r.lunarDate.lunarMonthKind === 'LEAP' ? 'leap' : 'regular',
    birthYear: String(r.lunarDate.year), birthMonth: String(r.lunarDate.month), birthDay: String(r.lunarDate.day),
    birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null,
  };
};

const SELF_OK = subject('s1', '조세영', true, {});
const pair = (targetBirth: Record<string, unknown>, selfBirth: Record<string, unknown> = {}) => [
  Object.keys(selfBirth).length > 0 ? subject('s1', '조세영', true, selfBirth) : SELF_OK,
  subject('t1', '박상대', false, targetBirth),
];

const CTA = /으로 궁합 보기/;

beforeEach(() => {
  setViewport(360);
  push.mockClear();
  SUBJECTS = pair({});
});

const openAndSelect = async () => {
  const out = render(<CompatibilityScreen />);
  await waitFor(() => expect(screen.getByLabelText('박상대 선택')).toBeInTheDocument());
  await act(async () => { fireEvent.click(screen.getByLabelText('박상대 선택')); });
  return out;
};

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('⚠ 판정 — 뜰 때와 안 뜰 때', () => {
  it('상대가 경계일 + 시각 모름 → 안내가 뜨고 결제 버튼이 잠긴다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    await openAndSelect();
    expect(screen.getByText(/태어난 시각을 알아야 궁합을 볼 수 있어요/)).toBeInTheDocument();
    expect(screen.getByText(/박상대 님의/)).toBeInTheDocument();
    expect(screen.getByText(CTA).closest('div[aria-disabled="true"], [aria-disabled="true"]')).toBeTruthy();
  });

  it('⚠ 대략적인 시간대도 막힌다 — 엔진은 approximate 를 unknown 과 똑같이 다룬다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'approximate', birthHour: null, birthMinute: null, approximateTimePeriod: 'morning' });
    await openAndSelect();
    expect(screen.getByText(/태어난 시각을 알아야 궁합을 볼 수 있어요/)).toBeInTheDocument();
  });

  it('본인이 경계일이어도 막힌다 — 궁합은 두 차트가 다 필요하다', async () => {
    SUBJECTS = pair({}, { ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    await openAndSelect();
    expect(screen.getByText(/조세영 님의/)).toBeInTheDocument();
  });

  it('둘 다 경계일이면 두 사람 이름이 모두 나온다', async () => {
    SUBJECTS = pair(
      { ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null },
      { ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null },
    );
    await openAndSelect();
    expect(screen.getByText(/조세영 님과 박상대 님의/)).toBeInTheDocument();
  });

  it('경계일이지만 시각이 정확하면 안 뜬다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '30' });
    await openAndSelect();
    expect(screen.queryByText(/태어난 시각을 알아야/)).not.toBeInTheDocument();
  });

  it('경계일이 아니면 시각을 몰라도 안 뜬다 — 궁합은 시각 없이도 볼 수 있다', async () => {
    SUBJECTS = pair({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    await openAndSelect();
    expect(screen.queryByText(/태어난 시각을 알아야/)).not.toBeInTheDocument();
  });

  it('음력으로 같은 경계일을 입력해도 잡힌다', async () => {
    SUBJECTS = pair(lunarBoundary());
    await openAndSelect();
    expect(screen.getByText(/태어난 시각을 알아야 궁합을 볼 수 있어요/)).toBeInTheDocument();
  });

  it('상대를 고르기 전에는 상대 때문에 막지 않는다 — 본인만 본다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    render(<CompatibilityScreen />);
    await waitFor(() => expect(screen.getByLabelText('박상대 선택')).toBeInTheDocument());
    expect(screen.queryByText(/태어난 시각을 알아야/)).not.toBeInTheDocument();
  });
});

describe('갈림길 — 막다른 길이 아니다', () => {
  it('[태어난 시각 입력하기] 가 그 사람의 출생정보 화면으로 보낸다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    await openAndSelect();
    await act(async () => { fireEvent.click(screen.getByText('태어난 시각 입력하기')); });
    expect(push).toHaveBeenCalledWith({ pathname: '/birth-info', params: { subjectId: 't1', origin: 'compatibility' } });
  });

  it('⚠ 두 번째 버튼을 일부러 두지 않았다 — 상대 목록이 이미 대안이다', async () => {
    // "다른 분과 보기" 는 목록을 누르면 되는 일을 버튼으로 만든 것이고, 좋아하는 사람과 궁합을 보려는
    // 맥락에서는 포기를 권하는 말로 읽힌다. 앞으로 가는 길은 시각, 옆으로 가는 길은 이미 화면에 있다.
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    await openAndSelect();
    expect(screen.queryByText(/다른 분과|나중에/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('박상대 선택')).toBeInTheDocument(); // 목록은 그대로 살아 있다
  });
});

describe('레이아웃·접근성', () => {
  it('360dp — 안내가 넘치지 않는다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    const { container } = await openAndSelect();
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });

  it('이름 없는 상호작용 요소가 없다', async () => {
    SUBJECTS = pair({ ...BOUNDARY, birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });
    const { container } = await openAndSelect();
    const nameless = Array.from(container.querySelectorAll<HTMLElement>('[role="button"], button'))
      .filter((el) => !(el.getAttribute('aria-label') || el.textContent || '').trim());
    expect(nameless).toEqual([]);
  });
});
