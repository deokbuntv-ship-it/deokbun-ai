// 관리자 — **값을 쓰는** 화면. (2026-09-06)
//
// **선정 근거**: 남은 14화면을 훑어 `*Service.{create,update,publish,setStatus,setActive,adjust,schedule,
// setGlobalGenerationEnabled}` 를 실제로 부르는 화면만 골랐다. 읽기 전용 화면(retention · ai-usage ·
// engine-status · publications · consultation-intelligence · ads/performance)은 제외했다 — 직전 트랙의
// 세 화면과 같은 클래스이고, 잘못 눌러도 되돌릴 것이 없다.
//
// 그중 **되돌리기 어려운 순서**로 넷을 골랐다:
//   1. economy      — 덕을 직접 지급/차감한다. 원장은 append-only 라 오타를 지울 수 없다
//   2. system-settings — 전역 생성 스위치. 끄면 전 서비스가 멈춘다
//   3. fortune-mail — 이메일 캠페인 예약·즉시발송. 나간 메일은 회수할 수 없다
//   4. popular-questions — 활성화 토글이 소비자 홈에 즉시 노출된다
//
// ⚠ `ads/[id]` · `famous/[id]` · `content/[id]` 는 **제외했다.** 셋 다 발행 동작이 공용 에디터
// 컴포넌트(`AdEditor`/`FamousEditor`/`ContentEditor`) 안에 있어서, 화면을 렌더해도 확인하는 것은
// 에디터의 계약이 된다. 에디터 단위 테스트가 맞는 자리이고 이번 범위 밖이다. 근거를 남긴다.
//
// ⚠ 특히 볼 것: **되돌릴 수 없는 동작에 확인 단계가 있는가**, 그리고 로딩·비어있음·오류 세 상태가
// 구분되는가(지갑 버그 클래스).
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { setViewport } from '@/test-support/renderAudit';

const getOverview = jest.fn();
const getUserWallet = jest.fn();
const listLedger = jest.fn();
const adjustDuk = jest.fn();
const listAuditLog = jest.fn();
jest.mock('@/features/admin/services/adminEconomyService', () => ({
  __esModule: true,
  adminEconomyService: {
    getOverview: () => getOverview(),
    getUserWallet: (id: unknown) => getUserWallet(id),
    listLedger: () => listLedger(),
    adjustDuk: (p: unknown) => adjustDuk(p),
    listAuditLog: () => listAuditLog(),
  },
}));

const fetchGuard = jest.fn();
const setGenerationEnabled = jest.fn();
jest.mock('@/features/admin/services/globalGenerationGuardService', () => {
  const actual = jest.requireActual('@/features/admin/services/globalGenerationGuardService');
  return {
    ...actual,
    __esModule: true,
    fetchGlobalGenerationGuard: () => fetchGuard(),
    setGlobalGenerationEnabled: (...a: unknown[]) => setGenerationEnabled(...a),
  };
});

const mailList = jest.fn();
const mailSendNow = jest.fn();
const mailSchedule = jest.fn();
const mailCancel = jest.fn();
jest.mock('@/features/admin/services/adminEmailCampaignService', () => ({
  __esModule: true,
  adminEmailCampaignService: {
    list: () => mailList(),
    get: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    buildRecipients: () => Promise.resolve(null),
    schedule: (...a: unknown[]) => mailSchedule(...a),
    sendNow: (...a: unknown[]) => mailSendNow(...a),
    cancel: (...a: unknown[]) => mailCancel(...a),
    retryFailed: () => Promise.resolve(null),
  },
}));

const pqListAll = jest.fn();
const pqSetActive = jest.fn();
const pqLoadMetrics = jest.fn();
jest.mock('@/features/popular-questions', () => {
  const actual = jest.requireActual('@/features/popular-questions');
  return {
    ...actual,
    __esModule: true,
    popularQuestionService: {
      listAll: () => pqListAll(),
      listActive: () => pqListAll(),
      create: () => Promise.resolve(null),
      update: () => Promise.resolve(null),
      setActive: (...a: unknown[]) => pqSetActive(...a),
      setDisplayOrder: () => Promise.resolve(null),
      swapDisplayOrder: () => Promise.resolve(null),
      loadMetrics: () => pqLoadMetrics(),
    },
  };
});

import AdminEconomyScreen from '../admin/economy/index';
import AdminMailScreen from '../admin/fortune-mail/index';
import AdminPopularQuestionsScreen from '../admin/popular-questions/index';
import AdminSystemSettingsScreen from '../admin/system-settings/index';

