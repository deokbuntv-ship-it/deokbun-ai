// 잔여 화면 스모크 — 아직 렌더 검증이 없던 9개.
//
// **선정 근거**: 남은 라우트를 ① 사용자가 실제로 도달하는가 ② 실패했을 때 무엇을 잃는가 로 골랐다.
//   · `subjects` `subject-history` `records` `life-events` — 대상자·기록 계열. 데이터가 쌓인 사용자가
//     매번 지난다. 빈 상태를 오류처럼 보여 주면 "내 기록이 사라졌다" 로 읽힌다
//   · `notifications` `notification-settings` — 푸시 개통 후 첫 진입 지점
//   · `subject-manse` — 만세력. 엔진 출력을 그대로 보여 주는 유일한 소비자 화면
//   · 정책 4종 중 `privacy-policy` `terms-of-service` — **약관 화면의 [보기] 가 실제로 여는 문서**
//     (열 수 없는 문서에 동의시키지 않는다는 계약의 반대쪽 끝)
// **뺀 것**: `ai-notice` `duk-policy` `minor-policy` `refund-policy` 는 privacy/terms 와 같은 정적
// 문서 컴포넌트라 하나가 되면 나머지도 된다. `login-callback` 은 화면이 아니라 리다이렉트 처리다.
//
// 깊이보다 넓이를 택한 파일이다: 크래시 · 상태 분기 · 360dp · 접근성 계약만 본다.
// 깊은 상호작용은 각 화면이 트래픽을 얻을 때 별도 파일로.
import type { ComponentType } from 'react';

