// 상담 · 보고서 삭제 (2026-09-13 오너 결정 · CTO 판정) — 화면에서 찾아 누를 수 있고, 무엇이 지워지고
// 무엇이 남는지를 **먼저** 말하고, 서버가 한 행을 지웠다고 답할 때만 목록에서 뺀다.
//
// ⚠ 실제 삭제(트리거가 원문을 지우고 공유를 해지하는 것)는 staging 실측이 했다(보고서 2026-09-13).
//   여기서 재는 것은 **사용자가 보는 흐름**이다.
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';

import { PREMIUM_PAYLOAD } from './premiumFixture';

const listConversations = jest.fn();
const deleteConversation = jest.fn();
const loadReport = jest.fn();
const deleteReport = jest.fn();

jest.mock('@/features/chat', () => {
  const actual = jest.requireActual('@/features/chat');
  return {
    ...actual,
    __esModule: true,
    conversationService: {
      listConversationsForSubject: () => listConversations(),
      deleteConversation: (id: string) => deleteConversation(id),
    },
  };
});
jest.mock('@/features/chat/report/reportService', () => ({
  __esModule: true,
  reportService: { loadReport: (id: string) => loadReport(id), deleteReport: (id: string) => deleteReport(id) },
}));
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationDraft: () => ({ draft: { subject: null }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  isSavedSubjectId: () => true,
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));
// ⚠ 훅이 돌려주는 값은 모듈 상수여야 한다(매 렌더 새 객체면 의존성 배열이 바뀌어 무한 리렌더).
const UNREAD = { unreadCount: 0, refresh: jest.fn(), markOneRead: jest.fn(), markAllRead: jest.fn() };
jest.mock('@/features/retention', () => {
  const actual = jest.requireActual('@/features/retention');
  return { ...actual, __esModule: true, useNotificationUnread: () => UNREAD };
});

import { routerMock } from '../../../jest.render.setup';
import SubjectHistoryScreen from '../subject-history';
import ReportDetailScreen from '../report/[id]';

const snapshot = (name: string) => ({ subject: { id: 's1', displayName: name, relationship: '본인' }, birthInfo: null });
const ITEMS = [
  { id: 'c1', createdAt: '2026-09-10T00:00:00Z', updatedAt: '2026-09-10T00:00:00Z', summary: '이직 이야기', subjectSnapshot: snapshot('나') },
  { id: 'c2', createdAt: '2026-09-11T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z', summary: '연애 이야기', subjectSnapshot: snapshot('나') },
];
const byLabel = (label: string) => document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
const text = () => document.body.textContent ?? '';

beforeEach(() => {
  jest.clearAllMocks();
  listConversations.mockResolvedValue(ITEMS);
});
afterEach(cleanup);

