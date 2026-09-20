// expo-iap 어댑터 — **설치본과의 계약** + 합성 반례.
//
// 왜 이 파일이 생겼나 (2026-09-18 전수 조사): 결제가 한 번도 된 적이 없었다. 앱은 구매 요청을
// `request.android` / `request.ios` 로 보냈는데 설치된 expo-iap 5.5.1 은 `request.google` / `request.apple`
// 만 읽는다. 테스트는 전부 **가짜 어댑터**였고 이 파일(진짜 어댑터)을 보는 테스트가 하나도 없었다.
// 그래서 두 가지를 한다:
//   ① 설치된 node_modules 본문과 대조한다 — 라이브러리를 올려 이름이 바뀌면 **이 테스트가 먼저 깨진다**
//   ② 어댑터를 가짜 expo-iap 모듈 위에서 실제로 돌려 본다 (정상 · 취소 · 끊김 · 보류 · 중복 · 복구)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

const LIB = join(process.cwd(), 'node_modules', 'expo-iap', 'build', 'index.js');

type Listener = (payload: unknown) => void;

type FakeIap = {
  initConnection: jest.Mock;
  fetchProducts: jest.Mock;
  requestPurchase: jest.Mock;
  getAvailablePurchases: jest.Mock;
  finishTransaction: jest.Mock;
  purchaseUpdatedListener?: jest.Mock;
  purchaseErrorListener?: jest.Mock;
  __emitPurchase: (row: unknown) => void;
  __emitError: (err: unknown) => void;
  __removed: number;
};

function makeFakeIap(options: { withListeners?: boolean; requestPurchase?: jest.Mock } = {}): FakeIap {
  const withListeners = options.withListeners ?? true;
  const purchaseListeners: Listener[] = [];
  const errorListeners: Listener[] = [];
  const fake = {
    initConnection: jest.fn(async () => true),
    fetchProducts: jest.fn(async () => [{ id: 'duk_first_20', displayPrice: '₩2,500' }]),
    requestPurchase: options.requestPurchase ?? jest.fn(async () => ({ dispatched: true })),
    getAvailablePurchases: jest.fn(async () => []),
    finishTransaction: jest.fn(async () => undefined),
    __emitPurchase: (row: unknown) => purchaseListeners.forEach((l) => l(row)),
    __emitError: (err: unknown) => errorListeners.forEach((l) => l(err)),
    __removed: 0,
  } as FakeIap;
  if (withListeners) {
    fake.purchaseUpdatedListener = jest.fn((l: Listener) => {
      purchaseListeners.push(l);
      return { remove: () => { fake.__removed += 1; } };
    });
    fake.purchaseErrorListener = jest.fn((l: Listener) => {
      errorListeners.push(l);
      return { remove: () => { fake.__removed += 1; } };
    });
  }
  return fake;
}

/** 가짜 모듈을 심고 어댑터를 새로 불러온다(어댑터가 모듈을 한 번만 require 하므로 캐시를 비운다). */
function loadAdapterWith(fake: FakeIap) {
  jest.resetModules();
  jest.doMock('expo-iap', () => fake, { virtual: true });
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const mod = require('../expoIapAdapter') as typeof import('../expoIapAdapter');
  mod.__resetIapCache();
  mod.__resetRawPurchaseCache();
  return mod.createExpoIapAdapter();
}

const SKU = 'duk_first_20';
const GOOD_ROW = { id: SKU, productId: SKU, purchaseToken: 'tok-1', purchaseState: 1, transactionId: 'gpa-1' };

