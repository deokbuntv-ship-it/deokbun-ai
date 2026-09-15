// 360dp 레이아웃 점검 — 여섯 화면을 한자리에서.
//
// 브랜드 기준은 Galaxy S8 급 360dp 이고 DESIGN_FREEZE_FINAL 은 "360–392 는 기준 레이아웃, 여기서는
// 아무것도 깨지면 안 된다" 라고 못 박는다.
//
// ⚠ 이 파일이 증명하는 것과 못 하는 것
//   증명한다 : 뷰포트보다 넓게 **선언된** 고정 px 폭이 없다. 있으면 실기기에서도 반드시 넘친다.
//              긴 콘텐츠(12개월 · 긴 문의 · 궁합 결론)를 넣어도 그런 선언이 생기지 않는다.
//              반응형 밴드(359 / 360 / 393)가 실제로 다른 여백을 돌려준다.
//   못 한다  : "실제로 넘쳤는가". jsdom 에는 레이아웃 엔진이 없어 offsetWidth 가 항상 0이다.
//              줄바꿈 위치, 글꼴 실측 폭, 스크롤 발생 여부는 실기기 QA 로만 확인된다
//              (`docs/DEVICE_QA_MATRIX.md`).
import type { ReactElement } from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { fixedWidthsOver, nowrapLongText, setViewport } from '@/test-support/renderAudit';

const S8 = 360;

// ── 여섯 화면이 필요로 하는 것 ──────────────────────────────────────────────────────────────
const generate = jest.fn();
const save = jest.fn().mockResolvedValue({ id: 'r1' });
jest.mock('@/features/premium/services/premiumReportService', () => ({
  __esModule: true,
  premiumReportService: { generate: () => generate(), save: () => save() },
}));
const listMyInquiries = jest.fn();
const adminListInquiries = jest.fn();
jest.mock('@/features/support/supportService', () => ({
  __esModule: true,
  listMyInquiries: () => listMyInquiries(),
  submitInquiry: jest.fn(),
  adminListInquiries: () => adminListInquiries(),
  adminAnswerInquiry: jest.fn(),
}));
jest.mock('@/features/account/accountDeletionService', () => ({
  __esModule: true,
  fetchDeletionPreview: () => Promise.resolve({ dukBalance: 1240, subjectCount: 12, consultationCount: 148, reportCount: 37 }),
  deleteAccount: () => Promise.resolve('DELETED'),
}));
jest.mock('@/features/retention', () => ({ __esModule: true, unregisterOnLogout: () => Promise.resolve() }));
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({
    isAuthenticated: true,
    authState: { status: 'authenticated', user: { id: 'u1', email: 'a-fairly-long-address@example-domain.co.kr' } },
  }),
}));

import { BoundaryTimeNotice } from '@/features/consultation/components/BoundaryTimeNotice';
import { SharedReportPreview } from '@/features/chat/report/SharedReportPreview';

import AdminSupportScreen from '../admin/support/index';
import AccountDeleteScreen from '../account-delete';
import PremiumReportScreen from '../premium';
import SupportScreen from '../support';
import { PREMIUM_PAYLOAD } from './premiumFixture';

// 실물 길이의 긴 콘텐츠 — 짧은 더미로는 넘침을 볼 수 없다.
const LONG_INQUIRY = (
  '결제하고 덕이 들어오지 않았습니다. 어제 저녁 여덟시쯤 대용량 패키지를 결제했고 카드 승인 문자는 왔는데 '
  + '앱에서는 잔액이 그대로입니다. 로그아웃 후 재로그인도 해봤지만 동일합니다. 확인 부탁드립니다.'
).repeat(3);
const LONG_CONCLUSION =
  '두 분은 전체적으로 잘 맞는 편이에요. 서로의 속도가 다른 편이라 한쪽이 앞서 나갈 때 다른 한쪽이 '
  + '따라가느라 지치기 쉬운데, 그 지점만 서로 알고 있으면 오래 갑니다. 상대님이 조금 늦추면 훨씬 편해져요.';
const LOCKED = { findings: 12, cautions: 8, topics: 6 };

beforeEach(() => {
  setViewport(S8);
  generate.mockReset().mockResolvedValue({ status: 'ok', payload: PREMIUM_PAYLOAD });
  listMyInquiries.mockReset().mockResolvedValue([
    { id: 'i1', category: 'payment', status: 'ANSWERED', message: LONG_INQUIRY, answer: LONG_INQUIRY.slice(0, 200), createdAt: '2026-09-01T00:00:00Z' },
  ]);
  adminListInquiries.mockReset().mockResolvedValue({
    kind: 'ok',
    rows: [{
      id: 'q1', category: 'payment', status: 'RECEIVED', message: LONG_INQUIRY, answer: null, answeredAt: null,
      userDisplayName: '아주긴이름을가진사용자님', userEmail: 'a-fairly-long-address@example-domain.co.kr',
      contactEmail: null, platform: 'android', appVersion: '1.0.0', createdAt: '2026-09-01T10:00:00Z',
    }],
  });
});

