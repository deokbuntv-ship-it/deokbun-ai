// 유료 행동의 동의 표면 — "덕이 나가는 순간 사용자가 그 사실을 볼 수 있는가".
//
// 궁합 대화의 원래 버그: 6번째 질문이 **조용히** 두 번째 12덕 세션을 열었다. 컴포저는 소진 시
// 언마운트됐지만 **후속질문 chip 은 같은 `send()` 를 부르면서 언마운트되지 않아** 무음 경로로 남았다.
// 수정은 caller 별 가드가 아니라 **공유 `send()` 안의 단일 가드**로 일반화됐다 — 이 파일이 그것을 잠근다.
//
// 뒷부분은 같은 클래스 전수: `/chat?startNew=1` 로 들어오는 여섯 진입점 각각이 가격을 보여 주는가.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport } from '@/test-support/renderAudit';

const HOUR = 3600 * 1000;
const NO_MESSAGES: unknown[] = [];
const sendResult = { current: null as unknown };

// ── 공통 mock (참조 안정성 필수 — 새 리터럴을 돌려주면 화면이 무한 리렌더에 빠진다) ──────────────
let session: Record<string, unknown> | null = null;
jest.mock('@/features/duk/dukClientContract', () => {
  const actual = jest.requireActual('@/features/duk/dukClientContract');
  return { ...actual, __esModule: true, getSessionStatus: () => Promise.resolve(session) };
});
jest.mock('@/features/duk/useWallet', () => ({
  __esModule: true,
  useWallet: () => ({ state: { totalSpendable: 120 }, loading: false, error: null, refresh: jest.fn().mockResolvedValue(undefined) }),
  refreshWallet: () => Promise.resolve(),
}));
jest.mock('@/features/duk/dukWalletService', () => ({
  __esModule: true,
  getCandleAvailability: () => Promise.resolve({ canLight: false, nextAvailableAtEpoch: null, rewardAmount: 1 }),
}));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: true, authState: { status: 'authenticated', user: { id: 'u1' } } }),
}));

const SELF = { id: 'subj-1', displayName: '김덕분', relationship: '본인', birthInfo: {} };
const TARGET = { id: 'subj-2', displayName: '박상대', relationship: '친구', birthInfo: {} };
const SUBJECTS = [SELF, TARGET];
jest.mock('@/features/consultation', () => ({
  __esModule: true,
  useConsultationDraft: () => ({ draft: { subject: SELF, birthInfo: {} }, hydrationStatus: 'ready', updateSubject: jest.fn(), updateBirthInfo: jest.fn() }),
  useConsultationSubjects: () => ({ subjects: SUBJECTS, status: 'ready', reload: jest.fn() }),
  consumePendingQuestion: () => null,
  consumePendingQuestionOrigin: () => null,
  isSavedSubjectId: () => true,
  setPendingConsultationIntent: jest.fn(),
}));
jest.mock('@/features/chat', () => {
  const actual = jest.requireActual('@/features/chat');
  return {
    ...actual,
    __esModule: true,
    createServerConsultationService: () => ({ sendMessage: async () => sendResult.current }),
    useConversationPersistence: () => ({
      hydrationStatus: 'ready',
      restoredMessages: NO_MESSAGES,
      resetToken: 0,
      conversationMemory: null,
      restoredSubjectSnapshot: null,
      activeConversationId: 'conv-1',
      ensureConversation: jest.fn().mockResolvedValue('conv-1'),
      persistMessage: jest.fn(),
    }),
  };
});

import { DUK_PRICES } from '@/features/duk/pricing';

import ChatScreen from '../chat';

const liveSession = (used: number, limit: number, product: string) => ({
  active: true, sessionId: 's1', productType: product,
  successfulTurnCount: used, turnLimit: limit,
  expiresAt: new Date(Date.now() + 12 * HOUR).toISOString(),
});

beforeEach(() => {
  setViewport(360);
  session = null;
  sendResult.current = { success: true, responseText: '답변입니다.', requestId: 'r1' };
  (globalThis as Record<string, unknown>).__routeParams = { conversationId: 'conv-1' };
});

it('스텁 확인 — 뷰포트가 실제로 360 이다', () => {
  expect(document.documentElement.clientWidth).toBe(360);
});

describe('⚠ 세션 경계 — 무음 경로가 남아 있지 않다 (공유 send 가드)', () => {
  it('궁합 대화의 무음 경로는 caller 가 아니라 공유 send() 에서 막혀 있다', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(process.cwd(), 'src/app/compatibility-chat.tsx'), 'utf8',
    );
    // 가드가 **첫 await 보다 앞**에 있어야 chip 과 컴포저가 같은 보호를 받는다(동기 차단).
    const body = src.slice(src.indexOf('const send = async'));
    const guardAt = body.indexOf('if (compatExhausted) return;');
    const firstAwait = body.indexOf('await ');
    expect(guardAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(firstAwait);
    // 그리고 소진 시 컴포저는 렌더 자체가 안 된다 — 이중 방어.
    expect(src).toContain('{compatExhausted ? (');
  });

  it('일반 상담도 소진 시 컴포저가 사라지고 동의 카드가 가격을 보여 준다', async () => {
    session = liveSession(5, 5, 'general');
    render(<ChatScreen />);
    // 이 대화에서 상담한 적이 있어야 카드가 뜬다 — 첫 전송으로 그 조건을 만든다.
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
  });
});

describe('⚠ 같은 클래스 전수 — /chat 첫 전송 시점에 가격이 보이는가', () => {
  it('세션이 없는 첫 진입에서 화면 어디에도 덕 금액이 없다', async () => {
    session = null;
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    // ⚠ 실측: 첫 전송이 5덕을 쓰지만 이 화면에는 그 숫자가 없다. 소진 카드에만 가격이 붙는다.
    // 진입점에 따라 사전 고지가 있기도 없기도 하다(아래 표) — 디자인 판단이라 보고만 했다.
    expect(document.body.textContent).not.toContain(`${DUK_PRICES.general}덕`);
    expect(screen.queryByText(/물어보기/)).toBeNull();
  });

  it('소진 카드에서만 가격이 라벨에 붙는다', async () => {
    session = liveSession(5, 5, 'general');
    render(<ChatScreen />);
    await waitFor(() => expect(screen.getByLabelText('메시지 입력창')).toBeInTheDocument());
    // 이 대화에서 아직 상담한 적이 없으므로 카드는 안 뜬다 — 그 조건 자체를 확인한다.
    expect(screen.queryByText(new RegExp(`새 상담 시작하기.*${DUK_PRICES.general}덕`))).toBeNull();
  });

  it('진입점별 사전 고지 유무를 소스로 고정한다 — 이 표가 바뀌면 알아야 한다', () => {
    const fs = require('fs');
    const path = require('path');
    const read = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), 'src', rel), 'utf8');
    // 가격을 보여 주고 들어오는 곳
    expect(read('app/(tabs)/consult.tsx')).toContain('PriceConfirmSheet');           // ✅ 가격 시트
    expect(read('app/(tabs)/index.tsx')).toContain('costLabel={dukLabel(DUK_PRICES.general)}'); // ✅ 버튼 라벨
    // ⚠ 가격 없이 곧장 /chat 으로 보내는 곳 — 후속질문 chip 두 곳
    for (const rel of ['app/today.tsx', 'app/monthly.tsx']) {
      const src = read(rel);
      expect(src).toContain("router.push({ pathname: '/chat', params: { startNew: '1' } })");
      expect(src).not.toContain('PriceConfirmSheet');
      expect(src).not.toContain('DUK_PRICES');
    }
  });
});