import { render, screen, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const listSubjects = jest.fn();
const listReports = jest.fn();
const listConversations = jest.fn();

jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1', email: 'a@b.com' } } }),
}));
const SELF = {
  id: 'subj-self', displayName: '나', relationship: '본인', isSelf: true,
  birthInfo: {
    displayName: '나', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1994', birthMonth: '5', birthDay: '20',
    birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '30',
    approximateTimePeriod: null, birthPlace: '서울',
  },
};
const SUBJECTS = [SELF];
jest.mock('@/features/consultation', () => {
  const actual = jest.requireActual('@/features/consultation');
  return {
    ...actual,
    __esModule: true,
    useConsultationSubjects: () => ({ subjects: listSubjects() ?? SUBJECTS, status: 'ready', reload: jest.fn() }),
    useConsultationDraft: () => ({ draft: { subject: SELF }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  };
});
jest.mock('@/features/chat/report/reportService', () => ({
  __esModule: true,
  reportService: { listReports: () => listReports(), listReportsByType: () => listReports(), loadReport: () => Promise.resolve(null) },
}));
jest.mock('@/features/chat', () => {
  const actual = jest.requireActual('@/features/chat');
  return { ...actual, __esModule: true, conversationService: { listConversationsForSubject: () => listConversations(), listConversations: () => listConversations() } };
});
// ⚠ 훅이 돌려주는 함수는 **모듈 상수**여야 한다. 매 렌더마다 새 jest.fn() 을 주면 의존성 배열이
// 계속 바뀌어 화면이 무한 리렌더에 빠진다(이 파일에서 notifications 가 10초 타임아웃으로 멈췄다).
const UNREAD = { unreadCount: 0, refresh: jest.fn(), markOneRead: jest.fn(), markAllRead: jest.fn() };
const notifItems: unknown[] = [];
jest.mock('@/features/retention', () => {
  const actual = jest.requireActual('@/features/retention');
  return {
    ...actual,
    __esModule: true,
    useNotificationUnread: () => UNREAD,
    inAppNotificationService: { list: () => Promise.resolve(notifItems), markRead: jest.fn() },
  };
});

import LifeEventsScreen from '../life-events';
import NotificationSettingsScreen from '../notification-settings';
import NotificationsScreen from '../notifications';
import PrivacyPolicyScreen from '../privacy-policy';
import RecordsScreen from '../records';
import SubjectHistoryScreen from '../subject-history';
import SubjectManseScreen from '../subject-manse';
import SubjectsScreen from '../subjects';
import TermsOfServiceScreen from '../terms-of-service';

const SCREENS: [string, ComponentType][] = [
  ['대상자 관리 (subjects)', SubjectsScreen],
  ['대상자 기록 (subject-history)', SubjectHistoryScreen],
  ['만세력 (subject-manse)', SubjectManseScreen],
  ['인생 사건 (life-events)', LifeEventsScreen],
  ['알림함 (notifications)', NotificationsScreen],
  ['알림 설정 (notification-settings)', NotificationSettingsScreen],
  ['개인정보 처리방침', PrivacyPolicyScreen],
  ['이용약관', TermsOfServiceScreen],
];

beforeEach(() => {
  setViewport(360);
  (globalThis as Record<string, unknown>).__routeParams = { subjectId: 'subj-self', id: 'x' };
  listSubjects.mockReset().mockReturnValue(SUBJECTS);
  listReports.mockReset().mockResolvedValue([]);
  listConversations.mockReset().mockResolvedValue([]);
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe.each(SCREENS)('%s', (name, Screen) => {
  it('크래시 없이 마운트되고 무언가를 그린다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<Screen />)); });
    await act(async () => {});
    expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it('360dp — 넘치도록 선언된 폭이 없다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<Screen />)); });
    await act(async () => {});
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });

  it('접근 이름 없는 상호작용 요소가 없다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<Screen />)); });
    await act(async () => {});
    const nameless = Array.from(container.querySelectorAll('[role="button"], input, textarea'))
      .filter((el) => !el.getAttribute('aria-label') && !(el.textContent ?? '').trim())
      .map((el) => el.tagName.toLowerCase());
    expect(nameless).toEqual([]);
  });
});

describe('빈 상태가 오류로 보이지 않는다', () => {
  it('⚠ records 는 화면이 아니라 /inbox 로 가는 리다이렉트다', async () => {
    await act(async () => { render(<RecordsScreen />); });
    expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/inbox');
  });

  it('알림함이 비어도 마찬가지다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<NotificationsScreen />)); });
    await act(async () => {});
    expect(container.textContent ?? '').not.toMatch(/불러오지 못했|오류가|실패했/);
  });
});

describe('⚠ 약관 [보기] 가 여는 문서가 실제로 그려진다', () => {
  it('개인정보 처리방침에 본문이 있다', async () => {
    await act(async () => { render(<PrivacyPolicyScreen />); });
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(200));
  });

  it('이용약관에 본문이 있다', async () => {
    await act(async () => { render(<TermsOfServiceScreen />); });
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(200));
  });

  // ⚠ 2026-09-10 — **뒤집은 단언.** 전에는 "탈퇴 조항이 **없다**" 를 확인만 하는 테스트였고
  //   주석이 "이 단언이 깨지면 = 조항이 생겼다는 뜻이므로 그때 D5 를 닫으면 된다" 고 적어 두었다.
  //   조항이 생겼으므로 그대로 따른다. 이제는 **있어야** 통과한다.
  it('⚠ 이용약관에 탈퇴 조항이 있다 (OWNER_TODO D5 닫힘)', async () => {
    await act(async () => { render(<TermsOfServiceScreen />); });
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(200));
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/회원\s*탈퇴/);
    // 조항이 **무엇을 말하는가** 까지 본다. 제목만 있고 알맹이가 없으면 없는 것과 같다.
    expect(body).toContain('계정 탈퇴');                 // 앱 내 경로
    expect(body).toContain('/account-deletion');         // 앱이 없을 때 볼 웹 주소
    expect(body).toMatch(/전자상거래/);                   // 보존 근거 법령
    expect(body).toMatch(/\[법률 검토/);                  // 확정 못 한 것을 확정한 척하지 않는다
    expect(body).toMatch(/\[오너 결정 · 법률 검토 필요: 유료 구매 덕의 탈퇴 시 처리\]/); // 빈칸으로 남긴 것
  });
});
