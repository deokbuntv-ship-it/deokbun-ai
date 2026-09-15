// 오늘의 운세 (/today) — 매일 열리는 화면.
//
// 소스 계약이 못 보던 것: 여섯 상태(loading / ready / no-self / 절기경계 / unavailable / error)가
// **실제로 갈리는가**, 그리고 절기 경계일 계정이 일반 "출생정보 확인" 문구가 아니라 전용 안내를
// 받는가. 후자는 이 화면의 유일한 조건부-조건부 분기다(unavailable AND 경계일).
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { setViewport, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

const ensureToday = jest.fn();
const getByDate = jest.fn();
jest.mock('@/features/today', () => ({
  __esModule: true,
  todayFortuneService: { ensureToday: (a: unknown) => ensureToday(a), getByDate: (d: string) => getByDate(d) },
  toTodayDetailView: jest.requireActual('@/features/today').toTodayDetailView,
  toneVariant: jest.requireActual('@/features/today').toneVariant,
  trackTodayEvent: jest.fn(),
}));

let subjects: unknown[] = [];
let subjectsStatus = 'ready';
const setPendingConsultationIntent = jest.fn();
const updateSubject = jest.fn();
const updateBirthInfo = jest.fn();
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationSubjects: () => ({ subjects, status: subjectsStatus }),
  useConsultationDraft: () => ({ updateSubject, updateBirthInfo }),
  setPendingConsultationIntent: (i: unknown) => setPendingConsultationIntent(i),
}));

import { routerMock } from '../../../jest.render.setup';
import TodayScreen from '../today';
import { BOUNDARY_SUBJECT, SELF_SUBJECT, TODAY_RECORD } from './todayFixture';


beforeEach(() => {
  setViewport(360);
  subjects = [SELF_SUBJECT];
  subjectsStatus = 'ready';
  (globalThis as Record<string, unknown>).__routeParams = {};
  ensureToday.mockReset().mockResolvedValue({ status: 'ok', record: TODAY_RECORD, cacheHit: true });
  getByDate.mockReset();
  routerMock.push.mockReset();
  routerMock.replace.mockReset();
  setPendingConsultationIntent.mockReset();
});

it('스텁 확인 — 이 단언이 없으면 아래 360dp 검사가 0dp 를 본다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('ready — 오늘의 결과', () => {
  it('한마디·판정·핵심·주의·행동이 전부 화면에 나온다', async () => {
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText(TODAY_RECORD.result.headline)).toBeInTheDocument());
    expect(screen.getByText(TODAY_RECORD.result.verdict!)).toBeInTheDocument();
    // 하이라이트 제목은 도메인 접두어와 한 노드에 렌더된다 ('work · 미뤄 둔 일이…').
    expect(screen.getByText(/미뤄 둔 일이 풀립니다/)).toBeInTheDocument();
    expect(screen.getByText('즉답을 피하세요')).toBeInTheDocument();
    expect(screen.getByText(TODAY_RECORD.result.actionTip)).toBeInTheDocument();
  });

  it('AI 생성 고지가 결과 아래 붙는다', async () => {
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText(/덕분이는 AI를 활용해/)).toBeInTheDocument());
    expect(document.body.textContent).toMatch(/부정확하거나 실제 결과와 다를 수 있으며/);
  });

  it('후속 질문을 누르면 상담으로 넘어가고, 오늘 텍스트가 아니라 질문만 실린다', async () => {
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText('이직 시기')).toBeInTheDocument());
    fireEvent.click(screen.getByText('이직 시기'));
    expect(setPendingConsultationIntent).toHaveBeenCalledWith({
      question: '올해 안에 직장을 옮기는 것이 저에게 맞을까요?',
    });
    // ⚠ 오늘의 해석 본문이 상담으로 실려 가면 안 된다 (§43/§53 — 상담은 독립적으로 다시 근거를 세운다).
    const payload = JSON.stringify(setPendingConsultationIntent.mock.calls[0][0]);
    expect(payload).not.toContain(TODAY_RECORD.result.headline);
    expect(payload).not.toContain(TODAY_RECORD.result.overallSummary);
    expect(routerMock.push).toHaveBeenCalledWith({ pathname: '/chat', params: { startNew: '1' } });
  });

  it('360dp — 실물 길이 결과에서도 넘치도록 선언된 폭이 없다', async () => {
    const { container } = render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText(TODAY_RECORD.result.headline)).toBeInTheDocument());
    expect(fixedWidthsOver(container, 360)).toEqual([]);
    expect(nowrapLongText(container)).toEqual([]);
  });
});

describe('상태 분기', () => {
  it('loading — 무엇을 기다리는지 말한다', () => {
    ensureToday.mockReturnValue(new Promise(() => {}));
    render(<TodayScreen />);
    expect(screen.getByText('오늘의 운세를 준비하고 있어요...')).toBeInTheDocument();
  });

  it('본인 정보가 없으면 결과 대신 등록으로 보낸다', async () => {
    subjects = [];
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText('먼저 본인의 출생정보를 등록해 주세요.')).toBeInTheDocument());
    expect(ensureToday).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('MY로 이동'));
    expect(routerMock.replace).toHaveBeenCalledWith('/my');
  });

  it('⚠ 절기 경계일 계정은 일반 안내가 아니라 전용 안내를 받는다', async () => {
    subjects = [BOUNDARY_SUBJECT];
    ensureToday.mockResolvedValue({ status: 'unavailable' });
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument());
    // 일반 문구는 이 경우 사실을 축소한다 — 아무것도 생성되지 않았기 때문이다.
    expect(screen.queryByText(/일부 해석이 제한될 수 있어요/)).toBeNull();
    fireEvent.click(screen.getByText('출생정보 수정'));
    expect(routerMock.push).toHaveBeenCalledWith({ pathname: '/birth-info', params: { subjectId: 'subj-boundary' } });
  });

  it('경계일이 아닌 unavailable 은 일반 안내를 받는다', async () => {
    ensureToday.mockResolvedValue({ status: 'unavailable' });
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText('오늘의 운세를 준비하지 못했어요.')).toBeInTheDocument());
    expect(screen.queryByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeNull();
  });

  it('error — 재시도를 주고, 누르면 다시 부른다', async () => {
    ensureToday.mockResolvedValue({ status: 'error' });
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText(/불러오지 못했어요/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('다시 시도'));
    await waitFor(() => expect(ensureToday).toHaveBeenCalledTimes(2));
  });

  it('비로그인은 로그인으로 간다', async () => {
    ensureToday.mockResolvedValue({ status: 'auth' });
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/login'));
  });
});

describe('지난 날짜 — 다시 생성하지 않는다', () => {
  it('?date= 는 읽기만 하고 ensureToday 를 부르지 않는다', async () => {
    (globalThis as Record<string, unknown>).__routeParams = { date: '2026-09-01' };
    getByDate.mockResolvedValue(TODAY_RECORD);
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText(TODAY_RECORD.result.headline)).toBeInTheDocument());
    expect(getByDate).toHaveBeenCalledWith('2026-09-01');
    expect(ensureToday).not.toHaveBeenCalled();
  });

  it('그날 기록이 없으면 만들지 않고 없다고 말한다', async () => {
    (globalThis as Record<string, unknown>).__routeParams = { date: '2026-01-01' };
    getByDate.mockResolvedValue(null);
    render(<TodayScreen />);
    await waitFor(() => expect(screen.getByText('오늘의 운세를 준비하지 못했어요.')).toBeInTheDocument());
    expect(ensureToday).not.toHaveBeenCalled();
  });
});