describe('설치본 계약 — expo-iap 5.5.1 (이 대조가 깨지면 라이브러리가 바뀐 것이다)', () => {
  const source = readFileSync(LIB, 'utf8');

  it('구매 요청에서 읽는 이름은 `request.google` · `request.apple` 이다', () => {
    expect(source).toContain('function normalizeRequestProps(request, platform)');
    expect(source).toMatch(/if \(platform === 'ios'\) \{\s*return request\.apple;/);
    expect(source).toMatch(/return request\.google;/);
    // 옛 이름으로 읽는 곳이 남아 있지 않다 — 있으면 우리 요청 모양을 다시 봐야 한다.
    expect(source).not.toContain('return request.android;');
  });

  it('결과는 반환값이 아니라 `purchaseUpdatedListener` 로 온다고 적혀 있다', () => {
    expect(source).toContain('purchaseUpdatedListener');
    expect(source).toContain('NOT the return value');
  });

  it('어댑터가 부르는 이름이 설치본에 모두 있다', () => {
    for (const name of ['requestPurchase', 'fetchProducts', 'getAvailablePurchases', 'finishTransaction', 'purchaseErrorListener']) {
      expect(source).toContain(name);
    }
  });
});

describe('구매 — 합성 반례', () => {
  it('정상 구매: 이벤트로 온 구매를 SUCCESS 로 돌려준다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve(); // 리스너 등록 + 요청 전송까지 진행
    await Promise.resolve();
    fake.__emitPurchase(GOOD_ROW);
    await expect(pending).resolves.toEqual({
      kind: 'SUCCESS',
      purchase: { provider: 'GOOGLE', storeProductId: SKU, transactionToken: 'tok-1' },
    });
  });

  it('요청은 `google` · `apple` 이름으로 나간다 — 옛 이름(`android`/`ios`)은 쓰지 않는다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase(GOOD_ROW);
    await pending;
    const arg = fake.requestPurchase.mock.calls[0][0] as { request: Record<string, unknown>; type: string };
    expect(arg.request).toEqual({ google: { skus: [SKU] }, apple: { sku: SKU } });
    expect(arg.type).toBe('in-app');
    expect(Object.keys(arg.request)).not.toContain('android');
    expect(Object.keys(arg.request)).not.toContain('ios');
  });

  it('구매 전에 상품을 먼저 조회한다 (sku-not-found 예방)', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase(GOOD_ROW);
    await pending;
    expect(fake.fetchProducts).toHaveBeenCalledWith({ skus: [SKU], type: 'in-app' });
    expect(fake.fetchProducts.mock.invocationCallOrder[0]).toBeLessThan(fake.requestPurchase.mock.invocationCallOrder[0]);
  });

  it('사용자 취소: 오류 이벤트가 취소면 CANCELLED (오류로 그리지 않는다)', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitError({ code: 'E_USER_CANCELLED', message: 'User canceled the purchase' });
    await expect(pending).resolves.toEqual({ kind: 'CANCELLED' });
  });

  it('네트워크 끊김: 요청 자체가 실패하면 ERROR 로 내려앉는다', async () => {
    const fake = makeFakeIap({
      requestPurchase: jest.fn(async () => { throw new Error('Network request failed'); }),
    });
    const adapter = loadAdapterWith(fake);
    await expect(adapter.purchase(SKU)).resolves.toEqual({ kind: 'ERROR', message: 'Network request failed' });
  });

  it('보류(계좌이체·부모 승인): PENDING — 지급도 실패도 아니다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase({ ...GOOD_ROW, purchaseState: 2 });
    await expect(pending).resolves.toEqual({ kind: 'PENDING' });
  });

  it('토큰이 비면 성공으로 그리지 않는다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase({ id: SKU, productId: SKU, purchaseToken: '' });
    await expect(pending).resolves.toEqual({ kind: 'ERROR', message: 'NO_TOKEN' });
  });

  it('같은 구매 이벤트가 두 번 와도 한 번만 끝나고 리스너는 정리된다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase(GOOD_ROW);
    fake.__emitPurchase(GOOD_ROW);
    await expect(pending).resolves.toMatchObject({ kind: 'SUCCESS' });
    expect(fake.__removed).toBe(2); // 구매 · 오류 리스너 둘 다 뗀다
  });

  it('다른 상품의 이벤트는 흘려보낸다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase({ id: 'duk_base_50', productId: 'duk_base_50', purchaseToken: 'other' });
    fake.__emitPurchase(GOOD_ROW);
    await expect(pending).resolves.toMatchObject({
      kind: 'SUCCESS',
      purchase: { storeProductId: SKU, transactionToken: 'tok-1' },
    });
  });

  it('리스너가 없는 설치본에서는 반환값으로 내려앉는다 (옛 버전 호환)', async () => {
    const fake = makeFakeIap({
      withListeners: false,
      requestPurchase: jest.fn(async () => [GOOD_ROW]),
    });
    const adapter = loadAdapterWith(fake);
    await expect(adapter.purchase(SKU)).resolves.toMatchObject({ kind: 'SUCCESS' });
  });
});

describe('복구와 마무리', () => {
  it('결제 중 앱이 꺼졌다 켜지면 남은 구매를 주워 온다', async () => {
    const fake = makeFakeIap();
    fake.getAvailablePurchases = jest.fn(async () => [GOOD_ROW, { id: 'x', productId: 'x', purchaseToken: '' }]);
    const adapter = loadAdapterWith(fake);
    await expect(adapter.restore()).resolves.toEqual([
      { provider: 'GOOGLE', storeProductId: SKU, transactionToken: 'tok-1' },
    ]);
  });

  it('마무리에는 스토어가 준 **원본 구매 행**을 넘긴다 (iOS 는 id·transactionId 를 요구한다)', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    const pending = adapter.purchase(SKU);
    await Promise.resolve();
    await Promise.resolve();
    fake.__emitPurchase(GOOD_ROW);
    const outcome = await pending;
    if (outcome.kind !== 'SUCCESS') throw new Error('구매가 성공해야 한다');
    await adapter.finishTransaction(outcome.purchase);
    expect(fake.finishTransaction).toHaveBeenCalledWith({ purchase: GOOD_ROW, isConsumable: true });
  });

  it('원본을 모르면 최소 정보로라도 마무리한다', async () => {
    const fake = makeFakeIap();
    const adapter = loadAdapterWith(fake);
    await adapter.finishTransaction({ provider: 'GOOGLE', storeProductId: SKU, transactionToken: 'tok-9' });
    expect(fake.finishTransaction).toHaveBeenCalledWith({
      purchase: { productId: SKU, purchaseToken: 'tok-9' },
      isConsumable: true,
    });
  });
});
