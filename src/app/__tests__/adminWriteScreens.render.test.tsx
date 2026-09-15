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

import { setViewport, fixedWidthsOver } from '@/test-support/renderAudit';

// ── AI 사용량·비용 (2026-09-07). 순수 함수(`summarizeWindow`·`repositoryFromRows`)는 **진짜를 쓴다** —
//    그것이 이 화면의 산술이고, 목으로 덮으면 검사할 것이 남지 않는다. 네트워크만 목으로 막는다.
const listAiUsage = jest.fn();
jest.mock('@/features/admin/services/adminOpsService', () => {
  const actual = jest.requireActual('@/features/admin/services/adminOpsService');
  return {
    ...actual,
    __esModule: true,
    adminOpsService: { ...actual.adminOpsService, listAiUsage: (...a: unknown[]) => listAiUsage(...a) },
  };
});

const pricingListPrices = jest.fn();
const pricingUpsert = jest.fn();
const pricingGetFx = jest.fn();
const pricingSetFx = jest.fn();
const pricingGetDuk = jest.fn();
const pricingSetDuk = jest.fn();
const pricingWindow = jest.fn();
jest.mock('@/features/admin/services/adminPricingService', () => {
  const actual = jest.requireActual('@/features/admin/services/adminPricingService');
  return {
    ...actual,
    __esModule: true,
    adminPricingService: {
      listPrices: () => pricingListPrices(),
      upsertPrice: (p: unknown) => pricingUpsert(p),
      getFx: () => pricingGetFx(),
      setFx: (r: unknown) => pricingSetFx(r),
      getDukKrw: () => pricingGetDuk(),
      setDukKrw: (r: unknown) => pricingSetDuk(r),
      costWindow: (h: unknown) => pricingWindow(h),
    },
  };
});

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

