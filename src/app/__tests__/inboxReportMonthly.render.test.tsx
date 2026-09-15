// 운세우편함 · 이번 달 운세 · 리포트 상세 — 결과를 다시 보는 세 화면.
//
// 셋 다 "여러 소스를 모아 보여 준다"는 성격이 같아 한 파일에 뒀다. 공통 관심사: 빈 상태를 오류처럼
// 보이지 않게 하는가, 소유자가 아닌 리포트를 어떻게 막는가, 월별에도 절기 게이트가 붙어 있는가.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const listAllToday = jest.fn();
const listAllMonthly = jest.fn();
const ensureMonth = jest.fn();
const listReports = jest.fn();
const getReport = jest.fn();

jest.mock('@/features/today', () => {
  const actual = jest.requireActual('@/features/today');
  return { ...actual, __esModule: true, todayFortuneService: { listAll: () => listAllToday() }, trackTodayEvent: jest.fn() };
});
jest.mock('@/features/monthly', () => {
  const actual = jest.requireActual('@/features/monthly');
  return {
    ...actual, __esModule: true,
    monthlyFortuneService: { listAll: () => listAllMonthly(), ensureCurrentMonth: (a: unknown) => ensureMonth(a) },
    trackMonthlyEvent: jest.fn(),
  };
});
jest.mock('@/features/chat/report/reportService', () => ({
  __esModule: true,
  reportService: { listReportsByType: (t: string) => listReports(t), loadReport: (id: string) => getReport(id) },
}));

let authStatus: 'authenticated' | 'unauthenticated' | 'loading' = 'authenticated';
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: authStatus === 'authenticated', authState: { status: authStatus, user: { id: 'u1' } } }),
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
const BOUNDARY_SELF = {
  ...SELF,
  birthInfo: { ...SELF.birthInfo, birthYear: '1996', birthMonth: '10', birthDay: '8', birthTimeAccuracy: 'unknown', birthHour: '', birthMinute: '' },
};
let subjects: unknown[] = [SELF];
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationSubjects: () => ({ subjects, status: 'ready', reload: jest.fn() }),
  useConsultationDraft: () => ({ draft: { subject: subjects[0] ?? null }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  setPendingConsultationIntent: jest.fn(),
  isSavedSubjectId: () => true,
}));
jest.mock('@/features/retention', () => {
  const actual = jest.requireActual('@/features/retention');
  return { ...actual, __esModule: true, useNotificationUnread: () => ({ unreadCount: 0, refresh: jest.fn() }) };
});

import { routerMock } from '../../../jest.render.setup';
import InboxScreen from '../(tabs)/inbox';
import MonthlyScreen from '../monthly';
import ReportDetailScreen from '../report/[id]';

beforeEach(() => {
  setViewport(360);
  authStatus = 'authenticated';
  subjects = [SELF];
  (globalThis as Record<string, unknown>).__routeParams = { id: 'rep-1' };
  listAllToday.mockReset().mockResolvedValue([]);
  listAllMonthly.mockReset().mockResolvedValue([]);
  ensureMonth.mockReset().mockResolvedValue({ status: 'unavailable' });
  listReports.mockReset().mockResolvedValue([]);
  getReport.mockReset().mockResolvedValue(null);
  routerMock.push.mockClear();
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('운세우편함', () => {
  it('전부 비어 있어도 오류가 아니라 "아직 없어요" 로 말한다', async () => {
    await act(async () => { render(<InboxScreen />); });
    await waitFor(() => expect(screen.getByText('아직 받은 운세가 없어요')).toBeInTheDocument());
    expect(document.body.textContent).not.toMatch(/불러오지 못했|오류|실패/);
  });

  it('한 소스가 실패해도 화면이 남는다', async () => {
    listAllToday.mockRejectedValue(new Error('down'));
    listReports.mockRejectedValue(new Error('down'));
    await act(async () => { render(<InboxScreen />); });
    await waitFor(() => expect(screen.getByText('운세우편함')).toBeInTheDocument());
  });

  it('보고서 섹션으로 전환하면 빈 안내를 준다 — 기본 섹션은 운세다', async () => {
    await act(async () => { render(<InboxScreen />); });
    await waitFor(() => expect(screen.getByText('아직 받은 운세가 없어요')).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText('보고서')); });
    await waitFor(() => expect(screen.getByText('아직 저장된 상담 보고서가 없어요.')).toBeInTheDocument());
    expect(listReports).toHaveBeenCalledWith('consultation');
  });

  it('360dp', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(<InboxScreen />)); });
    await waitFor(() => expect(screen.getByText('운세우편함')).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});

describe('이번 달 운세', () => {
  it('로딩 상태가 보인다', () => {
    ensureMonth.mockReturnValue(new Promise(() => {}));
    render(<MonthlyScreen />);
    expect(screen.getByText('이번 달 운세')).toBeInTheDocument();
  });

  it('⚠ 절기 경계일 계정은 여기서도 전용 안내를 받는다 — 오늘·홈에 이은 네 번째 자리', async () => {
    subjects = [BOUNDARY_SELF];
    ensureMonth.mockResolvedValue({ status: 'unavailable' });
    await act(async () => { render(<MonthlyScreen />); });
    await waitFor(() => expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument());
  });

  it('비로그인은 로그인으로 간다', async () => {
    authStatus = 'unauthenticated';
    ensureMonth.mockResolvedValue({ status: 'auth' });
    await act(async () => { render(<MonthlyScreen />); });
    await waitFor(() => expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/login'));
  });
});

describe('리포트 상세', () => {
  it('비로그인은 본문 대신 로그인으로 간다', () => {
    authStatus = 'unauthenticated';
    render(<ReportDetailScreen />);
    expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/login');
    expect(getReport).not.toHaveBeenCalled();
  });

  it('⚠ 없는 id / 남의 리포트는 같은 "찾을 수 없어요" — 존재 여부를 알려주지 않는다', async () => {
    getReport.mockResolvedValue(null);
    await act(async () => { render(<ReportDetailScreen />); });
    await waitFor(() => expect(screen.getByText('보고서를 찾을 수 없어요.')).toBeInTheDocument());
  });

  it('조회 실패도 같은 화면으로 수렴한다', async () => {
    getReport.mockRejectedValue(new Error('net'));
    await act(async () => { render(<ReportDetailScreen />); });
    await waitFor(() => expect(screen.getByText('보고서를 찾을 수 없어요.')).toBeInTheDocument());
  });
});
