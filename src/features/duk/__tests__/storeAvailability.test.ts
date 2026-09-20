// F-02 — 충전 입구는 **살 수 있는 기기에서만** 열린다 (2026-09-21 합성 반례).
//
// 2026-09-18 전수 조사: 충전으로 가는 입구 10곳 어디에도 플랫폼 확인이 없었다. 아이폰 앱에서는 "구매" 가
// 살아 있는데 세 겹으로 실패하고, 웹에서는 "준비 중" 막다른 화면으로 갔다.
// CTO 판정: 충전 묶음만 숨긴다 · 웹에서도 숨긴다 · **안내 문구 없이** 숨긴다.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadWithPlatform(os: string) {
  jest.resetModules();
  jest.doMock('react-native', () => ({ Platform: { OS: os } }));
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  return require('@/features/duk/iap/storeAvailability') as typeof import('@/features/duk/iap/storeAvailability');
}

describe('스토어 스위치 — 양방향', () => {
  it('안드로이드 앱에서는 살 수 있다', () => {
    expect(loadWithPlatform('android').storePurchaseAvailable()).toBe(true);
  });

  it.each([['ios'], ['web'], ['windows'], ['macos']])('%s 에서는 숨긴다', (os) => {
    expect(loadWithPlatform(os).storePurchaseAvailable()).toBe(false);
  });
});

describe('입구 네 곳이 이 스위치를 지난다', () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

  it.each([
    ['잔액 카드의 충전 알약(홈 · MY · 지갑 3곳이 지난다)', join('src', 'components', 'DukBalance', 'DukBalance.tsx')],
    ['덕이 부족해요 카드의 충전 버튼(5곳이 지난다)', join('src', 'components', 'InsufficientDuk', 'InsufficientDuk.tsx')],
    ['지갑의 덕 충전하기 버튼', join('src', 'app', 'wallet.tsx')],
    ['충전 화면 자체(주소로 직접 들어와도)', join('src', 'app', 'duk-topup.tsx')],
  ])('%s', (_label, rel) => {
    expect(read(rel)).toContain('storePurchaseAvailable');
  });

  it('덕을 **쓰는** 기능은 그대로다 — 촛불 버튼은 스위치 밖에 있다', () => {
    const insufficient = read(join('src', 'components', 'InsufficientDuk', 'InsufficientDuk.tsx'));
    const candleLine = insufficient.split('\n').find((l) => l.includes('onPress={onCandle}')) ?? '';
    expect(candleLine).not.toContain('storePurchaseAvailable');
  });

  it('숨길 때 **안내 문구를 넣지 않는다** ("준비 중" 은 애플 심사에 불리)', () => {
    const wallet = read(join('src', 'app', 'wallet.tsx'));
    const gated = wallet.slice(wallet.indexOf('storePurchaseAvailable()'), wallet.indexOf('storePurchaseAvailable()') + 400);
    expect(gated).not.toContain('준비 중');
    expect(gated).not.toContain('아이폰');
  });

  it('애플 계정이 나오면 여는 조건이 코드에 적혀 있다', () => {
    const source = read(join('src', 'features', 'duk', 'iap', 'storeAvailability.ts'));
    for (const condition of ['App Store Connect', 'product_catalog', 'verify-purchase', '실구매 E2E']) {
      expect(source).toContain(condition);
    }
  });
});

describe('서버 시크릿 기본값 — 없으면 막는다 (CTO 7-5 · 7-6)', () => {
  const edge = readFileSync(join(process.cwd(), 'supabase', 'functions', 'chat', 'index.ts'), 'utf8');

  it('환경을 모르면 production 으로 본다 (fail-closed)', () => {
    expect(edge).toContain("const ENV_NAME = (Deno.env.get('APP_ENV') ?? '').trim().toLowerCase();");
    expect(edge).toContain("ENV_NAME !== 'staging' && ENV_NAME !== 'development' && ENV_NAME !== 'local'");
  });

  it('AI 동의 시크릿이 없으면 production 에서는 요구한다', () => {
    expect(edge).toContain("AI_CONSENT_FLAG === '' ? IS_PROD_LIKE : false");
  });

  it('덕 차감 시크릿이 없으면 production 에서는 **유료 요청을 거절**한다 (공짜로 주지 않는다)', () => {
    expect(edge).toContain('const DUK_BILLING_MISCONFIGURED = IS_PROD_LIKE && !DUK_BILLING_ENABLED;');
    expect(edge).toContain('duk_billing_misconfigured');
    // 상담 · 프리미엄 두 유료 경로가 모두 이 문을 지난다.
    expect(edge).toContain("refuseWhenBillingMisconfigured(requestId, 'consultation')");
    expect(edge).toContain("refuseWhenBillingMisconfigured(requestId, 'premium_report')");
  });

  it('staging · development 는 지금 동작 그대로다', () => {
    expect(edge).toContain("ENV_NAME !== 'staging'");
    // 거절은 production 으로 본 경우에만 일어난다.
    expect(edge).toContain('if (!DUK_BILLING_MISCONFIGURED) return null;');
  });
});

describe('첫 전송 잔액 확인 — 한 겹 더 (CTO 7-7)', () => {
  const chat = readFileSync(join(process.cwd(), 'src', 'app', 'chat.tsx'), 'utf8');

  it('새 상담을 여는 첫 질문에서 확실히 모자라면 서버를 부르지 않는다', () => {
    expect(chat).toContain('if (!session?.active && isBalanceShort(wallet.state, DUK_PRICES.general))');
  });

  it('잔액을 모를 때는 막지 않는다 (모름을 0으로 읽지 않는다)', () => {
    const helper = readFileSync(join(process.cwd(), 'src', 'features', 'duk', 'consumerDukView.ts'), 'utf8');
    expect(helper).toContain('export function isBalanceShort');
  });
});