describe('상담 기록 — 삭제', () => {
  const openHistory = async () => {
    (globalThis as Record<string, unknown>).__routeParams = { subjectId: 's1' };
    await act(async () => { render(<SubjectHistoryScreen />); });
    await waitFor(() => expect(text()).toContain('이직 이야기'));
  };

  it('항목마다 삭제 입구가 있다 — 이름·날짜로 구분되는 라벨', async () => {
    await openHistory();
    expect(byLabel('나 2026-09-10 상담 삭제')).not.toBeNull();
    expect(byLabel('나 2026-09-11 상담 삭제')).not.toBeNull();
  });

  it('누르면 무엇이 지워지고 무엇이 남는지부터 보여 준다 — 아직 지우지 않는다', async () => {
    await openHistory();
    fireEvent.click(byLabel('나 2026-09-10 상담 삭제') as HTMLElement);
    expect(text()).toContain('이 상담을 삭제할까요?');
    expect(text()).toContain('대화 내용과 이 상담의 답변이 지워져요. 되돌릴 수 없어요.');
    expect(text()).toContain('이 상담으로 만든 보고서는 운세우편함에 남아요. 보고서는 따로 삭제할 수 있어요.');
    expect(text()).toContain('보고서를 공유했다면 그 링크는 더 이상 열리지 않아요.');
    expect(deleteConversation).not.toHaveBeenCalled();
  });

  it('⚠ 삭제를 눌러도 상담이 열리지 않는다 (열기와 삭제는 따로)', async () => {
    await openHistory();
    fireEvent.click(byLabel('나 2026-09-10 상담 삭제') as HTMLElement);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('확인하면 그 대화를 지우고, 한 행이 지워졌을 때만 목록에서 뺀다', async () => {
    deleteConversation.mockResolvedValue(true);
    await openHistory();
    fireEvent.click(byLabel('나 2026-09-10 상담 삭제') as HTMLElement);
    await act(async () => { fireEvent.click(screen.getByText('삭제')); });
    expect(deleteConversation).toHaveBeenCalledWith('c1');
    await waitFor(() => expect(text()).not.toContain('이직 이야기'));
    expect(text()).toContain('연애 이야기');
  });

  it('⚠ 서버가 지우지 못하면 목록에 그대로 두고 알린다', async () => {
    deleteConversation.mockResolvedValue(false);
    await openHistory();
    fireEvent.click(byLabel('나 2026-09-10 상담 삭제') as HTMLElement);
    await act(async () => { fireEvent.click(screen.getByText('삭제')); });
    await waitFor(() => expect(text()).toContain('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'));
    expect(text()).toContain('이직 이야기');
  });

  it('취소하면 아무것도 지우지 않는다', async () => {
    await openHistory();
    fireEvent.click(byLabel('나 2026-09-10 상담 삭제') as HTMLElement);
    fireEvent.click(screen.getByText('취소'));
    expect(deleteConversation).not.toHaveBeenCalled();
    expect(text()).toContain('이직 이야기');
  });
});

describe('보고서 — 삭제', () => {
  const CONSULT = {
    id: 'r1', conversationId: 'c1', title: '이직 상담 보고서', reportType: 'consultation',
    createdAt: '2026-09-12T00:00:00Z', updatedAt: null,
    payload: {
      title: '이직 상담 보고서', generatedAt: '2026-09-12T00:00:00Z', summary: '결론 문장입니다.',
      keyFindings: ['핵심 하나'], cautions: ['주의 하나'], coveredTopics: ['올해 이직해도 될까요?'],
    },
  };
  const PREMIUM = {
    id: 'r2', conversationId: null, title: '프리미엄 리포트', reportType: 'premium',
    createdAt: '2026-09-12T00:00:00Z', updatedAt: null, payload: PREMIUM_PAYLOAD,
  };
  const openReport = async (report: unknown) => {
    (globalThis as Record<string, unknown>).__routeParams = { id: (report as { id: string }).id };
    loadReport.mockResolvedValue(report);
    await act(async () => { render(<ReportDetailScreen />); });
  };

  it('보고서 상세에 삭제 입구가 있다 (공유 옆)', async () => {
    await openReport(CONSULT);
    await waitFor(() => expect(text()).toContain('보고서 공유하기'));
    expect(screen.getByText('보고서 삭제')).toBeInTheDocument();
  });

  it('확인 시트 — 공유 링크도 함께 지워지고, 원래 상담 기록은 남는다', async () => {
    await openReport(CONSULT);
    await waitFor(() => expect(text()).toContain('보고서 삭제'));
    fireEvent.click(screen.getByText('보고서 삭제'));
    expect(text()).toContain('이 보고서를 삭제할까요?');
    expect(text()).toContain('보고서와 공유 링크가 함께 지워져요. 되돌릴 수 없어요.');
    expect(text()).toContain('링크를 받은 사람도 더 이상 볼 수 없어요.');
    expect(text()).toContain('원래 상담 기록은 그대로 남아요.');
    expect(deleteReport).not.toHaveBeenCalled();
  });

  it('⚠ 프리미엄 — 산 리포트라 다시 보려면 새로 사야 한다는 것까지 · 원래 상담이 없으면 그 줄은 없다', async () => {
    await openReport(PREMIUM);
    await waitFor(() => expect(text()).toContain('리포트 삭제'));
    fireEvent.click(screen.getByText('리포트 삭제'));
    expect(text()).toContain('이 리포트를 삭제할까요?');
    expect(text()).toContain('프리미엄 리포트는 지운 뒤 다시 보려면 새로 구매해야 해요.');
    expect(text()).not.toContain('원래 상담 기록은 그대로 남아요.');
  });

  it('확인 → 한 행이 지워졌을 때만 우편함으로 돌아간다', async () => {
    deleteReport.mockResolvedValue(true);
    await openReport(CONSULT);
    await waitFor(() => expect(text()).toContain('보고서 삭제'));
    fireEvent.click(screen.getByText('보고서 삭제'));
    await act(async () => { fireEvent.click(screen.getByText('삭제')); });
    expect(deleteReport).toHaveBeenCalledWith('r1');
    expect(routerMock.replace).toHaveBeenCalledWith('/inbox');
  });

  it('⚠ 실패하면 그 화면에 머무르고 알린다', async () => {
    deleteReport.mockResolvedValue(false);
    await openReport(CONSULT);
    await waitFor(() => expect(text()).toContain('보고서 삭제'));
    fireEvent.click(screen.getByText('보고서 삭제'));
    await act(async () => { fireEvent.click(screen.getByText('삭제')); });
    await waitFor(() => expect(text()).toContain('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'));
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