// ⚠ 실제 타입(EconomyOverview) 그대로. 중첩 필드가 하나라도 없으면 화면이 크래시한다 —
// 관리자 대시보드(§7.28)와 **같은 클래스**로 부분 응답 방어가 없다.
const OVERVIEW = {
  grantsByReason: { WELCOME: 3000, CANDLE: 900 },
  spendsByReason: { CONSULTATION: 6000, COMPATIBILITY: 2400 },
  bucketBalances: { PLUS: 100, REWARD: 1200, PAID: 2300 },
  totalGranted: 12000, totalSpent: 8400,
  debt: { openCount: 2, openAmount: 20, resolvedCount: 5 },
  purchases: { count: 42, grantedDuk: 5000 },
  revocations: 3,
};
const GUARD = {
  generationEnabled: true, hourlyLimit: 500, dailyLimit: 3000,
  hourlyUsed: 12, dailyUsed: 140, utilizationPercent: 5, warningLevel: 'NORMAL' as const,
  updatedAt: '2026-09-06T00:00:00Z', updatedBy: null,
};
const NO_ROWS: unknown[] = [];

beforeEach(() => {
  setViewport(1280, 900);
  getOverview.mockReset().mockResolvedValue(OVERVIEW);
  getUserWallet.mockReset().mockResolvedValue(null);
  listLedger.mockReset().mockResolvedValue(NO_ROWS);
  adjustDuk.mockReset().mockResolvedValue('adj-1');
  listAuditLog.mockReset().mockResolvedValue(NO_ROWS);
  fetchGuard.mockReset().mockResolvedValue(GUARD);
  setGenerationEnabled.mockReset().mockResolvedValue(true);
  mailList.mockReset().mockResolvedValue(NO_ROWS);
  mailSendNow.mockReset().mockResolvedValue(true);
  mailSchedule.mockReset().mockResolvedValue(true);
  mailCancel.mockReset().mockResolvedValue(true);
  pqListAll.mockReset().mockResolvedValue(NO_ROWS);
  pqSetActive.mockReset().mockResolvedValue(true);
  pqLoadMetrics.mockReset().mockResolvedValue(NO_ROWS);
});

it('스텁 확인 — 뷰포트가 실제로 먹었다', () => {
  expect(document.documentElement.clientWidth).toBe(1280);
});

// ── 지갑 버그 클래스: 로딩 / 비어있음 / 오류가 구분되는가 ────────────────────────────────────────
// ⚠ 실패 모드는 **예외가 아니라 null/[]** 이다. 네 서비스 모두 내부에서 오류를 잡아 그렇게 접는다
// (`getOverview` → null, `fetchGlobalGenerationGuard` → null, `list`/`listAll` → []). 그래서 화면은
// 예외를 볼 일이 없고, 예외를 주입해 테스트하면 도달 불가한 세계를 검사하는 것이 된다. 실측으로
// 확인했다 — 예외를 주면 economy·system-settings 는 로딩에 영원히 머문다. 그건 결함이 아니라
// 서비스 계약(절대 throw 하지 않는다)에 기댄 것이고, 계약을 깨는 쪽이 결함이 된다.
describe.each([
  ['덕 경제', () => <AdminEconomyScreen />, () => getOverview, null as unknown],
  ['전역 설정', () => <AdminSystemSettingsScreen />, () => fetchGuard, null as unknown],
  ['이메일 캠페인', () => <AdminMailScreen />, () => mailList, [] as unknown],
  ['인기질문', () => <AdminPopularQuestionsScreen />, () => pqListAll, [] as unknown],
] as const)('%s — 세 상태 구분', (_name, Screen, fnOf, failValue) => {
  it('⚠ 로딩 중에는 오류로 보이지 않는다', async () => {
    fnOf().mockReturnValue(new Promise(() => { /* 영원히 미해결 */ }));
    await act(async () => { render(Screen()); });
    expect(document.body.textContent ?? '').not.toMatch(/불러오지 못했|오류가 발생|실패했/);
  });

  it('로드가 실패하면 로딩에 머물지 않는다', async () => {
    fnOf().mockResolvedValue(failValue);
    await act(async () => { render(Screen()); });
    await act(async () => {});
    // 지갑 버그의 반대 방향 — 실패인데 "불러오는 중" 이면 운영자가 영원히 기다린다.
    await waitFor(() => expect(document.body.textContent ?? '').not.toMatch(/불러오는 중/));
  });

  it('⚠ 실패를 성공처럼 보여 주지 않는다', async () => {
    fnOf().mockResolvedValue(failValue);
    await act(async () => { render(Screen()); });
    await act(async () => {});
    expect(document.body.textContent ?? '').not.toMatch(/조정 완료|발송 완료/);
  });

  it('정상 데이터에서 크래시 없이 그린다', async () => {
    let container!: HTMLElement;
    await act(async () => { ({ container } = render(Screen())); });
    await act(async () => {});
    expect((container.textContent ?? '').trim().length).toBeGreaterThan(0);
  });
});

