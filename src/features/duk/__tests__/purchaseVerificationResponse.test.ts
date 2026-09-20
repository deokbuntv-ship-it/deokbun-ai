// 구매 검증 **응답 읽기** — 2026-09-18 전수 조사에서 드러난 구멍.
//
// 서버는 까닭을 두 가지 방식으로 보낸다: 보류는 **202 + 본문**(2xx 라 `data` 로 온다), 나머지 거절은
// **2xx 가 아닌 상태 코드**(본문이 `error.context` 안에 있다). 예전 코드는 `data.error` 만 봐서
// ① 보류가 "확인 실패" 로 보였고(`PURCHASE_PENDING` 이 한 번도 나오지 않았다)
// ② 2xx 가 아닌 응답의 본문을 통째로 버렸다.
const from = jest.fn();
const invoke = jest.fn();
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ from, functions: { invoke } }) }));

import { purchaseVerificationCode, requestPurchaseVerification } from '@/features/duk/dukClientContract';

const REQ = { provider: 'GOOGLE' as const, storeProductId: 'duk_first_20', transactionToken: 'tok-1' };

/** functions-js 가 2xx 가 아닌 응답을 돌려주는 모양 — 본문은 `context`(Response) 안에 있다. */
function httpError(status: number, body: unknown) {
  return { data: null, error: { name: 'FunctionsHttpError', context: { status, json: async () => body } } };
}

describe('purchaseVerificationCode — 까닭 → 코드', () => {
  it('보류는 PURCHASE_PENDING 이다 (실패가 아니다)', () => {
    expect(purchaseVerificationCode({ error: 'PURCHASE_VERIFICATION_FAILED', reason: 'PENDING' })).toBe('PURCHASE_PENDING');
  });
  it('서버가 잠시 안 되는 것은 SERVICE_UNAVAILABLE 이다', () => {
    expect(purchaseVerificationCode({ error: 'SERVICE_UNAVAILABLE' })).toBe('SERVICE_UNAVAILABLE');
  });
  it('나머지 거절은 확인 실패로 묶는다', () => {
    for (const reason of ['VERIFY_FAILED', 'ALREADY_CONSUMED', 'PRODUCT_MISMATCH', 'CANCELED', 'NOT_CONFIGURED']) {
      expect(purchaseVerificationCode({ error: 'PURCHASE_VERIFICATION_FAILED', reason })).toBe('PURCHASE_VERIFICATION_FAILED');
    }
  });
  it('본문을 못 읽으면 확인 실패로 둔다 (지급으로 보지 않는다)', () => {
    expect(purchaseVerificationCode(null)).toBe('PURCHASE_VERIFICATION_FAILED');
  });
});

describe('requestPurchaseVerification — 합성 반례', () => {
  beforeEach(() => { invoke.mockReset(); });

  it('성공: 서버가 지급했다', async () => {
    invoke.mockResolvedValue({ data: { ok: true, granted: 20 }, error: null });
    expect(await requestPurchaseVerification(REQ)).toEqual({ ok: true });
  });

  it('보류(202): 본문의 reason 을 읽어 PURCHASE_PENDING 으로 — 예전에는 여기서 뭉개졌다', async () => {
    invoke.mockResolvedValue({ data: { error: 'PURCHASE_VERIFICATION_FAILED', reason: 'PENDING' }, error: null });
    expect(await requestPurchaseVerification(REQ)).toEqual({ ok: false, code: 'PURCHASE_PENDING' });
  });

  it('첫 충전 두 번(409): 2xx 가 아닌 응답의 본문을 읽는다', async () => {
    invoke.mockResolvedValue(httpError(409, { error: 'PURCHASE_VERIFICATION_FAILED', reason: 'ALREADY_CONSUMED' }));
    expect(await requestPurchaseVerification(REQ)).toEqual({ ok: false, code: 'PURCHASE_VERIFICATION_FAILED' });
  });

  it('서버 설정 없음(503): SERVICE_UNAVAILABLE 로 구분된다', async () => {
    invoke.mockResolvedValue(httpError(503, { error: 'SERVICE_UNAVAILABLE' }));
    expect(await requestPurchaseVerification(REQ)).toEqual({ ok: false, code: 'SERVICE_UNAVAILABLE' });
  });

  it('본문이 없는 오류(네트워크)도 지급으로 보지 않는다', async () => {
    invoke.mockResolvedValue({ data: null, error: { name: 'FunctionsFetchError' } });
    expect(await requestPurchaseVerification(REQ)).toEqual({ ok: false, code: 'PURCHASE_VERIFICATION_FAILED' });
  });

  it('호출 자체가 터져도 지급으로 보지 않는다', async () => {
    invoke.mockImplementation(() => { throw new Error('down'); });
    expect(await requestPurchaseVerification(REQ)).toEqual({ ok: false, code: 'SERVICE_UNAVAILABLE' });
  });

  it('보낸 것은 불투명한 제출물뿐이다 — 가격 · 덕 · 권한을 보내지 않는다', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    await requestPurchaseVerification(REQ);
    expect(invoke).toHaveBeenCalledWith('verify-purchase', { body: REQ });
  });
});
