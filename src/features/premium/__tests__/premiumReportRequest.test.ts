// 프리미엄 리포트 — **앱이 서버에 무엇을 보내고 응답을 어떻게 읽는가** (2026-09-21 합성 반례).
//
// 2026-09-18 전수 조사에서 두 가지가 드러났다:
//   ① 앱이 **요청 번호를 빼고** 보내서 서버가 요청 자리를 못 잡고 **항상 503** 을 돌려줬다 —
//      50덕짜리 상품이 한 번도 성공한 적이 없다. staging 검증 하네스는 번호를 붙여 보내 못 잡았다.
//   ② 2xx 가 아닌 응답의 본문을 `context.body` 로 읽었는데 그런 칸이 없다(Response 객체다) →
//      덕 부족(402)·근거 없음(422) 안내가 **뜬 적이 없다**.
const invoke = jest.fn();
const from = jest.fn();
jest.mock('@/services/supabase', () => ({ getSupabaseClient: () => ({ functions: { invoke }, from }) }));
jest.mock('@/features/analysis', () => ({
  logDbError: jest.fn(),
  newRequestId: () => 'req-test-1',
}));

import { premiumReportService } from '@/features/premium/services/premiumReportService';

const NOW = '2026-09-21T00:00:00.000Z';

/** functions-js 가 2xx 가 아닌 응답을 돌려주는 모양 — 본문은 `context`(Response)에 있다. */
function httpError(status: number, body: unknown) {
  return { data: null, error: { name: 'FunctionsHttpError', context: { status, json: async () => body } } };
}

const OK_BODY = {
  kind: 'premium_report',
  result: { headline: '리포트' },
  coveredMonths: [{ year: 2026, month: 10 }],
  policyVersion: 'p1',
  evidenceVersion: 'e1',
};

describe('보내는 것 — 요청 번호가 반드시 들어간다', () => {
  beforeEach(() => { invoke.mockReset(); });

  it('요청 번호를 함께 보낸다 (없으면 서버가 항상 503)', async () => {
    invoke.mockResolvedValue({ data: OK_BODY, error: null });
    await premiumReportService.generate(NOW);
    expect(invoke).toHaveBeenCalledWith('chat', {
      body: { kind: 'premium_report', requestMetadata: { requestId: 'req-test-1' } },
    });
  });
});

describe('응답 읽기 — 합성 반례', () => {
  beforeEach(() => { invoke.mockReset(); });

  it('정상 생성', async () => {
    invoke.mockResolvedValue({ data: OK_BODY, error: null });
    const out = await premiumReportService.generate(NOW);
    expect(out).toMatchObject({ status: 'ok' });
    if (out.status !== 'ok') throw new Error('ok 여야 한다');
    expect(out.payload.coveredMonths).toEqual([{ year: 2026, month: 10 }]);
    expect(out.payload.generatedAt).toBe(NOW);
  });

  it('덕 부족(402): 잔액 · 필요 · 부족을 그대로 화면에 넘긴다', async () => {
    invoke.mockResolvedValue(httpError(402, { error: 'INSUFFICIENT_DUK', balance: 20, required: 50, shortfall: 30 }));
    expect(await premiumReportService.generate(NOW)).toEqual({
      status: 'insufficient_duk', balance: 20, required: 50, shortfall: 30,
    });
  });

  it('근거 없음(422): 서버가 준 안내 문장을 그대로 쓴다', async () => {
    invoke.mockResolvedValue(httpError(422, { error: 'GROUNDING_UNAVAILABLE', message: '태어난 시각을 확인해 주세요.' }));
    expect(await premiumReportService.generate(NOW)).toEqual({
      status: 'grounding_unavailable', message: '태어난 시각을 확인해 주세요.',
    });
  });

  it('이미 만들고 있는 중(409)은 바쁨으로 읽는다 — 다시 누르게 하지 않는다', async () => {
    invoke.mockResolvedValue(httpError(409, { error: 'REQUEST_IN_PROGRESS' }));
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'busy' });
  });

  it('한도(429)도 바쁨이다', async () => {
    invoke.mockResolvedValue(httpError(429, { error: 'RATE_LIMITED' }));
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'busy' });
  });

  it('AI 동의가 없으면(403) 동의 시트로 보낸다 — 로그인 문제가 아니다', async () => {
    invoke.mockResolvedValue(httpError(403, { error: 'AI_CONSENT_REQUIRED' }));
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'consent' });
  });

  it('기본 정보가 없으면(403) 정보 화면으로 보낸다', async () => {
    invoke.mockResolvedValue(httpError(403, { error: 'PROFILE_REQUIRED' }));
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'profile_required' });
  });

  it('까닭을 모르는 401/403 은 로그인으로 보낸다', async () => {
    invoke.mockResolvedValue(httpError(401, {}));
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'auth' });
  });

  it('본문을 못 읽는 오류는 일반 오류로 둔다 (덕이 빠졌다고 말하지 않는다)', async () => {
    invoke.mockResolvedValue({ data: null, error: { name: 'FunctionsFetchError' } });
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'error' });
  });

  it('응답 모양이 다르면 성공으로 그리지 않는다', async () => {
    invoke.mockResolvedValue({ data: { kind: 'premium_report' }, error: null });
    expect(await premiumReportService.generate(NOW)).toEqual({ status: 'error' });
  });
});