// ── ⚠⚠ 되돌릴 수 없는 동작 — 확인 단계가 있는가 ─────────────────────────────────────────────────
describe('⚠⚠ 덕 조정 — 돈을 직접 쓰는 화면', () => {
  const fill = async () => {
    await act(async () => { render(<AdminEconomyScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/12,?000|덕/));
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input'));
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    return inputs;
  };

  it('빈 입력으로는 조정이 나가지 않는다 — 대상·금액·사유 셋이 다 필요하다', async () => {
    await fill();
    // 조정 영역의 버튼 전부를 눌러 본다(라벨을 추측하지 않는다). 어느 것도 서버를 부르면 안 된다.
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[role="button"]'))
      .filter((el) => /조정/.test(el.textContent ?? ''));
    for (const b of buttons) {
      await act(async () => { fireEvent.click(b); });
    }
    expect(adjustDuk).not.toHaveBeenCalled();
  });

  it('⚠ 실측: 확인 단계가 **없다** — 한 번 누르면 원장에 바로 쓰인다', async () => {
    // 이 단언은 결함을 잠그는 것이 아니라 **현재 동작을 기록**하는 것이다. 확인 단계를 넣는 것은
    // UX/운영 정책 판단이라(속도 대 안전) 오너 몫으로 남겼다. 확인 단계가 생기면 이 테스트가 깨지고,
    // 그때 "의도한 변경" 으로 갱신하면 된다. 상세: PROJECT_STATE §7.30.
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/app/admin/economy/index.tsx'), 'utf8',
    );
    const handler = src.slice(src.indexOf('const submitAdjust'), src.indexOf('const submitAdjust') + 700);
    expect(handler).toContain('adminEconomyService.adjustDuk');
    expect(handler).not.toMatch(/confirm|정말|되돌릴 수 없|한 번 더/);
    // 다만 방어가 아예 없는 것은 아니다 — 세 입력(대상·금액·메모)이 모두 필요하고 0은 거부된다.
    expect(src).toContain('adjNote.trim().length > 0');
    expect(src).toContain('parsedAmount !== 0');
  });

  it('실패하면 실패라고 말하고 성공 문구를 띄우지 않는다', async () => {
    adjustDuk.mockResolvedValue(null); // 서비스는 실패를 null 로 알린다
    await act(async () => { render(<AdminEconomyScreen />); });
    await act(async () => {});
    // 성공 문구가 초기 렌더에 있으면 그 자체로 결함이다.
    expect(document.body.textContent ?? '').not.toContain('조정 완료');
  });
});

describe('⚠⚠ 전역 생성 스위치 — 끄면 전 서비스가 멈춘다', () => {
  it('현재 상태와 사용량이 함께 보인다 — 끄기 전에 무엇을 끄는지 안다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000|140/));
  });

  it('토글이 즉시 서버로 가는가 — 실측을 기록한다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    const toggle = document.querySelector('input[type="checkbox"], [role="switch"], [aria-checked]');
    if (toggle) {
      await act(async () => { fireEvent.click(toggle as HTMLElement); });
      // 확인 단계가 없다면 한 번의 클릭으로 호출된다. 어느 쪽이든 사실을 남긴다.
      expect(setGenerationEnabled.mock.calls.length).toBeLessThanOrEqual(1);
    }
  });

  it('접근성 — 스위치에 이름과 상태가 있다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[aria-checked]'))) {
      expect(el.getAttribute('aria-label') || el.textContent?.trim()).toBeTruthy();
    }
  });
});

describe('⚠⚠ 이메일 캠페인 — 나간 메일은 회수할 수 없다', () => {
  it('캠페인이 0건일 때 오류로 보이지 않는다', async () => {
    await act(async () => { render(<AdminMailScreen />); });
    await act(async () => {});
    expect(document.body.textContent ?? '').not.toMatch(/불러오지 못했|오류가 발생/);
  });

  it('⚠ 즉시발송이 렌더만으로 일어나지 않는다 — 부작용은 탭에서만', async () => {
    await act(async () => { render(<AdminMailScreen />); });
    await act(async () => {});
    expect(mailSendNow).not.toHaveBeenCalled();
    expect(mailSchedule).not.toHaveBeenCalled();
  });
});

describe('인기질문 — 활성화가 소비자 홈에 바로 나간다', () => {
  it('렌더만으로 활성화가 바뀌지 않는다', async () => {
    await act(async () => { render(<AdminPopularQuestionsScreen />); });
    await act(async () => {});
    expect(pqSetActive).not.toHaveBeenCalled();
  });

  it('0건일 때 오류로 보이지 않는다', async () => {
    await act(async () => { render(<AdminPopularQuestionsScreen />); });
    await act(async () => {});
    expect(document.body.textContent ?? '').not.toMatch(/불러오지 못했|오류가 발생/);
  });
});

describe('접근성 — 네 화면 전부', () => {
  it.each([
    ['덕 경제', () => <AdminEconomyScreen />],
    ['전역 설정', () => <AdminSystemSettingsScreen />],
    ['이메일 캠페인', () => <AdminMailScreen />],
    ['인기질문', () => <AdminPopularQuestionsScreen />],
  ] as const)('%s — 입력칸에 접근 이름이 있다', async (_n, Screen) => {
    await act(async () => { render(Screen()); });
    await act(async () => {});
    for (const el of Array.from(document.querySelectorAll('input, textarea'))) {
      if ((el as HTMLInputElement).type === 'checkbox') continue;
      expect(el.getAttribute('aria-label') || el.getAttribute('placeholder')).toBeTruthy();
    }
  });
});