/** 화면 하나를 지정 폭으로 렌더하고, 그 화면이 선언한 폭 위반을 돌려준다. */
async function auditAt(ui: ReactElement, settle: () => void, viewport = S8) {
  const { container } = render(ui);
  await waitFor(settle);
  return { overWide: fixedWidthsOver(container, viewport), nowrap: nowrapLongText(container) };
}

describe('여섯 화면 — 360dp 에서 넘치도록 선언된 폭이 없다', () => {
  it('절기 경계일 경고', async () => {
    const r = await auditAt(
      <BoundaryTimeNotice context="form" onEnterTime={jest.fn()} onSaveAnyway={jest.fn()} />,
      () => expect(screen.getByText('시각 입력하기')).toBeInTheDocument(),
    );
    expect(r.overWide).toEqual([]);
    expect(r.nowrap).toEqual([]);
  });

  it('Premium 결과 화면', async () => {
    const r = await auditAt(<PremiumReportScreen />, () =>
      expect(screen.getByText('타고난 결과 앞으로 열두 달을 한 번에 봅니다')).toBeInTheDocument());
    expect(r.overWide).toEqual([]);
    expect(r.nowrap).toEqual([]);
  });

  it('계정 탈퇴 — 네 자리 덕 잔액과 긴 이메일', async () => {
    const r = await auditAt(<AccountDeleteScreen />, () =>
      expect(screen.getByText(/남은 1240덕/)).toBeInTheDocument());
    expect(r.overWide).toEqual([]);
    expect(r.nowrap).toEqual([]);
  });

  it('CS 문의 — 긴 본문과 긴 답변', async () => {
    const r = await auditAt(<SupportScreen />, () => expect(screen.getByText('내 문의 내역')).toBeInTheDocument());
    expect(r.overWide).toEqual([]);
    expect(r.nowrap).toEqual([]);
  });

  it('CS 관리자 — 긴 이름·긴 이메일이 한 줄에 붙는 연락처 블록', async () => {
    const r = await auditAt(<AdminSupportScreen />, () => expect(screen.getByText(LONG_INQUIRY)).toBeInTheDocument());
    // 목록이 그려진 뒤 행 컨트롤까지 나와야 렌더가 완전히 가라앉는다.
    await waitFor(() => expect(screen.getByText('답변 등록')).toBeInTheDocument());
    expect(r.overWide).toEqual([]);
    expect(r.nowrap).toEqual([]);
  });

  it('공유 미리보기 — 긴 결론 문단', async () => {
    const r = await auditAt(
      <SharedReportPreview preview={{ conclusion: LONG_CONCLUSION, reportKind: 'compatibility', lockedCounts: LOCKED }} onOpenFull={jest.fn()} />,
      () => expect(screen.getByText('전체 보기')).toBeInTheDocument(),
    );
    expect(r.overWide).toEqual([]);
    expect(r.nowrap).toEqual([]);
  });
});

describe('긴 콘텐츠 — 12개월이 실제로 열두 줄 다 나온다', () => {
  it('한 달도 빠지지 않고, 그래도 폭 위반이 생기지 않는다', async () => {
    render(<PremiumReportScreen />);
    fireEvent.click(screen.getByText(/으로 리포트 받기$/));
    await waitFor(() => expect(screen.getByText(PREMIUM_PAYLOAD.result.headline)).toBeInTheDocument());
    // 저장은 화면을 보여준 뒤에 일어난다 — 그 상태까지 기다려야 렌더가 완전히 가라앉는다.
    await waitFor(() => expect(screen.getByText('우편함에서 다시 보기')).toBeInTheDocument());
    for (const line of PREMIUM_PAYLOAD.result.monthlyOutlook) {
      // 프로젝션이 줄 앞에 월 라벨을 붙이므로 앞부분 부분일치로 본다.
      const head = line.slice(0, 18).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(screen.getByText(new RegExp(head))).toBeInTheDocument();
    }
    expect(fixedWidthsOver(document.body, S8)).toEqual([]);
  });
});

describe('반응형 밴드가 실제로 값을 바꾼다 (DESIGN_FREEZE_FINAL §Adaptive)', () => {
  /** 화면이 hPad 를 인라인으로 얹는 컨테이너의 좌우 여백. */
  const horizontalPad = (): number | null => {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
      const l = el.style.paddingLeft;
      const r = el.style.paddingRight;
      if (l && l === r && l !== '0px') return Number(l.replace('px', ''));
    }
    return null;
  };

  it.each([
    [359, 16, '구형 소형 안드로이드 — 여백만 줄인다'],
    [360, 20, 'Galaxy S8 — 기준 밴드'],
    [393, 24, 'Pixel / iPhone 15 — 여백이 늘어난다'],
  ])('%ipx → 여백 %ipx (%s)', async (width, expected) => {
    setViewport(width);
    render(<SupportScreen />);
    await waitFor(() => expect(screen.getByText('문의 보내기')).toBeInTheDocument());
    expect(horizontalPad()).toBe(expected);
    expect(fixedWidthsOver(document.body, width)).toEqual([]);
  });
});