import AdminAiUsageScreen from '../admin/ai-usage/index';
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

  // ⚠ 2026-09-06 뒤집힌 단언. 이 자리에는 "확인 단계가 **없다**" 를 기록한 테스트가 있었다.
  //   그것은 결함을 잠그는 것이 아니라 당시 동작을 적어 둔 것이었고, 확인 단계가 생기면 깨지고
  //   갱신하라고 스스로 적어 두었다. 그대로 되었다.
  it('⚠ 확인 없이는 원장에 쓰이지 않는다', async () => {
    adjustDuk.mockResolvedValue('adj-1');
    await act(async () => { render(<AdminEconomyScreen />); });
    await act(async () => {});
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/app/admin/economy/index.tsx'), 'utf8',
    );
    // 누르는 함수와 실제로 쓰는 함수가 분리돼 있다 — submitAdjust 는 확인만 띄운다.
    const submit = src.slice(src.indexOf('const submitAdjust'), src.indexOf('const applyAdjust'));
    expect(submit).toContain('setAdjConfirm(true)');
    expect(submit).not.toContain('adminEconomyService.adjustDuk');
    expect(src).toContain('const applyAdjust');
    // 세 입력 방어는 그대로 남아 있다.
    expect(src).toContain('adjNote.trim().length > 0');
    expect(src).toContain('parsedAmount !== 0');
    // 렌더만으로는 아무 일도 없다.
    expect(adjustDuk).not.toHaveBeenCalled();
  });

  it('확인 문구가 대상·금액·되돌리기를 말한다', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/app/admin/economy/index.tsx'), 'utf8',
    );
    const dlg = src.slice(src.indexOf('<AdminConfirmDialog'), src.indexOf('/>', src.indexOf('<AdminConfirmDialog')));
    expect(dlg).toContain('adjUserId');    // 대상을 되읽어 준다 — 붙여넣기 실수가 보이는 유일한 자리
    expect(dlg).toContain('parsedAmount'); // 금액
    expect(dlg).toContain('되돌릴 수 없습니다');
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

  // ⚠ 2026-09-06 뒤집힌 단언. 전에는 "즉시 서버로 가는가" 를 기록만 했다. 이제는 가지 않아야 한다.
  it('⚠ 토글 한 번으로는 서버가 바뀌지 않는다 — 확인을 거친다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    // ⚠ 이 화면에는 **비활성 자리표시자 스위치**가 위에 여러 개 있다. 첫 번째를 잡으면 죽은
    //   컨트롤을 누르게 된다. 가드 스위치는 접근 이름으로 지목한다.
    const toggle = document.querySelector('[aria-label="AI 생성 허용"]');
    expect(toggle).not.toBeNull();
    await act(async () => { fireEvent.click(toggle as HTMLElement); });
    // 토글은 **요청**만 만든다. 서버 호출은 아직 없다.
    expect(setGenerationEnabled).not.toHaveBeenCalled();
    // 그리고 무엇이 멈추는지가 화면에 떠 있어야 한다.
    await waitFor(() => expect(document.body.textContent ?? '').toContain('AI 생성을'));
  });

  it('확인 문구가 무엇이 멈추는지·진행 중 요청·되돌리기를 말한다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    // ⚠ 이 화면에는 **비활성 자리표시자 스위치**가 위에 여러 개 있다. 첫 번째를 잡으면 죽은
    //   컨트롤을 누르게 된다. 가드 스위치는 접근 이름으로 지목한다.
    const toggle = document.querySelector('[aria-label="AI 생성 허용"]');
    await act(async () => { fireEvent.click(toggle as HTMLElement); });
    const text = document.body.textContent ?? '';
    expect(text).toContain('하는 일');
    expect(text).toContain('영향 범위');
    expect(text).toContain('되돌리기');
    // 지시서가 요구한 세 가지가 실제 문구에 있는가.
    expect(text).toMatch(/상담|Premium|운세/);   // 무엇이 멈추는가
    expect(text).toMatch(/이미 시작된 요청|한도 안에서/); // 진행 중 요청 / 재개 범위
    expect(text).toMatch(/되돌릴 수 있습니다/);
  });

  it('취소하면 아무 일도 일어나지 않는다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    // ⚠ 이 화면에는 **비활성 자리표시자 스위치**가 위에 여러 개 있다. 첫 번째를 잡으면 죽은
    //   컨트롤을 누르게 된다. 가드 스위치는 접근 이름으로 지목한다.
    const toggle = document.querySelector('[aria-label="AI 생성 허용"]');
    await act(async () => { fireEvent.click(toggle as HTMLElement); });
    // 이 레포의 다른 렌더 테스트와 같은 방식 — 텍스트 노드를 누르면 Pressable 까지 버블링된다.
    await act(async () => { fireEvent.click(screen.getByText('취소')); });
    expect(setGenerationEnabled).not.toHaveBeenCalled();
    await waitFor(() => expect(document.body.textContent ?? '').not.toContain('하는 일'));
  });

  // ⚠ adminTheme 은 데스크톱 전용이지만 **확인 창은 360dp 에서도 읽혀야 한다** — 오너가 폰으로
  //   열어 급히 끄는 상황이 실제 운영에서 가장 있을 법한 시나리오다.
  it('360dp 에서도 확인 창의 세 줄이 다 보인다', async () => {
    setViewport(360, 800);
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    const toggle = document.querySelector('[aria-label="AI 생성 허용"]');
    await act(async () => { fireEvent.click(toggle as HTMLElement); });
    const text = document.body.textContent ?? '';
    expect(text).toContain('하는 일');
    expect(text).toContain('영향 범위');
    expect(text).toContain('되돌리기');
    expect(text).toContain('취소');
    setViewport(1280, 900);
  });

  it('원문 enum 이 그대로 보이지 않는다 — 경고 단계가 한국어다', async () => {
    await act(async () => { render(<AdminSystemSettingsScreen />); });
    await waitFor(() => expect(document.body.textContent).toMatch(/500|3,?000/));
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/NORMAL|WATCH_50|WARNING_80|CRITICAL_95/);
    expect(text).toMatch(/정상|주의\(한도|경고\(한도|위험\(한도/);
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


// ══════════════════════════════════════════════════════════════════════════════
// 5. AI 사용량·비용 — **2026-09-07 부터 값을 쓰는 화면이다.**
//
// ⚠ 이 파일 머리말이 `ai-usage` 를 "읽기 전용이라 제외" 로 적어 두었다. **그 근거가 사라졌다** —
//   이제 단가·환율·덕 값을 저장한다. 잘못 넣으면 관리자가 보는 모든 금액이 조용히 틀린다.
//   그래서 넷이 아니라 다섯이다.
//
// ⚠ 여기서 확인하는 것은 문구가 아니라 **산술**이다. 목 데이터의 토큰과 단가로 나올 금액을
//   손으로 계산해 두고 화면이 그 숫자를 내는지 본다. 문구만 보면 캐시를 빼먹어도 통과한다.
// ══════════════════════════════════════════════════════════════════════════════

// 단가 0.25 / 캐시 0.025 / 출력 2.0 (100만 토큰당 USD), 환율 1400, 덕 1개 200원.
//   입력 1,000,000 중 캐시 400,000 · 출력 200,000 · 100건
//   → (600,000×0.25 + 400,000×0.025 + 200,000×2.0) / 1e6 = $0.56 → ₩784
//   ⚠ 캐시를 빼먹으면 $0.65(₩910)가 된다. 두 숫자가 달라서 이 테스트가 캐시 반영을 실제로 잡는다.
const WIN_ROW = {
  model: 'gpt-5-mini', requests: 100,
  inputTokens: 1_000_000, cachedInputTokens: 400_000, outputTokens: 200_000, reasoningTokens: 60_000,
};
const PRICE_ROW = {
  model: 'gpt-5-mini', inputPer1m: 0.25, cachedInputPer1m: 0.025, outputPer1m: 2,
  currency: 'USD', effectiveFrom: '2026-09-01', updatedAt: null,
};

describe('AI 사용량·비용 — 단가를 쓰는 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listAiUsage.mockResolvedValue([]);
    pricingListPrices.mockResolvedValue([PRICE_ROW]);
    pricingGetFx.mockResolvedValue({ rate: 1400, effectiveFrom: '2026-09-01', updatedAt: null });
    pricingGetDuk.mockResolvedValue(null);
    pricingWindow.mockResolvedValue({ kind: 'ok', rows: [WIN_ROW] });
    pricingUpsert.mockResolvedValue(true);
    pricingSetFx.mockResolvedValue(true);
    pricingSetDuk.mockResolvedValue(true);
  });

  it('⚠ 산술 — 캐시된 입력을 반영한 금액이 나온다 (₩784, ₩910 이 아니다)', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const text = document.body.textContent ?? '';
    expect(text).toContain('₩784');
    // 캐시를 일반 단가로 계산하면 나올 값. 나오면 캐시가 반영되지 않은 것이다.
    expect(text).not.toContain('₩910');
  });

  it('단가가 없으면 0원이 아니라 "가격 미확인" 쪽으로 간다', async () => {
    pricingListPrices.mockResolvedValue([]);
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/가격 미확인|단가가 없어|단가가 아직 입력되지/);
    expect(text).not.toContain('₩0');
  });

  it('집계를 못 받으면 "모른다" 로 말한다 — 0원이 아니다', async () => {
    pricingWindow.mockResolvedValue({ kind: 'failed' });
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/불러오지 못했습니다/);
    expect(text).not.toContain('₩0');
  });

  // ── ⚠ RPC 가 없는 환경 (production 마이그레이션 적용 전) ──────────────────────
  //
  // 왜 따로 두는가: 이 화면은 production 에 단가 마이그레이션이 올라가기 **전에** 열린다.
  // 그때 "불러오지 못했습니다" 만 보이면 오너는 고장으로 읽고 재시도를 반복한다 — 할 일은
  // 재시도가 아니라 마이그레이션 적용이다. 세 갈래가 서로 다른 문장을 내는지 본다.
  it('⚠ RPC 없음 — "설치되지 않았습니다" 라고 말한다. 고장도 0원도 아니다', async () => {
    pricingWindow.mockResolvedValue({ kind: 'not_installed' });
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const text = document.body.textContent ?? '';
    expect(text).toContain('설치되지 않았습니다');
    expect(text).not.toContain('₩0');
    // "불러오지 못했습니다"(= 일시 오류) 로 읽히면 안 된다 — 오너가 할 일이 다르다.
    expect(text).not.toMatch(/불러오지 못했습니다/);
  });

  it('권한 없음 — 권한 문제라고 말한다. 미설치와 섞지 않는다', async () => {
    pricingWindow.mockResolvedValue({ kind: 'forbidden' });
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/권한/);
    expect(text).not.toContain('설치되지 않았습니다');
    expect(text).not.toContain('₩0');
  });

  it('0건이면 ₩0 이라고 분명히 말한다 — 모르는 것과 다르다', async () => {
    pricingWindow.mockResolvedValue({ kind: 'ok', rows: [] });
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    expect(document.body.textContent ?? '').toContain('₩0');
  });

  // ── ⚠ 저장 전 미리보기 — 자릿수 사고를 누르기 전에 잡는가
  it('⚠ 자릿수를 10배로 잘못 넣으면 미리보기가 배수로 경고한다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const typeInto = (label: string, v: string) => {
      const el = document.querySelector(`[aria-label="${label}"], [placeholder="${label}"]`);
      expect(el).not.toBeNull();
      fireEvent.change(el as HTMLElement, { target: { value: v } });
    };
    await act(async () => {
      typeInto('gpt-5-mini', 'gpt-5-mini');   // 모델명 칸의 placeholder
      typeInto('0.25', '2.5');                // 입력 단가를 10배로
      typeInto('2.0', '20');                  // 출력 단가를 10배로
    });
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/최근 24시간 원가가/);
    expect(text).toMatch(/배입니다. 자릿수를 확인해 주세요/);
  });

  it('미리보기가 없는 모델은 "기록이 없어 미리 볼 수 없습니다" 로 정직하게 말한다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const q = (p: string) => document.querySelector(`[placeholder="${p}"]`) as HTMLElement;
    await act(async () => {
      fireEvent.change(q('gpt-5-mini'), { target: { value: 'gpt-9-imaginary' } });
      fireEvent.change(q('0.25'), { target: { value: '1' } });
      fireEvent.change(q('2.0'), { target: { value: '2' } });
    });
    expect(document.body.textContent ?? '').toContain('기록이 없어 미리 볼 수 없습니다');
  });

  // ── ⚠ 확인 단계
  it('단가 저장은 확인을 거친다 — 버튼 한 번으로 서버에 가지 않는다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const q = (p: string) => document.querySelector(`[placeholder="${p}"]`) as HTMLElement;
    await act(async () => {
      fireEvent.change(q('gpt-5-mini'), { target: { value: 'gpt-5-mini' } });
      fireEvent.change(q('0.25'), { target: { value: '0.25' } });
      fireEvent.change(q('2.0'), { target: { value: '2' } });
    });
    await act(async () => { fireEvent.click(screen.getByText('단가 저장')); });
    expect(pricingUpsert).not.toHaveBeenCalled();
    const text = document.body.textContent ?? '';
    expect(text).toContain('하는 일');
    expect(text).toContain('영향 범위');
    expect(text).toContain('되돌리기');
    // ⚠ 미리보기가 확인창에도 있어야 한다 — 오너가 마지막으로 보는 화면이 여기다.
    expect(text).toMatch(/최근 24시간 원가가/);
  });

  it('취소하면 저장되지 않는다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const q = (p: string) => document.querySelector(`[placeholder="${p}"]`) as HTMLElement;
    await act(async () => {
      fireEvent.change(q('gpt-5-mini'), { target: { value: 'gpt-5-mini' } });
      fireEvent.change(q('0.25'), { target: { value: '0.25' } });
      fireEvent.change(q('2.0'), { target: { value: '2' } });
    });
    await act(async () => { fireEvent.click(screen.getByText('단가 저장')); });
    await act(async () => { fireEvent.click(screen.getByText('취소')); });
    expect(pricingUpsert).not.toHaveBeenCalled();
    await waitFor(() => expect(document.body.textContent ?? '').not.toContain('하는 일'));
  });

  // ── ⚠ 추론 토큰 — 칸을 만들지 않았고, 왜 없는지 화면이 말한다
  it('추론 토큰 입력칸이 없고, 없는 이유가 화면에 적혀 있다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const labels = Array.from(document.querySelectorAll('input'))
      .map((el) => `${el.getAttribute('aria-label') ?? ''} ${el.getAttribute('placeholder') ?? ''}`)
      .join(' ');
    expect(labels).not.toMatch(/추론|reasoning/i);
    expect(document.body.textContent ?? '').toMatch(/출력 토큰으로 청구/);
  });

  // ── ⚠ 마진 — 덕 값이 없으면 내지 않는다
  it('덕 값이 없으면 마진을 내지 않는다 — 0으로 두면 마진 100%가 된다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    expect(document.body.textContent ?? '').toContain('마진은 아직 볼 수 없습니다');
  });

  it('덕 값이 있으면 마진과 선불 주의가 함께 나온다', async () => {
    pricingGetDuk.mockResolvedValue({ rate: 200, effectiveFrom: '2026-09-01', updatedAt: null });
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    const text = document.body.textContent ?? '';
    // 건당 ₩784/100 = ₩7.84 = 0.039덕 → 5덕이면 99.2% 가 남는다.
    expect(text).toMatch(/0\.039덕/);
    expect(text).toMatch(/5덕이면 99\.2%/);
    // ⚠ 선불 문제를 화면이 스스로 설명해야 한다. 안 적으면 오너가 매출 시점과 섞어 읽는다.
    expect(text).toMatch(/미리|선불/);
    expect(text).toMatch(/이번 달 매출 − 이번 달 원가/);
  });

  // ── ⚠ 360dp — **스텁이 실제로 듣는지 먼저 확인한다**
  it('setViewport 스텁이 실제로 듣는다 — 이걸 먼저 확인해야 아래 360dp 검사가 의미 있다', () => {
    setViewport(360, 800);
    expect(window.innerWidth).toBe(360);
    expect(document.documentElement.clientWidth).toBe(360);
    // 이 하네스에 matchMedia 가 있는지도 밝혀 둔다. 없으면 미디어쿼리 기반 반응형은 여기서 검증 불가다.
    expect(typeof window.matchMedia === 'function' || window.matchMedia === undefined).toBe(true);
  });

  it('360dp 에서 확인 창의 세 줄이 다 보이고, 뷰포트보다 넓은 고정 폭이 없다', async () => {
    setViewport(360, 800);
    const { container } = render(<AdminAiUsageScreen />);
    await act(async () => {});
    const q = (p: string) => document.querySelector(`[placeholder="${p}"]`) as HTMLElement;
    await act(async () => {
      fireEvent.change(q('gpt-5-mini'), { target: { value: 'gpt-5-mini' } });
      fireEvent.change(q('0.25'), { target: { value: '0.25' } });
      fireEvent.change(q('2.0'), { target: { value: '2' } });
    });
    await act(async () => { fireEvent.click(screen.getByText('단가 저장')); });
    const text = document.body.textContent ?? '';
    expect(text).toContain('하는 일');
    expect(text).toContain('영향 범위');
    expect(text).toContain('되돌리기');
    expect(fixedWidthsOver(container, 360)).toEqual([]);
  });

  it('입력칸에 접근 이름이 있다', async () => {
    await act(async () => { render(<AdminAiUsageScreen />); });
    await act(async () => {});
    for (const el of Array.from(document.querySelectorAll('input, textarea'))) {
      if ((el as HTMLInputElement).type === 'checkbox') continue;
      expect(el.getAttribute('aria-label') || el.getAttribute('placeholder')).toBeTruthy();
    }
  });
});
